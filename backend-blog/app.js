const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware para CORS (permitir solicitudes del frontend)
app.use(cors());
// Middleware para procesar JSON en el cuerpo de las solicitudes
app.use(express.json());

// Configuración de Multer para guardar las imágenes en la carpeta "uploads"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        console.log(file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// Filtro para validar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF).'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
});


// Ruta para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ninguna imagen.' });
    }

    // URL para acceder a la imagen
    // const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const imageName = req.file.filename;
    res.json({ imageUrl: imageName });
});

// Servir las imágenes subidas como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para verificar server
app.get('/', (req, res) => {

    return res.status(200).json({ msg: 'Servidor funcionando.' });
});

// Ruta para guardar el contenido en un archivo JSON
app.post('/save-content', (req, res) => {
    const {content, listaImagenes} = req.body; // Contenido enviado desde el frontend

    // Ruta al archivo JSON
    const filePath = path.join(__dirname, 'content.json');

    // Procesar el contenido para extraer nombres de imágenes
    const updatedContent = content.replace(/src="[^"]*\/uploads\/([^"]+)"/g, 'src="$1"');
    // Leer contenido actual del archivo JSON
    let existingContent = [];
    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        existingContent = JSON.parse(fileData);
    }
    // Agregar nuevo contenido al archivo
    existingContent.push({
        id: Date.now(), // ID único basado en la fecha
        content: updatedContent,
        listaImagenes:listaImagenes
    });

    console.log(listaImagenes);
    // Escribir el contenido actualizado en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(existingContent, null, 2), 'utf-8');

    res.status(200).json({ message: 'Contenido guardado exitosamente' });
})

// Traer el contenido del JSON
app.get('/get-content', (req, res) => {
    // Ruta al archivo JSON
    const filePath = path.join(__dirname, 'content.json');

    try {
        // Leer el archivo JSON
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            const content = JSON.parse(fileData);
            res.status(200).json(content); // Enviar el contenido como JSON
        } else {
            // Si el archivo no existe, devolver un arreglo vacío
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        res.status(500).json({ message: 'Error al recuperar el contenido' });
    }
});


// Inicio del servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
