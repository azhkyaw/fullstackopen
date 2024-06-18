const { test, after, beforeEach, describe, before } = require("node:test");
const assert = require("assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");

let token;
const api = supertest(app);

before(async () => {
  await User.deleteMany({});

  const userCredentials = { username: "testuser", password: "mypassword" };
  await api.post("/api/users").send(userCredentials);
  const result = await api.post("/api/login").send(userCredentials);
  token = result._body.token;
});

describe("when there are intially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  test("six blogs are returned as json", async () => {
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
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      const titles = blogsAtEnd.map((blog) => blog.title);

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
      assert(titles.includes("Functional Duplications"));
    });

    test("a blog cannot be added if token is not provided", async () => {
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(401)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      const titles = blogsAtEnd.map((blog) => blog.title);

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
      assert(!titles.includes("Functional Duplications"));
    });

    test("if the likes property is missing from the request, it defaults to 0", async () => {
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
      };

      const response = await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201);

      assert.strictEqual(response.body.likes, 0);
    });

    test("blog without title is not added", async () => {
      const newBlog = {
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/test.html",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("blog without url is not added", async () => {
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set({ Authorization: `Bearer ${token}` })
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    test("an existing blog can be deleted by the same user who created it", async () => {
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
        likes: 5,
      };

      const response = await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog);

      await api
        .delete(`/api/blogs/${response.body.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes("Functional Duplications"));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("statuscode 204 is returned even if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api.delete(`/api/blogs/${validNonexistingId}`).expect(204);
    });

    test("a blog cannot be deleted if token is not provided", async () => {
      const blogsAtStart = await helper.blogsInDb();

      await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("a blog cannot be deleted by other user", async () => {
      const newBlog = {
        title: "Functional Duplications",
        author: "Robert C. Martin",
        url: "https://blog.cleancoder.com/uncle-bob/2021/10/28/functional-duplication.html",
        likes: 5,
      };

      const differentUser = {
        username: "differentuser",
        password: "mypassword",
      };
      await api.post("/api/users").send(differentUser);
      const result = await api.post("/api/login").send(differentUser);
      const differentUserToken = result._body.token;

      const response = await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog);

      await api
        .delete(`/api/blogs/${response.body.id}`)
        .set({ Authorization: `Bearer ${differentUserToken}` })
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();

      const titles = blogsAtEnd.map((r) => r.title);
      assert(titles.includes("Functional Duplications"));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
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
