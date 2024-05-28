//Se importa dependencias
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser"); //es necesario...
//const { engine } = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors"); // en caso de ..
const fs = require("fs");
//const axios = require("axios");
const jwt = require("jsonwebtoken");
const PORT = 3000; //se define el Puerto se puede omitir elevando
const app = express(); //se crea la instancia
const secretKey = "Secret_Key";


//Se importa BBDD
const {
    consultarUsuarios,
    nuevoUsuario,
    setUsuarioStatus,
    conseguirUsuario,
    setDatosUsuario,
    eliminarCuenta
} = require('./models/index');
//const fileUpload = require("express-fileupload");

//Middleware
app.use(express.json()); //analizar solicitudes en json
app.use(express.urlencoded({ extended: false })); //analizar solicitudes condatos codificados
//app.use(fileUpload()); //habilita la carga de archivos
app.use(express.static(path.join(__dirname, './assets'))); 
app.use(cors()); // se habilita CORS

// Middleware para express-fileupload
app.use( expressFileUpload({
    limits: { fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: 'El peso del archivo que intentas subir supera el limite permitido',
})
)

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Llamado del server
app.listen(PORT, () => {
    console.log(`Voila...el Server está funcionando en el puerto ${PORT}`);
});

// Manejo de errores para visualizarlo en consola
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Error interno del servidor");
});



//Ruta que apunta al html principal
// app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/views/login")
// });

// Ruta raíz Index
app.get('/', (req, res) => {
    try {
        console.log("Se ha accedido a la ruta raíz: Index");
        res.render('index');
    } catch (e) {//e es la variable que contiene el error
        console.error(`Error  ${e}`, error);
        res.status(500).send("Error interno");
    }
});

//Ruta raíz que renderiza a Registro
app.get("/registro", (req, res) => {
    try {
        console.log("Se ha accedido a la ruta raíz");
        res.render('Registro');
    } catch (e) {
        console.error(`Error ${e}`, error);
        res.status(500).send("Error interno");
    }
});

// Ruta para login
app.get('/login',(req,res) => {
    res.render('Login')
})

//Ruta para admin
app.get('/admin', async (req,res) => {
    try {
        const usuarios = await consultarUsuarios()
        res.render('Admin', { usuarios })
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

//app.use(express.static(path.join(__dirname, './assets')));
//app.use(express.static(path.join(__dirname, 'public'))); //Se sirve archivos estaticos


//Handlebars
//app.engine("handlebars", exphbs());

// app.engine('handlebars', 
//     exphbs.engine({ //
//         defaultLayout: 'Login', // Establece a Login como pagina principal por defecto
//         layoutsDir: path.join(__dirname, 'mainLayout'), //especifica el directorio donde se encuentra los layouts  
//         partialsDir: path.join(__dirname, '/views/mainLayout'), // especifica el directorio donde se encuentra las vistas parciales
// }));



app.set("view engine", "handlebars"); //establece handlebars como el motor de vistas para la aplicación express
app.set('views', path.join(__dirname, 'views')); //Ruta donde se encuentran las vistas

app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/mainLayout',
    })
)
// //Cargar imagen
// // Handle file upload
// app.post('/upload', (req, res) => {
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     const file = req.files.file;
//     file.mv(path.join(__dirname, 'assets', 'img', file.name), (err) => {
//         if (err) {
//             return res.status(500).send(err);
//         }
//         res.send('File uploaded successfully.');
//     });
// });


//seguridad

// Middleware para verificar el token JWT
// const verifyToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     jwt.verify(token, secretKey, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         req.user = decoded;
//         next();
//     });
// };

// Rutas protegidas
// app.get('/protected-route', verifyToken, (req, res) => {
//     // Esta ruta solo es accesible con un token JWT válido
//     res.json({ message: 'This is a protected route.' });
// });

// Ruta GET /usuarios
app.get('/usuarios', async (req,res) => {
    const respuesta = await consultarUsuarios();
    res.send(respuesta);
})

