const _ = require("lodash");

const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, item) => sum + item.likes, 0);

const favouriteBlog = (blogs) =>
  blogs.length > 0
    ? blogs.reduce((favourite, item) =>
        item.likes > favourite.likes ? item : favourite
      )
    : null;

const mostBlogs = (blogs) => {
  if (_.isEmpty(blogs)) {
    return null;
  }

  const authorBlogCounts = _.countBy(blogs, "author");

  const topAuthor = _.maxBy(
    _.keys(authorBlogCounts),
    (author) => authorBlogCounts[author]
  );

  return { author: topAuthor, blogs: authorBlogCounts[topAuthor] };
};

const mostLikes = (blogs) => {
  if (_.isEmpty(blogs)) {
    return null;
  }

  const groupedByAuthor = _.groupBy(blogs, "author");

  const likesByAuthor = _.mapValues(groupedByAuthor, (authorBlogs) =>
    _.sumBy(authorBlogs, "likes")
  );

  const topAuthor = _.maxBy(
    _.keys(likesByAuthor),
    (author) => likesByAuthor[author]
  );

  return {
    author: topAuthor,
    likes: likesByAuthor[topAuthor],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
};
