const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt'); // Importar bcrypt para el cifrado
const path = require('path');
const bodyParser = require('body-parser');
const { AssemblyAI } = require('assemblyai');
const { CohereClientV2 } = require('cohere-ai'); 
const { createCanvas } = require('canvas');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Console } = require('console');

const db = require(path.join(__dirname, 'config', 'db'));

const app = express();
//const PORT = 3000;
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Asegúrate de manejar JSON en el servidor




//
app.use(
    session({
        secret: 'C1AvE@4202', // Cambia esta clave por algo seguro
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true }, // Cambia a `true` si usas HTTPS
    })
);



// Ruta para el formulario de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'index.html'));
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    // Redirigir al inicio de sesión si no está autenticado
    res.redirect('/'); // Ajusta la ruta '/login' a la URL de tu pantalla de inicio de sesión
}

// Ruta para el dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '/views', 'dashboard.html'));
});

//

// Ruta para validar el login
app.post('/validate-login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Usuario y contraseña son obligatorios.' });
    }

    try {
        const query = 'SELECT * FROM adm_usuario WHERE usuario = ?';
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error('Error al consultar la base de datos:', err);
                return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
            }

            if (results.length === 0) {
                return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
            }

            const user = results[0];

            // Verificar la contraseña cifrada
            const passwordMatch = await bcrypt.compare(password, user.clave);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
            }

            // Almacenar los datos del usuario en la sesión
            req.session.user = {
                username: user.usuario,
                role: user.permiso || 'user', // Asegúrate de que la columna `role` existe o ajusta según tu esquema
                name: user.nombre,
                mail: user.correo,
            };

            
            return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso.', user: req.session.user });
            
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

app.get('/api/user-info', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    res.status(200).json(req.session.user); // Envía los datos del usuario al cliente
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
        }
        // Redirigir al inicio de sesión
        res.redirect('/'); // Cambia '/login' por la ruta a tu pantalla de inicio
    });
});

// Ruta para crear o actualizar cliente y proyecto
/* app.post('/crear-proyecto', (req, res) => {
    const { nombreProyecto, descripcion, rucCedula, nombreCliente, direccion, telefono, correo } = req.body;

    // Validar que el cliente exista
    const queryCliente = `SELECT * FROM com_cliente WHERE cedula_ruc = ?`;
    db.query(queryCliente, [rucCedula], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar cliente' });
        }

        if (results.length > 0) {
            // Si el cliente existe, actualizarlo
            const clienteId = results[0].id_cliente;
            const updateCliente = `
                UPDATE com_cliente SET 
                    nombre = ?, 
                    direccion = ?, 
                    telefono = ?, 
                    correo = ? 
                WHERE id_cliente = ?
            `;
            db.query(updateCliente, [nombreCliente, direccion, telefono, correo, clienteId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar cliente' });
                }

                // Insertar proyecto asociado
                insertarProyecto(clienteId);
            });
        } else {
            // Si el cliente no existe, crearlo
            const insertCliente = `
                INSERT INTO com_cliente (cedula_ruc, nombre, direccion, telefono, correo)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertCliente, [rucCedula, nombreCliente, direccion, telefono, correo], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear cliente' });
                }

                const clienteId = result.insertId;

                // Insertar proyecto asociado
                insertarProyecto(clienteId);
            });
        }

        // Función para insertar proyecto
        function insertarProyecto(clienteId) {
            const insertProyecto = `
                INSERT INTO com_proyecto (nombre, descripcion, id_cliente)
                VALUES (?, ?, ?)
            `;
            db.query(insertProyecto, [nombreProyecto, descripcion, clienteId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear proyecto' , success: false });
                }

                return res.status(200).json({ message: 'Proyecto creado con éxito' , success: true});
            });
        }
    });
}); */
// =========================================================================================================
// =================================BLOQUE DE USUARIO=========================================

//TRAE USUARIOS
app.get('/api/usuarios', (req, res) => {
    const query = `SELECT usuario, nombre, correo, estado FROM adm_usuario`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err.message);
            return res.status(500).json({ error: 'Error al obtener los usuarios' });
        }

        res.json(results); // Devuelve los resultados como JSON
    });
});

// Ruta para crear un nuevo usuario
/* app.post('/api/usuarios/crear', (req, res) => {
    const { username, nombre, correo, password, estado } = req.body;

    // Validamos los datos recibidos
    if (!username || !nombre || !correo || !password || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Cifrar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error al cifrar la contraseña:', err);
            return res.status(500).json({ error: 'Error al cifrar la contraseña' });
        }

        // Crear la consulta SQL para insertar el nuevo usuario
        const query = `
            INSERT INTO adm_usuario (usuario, nombre, correo, clave, estado)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Ejecutamos la consulta
        db.query(query, [username, nombre, correo, hashedPassword, estado], (err, result) => {
            if (err) {
                console.error('Error al insertar el usuario:', err.message);
                return res.status(500).json({ error: 'Error al guardar el usuario' });
            }

            res.status(201).json({ message: 'Usuario creado exitosamente' });
        });
    });
}); */

/* app.post('/api/usuarios/crear', (req, res) => {
    const { username, nombre, correo, password, permission, estado } = req.body;

    // Validamos los datos recibidos
    let errors = {};

    // Validar si el usuario existe
    const checkUsernameQuery = `SELECT * FROM adm_usuario WHERE usuario = ?`;
    db.query(checkUsernameQuery, [username], (err, results) => {
        if (err) {
            console.error('Error al consultar el nombre de usuario:', err.message);
            return res.status(500).json({ error: 'Error al verificar el usuario' });
        }

        if (results.length > 0) {
            errors.username = 'El nombre de usuario ya está en uso.';
        }

        // Validar el correo
        if (!validator.isEmail(correo)) {
            errors.email = 'El correo electrónico no es válido.';
        } 

        // Validar si el correo ya está registrado
        const checkEmailQuery = `SELECT * FROM adm_usuario WHERE correo = ?`;
        db.query(checkEmailQuery, [correo], (err, results) => {
            if (err) {
                console.error('Error al consultar el correo:', err.message);
                return res.status(500).json({ error: 'Error al verificar el correo' });
            }

            if (results.length > 0) {
                errors.email = 'El correo electrónico ya está registrado.';
            }

            // Validar otros campos
            if (!username || username.trim() === '') {
                errors.username = 'El nombre de usuario es obligatorio.';
            }

            if (!nombre || nombre.trim() === '') {
                errors.name = 'El nombre es obligatorio.';
            }

            if (!correo || correo.trim() === '') {
                errors.email = 'El correo electrónico es obligatorio.';
            }

            if (!password || password.trim() === '') {
                errors.password = 'La contraseña es obligatoria.';
            }

            if (!estado || estado.trim() === '') {
                errors.estado = 'El estado es obligatorio.';
            } 

            // Si hay errores, respondemos con los errores
            if (Object.keys(errors).length > 0) {
                return res.status(400).json(errors);
            }

            // Si no hay errores, ciframos la contraseña
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error al cifrar la contraseña:', err);
                    return res.status(500).json({ error: 'Error al cifrar la contraseña' });
                }

                // Crear la consulta SQL para insertar el nuevo usuario
                const query = `
                    INSERT INTO adm_usuario (usuario, nombre, correo, clave, permiso, estado)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                // Ejecutamos la consulta
                db.query(query, [username, nombre, correo, hashedPassword, permission, estado], (err, result) => {
                    if (err) {
                        console.error('Error al insertar el usuario:', err.message);
                        return res.status(500).json({ error: 'Error al guardar el usuario', success: false });
                    }

                    res.status(201).json({ message: 'Usuario creado exitosamente', success: true });
                });
            });
        });
    });
}); */

