const { test, after, beforeEach, describe } = require("node:test");
const assert = require("assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");

const api = supertest(app);

describe("when there are intially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  test.only("six blogs are returned as json", async () => {
    const response = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.strictEqual(response.body.length, 6);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");
    const titles = response.body.map((blog) => blog.title);
    assert(titles.includes("React patterns"));
  });

  test("unique identifier property of the blog posts is named id", async () => {
    const response = await api.get("/api/blogs");
    const blog = response.body[0];

    assert("id" in blog);
    assert(!("_id" in blog));
  });

  describe("viewing a specific blog", () => {
    test("a specific blog can be viewed", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
      const invalidId = "invalid-id";

      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });

  describe("addition of a new blog", () => {
    test("a valid blog can be added", async () => {
      const blog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .send(blog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      const titles = blogsAtEnd.map((blog) => blog.title);

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      assert(titles.includes("Functional Duplications"));
    });

    test("if the likes property is missing from the request, it defaults to 0", async () => {
      const blog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
      };

      const response = await api.post("/api/blogs").send(blog);

      assert.strictEqual(response.body.likes, 0);
    });

    test("blog without title is not added", async () => {
      const blog = {
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/test.html",
        likes: 2,
      };

      await api.post("/api/blogs").send(blog).expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("blog without url is not added", async () => {
      const blog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        likes: 2,
      };

      await api.post("/api/blogs").send(blog).expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    test("an existing blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });

    test("statuscode 204 is returned if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api.delete(`/api/blogs/${validNonexistingId}`).expect(204);
    });
  });

  describe("updating of a blog", () => {
    test("an existing blog can be updated", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: 20 })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd.find(
        (blog) => blog.id === blogToUpdate.id
      );

      assert.strictEqual(updatedBlog.likes, 20);

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("statuscode 404 is returned if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api.put(`/api/blogs/${validNonexistingId}`).expect(404);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
