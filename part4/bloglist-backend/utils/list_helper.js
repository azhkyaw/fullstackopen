const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, item) => sum + item.likes, 0);

const favouriteBlog = (blogs) =>
  blogs.length > 0
    ? blogs.reduce((favourite, item) =>
        item.likes > favourite.likes ? item : favourite
      )
    : null;

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const authorBlogCounts = blogs.reduce((acc, item) => {
    acc[item.author] = (acc[item.author] || 0) + 1;
    return acc;
  }, {});

  const topAuthor = Object.keys(authorBlogCounts).reduce((a, b) =>
    authorBlogCounts[a] > authorBlogCounts[b] ? a : b
  );

  return { author: topAuthor, blogs: authorBlogCounts[topAuthor] };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const authorLikeCounts = blogs.reduce((acc, item) => {
    acc[item.author] = (acc[item.author] || 0) + item.likes;
    return acc;
  }, {});

  const authorWithMostLikes = Object.keys(authorLikeCounts).reduce((a, b) =>
    authorLikeCounts[a] > authorLikeCounts[b] ? a : b
  );

  return {
    author: authorWithMostLikes,
    likes: authorLikeCounts[authorWithMostLikes],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
};