app.post('/api/usuarios/crear', async (req, res) => {
    const { username, nombre, correo, password, permission, estado } = req.body;

    // Validamos los datos recibidos
    let errors = {};

    try {
        // Validar si el usuario existe
        const checkUsernameQuery = `SELECT * FROM adm_usuario WHERE usuario = ?`;
        const usernameResults = await new Promise((resolve, reject) => {
            db.query(checkUsernameQuery, [username], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (usernameResults.length > 0) {
            errors.username = 'El nombre de usuario ya está en uso.';
        }

        // Validar si el correo ya está registrado
        const checkEmailQuery = `SELECT * FROM adm_usuario WHERE correo = ?`;
        const emailResults = await new Promise((resolve, reject) => {
            db.query(checkEmailQuery, [correo], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (emailResults.length > 0) {
            errors.email = 'El correo electrónico ya está registrado.';
        }

        // Validar otros campos
        if (!username || username.trim() === '') {
            errors.username = 'El nombre de usuario es obligatorio.';
        }

        if (!nombre || nombre.trim() === '') {
            errors.name = 'El nombre es obligatorio.';
        }

        if (!correo || correo.trim() === '') {
            errors.email = 'El correo electrónico es obligatorio.';
        }

        if (!password || password.trim() === '') {
            errors.password = 'La contraseña es obligatoria.';
        }

        if (!estado || estado.trim() === '') {
            errors.estado = 'El estado es obligatorio.';
        }

        // Si hay errores, respondemos con los errores
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }

        // Si no hay errores, ciframos la contraseña
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return reject(err);
                resolve(hashedPassword);
            });
        });

        // Crear la consulta SQL para insertar el nuevo usuario
        const query = `
            INSERT INTO adm_usuario (usuario, nombre, correo, clave, permiso, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // Ejecutamos la consulta para insertar el nuevo usuario
        db.query(query, [username, nombre, correo, hashedPassword, permission, estado], (err, result) => {
            if (err) {
                console.error('Error al insertar el usuario:', err.message);
                return res.status(500).json({ error: 'Error al guardar el usuario' });
            }

            res.status(201).json({ message: 'Usuario creado exitosamente', success: true });
        });
    } catch (err) {
        console.error('Error en la validación o procesamiento del usuario:', err.message);
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud' });
    }
});


// Ruta para eliminar un usuario por el campo "usuario"
app.delete('/api/usuarios/:usuario', (req, res) => {
    const username = req.params.usuario;

    // Ejemplo de eliminación en una base de datos usando callbacks
    db.query('DELETE FROM adm_usuario WHERE usuario = ?', [username], (error, result) => {
        if (error) {
            console.error('Error en la ruta DELETE /api/usuarios/:usuario:', error);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

        if (result.affectedRows === 0) {
            // Usuario no encontrado
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Respuesta exitosa
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    });
});


// Ruta específica para obtener detalles de un usuario
app.get('/api/usuarios-only/:usuario', async (req, res) => {
    const { usuario } = req.params;

    try {
        // Convertir la conexión a Promesas
        const connection = db.promise();

        // Ejecutar la consulta
        const [rows] = await connection.query(
            'SELECT usuario, nombre, correo, estado, permiso FROM adm_usuario WHERE usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(rows[0]); // Enviar el primer usuario encontrado
    } catch (error) {
        console.error('Error al obtener detalles del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Ruta para actualizar los detalles de un usuario específico
app.put('/api/usuarios-edit/:usuario', async (req, res) => {
    const { usuario } = req.params;
    const { nombre, correo, password, permission, estado } = req.body;
    // Validamos los datos recibidos
    let errors = {};

    try {

        // Validar otros campos
        if (!usuario || usuario.trim() === '') {
            errors.username = 'El nombre de usuario es obligatorio.';
        }

        if (!nombre || nombre.trim() === '') {
            errors.name = 'El nombre es obligatorio.';
        }

        if (!correo || correo.trim() === '') {
            errors.email = 'El correo electrónico es obligatorio.';
        }

        /* if (!password || password.trim() === '') {
            errors.password = 'La contraseña es obligatoria.';
        } */

        if (!estado || estado.trim() === '') {
            errors.estado = 'El estado es obligatorio.';
        }

        if (!permission || permission.trim() === '') {
            errors.permiso = 'El permiso es obligatorio.';
        }

        // Si hay errores, respondemos con los errores
        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }

        // Convertir la conexión a Promesas
        const connection = db.promise();

        // Verificar si el usuario existe en la base de datos
        const [rows] = await connection.query(
            'SELECT * FROM adm_usuario WHERE usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        

        // Crear una lista de los campos que se deben actualizar
        const updatedFields = {};
        if (nombre) updatedFields.nombre = nombre;
        if (correo) updatedFields.correo = correo;
        if (permission) updatedFields.permiso = permission;
        if (estado) updatedFields.estado = estado;

        // Si se proporciona una nueva contraseña, la actualizamos también
        if (password) {
            // Si no hay errores, ciframos la contraseña
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) return reject(err);
                    resolve(hashedPassword);
                });
            });
            updatedFields.clave = hashedPassword; // Aquí puedes agregar lógica para encriptar la contraseña si es necesario
        }

        // Realizar la actualización en la base de datos
        const updateQuery = 'UPDATE adm_usuario SET ? WHERE usuario = ?';
        const [updateResult] = await connection.query(updateQuery, [updatedFields, usuario]);

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: 'No se pudo actualizar el usuario.' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});
//================
//===================================================================================================================

//===================================================================================================================
//===============================BLOQUE DE PROYECTO==================================================================

// Obtener todos los proyectos con detalles del cliente
app.get('/api/proyectos', (req, res) => {
    const sql = `
        SELECT 
            p.id_proyecto,
            p.nombre AS proyecto_nombre,
            c.nombre AS cliente_nombre,
            c.cedula_ruc,
            c.telefono,
            c.correo,
            p.estado,
            p.descripcion,
            p.fecha_ingreso
        FROM com_proyecto p
        LEFT JOIN com_cliente c ON p.id_cliente = c.id_cliente
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los proyectos.' });
        } else {
            res.json(results);
        }
    });
});

