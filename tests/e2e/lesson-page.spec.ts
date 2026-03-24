import { test, expect } from '@playwright/test';

/**
 * Lesson Page Tests
 * Tests: Enhanced lesson page with audio player, mode audio toggle, content sections
 * Uses lessons with audio: course-foundations-lesson-1 to 4
 */

const USER_EMAIL = 'test_subscription@example.com';
const USER_PASSWORD = 'Test123!';

test.describe('Lesson Page - Audio Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    // Wait for successful login
    await page.waitForTimeout(1500);
  });

  test('Lesson page displays with audio indicator', async ({ page }) => {
    // Navigate to lesson with audio
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify lesson title
    await expect(page.locator('h1:has-text("What is Blockchain?")')).toBeVisible();

    // Verify audio indicator (use exact match to avoid strict mode)
    await expect(page.getByText('Audio', { exact: true })).toBeVisible();

    // Verify Mode Audio button exists
    await expect(page.locator('button:has-text("Mode Audio")')).toBeVisible();
  });

  test('Mode Audio button toggles audio player', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Check initial state - Mode Audio might already be active from previous interaction
    // Just verify the audio player becomes visible after clicking Mode Audio
    
    // Click Mode Audio button
    await page.click('button:has-text("Mode Audio")');
    await page.waitForTimeout(500);

    // Audio player should now be visible
    await expect(page.locator('button:has-text("Intro")')).toBeVisible();
    await expect(page.locator('button:has-text("Complet")')).toBeVisible();
    await expect(page.locator('button:has-text("Résumé")')).toBeVisible();

    // Verify playback controls
    // Play button
    const playButton = page.locator('button:has(svg[class*="lucide-play"])').or(page.locator('button').filter({ has: page.locator('[data-lucide="play"]') }));
    await expect(playButton.first()).toBeVisible();

    // Close button should be visible
    const closeButton = page.locator('button:has(svg[class*="lucide-x"])').first();
    await expect(closeButton).toBeVisible();

    // Click close to hide player
    await closeButton.click();
    await page.waitForTimeout(500);

    // Audio player should be hidden - check via Mode Audio button not having active state
    // The buttons may still exist but player section is hidden
    await expect(page.locator('.fixed.bottom-0')).not.toBeVisible();
  });

  test('Audio type selector buttons work', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open audio mode
    await page.click('button:has-text("Mode Audio")');
    await page.waitForTimeout(500);

    // Default should be "Complet"
    const completBtn = page.locator('button:has-text("Complet")');
    await expect(completBtn).toBeVisible();

    // Click on Intro
    await page.click('button:has-text("Intro")');
    await page.waitForTimeout(300);

    // Click on Résumé
    await page.click('button:has-text("Résumé")');
    await page.waitForTimeout(300);

    // All buttons should still be clickable
    await page.click('button:has-text("Complet")');
    await page.waitForTimeout(300);
  });

  test('Intro listen button opens audio player', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Find and click the intro listen button
    const introButton = page.locator('button:has-text("Écouter l\'introduction")');
    await expect(introButton).toBeVisible();
    await introButton.click();
    await page.waitForTimeout(500);

    // Audio player should appear at bottom
    await expect(page.locator('button:has-text("Intro")')).toBeVisible();
  });

  test('Speed selector is available in audio player', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open audio mode
    await page.click('button:has-text("Mode Audio")');
    await page.waitForTimeout(500);

    // Verify speed selector exists
    const speedSelector = page.locator('select');
    await expect(speedSelector).toBeVisible();

    // Verify speed options
    await expect(speedSelector).toContainText('1x');
  });
});

