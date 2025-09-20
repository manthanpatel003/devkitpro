'use client'

import React, { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { 
  FileText, 
  Copy, 
  RefreshCw,
  Download,
  Settings,
  Type
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Free Lorem Text Generator',
  description: 'Generate Lorem Ipsum placeholder text. Free Lorem Ipsum generator with customizable paragraphs and words.',
  keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'lorem generator', 'text generator'],
  openGraph: {
    title: 'Lorem Ipsum Generator - Free Lorem Text Generator',
    description: 'Generate Lorem Ipsum placeholder text. Free Lorem Ipsum generator with customization.',
  },
}

interface LoremConfig {
  type: 'paragraphs' | 'words' | 'sentences' | 'lists'
  count: number
  startWithLorem: boolean
  htmlFormat: boolean
  listType: 'ul' | 'ol'
}

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'sunt', 'explicabo', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas',
  'aspernatur', 'aut', 'odit', 'fugit', 'sed', 'quia', 'consequuntur', 'magni',
  'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt', 'neque',
  'porro', 'quisquam', 'est', 'qui', 'dolorem', 'ipsum', 'quia', 'dolor', 'sit',
  'amet', 'consectetur', 'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam',
  'eius', 'modi', 'tempora', 'incidunt', 'ut', 'labore', 'et', 'dolore',
  'magnam', 'aliquam', 'quaerat', 'voluptatem', 'ut', 'enim', 'ad', 'minima',
  'veniam', 'quis', 'nostrum', 'exercitationem', 'ullam', 'corporis', 'suscipit',
  'laboriosam', 'nisi', 'ut', 'aliquid', 'ex', 'ea', 'commodi', 'consequatur',
  'quis', 'autem', 'vel', 'eum', 'iure', 'reprehenderit', 'qui', 'in', 'ea',
  'voluptate', 'velit', 'esse', 'quam', 'nihil', 'molestiae', 'consequatur',
  'vel', 'illum', 'qui', 'dolorem', 'eum', 'fugiat', 'quo', 'voluptas', 'nulla',
  'pariatur', 'at', 'vero', 'eos', 'et', 'accusamus', 'et', 'iusto', 'odio',
  'dignissimos', 'ducimus', 'qui', 'blanditiis', 'praesentium', 'voluptatum',
  'deleniti', 'atque', 'corrupti', 'quos', 'dolores', 'et', 'quas', 'molestias',
  'excepturi', 'sint', 'occaecati', 'cupiditate', 'non', 'provident', 'similique',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollitia', 'animi',
  'id', 'est', 'laborum', 'et', 'dolorum', 'fuga', 'et', 'harum', 'quidem',
  'rerum', 'facilis', 'est', 'et', 'expedita', 'distinctio', 'nam', 'libero',
  'tempore', 'cum', 'soluta', 'nobis', 'est', 'eligendi', 'optio', 'cumque',
  'nihil', 'impedit', 'quo', 'minus', 'id', 'quod', 'maxime', 'placeat',
  'facere', 'possimus', 'omnis', 'voluptas', 'assumenda', 'est', 'omnis',
  'dolor', 'repellendus', 'temporibus', 'autem', 'quibusdam', 'et', 'aut',
  'officiis', 'debitis', 'aut', 'rerum', 'necessitatibus', 'saepe', 'eveniet',
  'ut', 'et', 'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
  'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'a', 'sapiente',
  'delectus', 'ut', 'aut', 'reiciendis', 'voluptatibus', 'maiores', 'alias',
  'consequatur', 'aut', 'perferendis', 'doloribus', 'asperiores', 'repellat'
]

