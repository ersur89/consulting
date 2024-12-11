document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar que el formulario se envíe normalmente

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/validate-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirigir al dashboard si las credenciales son correctas
            window.location.href = '/dashboard';

        } else {
            // Mostrar el mensaje de error en el contenedor
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = data.message; // Mostrar el mensaje recibido del servidor
            errorMessage.style.display = 'block'; // Hacerlo visible
        }
    })
    .catch(error => {
        console.error('Error al validar las credenciales:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Hubo un problema al validar tus credenciales. Intenta de nuevo.';
        errorMessage.style.display = 'block';
    });
});
