import { expect, test } from '@playwright/test'

test.describe('Tools Page', () => {
  test('should load tools page correctly', async ({ page }) => {
    await page.goto('/tools')

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/All Developer Tools/)

    // Check for main heading
    await expect(page.getByRole('heading', { name: /All Developer Tools/i })).toBeVisible()

    // Check for tools grid
    await expect(page.locator('[data-testid="tools-grid"]')).toBeVisible()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/tools')

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Browse our complete collection/)

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /All Developer Tools/)

    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute('href', /\/tools/)
  })

  test('should display tools in categories', async ({ page }) => {
    await page.goto('/tools')

    // Check for category headings
    const categoryHeadings = page.getByRole('heading', { level: 2 })
    const headingCount = await categoryHeadings.count()
    expect(headingCount).toBeGreaterThan(0)

    // Check for tool cards
    const toolCards = page.locator('[data-testid="tool-card"]')
    const toolCount = await toolCards.count()
    expect(toolCount).toBeGreaterThan(0)
  })

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/tools')

    // Find search input
    const searchInput = page.getByPlaceholder(/search tools/i)
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('json')

    // Check if results are filtered
    const toolCards = page.locator('[data-testid="tool-card"]')
    const toolCount = await toolCards.count()
    expect(toolCount).toBeGreaterThan(0)

    // Check if JSON-related tools are visible
    await expect(page.getByText(/json/i).first()).toBeVisible()
  })

  test('should have working category filters', async ({ page }) => {
    await page.goto('/tools')

    // Find category filter buttons
    const categoryButtons = page.getByRole('button', { name: /category/i })
    const buttonCount = await categoryButtons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // Click on a category filter
    await categoryButtons.first().click()

    // Check if tools are filtered
    const toolCards = page.locator('[data-testid="tool-card"]')
    const toolCount = await toolCards.count()
    expect(toolCount).toBeGreaterThan(0)
  })

  test('should have accessible tool cards', async ({ page }) => {
    await page.goto('/tools')

    // Check for tool cards with proper ARIA labels
    const toolCards = page.locator('[data-testid="tool-card"]')
    const firstCard = toolCards.first()

    await expect(firstCard).toHaveAttribute('aria-label')

    // Check for keyboard navigation
    await firstCard.focus()
    await expect(firstCard).toBeFocused()

    // Check for proper heading structure
    const headings = page.getByRole('heading')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/tools')

    // Check if tools grid is responsive
    const toolCards = page.locator('[data-testid="tool-card"]')
    await expect(toolCards.first()).toBeVisible()

    // Check if search is accessible on mobile
    const searchInput = page.getByPlaceholder(/search tools/i)
    await expect(searchInput).toBeVisible()
  })

  test('should have proper structured data', async ({ page }) => {
    await page.goto('/tools')

    // Check for JSON-LD structured data
    const jsonLdScripts = page.locator('script[type="application/ld+json"]')
    const scriptCount = await jsonLdScripts.count()
    expect(scriptCount).toBeGreaterThan(0)

    // Check if structured data contains expected content
    const firstScript = jsonLdScripts.first()
    const scriptContent = await firstScript.textContent()
    expect(scriptContent).toContain('@context')
    expect(scriptContent).toContain('@type')
  })
})
