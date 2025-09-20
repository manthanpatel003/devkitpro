import { CTASection } from '@/components/landing/CTASection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { generateStructuredData } from '@/lib/seo-config'

export default function HomePage() {
  const faqData = [
    {
      question: 'Are these developer tools completely free?',
      answer:
        'Yes! All 20+ tools are completely free to use with no hidden costs, subscriptions, or signup requirements.',
    },
    {
      question: 'Do you store or collect my data?',
      answer:
        "No, we prioritize your privacy. Most tools work entirely in your browser, and we don't store or collect any of your data.",
    },
    {
      question: 'Can I use these tools offline?',
      answer:
        'Many of our tools work offline once loaded, including JSON formatter, Base64 encoder, and text utilities.',
    },
    {
      question: 'Are these tools safe for sensitive data?',
      answer:
        'Yes! Since most processing happens in your browser, your sensitive data never leaves your device.',
    },
  ]

  const howToSteps = [
    {
      name: 'Choose a Tool',
      text: 'Browse our collection of 20+ developer tools organized by category',
    },
    { name: 'Enter Your Data', text: "Paste or type your content into the tool's input field" },
    {
      name: 'Get Instant Results',
      text: 'See formatted, processed, or analyzed results immediately',
    },
    { name: 'Copy or Download', text: 'Copy results to clipboard or download as files' },
  ]

  const faqStructuredData = generateStructuredData.faq(faqData)
  const howToStructuredData = generateStructuredData.howTo(
    'DevTools Hub',
    'How to use our free developer tools and utilities',
    howToSteps
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToStructuredData),
        }}
      />

      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
