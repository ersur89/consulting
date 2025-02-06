const mysql = require('mysql2');

/* const pool = mysql.createPool({
    host: 'p3plzcpnl508852.prod.phx3.secureserver.net',
    user: 'aplicacion',
    password: '}7B%7ge4WGZ5',
    database: 'consulting',
    port: 3306,
    waitForConnections: true, // Espera a que haya conexiones disponibles
    connectionLimit: 10,      // Máximo número de conexiones simultáneas
    queueLimit: 0   
}); */

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'consulting',
    waitForConnections: true, // Espera a que haya conexiones disponibles
    connectionLimit: 10,      // Máximo número de conexiones simultáneas
    queueLimit: 0             // Sin límite en la cola de peticiones
});



module.exports = pool;


/* const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'consulting',
}); 


db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports = db;
 */