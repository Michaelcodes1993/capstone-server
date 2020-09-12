const xss = require('xss');
const Treeize = require('treeize');

const BlogsService = {
  getAllBlogs(db) {
    return db.from('blogs AS blg').select(
      '*'
      // 'blg.id',
      // 'blg.title',
      // 'blg.date_created',
      // 'blg.content',
      // 'blg.image',
      // ...userFields,
      // db.raw(`count(DISTINCT rev) AS number_of_reviews`),
      // db.raw(`AVG(rev.rating) AS average_review_rating`)
    );
    // .leftJoin('blogs_comments AS rev', 'blg.id', 'rev.blog_id')
    // .leftJoin('blog_users AS usr', 'blg.user_id', 'usr.id')
    // .groupBy('blg.id', 'usr.id');
  },

  createBlog(db, image, title, content, user) {
    return db('blogs')
      .insert({ image, title, content, user_id: user })
      .returning('*');
  },

  getById(db, id) {
    return BlogsService.getAllBlogs(db).where('thg.id', id).first();
  },

  getReviewsForBlogs(db, blog_id) {
    return db
      .from('blog_comments AS rev')
      .select(
        'rev.id',
        'rev.rating',
        'rev.text',
        'rev.date_created',
        ...userFields
      )
      .where('rev.blog_id', blog_id)
      .leftJoin('blog_users AS usr', 'rev.user_id', 'usr.id')
      .groupBy('rev.id', 'usr.id');
  },

  serializeBlogs(blogs) {
    return blogs.map(this.serializeBlogs);
  },

  serializeBlogs(blogs) {
    const blogTree = new Treeize();

    const blogData = blogTree.grow([blogs]).getData()[0];

    return {
      id: blogData.id,
      title: xss(blogData.title),
      content: xss(blogData.content),
      date_created: blogData.date_created,
      image: blogData.image,
      user: blogData.user || {},
      number_of_reviews: Number(blogData.number_of_reviews) || 0,
      average_review_rating: Math.round(blogData.average_review_rating) || 0,
    };
  },

  serializeBlogReviews(reviews) {
    return reviews.map(this.serializeBlogReview);
  },

  serializeBlogReview(review) {
    const reviewTree = new Treeize();

    const reviewData = reviewTree.grow([review]).getData()[0];

    return {
      id: reviewData.id,
      rating: reviewData.rating,
      blog_id: reviewData.blog_id,
      text: xss(reviewData.text),
      user: reviewData.user || {},
      date_created: reviewData.date_created,
    };
  },
};

const userFields = [
  'usr.id AS user:id',
  'usr.user_name AS user:user_name',
  'usr.full_name AS user:full_name',
  'usr.nickname AS user:nickname',
  'usr.date_created AS user:date_created',
  'usr.date_modified AS user:date_modified',
];

module.exports = BlogsService;