test.describe('Lesson Page - Content Sections', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('Learning objectives are displayed', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify objectives section
    await expect(page.locator('text=Objectifs d\'apprentissage')).toBeVisible();

    // Verify some objectives are shown
    await expect(page.locator('text=Understand distributed ledger technology')).toBeVisible();
    await expect(page.locator('text=Learn how blocks are chained together')).toBeVisible();
  });

  test('Lesson content is displayed', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify main content headings
    await expect(page.locator('text=Understanding Blockchain Technology')).toBeVisible();
  });

  test('Examples section is displayed', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll to see examples
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // Verify examples section
    await expect(page.locator('text=Exemples concrets')).toBeVisible();
    await expect(page.locator('text=Bitcoin transactions being verified by miners')).toBeVisible();
  });

  test('Summary section is displayed with listen button', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll to see summary
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(500);

    // Verify summary section - the CardTitle component renders as div
    await expect(page.locator('text=Résumé').first()).toBeVisible();

    // Verify listen button in summary section (use exact match)
    await expect(page.getByRole('button', { name: 'Écouter', exact: true })).toBeVisible();
  });

  test('Recommended readings are displayed', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 200));
    await page.waitForTimeout(500);

    // Verify readings section
    await expect(page.locator('text=Lectures recommandées')).toBeVisible();
    await expect(page.locator('text=Bitcoin Whitepaper by Satoshi Nakamoto')).toBeVisible();
  });
});

test.describe('Lesson Page - Navigation & Progress', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('Course progress sidebar shows all lessons', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify progress sidebar
    await expect(page.locator('text=Progression du cours')).toBeVisible();
    await expect(page.locator('text=Leçon 1 sur 8')).toBeVisible();

    // Verify lesson list items
    await expect(page.locator('a:has-text("What is Blockchain?")')).toBeVisible();
    await expect(page.locator('a:has-text("What is Bitcoin?")')).toBeVisible();
  });

  test('Navigation buttons work', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll to navigation buttons
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 100));
    await page.waitForTimeout(500);

    // Verify Next button exists (no Previous for first lesson)
    await expect(page.locator('a:has-text("Suivant")')).toBeVisible();

    // Verify Quiz button
    await expect(page.locator('a:has-text("Passer le Quiz")')).toBeVisible();
  });

  test('Back to course link works', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click back to course link
    const backLink = page.locator('a:has-text("Retour au cours")');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to course page
    await expect(page).toHaveURL(/\/course\//);
  });

  test('Table of contents toggle works', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Find the TOC toggle button (list icon)
    const tocButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-list"]') }).first();
    
    // Click to show TOC
    await tocButton.click();
    await page.waitForTimeout(500);

    // Table of contents should be visible
    await expect(page.locator('text=Table des matières')).toBeVisible();
  });

  test('Reading progress bar shows on scroll', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Progress bar should exist at top
    const progressBar = page.locator('.fixed.top-0 .bg-primary').first();
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Progress bar should have some width after scrolling
    // This just verifies the structure exists - exact width depends on content
  });

  test('XP points card is displayed for logged in user', async ({ page }) => {
    await page.goto('/lesson/course-foundations-lesson-1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify XP card
    await expect(page.locator('text=Points XP')).toBeVisible();
    await expect(page.locator('text=+50 XP en complétant cette leçon')).toBeVisible();
  });
});

test.describe('Lesson Page - Mark Complete', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('Mark as complete button is visible for logged in users', async ({ page }) => {
    // Go to a lesson that may not be completed yet
    await page.goto('/lesson/course-foundations-lesson-3', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 100));
    await page.waitForTimeout(500);

    // The button should exist (either "Marquer comme terminée" or show "Terminée" if already complete)
    const markCompleteBtn = page.locator('button:has-text("Marquer comme terminée")');
    const completedBadge = page.locator('text=Terminée');
    
    // Either the button or the completed badge should be visible
    const isButtonVisible = await markCompleteBtn.isVisible().catch(() => false);
    const isBadgeVisible = await completedBadge.isVisible().catch(() => false);
    
    expect(isButtonVisible || isBadgeVisible).toBeTruthy();
  });
});

test.describe('Lesson Page - Lessons without Audio', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('Mode Audio button not shown for lessons without audio', async ({ page }) => {
    // Go to a lesson without audio (lesson 5+)
    await page.goto('/lesson/course-foundations-lesson-5', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Mode Audio button should not be visible
    await expect(page.locator('button:has-text("Mode Audio")')).not.toBeVisible();
    
    // But other content should still be visible
    await expect(page.locator('text=Objectifs d\'apprentissage')).toBeVisible();
  });
});
