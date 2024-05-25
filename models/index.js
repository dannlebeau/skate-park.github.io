const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'skatepark',
    password: '3022',
  port: 5432, // Puerto por defecto de PostgreSQL
});

// module.exports = pool;

// const express = require('express');
// const app = express();
//const pool = require('./pool'); // Importa el pool de conexiones

// Ruta para registrar un nuevo participante
// app.post('/register', async (req, res) => {
//   try {
//     // Aquí puedes manejar la lógica para insertar los datos en la base de datos
//     // Por ejemplo:
//     const { email, nombre, password, anos_experiencia, especialidad } = req.body;

//     const client = await pool.connect();
//     const result = await client.query(
//       'INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad) VALUES ($1, $2, $3, $4, $5)',
//       [email, nombre, password, anos_experiencia, especialidad]
//     );
//     client.release();

//     res.send('Registro exitoso');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error interno del servidor');
//   }
// });

//aca no es necesario
// app.listen(3000, () => {
//   console.log('Servidor escuchando en el puerto 3000');
// });


//se debe analizar
// Función asincrónica para consultar todos los usuarios
async function consultarUsuarios() {
  try {
      const result = await pool.query(`SELECT * FROM skaters`);
      return result.rows;
  } catch (e) {
      console.log(e);
  }
}

// Función asincrónica para ingresar un usuario
async function nuevoUsuario(email,nombre,password,anios,especialidad,foto) {
  try {
      const result = await pool.query(
          `INSERT INTO skaters 
          (email,nombre,password,anos_experiencia,especialidad,foto,estado)
          VALUES ('${email}','${nombre}','${password}','${anios}','${especialidad}','${foto}',false)
          RETURNING *`
      )
  } catch (e) {
      console.log(e);
  }
}

// Función asincrónica para cambiar el estado de un usuario
async function setUsuarioStatus(id,estado) {
  const result =  await pool.query(
      `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
  )

  const usuario = result.rows[0];
  return usuario;
}

// Función asincrónica para solicitar email y password de usuario
async function conseguirUsuario(email,password) {
  try {
      const result = await pool.query(`SELECT * FROM skaters 
                                      WHERE email = '${email}' AND
                                      password = '${password}'`);
      return result.rows;
  } catch (e) {
      console.log(e);
  }
}

// Función asincrónica para cambiar estado de la cuenta de usuario
async function setUsuarioStatus(id,estado) {
  const result =  await pool.query(
      `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
  )

  const usuario = result.rows[0];
  return usuario;
}

// Función asincrónica para editar datos de usuario
async function setDatosUsuario(email,nombre,password,anios,especialidad) {
  const result =  await pool.query(
      `UPDATE skaters SET 
          nombre = '${nombre}',
          password = '${password}',
          anos_experiencia = ${anios},
          especialidad = '${especialidad}'
          WHERE email = '${email}' RETURNING *`
  )

  const usuario = result.rows[0];
  return usuario;
}

// Función asincrónica para eliminar cuenta
async function eliminarCuenta (email) {
  const result = await pool.query(`
      DELETE FROM skaters WHERE email = '${email}'
  `);

  return result.rowCount;
}

module.exports = { 
  consultarUsuarios,
  nuevoUsuario,
  setUsuarioStatus,
  conseguirUsuario,
  setDatosUsuario,
  eliminarCuenta };