// Obtener un proyecto específico con detalles del cliente
app.get('/api/proyectos/:id', (req, res) => {
    const sql = `
        SELECT 
            p.id_proyecto,
            p.nombre AS proyecto_nombre,
            c.nombre AS cliente_nombre,
            c.cedula_ruc,
            c.direccion,
            c.telefono,
            c.correo,
            p.estado,
            p.descripcion,
            p.fecha_ingreso
        FROM com_proyecto p
        LEFT JOIN com_cliente c ON p.id_cliente = c.id_cliente
        WHERE p.id_proyecto = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener el proyecto.' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Proyecto no encontrado.' });
        } else {
            res.json(result[0]);
        }
    });
});

// Crear un nuevo proyecto
app.post('/api/proyectos', (req, res) => {
    const { projectName, description, ruc, clientName, address, phone, email, status } = req.body;

    // Validar que el cliente exista
    const queryCliente = `SELECT * FROM com_cliente WHERE cedula_ruc = ?`;
    db.query(queryCliente, [ruc], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar cliente' });
        }

        if (results.length > 0) {
            // Si el cliente existe, actualizarlo
            const clienteId = results[0].id_cliente;
            const updateCliente = `
                UPDATE com_cliente SET 
                    nombre = ?, 
                    direccion = ?, 
                    telefono = ?, 
                    correo = ? 
                WHERE id_cliente = ?
            `;
            db.query(updateCliente, [clientName, address, phone, email, clienteId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar cliente' });
                }

                // Insertar o actualizar proyecto asociado
                insertarActualizarProyecto(clienteId);
            });
        } else {
            // Si el cliente no existe, crearlo
            const insertCliente = `
                INSERT INTO com_cliente (cedula_ruc, nombre, direccion, telefono, correo)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertCliente, [ruc, clientName, address, phone, email], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al crear cliente' });
                }

                const clienteId = result.insertId;
                //Console.log("CAPTURA AL GRABAR ID PROYECTO",clienteId);
                // Insertar proyecto asociado
                insertarActualizarProyecto(clienteId);
            });
        }

        // Función para insertar o actualizar proyecto
        function insertarActualizarProyecto(clienteId) {
            const queryProyecto = `SELECT * FROM com_proyecto WHERE nombre = ? AND id_cliente = ?`;
            db.query(queryProyecto, [projectName, clienteId], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al buscar proyecto' });
                }

                if (results.length > 0) {
                    // Si el proyecto ya existe, actualizarlo
                    const updateProyecto = `
                        UPDATE com_proyecto SET 
                            descripcion = ?, 
                            estado = ? 
                        WHERE id_proyecto = ?
                    `;
                    db.query(updateProyecto, [description, status, results[0].id_proyecto], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error al actualizar proyecto' });
                        }

                        return res.status(200).json({ message: 'Proyecto actualizado con éxito', success: true });
                    });
                } else {
                    // Si el proyecto no existe, crearlo
                    const insertProyecto = `
                        INSERT INTO com_proyecto (nombre, descripcion, id_cliente, estado)
                        VALUES (?, ?, ?, ?)
                    `;
                    db.query(insertProyecto, [projectName, description, clienteId, status], (err) => {
                        if (err) {
                            return res.status(500).json({ error: 'Error al crear proyecto' });
                        }

                        return res.status(200).json({ message: 'Proyecto creado con éxito', success: true });
                    });
                }
            });
        }
    });
});

// Actualizar un proyecto existente
app.put('/api/proyectos/:idProyecto', (req, res) => {
    const { idProyecto } = req.params;
    const { nombreProyecto, descripcion, rucCedula, nombreCliente, direccion, telefono, correo , estado} = req.body;

    if (!idProyecto || !rucCedula || !nombreCliente || !nombreProyecto) {
        return res.status(400).json({ message: "ID del proyecto, Cédula/RUC, nombre del cliente y nombre del proyecto son obligatorios." });
    }

    // Buscar el cliente por su cédula o RUC
    const queryCliente = `SELECT * FROM com_cliente WHERE cedula_ruc = ?`;
    db.query(queryCliente, [rucCedula], (err, results) => {
        if (err) {
            console.error('Error al buscar el cliente:', err);
            return res.status(500).json({ message: "Error al buscar cliente." });
        }

        if (results.length > 0) {
            // El cliente existe, actualizarlo
            const clienteId = results[0].id_cliente;
            const updateCliente = `
                UPDATE com_cliente
                SET nombre = ?, direccion = ?, telefono = ?, correo = ?
                WHERE id_cliente = ?
            `;
            db.query(updateCliente, [nombreCliente, direccion, telefono, correo, clienteId], (err) => {
                if (err) {
                    console.error('Error al actualizar cliente:', err);
                    return res.status(500).json({ message: "Error al actualizar cliente." });
                }

                // Actualizar el proyecto
                actualizarProyecto(clienteId);
            });
        } else {
            // El cliente no existe, crearlo
            const insertCliente = `
                INSERT INTO com_cliente (cedula_ruc, nombre, direccion, telefono, correo)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertCliente, [rucCedula, nombreCliente, direccion, telefono, correo], (err, result) => {
                if (err) {
                    console.error('Error al crear cliente:', err);
                    return res.status(500).json({ message: "Error al crear cliente." });
                }

                const clienteId = result.insertId;

                // Actualizar el proyecto
                actualizarProyecto(clienteId);
            });
        }

        // Función para actualizar proyecto
        function actualizarProyecto(clienteId) {
            const updateProyecto = `
                UPDATE com_proyecto
                SET nombre = ?, descripcion = ?, id_cliente = ?, estado = ?
                WHERE id_proyecto = ?
            `;
            db.query(updateProyecto, [nombreProyecto, descripcion, clienteId, estado, idProyecto], (err) => {
                if (err) {
                    console.error('Error al actualizar proyecto:', err);
                    return res.status(500).json({ message: "Error al actualizar proyecto." });
                }

                return res.status(200).json({ message: "Proyecto actualizado exitosamente." });
            });
        }
    });
});


///Trae todos los Clientes
app.get('/api/clientes', (req, res) => {
    const searchQuery = req.query.q; // Entrada del usuario

    const query = `
        SELECT cedula_ruc, nombre, direccion, correo, telefono
        FROM com_cliente
        WHERE cedula_ruc LIKE ? OR nombre LIKE ?
        LIMIT 10
    `;

    db.query(query, [`%${searchQuery}%`, `%${searchQuery}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al buscar clientes' });
        }

        res.status(200).json(results);
    });
});

