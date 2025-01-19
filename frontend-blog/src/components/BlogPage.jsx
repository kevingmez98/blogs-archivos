import React, { useEffect, useState } from 'react';
import { getBlogPosts } from '../services/blogService';
import BlogPost from './BlogPost';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Blog Posts</h1>
      {blogPosts.map((post) => (
        <BlogPost key={post.id} content={post.content} />
      ))}
    </div>
  );
};

export default BlogPage;
