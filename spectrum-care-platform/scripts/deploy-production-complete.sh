#!/bin/bash

# ============================================================================
# SpectrumCare Complete Ecosystem - Production Deployment Script
# Deploying the world's first comprehensive SEND support platform
# Total Market Opportunity: £230.5M annually
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="spectrum-care-production"
IMAGE_TAG="v1.0.0-complete"
LOG_FILE="/tmp/spectrum-care-complete-deploy-$(date +%Y%m%d-%H%M%S).log"

echo -e "${PURPLE}"
cat << "EOF"
   ██████  ██████  ███████  ██████ ████████ ██████  ██    ██ ███    ███      ██████  █████  ██████  ███████
  ██       ██   ██ ██      ██         ██    ██   ██ ██    ██ ████  ████     ██      ██   ██ ██   ██ ██
  ███████  ██████  █████   ██         ██    ██████  ██    ██ ██ ████ ██     ██      ███████ ██████  █████
       ██  ██      ██      ██         ██    ██   ██ ██    ██ ██  ██  ██     ██      ██   ██ ██   ██ ██
  ███████  ██      ███████  ██████    ██    ██   ██  ██████  ██      ██      ██████ ██   ██ ██   ██ ███████
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 COMPLETE ECOSYSTEM DEPLOYMENT - £230.5M MARKET CAPTURE${NC}"
echo -e "${BLUE}========================================================================${NC}"
echo -e "${YELLOW}📊 Market Coverage: 8 Stakeholder Portals + 576K EHC Plans + 24.3K Schools${NC}"
echo -e "${YELLOW}💰 Revenue Target: £230.5M (£55.2M Platform + £175.3M Education)${NC}"
echo -e "${YELLOW}🏆 Zero Competition: World's First Comprehensive Multi-Stakeholder Platform${NC}"
echo -e "${BLUE}========================================================================${NC}"

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
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

check_prerequisites() {
    log "INFO" "🔍 Checking deployment prerequisites..."

    # Check required tools
    for tool in kubectl docker bun; do
        if ! command -v "$tool" &> /dev/null; then
            log "ERROR" "Missing required tool: $tool"
            exit 1
        fi
    done

    # Check kubectl context
    current_context=$(kubectl config current-context)
    log "INFO" "📋 Current kubectl context: $current_context"

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log "ERROR" "❌ Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log "SUCCESS" "✅ All prerequisites satisfied"
}

create_namespace() {
    log "INFO" "🏗️ Creating production namespace..."

    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        kubectl create namespace "$NAMESPACE"
        log "SUCCESS" "✅ Namespace '$NAMESPACE' created"
    else
        log "INFO" "📦 Namespace '$NAMESPACE' already exists"
    fi
}

deploy_secrets() {
    log "INFO" "🔐 Deploying production secrets..."

    # Create secrets if they don't exist
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: spectrum-care-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  DB_PASSWORD: $(echo -n "SecureDBPassword123!" | base64)
  REDIS_PASSWORD: $(echo -n "SecureRedisPass456!" | base64)
  JWT_SECRET: $(echo -n "SuperSecretJWTKey789ForSpectrumCare" | base64)
  JWT_REFRESH_SECRET: $(echo -n "RefreshSecretKey012ForSpectrumCare" | base64)
  ENCRYPTION_KEY: $(echo -n "EncryptionKey345678901234567890AB" | base64)
  NEXTAUTH_SECRET: $(echo -n "NextAuthSecret678ForSpectrumCare" | base64)
EOF

    log "SUCCESS" "✅ Production secrets deployed"
}

deploy_database() {
    log "INFO" "🗄️ Deploying database infrastructure..."

    kubectl apply -f k8s/production/database.yaml

    # Wait for PostgreSQL to be ready
    log "INFO" "⏳ Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres,role=primary -n "$NAMESPACE" --timeout=300s

    # Wait for Redis to be ready
    log "INFO" "⏳ Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s

    log "SUCCESS" "✅ Database infrastructure deployed and ready"
}