// Eliminar un proyecto
app.delete('/api/proyectos/:id', (req, res) => {
    const sql = 'DELETE FROM com_proyecto WHERE id_proyecto = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar el proyecto.' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Proyecto no encontrado.' });
        } else {
            res.json({ success: true, message: 'Proyecto eliminado exitosamente.' });
        }
    });
});

// Ruta para obtener el ID del cuestionario
app.get('/api/proyecto/:idProyecto/cuestionario', async (req, res) => {
    const { idProyecto } = req.params;

    if (!idProyecto) {
        return res.status(400).json({ error: 'El ID del proyecto es obligatorio.' });
    }

    const query = `
        SELECT 
            pro.id_proyecto, 
            cue.id_transcripcion AS id_cuestionario
        FROM com_proyecto pro
        INNER JOIN com_transcripcion tra ON tra.id_proyecto = pro.id_proyecto 
        INNER JOIN com_cuestionario cue ON cue.id_proyecto = pro.id_proyecto 
            AND cue.id_transcripcion = tra.id_transcripcion
        WHERE pro.id_proyecto = ?
        GROUP BY pro.id_proyecto, cue.id_transcripcion
    `;

    try {
        const [rows] = await db.promise().query(query, [idProyecto]); // Usando Promises para evitar callbacks
        if (rows.length > 0) {
            res.status(200).json(rows); // Devuelve los resultados
        } else {
            res.status(404).json({ error: 'No se encontró el cuestionario para el proyecto especificado.' });
        }
    } catch (error) {
        console.error('Error al obtener el cuestionario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


//===================================================================================================================


//============================================================================================================
// BLOQUE DE GENERA VIDEOS

// Obtener todos los proyectos con transcripcion
app.get('/api/proyectos-videos', (req, res) => {
    const sql = `
        SELECT 
            p.id_proyecto,
            p.nombre AS proyecto_nombre,
            c.nombre AS cliente_nombre,
            c.cedula_ruc,
            c.telefono,
            c.correo,
            p.estado,
            p.descripcion,
            p.fecha_ingreso,
            CASE 
                WHEN t.generado = 'S' THEN 'S'
                ELSE 'N'
            END AS generado,
            t.id_transcripcion
        FROM com_proyecto p
        LEFT JOIN com_cliente c ON p.id_cliente = c.id_cliente
        LEFT JOIN com_transcripcion t ON t.id_proyecto = p.id_proyecto
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los proyectos.' });
        } else {
            res.json(results);
        }
    });
});


app.post('/generate-questions', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Contenido no proporcionado" });
    }

    const cohere = new CohereClientV2({
        token: 'QYGtWwsD3cNvr5KdCoUl9y6eQBmg6y9yCI35ZEqm', // Usa un token válido
    });

    try {
        const response = await cohere.chat({
            model: 'command-r-plus',
            messages: [
                {
                    role: 'user',
                    content: content,
                },
            ],
        });

        const texto = response.message;
        res.json({ texto });
    } catch (error) {
        console.error("Error generando preguntas:", error);
        res.status(500).json({ error: "Error al generar las preguntas" });
    }
});


//Transcribe
app.post('/transcribe', async (req, res) => {
    const { url } = req.body;

    // Validar que la URL esté presente
    if (!url) {
        return res.status(400).json({
            success: false,
            message: "La URL del audio o video no fue proporcionada."
        });
    }

    // Configuración del cliente de AssemblyAI
    const client = new AssemblyAI({ apiKey: "a243419e926d4867b0a14a8bfee852b1" });
    const config = {
        audio_url: url,
        language_code: 'es',
        audio_end_at: 280000, // Tiempo en milisegundos
        audio_start_from: 10   // Tiempo en milisegundos
    };

    try {
        // Realizar la transcripción
        const transcript = await client.transcripts.transcribe(config);

        // Verificar si se obtuvo un texto
        if (!transcript.text) {
            return res.status(500).json({
                success: false,
                message: "No se pudo obtener el texto de la transcripción."
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            success: true,
            transcript: transcript.text
        });
    } catch (error) {
        console.error("Error al transcribir el audio o video:", error);

        // Manejo de errores
        if (error.response && error.response.data) {
            return res.status(500).json({
                success: false,
                message: "Error en la respuesta de AssemblyAI.",
                details: error.response.data
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Error inesperado al procesar la transcripción."
            });
        }
    }
});

//Crea registro de transcripcion

app.post('/save-transcription', (req, res) => {
    const { idProyecto, texto } = req.body;

    if (!idProyecto || texto === undefined) {
        return res.status(400).json({ error: 'Datos insuficientes para guardar la transcripción.' });
    }

    // Convertir el texto a string si es un objeto
    const textoStr = typeof texto === 'object' ? JSON.stringify(texto) : texto;

    // Obtener el siguiente ID de transcripción
    const getNextTranscriptionId = (idProyecto, callback) => {
        /* const query = `
            SELECT COALESCE(MAX(id_transcripcion), 0) + 1 AS next_id_transcripcion
            FROM com_transcripcion
            WHERE id_proyecto = ?;
        `; */

        const query = `
            SELECT COALESCE(MAX(id_transcripcion), 0) + 1 AS next_id_transcripcion
            FROM com_transcripcion;
        `; 
        
        db.query(query, [idProyecto], (err, results) => {
            if (err) {
                console.error('Error al obtener el siguiente ID de transcripción:', err);
                return callback(err);
            }
            const nextId = results[0].next_id_transcripcion;
            callback(null, nextId);
        });
    };

    // Guardar la transcripción
    getNextTranscriptionId(idProyecto, (err, idTranscripcion) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el siguiente ID de transcripción.' });
        }

        const query = `
            INSERT INTO com_transcripcion 
            (id_proyecto, id_transcripcion, texto, generado, estado, usuario_ingreso) 
            VALUES (?, ?, ?, 
                CASE 
                    WHEN ? = '' THEN 'N' 
                    ELSE 'S' 
                END, 
                'ACTIVO', 'user1')
            ON DUPLICATE KEY UPDATE 
                texto = VALUES(texto),
                generado = CASE 
                    WHEN VALUES(texto) = '' THEN 'N' 
                    ELSE 'S' 
                END,
                estado = 'ACTIVO',
                usuario_modificacion = 'user1',
                fecha_modificacion = NOW()
        `;

        const values = [idProyecto, idTranscripcion, textoStr, textoStr];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error al guardar la transcripción:', err);
                return res.status(500).json({ error: 'Error interno al guardar la transcripción.' });
            }

            res.status(200).json({
                message: 'Transcripción guardada exitosamente.',
                idTranscripcion: idTranscripcion,
            });
        });
    });
});


//Graba cuestionario
// Función para procesar preguntas y respuestas
function procesarPreguntasYRespuestas(jsonContent, idProyecto, idTranscripcion) {
    const preguntas = [];
    const opciones = [];

    const texto = jsonContent; // Obtener el texto del JSON
    const lineas = texto.split("\n"); // Dividir en líneas

    let preguntaActual = null;

    lineas.forEach((linea, index) => {
        const preguntaMatch = linea.match(/^\d+\.\s(.+)/); // Detectar preguntas
        //const opcionMatch = linea.match(/^\s*-\s*([a-dA-D])\)\s*(.+?)\s*\((\d+)\)\s*$/);
        const opcionMatch = linea.match(/^\s*-\s*\(?([a-d])\)?\)\s*(.+?)\s*\((\d+)\)\s*$/); // Detectar opciones con coincidencias
        
        if (preguntaMatch) {
            // Si es una pregunta, guardar la anterior y empezar una nueva
            //console.log(`Procesando línea ${index + 1}: "${linea}"`);
            if (preguntaActual) {
                preguntas.push(preguntaActual);
            }
            preguntaActual = {
                idProyecto,
                idTranscripcion,
                orden: preguntas.length + 1,
                descripcion: preguntaMatch[1],
                opciones: [],
            };
        } else if (opcionMatch && preguntaActual) {
            // Si es una opción, agregarla a la pregunta actual
            //console.log("Alternativa:", opcionMatch);
            const [,, descripcion, coincidencias] = opcionMatch;
            preguntaActual.opciones.push({
                idProyecto,
                idTranscripcion,
                idPregunta: preguntaActual.orden,
                orden: preguntaActual.opciones.length + 1,
                descripcion: descripcion.trim(),
                coincidencias: coincidencias ? parseInt(coincidencias.trim(), 10) : 0 , // Si no hay coincidencias, asumir 0
            });
        }else {
            //console.log("No se detectó ni pregunta ni opción para la línea:", linea);
        }
    });

    // Guardar la última pregunta
    if (preguntaActual) {
        preguntas.push(preguntaActual);
    }

    return { preguntas, opciones: preguntas.flatMap(p => p.opciones) };
}

// Guardar en la base de datos
function guardarCuestionarioEnBaseDeDatos(preguntas, opciones) {
    preguntas.forEach(async (pregunta) => {
        const queryPregunta = `
            INSERT INTO com_cuestionario 
            (id_transcripcion, id_proyecto, id_pregunta, orden, descripcion, pregunta, estado, usuario_ingreso) 
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO', 'user1')
        `;

        db.query(queryPregunta, [
            pregunta.idTranscripcion,
            pregunta.idProyecto,
            pregunta.orden,
            pregunta.orden.toString(),
            pregunta.descripcion,
            `Pregunta ${pregunta.orden}`,
        ], (err) => {
            if (err) {
                console.error(`Error al insertar la pregunta: ${pregunta.descripcion}`, err);
            } else {
                //console.log(`Pregunta insertada correctamente: ${pregunta.descripcion}`);
            }
        });
    });

    opciones.forEach(async (opcion) => {
        const queryOpcion = `
            INSERT INTO com_cuestionario_alternativa 
            (id_proyecto, id_cuestionario, id_pregunta, id_alternativa, orden, descripcion, coincidencias, estado, usuario_ingreso) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO', 'user1')
        `;

        db.query(queryOpcion, [
            opcion.idProyecto,
            opcion.idTranscripcion,
            opcion.idPregunta,
            opcion.orden,
            opcion.orden.toString(),
            opcion.descripcion,
            opcion.coincidencias,
        ], (err) => {
            if (err) {
                console.error(`Error al insertar la opción: ${opcion.descripcion}`, err);
            } else {
                //console.log(`Opción insertada correctamente: ${opcion.descripcion}`);
            }
        });
    });
}

// Uso
app.post('/guardar-cuestionario', async (req, res) => {
    console.log('Cuerpo recibido:', req.body);

    const { idProyecto, idTranscripcion, text } = req.body;

    try {
        const { preguntas, opciones } = procesarPreguntasYRespuestas(text, idProyecto, idTranscripcion);

        guardarCuestionarioEnBaseDeDatos(preguntas, opciones);

        res.status(200).json({ message: 'Cuestionario guardado exitosamente.' });
    } catch (error) {
        console.error('Error al guardar el cuestionario:', error);
        res.status(500).json({ error: 'Error interno al guardar el cuestionario.' });
    }
});


//SELECT DE TODOS LOS CUESTIONARIOS
app.get('/api/cuestionarios', (req, res) => {
    const query = `select pro.id_proyecto, pro.nombre proyecto_nombre, tra.id_transcripcion, tra.generado, tra.estado  
                    from com_proyecto pro
                    inner join com_transcripcion tra ON tra.id_proyecto = pro.id_proyecto 
                    inner join com_cuestionario cue ON cue.id_proyecto = pro.id_proyecto and cue.id_transcripcion = tra.id_transcripcion 
                    group by pro.id_proyecto, tra.id_transcripcion `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener cuestionarios:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.status(200).json(results);
    });
});



//Imprimir reporte de cuestionario
app.get('/api/generar-reporte/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                enc.id_pregunta, 
                CAST(enc.orden AS SIGNED) AS pregunta_orden,
                enc.descripcion AS pregunta_descripcion,
                CAST(alt.orden AS SIGNED) AS alternativa_orden, 
                alt.descripcion AS alternativa_descripcion, 
                alt.coincidencias
            FROM com_cuestionario enc
            INNER JOIN com_cuestionario_alternativa alt 
                ON alt.id_cuestionario = enc.id_transcripcion 
                AND alt.id_proyecto = enc.id_proyecto 
                AND alt.id_pregunta = enc.id_pregunta
            WHERE enc.id_proyecto = ? 
            AND enc.id_transcripcion = ?
            ORDER BY 
                CAST(enc.orden AS SIGNED),
                CAST(alt.orden AS SIGNED);

        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron datos para generar el reporte.' });
        }

        // Crear PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_proyecto_${idProyecto}.pdf`);

        doc.fontSize(20).text('Reporte de Cuestionario', { align: 'center' });
        doc.fontSize(12).text(`Proyecto No: ${idProyecto}`);
        doc.fontSize(12).text(`Cuestionario No: ${idTranscripcion}`);
        doc.moveDown();

        // Escribir preguntas y alternativas
        let currentQuestion = null;
        rows.forEach((row) => {
            if (currentQuestion !== row.pregunta_orden) {
                doc.fontSize(14).text(`${row.pregunta_orden}. ${row.pregunta_descripcion}`);
                currentQuestion = row.pregunta_orden;
            }
            doc.fontSize(12).text(`    ${row.alternativa_orden}. ${row.alternativa_descripcion} `);
           // doc.fontSize(12).text(`    ${row.alternativa_orden}. ${row.alternativa_descripcion} (${row.coincidencias})`);
        });

        doc.end();
        doc.pipe(res); // Enviar el PDF al cliente

        /* const preguntasMap = new Map();

        rows.forEach((row) => {
            if (!preguntasMap.has(row.id_pregunta)) {
                preguntasMap.set(row.id_pregunta, {
                    orden: row.pregunta_orden,
                    descripcion: row.pregunta_descripcion,
                    opciones: [],
                });
            }

            preguntasMap.get(row.id_pregunta).opciones.push({
                orden: row.alternativa_orden,
                descripcion: row.alternativa_descripcion,
                coincidencias: row.coincidencias,
            });
        });

        const preguntas = Array.from(preguntasMap.values());

        generarReportePDF(idProyecto, idTranscripcion, preguntas, res); */
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});

//Imprimir estadistica
app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        let questionNumber = 1; // Para numerar las preguntas

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {

            if (doc.y > 500) { // Si el cursor está cerca del final de la página
                doc.addPage(); // Añade una nueva página
            }

            // Mostrar la pregunta con número
            doc.fontSize(12).text(`Pregunta ${questionNumber}:`, { underline: true });
            doc.fontSize(10).text(`${pregunta}`, { width: 450, align: 'justify' });
            questionNumber++;
            doc.moveDown(0.5);

            const total = alternativas.reduce((sum, alt) => sum + parseInt(alt.coincidencias, 10), 0);

            if (total === 0) {
                doc.fontSize(10).text('No hay datos suficientes para generar un gráfico.', { align: 'center' });
                doc.moveDown(1);
                continue;
            }

            // Mostrar alternativas
            /* alternativas.forEach((alt, index) => {
                doc.fontSize(8).text(
                    `${index + 1}. ${alt.descripcion} (${alt.coincidencias})`,
                    { width: 450, align: 'justify', indent: 20 }
                );
            }); */

            
            // Ajustar espacio antes del gráfico
            doc.moveDown(1);

            // Verifica nuevamente antes de agregar el gráfico
            if (doc.y > 650) {
                doc.addPage();
            }

            // Crear gráfico circular perfecto
            const canvas = createCanvas(700, 700); // Tamaño del gráfico ajustado
            const ctx = canvas.getContext('2d');

            const centerX = canvas.width / 5; // Centro X del círculo
            const centerY = canvas.height / 5; // Centro Y del círculo
            const radius = Math.min(centerX, centerY) / 2; // Reducir el radio a la mitad

            let startAngle = 0; // Ángulo inicial

            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) *( 2 * Math.PI); // Porción proporcional
                //console.log(`Pregunta ${questionNumber}:`,sliceAngle, `calculo: (${alt.coincidencias} / ${total}) *( 2 * ${Math.PI}))`);
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`; // Colores dinámicos
                ctx.beginPath();
                ctx.moveTo(centerX, centerY); // Punto central del círculo
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle); // Dibujar segmento
                ctx.closePath();
                ctx.fill();
                startAngle += sliceAngle; // Avanzar el ángulo inicial
            });

            // Leyenda dentro del gráfico
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(10, 10 + index * 15, 10, 10);

                ctx.fillStyle = '#000';
                ctx.font = '10px Arial';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 25, 18 + index * 15);
            });

            const imageBuffer = canvas.toBuffer('image/png');
            doc.image(imageBuffer, { fit: [500, 500], align: 'center' }); // Gráfico pequeño y centrado
            doc.moveDown(15); // Espacio después del gráfico
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
});

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        let questionNumber = 1; // Para numerar las preguntas

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            // Agregar título de la pregunta con número
            doc.fontSize(14).text(`Pregunta ${questionNumber}: ${pregunta}`, {
                underline: true,
                width: 500,
                align: 'justify',
            });
            questionNumber++;
            doc.moveDown(0.5);

            // Mostrar alternativas
            alternativas.forEach((alt, index) => {
                doc.fontSize(10).text(
                    `${index + 1}. ${alt.descripcion} (${alt.coincidencias})`,
                    { width: 450, align: 'justify', indent: 20 }
                );
            });

            doc.moveDown(0.5);

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            if (total === 0) {
                doc.fontSize(12).text('No hay datos suficientes para generar un gráfico.', { align: 'center' });
                doc.moveDown(1);
                continue;
            }

            // Crear gráfico
            const canvas = createCanvas(250, 250); // Gráfico más pequeño
            const ctx = canvas.getContext('2d');

            let startAngle = 0;
            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(125, 125);
                ctx.arc(125, 125, 125, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();
                startAngle += sliceAngle;
            });

            // Leyenda fuera del gráfico
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(10, 10 + index * 20, 15, 15);

                ctx.fillStyle = '#000';
                ctx.font = '8px Arial';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 30, 22 + index * 20);
            });

            const imageBuffer = canvas.toBuffer('image/png');
            doc.image(imageBuffer, { fit: [300, 300], align: 'center' }); // Gráfico centrado y ajustado
            doc.moveDown(1);

            // Espaciado entre preguntas
            doc.moveDown(2);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        let questionNumber = 1; // Para numerar las preguntas

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            // Agregar título de la pregunta con número
            doc.fontSize(14).text(`Pregunta ${questionNumber}: ${pregunta}`, { underline: true });
            questionNumber++;
            doc.moveDown(0.5);

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            if (total === 0) {
                doc.fontSize(12).text('No hay datos suficientes para generar un gráfico.', { align: 'center' });
                doc.moveDown(1);
                continue;
            }

            // Crear gráfico
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');

            let startAngle = 0;
            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();
                startAngle += sliceAngle;
            });

            // Leyenda dentro del gráfico
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 80%, 80%)`;
                ctx.fillRect(20, 20 + index * 20, 15, 15);

                ctx.fillStyle = '#000';
                ctx.font = '10px sans-serif'; // Fuente más pequeña para las alternativas
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 40, 30 + index * 20);
            });

            const imageBuffer = canvas.toBuffer('image/png');
            doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
            doc.moveDown(1);

            // Espaciado entre preguntas
            doc.moveDown(2);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            // Agregar título de la pregunta
            doc.fontSize(14).text(`Pregunta: ${pregunta}`, { underline: true });
            doc.moveDown(0.5);

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            if (total === 0) {
                doc.fontSize(12).text('No hay datos suficientes para generar un gráfico.', { align: 'center' });
                doc.moveDown(1);
                continue;
            }

            // Crear gráfico
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');

            let startAngle = 0;
            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();
                startAngle += sliceAngle;
            });

            // Agregar leyenda dentro del gráfico
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(20, 20 + index * 20, 15, 15);

                ctx.fillStyle = '#000';
                ctx.font = '16px sans-serif';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 40, 30 + index * 20);
            });

            const imageBuffer = canvas.toBuffer('image/png');
            doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
            doc.moveDown(1);

            // Espaciado entre preguntas
            doc.moveDown(2);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            doc.fontSize(14).text(`Pregunta: ${pregunta}`, { underline: true });
            doc.moveDown(0.5);

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            if (total === 0) {
                doc.fontSize(12).text('No hay datos suficientes para generar un gráfico.', { align: 'center' });
                doc.moveDown(1);
                continue;
            }

            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');

            let startAngle = 0;

            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;

                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                startAngle += sliceAngle;
            });

            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(250, 20 + index * 20, 15, 15);

                ctx.fillStyle = '#000';
                ctx.font = '16px sans-serif';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 270, 35 + index * 20);
            });

            const imageBuffer = canvas.toBuffer('image/png');
            doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
            doc.moveDown(1);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        // Consultar preguntas y alternativas desde la base de datos
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        // Organizar datos por pregunta
        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        // Crear el PDF
        const doc = new PDFDocument({ margin: 30 });
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(2);

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            // Encabezado de la pregunta
            doc.fontSize(14).text(`Pregunta: ${pregunta}`, { underline: true });
            doc.moveDown(0.5);

            // Crear gráfica de pastel
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                console.error('Error: No se pudo obtener el contexto 2D del canvas.');
                res.status(500).json({ error: 'No se pudo crear el canvas para los gráficos.' });
                return;
            }

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            let startAngle = 0;

            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;

                // Colores alternativos para las secciones
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                startAngle += sliceAngle;
            });

            // Leyenda
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(410, 20 + index * 20, 15, 15);

                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 430, 35 + index * 20);
            });

            const imageBuffer = canvas.toBuffer();
            doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
            doc.moveDown(1);

            console.log('Procesando pregunta:', pregunta);
            console.log('Buffer generado:', imageBuffer);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

