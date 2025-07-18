'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BRAIN_ICON_SVG } from '@/lib/brand-assets';
import {
  Menu,
  X,
  ChevronDown,
  Brain,
  Users,
  Building,
  GraduationCap,
  Activity,
  Scale,
  Stethoscope,
  MessageSquare,
  FileText,
  Download,
  Settings,
  Heart
} from 'lucide-react';

const NAVIGATION_LINKS = {
  features: [
    { name: 'AI EHC Plan Builder', href: '/ehc-plan-builder', icon: Brain, description: 'Generate professional EHC plans with AI' },
    { name: 'Gender-Responsive Assessment', href: '/gender-assessment', icon: Heart, description: 'Female-specific autism screening & masking detection' },
    { name: 'Medical Assessments', href: '/book-assessment', icon: Stethoscope, description: 'Book autism assessments with certified professionals' },
    { name: 'Specialist Marketplace', href: '/specialist-marketplace', icon: Users, description: 'Connect with verified SEND specialists' },
    { name: 'WhatsApp Voice Commands', href: '/whatsapp-setup', icon: MessageSquare, description: 'Voice-controlled platform access' }
  ],
  stakeholders: [
    { name: 'Parents & Families', href: '/parent-portal', icon: Users, description: 'Comprehensive family support tools' },
    { name: 'Local Authorities', href: '/la-portal', icon: Building, description: 'Enterprise LA command center' },
    { name: 'Schools & Education', href: '/school-portal', icon: GraduationCap, description: 'SEND management for educators' },
    { name: 'Healthcare Providers', href: '/healthcare-portal', icon: Activity, description: 'Clinical workflow optimization' },
    { name: 'Professionals', href: '/professional-portal', icon: Scale, description: 'Practice management platform' }
  ],
  resources: [
    { name: 'Gender Analytics', href: '/gender-analytics', icon: Heart, description: 'Diagnostic gap insights and analysis' },
    { name: 'Beta Testing', href: '/beta', icon: Settings, description: 'Join our testing program' },
    { name: 'Join Specialists', href: '/join-specialists', icon: Users, description: 'Apply to our professional network' },
    { name: 'Brand Assets', href: '/brand-assets', icon: Download, description: 'Download logos and brand guidelines' },
    { name: 'Documentation', href: '/docs', icon: FileText, description: 'Platform documentation and guides' }
  ]
};

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-10 h-10"
              dangerouslySetInnerHTML={{ __html: BRAIN_ICON_SVG }}
            />
            <div>
              <div className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                SpectrumCare
              </div>
              <div className="text-xs text-gray-500 -mt-1">Comprehensive Autism Support</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Features Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => toggleDropdown('features')}
              >
                <span>Features</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Platform Features</div>
                  <div className="space-y-3">
                    {NAVIGATION_LINKS.features.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* For Stakeholders Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>For Stakeholders</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Stakeholder Portals</div>
                  <div className="space-y-3">
                    {NAVIGATION_LINKS.stakeholders.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Professionals Link */}
            <Link href="/join-specialists" className="text-gray-700 hover:text-blue-600 transition-colors">
              Professionals
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Resources</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4">
                  <div className="space-y-3">
                    {NAVIGATION_LINKS.resources.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/beta">
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                🔥 Beta Access
              </Button>
            </Link>
            <Link href="/ehc-plan-builder">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="py-4 space-y-4">
              {/* Mobile Features */}
              <div>
                <div className="font-semibold text-gray-900 mb-2">Features</div>
                <div className="space-y-2 pl-4">
                  {NAVIGATION_LINKS.features.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Stakeholders */}
              <div>
                <div className="font-semibold text-gray-900 mb-2">For Stakeholders</div>
                <div className="space-y-2 pl-4">
                  {NAVIGATION_LINKS.stakeholders.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link href="/beta" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                    🔥 Beta Access
                  </Button>
                </Link>
                <Link href="/ehc-plan-builder" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
