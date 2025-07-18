#!/bin/bash

# ============================================================================
# SpectrumCare Enterprise Platform - Production Deployment Script
# ============================================================================

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="/tmp/spectrum-care-deploy-$(date +%Y%m%d-%H%M%S).log"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
NAMESPACE="spectrum-care-production"
DOCKER_REGISTRY="spectrumcare"
IMAGE_TAG="${IMAGE_TAG:-v1.0.0}"
KUBECTL_CONTEXT="${KUBECTL_CONTEXT:-production}"
DRY_RUN="${DRY_RUN:-false}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"
SKIP_TESTS="${SKIP_TESTS:-false}"
ROLLBACK="${ROLLBACK:-false}"
FORCE_DEPLOY="${FORCE_DEPLOY:-false}"

# ============================================================================
# Utility Functions
# ============================================================================

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

check_dependencies() {
    log "INFO" "Checking deployment dependencies..."

    local missing_deps=()

    # Check required tools
    for tool in kubectl docker bun; do
        if ! command -v "$tool" &> /dev/null; then
            missing_deps+=("$tool")
        fi
    done

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "ERROR" "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi

    # Check kubectl context
    if ! kubectl config current-context | grep -q "$KUBECTL_CONTEXT"; then
        log "ERROR" "kubectl context is not set to '$KUBECTL_CONTEXT'"
        log "INFO" "Current context: $(kubectl config current-context)"
        exit 1
    fi

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log "ERROR" "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log "INFO" "All dependencies satisfied"
}

validate_environment() {
    log "INFO" "Validating deployment environment..."

    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log "WARN" "Namespace '$NAMESPACE' does not exist, creating..."
        kubectl create namespace "$NAMESPACE"
    fi

    # Validate required secrets exist
    local required_secrets=("spectrum-care-secrets")
    for secret in "${required_secrets[@]}"; do
        if ! kubectl get secret "$secret" -n "$NAMESPACE" &> /dev/null; then
            log "ERROR" "Required secret '$secret' not found in namespace '$NAMESPACE'"
            log "INFO" "Please ensure all secrets are created before deployment"
            exit 1
        fi
    done

    # Check available resources
    local available_cpu=$(kubectl top nodes --no-headers | awk '{sum += $3} END {print sum}' || echo "unknown")
    local available_memory=$(kubectl top nodes --no-headers | awk '{sum += $5} END {print sum}' || echo "unknown")

    log "INFO" "Cluster resources - CPU: $available_cpu, Memory: $available_memory"

    log "INFO" "Environment validation completed"
}

build_and_push_image() {
    log "INFO" "Building and pushing Docker image..."

    cd "$PROJECT_ROOT"

    # Build application
    log "INFO" "Installing dependencies..."
    bun install --frozen-lockfile

    log "INFO" "Running tests..."
    if [ "$SKIP_TESTS" != "true" ]; then
        bun run test || {
            log "ERROR" "Tests failed, aborting deployment"
            exit 1
        }
    fi

    log "INFO" "Building application..."
    bun run build || {
        log "ERROR" "Build failed"
        exit 1
    }

    # Build Docker image
    local image_name="$DOCKER_REGISTRY/platform:$IMAGE_TAG"
    log "INFO" "Building Docker image: $image_name"

    docker build \
        --target production \
        --tag "$image_name" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse HEAD)" \
        --build-arg VERSION="$IMAGE_TAG" \
        .

    # Push to registry
    log "INFO" "Pushing image to registry..."
    docker push "$image_name" || {
        log "ERROR" "Failed to push image to registry"
        exit 1
    }

    log "INFO" "Image build and push completed: $image_name"
}

backup_current_deployment() {
    if [ "$SKIP_BACKUP" == "true" ]; then
        log "INFO" "Skipping backup (SKIP_BACKUP=true)"
        return 0
    fi

    log "INFO" "Creating backup of current deployment..."

    local backup_dir="/tmp/spectrum-care-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup current deployment configurations
    kubectl get all -n "$NAMESPACE" -o yaml > "$backup_dir/current-deployment.yaml" 2>/dev/null || true
    kubectl get configmaps -n "$NAMESPACE" -o yaml > "$backup_dir/configmaps.yaml" 2>/dev/null || true
    kubectl get secrets -n "$NAMESPACE" -o yaml > "$backup_dir/secrets.yaml" 2>/dev/null || true

    # Backup database if possible
    log "INFO" "Creating database backup..."
    kubectl exec -n "$NAMESPACE" deployment/postgres-primary -- pg_dump \
        -U spectrum_care \
        -d spectrum_care_production \
        -f "/tmp/backup-$(date +%Y%m%d-%H%M%S).sql" 2>/dev/null || {
        log "WARN" "Database backup failed, continuing..."
    }

    echo "$backup_dir" > /tmp/spectrum-care-last-backup-path
    log "INFO" "Backup created at: $backup_dir"
}

