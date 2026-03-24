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

test.describe('i18n - Hub Page Translations', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Navigate to Hub
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should display Hub page in English by default', async ({ page }) => {
    // Verify English labels
    await expect(page.getByText('Daily Quests')).toBeVisible();
    await expect(page.getByText('Quick Actions')).toBeVisible();
  });

  test('should translate Hub page to French', async ({ page }) => {
    // Switch to French
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // Verify French translations
    await expect(page.getByText('Quêtes Quotidiennes')).toBeVisible();
    await expect(page.getByText('Actions Rapides')).toBeVisible();
  });

  test('should translate Hub page to Arabic with RTL', async ({ page }) => {
    // Switch to Arabic
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-ar').click();
    await page.waitForTimeout(1000);
    
    // Verify RTL direction
    const htmlDir = await page.evaluate(() => document.documentElement.dir);
    expect(htmlDir).toBe('rtl');
    
    // Verify Arabic text visible
    await expect(page.getByText('المهام اليومية')).toBeVisible();
    await expect(page.getByText('إجراءات سريعة')).toBeVisible();
  });
});

test.describe('i18n - Crypto Quest Page Translations', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('should display Crypto Quest in English', async ({ page }) => {
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Verify English title
    await expect(page.getByTestId('quest-title')).toContainText('Crypto Quest');
    await expect(page.getByTestId('quest-subtitle')).toContainText('Your journey to becoming a crypto master');
    
    // Verify chapter name in English
    await expect(page.getByText('The Beginning')).toBeVisible();
  });

  test('should translate Crypto Quest to French', async ({ page }) => {
    // Go to Crypto Quest first
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Switch to French
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // Verify French translations
    await expect(page.getByTestId('quest-subtitle')).toContainText('Votre parcours pour devenir un maître crypto');
    
    // Verify chapter name in French
    await expect(page.getByText('Le Commencement')).toBeVisible();
  });

  test('should translate mission titles based on language', async ({ page }) => {
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // English mission title
    await expect(page.getByText('What is Cryptocurrency?')).toBeVisible();
    
    // Switch to French
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // French mission title
    await expect(page.getByText("Qu'est-ce que la Cryptomonnaie ?")).toBeVisible();
  });
});
