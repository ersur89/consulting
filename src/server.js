const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require(path.join(__dirname, 'config', 'db'));

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Asegúrate de manejar JSON en el servidor

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
app.post('/crear-proyecto', (req, res) => {
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
                    return res.status(500).json({ error: 'Error al crear proyecto' });
                }

                return res.status(200).json({ message: 'Proyecto creado con éxito' });
            });
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
