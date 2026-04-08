import { test, expect } from "@playwright/test";

test.describe("Contact form (smoke)", () => {
  test("hiển thị validation client-side", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /gửi tin nhắn/i }).click();
    await expect(page.getByText(/chưa nhập/i)).toHaveCount(3);
  });
});

