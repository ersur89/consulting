/* document.getElementById("menu-toggle").addEventListener("click", function() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");  // Alterna la clase 'hidden' para ocultar o mostrar el menú
}); */

// Seleccionamos el botón de menú, el sidebar y el contenedor principal
const toggleButton = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

// Agregar evento para alternar la visibilidad del sidebar
toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden'); // Oculta o muestra el sidebar
    content.classList.toggle('full-width'); // Ajusta el ancho del contenido
});

document.querySelectorAll('.menu > li > a').forEach(menuItem => {
    menuItem.addEventListener('click', function (e) {
        e.preventDefault(); // Evita que el enlace principal se active
        const submenu = this.nextElementSibling;
        if (submenu && submenu.classList.contains('submenu')) {
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        }
    });
});




document.addEventListener('DOMContentLoaded', () => {
    const menuCrear = document.getElementById('menu-crear');
    const contentArea = document.getElementById('content-area');

    if (menuCrear) {
        menuCrear.addEventListener('click', (e) => {
            e.preventDefault();

            const html = `
                <div class="form-container">
                    <h2>Crear un nuevo proyecto de consultoría</h2>
                    <form action="#" id="projectForm">
                        <div class="form-group-container">
                            <div class="form-group">
                                <label for="project-name">Nombre del proyecto</label>
                                <input type="text" id="project-name" placeholder="Ingrese el nombre del proyecto" required>
                                <span class="error-message" id="error-project-name"></span>
                            </div>
                            <div class="form-group">
                                <label for="ruc">Cédula o RUC</label>
                                <input type="text" id="ruc" placeholder="Ingrese la cédula o RUC" required>
                                <span class="error-message" id="error-ruc"></span>
                            </div>
                            <div class="form-group">
                                <label for="client-name">Nombre del cliente</label>
                                <input type="text" id="client-name" placeholder="Ingrese el nombre del cliente" required>
                                <span class="error-message" id="error-client-name"></span>
                            </div>
                            <div class="form-group">
                                <label for="address">Dirección del cliente</label>
                                <input type="text" id="address" placeholder="Ingrese la dirección del cliente" required>
                                <span class="error-message" id="error-address"></span>
                            </div>
                            <div class="form-group">
                                <label for="phone">Teléfono</label>
                                <input type="text" id="phone" placeholder="Ingrese el número de teléfono" required>
                                <span class="error-message" id="error-phone"></span>
                            </div>
                            <div class="form-group">
                                <label for="email">Correo electrónico</label>
                                <input type="email" id="email" placeholder="Ingrese el correo electrónico" required>
                                <span class="error-message" id="error-email"></span>
                            </div>
                            <div class="form-group textarea">
                                <label for="description">Descripción del proyecto</label>
                                <textarea id="description" rows="4" placeholder="Ingrese una breve descripción del proyecto"></textarea>
                                <span class="error-message" id="error-description"></span>
                            </div>
                        </div>
                        <button type="submit" class="submit-btn">Crear Proyecto</button>
                    </form>
                </div>
            `;

            contentArea.innerHTML = html;

            // Validación de formulario
            document.getElementById('projectForm').addEventListener('submit', function (event) {
                event.preventDefault();

                // Resetear mensajes de error
                document.querySelectorAll('.error-message').forEach((msg) => (msg.textContent = ''));

                // Obtener valores
                const projectName = document.getElementById('project-name').value.trim();
                const clientName = document.getElementById('client-name').value.trim();
                const clientId = document.getElementById('ruc').value.trim();
                const clientAddress = document.getElementById('address').value.trim();
                const clientPhone = document.getElementById('phone').value.trim();
                const clientEmail = document.getElementById('email').value.trim();
                const projectDescription = document.getElementById('description').value.trim();
                let isValid = true;

                // Validar nombre del proyecto
                if (!projectName) {
                    document.getElementById('error-project-name').textContent = 'El nombre del proyecto es obligatorio.';
                    isValid = false;
                }

                // Validar Cédula o RUC
                if (!/^\d{10,13}$/.test(clientId)) {
                    document.getElementById('error-ruc').textContent = 'La cédula o RUC debe contener entre 10 y 13 números.';
                    isValid = false;
                }

                // Validar nombre del cliente
                if (!clientName) {
                    document.getElementById('error-client-name').textContent = 'El nombre del cliente es obligatorio.';
                    isValid = false;
                }

                // Validar dirección
                if (!clientAddress) {
                    document.getElementById('error-address').textContent = 'La dirección del cliente es obligatoria.';
                    isValid = false;
                }

                // Validar teléfono
                if (!/^\d{6}$/.test(clientPhone)) {
                    document.getElementById('error-phone').textContent = 'El teléfono debe contener exactamente 10 números.';
                    isValid = false;
                }

                // Validar correo electrónico
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
                    document.getElementById('error-email').textContent = 'El correo electrónico no tiene un formato válido.';
                    isValid = false;
                }

                // Mostrar éxito si todos los campos son válidos
                if (isValid) {
                    // Datos del formulario
                    const formData = {
                        nombreProyecto: projectName,
                        nombreCliente: clientName,
                        rucCedula: clientId,
                        direccion: clientAddress,
                        telefono: clientPhone,
                        correo: clientEmail,
                        descripcion: projectDescription
                    };

                    // Llamada al servidor usando fetch
                    fetch('/crear-proyecto', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    })
                        .then((response) => {
                            if (response.ok) {
                                return response.json(); // Parsear JSON si el servidor responde con éxito
                            } else {
                                throw new Error('Error al crear el proyecto. Verifique los datos e intente nuevamente.');
                            }
                        })
                        .then((data) => {
                            // Mostrar mensaje de éxito o manejar la respuesta del servidor
                            if (data.success) {
                                showMessage(data.message, 'success');
                                // Opcional: reiniciar el formulario
                                //document.getElementById('projectForm').reset();
                            } else {
                                showMessage(data.message || 'Hubo un problema al procesar la solicitud.', 'error'); // Modal para errores
                            }
                        })
                        .catch((error) => {
                            // Manejo de errores de red o del servidor
                            showMessage('Hubo un problema con la conexión al servidor.', 'error');
                            console.error('Error:', error);
                        });
                }
            });
        });
    } else {
        console.error('El elemento con id "menu-crear" no existe en el DOM.');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const menuCrear = document.getElementById('menu-inicio');
    const contentArea = document.getElementById('content-area');

    if (menuCrear) {
        menuCrear.addEventListener('click', (e) => {
            e.preventDefault();

            const html = `
                <h1>Bienvenido, Usuario Genérico</h1>
                <p>Esta es tu página de inicio.</p>
            `;

            contentArea.innerHTML = html;

        });
    } else {
        console.error('El elemento con id "menu-inicio" no existe en el DOM.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menu-admin');
    const contentArea = document.getElementById('content-area');

    if (menuAdmin) {
        menuAdmin.addEventListener('click', (e) => {
            e.preventDefault();

            const html = `
                <div class="form-container">
                    <h2>Crear un nuevo usuario</h2>
                    <form action="#" id="userForm">
                        <div class="form-group-container">
                            <div class="form-group">
                                <label for="username">Usuario</label>
                                <input type="text" id="username" placeholder="Ingrese el nombre de usuario" required>
                                <span class="error-message" id="error-username"></span>
                            </div>
                            <div class="form-group">
                                <label for="password">Clave</label>
                                <input type="password" id="password" placeholder="Ingrese la clave" required>
                                <span class="error-message" id="error-password"></span>
                            </div>
                            <div class="form-group">
                                <label for="permission">Permiso</label>
                                <select id="permission" required>
                                    <option value="">Seleccione un permiso</option>
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                <span class="error-message" id="error-permission"></span>
                            </div>
                            <div class="form-group">
                                <label for="name">Nombre</label>
                                <input type="text" id="name" placeholder="Ingrese el nombre completo" required>
                                <span class="error-message" id="error-name"></span>
                            </div>
                            <div class="form-group">
                                <label for="email">Correo</label>
                                <input type="email" id="email" placeholder="Ingrese el correo electrónico" required>
                                <span class="error-message" id="error-email"></span>
                            </div>
                            <div class="form-group">
                                <label for="status">Estado</label>
                                <select id="status" required>
                                    <option value="">Seleccione un estado</option>
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                                <span class="error-message" id="error-status"></span>
                            </div>
                        </div>
                        <button type="submit" class="submit-btn">Crear Usuario</button>
                    </form>
                </div>
            `;

            contentArea.innerHTML = html;

            document.getElementById('userForm').addEventListener('submit', function (event) {
                event.preventDefault();
        
                // Resetear mensajes de error
                document.querySelectorAll('.error-message').forEach((msg) => (msg.textContent = ''));
        
                // Obtener valores
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                const permission = document.getElementById('permission').value.trim();
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const status = document.getElementById('status').value.trim();
        
                let isValid = true;
        
                // Validar campos
                if (!username) {
                    document.getElementById('error-username').textContent = 'El nombre de usuario es obligatorio.';
                    isValid = false;
                }
        
                if (!password) {
                    document.getElementById('error-password').textContent = 'La clave es obligatoria.';
                    isValid = false;
                }
        
                if (!permission) {
                    document.getElementById('error-permission').textContent = 'Debe seleccionar un permiso.';
                    isValid = false;
                }
        
                if (!name) {
                    document.getElementById('error-name').textContent = 'El nombre es obligatorio.';
                    isValid = false;
                }
        
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    document.getElementById('error-email').textContent = 'El correo electrónico no tiene un formato válido.';
                    isValid = false;
                }
        
                if (!status) {
                    document.getElementById('error-status').textContent = 'Debe seleccionar un estado.';
                    isValid = false;
                }
        
                if (isValid) {
                    showMessage('Usuario creado con éxito!', 'success');
                }
            });

        });
    } else {
        console.error('El elemento con id "menu-inicio" no existe en el DOM.');
    }
});


