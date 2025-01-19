import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export const getBlogPosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/get-content`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }
};