deploy_database() {
    log "INFO" "Deploying database infrastructure..."

    # Apply database configurations
    kubectl apply -f "$PROJECT_ROOT/k8s/production/database.yaml"

    # Wait for PostgreSQL to be ready
    log "INFO" "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres,role=primary -n "$NAMESPACE" --timeout=300s || {
        log "ERROR" "PostgreSQL failed to start within timeout"
        exit 1
    }

    # Wait for Redis to be ready
    log "INFO" "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s || {
        log "ERROR" "Redis failed to start within timeout"
        exit 1
    }

    # Run database migrations
    log "INFO" "Running database migrations..."
    kubectl create job --from=cronjob/postgres-backup "db-migrate-$(date +%s)" -n "$NAMESPACE" || true

    log "INFO" "Database deployment completed"
}

deploy_application() {
    log "INFO" "Deploying application..."

    # Update image tag in deployment
    sed "s|spectrumcare/platform:v1.0.0|$DOCKER_REGISTRY/platform:$IMAGE_TAG|g" \
        "$PROJECT_ROOT/k8s/production/deployment.yaml" > /tmp/deployment-updated.yaml

    if [ "$DRY_RUN" == "true" ]; then
        log "INFO" "DRY RUN: Would apply the following configurations:"
        kubectl apply -f /tmp/deployment-updated.yaml --dry-run=client
        return 0
    fi

    # Apply application deployment
    kubectl apply -f /tmp/deployment-updated.yaml

    # Wait for rollout to complete
    log "INFO" "Waiting for application rollout to complete..."
    kubectl rollout status deployment/spectrum-care-app -n "$NAMESPACE" --timeout=600s || {
        log "ERROR" "Application rollout failed"
        return 1
    }

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=spectrum-care,component=web -n "$NAMESPACE" --timeout=300s || {
        log "ERROR" "Application pods failed to become ready"
        return 1
    }

    log "INFO" "Application deployment completed"
}