// Ruta POST /usuario
app.post('/usuario', async (req,res) => {
    const { email,nombre,password,anios,especialidad,nombre_foto } = req.body; 

    try {
        const respuesta = await nuevoUsuario(email,nombre,password,anios,especialidad,nombre_foto);
        res.status(201).send(respuesta);
    } catch (e) { 
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta POST /subir_foto
// app.post('/registrar',async (req,res) => {

//     const { email,nombre,password,password_2,anios,especialidad } = req.body;
//     const { foto } = req.files;
//     const { name } = foto;

//     if ( password !== password_2) { 
//         res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
//     } else {
//         try {
//             const respuesta = await nuevoUsuario(email,nombre,password,anios,especialidad) //,name omitida que apunta a la foto
//             .then(() => {
//                 foto.mv(`${__dirname}/public/uploads/${name}`,(err) => {
//                     res.send('<script>alert("Se ha registrado con éxito."); window.location.href = "/login"; </script>');
//                 });
//             })
            
//         } catch (e) {
//             res.status(500).send({
//                 error: `Algo salió mal... ${e}`,
//                 code: 500
//             })
//         }
//     }
// })

//Opcion 2
// app.post('/registrar', async (req, res) => {
//     const { email, nombre, password, password_2, anios, especialidad } = req.body;
//     const { foto } = req.files || {}; // Asegurarse de que req.files no sea undefined

//     console.log('Datos recibidos del formulario:', { email, nombre, password, password_2, anios, especialidad });
//     console.log('Archivo recibido:', foto);

//     if (password !== password_2) {
//         return res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
//     }

//     try {
//         const respuesta = await nuevoUsuario(email, nombre, password, anios, especialidad); // name omitida que apunta a la foto

//         if (foto && foto.name) {
//             const { name } = foto;
//             const uploadPath = path.join(__dirname, 'public', 'assets', 'img', name);
//             foto.mv(`${__dirname}./public/assets/img/${name}`, (err) => 
//                 {
//                 console.log('Archivo recibido', req.files);
//                 if (err) {
//                     return res.status(500).send({
//                         error: `Error al subir la foto: ${err}`,
//                         code: 500
//                     });
//                 }
//                 return res.send('<script>alert("Se ha registrado con éxito."); window.location.href = "/login"; </script>');
//             });
//         } else {
//             console.log('No se recibio ningún archivo')
//             return res.send('<script>alert("Se ha registrado con éxito, pero no se subió ninguna foto."); window.location.href = "/login"; </script>');
//         }
//     } catch (e) {
//         res.status(500).send({
//             error: `Algo salió mal... ${e}`,
//             code: 500
//         });
//     }
// });

//opcion 3: -> esta funciona
// Ruta POST /registrar
// app.post('/registrar', async (req, res) => {
//     const { email, nombre, password, password_2, anios, especialidad } = req.body;
//     const { foto } = req.files || {}; // Asegurarse de que req.files no sea undefined

//     console.log('Datos recibidos del formulario:', { email, nombre, password, password_2, anios, especialidad });
//     console.log('Archivo recibido:', foto);

//     if (password !== password_2) {
//         return res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
//     }

//     try {
//         const respuesta = await nuevoUsuario(email, nombre, password, anios, especialidad); // name omitida que apunta a la foto

//         if (foto && foto.name) {
//             const { name } = foto;
//             const uploadPath = path.join(__dirname,'public', 'assets', 'img', name);

//             // Crear el directorio si no existe, esto es opcional en realidad
//             const dir = path.dirname(uploadPath);
//             if (!fs.existsSync(dir)) {
//                 fs.mkdirSync(dir, { recursive: true });
//             }

//             foto.mv(uploadPath, (err) => {
//                 if (err) {
//                     console.error('Error al subir la foto:', err);
//                     return res.status(500).send({
//                         error: `Error al subir la foto: ${err}`,
//                         code: 500
//                     });
//                 }
//                 return res.send('<script>alert("Se ha registrado con éxito."); window.location.href = "/login"; </script>');
//             });
//         } else {
//             return res.send('<script>alert("Se ha registrado con éxito, pero no se subió ninguna foto."); window.location.href = "/login"; </script>');
//         }
//     } catch (e) {
//         console.error('Error en el servidor:', e);
//         res.status(500).send({
//             error: `Algo salió mal... ${e}`,
//             code: 500
//         });
//     }
// });

//Opcion 4: test
// Ruta POST /registrar
app.post('/registrar', async (req, res) => {
    const { email, nombre, password, password_2, anios, especialidad } = req.body;
    const { foto } = req.files || {}; // Asegurarse de que req.files no sea undefined

    console.log('Datos recibidos del formulario:', { email, nombre, password, password_2, anios, especialidad });
    console.log('Archivo recibido:', foto);

    if (password !== password_2) {
        return res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
    }

    let fotoPath = '';
    if (foto && foto.name) {
        const { name } = foto;
        fotoPath = `assets/img/${name}`;
        const uploadPath = path.join(__dirname, 'public', fotoPath);

        // Crear el directorio si no existe, esto es opcional en realidad
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        foto.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error al subir la foto:', err);
                return res.status(500).send({
                    error: `Error al subir la foto: ${err}`,
                    code: 500
                });
            }
        });
    } else {
        return res.send('<script>alert("Se ha registrado con éxito, pero no se subió ninguna foto."); window.location.href = "/login"; </script>');
    }

    try {
        const respuesta = await nuevoUsuario(email, nombre, password, anios, especialidad, fotoPath);
        return res.send('<script>alert("Se ha registrado con éxito."); window.location.href = "/login"; </script>');
    } catch (e) {
        console.error('Error en el servidor:', e);
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        });
    }
});


