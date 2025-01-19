const BASE_URL = 'http://localhost:5000/uploads/';
import React from 'react';

const renderContent = (content) => {
  // Completar las rutas de las imágenes en el contenido
  const updatedContent = content.replace(/src="([^"]+)"/g, (match, p1) => {
    if (!p1.startsWith('http')) {
      return `src="${BASE_URL}${p1}"`;
    }
    return match;
  });

  return updatedContent;
};

const BlogPost = ({ content }) => {
  const processedContent = renderContent(content);
  console.log(processedContent);
  return (
    <div className='ql-show'
      dangerouslySetInnerHTML={{ __html: processedContent }}
      style={{ border: '1px solid #ccc', padding: '10px' }}
    />
  );
};

export default BlogPost;