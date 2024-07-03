import { useState, useEffect, useRef } from "react";

import Togglable from "./components/Togglable";
import Blog from "./components/Blog";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";

import blogService from "./services/blogs";
import loginService from "./services/login";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const getAllBlogs = async () => {
      const initialBlogs = await blogService.getAll();
      initialBlogs.sort((a, b) => a.likes - b.likes);
      setBlogs(initialBlogs);
    };
    getAllBlogs();
  }, []);

  useEffect(() => {
    const loggedInUserJSON = window.localStorage.getItem("loggedInUser");
    if (loggedInUserJSON) {
      const loggedInUser = JSON.parse(loggedInUserJSON);
      setUser(loggedInUser);
      blogService.setToken(loggedInUser.token);
    }
  }, []);

  const loginFormRef = useRef();
  const blogFormRef = useRef();

  const handleLogin = async (credentialsObject) => {
    try {
      const user = await loginService.login(credentialsObject);

      window.localStorage.setItem("loggedInUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);

      const blogs = await blogService.getAll();
      setBlogs(blogs);
    } catch (error) {
      setNotification({ type: "error", message: error.response.data.error });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem("loggedInUser");
  };

  const handleAddBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject);
      setBlogs(blogs.concat(createdBlog));

      setNotification({
        type: "success",
        message: `a new blog ${createdBlog.title} by ${createdBlog.author} added`,
      });
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      blogFormRef.current.toggleVisibility();
    } catch (error) {
      setNotification({ type: "error", message: error.response.data.error });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleUpdateBlog = async (blogObject) => {
    try {
      await blogService.update(blogObject.id, blogObject);
      setBlogs(blogs.map((b) => (b.id === blogObject.id ? blogObject : b)));
    } catch (error) {
      setNotification({ type: "error", message: error.response.data.error });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleDeleteblog = async (blogId) => {
    try {
      await blogService.deleteBlog(blogId);
      setBlogs(blogs.filter((b) => b.id !== blogId));
    } catch (error) {
      setNotification({ type: "error", message: error.response.data.error });
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const loginForm = () => (
    <Togglable buttonLabel="login" ref={loginFormRef}>
      <LoginForm onLogin={handleLogin} />
    </Togglable>
  );

  const addBlogForm = () => (
    <Togglable buttonLabel="create" ref={blogFormRef}>
      <BlogForm onAddBlog={handleAddBlog} />
    </Togglable>
  );

  const blogList = () => (
    <div>
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          onUpdateBlog={handleUpdateBlog}
          onDeleteBlog={handleDeleteblog}
          user={user}
        />
      ))}
    </div>
  );

  return user ? (
    <div>
      <h2>blogs</h2>
      {notification && (
        <div className={notification.type}>{notification.message}</div>
      )}
      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>
      {addBlogForm()}
      {blogList()}
    </div>
  ) : (
    <div>
      <h1>log in to application</h1>
      {notification && (
        <div className={notification.type}>{notification.message}</div>
      )}
      {loginForm()}
    </div>
  );
};

export default App;
