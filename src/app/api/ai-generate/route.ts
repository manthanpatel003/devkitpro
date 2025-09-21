import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Gemini AI (using free tier)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key')

interface GenerateRequest {
  type: string
  input: string
  options?: Record<string, any>
}

interface GenerateResponse {
  content: string
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const { type, input, options = {} }: GenerateRequest = await req.json()

    if (!input?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input text is required',
          content: '',
        },
        { status: 400 }
      )
    }

    // For demo purposes, provide intelligent responses without API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'demo-key') {
      const demoResponse = generateDemoResponse(type, input, options)
      return NextResponse.json({
        success: true,
        content: demoResponse,
        metadata: { demo: true },
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompts: Record<string, string> = {
      'meta-description': `Write a compelling 150-160 character meta description for this content. Focus on benefits and include a call to action: ${input}`,
      'seo-title': `Create an SEO-optimized title tag (50-60 characters) for this content. Make it clickable and include primary keywords: ${input}`,
      'social-post': `Create ${options.platform || 'general'} social media posts for this content. Make them engaging with relevant hashtags: ${input}`,
      humanize: `Rewrite this AI-generated text to sound more human, conversational, and natural while maintaining the key information: ${input}`,
      keywords: `Generate 10 relevant SEO keywords and phrases for this content. Include primary, secondary, and long-tail keywords: ${input}`,
      'content-optimize': `Analyze and suggest improvements for this content. Focus on readability, SEO, and engagement: ${input}`,
      'blog-outline': `Create a detailed blog post outline with H2 and H3 headings for this topic: ${input}`,
      'email-subject': `Generate 5 compelling email subject lines for this content. Make them attention-grabbing and click-worthy: ${input}`,
      'ad-copy': `Write persuasive ad copy for ${options.platform || 'Google Ads'} with a strong call-to-action: ${input}`,
      'product-description': `Write a compelling product description that highlights benefits and addresses customer pain points: ${input}`,
    }

    const prompt = prompts[type] || `Help with this content: ${input}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        type,
        inputLength: input.length,
        outputLength: content.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('AI Generation Error:', error)

    // Fallback to demo response on error
    const demoResponse = generateDemoResponse(
      (await req.json()).type || 'general',
      (await req.json()).input || '',
      (await req.json()).options || {}
    )

    return NextResponse.json({
      success: true,
      content: demoResponse,
      metadata: { fallback: true, error: error.message },
    })
  }
}

function generateDemoResponse(type: string, input: string, options: Record<string, any>): string {
  const responses: Record<string, (input: string, options: any) => string> = {
    'meta-description': input =>
      `Discover ${input.slice(0, 50)}... - Professional tools and insights to boost your productivity. Get started free today!`,

    'seo-title': input => `${input.slice(0, 40)} - Free Professional Tools`,

    'social-post': (input, opts) => {
      const platform = opts.platform || 'general'
      const hashtags =
        platform === 'twitter' ? '#productivity #tools #free' : '#productivity #business #tools'
      return `🚀 ${input.slice(0, 100)}...\n\nDiscover powerful tools to boost your workflow!\n\n${hashtags}`
    },

    humanize: input =>
      input.replace(/\b(utilize|facilitate|implement|optimize)\b/g, match => {
        const replacements: Record<string, string> = {
          utilize: 'use',
          facilitate: 'help with',
          implement: 'set up',
          optimize: 'improve',
        }
        return replacements[match] || match
      }),

    keywords: input => {
      const baseKeywords = input.toLowerCase().split(/\s+/).slice(0, 3)
      return [
        ...baseKeywords,
        ...baseKeywords.map(k => `${k} tool`),
        ...baseKeywords.map(k => `free ${k}`),
        ...baseKeywords.map(k => `${k} online`),
      ]
        .slice(0, 10)
        .join(', ')
    },

    'content-optimize': input =>
      `Content Analysis:\n\n✅ Strengths:\n- Clear topic focus\n- Good length (${input.length} characters)\n\n🔧 Suggestions:\n- Add more specific examples\n- Include actionable tips\n- Improve readability with shorter paragraphs\n- Add relevant keywords naturally`,

    'blog-outline': input =>
      `# ${input}\n\n## Introduction\n- Hook: Compelling opening\n- Problem statement\n- Solution preview\n\n## Main Content\n### Key Point 1\n### Key Point 2\n### Key Point 3\n\n## Practical Tips\n### Implementation steps\n### Best practices\n\n## Conclusion\n- Summary of benefits\n- Call to action`,

    'email-subject': input =>
      `1. 🚀 ${input.slice(0, 30)}... (Don't Miss This!)\n2. Quick Win: ${input.slice(0, 35)}...\n3. [FREE] ${input.slice(0, 40)}...\n4. 5 Minutes to ${input.slice(0, 35)}...\n5. ${input.slice(0, 45)}... ⚡`,

    'ad-copy': (input, opts) => {
      const platform = opts.platform || 'Google Ads'
      return `🎯 ${input.slice(0, 50)}...\n\n✅ Professional results\n✅ Easy to use\n✅ 100% Free\n\n👉 Try it now - No signup required!\n\n#${platform.replace(/\s+/g, '')} #FreeTools #Productivity`
    },

    'product-description': input =>
      `Transform your workflow with ${input}.\n\n🌟 Key Benefits:\n• Save time and increase productivity\n• Professional-grade results\n• User-friendly interface\n• Completely free to use\n\n💡 Perfect for developers, marketers, and content creators who want to streamline their work process.\n\n🚀 Get started in seconds - no registration required!`,
  }

  const generator = responses[type] || (input => `Here's helpful content for: ${input}`)
  return generator(input, options)
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
