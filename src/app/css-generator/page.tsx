'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile } from '@/lib/utils'
import { Copy, Download, Eye, Palette, RefreshCw, Settings, Square } from 'lucide-react'
import * as React from 'react'

interface GradientStop {
  color: string
  position: number
}

interface BoxShadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

interface BorderRadius {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

interface CSSGeneratorState {
  gradientType: 'linear' | 'radial' | 'conic'
  gradientDirection: number
  gradientStops: GradientStop[]
  boxShadows: BoxShadow[]
  borderRadius: BorderRadius
  backgroundColor: string
  width: number
  height: number
  padding: number
  margin: number
}

export default function CSSGeneratorPage() {
  const [state, setState] = React.useState<CSSGeneratorState>({
    gradientType: 'linear',
    gradientDirection: 45,
    gradientStops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 },
    ],
    boxShadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#00000040', inset: false }],
    borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
    backgroundColor: '#ffffff',
    width: 300,
    height: 200,
    padding: 20,
    margin: 10,
  })

  const [generatedCSS, setGeneratedCSS] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'gradient' | 'shadow' | 'border' | 'layout'>(
    'gradient'
  )

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'css-generator')!

  const generateCSS = React.useCallback(() => {
    const css: string[] = []

    // Basic properties
    css.push(`width: ${state.width}px;`)
    css.push(`height: ${state.height}px;`)
    css.push(`padding: ${state.padding}px;`)
    css.push(`margin: ${state.margin}px;`)

    // Background
    if (state.gradientStops.length > 1) {
      const stops = state.gradientStops
        .sort((a, b) => a.position - b.position)
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ')

      if (state.gradientType === 'linear') {
        css.push(`background: linear-gradient(${state.gradientDirection}deg, ${stops});`)
      } else if (state.gradientType === 'radial') {
        css.push(`background: radial-gradient(circle, ${stops});`)
      } else {
        css.push(`background: conic-gradient(from ${state.gradientDirection}deg, ${stops});`)
      }
    } else {
      css.push(`background-color: ${state.backgroundColor};`)
    }

    // Border radius
    const { topLeft, topRight, bottomRight, bottomLeft } = state.borderRadius
    if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
      css.push(`border-radius: ${topLeft}px;`)
    } else {
      css.push(`border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`)
    }

    // Box shadows
    if (state.boxShadows.length > 0) {
      const shadows = state.boxShadows
        .map(shadow => {
          const insetStr = shadow.inset ? 'inset ' : ''
          return `${insetStr}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
        })
        .join(', ')
      css.push(`box-shadow: ${shadows};`)
    }

    const result = css.join('\n')
    setGeneratedCSS(result)
    return result
  }, [state])

  React.useEffect(() => {
    generateCSS()
  }, [generateCSS])

  const addGradientStop = () => {
    setState(prev => ({
      ...prev,
      gradientStops: [...prev.gradientStops, { color: '#000000', position: 50 }],
    }))
  }

  const removeGradientStop = (index: number) => {
    setState(prev => ({
      ...prev,
      gradientStops: prev.gradientStops.filter((_, i) => i !== index),
    }))
  }

  const addBoxShadow = () => {
    setState(prev => ({
      ...prev,
      boxShadows: [
        ...prev.boxShadows,
        { x: 0, y: 2, blur: 4, spread: 0, color: '#00000020', inset: false },
      ],
    }))
  }

  const removeBoxShadow = (index: number) => {
    setState(prev => ({
      ...prev,
      boxShadows: prev.boxShadows.filter((_, i) => i !== index),
    }))
  }

  const copyCSS = async () => {
    try {
      await navigator.clipboard.writeText(generatedCSS)
      addToast({
        type: 'success',
        title: 'Copied!',
        description: 'CSS code copied to clipboard',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Copy failed',
        description: 'Failed to copy CSS',
      })
    }
  }

  const handleDownload = () => {
    downloadFile(generatedCSS, 'generated-styles.css', 'text/css')
  }

  const resetToDefaults = () => {
    setState({
      gradientType: 'linear',
      gradientDirection: 45,
      gradientStops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 },
      ],
      boxShadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#00000040', inset: false }],
      borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
      backgroundColor: '#ffffff',
      width: 300,
      height: 200,
      padding: 20,
      margin: 10,
    })
  }

  const examples = [
    {
      title: 'Card Design',
      description: 'Modern card with shadow and rounded corners',
      input: 'Gradient background with soft shadow',
      action: () =>
        setState(prev => ({
          ...prev,
          gradientStops: [
            { color: '#f8fafc', position: 0 },
            { color: '#e2e8f0', position: 100 },
          ],
          boxShadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#00000010', inset: false }],
          borderRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
        })),
    },
    {
      title: 'Button Hover',
      description: 'Colorful gradient button with glow effect',
      input: 'Vibrant gradient with glow shadow',
      action: () =>
        setState(prev => ({
          ...prev,
          gradientStops: [
            { color: '#667eea', position: 0 },
            { color: '#764ba2', position: 100 },
          ],
          boxShadows: [{ x: 0, y: 0, blur: 20, spread: 0, color: '#667eea40', inset: false }],
          borderRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
        })),
    },
    {
      title: 'Glass Effect',
      description: 'Glassmorphism with backdrop blur effect',
      input: 'Semi-transparent with subtle shadows',
      action: () =>
        setState(prev => ({
          ...prev,
          backgroundColor: '#ffffff20',
          gradientStops: [],
          boxShadows: [
            { x: 0, y: 8, blur: 32, spread: 0, color: '#00000010', inset: false },
            { x: 0, y: 1, blur: 0, spread: 1, color: '#ffffff40', inset: true },
          ],
          borderRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
        })),
    },
  ]

  const tips = [
    'Use CSS custom properties (variables) for consistent theming',
    'Test your designs across different browsers for compatibility',
    'Consider using CSS Grid and Flexbox for responsive layouts',
    'Optimize animations with transform and opacity for better performance',
    'Use relative units (rem, em, %) for better scalability',
    'Always provide fallback colors for gradient backgrounds',
  ]

  const previewStyle: React.CSSProperties = {
    width: `${state.width}px`,
    height: `${state.height}px`,
    padding: `${state.padding}px`,
    margin: `${state.margin}px`,
    borderRadius: `${state.borderRadius.topLeft}px ${state.borderRadius.topRight}px ${state.borderRadius.bottomRight}px ${state.borderRadius.bottomLeft}px`,
    boxShadow: state.boxShadows
      .map(shadow => {
        const insetStr = shadow.inset ? 'inset ' : ''
        return `${insetStr}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      })
      .join(', '),
    background:
      state.gradientStops.length > 1
        ? (() => {
            const stops = state.gradientStops
              .sort((a, b) => a.position - b.position)
              .map(stop => `${stop.color} ${stop.position}%`)
              .join(', ')

            if (state.gradientType === 'linear') {
              return `linear-gradient(${state.gradientDirection}deg, ${stops})`
            } else if (state.gradientType === 'radial') {
              return `radial-gradient(circle, ${stops})`
            } else {
              return `conic-gradient(from ${state.gradientDirection}deg, ${stops})`
            }
          })()
        : state.backgroundColor,
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={generatedCSS}
          onReset={resetToDefaults}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b">
              {[
                { id: 'gradient', label: 'Gradient', icon: Palette },
                { id: 'shadow', label: 'Shadow', icon: Square },
                { id: 'border', label: 'Border', icon: Square },
                { id: 'layout', label: 'Layout', icon: Settings },
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  leftIcon={<tab.icon className="h-4 w-4" />}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-6">
                {activeTab === 'gradient' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Gradient Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Gradient Type */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <div className="flex space-x-2">
                          {['linear', 'radial', 'conic'].map(type => (
                            <Button
                              key={type}
                              variant={state.gradientType === type ? 'default' : 'outline'}
                              size="sm"
                              onClick={() =>
                                setState(prev => ({ ...prev, gradientType: type as any }))
                              }
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Direction */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {state.gradientType === 'linear' ? 'Direction' : 'Rotation'}:{' '}
                          {state.gradientDirection}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={state.gradientDirection}
                          onChange={e =>
                            setState(prev => ({
                              ...prev,
                              gradientDirection: Number(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Color Stops */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Color Stops</label>
                          <Button size="sm" onClick={addGradientStop}>
                            Add Stop
                          </Button>
                        </div>
                        {state.gradientStops.map((stop, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={stop.color}
                              onChange={e => {
                                const newStops = [...state.gradientStops]
                                newStops[index].color = e.target.value
                                setState(prev => ({ ...prev, gradientStops: newStops }))
                              }}
                              className="w-12 h-8 rounded border"
                            />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={stop.position}
                              onChange={e => {
                                const newStops = [...state.gradientStops]
                                newStops[index].position = Number(e.target.value)
                                setState(prev => ({ ...prev, gradientStops: newStops }))
                              }}
                              className="w-16 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                            {state.gradientStops.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeGradientStop(index)}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'shadow' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Box Shadow Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Shadows</label>
                        <Button size="sm" onClick={addBoxShadow}>
                          Add Shadow
                        </Button>
                      </div>
                      {state.boxShadows.map((shadow, index) => (
                        <div key={index} className="space-y-3 p-3 border rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Shadow {index + 1}</span>
                            {state.boxShadows.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeBoxShadow(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs">X Offset</label>
                              <Input
                                type="number"
                                value={shadow.x}
                                onChange={e => {
                                  const newShadows = [...state.boxShadows]
                                  newShadows[index].x = Number(e.target.value)
                                  setState(prev => ({ ...prev, boxShadows: newShadows }))
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs">Y Offset</label>
                              <Input
                                type="number"
                                value={shadow.y}
                                onChange={e => {
                                  const newShadows = [...state.boxShadows]
                                  newShadows[index].y = Number(e.target.value)
                                  setState(prev => ({ ...prev, boxShadows: newShadows }))
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs">Blur</label>
                              <Input
                                type="number"
                                min="0"
                                value={shadow.blur}
                                onChange={e => {
                                  const newShadows = [...state.boxShadows]
                                  newShadows[index].blur = Number(e.target.value)
                                  setState(prev => ({ ...prev, boxShadows: newShadows }))
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs">Spread</label>
                              <Input
                                type="number"
                                value={shadow.spread}
                                onChange={e => {
                                  const newShadows = [...state.boxShadows]
                                  newShadows[index].spread = Number(e.target.value)
                                  setState(prev => ({ ...prev, boxShadows: newShadows }))
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={shadow.color.slice(0, 7)}
                              onChange={e => {
                                const newShadows = [...state.boxShadows]
                                newShadows[index].color =
                                  e.target.value +
                                  (shadow.color.length > 7 ? shadow.color.slice(7) : '40')
                                setState(prev => ({ ...prev, boxShadows: newShadows }))
                              }}
                              className="w-12 h-8 rounded border"
                            />
                            <Input
                              value={shadow.color}
                              onChange={e => {
                                const newShadows = [...state.boxShadows]
                                newShadows[index].color = e.target.value
                                setState(prev => ({ ...prev, boxShadows: newShadows }))
                              }}
                              className="flex-1 text-xs"
                              placeholder="#000000 or rgba(0,0,0,0.25)"
                            />
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={shadow.inset}
                                onChange={e => {
                                  const newShadows = [...state.boxShadows]
                                  newShadows[index].inset = e.target.checked
                                  setState(prev => ({ ...prev, boxShadows: newShadows }))
                                }}
                                className="rounded"
                              />
                              <span className="text-xs">Inset</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'border' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Border Radius Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs">Top Left</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.borderRadius.topLeft}
                            onChange={e =>
                              setState(prev => ({
                                ...prev,
                                borderRadius: {
                                  ...prev.borderRadius,
                                  topLeft: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs">Top Right</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.borderRadius.topRight}
                            onChange={e =>
                              setState(prev => ({
                                ...prev,
                                borderRadius: {
                                  ...prev.borderRadius,
                                  topRight: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs">Bottom Left</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.borderRadius.bottomLeft}
                            onChange={e =>
                              setState(prev => ({
                                ...prev,
                                borderRadius: {
                                  ...prev.borderRadius,
                                  bottomLeft: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs">Bottom Right</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.borderRadius.bottomRight}
                            onChange={e =>
                              setState(prev => ({
                                ...prev,
                                borderRadius: {
                                  ...prev.borderRadius,
                                  bottomRight: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'layout' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Layout Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Width (px)</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.width}
                            onChange={e =>
                              setState(prev => ({ ...prev, width: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Height (px)</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.height}
                            onChange={e =>
                              setState(prev => ({ ...prev, height: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Padding (px)</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.padding}
                            onChange={e =>
                              setState(prev => ({ ...prev, padding: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Margin (px)</label>
                          <Input
                            type="number"
                            min="0"
                            value={state.margin}
                            onChange={e =>
                              setState(prev => ({ ...prev, margin: Number(e.target.value) }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[300px]">
                      <div
                        style={previewStyle}
                        className="flex items-center justify-center text-sm font-medium"
                      >
                        Preview
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated CSS */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Generated CSS</span>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={copyCSS}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generatedCSS}
                      readOnly
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={generateCSS} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Regenerate CSS
              </Button>
              <Button variant="outline" onClick={copyCSS}>
                <Copy className="h-4 w-4 mr-2" />
                Copy CSS
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download CSS
              </Button>
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
            </div>
          </div>
        </ToolLayout>
      </main>
      <Footer />
    </>
  )
}