/* app.get('/api/generar-estadisticas/:idProyecto/:idTranscripcion', async (req, res) => {
    const { idProyecto, idTranscripcion } = req.params;

    try {
        // Consultar preguntas y alternativas desde la base de datos
        const query = `
            SELECT 
                cue.id_pregunta, cue.descripcion AS pregunta, 
                alt.descripcion AS alternativa, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idTranscripcion]);

        // Organizar datos por pregunta
        const dataByQuestion = rows.reduce((acc, row) => {
            if (!acc[row.id_pregunta]) {
                acc[row.id_pregunta] = {
                    pregunta: row.pregunta,
                    alternativas: [],
                };
            }
            acc[row.id_pregunta].alternativas.push({
                descripcion: row.alternativa,
                coincidencias: row.coincidencias || 0,
            });
            return acc;
        }, {});

        // Crear el PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(16).text(`Reporte Estadístico - Proyecto ${idProyecto}`, { align: 'center' });
        doc.moveDown(1);

        for (const [idPregunta, { pregunta, alternativas }] of Object.entries(dataByQuestion)) {
            doc.fontSize(14).text(`Pregunta: ${pregunta}`, { underline: true });
            doc.moveDown(0.5);

            // Crear gráfica de pastel
            const canvas = createCanvas(400, 400);
            const ctx = canvas.getContext('2d');

            const total = alternativas.reduce((sum, alt) => sum + alt.coincidencias, 0);
            let startAngle = 0;

            alternativas.forEach((alt, index) => {
                const sliceAngle = (alt.coincidencias / total) * 2 * Math.PI;

                // Colores alternativos para las secciones
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.beginPath();
                ctx.moveTo(200, 200);
                ctx.arc(200, 200, 200, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();

                startAngle += sliceAngle;
            });

            // Agregar leyenda
            alternativas.forEach((alt, index) => {
                ctx.fillStyle = `hsl(${(index * 360) / alternativas.length}, 70%, 70%)`;
                ctx.fillRect(410, 20 + index * 20, 10, 10);

                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.fillText(`${alt.descripcion} (${alt.coincidencias})`, 430, 30 + index * 20);
            });

            const imageBuffer = canvas.toBuffer();
            doc.image(imageBuffer, { fit: [400, 400], align: 'center' });
            doc.moveDown(1);
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar el reporte estadístico:', error);
        res.status(500).json({ error: 'Error interno al generar el reporte estadístico.' });
    }
}); */

