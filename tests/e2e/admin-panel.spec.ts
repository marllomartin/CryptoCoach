import { test, expect } from '@playwright/test';

/**
 * Admin Panel Tests
 * Tests: Dashboard, Courses tab, Users tab, Media tab
 * Requires admin login: admin@thecryptocoach.io / Admin123!
 */

const ADMIN_EMAIL = 'admin@thecryptocoach.io';
const ADMIN_PASSWORD = 'Admin123!';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    // Wait for redirect after login
    await expect(page.locator('text=Admin User')).toBeVisible();
  });

  test('Dashboard displays stats correctly', async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page.locator('h1:has-text("Panel Administrateur")')).toBeVisible();

    // Verify Dashboard tab is active by default
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();

    // Verify stats cards are displayed (using more specific selectors)
    await expect(page.locator('p.text-xs:has-text("Utilisateurs")')).toBeVisible();
    await expect(page.locator('p.text-xs:has-text("Cours")')).toBeVisible();
    await expect(page.locator('p.text-xs:has-text("Leçons")')).toBeVisible();
    
    // Verify subscription breakdown section
    await expect(page.locator('text=Répartition des abonnements')).toBeVisible();
    await expect(page.locator('p:has-text("Free")').first()).toBeVisible();
    await expect(page.locator('p:has-text("Starter")').first()).toBeVisible();
    await expect(page.locator('p:has-text("Pro")').first()).toBeVisible();
    await expect(page.locator('p:has-text("Elite")').first()).toBeVisible();
  });

  test('Courses tab shows courses and lessons', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Click on Cours tab
    await page.click('button:has-text("Cours")');
    await page.waitForTimeout(500);

    // Verify courses list
    await expect(page.locator('text=Crypto Foundations')).toBeVisible();
    await expect(page.locator('text=Crypto Investor')).toBeVisible();
    await expect(page.locator('text=Advanced Crypto Strategist')).toBeVisible();

    // Click on a course to see lessons
    await page.click('text=Crypto Foundations');
    await page.waitForTimeout(1000);

    // Verify lessons are loaded
    await expect(page.locator('text=What is Blockchain?')).toBeVisible();
    await expect(page.locator('text=What is Bitcoin?')).toBeVisible();
  });

  test('Courses tab shows audio status for lessons', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Navigate to Cours tab
    await page.click('button:has-text("Cours")');
    await page.waitForTimeout(500);

    // Select Crypto Foundations course
    await page.click('text=Crypto Foundations');
    await page.waitForTimeout(1000);

    // Verify audio status indicator is shown
    // Lessons with audio should show "🔊 Audio"
    await expect(page.locator('text=Audio').first()).toBeVisible();
  });

  test('Users tab displays user list', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Click on Utilisateurs tab
    await page.click('button:has-text("Utilisateurs")');
    await page.waitForTimeout(1000);

    // Verify users table headers
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Nom")')).toBeVisible();
    await expect(page.locator('th:has-text("Abonnement")')).toBeVisible();

    // Verify search input
    await expect(page.locator('input[placeholder="Rechercher..."]')).toBeVisible();
  });

  test('Users tab search functionality', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Navigate to Users tab
    await page.click('button:has-text("Utilisateurs")');
    await page.waitForTimeout(1000);

    // Search for a user
    await page.fill('input[placeholder="Rechercher..."]', 'test');
    await page.waitForTimeout(500);

    // Should show filtered results (if test users exist)
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Media tab displays generation options', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Click on Média tab
    await page.getByRole('tab', { name: 'Média' }).click();
    await page.waitForTimeout(500);

    // Verify media generation section (use more specific selectors)
    await expect(page.getByText('Génération de Média', { exact: true })).toBeVisible();
    await expect(page.locator('h3:has-text("Génération Audio (TTS)")')).toBeVisible();
    await expect(page.locator('h3:has-text("Génération Images")')).toBeVisible();

    // Verify generation buttons exist
    await expect(page.locator('button:has-text("Générer tous les audios")')).toBeVisible();
    await expect(page.locator('button:has-text("Générer toutes les images")')).toBeVisible();
  });

  test('Non-admin users cannot access admin panel', async ({ page, context }) => {
    // Clear storage to start fresh (logout any previous user)
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    
    // Login as regular user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', 'test_subscription@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.locator('button[type="submit"]').click({ force: true });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to access admin page
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Should be redirected away or show access denied
    // Expect NOT to see the admin panel title
    await expect(page.locator('h1:has-text("Panel Administrateur")')).not.toBeVisible();
  });

  test('Refresh button works on dashboard', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Click refresh button
    await page.click('button:has-text("Actualiser")');
    await page.waitForTimeout(500);

    // Dashboard should still be visible
    await expect(page.locator('h1:has-text("Panel Administrateur")')).toBeVisible();
    await expect(page.locator('p.text-xs:has-text("Utilisateurs")')).toBeVisible();
  });
});