// Ruta PUT para cambiar estado de usuario
app.put('/usuarios', async (req,res) => {
    const { id,estado } = req.body;
    try {
        const usuario = await setUsuarioStatus(id,estado);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta POST para inicio de sesión
app.post('/verify', async (req,res) => {
    const { email,password } = req.body;
    const user = await conseguirUsuario(email,password)

    if (email === '' || password === '') {
        res.status(401).send({
            error:'Debe llenar todos los campos',
            code: 401,
        })
    } else {

        if(user.length != 0 ) {
            if ( user[0].estado === true) {
                const token = jwt.sign(
                    {
                        exp: Math.floor(Date.now() / 1000) + 180,
                        data: user,
                    },
                    secretKey
                );
                res.send(token);
            } else {
                res.status(401).send({
                    error:'El registro de este usuario no ha sido aprobado',
                    code: 401,
                })
            }
        } else {
            res.status(404).send({
                error: 'Este usuario no está registrado en la base de datos o la contraseña es incorrecta.',
                code: 404,
            });
        }
    }
    
});

// Ruta para datos
app.get('/datos',(req,res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        const { data } = decoded
        const email = data[0].email;
        const nombre = data[0].nombre;
        const password = data[0].password;
        const anos_experiencia = data[0].anos_experiencia;
        const especialidad = data[0].especialidad;
        err
            ? res.status(401).send({
                error : '401 Unauthorized',
                message: 'Usted no está autorizado para estar aquí',
                token_error: err.message,
            })
            : res.render('datos', { email,nombre,password,anos_experiencia,especialidad })
    })
})

// Ruta GET /datos_usuario
app.get('/datos_usuario', async (req,res) => {
    const respuesta = await consultarUsuarios();
    res.send(respuesta);
})


// Ruta PUT para cambiar datos de usuario
app.put('/datos_perfil', async (req,res) => {
    const { email,nombre,password,anios,especialidad } = req.body;

    try {
        const usuario = await setDatosUsuario(email,nombre,password,anios,especialidad);
        res.status(200).send(usuario);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})

// Ruta DELETE para eliminar cuenta
app.delete('/eliminar_cuenta/:email', async (req,res) => {
    
    try {
        const { email } = req.params;
        const respuesta = await eliminarCuenta(email);
        res.sendStatus(200).send(respuesta);
        
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    }
})




//Routes
// app.use("/", require("./routes/users")); //importa el modulo desde el archivo routes/users
// app.use("/auth", require("./routes/auth")); // importa el modulo desde el archivo routes/auth