//obtiene id transcripcion
app.get('/api/proyecto/:idProyecto/transcripcion', async (req, res) => {
    const idProyecto = req.params.idProyecto;

    try {
        const query = `
            SELECT id_transcripcion 
            FROM com_transcripcion 
            WHERE id_proyecto = ? 
            ORDER BY fecha_ingreso DESC 
            LIMIT 1
        `;
        const [rows] = await db.promise().query(query, [idProyecto]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró una transcripción asociada.' });
        }

        res.status(200).json({ idTranscripcion: rows[0].id_transcripcion });
    } catch (error) {
        console.error('Error al obtener la transcripción:', error);
        res.status(500).json({ error: 'Error al obtener la transcripción.' });
    }
});

//preguntas
app.get('/api/cuestionariosdet/:idProyecto/:idCuestionario', async (req, res) => {
    const { idProyecto, idCuestionario } = req.params;

    if (!idProyecto || !idCuestionario) {
        return res.status(400).json({ error: 'El ID del proyecto y del cuestionario son obligatorios.' });
    }

    try {
        const query = `
            SELECT 
                cue.id_pregunta, cue.orden AS pre_orden, cue.descripcion AS pregunta, alt.id_alternativa, alt.descripcion AS alternativa,
                alt.orden AS alt_orden, alt.coincidencias
            FROM com_cuestionario cue
            LEFT JOIN com_cuestionario_alternativa alt
            ON cue.id_proyecto = alt.id_proyecto AND cue.id_transcripcion = alt.id_cuestionario AND cue.id_pregunta = alt.id_pregunta
            WHERE cue.id_proyecto = ? AND cue.id_transcripcion = ?
            ORDER BY cue.id_pregunta, alt.orden
        `;

        const [rows] = await db.promise().query(query, [idProyecto, idCuestionario]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron datos para el cuestionario solicitado.' });
        }

        const formattedData = rows.reduce((acc, row) => {
            let question = acc.find(q => q.id_pregunta === row.id_pregunta);
            if (!question) {
                question = {
                    id_pregunta: row.id_pregunta,
                    descripcion: row.pregunta,
                    orden: row.pre_orden,
                    alternativas: []
                };
                acc.push(question);
            }

            if (row.id_alternativa) {
                question.alternativas.push({
                    id_alternativa: row.id_alternativa,
                    descripcion: row.alternativa,
                    orden: row.alt_orden,
                    coincidencias: row.coincidencias || 0 // Si es null, asignar 0
                });
            }

            return acc;
        }, []);

        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error al obtener el cuestionario:', error);
        res.status(500).json({ error: 'Error interno al obtener el cuestionario.' });
    }
});

