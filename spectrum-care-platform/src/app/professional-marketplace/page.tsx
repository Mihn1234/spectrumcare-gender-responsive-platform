'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Star,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Award,
  Search,
  Filter,
  Heart,
  BookOpen,
  Video,
  Home,
  Plus,
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Brain,
  Activity,
  UserCheck,
  ThumbsUp,
  Eye,
  Calendar as CalendarIcon,
  CreditCard,
  Globe,
  Languages,
  GraduationCap,
  Briefcase,
  Car,
  Wifi,
  Smartphone,
  SlidersHorizontal,
  ArrowUpDown,
  BookmarkPlus,
  Share,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Download,
  Bell,
  Building
} from 'lucide-react';

interface MarketplaceData {
  summary: any;
  featuredProviders: any[];
  recentActivity: any;
  quickActions: any[];
}

interface Provider {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  experience: string;
  location: string;
  distance?: string;
  isVerified: boolean;
  availability: any;
  pricing: any;
  matchScore: number;
  badges: string[];
  languages: string[];
  services: string[];
  aboutSummary: string;
}

export default function ProfessionalMarketplacePage() {
  const router = useRouter();
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    specialization: '',
    location: '',
    rating: '',
    priceRange: '',
    availability: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'search' | 'profile' | 'booking'>('overview');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/professional-marketplace', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load marketplace data');
      }

      const data = await response.json();
      setMarketplaceData(data.data);

      // Also load featured providers for initial display
      setProviders(data.data.featuredProviders || []);

    } catch (error) {
      console.error('Error loading marketplace data:', error);
      setError('Failed to load professional marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const searchProviders = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const searchParams = new URLSearchParams({
        type: 'search',
        ...activeFilters
      });

      if (searchQuery) {
        searchParams.append('searchQuery', searchQuery);
      }

      const response = await fetch(`/api/professional-marketplace?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setProviders(data.data.providers || []);
      setViewMode('search');

    } catch (error) {
      console.error('Error searching providers:', error);
      setError('Failed to search providers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviderDetails = async (providerId: string) => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`/api/professional-marketplace?type=provider&providerId=${providerId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load provider details');
      }

      const data = await response.json();
      setSelectedProvider(data.data);
      setViewMode('profile');

    } catch (error) {
      console.error('Error loading provider details:', error);
      setError('Failed to load provider details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (providerId: string, serviceId: string) => {
    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/professional-marketplace', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'book_appointment',
          providerId,
          serviceType: serviceId,
          appointmentDate: new Date().toISOString(),
          duration: 60,
          location: 'clinic',
          childId: 'demo-child-id'
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      alert('Appointment booked successfully!');

    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatPrice = (price: number) => `£${price}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading professional marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Professional Marketplace</h1>
                  <p className="text-sm text-gray-500">AI-powered provider matching & booking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setViewMode('search')}>
                <Search className="h-4 w-4 mr-2" />
                Find Providers
              </Button>
              <Button variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Saved Providers
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                My Bookings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Mode */}
        {viewMode === 'overview' && marketplaceData && (
          <>
            {/* Marketplace Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Providers</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {marketplaceData.summary.totalProviders.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {marketplaceData.summary.verifiedProviders} verified
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-3xl font-bold text-green-600">
                        {marketplaceData.summary.averageRating}
                      </p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_: any, i: number) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(marketplaceData.summary.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {marketplaceData.summary.totalReviews.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Verified reviews</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Specializations</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {marketplaceData.summary.specializations.length}
                      </p>
                      <p className="text-sm text-gray-500">Areas of expertise</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Find the right professional support quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketplaceData.quickActions.map((action: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                      onClick={() => setViewMode('search')}
                    >
                      <div className="h-6 w-6 text-blue-600">
                        {action.icon === 'UserCheck' && <UserCheck className="h-6 w-6" />}
                        {action.icon === 'Calendar' && <Calendar className="h-6 w-6" />}
                        {action.icon === 'BarChart' && <BarChart3 className="h-6 w-6" />}
                        {action.icon === 'Star' && <Star className="h-6 w-6" />}
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium">{action.title}</span>
                        <p className="text-xs text-gray-600">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Providers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Featured Providers
                  <Button variant="outline" onClick={() => setViewMode('search')}>
                    View All Providers
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardTitle>
                <CardDescription>Top-rated professionals in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {providers.slice(0, 3).map((provider: any, index: number) => (
                    <Card key={provider.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold">{provider.name}</h3>
                              <p className="text-sm text-gray-600">{provider.title}</p>
                            </div>
                          </div>
                          {provider.isVerified && (
                            <Shield className="h-5 w-5 text-green-600" />
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{provider.rating}</span>
                              <span className="text-sm text-gray-600">({provider.reviewCount} reviews)</span>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {provider.experience}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{provider.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {provider.badges.slice(0, 2).map((badge: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2">{provider.aboutSummary}</p>

                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => loadProviderDetails(provider.id)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBooking(provider.id, 'consultation')}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Book
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Search Mode */}
        {viewMode === 'search' && (
          <>
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search for speech therapists, occupational therapists, specialists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button onClick={searchProviders}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                    <Select value={activeFilters.specialization} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, specialization: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speech-therapy">Speech Therapy</SelectItem>
                        <SelectItem value="occupational-therapy">Occupational Therapy</SelectItem>
                        <SelectItem value="behavior-analysis">Behavior Analysis</SelectItem>
                        <SelectItem value="psychology">Educational Psychology</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={activeFilters.location} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central-london">Central London</SelectItem>
                        <SelectItem value="north-london">North London</SelectItem>
                        <SelectItem value="south-london">South London</SelectItem>
                        <SelectItem value="east-london">East London</SelectItem>
                        <SelectItem value="west-london">West London</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={activeFilters.rating} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, rating: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.0">4.0+ Stars</SelectItem>
                        <SelectItem value="3.5">3.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={activeFilters.priceRange} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, priceRange: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50-80">£50-80/hour</SelectItem>
                        <SelectItem value="80-120">£80-120/hour</SelectItem>
                        <SelectItem value="120-160">£120-160/hour</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={activeFilters.availability} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, availability: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="next-week">Next Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="space-y-4">
              {providers.map((provider: any, index: number) => (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-bold">{provider.name}</h3>
                            {provider.isVerified && <Shield className="h-5 w-5 text-green-600" />}
                            {provider.matchScore && (
                              <Badge className="bg-purple-100 text-purple-800">
                                {provider.matchScore}% match
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 mb-2">{provider.title}</p>

                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{provider.rating}</span>
                              <span className="text-sm text-gray-600">({provider.reviewCount})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{provider.location}</span>
                              {provider.distance && <span className="text-sm text-gray-500">• {provider.distance}</span>}
                            </div>
                            <Badge>{provider.experience}</Badge>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {provider.specializations.slice(0, 3).map((spec: any, i: number) => (
                              <Badge key={i} variant="outline">{spec}</Badge>
                            ))}
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{provider.aboutSummary}</p>

                          <div className="flex flex-wrap gap-1">
                            {provider.badges.map((badge: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        {provider.pricing && (
                          <div>
                            <p className="font-medium">{formatPrice(provider.pricing.sessionFee)}/hour</p>
                            <p className="text-sm text-gray-600">Assessment: {formatPrice(provider.pricing.consultationFee)}</p>
                          </div>
                        )}

                        {provider.availability && (
                          <div className="text-sm">
                            <p className="text-green-600 font-medium">
                              {provider.availability.slotsThisWeek} slots this week
                            </p>
                            <p className="text-gray-600">
                              Next: {new Date(provider.availability.nextSlot).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            onClick={() => loadProviderDetails(provider.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBooking(provider.id, 'consultation')}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Now
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Heart className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Provider Profile Mode */}
        {viewMode === 'profile' && selectedProvider && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setViewMode('search')}
              className="text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>

            {/* Provider Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-blue-600" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold">{selectedProvider.personalInfo.name}</h1>
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>

                      <p className="text-xl text-gray-600 mb-3">{selectedProvider.personalInfo.title}</p>

                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="text-lg font-medium">{selectedProvider.ratings.overall}</span>
                          <span className="text-gray-600">({selectedProvider.ratings.totalReviews} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-5 w-5 text-purple-600" />
                          <span>{selectedProvider.personalInfo.yearsExperience} years experience</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span>{selectedProvider.location.primaryClinic.address.split(',')[0]}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedProvider.specializations.slice(0, 3).map((spec: any, i: number) => (
                          <Badge key={i} className="bg-blue-100 text-blue-800">
                            {spec.area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-3">
                    <Button size="lg" onClick={() => setViewMode('booking')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                    <div className="space-y-1">
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Heart className="h-4 w-4 mr-2" />
                        Save Provider
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Details Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed mb-6">
                          {selectedProvider.philosophy}
                        </p>

                        <h4 className="font-medium mb-3">Key Achievements</h4>
                        <ul className="space-y-2">
                          {selectedProvider.achievements.map((achievement: any, i: number) => (
                            <li key={i} className="flex items-start space-x-2">
                              <Award className="h-4 w-4 text-yellow-600 mt-1" />
                              <span className="text-sm">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Overall Rating</span>
                          <span className="font-medium">{selectedProvider.ratings.overall}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Reviews</span>
                          <span className="font-medium">{selectedProvider.ratings.totalReviews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommendation Rate</span>
                          <span className="font-medium text-green-600">{selectedProvider.ratings.recommendationRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Rate</span>
                          <span className="font-medium">95%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedProvider.personalInfo.languages.map((lang: any, i: number) => (
                            <Badge key={i} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProvider.services.map((service: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{service.service}</h3>
                            <p className="text-sm text-gray-600">{service.duration} minutes</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{service.description}</p>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Includes:</h4>
                          <ul className="text-sm space-y-1">
                            {service.includes.map((item: any, i: number) => (
                              <li key={i} className="flex items-start space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-600 mt-1" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          className="w-full mt-4"
                          onClick={() => handleBooking(selectedProvider.id, service.service)}
                        >
                          Book {service.service}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="qualifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProvider.qualifications.education.map((edu: any, i: number) => (
                          <div key={i} className="flex items-start space-x-3">
                            <GraduationCap className="h-5 w-5 text-blue-600 mt-1" />
                            <span className="text-sm">{edu}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProvider.qualifications.certifications.map((cert: any, i: number) => (
                          <div key={i} className="flex items-start space-x-3">
                            <Award className="h-5 w-5 text-yellow-600 mt-1" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Specialization Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedProvider.specializations.map((spec: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-bold">{spec.area}</h3>
                          <p className="text-sm text-gray-600 mb-2">{spec.experience} experience</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Certifications:</h4>
                              <div className="flex flex-wrap gap-1">
                                {spec.certifications.map((cert: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">Approaches:</h4>
                              <div className="flex flex-wrap gap-1">
                                {spec.approaches.map((approach: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700">{approach}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Times</CardTitle>
                    <CardDescription>Book your appointment at a convenient time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-4">Weekly Schedule</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedProvider.availability.schedule).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize font-medium">{day}</span>
                              <span className="text-sm text-gray-600">
                                {Array.isArray(hours) ? hours.join(', ') : hours}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Booking Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">Next available: {new Date(selectedProvider.availability.nextAvailable).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Booking window: {selectedProvider.availability.bookingWindow}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">Video consultations available</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">Home visits within 15 miles</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6"
                      size="lg"
                      onClick={() => setViewMode('booking')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Available Slots & Book
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews & Ratings</CardTitle>
                    <CardDescription>{selectedProvider.ratings.totalReviews} verified reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h4 className="font-medium mb-4">Rating Breakdown</h4>
                        <div className="space-y-3">
                          {Object.entries(selectedProvider.ratings.categoryRatings).map(([category, rating]: [string, any]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="capitalize text-sm">{category.replace(/([A-Z])/g, ' $1')}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={rating * 20} className="w-20" />
                                <span className="text-sm font-medium">{rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Quick Stats</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Recommendation Rate</span>
                            <span className="text-sm font-medium text-green-600">{selectedProvider.ratings.recommendationRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Response Rate</span>
                            <span className="text-sm font-medium">95%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Recent Trend</span>
                            <span className="text-sm font-medium text-green-600">{selectedProvider.ratings.recentTrend}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-medium">Recent Reviews</h4>
                      {/* Sample reviews would be displayed here */}
                      <div className="space-y-4">
                        {[1, 2, 3].map((i: number) => (
                          <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">S</span>
                                </div>
                                <span className="font-medium">Sarah M.</span>
                                <Badge variant="outline">Verified</Badge>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_: any, j: number) => (
                                  <Star key={j} className="h-3 w-3 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              Excellent service with great attention to detail. Highly professional and caring approach.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">2 weeks ago • Speech Therapy</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Location & Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-4">Primary Clinic</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">{selectedProvider.location.primaryClinic.name}</p>
                            <p className="text-sm text-gray-600">{selectedProvider.location.primaryClinic.address}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-2">Transport</h5>
                            <div className="space-y-1">
                              {selectedProvider.location.primaryClinic.transport.map((transport: any, i: number) => (
                                <p key={i} className="text-sm text-gray-600 flex items-center space-x-2">
                                  <Car className="h-3 w-3" />
                                  <span>{transport}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              {selectedProvider.location.primaryClinic.accessibility}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Service Areas</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Catchment Areas</h5>
                            <div className="flex flex-wrap gap-1">
                              {selectedProvider.location.catchmentArea.map((area: any, i: number) => (
                                <Badge key={i} variant="outline">{area}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-2">Home Visits</h5>
                            <p className="text-sm text-gray-600">
                              Available within {selectedProvider.location.homeVisitRadius}
                            </p>
                            <p className="text-sm text-gray-600">
                              Travel fee: {selectedProvider.location.travelFee}
                            </p>
                          </div>

                          <div>
                            <h5 className="font-medium text-sm mb-2">Consultation Options</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">In-person appointments</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Video className="h-4 w-4 text-purple-600" />
                                <span className="text-sm">Video consultations</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">Home visits</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
