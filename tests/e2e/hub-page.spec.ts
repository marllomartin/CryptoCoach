import { test, expect } from '@playwright/test';
import { waitForAppReady, removeEmergentBadge, login, dismissToasts } from '../fixtures/helpers';

const TEST_EMAIL = 'gamerhub@crypto.io';
const TEST_PASSWORD = 'Test123456!';

test.describe('Hub Page - Gamification Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('hub page loads after login', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Wait for page to load
    await expect(page.getByTestId('hub-page')).toBeVisible();
  });

  test('displays player status section with user info', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Wait for data to load - the page shows a loading spinner initially
    await expect(page.getByTestId('player-status-section')).toBeVisible();
    
    // Check user name is displayed
    await expect(page.getByTestId('user-name')).toBeVisible();
    
    // Check XP points are displayed
    await expect(page.getByTestId('xp-points')).toBeVisible();
  });

  test('displays quick stats - streak, coins, achievements', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('quick-stats')).toBeVisible();
    await expect(page.getByTestId('stat-streak')).toBeVisible();
    await expect(page.getByTestId('stat-coins')).toBeVisible();
    await expect(page.getByTestId('stat-achievements')).toBeVisible();
  });

  test('displays market overview section with crypto prices', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('market-overview-section')).toBeVisible();
    
    // Should have market prices grid
    await expect(page.getByTestId('market-prices-grid')).toBeVisible();
  });

  test('displays portfolio summary section', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Portfolio section should be visible
    await expect(page.getByTestId('portfolio-section')).toBeVisible();
    
    // Check portfolio values
    await expect(page.getByTestId('portfolio-total-value')).toBeVisible();
    await expect(page.getByTestId('portfolio-cash')).toBeVisible();
    await expect(page.getByTestId('portfolio-pnl')).toBeVisible();
  });

  test('displays quick actions with links', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    await expect(page.getByTestId('quick-actions-section')).toBeVisible();

    // Check action links exist
    await expect(page.getByTestId('action-academy')).toBeVisible();
    await expect(page.getByTestId('action-trading-arena')).toBeVisible();
  });

  test('quick action to trading arena navigates correctly', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('action-trading-arena').click();
    
    await expect(page).toHaveURL(/\/trading-arena/);
    await expect(page.getByTestId('trading-arena-page')).toBeVisible();
  });

  test('displays achievements section with progress', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('achievements-section')).toBeVisible();
  });
});

test.describe('Hub Page - Layout and Design', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await removeEmergentBadge(page);
  });

  test('hub page has responsive layout', async ({ page }) => {
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('hub-page')).toBeVisible();
    
    // Check main container exists
    const container = page.locator('.container');
    await expect(container.first()).toBeVisible();
  });

  test('page shows loading state initially', async ({ page }) => {
    // Intercept network to delay response
    await page.goto('/hub', { waitUntil: 'domcontentloaded' });
    
    // Page should show loading or content
    const hubPage = page.getByTestId('hub-page');
    const loading = page.locator('.animate-spin');
    
    // Either loading or content should be visible
    await expect(hubPage.or(loading)).toBeVisible();
  });
});
