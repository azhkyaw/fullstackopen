const { test, expect, beforeEach, describe } = require("@playwright/test");
const { loginWith, createBlog } = require("./helper");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        name: "John Doe",
        username: "johndoe",
        password: "abcd1234",
      },
    });

    await page.goto("/");
  });

  test("Login form is displayed by default", async ({ page }) => {
    const locator = await page.getByText("username");
    await expect(locator).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, "johndoe", "abcd1234");

      await expect(page.getByText("John Doe logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, "johndoe", "wrong");

      const errorDiv = await page.locator(".error");
      await expect(errorDiv).toContainText("invalid username or password");
      await expect(errorDiv).toHaveCSS("border-style", "solid");
      await expect(errorDiv).toHaveCSS("color", "rgb(255, 0, 0)");

      await expect(page.getByText("John Doe logged in")).not.toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, "johndoe", "abcd1234");
    });

    test("a new blog can be created", async ({ page }) => {
      await createBlog(
        page,
        "React patterns",
        "Michael Chan",
        "https://reactpatterns.com/"
      );
      await expect(page.getByText("React patterns Michael Chan")).toBeVisible();
    });

    describe("and a blog exists", () => {
      beforeEach(async ({ page }) => {
        await createBlog(
          page,
          "React patterns",
          "Michael Chan",
          "https://reactpatterns.com/"
        );
      });

      test("a blog can be liked", async ({ page }) => {
        await page.getByRole("button", { name: "view" }).click();
        await page.getByRole("button", { name: "like" }).click();
        await expect(page.getByText("1")).toBeVisible();
      });

      test("a blog can be deleted by user who created it", async ({ page }) => {
        page.on("dialog", async (dialog) => {
          if (dialog.type() === "confirm") {
            await dialog.accept();
          }
        });

        await page.getByRole("button", { name: "view" }).click();
        await page.getByRole("button", { name: "remove" }).click();
        await expect(
          page.locator("text=React patterns Michael Chan")
        ).not.toBeVisible();
      });

      test("only the user who added the blog sees the blog's delete button", async ({
        page,
        request,
      }) => {
        await page.getByRole("button", { name: "logout" }).click();

        await request.post("/api/users", {
          data: {
            name: "Jane Roe",
            username: "janeroe",
            password: "efgh5678",
          },
        });
        await page.getByRole("button", { name: "login" }).click();
        await loginWith(page, "janeroe", "efgh5678");

        await page.getByRole("button", { name: "view" }).click();
        await expect(
          page.getByRole("button", { name: "remove" })
        ).not.toBeVisible();
      });
    });

    describe("and multiple blogs exist", () => {
      beforeEach(async ({ page, request }) => {
        const response = await request.post("/api/login", {
          data: {
            username: "johndoe",
            password: "abcd1234",
          },
        });
        const data = await response.json();

        await request.post("/api/blogs", {
          data: {
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 5,
          },
          headers: {
            Authorization: "Bearer " + data.token,
          },
        });
        await request.post("/api/blogs", {
          data: {
            title: "Functional Duplications",
            author: "Robert C. Martin",
            url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
            likes: 2,
          },
          headers: {
            Authorization: "Bearer " + data.token,
          },
        });
        await request.post("/api/blogs", {
          data: {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 6,
          },
          headers: {
            Authorization: "Bearer " + data.token,
          },
        });

        await page.getByRole("button", { name: "logout" }).click();
        await page.getByRole("button", { name: "login" }).click();
        await loginWith(page, "johndoe", "abcd1234");
      });

      test.only("blogs are arranged in the order according to the likes", async ({
        page,
      }) => {
        await expect(await page.locator(".blog").first()).toContainText(
          "Go To Statement Considered Harmful Edsger W. Dijkstra view"
        );
        await expect(await page.locator(".blog").nth(1)).toContainText(
          "React patterns Michael Chan view"
        );
        await expect(await page.locator(".blog").nth(2)).toContainText(
          "Functional Duplications Robert C. Martin view"
        );
      });
    });
  });
});
