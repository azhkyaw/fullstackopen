const { test, after, beforeEach } = require("node:test");
const assert = require("assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const Blog = require("../models/blog");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("six blogs are returned as json", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.length, 6);
});

test("unique identifier property of the blog posts is named id", async () => {
  const response = await api.get("/api/blogs");
  const blog = response.body[0];

  assert("id" in blog);
  assert(!("_id" in blog));
});

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

// test("The first blog is about react", async () => {
//   // const response = await api.get("/api/blogs");
//   // assert(response.body[0].title.includes("react"));
// });

after(async () => {
  await mongoose.connection.close();
});
