'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Users,
  Award,
  Phone,
  Video,
  Home,
  GraduationCap,
  Heart,
  Brain,
  Activity,
  Volume2,
  MessageCircle,
  Zap,
  Eye,
  Palette,
  Smile,
  Filter,
  SlidersHorizontal,
  Calendar,
  Pounds,
  CheckCircle2,
  ArrowRight,
  ThumbsUp,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';

interface SpecialistCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: any;
  color: string;
  count: number;
}

interface Specialist {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  category: string;
  categoryColor: string;
  specializations: string[];
  yearsExperience: number;
  qualifications: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  completedSessions: number;
  hourlyRate: number;
  assessmentRate: number;
  location: {
    city: string;
    postcode: string;
    distance?: number;
  };
  availability: {
    nextAvailable: string;
    responseTime: number;
    cancellationRate: number;
  };
  services: {
    inPerson: boolean;
    online: boolean;
    homeVisit: boolean;
    groupSessions: boolean;
  };
  ageGroups: string[];
  conditions: string[];
  languages: string[];
  verified: boolean;
}

const SPECIALIST_CATEGORIES: SpecialistCategory[] = [
  {
    id: '1',
    name: 'Occupational Therapy',
    code: 'OT',
    description: 'Sensory integration, fine motor skills, daily living skills',
    icon: Activity,
    color: '#3B82F6',
    count: 247
  },
  {
    id: '2',
    name: 'Educational Psychology',
    code: 'EP',
    description: 'Learning assessments, cognitive evaluation, educational planning',
    icon: Brain,
    color: '#8B5CF6',
    count: 156
  },
  {
    id: '3',
    name: 'Auditory Integration Training',
    code: 'AIT',
    description: 'Sound sensitivity therapy, auditory processing',
    icon: Volume2,
    color: '#10B981',
    count: 89
  },
  {
    id: '4',
    name: 'Applied Behavior Analysis',
    code: 'ABA',
    description: 'Behavioral interventions, social skills training',
    icon: Users,
    color: '#F59E0B',
    count: 312
  },
  {
    id: '5',
    name: 'Speech & Language Therapy',
    code: 'SALT',
    description: 'Communication skills, language development',
    icon: MessageCircle,
    color: '#EF4444',
    count: 189
  },
  {
    id: '6',
    name: 'Physiotherapy',
    code: 'PHYSIO',
    description: 'Physical development, motor skills, coordination',
    icon: Zap,
    color: '#06B6D4',
    count: 134
  },
  {
    id: '7',
    name: 'Art & Music Therapy',
    code: 'CREATIVE',
    description: 'Creative expression therapy, emotional regulation',
    icon: Palette,
    color: '#EC4899',
    count: 67
  },
  {
    id: '8',
    name: 'Nutritional Therapy',
    code: 'NUTRITION',
    description: 'Dietary interventions, supplement guidance',
    icon: Heart,
    color: '#84CC16',
    count: 78
  }
];

