import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import ImageUploader from 'quill2-image-uploader'; // Librería para subir imágenes
import axios from 'axios';
import 'quill/dist/quill.snow.css'; // Para el tema 'snow'


// Registramos el módulo 'imageUploader' para Quill
Quill.register('modules/imageUploader', ImageUploader);

const Editor = () => {
  const editorRef = useRef(null); // Referencia al contenedor del editor
  const [contenido, setContenido] = useState("");
  const [nombresImagenes, setNombres] = useState([]);
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Subir la imagen y esperar la respuesta
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageName = response.data.imageUrl; // Suponiendo que el servidor te da el nombre de la imagen en la respuesta

      // Agregar el nombre de la imagen al array
      nombresImagenes.push(imageName);
      // return  `${process.env.REACT_APP_IMAGE_BASE_URL}/uploads/${imageName}`;

      console.log(nombresImagenes);
      // Retornar la URL completa de la imagen (en el frontend se usará esta URL)
      return `http://localhost:5000/uploads/${imageName}`;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null; // Retorna null si hay un error
    }
  };

  useEffect(() => {
    // Aseguramos que el contenedor del editor esté listo
    const quill = new Quill(editorRef.current, {
      theme: 'snow', // Tema del editor (puedes usar 'bubble' también)
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block'],
        ],
        imageUploader: {
          upload: async (file) => {
            // Llamamos a la función uploadImage para subir la imagen
            const imageUrl = await uploadImage(file);

            // Si la imagen se subió correctamente, retornamos la URL
            return imageUrl;
          },
          loadingClass: 'uploading-image', // Clase CSS mientras se sube la imagen
        },
      },
    });

    // Escuchar cambios en el contenido para ver cómo cambia el texto
    quill.on('text-change', () => {
      console.log(quill.root.innerHTML); // Muestra el HTML con las imágenes incluidas
      setContenido(quill.root.innerHTML);
    });

  }, []); // Este efecto solo se ejecuta una vez, cuando el componente se monta

  // Guardar contenido en el JSON
  const saveContent = async (editorContent) => {
    try {
      console.log(nombresImagenes);
      const response = await axios.post('http://localhost:5000/save-content', {
        content: editorContent,
        listaImagenes: nombresImagenes
      });
      console.log(response.data.message); // Confirmación de que se guardó correctamente
    } catch (error) {
      console.error('Error al guardar el contenido:', error);
    }
  };

  // Metodo para llamar el guardado
  const handleSave = () => {
    saveContent(contenido); // Envía el contenido al backend
  };
  return (
    <div>
      <h2>Editor de Blog con Quill</h2>
      {/* El contenedor del editor Quill */}
      <div ref={editorRef} style={{ height: '300px', border: '1px solid #ccc' }} />
      <button onClick={handleSave}>Guardar</button>
    </div>
  );
};

export default Editor;