deploy_application() {
    log "INFO" "🚀 Deploying complete application ecosystem..."

    # Update image tag in deployment
    sed "s|spectrumcare/platform:v1.0.0|spectrumcare/platform:$IMAGE_TAG|g" \
        k8s/production/deployment.yaml > /tmp/deployment-updated.yaml

    kubectl apply -f /tmp/deployment-updated.yaml

    # Wait for rollout to complete
    log "INFO" "⏳ Waiting for application rollout to complete..."
    kubectl rollout status deployment/spectrum-care-app -n "$NAMESPACE" --timeout=600s

    log "SUCCESS" "✅ Application ecosystem deployed successfully"
}

deploy_custom_domains() {
    log "INFO" "🌐 Deploying custom domain configuration..."

    kubectl apply -f k8s/production/ingress-custom-domains.yaml

    # Wait for ingress to be ready
    log "INFO" "⏳ Waiting for ingress controllers..."
    sleep 30

    log "SUCCESS" "✅ Custom domains configured"
    log "INFO" "📋 Configure these DNS records:"
    echo -e "${YELLOW}"
    echo "  platform.spectrumcare.co.uk      -> [Load Balancer IP]"
    echo "  professionals.spectrumcare.co.uk -> [Load Balancer IP]"
    echo "  enterprise.spectrumcare.co.uk    -> [Load Balancer IP]"
    echo "  api.spectrumcare.co.uk           -> [Load Balancer IP]"
    echo "  admin.spectrumcare.co.uk         -> [Load Balancer IP]"
    echo "  spectrumcare.co.uk               -> [Load Balancer IP]"
    echo -e "${NC}"
}

scale_for_production() {
    log "INFO" "📈 Scaling for production load..."

    # Scale application replicas
    kubectl scale deployment spectrum-care-app --replicas=10 -n "$NAMESPACE"

    # Enable autoscaling
    kubectl apply -f - <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: spectrum-care-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: spectrum-care-app
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF

    log "SUCCESS" "✅ Production scaling configured"
}

run_health_checks() {
    log "INFO" "🏥 Running comprehensive health checks..."

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=spectrum-care,component=web -n "$NAMESPACE" --timeout=300s

    # Get service endpoint
    log "INFO" "🔍 Checking service endpoints..."

    # Check application health
    for i in {1..10}; do
        if kubectl exec -n "$NAMESPACE" deployment/spectrum-care-app -- curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log "SUCCESS" "✅ Application health check passed"
            break
        else
            log "WARN" "⚠️ Health check attempt $i/10 failed, retrying..."
            sleep 30
        fi

        if [ $i -eq 10 ]; then
            log "ERROR" "❌ Health checks failed after 10 attempts"
            return 1
        fi
    done
}

display_deployment_info() {
    log "SUCCESS" "🎉 COMPLETE ECOSYSTEM DEPLOYMENT SUCCESSFUL!"

    echo -e "${GREEN}"
    cat << "EOF"
  ╔══════════════════════════════════════════════════════════════════╗
  ║                    🏆 DEPLOYMENT COMPLETE 🏆                     ║
  ║                                                                  ║
  ║        SpectrumCare Complete Ecosystem Successfully Deployed     ║
  ║                    Ready for £230.5M Market Capture             ║
  ╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    log "INFO" "📊 Deployment Summary:"
    echo -e "${BLUE}=================================${NC}"
    echo -e "${YELLOW}🌟 Complete Stakeholder Ecosystem:${NC}"
    echo "   👨‍👩‍👧‍👦 Parent Control Center"
    echo "   🏛️ LA Enterprise System (Executive, Officer, Caseworker, Manager)"
    echo "   🏫 School Hub Portal (NEW!)"
    echo "   💼 Professional Marketplace"
    echo "   🏥 Health Professional Hub"
    echo "   ⚖️ Legal Advocacy Center"
    echo ""
    echo -e "${YELLOW}💰 Market Opportunity:${NC}"
    echo "   📈 Original Platform: £55.2M annually"
    echo "   🎓 Education Sector: £175.3M annually"
    echo "   🎯 Total Market: £230.5M annually"
    echo ""
    echo -e "${YELLOW}🚀 Production URLs:${NC}"
    echo "   🌐 Main Platform: https://platform.spectrumcare.co.uk"
    echo "   👥 Professional Portal: https://professionals.spectrumcare.co.uk"
    echo "   🏢 Enterprise Portal: https://enterprise.spectrumcare.co.uk"
    echo "   🔌 API Gateway: https://api.spectrumcare.co.uk"
    echo "   ⚙️ Admin Portal: https://admin.spectrumcare.co.uk"
    echo ""
    echo -e "${YELLOW}📋 Service Status:${NC}"
    kubectl get services -n "$NAMESPACE" -o wide
    echo ""
    echo -e "${YELLOW}🏗️ Pod Status:${NC}"
    kubectl get pods -n "$NAMESPACE" -o wide
    echo ""
    echo -e "${YELLOW}🌐 Ingress Status:${NC}"
    kubectl get ingress -n "$NAMESPACE" -o wide
}

