const express = require('express');
const BlogService = require('./blogs-service');
const { requireAuth } = require('../middleware/basic-auth');

const blogsRouter = express.Router();

blogsRouter.route('/').get((req, res, next) => {
  BlogService.getAllBlogs(req.app.get('db'))
    .then((blogs) => {
      res.json(BlogService.serializeBlogs(blogs));
    })
    .catch(next);
});

blogsRouter
  .route('/:blog_id')
  .all(requireAuth)
  .all(checkBlogExists)
  .get((req, res) => {
    res.json(BlogService.serializeBlog(res.blog));
  });

blogsRouter
  .route('/:blog_id/reviews/')
  .all(requireAuth)
  .all(checkBlogExists)
  .get((req, res, next) => {
    BlogService.getReviewsForBlog(req.app.get('db'), req.params.blog_id)
      .then((reviews) => {
        res.json(BlogService.serializeBlogReviews(reviews));
      })
      .catch(next);
  });

/* async/await syntax for promises */
async function checkBlogExists(req, res, next) {
  try {
    const blog = await BlogService.getById(
      req.app.get('db'),
      req.params.blog_id
    );

    if (!blog)
      return res.status(404).json({
        error: `Blog doesn't exist`,
      });

    res.blog = blog;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = blogsRouter;
