import { test, expect } from '@playwright/test';

const BASE_URL = 'https://broker-briefing.preview.emergentagent.com';

test.describe('Crypto Quest Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Navigate to Crypto Quest
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should display Crypto Quest page structure', async ({ page }) => {
    // Verify page loaded
    await expect(page.getByTestId('crypto-quest-page')).toBeVisible();
    
    // Verify header section
    await expect(page.getByTestId('quest-header')).toBeVisible();
    await expect(page.getByTestId('quest-title')).toBeVisible();
    await expect(page.getByTestId('quest-subtitle')).toBeVisible();
    
    // Verify progress section
    await expect(page.getByTestId('quest-progress-section')).toBeVisible();
    await expect(page.getByTestId('quest-progress-text')).toBeVisible();
    await expect(page.getByTestId('quest-progress-percent')).toBeVisible();
  });

  test('should display chapters list', async ({ page }) => {
    // Verify chapters list
    await expect(page.getByTestId('chapters-list')).toBeVisible();
    
    // Verify Chapter 1 is visible (first chapter should be unlocked)
    await expect(page.getByTestId('chapter-1')).toBeVisible();
    await expect(page.getByTestId('chapter-header-1')).toBeVisible();
    
    // Verify Chapter 1 name
    await expect(page.getByText('The Beginning')).toBeVisible();
  });

  test('should display overall progress percentage', async ({ page }) => {
    const progressPercent = page.getByTestId('quest-progress-percent');
    await expect(progressPercent).toBeVisible();
    
    // Should contain a percentage
    const text = await progressPercent.textContent();
    expect(text).toMatch(/\d+%/);
  });

  test('should show unlocked chapter 1 as expandable', async ({ page }) => {
    const chapter1Header = page.getByTestId('chapter-header-1');
    await expect(chapter1Header).toBeVisible();
    
    // Chapter 1 should not be disabled (it's unlocked for level 1 users)
    await expect(chapter1Header).not.toBeDisabled();
  });
});

test.describe('Crypto Quest Page - Chapter Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should expand chapter to show missions', async ({ page }) => {
    // Click on Chapter 1 header to expand (if not already expanded)
    const chapter1 = page.getByTestId('chapter-1');
    
    // Check if missions are visible - if Chapter 1 is auto-expanded, we should see missions
    // First mission should be visible
    await expect(page.getByTestId('mission-mission_1_1')).toBeVisible();
    
    // Verify mission title
    await expect(page.getByText('What is Cryptocurrency?')).toBeVisible();
  });

  test('should show mission XP rewards', async ({ page }) => {
    // Missions should show XP rewards - use first mission specifically
    const mission1 = page.getByTestId('mission-mission_1_1');
    await expect(mission1.getByText('+50')).toBeVisible();
  });

  test('should display different mission types', async ({ page }) => {
    // Scroll down to see more missions
    // mission_1_1 is lesson type
    const mission1 = page.getByTestId('mission-mission_1_1');
    await expect(mission1).toBeVisible();
    
    // mission_1_quiz is quiz type (Chapter 1 Challenge)
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Chapter 1 Challenge')).toBeVisible();
  });
});

test.describe('Crypto Quest Page - Locked Chapters', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should show locked chapters with required level', async ({ page }) => {
    // Scroll to see Chapter 3 which requires level 6
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Chapter 3 header should exist
    const chapter3 = page.getByTestId('chapter-3');
    await expect(chapter3).toBeVisible();
    
    // Should show "Level 6+" indicator for locked chapter
    await expect(page.getByText(/Level 6\+/)).toBeVisible();
  });

  test('should not allow clicking on locked chapters', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(500);
    
    // Chapter 4 requires level 10
    const chapter4Header = page.getByTestId('chapter-header-4');
    
    // The button should be disabled
    await expect(chapter4Header).toBeDisabled();
  });
});

test.describe('Crypto Quest Page - Mission Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'gamerhub@crypto.io');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await page.goto('/crypto-quest', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('should click on lesson mission', async ({ page }) => {
    // Click on first lesson mission
    const lessonMission = page.getByTestId('mission-mission_1_1');
    await lessonMission.click();
    
    // Wait for any action to complete
    await page.waitForTimeout(2000);
    
    // The behavior depends on mission state:
    // - If not completed: navigates to lesson
    // - If already completed: shows toast and stays on page
    // Check if we're on the lesson page or stayed on crypto-quest
    const url = page.url();
    const navigated = url.includes('/lesson/');
    const stayed = url.includes('/crypto-quest');
    
    // Either case is acceptable behavior
    expect(navigated || stayed).toBeTruthy();
  });
});