/* app.put('/api/cuestionarios/:idProyecto/:idCuestionario', async (req, res) => {
    const { idProyecto, idCuestionario } = req.params;
    const cuestionario = req.body;

    if (!idProyecto || !idCuestionario || !Array.isArray(cuestionario)) {
        return res.status(400).json({ error: 'Datos inválidos o incompletos.' });
    }

    try {
        // Iniciar transacción
        db.beginTransaction(async (err) => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error interno al iniciar la transacción.' });
            }

            try {
                for (const pregunta of cuestionario) {
                    // Actualizar la descripción de la pregunta
                    await new Promise((resolve, reject) => {
                        db.query(
                            `UPDATE com_cuestionario 
                             SET descripcion = ? 
                             WHERE id_proyecto = ? AND id_transcripcion = ? AND id_pregunta = ?`,
                            [pregunta.descripcion, idProyecto, idCuestionario, pregunta.id_pregunta],
                            (err) => {
                                if (err) return reject(err);
                                resolve();
                            }
                        );
                    });

                    for (const alternativa of pregunta.alternativas) {
                        // Actualizar la descripción, orden y coincidencias de la alternativa
                        await new Promise((resolve, reject) => {
                            db.query(
                                `UPDATE com_cuestionario_alternativa 
                                 SET descripcion = ?, orden = ?, coincidencias = ? 
                                 WHERE id_proyecto = ? AND id_cuestionario = ? AND id_pregunta = ? AND id_alternativa = ?`,
                                [
                                    alternativa.descripcion,
                                    alternativa.orden,
                                    alternativa.coincidencias,
                                    idProyecto,
                                    idCuestionario,
                                    pregunta.id_pregunta,
                                    alternativa.id_alternativa,
                                ],
                                (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                }
                            );
                        });
                    }
                }

                // Confirmar transacción
                db.commit((err) => {
                    if (err) {
                        console.error('Error al confirmar la transacción:', err);
                        db.rollback(() => {});
                        return res.status(500).json({ error: 'Error interno al confirmar la transacción.' });
                    }

                    res.status(200).json({ message: 'Cuestionario actualizado correctamente.' });
                });
            } catch (error) {
                console.error('Error al actualizar el cuestionario, transacción revertida:', error);
                db.rollback(() => {});
                res.status(500).json({ error: 'Error interno al actualizar el cuestionario.' });
            }
        });
    } catch (error) {
        console.error('Error general del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
}); */

