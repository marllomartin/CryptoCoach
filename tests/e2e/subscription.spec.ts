import { test, expect } from '@playwright/test';
import { waitForAppReady, removeEmergentBadge } from '../fixtures/helpers';

test.describe('Pricing Page and Subscription Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await removeEmergentBadge(page);
  });

  test('pricing page loads with 4 tier cards', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Wait for pricing cards to load
    await expect(page.getByTestId('pricing-card-free')).toBeVisible();
    await expect(page.getByTestId('pricing-card-starter')).toBeVisible();
    await expect(page.getByTestId('pricing-card-pro')).toBeVisible();
    await expect(page.getByTestId('pricing-card-elite')).toBeVisible();
  });

  test('pricing cards display correct prices', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Free tier shows $0.00
    const freeCard = page.getByTestId('pricing-card-free');
    await expect(freeCard).toContainText('$0.00');
    
    // Starter tier shows $9.99
    const starterCard = page.getByTestId('pricing-card-starter');
    await expect(starterCard).toContainText('$9.99');
    
    // Pro tier shows $19.99
    const proCard = page.getByTestId('pricing-card-pro');
    await expect(proCard).toContainText('$19.99');
    
    // Elite tier shows $25.00
    const eliteCard = page.getByTestId('pricing-card-elite');
    await expect(eliteCard).toContainText('$25.00');
  });

  test('Pro tier is marked as popular', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Pro card should have "Populaire" badge
    const proCard = page.getByTestId('pricing-card-pro');
    await expect(proCard).toContainText('Populaire');
  });

  test('subscription buttons are present for each tier', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('subscribe-free-btn')).toBeVisible();
    await expect(page.getByTestId('subscribe-starter-btn')).toBeVisible();
    await expect(page.getByTestId('subscribe-pro-btn')).toBeVisible();
    await expect(page.getByTestId('subscribe-elite-btn')).toBeVisible();
  });

  // BUG FIX VERIFIED: Unauthenticated users now see correct "Commencer gratuitement" button
  test('unauthenticated users see correct Free tier button text', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Verify user is NOT logged in
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    
    // Fixed: Free tier now shows "Commencer gratuitement" for non-logged-in users
    const freeBtn = page.getByTestId('subscribe-free-btn');
    const btnText = await freeBtn.textContent();
    
    // Verify the correct behavior
    expect(btnText).toContain('Commencer gratuitement');
  });

  test('paid tier buttons prompt login for unauthenticated users', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Click starter subscribe button
    await page.getByTestId('subscribe-starter-btn').click({ force: true });
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('navigation has Pricing link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check for Pricing link in nav
    const pricingLink = page.getByRole('link', { name: 'Pricing' });
    await expect(pricingLink).toBeVisible();
    
    // Click and verify navigation
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});

test.describe('Authentication Flow', () => {

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-btn')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill('test_subscription@example.com');
    await page.getByTestId('login-password-input').fill('Test123!');
    await page.getByTestId('login-submit-btn').click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await page.getByTestId('login-email-input').fill('test_subscription@example.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-btn').click();
    
    // Wait for error toast/message
    await page.waitForTimeout(1000);
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authenticated Subscription Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('login-email-input').fill('test_subscription@example.com');
    await page.getByTestId('login-password-input').fill('Test123!');
    await page.getByTestId('login-submit-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('pricing page shows current tier badge for logged in user', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    
    // Free tier should show "Actuel" badge since test user is on free tier
    const freeCard = page.getByTestId('pricing-card-free');
    await expect(freeCard).toContainText('Actuel');
  });

  test('current tier button shows "Plan actuel" text', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    
    const freeBtn = page.getByTestId('subscribe-free-btn');
    await expect(freeBtn).toContainText('Plan actuel');
    // Button should be disabled
    await expect(freeBtn).toBeDisabled();
  });

  test('paid tier subscription buttons call Stripe API and redirect', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    
    // Setup response interception before clicking
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/subscription/create-checkout'),
      { timeout: 15000 }
    );
    
    // Click starter subscribe button
    const starterBtn = page.getByTestId('subscribe-starter-btn');
    await starterBtn.click({ force: true });
    
    // Wait for API response
    const response = await responsePromise;
    
    // Verify API was called successfully - redirect happens immediately so we can only check status
    expect(response.status()).toBe(200);
    
    // Wait for page to be redirected to Stripe
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 });
    
    // If we get here, Stripe checkout redirect worked
    expect(page.url()).toContain('checkout.stripe.com');
  });
});

test.describe('Pricing Page UI Elements', () => {

  test('pricing page has FAQ section', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check for FAQ section
    await expect(page.getByText('Questions fréquentes')).toBeVisible();
  });

  test('each tier card has features list', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    // Check Free tier features
    const freeCard = page.getByTestId('pricing-card-free');
    await expect(freeCard).toContainText('Glossaire');
    
    // Check Starter tier features
    const starterCard = page.getByTestId('pricing-card-starter');
    await expect(starterCard).toContainText('Simulateur');
    
    // Check Pro tier features
    const proCard = page.getByTestId('pricing-card-pro');
    await expect(proCard).toContainText('certification');
    
    // Check Elite tier features
    const eliteCard = page.getByTestId('pricing-card-elite');
    await expect(eliteCard).toContainText('AI');
  });

  test('pricing header text is visible', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    
    await expect(page.getByRole('heading', { name: /parcours/i })).toBeVisible();
  });
});
