CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    blog_id INTEGER
        REFERENCES blogs(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES blog_users(id) ON DELETE CASCADE NOT NULL
);
