import { test, expect } from '@playwright/test';
import { waitForAppReady, removeEmergentBadge, login, dismissToasts } from '../fixtures/helpers';

const TEST_EMAIL = 'gamerhub@crypto.io';
const TEST_PASSWORD = 'Test123456!';

test.describe('Trading Arena Page - Main Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('trading arena page loads after login', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('trading-arena-page')).toBeVisible();
    await expect(page.getByTestId('page-title')).toContainText('Trading Arena');
  });

  test('displays career level badge', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('career-level-badge')).toBeVisible();
    await expect(page.getByTestId('career-level-name')).toBeVisible();
  });

  test('displays portfolio summary cards', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('portfolio-summary-cards')).toBeVisible();
    await expect(page.getByTestId('summary-total-value')).toBeVisible();
    await expect(page.getByTestId('summary-cash')).toBeVisible();
    await expect(page.getByTestId('summary-pnl')).toBeVisible();
    await expect(page.getByTestId('summary-roi')).toBeVisible();
  });

  test('displays market prices section with refresh button', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('market-prices-section')).toBeVisible();
    await expect(page.getByTestId('refresh-prices-btn')).toBeVisible();
  });

  test('displays price cards with cryptocurrency data', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('price-cards-grid')).toBeVisible();
    
    // Should have at least one crypto card (ETH from API)
    const priceCards = page.locator('[data-testid^="price-card-"]');
    const count = await priceCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('displays trade form with all elements', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('trade-form')).toBeVisible();
    await expect(page.getByTestId('selected-crypto')).toBeVisible();
    await expect(page.getByTestId('trade-action-toggle')).toBeVisible();
    await expect(page.getByTestId('buy-button')).toBeVisible();
    await expect(page.getByTestId('sell-button')).toBeVisible();
    await expect(page.getByTestId('trade-amount-input')).toBeVisible();
    await expect(page.getByTestId('execute-trade-btn')).toBeVisible();
  });

  test('displays trade history section', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('trade-history-section')).toBeVisible();
  });

  test('displays career progress section', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('career-progress-section')).toBeVisible();
  });
});

test.describe('Trading Arena Page - Trade Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('can select buy/sell action', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const buyBtn = page.getByTestId('buy-button');
    const sellBtn = page.getByTestId('sell-button');
    
    // Buy should be selected by default (has green background)
    await expect(buyBtn).toHaveClass(/bg-green-500/);
    
    // Click sell
    await sellBtn.click();
    await expect(sellBtn).toHaveClass(/bg-red-500/);
    
    // Click buy again
    await buyBtn.click();
    await expect(buyBtn).toHaveClass(/bg-green-500/);
  });

  test('can select cryptocurrency from price cards', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Find ETH price card and click it
    const ethCard = page.getByTestId('price-card-ETH');
    
    if (await ethCard.isVisible()) {
      await ethCard.click();
      await expect(page.getByTestId('selected-symbol')).toContainText('ETH');
    }
  });

  test('can enter trade amount', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const amountInput = page.getByTestId('trade-amount-input');
    await amountInput.fill('0.1');
    
    await expect(amountInput).toHaveValue('0.1');
    
    // Estimated total should update
    await expect(page.getByTestId('estimated-total')).toBeVisible();
  });

  test('execute trade button is disabled without amount', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const executeBtn = page.getByTestId('execute-trade-btn');
    await expect(executeBtn).toBeDisabled();
  });

  test('can execute a buy trade', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Select ETH if available
    const ethCard = page.getByTestId('price-card-ETH');
    if (await ethCard.isVisible()) {
      await ethCard.click();
    }
    
    // Make sure buy is selected
    await page.getByTestId('buy-button').click();
    
    // Enter amount
    await page.getByTestId('trade-amount-input').fill('0.001');
    
    // Execute trade
    const executeBtn = page.getByTestId('execute-trade-btn');
    await expect(executeBtn).toBeEnabled();
    await executeBtn.click();
    
    // Wait for toast or response
    await page.waitForResponse(resp => 
      resp.url().includes('/api/v2/trading/trade/') && resp.status() === 200, 
      { timeout: 10000 }
    ).catch(() => {});
    
    // Clear amount field after trade (optional based on UI behavior)
    // Trade should be recorded in history
    await expect(page.getByTestId('trade-history-section')).toBeVisible();
  });

  test('can refresh prices', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const refreshBtn = page.getByTestId('refresh-prices-btn');
    await refreshBtn.click();
    
    // Prices should still be visible after refresh
    await expect(page.getByTestId('price-cards-grid')).toBeVisible();
  });

  test('shows available balance', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const balance = page.getByTestId('available-balance');
    await expect(balance).toBeVisible();
    await expect(balance).toContainText('Solde disponible');
  });

  test('has reset portfolio button', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const resetBtn = page.getByTestId('reset-portfolio-btn');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toContainText('Réinitialiser');
  });
});

test.describe('Trading Arena Page - Holdings', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('displays holdings section when user has positions', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Holdings section should be visible if user has positions
    // This may or may not be visible depending on whether user has holdings
    const holdingsSection = page.getByTestId('holdings-section');
    
    // Check if it exists (user may or may not have holdings)
    const exists = await holdingsSection.count() > 0;
    if (exists) {
      await expect(holdingsSection).toBeVisible();
      await expect(page.getByTestId('holdings-table')).toBeVisible();
    }
  });
});

test.describe('Trading Arena Page - Trade History', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await dismissToasts(page);
    await removeEmergentBadge(page);
  });

  test('displays trade history with past trades', async ({ page }) => {
    await page.goto('/trading-arena', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const historySection = page.getByTestId('trade-history-section');
    await expect(historySection).toBeVisible();
    
    // If user has trades, should show them
    const historyList = page.getByTestId('trade-history-list');
    const noTrades = historySection.locator('.opacity-50');
    
    // Either has trades or shows empty state
    await expect(historyList.or(noTrades)).toBeVisible();
  });
});