//================================== bloque de funciones ====================================
// Función para mostrar el modal con el mensaje
function showMessage(message, type = 'info') {
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalHeader = modal.querySelector('.modal-header');
    const acceptButton = document.getElementById('accept-button');

    // Configura el mensaje
    modalMessage.textContent = message;

    // Cambia el icono y color dependiendo del tipo
    switch (type) {
        case 'success':
            modalIcon.src = '../img/success-icon.png'; // Reemplaza con la ruta del icono de éxito
            modalHeader.style.backgroundColor = '#4CAF50'; // Verde para éxito
            break;
        case 'error':
            modalIcon.src = '../img/error-icon.png'; // Reemplaza con la ruta del icono de error
            modalHeader.style.backgroundColor = '#F44336'; // Rojo para error
            break;
        case 'warning':
            modalIcon.src = '../img/warning-icon.png'; // Reemplaza con la ruta del icono de advertencia
            modalHeader.style.backgroundColor = '#FF9800'; // Naranja para advertencia
            break;
        default:
            modalIcon.src = '../img/info-icon.png'; // Reemplaza con la ruta del icono de información
            modalHeader.style.backgroundColor = '#0056b3'; // Azul para información
            break;
    }

    // Muestra el modal
    modal.classList.add('show');
    modal.style.display = 'block';

    // Evento para cerrar el modal
    acceptButton.onclick = function () {
        modal.style.display = 'none';
    };
}

// Cierra el modal al hacer clic fuera de él
window.onclick = function (event) {
    const modal = document.getElementById('custom-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

