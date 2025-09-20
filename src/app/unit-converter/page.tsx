'use client'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { TOOLS } from '@/lib/constants'
import { downloadFile } from '@/lib/utils'
import { ArrowLeftRight, Calculator, Ruler, Scale, Thermometer, Timer, Zap } from 'lucide-react'
import * as React from 'react'

interface ConversionUnit {
  name: string
  symbol: string
  factor: number // conversion factor to base unit
  offset?: number // for temperature conversions
}

interface UnitCategory {
  id: string
  name: string
  icon: React.ComponentType<any>
  baseUnit: string
  units: ConversionUnit[]
}

interface ConversionResult {
  fromValue: number
  fromUnit: ConversionUnit
  toValue: number
  toUnit: ConversionUnit
  category: string
}

export default function UnitConverterPage() {
  const [activeCategory, setActiveCategory] = React.useState('length')
  const [fromUnit, setFromUnit] = React.useState('')
  const [toUnit, setToUnit] = React.useState('')
  const [inputValue, setInputValue] = React.useState('')
  const [results, setResults] = React.useState<ConversionResult[]>([])

  const { addToast } = useToast()
  const tool = TOOLS.find(t => t.id === 'unit-converter')!

  const unitCategories: UnitCategory[] = [
    {
      id: 'length',
      name: 'Length',
      icon: Ruler,
      baseUnit: 'meter',
      units: [
        { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
        { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
        { name: 'Meter', symbol: 'm', factor: 1 },
        { name: 'Kilometer', symbol: 'km', factor: 1000 },
        { name: 'Inch', symbol: 'in', factor: 0.0254 },
        { name: 'Foot', symbol: 'ft', factor: 0.3048 },
        { name: 'Yard', symbol: 'yd', factor: 0.9144 },
        { name: 'Mile', symbol: 'mi', factor: 1609.344 },
      ],
    },
    {
      id: 'weight',
      name: 'Weight',
      icon: Scale,
      baseUnit: 'kilogram',
      units: [
        { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
        { name: 'Gram', symbol: 'g', factor: 0.001 },
        { name: 'Kilogram', symbol: 'kg', factor: 1 },
        { name: 'Pound', symbol: 'lb', factor: 0.453592 },
        { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
        { name: 'Stone', symbol: 'st', factor: 6.35029 },
        { name: 'Ton', symbol: 't', factor: 1000 },
      ],
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: Thermometer,
      baseUnit: 'celsius',
      units: [
        { name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
        { name: 'Fahrenheit', symbol: '°F', factor: 1, offset: 32 },
        { name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15 },
        { name: 'Rankine', symbol: '°R', factor: 1, offset: 491.67 },
      ],
    },
    {
      id: 'area',
      name: 'Area',
      icon: Calculator,
      baseUnit: 'square meter',
      units: [
        { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
        { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
        { name: 'Square Meter', symbol: 'm²', factor: 1 },
        { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
        { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 },
        { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
        { name: 'Acre', symbol: 'ac', factor: 4046.86 },
        { name: 'Hectare', symbol: 'ha', factor: 10000 },
      ],
    },
    {
      id: 'volume',
      name: 'Volume',
      icon: Calculator,
      baseUnit: 'liter',
      units: [
        { name: 'Milliliter', symbol: 'ml', factor: 0.001 },
        { name: 'Liter', symbol: 'l', factor: 1 },
        { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
        { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735 },
        { name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
        { name: 'Pint (US)', symbol: 'pt', factor: 0.473176 },
        { name: 'Quart (US)', symbol: 'qt', factor: 0.946353 },
        { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
      ],
    },
    {
      id: 'time',
      name: 'Time',
      icon: Timer,
      baseUnit: 'second',
      units: [
        { name: 'Millisecond', symbol: 'ms', factor: 0.001 },
        { name: 'Second', symbol: 's', factor: 1 },
        { name: 'Minute', symbol: 'min', factor: 60 },
        { name: 'Hour', symbol: 'h', factor: 3600 },
        { name: 'Day', symbol: 'd', factor: 86400 },
        { name: 'Week', symbol: 'wk', factor: 604800 },
        { name: 'Month', symbol: 'mo', factor: 2629746 },
        { name: 'Year', symbol: 'yr', factor: 31556952 },
      ],
    },
  ]

  const currentCategory = unitCategories.find(cat => cat.id === activeCategory)!

  const convertUnits = (
    value: number,
    from: ConversionUnit,
    to: ConversionUnit,
    category: string
  ): number => {
    if (category === 'temperature') {
      // Special handling for temperature
      if (from.symbol === '°C' && to.symbol === '°F') {
        return (value * 9) / 5 + 32
      } else if (from.symbol === '°F' && to.symbol === '°C') {
        return ((value - 32) * 5) / 9
      } else if (from.symbol === '°C' && to.symbol === 'K') {
        return value + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°C') {
        return value - 273.15
      } else if (from.symbol === '°F' && to.symbol === 'K') {
        return ((value - 32) * 5) / 9 + 273.15
      } else if (from.symbol === 'K' && to.symbol === '°F') {
        return ((value - 273.15) * 9) / 5 + 32
      }
      return value // Same unit
    } else {
      // Standard conversion using factors
      const baseValue = value * from.factor
      return baseValue / to.factor
    }
  }

  const performConversion = React.useCallback(() => {
    if (!inputValue || !fromUnit || !toUnit) return

    const value = parseFloat(inputValue)
    if (isNaN(value)) return

    const fromUnitObj = currentCategory.units.find(u => u.symbol === fromUnit)
    const toUnitObj = currentCategory.units.find(u => u.symbol === toUnit)

    if (!fromUnitObj || !toUnitObj) return

    const convertedValue = convertUnits(value, fromUnitObj, toUnitObj, activeCategory)

    const result: ConversionResult = {
      fromValue: value,
      fromUnit: fromUnitObj,
      toValue: convertedValue,
      toUnit: toUnitObj,
      category: activeCategory,
    }

    setResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 conversions
  }, [inputValue, fromUnit, toUnit, currentCategory, activeCategory])

  React.useEffect(() => {
    if (currentCategory.units.length >= 2) {
      setFromUnit(currentCategory.units[0].symbol)
      setToUnit(currentCategory.units[1].symbol)
    }
  }, [activeCategory, currentCategory])

  React.useEffect(() => {
    performConversion()
  }, [performConversion])

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  const handleDownload = () => {
    if (results.length === 0) return

    const report = `Unit Conversion History
Generated: ${new Date().toISOString()}

${results
  .map(
    (result, index) =>
      `${index + 1}. ${result.fromValue} ${result.fromUnit.symbol} = ${result.toValue.toFixed(6)} ${result.toUnit.symbol} (${result.category})`
  )
  .join('\n')}
`

    downloadFile(report, 'unit-conversions.txt', 'text/plain')
  }

  const examples = [
    {
      title: 'Metric to Imperial',
      description: 'Convert 100 kilometers to miles',
      input: '100 km to miles',
      action: () => {
        setActiveCategory('length')
        setInputValue('100')
        setFromUnit('km')
        setToUnit('mi')
      },
    },
    {
      title: 'Temperature',
      description: 'Convert 25°C to Fahrenheit',
      input: '25°C to °F',
      action: () => {
        setActiveCategory('temperature')
        setInputValue('25')
        setFromUnit('°C')
        setToUnit('°F')
      },
    },
    {
      title: 'Weight',
      description: 'Convert 150 pounds to kilograms',
      input: '150 lb to kg',
      action: () => {
        setActiveCategory('weight')
        setInputValue('150')
        setFromUnit('lb')
        setToUnit('kg')
      },
    },
  ]

  const tips = [
    'Bookmark frequently used conversions for quick access',
    'Double-check critical conversions with multiple sources',
    'Remember that some conversions may have slight rounding errors',
    'Temperature conversions use exact formulas, not approximations',
    'Imperial and metric systems use different base units',
    'Consider the precision needed for your specific use case',
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <ToolLayout
          tool={tool}
          result={results.length > 0 ? JSON.stringify(results, null, 2) : null}
          onReset={() => {
            setInputValue('')
            setResults([])
          }}
          onDownload={handleDownload}
          examples={examples}
          tips={tips}
        >
          <div className="space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Unit Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {unitCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? 'default' : 'outline'}
                      className="h-auto p-3 flex flex-col items-center space-y-1"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <category.icon className="h-5 w-5" />
                      <span className="text-xs">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowLeftRight className="h-5 w-5 mr-2" />
                  Convert {currentCategory.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Input Value */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value to Convert</label>
                    <Input
                      type="number"
                      placeholder="Enter value..."
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Unit Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <select
                        value={fromUnit}
                        onChange={e => setFromUnit(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {currentCategory.units.map(unit => (
                          <option key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={swapUnits}
                        className="h-10 w-10 p-0"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <select
                        value={toUnit}
                        onChange={e => setToUnit(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        {currentCategory.units.map(unit => (
                          <option key={unit.symbol} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Current Result */}
                  {results.length > 0 && results[0].category === activeCategory && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {results[0].toValue.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 6,
                          })}{' '}
                          {results[0].toUnit.symbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {results[0].fromValue} {results[0].fromUnit.symbol} ={' '}
                          {results[0].toValue.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 6,
                          })}{' '}
                          {results[0].toUnit.symbol}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* All Units Conversion */}
            {inputValue && !isNaN(parseFloat(inputValue)) && (
              <Card>
                <CardHeader>
                  <CardTitle>Convert to All {currentCategory.name} Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentCategory.units.map(unit => {
                      const fromUnitObj = currentCategory.units.find(u => u.symbol === fromUnit)
                      if (!fromUnitObj) return null

                      const convertedValue = convertUnits(
                        parseFloat(inputValue),
                        fromUnitObj,
                        unit,
                        activeCategory
                      )

                      return (
                        <div
                          key={unit.symbol}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{unit.name}</div>
                              <div className="text-xs text-muted-foreground">{unit.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm">
                                {convertedValue.toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 6,
                                })}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(convertedValue.toString())
                                  addToast({
                                    type: 'success',
                                    title: 'Copied!',
                                    description: `${convertedValue} ${unit.symbol} copied`,
                                  })
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversion History */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="h-5 w-5 mr-2" />
                    Recent Conversions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <span>
                          {result.fromValue} {result.fromUnit.symbol} →{' '}
                          {result.toValue.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 6,
                          })}{' '}
                          {result.toUnit.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {result.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Conversions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Conversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Common Length Conversions</h4>
                    <div className="space-y-1 text-sm">
                      <div>1 inch = 2.54 cm</div>
                      <div>1 foot = 30.48 cm</div>
                      <div>1 yard = 0.91 m</div>
                      <div>1 mile = 1.61 km</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Common Weight Conversions</h4>
                    <div className="space-y-1 text-sm">
                      <div>1 pound = 0.45 kg</div>
                      <div>1 ounce = 28.35 g</div>
                      <div>1 stone = 6.35 kg</div>
                      <div>1 ton = 1000 kg</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Temperature Reference</h4>
                    <div className="space-y-1 text-sm">
                      <div>Water freezes: 0°C = 32°F</div>
                      <div>Room temperature: 20°C = 68°F</div>
                      <div>Water boils: 100°C = 212°F</div>
                      <div>Absolute zero: -273.15°C = 0K</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Volume Reference</h4>
                    <div className="space-y-1 text-sm">
                      <div>1 liter = 1000 ml</div>
                      <div>1 gallon (US) = 3.79 l</div>
                      <div>1 cup (US) = 237 ml</div>
                      <div>1 fluid ounce = 29.6 ml</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ToolLayout>
      </main>
      <Footer />
    </>
  )
}
