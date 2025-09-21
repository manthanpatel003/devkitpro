'use client'

import React, { useState } from 'react'
// Metadata removed - client components cannot export metadata
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { UnitConversion } from '@/types'
import { ArrowRight, Calculator, Copy, RefreshCw } from 'lucide-react'

// Metadata removed - client components cannot export metadata

const conversionCategories = {
  length: {
    name: 'Length',
    units: {
      mm: { name: 'Millimeter', factor: 0.001 },
      cm: { name: 'Centimeter', factor: 0.01 },
      m: { name: 'Meter', factor: 1 },
      km: { name: 'Kilometer', factor: 1000 },
      in: { name: 'Inch', factor: 0.0254 },
      ft: { name: 'Foot', factor: 0.3048 },
      yd: { name: 'Yard', factor: 0.9144 },
      mi: { name: 'Mile', factor: 1609.344 },
    },
  },
  weight: {
    name: 'Weight',
    units: {
      mg: { name: 'Milligram', factor: 0.001 },
      g: { name: 'Gram', factor: 1 },
      kg: { name: 'Kilogram', factor: 1000 },
      oz: { name: 'Ounce', factor: 28.3495 },
      lb: { name: 'Pound', factor: 453.592 },
      t: { name: 'Metric Ton', factor: 1000000 },
    },
  },
  temperature: {
    name: 'Temperature',
    units: {
      c: { name: 'Celsius', factor: 1 },
      f: { name: 'Fahrenheit', factor: 1 },
      k: { name: 'Kelvin', factor: 1 },
    },
  },
  area: {
    name: 'Area',
    units: {
      mm2: { name: 'Square Millimeter', factor: 0.000001 },
      cm2: { name: 'Square Centimeter', factor: 0.0001 },
      m2: { name: 'Square Meter', factor: 1 },
      km2: { name: 'Square Kilometer', factor: 1000000 },
      in2: { name: 'Square Inch', factor: 0.00064516 },
      ft2: { name: 'Square Foot', factor: 0.092903 },
      ac: { name: 'Acre', factor: 4046.86 },
      ha: { name: 'Hectare', factor: 10000 },
    },
  },
  volume: {
    name: 'Volume',
    units: {
      ml: { name: 'Milliliter', factor: 0.001 },
      l: { name: 'Liter', factor: 1 },
      m3: { name: 'Cubic Meter', factor: 1000 },
      fl_oz: { name: 'Fluid Ounce', factor: 0.0295735 },
      cup: { name: 'Cup', factor: 0.236588 },
      pt: { name: 'Pint', factor: 0.473176 },
      qt: { name: 'Quart', factor: 0.946353 },
      gal: { name: 'Gallon', factor: 3.78541 },
    },
  },
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<keyof typeof conversionCategories>('length')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [value, setValue] = useState('')
  const [result, setResult] = useState<UnitConversion | null>(null)
  const { success, error: showError } = useToast()

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number

    // Convert to Celsius first
    switch (from) {
      case 'c':
        celsius = value
        break
      case 'f':
        celsius = ((value - 32) * 5) / 9
        break
      case 'k':
        celsius = value - 273.15
        break
      default:
        return value
    }

    // Convert from Celsius to target
    switch (to) {
      case 'c':
        return celsius
      case 'f':
        return (celsius * 9) / 5 + 32
      case 'k':
        return celsius + 273.15
      default:
        return value
    }
  }

  const convert = () => {
    if (!value.trim()) {
      showError('Please enter a value to convert')
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      showError('Please enter a valid number')
      return
    }

    let convertedValue: number

    if (category === 'temperature') {
      convertedValue = convertTemperature(numValue, fromUnit, toUnit)
    } else {
      const categoryUnits = conversionCategories[category].units as any
      const fromFactor = categoryUnits[fromUnit]?.factor || 1
      const toFactor = categoryUnits[toUnit]?.factor || 1
      convertedValue = (numValue * fromFactor) / toFactor
    }

    const conversion: UnitConversion = {
      from: fromUnit,
      to: toUnit,
      value: numValue,
      result: convertedValue,
      category: conversionCategories[category].name,
    }

    setResult(conversion)
    success('Conversion completed!')
  }

  const handleCopy = async (text: string, label: string) => {
    const copySuccess = await copyToClipboard(text)
    if (copySuccess) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  const loadExample = () => {
    setValue('100')
    success('Example loaded!')
  }

  const clearAll = () => {
    setValue('')
    setResult(null)
    success('Cleared all data')
  }

  // Auto-convert when values change
  React.useEffect(() => {
    if (value.trim() && !isNaN(parseFloat(value))) {
      convert()
    }
  }, [value, fromUnit, toUnit, category])

  const currentUnits = conversionCategories[category].units

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Unit Converter</h1>
          <p className="text-xl text-gray-600">Convert between different units of measurement</p>
        </div>

        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Conversion Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(conversionCategories).map(([key, categoryData]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key as keyof typeof conversionCategories)}
                  className={`p-3 text-center border rounded-lg transition-colors ${
                    category === key
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{categoryData.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Convert From</CardTitle>
              <CardDescription>Enter the value and select the source unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Enter value to convert"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="text-lg"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Unit</label>
                  <select
                    value={fromUnit}
                    onChange={e => setFromUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {Object.entries(currentUnits).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {unit.name} ({key})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={loadExample} variant="outline" className="flex-1">
                    Load Example
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Convert To</CardTitle>
              <CardDescription>Select the target unit and see the result</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Unit</label>
                  <select
                    value={toUnit}
                    onChange={e => setToUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {Object.entries(currentUnits).map(([key, unit]) => (
                      <option key={key} value={key}>
                        {unit.name} ({key})
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={swapUnits} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Swap Units
                </Button>

                {result && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {result.result.toFixed(6)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {(currentUnits as any)[toUnit]?.name}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={() => handleCopy(result.result.toString(), 'Converted Value')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Result
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Details */}
        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Conversion Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.value}</div>
                  <div className="text-sm text-blue-600">
                    {(currentUnits as any)[fromUnit]?.name}
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-600" />
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.result.toFixed(6)}
                  </div>
                  <div className="text-sm text-green-600">
                    {(currentUnits as any)[toUnit]?.name}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600">
                <div className="font-medium">Conversion Formula:</div>
                <div className="font-mono mt-1">
                  {category === 'temperature'
                    ? 'Temperature conversion using standard formulas'
                    : `${result.value} ${fromUnit} × ${(currentUnits as any)[fromUnit]?.factor} ÷ ${
                        (currentUnits as any)[toUnit]?.factor
                      } = ${result.result.toFixed(6)} ${toUnit}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Conversion Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Length</h4>
                <p className="text-gray-600">
                  Convert between millimeters, centimeters, meters, kilometers, inches, feet, yards,
                  and miles.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Weight</h4>
                <p className="text-gray-600">
                  Convert between milligrams, grams, kilograms, ounces, pounds, and metric tons.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Temperature</h4>
                <p className="text-gray-600">
                  Convert between Celsius, Fahrenheit, and Kelvin using standard conversion
                  formulas.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Area</h4>
                <p className="text-gray-600">
                  Convert between square millimeters, centimeters, meters, kilometers, inches, feet,
                  acres, and hectares.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Volume</h4>
                <p className="text-gray-600">
                  Convert between milliliters, liters, cubic meters, fluid ounces, cups, pints,
                  quarts, and gallons.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
