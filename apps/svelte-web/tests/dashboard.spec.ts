import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
	// Create a unique test user once for all tests
	const timestamp = Date.now();
	const testUser = {
		username: `testuser_${timestamp}`,
		email: `test_${timestamp}@example.com`,
		password: 'Test@1234'
	};

	test.beforeAll(async ({ browser }) => {
		// Create a new page for registration
		const context = await browser.newContext();
		const page = await context.newPage();

		try {
			await page.goto('/auth/register');
			await page.getByLabel(/Username/i).fill(testUser.username);
			await page.getByLabel(/Email Address/i).fill(testUser.email);
			await page.getByLabel('Password', { exact: true }).fill(testUser.password);
			await page.getByLabel(/Confirm Password/i).fill(testUser.password);
			await page.getByRole('button', { name: /Create Account/i }).click();
			await page.waitForURL(/.*login/, { timeout: 10000 });
		} finally {
			await context.close();
		}
	});

	test.beforeEach(async ({ page }) => {
		// Login before each test with the same user
		await page.goto('/auth/login');
		await page.getByLabel(/Email Address/i).fill(testUser.email);
		await page.getByLabel('Password', { exact: true }).fill(testUser.password);
		await page.getByRole('button', { name: /Sign In/i }).click();

		// Wait for successful login and redirect to dashboard
		await page.waitForURL(/.*dashboard/, { timeout: 10000 });
	});

	test('should show dashboard layout when authenticated', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.getByRole('navigation')).toBeVisible();
	});

	test('should have sidebar navigation', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /tasks/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /create task/i }).last()).toBeVisible();
		await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
	});

	test('should display all task statistics', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.getByText('Total Tasks')).toBeVisible();
		await expect(page.getByText('To do')).toBeVisible();
		await expect(page.getByText('In Progress')).toBeVisible();
		await expect(page.getByText('Completed')).toBeVisible();
		await expect(page.getByText('Review')).toBeVisible();
		await expect(page.getByText('Cancelled')).toBeVisible();
	});

	test('should display recent tasks section', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.getByRole('heading', { name: 'Recent Tasks' })).toBeVisible();
	});

	test('should show loading state initially', async ({ page }) => {
		await page.goto('/dashboard');
		const loadingSpinner = page.locator('.animate-spin');
		await expect(loadingSpinner).toHaveCount(0, { timeout: 10000 });
	});

	test('should be responsive on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/dashboard');

		await expect(page.getByRole('heading', { name: 'Recent Tasks' })).toBeVisible();
		await expect(page.getByText('Total Tasks')).toBeVisible();
	});

	test('should be responsive on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/dashboard');

		await expect(page.getByRole('heading', { name: 'Recent Tasks' })).toBeVisible();
		await expect(page.getByText('Total Tasks')).toBeVisible();
	});

	test('should show empty state when no tasks exist', async ({ page }) => {
		await page.goto('/dashboard');

		// Check that Total Tasks shows 0
		const totalTasksCard = page.locator('text=Total Tasks').locator('..');
		await expect(totalTasksCard).toContainText('0');

		// Check for empty state message in recent tasks section
		await expect(
			page.getByText(/no tasks yet|no recent tasks|create your first task/i)
		).toBeVisible();
	});

	test('should display tasks when they exist', async ({ page }) => {
		// Navigate to create task page
		await page.goto('/dashboard');
		await page
			.getByRole('link', { name: /create task/i })
			.first()
			.click();
		await page.waitForURL(/.*dashboard\/create/);

		// Create a new task
		await page.getByLabel(/title/i).fill('Test Task for Dashboard');
		await page.getByLabel(/description/i).fill('This is a test task to verify dashboard display');
		await page.getByRole('button', { name: /create task/i }).click();

		// Wait for redirect back to tasks list or dashboard
		await page.waitForURL(/.*(?:tasks|dashboard)/);

		// Go back to dashboard
		await page.goto('/dashboard');

		// Verify Total Tasks is now greater than 0
		const totalTasksCard = page.locator('text=Total Tasks').locator('..');
		await expect(totalTasksCard).not.toContainText('0');

		// Verify the task appears in Recent Tasks section
		await expect(page.getByText('Test Task for Dashboard').first()).toBeVisible();

		// Verify task status is displayed
		await expect(page.getByText(/to do|todo/i)).toHaveCount(2);
	});

	test('should update statistics when task is created', async ({ page }) => {
		await page.goto('/dashboard');

		// Get initial count
		const initialCount = await page.locator('text=Total Tasks').locator('..').textContent();

		// Create a new task
		await page
			.getByRole('link', { name: /create task/i })
			.first()
			.click();
		await page.waitForURL(/.*dashboard\/create/);
		await page.getByLabel(/title/i).fill('New Task for Stats Test');
		await page.getByLabel(/description/i).fill('Testing statistics update');
		await page.getByRole('button', { name: /create task/i }).click();

		// Return to dashboard and verify count increased
		await page.goto('/dashboard');
		const loadingSpinner = page.locator('.animate-spin');
		await expect(loadingSpinner).toHaveCount(0, { timeout: 10000 });

		const updatedCount = await page.locator('text=Total Tasks').locator('..').textContent();
		expect(updatedCount).not.toBe(initialCount);
	});
});
