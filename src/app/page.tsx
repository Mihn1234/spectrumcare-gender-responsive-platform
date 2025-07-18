'use client';

import React from 'react';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-8">
          SpectrumCare Platform - Production Ready
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          AI-powered SEND platform managing 638,745+ EHCPs with age-appropriate interfaces
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/gender-assessment" className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg hover:shadow-lg transition-all border-2 border-pink-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚺</span>
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">NEW</div>
            </div>
            <h3 className="text-xl font-semibold text-pink-900 mb-2">Gender-Responsive Assessment</h3>
            <p className="text-pink-700 text-sm">Female-specific autism screening addressing the 70.6% diagnostic gap</p>
          </Link>

          <Link href="/ehc-plan-builder" className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <h3 className="text-xl font-semibold text-blue-900 mb-2">🧠 AI EHC Plan Builder</h3>
            <p className="text-blue-700">Generate professional EHC plans with AI assistance</p>
          </Link>

          <Link href="/demographic-analytics" className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <h3 className="text-xl font-semibold text-green-900 mb-2">📊 Demographics</h3>
            <p className="text-green-700">Population health analytics and insights</p>
          </Link>

          <Link href="/age-demo" className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <h3 className="text-xl font-semibold text-purple-900 mb-2">🎨 Age-Appropriate UI</h3>
            <p className="text-purple-700">Experience interfaces adapted for all age groups</p>
          </Link>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-xl border-2 border-pink-200">
          <h2 className="text-2xl font-bold mb-4">🚺 Version 104: Gender-Responsive Tools Launch</h2>
          <p className="text-lg text-gray-700 mb-6">Addressing the critical 70.6% male vs 29.4% female diagnostic gap</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🚺</span>
                <div className="font-semibold">Female-Specific Assessment</div>
              </div>
              <div className="text-sm text-gray-600">Masking behavior detection</div>
              <div className="text-sm text-gray-600">Social camouflaging analysis</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <div className="font-semibold">Gender Analytics</div>
              </div>
              <div className="text-sm text-gray-600">100,000+ undiagnosed females</div>
              <div className="text-sm text-gray-600">Regional diagnostic patterns</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <div className="font-semibold">Targeted Interventions</div>
              </div>
              <div className="text-sm text-gray-600">Gender-responsive support</div>
              <div className="text-sm text-gray-600">Personalized recommendations</div>
            </div>
          </div>

          <div className="mt-6 bg-red-100 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-bold text-red-900">Critical Impact: 35% lower female diagnosis rate</div>
                <div className="text-red-800 text-sm">Our gender-responsive tools aim to increase female diagnosis rate from 29.4% to 45%+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