const SAMPLE_SPECIALISTS: Specialist[] = [
  {
    id: '1',
    title: 'Dr',
    firstName: 'Emma',
    lastName: 'Thompson',
    profileImage: '/images/specialists/emma-thompson.jpg',
    category: 'Occupational Therapy',
    categoryColor: '#3B82F6',
    specializations: ['Sensory Integration', 'Autism Spectrum Disorders', 'Fine Motor Skills'],
    yearsExperience: 12,
    qualifications: ['MSc Occupational Therapy', 'Sensory Integration Certified', 'ADOS-2 Trained'],
    bio: 'Specialist in sensory integration therapy with extensive experience working with autistic children and young people.',
    rating: 4.9,
    reviewCount: 127,
    completedSessions: 1240,
    hourlyRate: 85,
    assessmentRate: 250,
    location: { city: 'Birmingham', postcode: 'B15 2TT', distance: 2.3 },
    availability: { nextAvailable: '2025-01-22', responseTime: 2, cancellationRate: 3 },
    services: { inPerson: true, online: true, homeVisit: true, groupSessions: false },
    ageGroups: ['Early Years (2-5)', 'Primary (6-11)', 'Secondary (12-18)'],
    conditions: ['Autism', 'ADHD', 'Sensory Processing', 'Dyspraxia'],
    languages: ['English', 'Spanish'],
    verified: true
  },
  {
    id: '2',
    title: 'Ms',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    profileImage: '/images/specialists/sarah-mitchell.jpg',
    category: 'Applied Behavior Analysis',
    categoryColor: '#F59E0B',
    specializations: ['ABA Therapy', 'Social Skills Training', 'Behavioral Interventions'],
    yearsExperience: 8,
    qualifications: ['BCBA', 'MSc Psychology', 'Social Stories Certified'],
    bio: 'Board Certified Behavior Analyst specializing in positive behavioral support and social skills development.',
    rating: 4.8,
    reviewCount: 89,
    completedSessions: 950,
    hourlyRate: 75,
    assessmentRate: 200,
    location: { city: 'Manchester', postcode: 'M1 4ET', distance: 15.7 },
    availability: { nextAvailable: '2025-01-25', responseTime: 4, cancellationRate: 5 },
    services: { inPerson: true, online: true, homeVisit: false, groupSessions: true },
    ageGroups: ['Primary (6-11)', 'Secondary (12-18)'],
    conditions: ['Autism', 'ADHD', 'Challenging Behavior'],
    languages: ['English'],
    verified: true
  },
  {
    id: '3',
    title: 'Dr',
    firstName: 'James',
    lastName: 'Wilson',
    profileImage: '/images/specialists/james-wilson.jpg',
    category: 'Educational Psychology',
    categoryColor: '#8B5CF6',
    specializations: ['Cognitive Assessment', 'Learning Difficulties', 'Educational Planning'],
    yearsExperience: 15,
    qualifications: ['PhD Educational Psychology', 'HCPC Registered', 'WISC-V Certified'],
    bio: 'Educational psychologist with expertise in cognitive assessments and supporting children with learning differences.',
    rating: 4.7,
    reviewCount: 156,
    completedSessions: 680,
    hourlyRate: 95,
    assessmentRate: 350,
    location: { city: 'London', postcode: 'SW1A 1AA', distance: 25.4 },
    availability: { nextAvailable: '2025-02-01', responseTime: 6, cancellationRate: 2 },
    services: { inPerson: true, online: true, homeVisit: false, groupSessions: false },
    ageGroups: ['Primary (6-11)', 'Secondary (12-18)', 'Young Adults (18+)'],
    conditions: ['Learning Difficulties', 'Autism', 'ADHD', 'Dyslexia'],
    languages: ['English', 'French'],
    verified: true
  }
];

