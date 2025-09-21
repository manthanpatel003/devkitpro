'use client'

import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Copy, Download, Lightbulb, Palette } from 'lucide-react'
import { useState } from 'react'

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
}

interface ColorPalette {
  id: string
  name: string
  colors: Color[]
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'custom'
  accessibility: {
    wcagAA: boolean
    wcagAAA: boolean
    contrastRatio: number
  }
}

const ColorPaletteGeneratorPage = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6')
  const [palettes, setPalettes] = useState<ColorPalette[]>([])
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)
  const [generating, setGenerating] = useState(false)
  const [paletteType, setPaletteType] = useState<
    'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'
  >('complementary')

  const { copy, isCopied } = useCopyToClipboard()

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h * 12) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const generatePalette = (type: string, baseHex: string): Color[] => {
    const rgb = hexToRgb(baseHex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const colors: Color[] = []

    switch (type) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const lightness = 20 + i * 20
          const hex = hslToHex(hsl.h, hsl.s, lightness)
          colors.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { ...hsl, l: lightness },
            name: `Mono ${i + 1}`,
          })
        }
        break

      case 'analogous':
        for (let i = -2; i <= 2; i++) {
          const hue = (hsl.h + i * 30) % 360
          const hex = hslToHex(hue, hsl.s, hsl.l)
          colors.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: hsl.s, l: hsl.l },
            name: `Analog ${i + 3}`,
          })
        }
        break

      case 'complementary':
        const complementHue = (hsl.h + 180) % 360
        colors.push(
          { hex: baseHex, rgb, hsl, name: 'Base' },
          {
            hex: hslToHex(complementHue, hsl.s, hsl.l),
            rgb: hexToRgb(hslToHex(complementHue, hsl.s, hsl.l)),
            hsl: { h: complementHue, s: hsl.s, l: hsl.l },
            name: 'Complement',
          },
          {
            hex: hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
            rgb: hexToRgb(hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30))),
            hsl: { h: hsl.h, s: hsl.s, l: Math.max(10, hsl.l - 30) },
            name: 'Dark',
          },
          {
            hex: hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30)),
            rgb: hexToRgb(hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30))),
            hsl: { h: hsl.h, s: hsl.s, l: Math.min(90, hsl.l + 30) },
            name: 'Light',
          },
          {
            hex: hslToHex(complementHue, Math.max(10, hsl.s - 20), hsl.l),
            rgb: hexToRgb(hslToHex(complementHue, Math.max(10, hsl.s - 20), hsl.l)),
            hsl: { h: complementHue, s: Math.max(10, hsl.s - 20), l: hsl.l },
            name: 'Muted',
          }
        )
        break

      case 'triadic':
        for (let i = 0; i < 3; i++) {
          const hue = (hsl.h + i * 120) % 360
          const hex = hslToHex(hue, hsl.s, hsl.l)
          colors.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: hsl.s, l: hsl.l },
            name: `Triadic ${i + 1}`,
          })
        }
        break

      case 'tetradic':
        for (let i = 0; i < 4; i++) {
          const hue = (hsl.h + i * 90) % 360
          const hex = hslToHex(hue, hsl.s, hsl.l)
          colors.push({
            hex,
            rgb: hexToRgb(hex),
            hsl: { h: hue, s: hsl.s, l: hsl.l },
            name: `Tetradic ${i + 1}`,
          })
        }
        break
    }

    return colors
  }

  const generatePalettes = async () => {
    setGenerating(true)

    try {
      const newPalettes: ColorPalette[] = []

      // Generate different palette types
      const types: Array<'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'> =
        ['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic']

      types.forEach(type => {
        const colors = generatePalette(type, baseColor)
        const accessibility = analyzeAccessibility(colors)

        newPalettes.push({
          id: `${type}-${Date.now()}`,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Palette`,
          colors,
          type,
          accessibility,
        })
      })

      setPalettes(newPalettes)
      setSelectedPalette(newPalettes[0])
    } catch (error) {
      console.error('Palette generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const analyzeAccessibility = (colors: Color[]) => {
    // Check contrast against white background
    const lightestColor = colors.reduce((lightest, color) =>
      color.hsl.l > lightest.hsl.l ? color : lightest
    )

    // Simplified contrast calculation
    const contrastRatio = calculateContrastRatio(lightestColor.rgb, { r: 255, g: 255, b: 255 })

    return {
      wcagAA: contrastRatio >= 4.5,
      wcagAAA: contrastRatio >= 7,
      contrastRatio: Math.round(contrastRatio * 100) / 100,
    }
  }

  const calculateContrastRatio = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ) => {
    const luminance1 = getRelativeLuminance(color1)
    const luminance2 = getRelativeLuminance(color2)
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  const getRelativeLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const copyPalette = (format: 'hex' | 'rgb' | 'hsl' | 'css') => {
    if (!selectedPalette) return

    let output = ''
    switch (format) {
      case 'hex':
        output = selectedPalette.colors.map(c => c.hex).join('\n')
        break
      case 'rgb':
        output = selectedPalette.colors
          .map(c => `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`)
          .join('\n')
        break
      case 'hsl':
        output = selectedPalette.colors
          .map(c => `hsl(${Math.round(c.hsl.h)}, ${Math.round(c.hsl.s)}%, ${Math.round(c.hsl.l)}%)`)
          .join('\n')
        break
      case 'css':
        output = selectedPalette.colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n')
        break
    }
    copy(output)
  }

  const downloadPalette = () => {
    if (!selectedPalette) return

    const data = {
      name: selectedPalette.name,
      type: selectedPalette.type,
      colors: selectedPalette.colors,
      accessibility: selectedPalette.accessibility,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-palette-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="AI Color Palette Generator"
      description="Generate beautiful color palettes with AI assistance, accessibility checking, and export options"
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette Generator
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Base Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={e => setBaseColor(e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    type="text"
                    value={baseColor}
                    onChange={e => setBaseColor(e.target.value)}
                    className="flex-1 font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <Button onClick={generatePalettes} disabled={generating}>
                {generating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" />
                )}
                {generating ? 'Generating...' : 'Generate Palettes'}
              </Button>
            </div>
          </div>
        </Card>

        {palettes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-4">
              {palettes.map(palette => (
                <Card
                  key={palette.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedPalette?.id === palette.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPalette(palette)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{palette.name}</h4>
                    <div className="flex items-center gap-2">
                      {palette.accessibility.wcagAA && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          WCAG AA
                        </span>
                      )}
                      {palette.accessibility.wcagAAA && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          WCAG AAA
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {palette.colors.map((color, index) => (
                      <div key={index} className="flex-1 group">
                        <div
                          className="h-16 rounded-lg shadow-sm border cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color.hex }}
                          onClick={e => {
                            e.stopPropagation()
                            copy(color.hex)
                          }}
                        />
                        <div className="text-center mt-2">
                          <div className="text-xs font-mono">{color.hex}</div>
                          <div className="text-xs text-gray-600">{color.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {selectedPalette && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedPalette.name}</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => copyPalette('hex')} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      {isCopied ? 'Copied!' : 'Copy HEX'}
                    </Button>
                    <Button onClick={() => copyPalette('css')} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy CSS
                    </Button>
                    <Button onClick={downloadPalette} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Color Details</h4>
                    <div className="space-y-3">
                      {selectedPalette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div
                            className="w-8 h-8 rounded border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1">
                            <div className="font-mono text-sm">{color.hex}</div>
                            <div className="text-xs text-gray-600">
                              RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b}) • HSL(
                              {Math.round(color.hsl.h)}, {Math.round(color.hsl.s)}%,{' '}
                              {Math.round(color.hsl.l)}%)
                            </div>
                          </div>
                          <Button onClick={() => copy(color.hex)} variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Accessibility</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {selectedPalette.accessibility.wcagAA ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span>WCAG AA Compliance</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedPalette.accessibility.wcagAAA ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span>WCAG AAA Compliance</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Contrast Ratio: {selectedPalette.accessibility.contrastRatio}:1
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-blue-800">Accessibility Tips:</div>
                          <ul className="text-blue-700 mt-1 space-y-1">
                            <li>• AA: 4.5:1 contrast for normal text</li>
                            <li>• AAA: 7:1 contrast for enhanced accessibility</li>
                            <li>• Test with colorblind simulators</li>
                            <li>• Don't rely solely on color for information</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  )
}

export default ColorPaletteGeneratorPage
