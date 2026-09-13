import { test, expect } from '@playwright/test';

test.describe('E-Bike Scheme Portal — Complete Lifecycle Happy Path', () => {
  const timestamp = Date.now().toString().slice(-6);
  const testStudentCnic = `35201-${timestamp}1-1`;
  const testStudentMobile = `0300${timestamp}1`;
  const testStudentEmail = `student_${timestamp}@punjab.gov.pk`;
  const testStudentName = `Shahid Mahmood ${timestamp}`;

  test('student applies -> coordinator verifies -> admin runs selection -> reaches Selected status', async ({ page }) => {
    // 1. Student Registration & OTP verification
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Student Registration');

    await page.fill('#reg-name', testStudentName);
    await page.fill('#reg-cnic', testStudentCnic);
    await page.fill('#reg-mobile', testStudentMobile);
    await page.fill('#reg-email', testStudentEmail);
    await page.fill('#reg-password', 'DemoPass123!');
    await page.click('#reg-submit-btn');

    // OTP screen should appear with mock OTP
    await expect(page.locator('#reg-otp')).toBeVisible();
    await page.click('#verify-otp-btn');

    // 2. Application Wizard Form
    await expect(page).toHaveURL(/.*\/student\/apply/);
    await expect(page.locator('h1')).toContainText('Application Wizard');

    // Step 1: Personal
    await page.click('#wizard-next-btn');

    // Step 2: Documents & License
    await page.click('#wizard-next-btn');

    // Step 3: University Selection
    await expect(page.locator('#university-select')).toBeVisible();
    // Select University of the Punjab
    await page.selectOption('#university-select', { index: 1 });
    await page.click('#wizard-next-btn');

    // Step 4: Financial & Wallet
    await page.click('#wizard-next-btn');

    // Step 5: Declaration & Digital Signature
    await page.check('#agree-terms');
    await page.fill('#signature-name', testStudentName);
    await page.click('#wizard-submit-btn');

    // 3. Student Dashboard
    await expect(page).toHaveURL(/.*\/student/);
    await expect(page.locator('h1')).toContainText(testStudentName);
    await expect(page.getByText('EBS-2026-').first()).toBeVisible();

    // 4. Coordinator Verification
    await page.goto('/login');
    await page.click('#demo-coordinator-btn');
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL(/.*\/coordinator/);
    await expect(page.getByText('Institutional Verification Portal')).toBeVisible();

    // Find and approve the applicant
    const verifyButton = page.locator(`button:has-text("Verify")`).first();
    await expect(verifyButton).toBeVisible();
    await verifyButton.click();
    await page.waitForTimeout(1000);

    // 5. Admin Command Center & Selection Engine Draw
    await page.goto('/login');
    await page.click('#demo-admin-btn');
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL(/.*\/admin/);
    await page.click('#tab-selection');
    await expect(page.locator('#run-draw-btn')).toBeVisible();

    // Trigger Selection Draw
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click('#run-draw-btn');

    // Verify Selection Success
    await expect(page.getByText('Draw Executed Successfully')).toBeVisible();

    // 6. Verify Student Application Status is now "SELECTED"
    await page.goto('/login');
    await page.fill('#login-identifier', testStudentCnic);
    await page.fill('#login-password', 'DemoPass123!');
    await page.click('#login-submit-btn');

    await expect(page).toHaveURL(/.*\/student/);
    await expect(page.getByText('SELECTED')).toBeVisible();
    await expect(page.getByText('Handover Voucher & QR Token')).toBeVisible();
  });
});
