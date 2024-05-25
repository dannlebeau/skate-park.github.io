const express = require("express");
const router = express.Router();
const db = require("../models");
//const jwt = require("jsonwebtoken");
//const secretKey = "Secret_Key";

// Ruta para iniciar sesión y generar token JWT
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Implementa la lógica para verificar las credenciales del usuario en la base de datos
        // Si las credenciales son válidas, genera un token JWT y envíalo en la respuesta
        const token = jwt.sign({ email }, secretKey);
        res.send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});

module.exports = router;
