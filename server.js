const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para el formulario de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/dashboard', (req, res) => {
    const { username, password } = req.body;
    
    // Aquí realizarías la validación con tu base de datos, por ahora uso un placeholder
    if (username === "admin" && password === "admin") { // Si el usuario tiene un nombre, redirigir
        res.redirect('/dashboard');
    } else {
        res.redirect('/'); // Volver al login si hay algún error
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