app.put('/api/cuestionarios/:idProyecto/:idCuestionario', async (req, res) => {
    const { idProyecto, idCuestionario } = req.params;
    const cuestionario = req.body;

    if (!idProyecto || !idCuestionario || !Array.isArray(cuestionario)) {
        return res.status(400).json({ error: 'Datos inválidos o incompletos.' });
    }

    try {
        // Iniciar transacción
        db.beginTransaction(async (err) => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error interno al iniciar la transacción.' });
            }

            try {
                for (const pregunta of cuestionario) {
                    // Actualizar la descripción de la pregunta
                    await new Promise((resolve, reject) => {
                        db.query(
                            `UPDATE com_cuestionario 
                             SET descripcion = ? 
                             WHERE id_proyecto = ? AND id_transcripcion = ? AND id_pregunta = ?`,
                            [pregunta.descripcion, idProyecto, idCuestionario, pregunta.id_pregunta],
                            (err) => {
                                if (err) return reject(err);
                                resolve();
                            }
                        );
                    });

                    // Eliminar todas las alternativas relacionadas con la pregunta
                    await new Promise((resolve, reject) => {
                        db.query(
                            `DELETE FROM com_cuestionario_alternativa 
                             WHERE id_proyecto = ? AND id_cuestionario = ? AND id_pregunta = ?`,
                            [idProyecto, idCuestionario, pregunta.id_pregunta],
                            (err) => {
                                if (err) return reject(err);
                                resolve();
                            }
                        );
                    });

                    // Insertar las nuevas alternativas
                    for (const alternativa of pregunta.alternativas) {
                        await new Promise((resolve, reject) => {
                            db.query(
                                `INSERT INTO com_cuestionario_alternativa 
                                 (id_proyecto, id_cuestionario, id_pregunta, id_alternativa, orden, descripcion, coincidencias, estado, usuario_ingreso) 
                                 VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO', 'user1')`,
                                [
                                    idProyecto,
                                    idCuestionario,
                                    pregunta.id_pregunta,
                                    alternativa.id_alternativa || alternativa.orden, // Usar el ID o el orden como fallback
                                    alternativa.orden,
                                    alternativa.descripcion,
                                    alternativa.coincidencias || 0, // Valor por defecto 0 si no hay coincidencias
                                ],
                                (err) => {
                                    if (err) return reject(err);
                                    resolve();
                                }
                            );
                        });
                    }
                }

                // Confirmar transacción
                db.commit((err) => {
                    if (err) {
                        console.error('Error al confirmar la transacción:', err);
                        db.rollback(() => {});
                        return res.status(500).json({ error: 'Error interno al confirmar la transacción.' });
                    }

                    res.status(200).json({ message: 'Cuestionario actualizado correctamente.' });
                });
            } catch (error) {
                console.error('Error al actualizar el cuestionario, transacción revertida:', error);
                db.rollback(() => {});
                res.status(500).json({ error: 'Error interno al actualizar el cuestionario.' });
            }
        });
    } catch (error) {
        console.error('Error general del servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});



// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
