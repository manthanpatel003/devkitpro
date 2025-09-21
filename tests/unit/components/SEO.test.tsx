import { SEO } from '@/components/layout/SEO'
import { render } from '@testing-library/react'

describe('SEO Component', () => {
  it('renders basic meta tags correctly', () => {
    render(
      <SEO
        title="Test Page"
        description="Test description"
        canonical="/test"
        keywords={['test', 'seo']}
      />
    )

    // Check if title is rendered
    expect(document.title).toBe('Test Page | Ultimate Tools Suite')
  })

  it('renders with default values when no props provided', () => {
    render(<SEO />)

    expect(document.title).toBe('Ultimate Tools Suite - 35+ Free Online Tools')
  })

  it('renders Open Graph meta tags', () => {
    render(
      <SEO
        title="Test Page"
        description="Test description"
        openGraph={{
          title: 'OG Title',
          description: 'OG Description',
          url: 'https://example.com/test',
          type: 'website',
        }}
      />
    )

    // Check for Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')
    const ogType = document.querySelector('meta[property="og:type"]')

    expect(ogTitle).toHaveAttribute('content', 'OG Title')
    expect(ogDescription).toHaveAttribute('content', 'OG Description')
    expect(ogUrl).toHaveAttribute('content', 'https://example.com/test')
    expect(ogType).toHaveAttribute('content', 'website')
  })

  it('renders Twitter Card meta tags', () => {
    render(
      <SEO
        title="Test Page"
        description="Test description"
        twitter={{
          card: 'summary_large_image',
          site: '@test',
          creator: '@test',
          title: 'Twitter Title',
          description: 'Twitter Description',
        }}
      />
    )

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterSite = document.querySelector('meta[name="twitter:site"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')

    expect(twitterCard).toHaveAttribute('content', 'summary_large_image')
    expect(twitterSite).toHaveAttribute('content', '@test')
    expect(twitterTitle).toHaveAttribute('content', 'Twitter Title')
  })

  it('renders JSON-LD structured data', () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Test Page',
    }

    render(<SEO title="Test Page" description="Test description" jsonLd={jsonLd} />)

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]')
    expect(jsonLdScript).toBeInTheDocument()
    expect(jsonLdScript?.textContent).toContain('Test Page')
  })

  it('handles noindex and nofollow correctly', () => {
    render(<SEO title="Test Page" description="Test description" noindex={true} nofollow={true} />)

    const robots = document.querySelector('meta[name="robots"]')
    expect(robots).toHaveAttribute(
      'content',
      'noindex,nofollow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
    )
  })

  it('renders article-specific Open Graph tags', () => {
    render(
      <SEO
        title="Test Article"
        description="Test article description"
        openGraph={{
          type: 'article',
        }}
        author="Test Author"
        publishedTime="2024-01-01T00:00:00Z"
        modifiedTime="2024-01-02T00:00:00Z"
        section="Technology"
        tags={['test', 'article']}
      />
    )

    const articlePublished = document.querySelector('meta[property="article:published_time"]')
    const articleModified = document.querySelector('meta[property="article:modified_time"]')
    const articleAuthor = document.querySelector('meta[property="article:author"]')
    const articleSection = document.querySelector('meta[property="article:section"]')
    const articleTags = document.querySelectorAll('meta[property="article:tag"]')

    expect(articlePublished).toHaveAttribute('content', '2024-01-01T00:00:00Z')
    expect(articleModified).toHaveAttribute('content', '2024-01-02T00:00:00Z')
    expect(articleAuthor).toHaveAttribute('content', 'Test Author')
    expect(articleSection).toHaveAttribute('content', 'Technology')
    expect(articleTags).toHaveLength(2)
  })
})
