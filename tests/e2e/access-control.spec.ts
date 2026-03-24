import { test, expect } from '@playwright/test';
import { waitForAppReady, removeEmergentBadge, login } from '../fixtures/helpers';

test.describe('Subscription Access Control', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as free tier user first
    await login(page, 'test_subscription@example.com', 'Test123!');
  });

  test('free user sees subscription gate on Simulator page', async ({ page }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should see premium feature gate
    await expect(page.getByText('Fonctionnalité Premium')).toBeVisible();
    await expect(page.getByText(/Le Simulateur de Trading nécessite un abonnement/i)).toBeVisible();
    // Use first() to handle multiple occurrences of "Starter" on page
    await expect(page.getByText('Starter').first()).toBeVisible();
    
    // Should see upgrade button
    await expect(page.getByRole('link', { name: /Voir les abonnements/i })).toBeVisible();
  });

  test('free user sees subscription gate on AI Mentor page', async ({ page }) => {
    await page.goto('/mentor', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should see premium feature gate
    await expect(page.getByText('Fonctionnalité Premium')).toBeVisible();
    await expect(page.getByText(/L'AI Crypto Mentor.*nécessite un abonnement/i)).toBeVisible();
    // Use first() to handle multiple occurrences
    await expect(page.getByText('Elite').first()).toBeVisible();
    
    // Should see upgrade button
    await expect(page.getByRole('link', { name: /Voir les abonnements/i })).toBeVisible();
  });

  test('Simulator gate shows correct tier features (Starter)', async ({ page }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should show Starter tier details - use more specific selectors
    await expect(page.getByText('$9.99/mois')).toBeVisible();
    await expect(page.getByText(/Niveau 1 & 2/)).toBeVisible();
    await expect(page.getByText(/Quiz interactifs/)).toBeVisible();
    // Match the feature in the list with checkmark
    await expect(page.getByText(/✓.*Simulateur de Trading/)).toBeVisible();
  });

  test('AI Mentor gate shows correct tier features (Elite)', async ({ page }) => {
    await page.goto('/mentor', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should show Elite tier details
    await expect(page.getByText('$25.00/mois')).toBeVisible();
    await expect(page.getByText(/Accès complet/)).toBeVisible();
    // Match with the checkmark list item
    await expect(page.getByText(/✓.*AI Crypto Mentor/)).toBeVisible();
    await expect(page.getByText(/Contenu exclusif/)).toBeVisible();
  });

  test('subscription gate links to pricing page', async ({ page }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    const pricingLink = page.getByRole('link', { name: /Voir les abonnements/i });
    await expect(pricingLink).toBeVisible();
    
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});

test.describe('Academy Course Access Control', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, 'test_subscription@example.com', 'Test123!');
  });

  test('free user can see academy page with courses', async ({ page }) => {
    await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Should see the academy page title
    await expect(page.getByText(/Your Path to.*Crypto Mastery/i)).toBeVisible();
    
    // Should see Level 1 course (available to free tier)
    await expect(page.getByText('Crypto Foundations')).toBeVisible();
    await expect(page.getByText('Level 1').first()).toBeVisible();
  });

  test('free user sees lock overlay on Level 2 course', async ({ page }) => {
    await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Wait for courses to load
    await page.waitForSelector('text=Crypto Foundations');
    
    // Level 2 and 3 should show subscription required overlay
    await expect(page.getByText('Abonnement requis').first()).toBeVisible();
    await expect(page.getByText('Starter ou supérieur')).toBeVisible();
  });

  test('free user sees lock overlay on Level 3 course', async ({ page }) => {
    await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Wait for courses to load
    await page.waitForSelector('text=Crypto Foundations');
    
    // Level 3 should require Pro or higher
    await expect(page.getByText('Pro ou supérieur')).toBeVisible();
  });
});

test.describe('Unauthenticated Access Control', () => {

  test('unauthenticated user is redirected to login for Simulator', async ({ page }) => {
    await page.goto('/simulator', { waitUntil: 'domcontentloaded' });
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user is redirected to login for Mentor', async ({ page }) => {
    await page.goto('/mentor', { waitUntil: 'domcontentloaded' });
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user can see academy but Level 2+ is locked', async ({ page }) => {
    await page.goto('/academy', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Academy is public
    await expect(page.getByText(/Your Path to.*Crypto Mastery/i)).toBeVisible();
    
    // Wait for courses to load
    await page.waitForSelector('text=Crypto Foundations');
    
    // Level 2+ should show sign-in overlay for unauthenticated users
    // Use first() to handle multiple occurrences
    await expect(page.getByText('Sign in to access').first()).toBeVisible();
  });
});