export default function LoremGeneratorPage() {
  const [config, setConfig] = useState<LoremConfig>({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true,
    htmlFormat: false,
    listType: 'ul'
  })
  const [generatedText, setGeneratedText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { success, error: showError } = useToast()

  const getRandomWord = (): string => {
    return loremWords[Math.floor(Math.random() * loremWords.length)]
  }

  const getRandomSentence = (): string => {
    const wordCount = Math.floor(Math.random() * 15) + 8 // 8-22 words
    const words: string[] = []
    
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord())
    }
    
    // Capitalize first word
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    
    return words.join(' ') + '.'
  }

  const getRandomParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3 // 3-6 sentences
    const sentences: string[] = []
    
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(getRandomSentence())
    }
    
    return sentences.join(' ')
  }

  const generateLoremText = async (): Promise<void> => {
    setIsGenerating(true)
    
    try {
      let result: string[] = []
      
      if (config.startWithLorem) {
        result.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
      }
      
      switch (config.type) {
        case 'words':
          const words: string[] = []
          for (let i = 0; i < config.count; i++) {
            words.push(getRandomWord())
          }
          result.push(words.join(' '))
          break
          
        case 'sentences':
          for (let i = 0; i < config.count; i++) {
            result.push(getRandomSentence())
          }
          break
          
        case 'paragraphs':
          for (let i = 0; i < config.count; i++) {
            result.push(getRandomParagraph())
          }
          break
          
        case 'lists':
          const listItems: string[] = []
          for (let i = 0; i < config.count; i++) {
            listItems.push(getRandomSentence())
          }
          
          if (config.htmlFormat) {
            const listTag = config.listType === 'ul' ? 'ul' : 'ol'
            const listHtml = `<${listTag}>\n${listItems.map(item => `  <li>${item}</li>`).join('\n')}\n</${listTag}>`
            result.push(listHtml)
          } else {
            result.push(listItems.map((item, index) => `${index + 1}. ${item}`).join('\n'))
          }
          break
      }
      
      const finalText = result.join('\n\n')
      setGeneratedText(finalText)
      success('Lorem Ipsum text generated successfully!')
    } catch (err) {
      showError('Text generation failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      success(`${label} copied to clipboard!`)
    } else {
      showError('Failed to copy to clipboard')
    }
  }

  const downloadText = () => {
    if (!generatedText) return
    
    const blob = new Blob([generatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lorem-${config.type}-${config.count}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Text downloaded!')
  }

  const clearText = () => {
    setGeneratedText('')
    success('Text cleared')
  }

  const loadExample = () => {
    setConfig({
      type: 'paragraphs',
      count: 2,
      startWithLorem: true,
      htmlFormat: false,
      listType: 'ul'
    })
    success('Example configuration loaded!')
  }

  // Auto-generate when config changes
  React.useEffect(() => {
    if (config.count > 0) {
      generateLoremText()
    }
  }, [config])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Lorem Ipsum Generator</h1>
          <p className="text-xl text-gray-600">Generate placeholder text for your projects</p>
        </div>

        {/* Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Type
                </label>
                <select
                  value={config.type}
                  onChange={(e) => setConfig({...config, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                  <option value="lists">Lists</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.count}
                  onChange={(e) => setConfig({...config, count: Math.min(100, Math.max(1, Number(e.target.value)))})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start with Lorem
                </label>
                <select
                  value={config.startWithLorem ? 'yes' : 'no'}
                  onChange={(e) => setConfig({...config, startWithLorem: e.target.value === 'yes'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={loadExample} variant="outline" className="w-full">
                  Load Example
                </Button>
              </div>
            </div>
            
            {/* List-specific options */}
            {config.type === 'lists' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Type
                  </label>
                  <select
                    value={config.listType}
                    onChange={(e) => setConfig({...config, listType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="ul">Unordered List (•)</option>
                    <option value="ol">Ordered List (1.)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Format
                  </label>
                  <select
                    value={config.htmlFormat ? 'yes' : 'no'}
                    onChange={(e) => setConfig({...config, htmlFormat: e.target.value === 'yes'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="no">Plain Text</option>
                    <option value="yes">HTML</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Generated Text
            </CardTitle>
            <CardDescription>
              {generatedText ? `${generatedText.length} characters generated` : 'No text generated yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {generatedText}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(generatedText, 'Text')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button
                      onClick={downloadText}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={clearText}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Type className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Generated text will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="w-5 h-5 mr-2 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common Lorem Ipsum text variations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => setConfig({...config, type: 'paragraphs', count: 1})}
                variant="outline"
                className="text-left"
              >
                <div>
                  <div className="font-medium">1 Paragraph</div>
                  <div className="text-xs text-gray-500">Standard paragraph</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setConfig({...config, type: 'paragraphs', count: 3})}
                variant="outline"
                className="text-left"
              >
                <div>
                  <div className="font-medium">3 Paragraphs</div>
                  <div className="text-xs text-gray-500">Common length</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setConfig({...config, type: 'words', count: 10})}
                variant="outline"
                className="text-left"
              >
                <div>
                  <div className="font-medium">10 Words</div>
                  <div className="text-xs text-gray-500">Short text</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setConfig({...config, type: 'lists', count: 5, htmlFormat: true})}
                variant="outline"
                className="text-left"
              >
                <div>
                  <div className="font-medium">HTML List</div>
                  <div className="text-xs text-gray-500">5 items</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              About Lorem Ipsum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                It has been the industry's standard dummy text ever since the 1500s, when 
                an unknown printer took a galley of type and scrambled it to make a type 
                specimen book.
              </p>
              <p>
                The text is derived from Cicero's "De finibus bonorum et malorum" (The 
                Extremes of Good and Evil), written in 45 BC. It's used as placeholder 
                text in design and development to focus on layout rather than content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}