const express = require("express");
const router = express.Router();
const db = require("../models");

// Ruta para registrar un nuevo participante con imagen de perfil
router.post("/register", async (req, res) => {
    try {
        if (!req.files || !req.files.foto) {
            return res.status(400).send("No se ha proporcionado una imagen de perfil");
        }

        const foto = req.files.foto;

        // Guardar la imagen en el servidor
        foto.mv(path.join(__dirname, "../assets/img", foto.name));

        // Implementa la lógica para registrar un nuevo participante en la base de datos
        res.send("Registro exitoso");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
