'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BRAND_COLORS, SPECTRUM_CARE_LOGO_SVG, BRAIN_ICON_SVG, BRAND_GUIDELINES } from '@/lib/brand-assets';
import {
  Download,
  Palette,
  FileImage,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Brain,
  Type,
  Layout,
  Zap
} from 'lucide-react';

export default function BrandAssetsPage() {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadSVG = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">SpectrumCare Brand Assets</h1>
              <p className="text-gray-600">Download logos, colors, and brand guidelines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Logo Downloads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Logo Downloads
              </CardTitle>
              <CardDescription>
                High-quality SVG logos for use in marketing materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Logo */}
              <div className="space-y-3">
                <div className="bg-white p-6 border rounded-lg flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: SPECTRUM_CARE_LOGO_SVG }} />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => downloadSVG(SPECTRUM_CARE_LOGO_SVG, 'spectrumcare-logo-full.svg')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Logo
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/logo-full.svg" download>SVG</a>
                  </Button>
                </div>
              </div>

              {/* Icon Only */}
              <div className="space-y-3">
                <div className="bg-white p-6 border rounded-lg flex items-center justify-center">
                  <div dangerouslySetInnerHTML={{ __html: BRAIN_ICON_SVG }} />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => downloadSVG(BRAIN_ICON_SVG, 'spectrumcare-icon.svg')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Icon
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/logo-icon.svg" download>SVG</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Primary and secondary colors with hex codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Primary Colors */}
                <div>
                  <h4 className="font-semibold mb-3">Primary Colors</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(BRAND_COLORS.hex).map(([name, hex]) => (
                      <div
                        key={name}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => copyToClipboard(hex, name)}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-200"
                          style={{ backgroundColor: hex }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">
                            {name.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">{hex}</div>
                        </div>
                        {copiedColor === name ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient Classes */}
                <div>
                  <h4 className="font-semibold mb-3">Tailwind Gradients</h4>
                  <div className="space-y-2">
                    {Object.entries(BRAND_COLORS.gradients).map(([name, gradient]) => (
                      <div
                        key={name}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => copyToClipboard(`bg-gradient-to-r ${gradient}`, name)}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">{name}</div>
                          <div className="text-xs text-gray-500 font-mono">{gradient}</div>
                        </div>
                        {copiedColor === name ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Typography
              </CardTitle>
              <CardDescription>
                Font families and text styling guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Primary Font</h4>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="font-mono text-sm text-gray-600 mb-2">
                      {BRAND_GUIDELINES.typography.primary}
                    </div>
                    <div className="text-2xl font-bold">The quick brown fox</div>
                    <div className="text-lg">jumps over the lazy dog</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Heading Styles</h4>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold">Heading 1</div>
                    <div className="text-3xl font-bold">Heading 2</div>
                    <div className="text-2xl font-bold">Heading 3</div>
                    <div className="text-xl font-semibold">Heading 4</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Design System
              </CardTitle>
              <CardDescription>
                Spacing, borders, and component guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Spacing */}
              <div>
                <h4 className="font-semibold mb-3">Spacing Scale</h4>
                <div className="space-y-2">
                  {Object.entries(BRAND_GUIDELINES.spacing).map(([name, value]) => (
                    <div key={name} className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-mono text-gray-600">{name}</div>
                      <div className="bg-blue-200 h-4" style={{ width: value }} />
                      <div className="text-sm text-gray-500">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <h4 className="font-semibold mb-3">Border Radius</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(BRAND_GUIDELINES.borderRadius).map(([name, value]) => (
                    <div key={name} className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600"
                        style={{ borderRadius: value }}
                      />
                      <div>
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-xs text-gray-500">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Brand Usage Guidelines
            </CardTitle>
            <CardDescription>
              Important guidelines for using SpectrumCare brand assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✅ Do</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Use the official logo files provided here</li>
                  <li>• Maintain proper spacing and proportions</li>
                  <li>• Use brand colors consistently</li>
                  <li>• Ensure sufficient contrast for accessibility</li>
                  <li>• Use high-resolution files for print materials</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-red-600">❌ Don't</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Modify, distort, or recreate the logo</li>
                  <li>• Use low-resolution or pixelated versions</li>
                  <li>• Change brand colors or create new variations</li>
                  <li>• Place logo on backgrounds with poor contrast</li>
                  <li>• Use the logo smaller than minimum size (24px)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download All */}
        <div className="mt-8 text-center">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Download className="h-5 w-5 mr-2" />
            Download Complete Brand Kit
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Includes all logos, color swatches, and usage guidelines
          </p>
        </div>
      </div>
    </div>
  );
}
