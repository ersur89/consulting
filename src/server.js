const express = require('express');
const bcrypt = require('bcrypt'); // Importar bcrypt para el cifrado
const path = require('path');
const bodyParser = require('body-parser');
const { AssemblyAI } = require('assemblyai');
const { CohereClientV2 } = require('cohere-ai'); 

const db = require(path.join(__dirname, 'config', 'db'));

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Asegúrate de manejar JSON en el servidor

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




// Ruta para el formulario de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

// Ruta para validar el login
app.post('/validate-login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM adm_usuario WHERE usuario = ? AND clave = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        if (results.length > 0) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'Credenciales incorrectas. Intenta nuevamente.' });
        }
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
    const { nombreProyecto, descripcion, rucCedula, nombreCliente, direccion, telefono, correo } = req.body;

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
                SET nombre = ?, descripcion = ?, id_cliente = ?
                WHERE id_proyecto = ?
            `;
            db.query(updateProyecto, [nombreProyecto, descripcion, clienteId, idProyecto], (err) => {
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
            END AS generado
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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
