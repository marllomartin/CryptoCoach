import { test, expect } from '@playwright/test';

const BASE_URL = 'https://broker-briefing.preview.emergentagent.com';

test.describe('i18n - Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Go to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  });

  test('should display language switcher in header', async ({ page }) => {
    const langSwitcher = page.getByTestId('language-switcher-btn');
    await expect(langSwitcher).toBeVisible();
  });

  test('should switch to French language', async ({ page }) => {
    // Open language dropdown
    await page.getByTestId('language-switcher-btn').click();
    await page.waitForTimeout(500);
    
    // Verify dropdown options visible
    await expect(page.getByTestId('lang-option-en')).toBeVisible();
    await expect(page.getByTestId('lang-option-fr')).toBeVisible();
    await expect(page.getByTestId('lang-option-ar')).toBeVisible();
    
    // Select French
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // Verify French navigation items
    await expect(page.getByRole('link', { name: /Académie/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Tarifs/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Glossaire/i })).toBeVisible();
  });

  test('should switch to Arabic and apply RTL layout', async ({ page }) => {
    // Open language dropdown
    await page.getByTestId('language-switcher-btn').click();
    await page.waitForTimeout(500);
    
    // Select Arabic
    await page.getByTestId('lang-option-ar').click();
    await page.waitForTimeout(1000);
    
    // Verify document direction is RTL
    const htmlDir = await page.evaluate(() => document.documentElement.dir);
    expect(htmlDir).toBe('rtl');
    
    // Verify Arabic language attribute
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    expect(htmlLang).toBe('ar');
    
    // Verify Arabic navigation visible
    await expect(page.getByRole('link', { name: /الأكاديمية/i })).toBeVisible();
  });

  test('should switch back to English from French', async ({ page }) => {
    // Switch to French first
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // Switch back to English
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-en').click();
    await page.waitForTimeout(1000);
    
    // Verify English navigation (use navigation selector to avoid footer duplicate)
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Academy' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Pricing' })).toBeVisible();
  });
});

