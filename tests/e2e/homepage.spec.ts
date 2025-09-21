import { expect, test } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and display content correctly', async ({ page }) => {
    await page.goto('/')

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Ultimate Tools Suite/)

    // Check for main heading
    await expect(page.getByRole('heading', { name: /Ultimate Tools Suite/i })).toBeVisible()

    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible()

    // Check for footer
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/')

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Professional-grade online tools/)

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /Ultimate Tools Suite/)

    // Check Twitter Card tags
    const twitterCard = page.locator('meta[name="twitter:card"]')
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image')
  })

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()

    // Click theme toggle
    await themeToggle.click()

    // Check if dark class is applied to html element
    await expect(page.locator('html')).toHaveClass(/dark/)

    // Click again to toggle back
    await themeToggle.click()

    // Check if dark class is removed
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')

    // Check for skip link
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    if (await skipLink.isVisible()) {
      await skipLink.click()
      await expect(page.locator('main')).toBeFocused()
    }

    // Check navigation links
    const navLinks = page.getByRole('navigation').getByRole('link')
    const linkCount = await navLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check if mobile menu button is visible
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    await expect(mobileMenuButton).toBeVisible()

    // Check if main content is visible
    await expect(page.locator('main')).toBeVisible()
  })
})
