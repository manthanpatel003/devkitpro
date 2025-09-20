import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, input, options } = await request.json()
    
    if (!type || !input) {
      return NextResponse.json(
        { error: 'Type and input are required' },
        { status: 400 }
      )
    }

    // For now, return mock AI responses since we don't have API keys set up
    // In production, you would integrate with Google Gemini or another AI service
    const mockResponses: Record<string, string> = {
      'meta-description': `Discover ${input} with our comprehensive guide. Learn best practices, tips, and strategies to optimize your ${input} for maximum results.`,
      'seo-title': `${input} - Complete Guide & Best Practices 2024`,
      'social-post': `🚀 Excited to share insights about ${input}! Check out our latest guide covering everything you need to know. #${input.replace(/\s+/g, '')} #Guide`,
      'humanize': `Here's a more natural way to express that: ${input}. This approach feels more conversational and engaging for readers.`,
      'keywords': `Here are some relevant keywords for ${input}: ${input} guide, ${input} tips, ${input} best practices, ${input} tutorial, ${input} examples, ${input} strategies, ${input} optimization, ${input} techniques`,
      'content-optimize': `To optimize this content about ${input}, consider: 1) Adding more specific examples, 2) Including data and statistics, 3) Breaking up long paragraphs, 4) Adding relevant subheadings, 5) Including a clear call-to-action.`
    }

    const response = mockResponses[type] || `AI-generated content for ${input}`

    return NextResponse.json({
      content: response,
      success: true,
      type,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}