import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test('should show login page', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
	});

	test('should show validation errors for empty form', async ({ page }) => {
		await page.goto('/auth/login');
		await page.getByRole('button', { name: /Sign In/ }).click();
		await expect(page.getByRole('heading', { name: /Welcome Back/ })).toBeVisible();
	});

	test('should navigate to register page', async ({ page }) => {
		await page.goto('/auth/login');
		await page.getByRole('link', { name: 'Create an account' }).click();
		await expect(page).toHaveURL(/.*register/);
	});

	test('should show register form', async ({ page }) => {
		await page.goto('/auth/register');
		await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible();
		await expect(page.getByLabel(/Username/i)).toBeVisible();
		await expect(page.getByLabel(/Email Address/i)).toBeVisible();
		await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
		await expect(page.getByLabel(/Confirm Password/)).toBeVisible();
	});
});
