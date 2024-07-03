import { useState } from "react";
import PropTypes from "prop-types";

const Blog = ({ blog, onUpdateBlog, onDeleteBlog, user }) => {
  const [displayDetails, setDisplayDetails] = useState(false);

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    paddingBottom: 5,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  const handleLikeClick = () => {
    const updatedBlog = JSON.parse(JSON.stringify(blog));
    updatedBlog.likes += 1;
    onUpdateBlog(updatedBlog);
  };

  const handleDeleteBlog = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      onDeleteBlog(blog.id);
    }
  };

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}{" "}
        <button onClick={() => setDisplayDetails(!displayDetails)}>
          {displayDetails ? "hide" : "view"}
        </button>
      </div>
      {displayDetails && (
        <>
          <div>{blog.url}</div>
          <div>
            likes {blog.likes} <button onClick={handleLikeClick}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {user.username === blog.user?.username && (
            <button onClick={handleDeleteBlog}>remove</button>
          )}
        </>
      )}
    </div>
  );
};

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onUpdateBlog: PropTypes.func.isRequired,
  onDeleteBlog: PropTypes.func.isRequired,
};

export default Blog;
