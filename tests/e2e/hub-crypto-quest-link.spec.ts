import { test, expect } from '@playwright/test';

const BASE_URL = 'https://broker-briefing.preview.emergentagent.com';

test.describe('Hub Page - Crypto Quest Quick Action', () => {
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

  test('should display Crypto Quest in Quick Actions', async ({ page }) => {
    // Verify Quick Actions section
    await expect(page.getByTestId('quick-actions-section')).toBeVisible();
    
    // Verify Crypto Quest link
    await expect(page.getByTestId('action-crypto-quest')).toBeVisible();
    
    // Should show Crypto Quest label
    await expect(page.getByText('Crypto Quest')).toBeVisible();
  });

  test('should navigate to Crypto Quest from Hub', async ({ page }) => {
    // Click on Crypto Quest quick action
    await page.getByTestId('action-crypto-quest').click();
    
    // Should navigate to Crypto Quest page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/crypto-quest/);
    
    // Verify Crypto Quest page loaded
    await expect(page.getByTestId('crypto-quest-page')).toBeVisible();
  });

  test('should display Crypto Quest subtitle in Quick Actions', async ({ page }) => {
    const questAction = page.getByTestId('action-crypto-quest');
    
    // Should show the subtitle
    await expect(questAction).toContainText(/journey|master|crypto/i);
  });
});

test.describe('Hub Page - Multiple Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should display all Quick Actions', async ({ page }) => {
    // Crypto Quest
    await expect(page.getByTestId('action-crypto-quest')).toBeVisible();
    
    // Academy/Continue Learning
    await expect(page.getByTestId('action-academy')).toBeVisible();
    
    // Trading Arena
    await expect(page.getByTestId('action-trading-arena')).toBeVisible();
  });

  test('should navigate to Academy from Hub', async ({ page }) => {
    await page.getByTestId('action-academy').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/academy/);
  });

  test('should navigate to Trading Arena from Hub', async ({ page }) => {
    await page.getByTestId('action-trading-arena').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/trading-arena/);
  });
});

test.describe('Hub Page - i18n Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should translate Quick Actions to French', async ({ page }) => {
    // Switch to French
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-fr').click();
    await page.waitForTimeout(1000);
    
    // Verify French translations in Quick Actions
    await expect(page.getByText("Continuer l'apprentissage")).toBeVisible();
    await expect(page.getByText('Simulateur Pro')).toBeVisible();
  });

  test('should translate Quick Actions to Arabic', async ({ page }) => {
    // Switch to Arabic
    await page.getByTestId('language-switcher-btn').click();
    await page.getByTestId('lang-option-ar').click();
    await page.waitForTimeout(1000);
    
    // Verify Arabic translations
    await expect(page.getByText('إجراءات سريعة')).toBeVisible();
    await expect(page.getByText('متابعة التعلم')).toBeVisible();
  });
});