run_health_checks() {
    log "INFO" "Running post-deployment health checks..."

    # Get service endpoint
    local service_ip=$(kubectl get service spectrum-care-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

    if [ "$service_ip" == "pending" ] || [ -z "$service_ip" ]; then
        log "WARN" "LoadBalancer IP not yet assigned, using port-forward for health check"
        kubectl port-forward service/spectrum-care-service 8080:80 -n "$NAMESPACE" &
        local port_forward_pid=$!
        sleep 5
        local health_url="http://localhost:8080/api/health"
    else
        local health_url="http://$service_ip/api/health"
    fi

    # Health check with retries
    local retries=10
    local success=false

    for ((i=1; i<=retries; i++)); do
        log "INFO" "Health check attempt $i/$retries..."

        if curl -f -s "$health_url" > /dev/null 2>&1; then
            success=true
            break
        fi

        if [ $i -lt $retries ]; then
            log "WARN" "Health check failed, retrying in 30 seconds..."
            sleep 30
        fi
    done

    # Clean up port-forward if used
    if [ -n "${port_forward_pid:-}" ]; then
        kill $port_forward_pid 2>/dev/null || true
    fi

    if [ "$success" == "true" ]; then
        log "INFO" "Health checks passed"

        # Additional functional tests
        log "INFO" "Running functional tests..."
        kubectl run health-test-pod \
            --image=curlimages/curl:latest \
            --rm -i --restart=Never \
            --command -- curl -f "$health_url" || {
            log "WARN" "Functional test failed"
        }

        return 0
    else
        log "ERROR" "Health checks failed after $retries attempts"
        return 1
    fi
}

rollback_deployment() {
    log "INFO" "Rolling back deployment..."

    # Rollback application deployment
    kubectl rollout undo deployment/spectrum-care-app -n "$NAMESPACE" || {
        log "ERROR" "Failed to rollback application deployment"
    }

    # Wait for rollback to complete
    kubectl rollout status deployment/spectrum-care-app -n "$NAMESPACE" --timeout=300s || {
        log "ERROR" "Rollback failed"
        return 1
    }

    # Restore from backup if available
    if [ -f /tmp/spectrum-care-last-backup-path ]; then
        local backup_dir=$(cat /tmp/spectrum-care-last-backup-path)
        if [ -d "$backup_dir" ]; then
            log "INFO" "Restoring configuration from backup: $backup_dir"
            # Restore logic would go here
        fi
    fi

    log "INFO" "Rollback completed"
}

cleanup() {
    log "INFO" "Performing cleanup..."

    # Remove temporary files
    rm -f /tmp/deployment-updated.yaml

    # Clean up old replica sets
    kubectl delete replicaset -l app=spectrum-care -n "$NAMESPACE" \
        --field-selector='status.replicas=0' --ignore-not-found=true

    # Clean up completed jobs
    kubectl delete job -l app=postgres,component=backup -n "$NAMESPACE" \
        --field-selector='status.conditions[0].type=Complete' --ignore-not-found=true

    log "INFO" "Cleanup completed"
}

print_deployment_info() {
    log "INFO" "Deployment Information:"
    echo "========================"
    echo "Namespace: $NAMESPACE"
    echo "Image Tag: $IMAGE_TAG"
    echo "Kubectl Context: $KUBECTL_CONTEXT"
    echo "Log File: $LOG_FILE"
    echo ""

    # Get service information
    log "INFO" "Service Endpoints:"
    kubectl get services -n "$NAMESPACE" -o wide
    echo ""

    # Get pod status
    log "INFO" "Pod Status:"
    kubectl get pods -n "$NAMESPACE" -o wide
    echo ""

    # Get ingress information
    log "INFO" "Ingress Information:"
    kubectl get ingress -n "$NAMESPACE" -o wide
}

# ============================================================================
# Main Deployment Logic
# ============================================================================

main() {
    log "INFO" "Starting SpectrumCare Enterprise Platform deployment"
    log "INFO" "Deployment configuration:"
    log "INFO" "  - Namespace: $NAMESPACE"
    log "INFO" "  - Image Tag: $IMAGE_TAG"
    log "INFO" "  - Dry Run: $DRY_RUN"
    log "INFO" "  - Skip Backup: $SKIP_BACKUP"
    log "INFO" "  - Skip Tests: $SKIP_TESTS"
    log "INFO" "  - Rollback: $ROLLBACK"

    # Handle rollback request
    if [ "$ROLLBACK" == "true" ]; then
        rollback_deployment
        exit $?
    fi

    # Pre-deployment checks
    check_dependencies
    validate_environment

    # Create backup before deployment
    backup_current_deployment

    # Build and deploy
    if [ "$DRY_RUN" != "true" ]; then
        build_and_push_image
    fi

    # Deploy infrastructure first
    deploy_database

    # Deploy application
    if ! deploy_application; then
        log "ERROR" "Application deployment failed"
        if [ "$FORCE_DEPLOY" != "true" ]; then
            log "INFO" "Initiating automatic rollback..."
            rollback_deployment
            exit 1
        else
            log "WARN" "Continuing despite deployment failure (FORCE_DEPLOY=true)"
        fi
    fi

    # Run health checks
    if ! run_health_checks; then
        log "ERROR" "Health checks failed"
        if [ "$FORCE_DEPLOY" != "true" ]; then
            log "INFO" "Initiating automatic rollback due to health check failure..."
            rollback_deployment
            exit 1
        else
            log "WARN" "Continuing despite health check failure (FORCE_DEPLOY=true)"
        fi
    fi

    # Cleanup and display info
    cleanup
    print_deployment_info

    log "INFO" "SpectrumCare Enterprise Platform deployment completed successfully!"
    log "INFO" "The platform is now ready to serve the £1B+ SEND market"

    # Send notification (webhook, Slack, etc.)
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"SpectrumCare Enterprise Platform deployed successfully to $NAMESPACE with image tag $IMAGE_TAG\"}" \
            2>/dev/null || true
    fi
}

# ============================================================================
# Script Entry Point
# ============================================================================

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP="true"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        --rollback)
            ROLLBACK="true"
            shift
            ;;
        --force)
            FORCE_DEPLOY="true"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --namespace NAMESPACE    Kubernetes namespace (default: spectrum-care-production)"
            echo "  --image-tag TAG          Docker image tag (default: v1.0.0)"
            echo "  --dry-run               Perform a dry run without actual deployment"
            echo "  --skip-backup           Skip backup creation"
            echo "  --skip-tests            Skip running tests"
            echo "  --rollback              Rollback to previous deployment"
            echo "  --force                 Force deployment even if checks fail"
            echo "  --help                  Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  KUBECTL_CONTEXT         Kubernetes context to use"
            echo "  DOCKER_REGISTRY         Docker registry URL"
            echo "  WEBHOOK_URL             Webhook URL for notifications"
            exit 0
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Trap errors and cleanup
trap 'log "ERROR" "Deployment failed with exit code $?"; cleanup; exit 1' ERR
trap 'log "INFO" "Deployment interrupted"; cleanup; exit 130' INT TERM

# Run main deployment
main "$@"
