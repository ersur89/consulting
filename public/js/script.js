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



//NUEVO PROYECTO
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
                if (!clientPhone) {
                    document.getElementById('error-phone').textContent = 'El teléfono es obligatorio.';
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
                                document.getElementById('projectForm').reset();
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

//INICIO
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


//CREAR USUARIO
/* document.addEventListener('DOMContentLoaded', () => {
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
}); */

/* document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menu-admin');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('user-popup'); // Referencia al popup
    const closeButton = document.getElementById('close-popup'); // Botón para cerrar el popup
    const userForm = document.getElementById('user-form'); // Formulario de usuario
    

    if (menuAdmin) {
        menuAdmin.addEventListener('click', async (e) => {
            e.preventDefault();

            // Solicitar datos al backend
            let usuarios = [];
            try {
                const response = await fetch('/api/usuarios');
                if (!response.ok) throw new Error('Error al obtener los usuarios');
                usuarios = await response.json();
            } catch (error) {
                console.error('Error:', error);
                contentArea.innerHTML = `<p class="error-message">No se pudieron cargar los usuarios.</p>`;
                return;
            }

            // Generar HTML dinámico para el grid
            const html = `
                <div class="table-header">
                    <h2>Usuarios Registrados</h2>
                    <button class="create-button">CREAR NUEVO</button>
                    <div class="filters">
                        <select class="filter-select">
                            <option value="">Estado</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                        <input type="text" class="search-input" placeholder="Buscar Usuario" />
                        <button class="search-button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="user-grid">
                    <div class="user-grid-header">
                        <div class="user-grid-cell">Usuario</div>
                        <div class="user-grid-cell">Nombre</div>
                        <div class="user-grid-cell">Email</div>
                        <div class="user-grid-cell">Estado</div>
                        <div class="user-grid-cell">Operaciones</div>
                    </div>
                    ${usuarios
                        .map(
                            (user) => `
                            <div class="user-grid-row">
                                <div class="user-grid-cell">${user.usuario}</div>
                                <div class="user-grid-cell">${user.nombre}</div>
                                <div class="user-grid-cell">${user.correo}</div>
                                <div class="${
                                    user.estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo'
                                }">${user.estado}</div>
                                <div class="user-grid-cell">
                                    <button class="edit-button">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-button">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `
                        )
                        .join('')}
                </div>
            `;

            // Insertar el HTML en el área de contenido
            contentArea.innerHTML = html;

            const createButton = document.querySelector('.create-button'); // Botón "Crear Nuevo"
            createButton.addEventListener('click', () => {
                popupOverlay.style.display = 'flex'; // Mostrar el popup
            });
        });
    } else {
        console.error('El elemento con id "menu-admin" no existe en el DOM.');
    }


    // Cerrar el popup al hacer clic en el botón "×"
    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none'; // Ocultar el popup
    });

    // Manejar el envío del formulario para guardar el nuevo usuario
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            username: document.getElementById('username').value,
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            password: document.getElementById('password').value,
            permission: document.getElementById('permission').value,
            estado: document.getElementById('estado').value,
        };

        let isValid = true;


        if (isValid) {
            const response = await fetch('/api/usuarios/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            
            try {
                // Verificamos si la respuesta es exitosa
                const data = await response.json(); // Parsear JSON
            
                if (response.ok) {
                    // Si la respuesta es exitosa
                    showMessage(data.message || 'Usuario creado exitosamente.', 'success');
                    document.getElementById('user-form').reset();
                    popupOverlay.style.display = 'none'; // Cerrar el popup
                } else {
                    // Si hubo errores en el backend
                    // Mostrar mensajes de error del backend
                    showMessage(data.message || 'Error al guardar el usuario.', 'error');
            
                    // Aquí puedes mostrar mensajes específicos para cada campo de validación
                    if (data.username) {
                        document.getElementById('error-username').textContent = data.username;
                    }
                    if (data.email) {
                        document.getElementById('error-email').textContent = data.email;
                    }
                    if (data.password) {
                        document.getElementById('error-password').textContent = data.password;
                    }
                    // Añadir otros campos de error si es necesario...
                }
            } catch (error) {
                // En caso de error de red o un fallo general
                console.error('Error:', error);
                showMessage('Hubo un problema. No se pudo guardar el usuario.', 'error');
            }
        }
    });
}); */

/* document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menu-admin');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('user-popup'); // Referencia al popup
    const closeButton = document.getElementById('close-popup'); // Botón para cerrar el popup
    const userForm = document.getElementById('user-form'); // Formulario de usuario

    // Función para cargar la lista de usuarios
    async function loadUsuarios() {
        let usuarios = [];
        try {
            const response = await fetch('/api/usuarios');
            if (!response.ok) throw new Error('Error al obtener los usuarios');
            usuarios = await response.json();
        } catch (error) {
            console.error('Error:', error);
            contentArea.innerHTML = `<p class="error-message">No se pudieron cargar los usuarios.</p>`;
            return;
        }

        // Generar HTML dinámico para el grid
        const html = `
            <div class="table-header">
                <h2>Usuarios Registrados</h2>
                <button class="create-button">CREAR NUEVO</button>
                <div class="filters">
                    <select class="filter-select">
                        <option value="">Estado</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <input type="text" class="search-input" placeholder="Buscar Usuario" />
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div class="user-grid">
                <div class="user-grid-header">
                    <div class="user-grid-cell">Usuario</div>
                    <div class="user-grid-cell">Nombre</div>
                    <div class="user-grid-cell">Email</div>
                    <div class="user-grid-cell">Estado</div>
                    <div class="user-grid-cell">Operaciones</div>
                </div>
                ${usuarios
                    .map(
                        (user) => `
                        <div class="user-grid-row">
                            <div class="user-grid-cell">${user.usuario}</div>
                            <div class="user-grid-cell">${user.nombre}</div>
                            <div class="user-grid-cell">${user.correo}</div>
                            <div class="${
                                user.estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo'
                            }">${user.estado}</div>
                            <div class="user-grid-cell">
                                <button class="edit-button">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-button">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `
                    )
                    .join('')}
            </div>
        `;

        // Insertar el HTML en el área de contenido
        contentArea.innerHTML = html;

        // Configurar el botón "Crear Nuevo"
        const createButton = document.querySelector('.create-button'); // Botón "Crear Nuevo"
        createButton.addEventListener('click', () => {
            popupOverlay.style.display = 'flex'; // Mostrar el popup
        });
    }

    // Llamar a loadUsuarios cuando se haga clic en el menú admin
    if (menuAdmin) {
        menuAdmin.addEventListener('click', async (e) => {
            e.preventDefault();
            await loadUsuarios();
        });
    } else {
        console.error('El elemento con id "menu-admin" no existe en el DOM.');
    }

    // Cerrar el popup al hacer clic en el botón "×"
    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none'; // Ocultar el popup
    });

    // Manejar el envío del formulario para guardar el nuevo usuario
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            username: document.getElementById('username').value,
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            password: document.getElementById('password').value,
            permission: document.getElementById('permission').value,
            estado: document.getElementById('estado').value,
        };

        try {
            const response = await fetch('/api/usuarios/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Usuario creado exitosamente.', 'success');
                userForm.reset();
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadUsuarios(); // Refrescar la lista de usuarios
            } else {
                showMessage(data.message || 'Error al guardar el usuario.', 'error');

                // Mostrar mensajes específicos para cada campo
                if (data.username) {
                    document.getElementById('error-username').textContent = data.username;
                }
                if (data.email) {
                    document.getElementById('error-email').textContent = data.email;
                }
                if (data.password) {
                    document.getElementById('error-password').textContent = data.password;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Hubo un problema. No se pudo guardar el usuario.', 'error');
        }
    });
}); */

document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menu-admin');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('user-popup'); // Referencia al popup
    const closeButton = document.getElementById('close-popup'); // Botón para cerrar el popup
    const userForm = document.getElementById('user-form'); // Formulario de usuario

    const deletePopup = document.getElementById('delete-popup'); // Popup de confirmación de eliminación
    const confirmDeleteButton = document.getElementById('confirm-delete'); // Botón confirmar eliminación
    const cancelDeleteButton = document.getElementById('cancel-delete'); // Botón cancelar eliminación

    let userIdToDelete = null; // Para almacenar el ID del usuario a eliminar

    // Función para cargar la lista de usuarios
    async function loadUsuarios() {
        let usuarios = [];
        try {
            const response = await fetch('/api/usuarios');
            if (!response.ok) throw new Error('Error al obtener los usuarios');
            usuarios = await response.json();
        } catch (error) {
            console.error('Error:', error);
            contentArea.innerHTML = `<p class="error-message">No se pudieron cargar los usuarios.</p>`;
            return;
        }

        // Generar HTML dinámico para el grid
        const html = `
            <div class="table-header">
                <h2>Usuarios Registrados</h2>
                <button class="create-button">CREAR NUEVO</button>
                <div class="filters">
                    <select class="filter-select">
                        <option value="">Estado</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                    <input type="text" class="search-input" placeholder="Buscar Usuario" />
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div class="user-grid">
                <div class="user-grid-header">
                    <div class="user-grid-cell">Usuario</div>
                    <div class="user-grid-cell">Nombre</div>
                    <div class="user-grid-cell">Email</div>
                    <div class="user-grid-cell">Estado</div>
                    <div class="user-grid-cell">Operaciones</div>
                </div>
                ${usuarios
                    .map(
                        (user) => `
                        <div class="user-grid-row" data-user-id="${user.usuario}">
                            <div class="user-grid-cell">${user.usuario}</div>
                            <div class="user-grid-cell">${user.nombre}</div>
                            <div class="user-grid-cell">${user.correo}</div>
                            <div class="${
                                user.estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo'
                            }">${user.estado}</div>
                            <div class="user-grid-cell">
                                <button class="edit-button">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete-button">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `
                    )
                    .join('')}
            </div>
        `;

        // Insertar el HTML en el área de contenido
        contentArea.innerHTML = html;

        // Configurar el botón "Crear Nuevo"
        const createButton = document.querySelector('.create-button'); // Botón "Crear Nuevo"
        createButton.addEventListener('click', () => {
            popupOverlay.style.display = 'flex'; // Mostrar el popup
        });

        // Configurar eventos de los botones de eliminar
        document.querySelectorAll('.delete-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const userRow = e.target.closest('.user-grid-row');
                if (userRow) {
                    userToDelete = userRow.dataset.userId; // Obtener el usuario
                    deletePopup.style.display = 'flex'; // Mostrar el popup
                }
            });
        });
    }

    // Manejar la confirmación de eliminación
    confirmDeleteButton.addEventListener('click', async () => {
        if (userToDelete) {
            try {
                const response = await fetch(`/api/usuarios/${userToDelete}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Usuario eliminado exitosamente.', 'success');
                    await loadUsuarios(); // Refrescar la lista de usuarios
                } else {
                    showMessage(data.message || 'Error al eliminar el usuario.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Hubo un problema al eliminar el usuario.', 'error');
            } finally {
                deletePopup.style.display = 'none'; // Ocultar el popup
                userIdToDelete = null; // Resetear el ID
            }
        }
    });

    // Cancelar la eliminación
    cancelDeleteButton.addEventListener('click', () => {
        deletePopup.style.display = 'none'; // Ocultar el popup
        userIdToDelete = null; // Resetear el ID
    });

    // Llamar a loadUsuarios cuando se haga clic en el menú admin
    if (menuAdmin) {
        menuAdmin.addEventListener('click', async (e) => {
            e.preventDefault();
            await loadUsuarios();
        });
    } else {
        console.error('El elemento con id "menu-admin" no existe en el DOM.');
    }

    // Cerrar el popup al hacer clic en el botón "×"
    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none'; // Ocultar el popup
    });

    // Manejar el envío del formulario para guardar el nuevo usuario
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            username: document.getElementById('username').value,
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            password: document.getElementById('password').value,
            permission: document.getElementById('permission').value,
            estado: document.getElementById('estado').value,
        };

        try {
            const response = await fetch('/api/usuarios/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Usuario creado exitosamente.', 'success');
                userForm.reset();
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadUsuarios(); // Refrescar la lista de usuarios
            } else {
                showMessage(data.message || 'Error al guardar el usuario.', 'error');

                // Mostrar mensajes específicos para cada campo
                if (data.username) {
                    document.getElementById('error-username').textContent = data.username;
                }
                if (data.email) {
                    document.getElementById('error-email').textContent = data.email;
                }
                if (data.password) {
                    document.getElementById('error-password').textContent = data.password;
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Hubo un problema. No se pudo guardar el usuario.', 'error');
        }
    });
});


//eliminacion de uduario



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
            modalIcon.src = '/img/error-icon.png'; // Reemplaza con la ruta del icono de error
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