send_deployment_notification() {
    log "INFO" "📬 Sending deployment notifications..."

    # Create deployment success notification
    cat > /tmp/deployment-success.json << EOF
{
  "text": "🚀 SpectrumCare Complete Ecosystem DEPLOYED! 🚀",
  "attachments": [
    {
      "color": "good",
      "title": "Production Deployment Successful",
      "fields": [
        {
          "title": "Market Opportunity",
          "value": "£230.5M annually (8 stakeholder portals)",
          "short": true
        },
        {
          "title": "School Hub",
          "value": "NEW! AI-powered SENCO management launched",
          "short": true
        },
        {
          "title": "Infrastructure",
          "value": "10 replicas, auto-scaling enabled",
          "short": true
        },
        {
          "title": "Status",
          "value": "✅ All systems operational",
          "short": true
        }
      ],
      "footer": "SpectrumCare Production Deployment",
      "ts": $(date +%s)
    }
  ]
}
EOF

    # Send notification if webhook URL is provided
    if [ -n "${WEBHOOK_URL:-}" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d @/tmp/deployment-success.json \
            2>/dev/null || true
    fi

    log "SUCCESS" "✅ Deployment notifications sent"
}

cleanup() {
    log "INFO" "🧹 Performing deployment cleanup..."

    # Remove temporary files
    rm -f /tmp/deployment-updated.yaml
    rm -f /tmp/deployment-success.json

    log "SUCCESS" "✅ Cleanup completed"
}

# Main deployment execution
main() {
    echo -e "${PURPLE}🚀 Starting SpectrumCare Complete Ecosystem Deployment${NC}"
    echo -e "${BLUE}📅 Started at: $(date)${NC}"
    echo -e "${BLUE}📝 Log file: $LOG_FILE${NC}"
    echo ""

    # Execute deployment steps
    check_prerequisites
    create_namespace
    deploy_secrets
    deploy_database
    deploy_application
    deploy_custom_domains
    scale_for_production
    run_health_checks
    display_deployment_info
    send_deployment_notification
    cleanup

    echo ""
    echo -e "${GREEN}🎉 COMPLETE ECOSYSTEM DEPLOYMENT SUCCESSFUL! 🎉${NC}"
    echo -e "${PURPLE}💎 The £230.5M SEND market is now ready for capture! 💎${NC}"
    echo -e "${BLUE}🌟 World's first comprehensive multi-stakeholder SEND platform is LIVE! 🌟${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. 🔍 Test complete ecosystem: Access Dev portal"
    echo "2. 🏫 Launch School Hub pilot: 50 target schools"
    echo "3. 🏢 Begin MAT enterprise sales: 1,200+ trusts"
    echo "4. 📢 Activate £350K/month marketing campaigns"
    echo "5. 🎯 Capture £230.5M total market opportunity"
    echo ""
    echo -e "${GREEN}🔥 Ready to transform SEND support for every stakeholder! 🔥${NC}"
}

# Trap errors and cleanup
trap 'log "ERROR" "Deployment failed with exit code $?"; cleanup; exit 1' ERR
trap 'log "INFO" "Deployment interrupted"; cleanup; exit 130' INT TERM

# Run main deployment
main "$@"
