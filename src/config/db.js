const mysql = require('mysql2');

/* const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'consulting',
}); */
const db = mysql.createConnection({
    host: 'p3plzcpnl508852.prod.phx3.secureserver.net',
    user: 'aplicacion',
    password: '}7B%7ge4WGZ5',
    database: 'consulting',
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports = db;