export default function SpecialistMarketplacePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number[]>([25]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [specialists, setSpecialists] = useState<Specialist[]>(SAMPLE_SPECIALISTS);
  const [loading, setLoading] = useState<boolean>(false);

  const filteredSpecialists = specialists.filter(specialist => {
    // Category filter
    if (selectedCategory && specialist.category !== selectedCategory) return false;

    // Search term filter
    if (searchTerm && !specialist.firstName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !specialist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !specialist.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Price range filter
    if (specialist.hourlyRate < priceRange[0] || specialist.hourlyRate > priceRange[1]) return false;

    // Rating filter
    if (specialist.rating < minRating) return false;

    // Delivery methods filter
    if (deliveryMethods.length > 0) {
      const hasMatchingMethod =
        (deliveryMethods.includes('online') && specialist.services.online) ||
        (deliveryMethods.includes('in_person') && specialist.services.inPerson) ||
        (deliveryMethods.includes('home_visit') && specialist.services.homeVisit) ||
        (deliveryMethods.includes('group') && specialist.services.groupSessions);

      if (!hasMatchingMethod) return false;
    }

    return true;
  });

  const sortedSpecialists = [...filteredSpecialists].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.hourlyRate - b.hourlyRate;
      case 'price_high':
        return b.hourlyRate - a.hourlyRate;
      case 'distance':
        return (a.location.distance || 0) - (b.location.distance || 0);
      case 'experience':
        return b.yearsExperience - a.yearsExperience;
      default:
        return 0;
    }
  });

  const toggleDeliveryMethod = (method: string) => {
    setDeliveryMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const toggleAgeGroup = (group: string) => {
    setAgeGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleBookSpecialist = (specialistId: string) => {
    // Navigate to booking page with specialist
    console.log('Booking specialist:', specialistId);
    // In real app: router.push(`/book-specialist/${specialistId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌟 Specialist Marketplace
          </h1>
          <p className="text-lg text-gray-600">
            Find qualified SEND specialists for occupational therapy, ABA, educational psychology, and more
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browse by Specialty</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {SPECIALIST_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCategory === category.name
                      ? 'ring-2 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ borderColor: selectedCategory === category.name ? category.color : undefined }}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <Icon className="h-6 w-6" style={{ color: category.color }} />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.code}</h3>
                    <p className="text-xs text-gray-600">{category.count} specialists</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search specialists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Your postcode or city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Best Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium">Price Range (per hour)</Label>
                    <div className="mt-2 px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={200}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>£{priceRange[0]}</span>
                        <span>£{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <Label className="text-sm font-medium">Max Distance (miles)</Label>
                    <div className="mt-2 px-2">
                      <Slider
                        value={maxDistance}
                        onValueChange={setMaxDistance}
                        max={50}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-center text-xs text-gray-500 mt-1">
                        {maxDistance[0]} miles
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label className="text-sm font-medium">Minimum Rating</Label>
                    <div className="mt-2">
                      <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Delivery Methods */}
                <div>
                  <Label className="text-sm font-medium">Service Delivery</Label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {[
                      { id: 'online', label: 'Online Sessions', icon: Video },
                      { id: 'in_person', label: 'In-Person', icon: Users },
                      { id: 'home_visit', label: 'Home Visits', icon: Home },
                      { id: 'group', label: 'Group Sessions', icon: Users }
                    ].map(({ id, label, icon: Icon }) => (
                      <div key={id} className="flex items-center space-x-2">
                        <Checkbox
                          id={id}
                          checked={deliveryMethods.includes(id)}
                          onCheckedChange={() => toggleDeliveryMethod(id)}
                        />
                        <label htmlFor={id} className="text-sm flex items-center">
                          <Icon className="h-4 w-4 mr-1" />
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Specialists List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {sortedSpecialists.length} specialists found
                {selectedCategory && ` in ${selectedCategory}`}
              </h2>
            </div>

            {sortedSpecialists.map((specialist) => (
              <Card key={specialist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Profile Image */}
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={specialist.profileImage} />
                      <AvatarFallback>
                        {specialist.firstName[0]}{specialist.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">
                              {specialist.title} {specialist.firstName} {specialist.lastName}
                            </h3>
                            {specialist.verified && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            style={{ borderColor: specialist.categoryColor, color: specialist.categoryColor }}
                          >
                            {specialist.category}
                          </Badge>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold">£{specialist.hourlyRate}/hr</div>
                          <div className="text-sm text-gray-600">Assessment: £{specialist.assessmentRate}</div>
                        </div>
                      </div>

                      {/* Rating and Stats */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{specialist.rating}</span>
                          <span className="text-gray-600 text-sm ml-1">({specialist.reviewCount})</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="h-4 w-4 mr-1" />
                          {specialist.completedSessions} sessions
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {specialist.yearsExperience} years
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {specialist.location.city} ({specialist.location.distance}mi)
                        </div>
                      </div>

                      {/* Specializations */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {specialist.specializations.slice(0, 3).map((spec, index) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                        {specialist.specializations.length > 3 && (
                          <Badge variant="outline">+{specialist.specializations.length - 3} more</Badge>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {specialist.bio}
                      </p>

                      {/* Services */}
                      <div className="flex items-center gap-4 mb-4">
                        {specialist.services.online && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Video className="h-4 w-4 mr-1" />
                            Online
                          </div>
                        )}
                        {specialist.services.inPerson && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            In-person
                          </div>
                        )}
                        {specialist.services.homeVisit && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-1" />
                            Home visits
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Next: {new Date(specialist.availability.nextAvailable).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Responds in {specialist.availability.responseTime}h
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleBookSpecialist(specialist.id)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                          >
                            Book Session
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sortedSpecialists.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No specialists found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria to find more specialists.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSelectedCategory('');
                    setSearchTerm('');
                    setPriceRange([0, 200]);
                    setMinRating(0);
                    setDeliveryMethods([]);
                  }}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Platform Guarantee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-blue-500" />
                  All specialists verified and qualified
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Secure payments and session protection
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                  Satisfaction guarantee or money back
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  Session reports included
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  Progress tracking tools
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Search & Filter</h5>
                    <p className="text-gray-600">Find specialists by category, location, and your specific needs</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Book Sessions</h5>
                    <p className="text-gray-600">Schedule individual sessions or therapy packages</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Track Progress</h5>
                    <p className="text-gray-600">Receive detailed reports and monitor your child's development</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <span className="text-blue-600 font-medium">4</span>
                  </div>
                  <div>
                    <h5 className="font-medium">Integrate with EHC</h5>
                    <p className="text-gray-600">Automatically update your EHC plan with session outcomes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Popular This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SPECIALIST_CATEGORIES.slice(0, 4).map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" style={{ color: category.color }} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help Choosing?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Our SEND advisors can help you find the right specialist for your child's needs.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Speak to an Advisor
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
