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

// Variable global para tipo de entidad en el popup de eliminación
let deleteEntityType = 'usuario'; // Por defecto "usuario"
let deleteEntityId = null; // ID de la entidad a eliminar

// Función para mostrar el popup dinámico
function showDeletePopup(type, id, name) {
    deleteEntityType = type; // Tipo de entidad (usuario o proyecto)
    deleteEntityId = id; // ID de la entidad a eliminar

    const deleteEntitySpan = document.getElementById('delete-entity');
    deleteEntitySpan.textContent = type === 'proyecto' ? 'proyecto' : 'usuario';

    // Mostrar nombre o identificación opcional
    if (name) {
        deleteEntitySpan.textContent += `: ${name}`;
    }

    const deletePopup = document.getElementById('delete-popup');
    deletePopup.style.display = 'flex';
}

//NUEVO PROYECTO
/* document.addEventListener('DOMContentLoaded', () => {
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
}); */

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


//CRUD DE USUARIO
document.addEventListener('DOMContentLoaded', () => {
    const menuAdmin = document.getElementById('menu-admin');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('user-popup');
    const closeButton = document.getElementById('close-popup');
    const userForm = document.getElementById('user-form');

    const deletePopup = document.getElementById('delete-popup');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    let userIdToDelete = null;
    let currentPage = 1;  // Página inicial
    const usersPerPage = 5;  // Número de usuarios por página
    let totalUsers = 0; // Total de usuarios
    let filteredUsers = []; // Guardar los usuarios filtrados

    // Configurar el formulario según la acción (crear o editar)
    function configureUserForm(mode, user = null) {
        const popup = document.getElementById('user-popup');
        const title = popup.querySelector('.popup-header h3'); // Selecciona el título del popup
        userForm.reset(); // Limpiar el formulario
        document.getElementById('username').disabled = mode === 'edit'; // Deshabilitar el campo "username" en modo edición
    
        const createButton = document.getElementById('new-button'); // Botón de "Crear Usuario"
        const updateButton = document.getElementById('update-button'); // Botón de "Actualizar Usuario"

        // Limpiar los mensajes de error o divs con contenido previo
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((error) => {
            error.textContent = ''; // Limpiar el texto del mensaje de error
        });
    
        if (mode === 'create') {
            // Configuración para el modo "Crear"
            title.textContent = 'Nuevo Usuario'; // Cambia el título
            createButton.style.display = 'block'; // Mostrar botón "Crear"
            createButton.disabled = false; // Habilitar botón "Crear"
    
            updateButton.style.display = 'none'; // Ocultar botón "Actualizar"
            updateButton.disabled = true; // Deshabilitar botón "Actualizar"
    
            document.getElementById('username').value = ''; // Limpiar campo "username"
    
        } else if (mode === 'edit' && user) {
            // Configuración para el modo "Editar"
            title.textContent = 'Modificación de Usuario';
            updateButton.style.display = 'block'; // Mostrar botón "Actualizar"
            updateButton.disabled = false; // Habilitar botón "Actualizar"
    
            createButton.style.display = 'none'; // Ocultar botón "Crear"
            createButton.disabled = true; // Deshabilitar botón "Crear"
    
            // Rellenar el formulario con los datos del usuario
            document.getElementById('username').value = user.usuario;
            document.getElementById('nombre').value = user.nombre;
            document.getElementById('correo').value = user.correo;
            document.getElementById('permission').value = user.permiso;
            document.getElementById('estado').value = user.estado;
        }
    
        // Mostrar el popup
        popupOverlay.style.display = 'flex';
    }

    function renderInitialStructure() {
        //const contentWrapper = document.querySelector('#contentWrapper');
    
        if (!contentArea) {
            console.error("El contenedor '#content-area' no se encontró en el DOM.");
            return;
        }
    
        contentArea.innerHTML = `
            <div class="table-header">
                <h2>Usuarios Registrados</h2>
                <button class="create-button">CREAR NUEVO</button>
                <div class="filters">
                    <select class="filter-select">
                        <option value="">Todos</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                    <input type="text" class="search-input" placeholder="Buscar Usuario" />
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div id="contentAreaSub"></div> <!-- Aquí se insertará dinámicamente la tabla de usuarios -->
        `;
    
        // Configurar el evento de cambio del filtro
        document.querySelector('.filter-select').addEventListener('change', async () => {
            currentPage = 1; // Reiniciar a la primera página
            const searchTerm = document.querySelector('.search-input').value.trim(); // Obtener el valor actual del campo de búsqueda
            await loadUsuarios(searchTerm);
        });
    
        // Configurar evento de búsqueda (opcional, puedes implementar esta lógica)
        document.querySelector('.search-button').addEventListener('click', () => {
            console.log("Funcionalidad de búsqueda pendiente.");
        });
    
        // Configurar botón para creación de usuario
        document.querySelector('.create-button').addEventListener('click', () => {
            configureUserForm('create');
        });
    }
    

    // Función para cargar usuarios
    async function loadUsuarios(searchTerm = '') {
        let usuarios = [];
        const filterSelect  = document.querySelector('.filter-select');
        const contentAreaSub = document.querySelector('#contentAreaSub');
        let filterValue = filterSelect ? filterSelect.value : ''; // Obtén el valor del filtro inicial
    
        try {
            const response = await fetch('/api/usuarios');
            if (!response.ok) throw new Error('Error al obtener los usuarios');
            usuarios = await response.json();
            totalUsers = usuarios.length; // Establecer el total de usuarios
        } catch (error) {
            console.error('Error:', error);
            contentAreaSub.innerHTML = `<p class="error-message">No se pudieron cargar los usuarios.</p>`;
            return;
        }

        // Filtrar proyectos según el filtro y el término de búsqueda
        /* if (filterValue) {
            filteredUsers = filteredUsers.filter(user =>
                user.usuario.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.nombre.toLowerCase().includes(filterValue.toLowerCase()) ||
                user.correo.toLowerCase().includes(filterValue.toLowerCase())
            );
        } */
    
        // Filtrar usuarios según el estado seleccionado
        let filteredUsers;
        if (filterValue) {
            filteredUsers = usuarios.filter((user) => user.estado.toLowerCase() === filterValue.toLowerCase());
        } else {
            filteredUsers = usuarios; // Si no hay filtro, mostrar todos los usuarios
        } 

        // Filtrar usuarios por término de búsqueda
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user =>
                user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.correo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
    
        // Calcular el total de usuarios que se deben mostrar en base a la paginación
        const usersToShow = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    
        // Generar HTML dinámico para los usuarios
        const html = `

            <div class="user-grid">
                <div class="user-grid-header">
                    <div class="user-grid-cell">Usuario</div>
                    <div class="user-grid-cell">Nombre</div>
                    <div class="user-grid-cell">Email</div>
                    <div class="user-grid-cell">Estado</div>
                    <div class="user-grid-cell">Operaciones</div>
                </div>
                ${usersToShow
                    .map(
                        (user) => `
                        <div class="user-grid-row" data-user-id="${user.usuario}">
                            <div class="user-grid-cell">${user.usuario}</div>
                            <div class="user-grid-cell">${user.nombre}</div>
                            <div class="user-grid-cell">${user.correo}</div>
                            <div class="${user.estado === 'ACTIVO' ? 'status-activo' : 'status-inactivo'}">${user.estado}</div>
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
            <div class="pagination">
                <button class="prev-button" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>Página ${currentPage} de ${Math.ceil(filteredUsers.length / usersPerPage)}</span>
                <button class="next-button" ${currentPage === Math.ceil(filteredUsers.length / usersPerPage) ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    
        contentAreaSub.innerHTML = html;
    
        // Mantener el valor seleccionado en el filtro **después de que el HTML ha sido cargado**
        if (filterSelect) {
            filterSelect.value = filterValue; // Asegúrate de que el filtro se mantenga como estaba
        }
    
        // Configurar botones de paginación
        document.querySelector('.prev-button').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadUsuarios(searchTerm); // Recargar la lista de usuarios
            }
        });
    
        document.querySelector('.next-button').addEventListener('click', () => {
            if (currentPage < Math.ceil(totalUsers / usersPerPage)) {
                currentPage++;
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadUsuarios(searchTerm); // Recargar la lista de usuarios
            }
        });
    
        // Configurar botones de edición y eliminación
        document.querySelector('.create-button').addEventListener('click', () => {
            configureUserForm('create'); // Modo creación
        });
    
        document.querySelectorAll('.edit-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const userRow = e.target.closest('.user-grid-row');
                const username = userRow.dataset.userId;
    
                try {
                    const response = await fetch(`/api/usuarios-only/${username}`);
                    if (!response.ok) throw new Error('No se pudo obtener el usuario.');
    
                    const user = await response.json();
                    configureUserForm('edit', user); // Modo edición
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });
    
        /* document.querySelectorAll('.delete-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const userRow = e.target.closest('.user-grid-row');
                if (userRow) {
                    userIdToDelete = userRow.dataset.userId;
                    deletePopup.style.display = 'flex';
                }
            });
        }); */
        document.querySelectorAll('.delete-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const userRow = e.target.closest('.user-grid-row');
                if (userRow) {
                    userIdToDelete = userRow.dataset.userId;
        
                    // Actualiza el popup dinámicamente
                    const deleteEntitySpan = document.getElementById('delete-entity');
                    const deletePopupMessage = document.getElementById('delete-popup-message');
                    deleteEntitySpan.textContent = 'usuario';
                    //deletePopupMessage.textContent = `Usuario: ${userRow.querySelector('.user-grid-cell:nth-child(2)').textContent}`;
        
                    deletePopup.style.display = 'flex';
                }
            });
        });
        
    
        // Filtrar los usuarios cuando cambie el filtro
        document.querySelector('.filter-select').addEventListener('change', async () => {
            currentPage = 1; // Reiniciar la página actual al cambiar el filtro
            ///await loadUsuarios(); // Recargar la lista de usuarios con el filtro aplicado
            const searchTerm = document.querySelector('.search-input').value.trim();

            await loadUsuarios(searchTerm); // Recargar la lista de usuarios
        });
    }

    function setupSearchButton() {
        const searchButton = document.querySelector('.search-button');
        const searchInput = document.querySelector('.search-input');
    
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim();
                currentPage = 1; // Reiniciar a la primera página al realizar una búsqueda
                loadUsuarios(searchTerm); // Cargar los usuarios filtrados
            });
        }
    }

    // Confirmar eliminación
    confirmDeleteButton.addEventListener('click', async () => {
        if (userIdToDelete) {
            try {
                const response = await fetch(`/api/usuarios/${userIdToDelete}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showMessage('Usuario eliminado exitosamente.', 'success');
                    await loadUsuarios(); // Refrescar usuarios
                } else {
                    showMessage('Error al eliminar el usuario.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                deletePopup.style.display = 'none';
                userIdToDelete = null;
            }
        }
    });

    cancelDeleteButton.addEventListener('click', () => {
        deletePopup.style.display = 'none';
        userIdToDelete = null;
    });

    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });

    // Configuración del botón "Crear Usuario"
/*     document.getElementById('new-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado */
// Configuración del evento submit para el formulario

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el envío automático del formulario

        // Si el formulario no es válido, detén la ejecución
        if (!userForm.checkValidity()) {
            userForm.reportValidity(); // Muestra los mensajes de validación nativos del navegador
            return;
        }
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
                userForm.reset(); // Limpiar el formulario
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadUsuarios(); // Recargar la lista de usuarios
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
            console.error('Error al crear el usuario:', error);
            showMessage('Hubo un problema. No se pudo guardar el usuario.', 'error');
        }
    });

    // Configuración del botón "Actualizar Usuario"
    document.getElementById('update-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado

        const username = document.getElementById('username').value; // El usuario a actualizar
        const updatedUser = {
            nombre: document.getElementById('nombre').value,
            correo: document.getElementById('correo').value,
            permission: document.getElementById('permission').value,
            estado: document.getElementById('estado').value,
        };

        // Solo enviar la contraseña si se ha cambiado
        const password = document.getElementById('password').value;
        if (password) {
            updatedUser.password = password;
        }

        try {
            const response = await fetch(`/api/usuarios-edit/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Usuario actualizado exitosamente.', 'success');
                userForm.reset(); // Limpiar el formulario
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadUsuarios(); // Recargar la lista de usuarios
            } else {
                showMessage(data.message || 'Error al actualizar el usuario.', 'error');
                if (data.username) {
                    document.getElementById('error-username').textContent = data.username;
                }
                if (data.email) {
                    document.getElementById('error-email').textContent = data.email;
                }
                /* if (data.password) {
                    document.getElementById('error-password').textContent = data.password;
                } */
                if (data.permiso) {
                    document.getElementById('error-permission').textContent = data.permiso;
                }
            }
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            showMessage('Hubo un problema. No se pudo actualizar el usuario.', 'error');
        }
    });

    // Cargar usuarios inicialmente
    if (menuAdmin) {
        menuAdmin.addEventListener('click', async (e) => {
            e.preventDefault();
            // Inicializar la página
            renderInitialStructure();
            await loadUsuarios();
            setupSearchButton(); // Configurar el botón de búsqueda
        });
    }
});

//CRUD DE PROYECTO
document.addEventListener('DOMContentLoaded', () => {
    const menuProyectos = document.getElementById('menu-proyecto');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('project-popup');
    const closeButton = document.getElementById('close-project-popup');
    const projectForm = document.getElementById('project-form');

    const deletePopup = document.getElementById('delete-popup');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    let projectIdToDelete = null;
    let currentPage = 1; // Página inicial
    const projectsPerPage = 5; // Número de proyectos por página
    let totalProjects = 0; // Total de proyectos
    let filteredProjects = []; // Guardar los proyectos filtrados

    // Configurar el formulario según la acción (crear o editar)
    function configureProjectForm(mode, project = null) {
        projectForm.reset(); // Limpiar el formulario
        const popup = document.getElementById('project-popup');
        const title = popup.querySelector('.popup-header h3'); // Selecciona el título del popup
        const createButton = document.getElementById('create-project-button');
        const updateButton = document.getElementById('update-project-button');
        const projectIdField = document.getElementById('project-id');


        // Limpiar los mensajes de error
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((error) => {
            error.textContent = '';
        });

        projectIdField.value = project ? project.id_proyecto : ''; // Asignar el ID del proyecto si existe

        document.getElementById('ruc').addEventListener('input', async (e) => {
            const input = e.target.value.trim();
            const suggestionList = document.getElementById('ruc-suggestions');
        
            // Si el campo está vacío, limpiar las sugerencias
            if (input === '') {
                suggestionList.innerHTML = '';
                return;
            }
        
            try {
                // Realizar la solicitud al servidor
                const response = await fetch(`/api/clientes?q=${encodeURIComponent(input)}`);
                if (!response.ok) throw new Error('Error al obtener sugerencias');
        
                const clientes = await response.json();
        
                // Limpiar las opciones actuales
                suggestionList.innerHTML = '';
        
                // Agregar las nuevas opciones
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.cedula_ruc; // Mostrar cédula
                    option.textContent = `${cliente.cedula_ruc} - ${cliente.nombre}`; // Mostrar cédula y nombre
                    option.dataset.cliente = JSON.stringify(cliente); // Guardar datos completos en un atributo
                    suggestionList.appendChild(option);
                });
            } catch (error) {
                showMessage('Error al obtener sugerencias de clientes.', 'error');
            }
        });

        // Llenar los campos al seleccionar un cliente
        document.getElementById('ruc').addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            const suggestionList = document.getElementById('ruc-suggestions');

            // Buscar el cliente correspondiente en la lista
            const selectedOption = Array.from(suggestionList.children).find(
                option => option.value === selectedValue
            );

            if (selectedOption) {
                const cliente = JSON.parse(selectedOption.dataset.cliente);

                // Llenar los campos con los datos del cliente
                document.getElementById('client-name').value = cliente.nombre || '';
                document.getElementById('address').value = cliente.direccion || '';
                document.getElementById('phone').value = cliente.telefono || '';
                document.getElementById('email').value = cliente.correo || '';
            } else {
                // Si no se encuentra el cliente, limpiar los campos
                document.getElementById('client-name').value = '';
                document.getElementById('address').value = '';
                document.getElementById('phone').value = '';
                document.getElementById('email').value = '';
            }
        });

        if (mode === 'create') {
            title.textContent = 'Nuevo Proyecto'; // Cambia el título
            createButton.style.display = 'block';
            updateButton.style.display = 'none';
        } else if (mode === 'edit' && project) {
            title.textContent = 'Modificación de Proyecto'; // Cambia el título
            updateButton.style.display = 'block';
            createButton.style.display = 'none';
            document.getElementById('project-name').value = project.proyecto_nombre;
            document.getElementById('client-name').value = project.cliente_nombre;
            document.getElementById('ruc').value = project.cedula_ruc;
            document.getElementById('address').value = project.direccion;
            document.getElementById('phone').value = project.telefono;
            document.getElementById('email').value = project.correo;
            document.getElementById('description').value = project.descripcion;
            document.getElementById('status').value = project.estado;
        }

        popupOverlay.style.display = 'flex';
    }

    function renderInitialStructure() {
        if (!contentArea) {
            console.error("El contenedor '#content-area' no se encontró en el DOM.");
            return;
        }

        contentArea.innerHTML = `
            <div class="table-header">
                <h2>Proyectos Registrados</h2>
                <button class="create-button">CREAR NUEVO</button>
                <div class="filters">
                    <select class="filter-select">
                        <option value="">Todos</option>
                        <option value="Activo">Activo</option>  
                        <option value="Cerrado">Cerrado</option>
                    </select>
                    <input type="text" class="search-input" placeholder="Buscar Proyecto" />
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div id="contentAreaSub"></div> <!-- Tabla de proyectos -->
        `;

        document.querySelector('.create-button').addEventListener('click', () => {
            configureProjectForm('create');
        });

        document.querySelector('.search-button').addEventListener('click', () => {
            const searchTerm = document.querySelector('.search-input').value.trim();
            currentPage = 1;
            loadProjects(searchTerm);
        });


    }

    async function loadProjects(searchTerm = '') {
        let projects = [];
        
        const contentAreaSub = document.querySelector('#contentAreaSub');
        const filterSelect  = document.querySelector('.filter-select');
        let filterValue = filterSelect ? filterSelect.value : ''; // Obtén el valor del filtro inicial
 

        try {
            const response = await fetch('/api/proyectos');
            if (!response.ok) throw new Error('Error al obtener los proyectos');
            projects = await response.json();
            totalProjects = projects.length;
        } catch (error) {
            console.error('Error:', error);
            contentAreaSub.innerHTML = `<p class="error-message">No se pudieron cargar los proyectos.</p>`;
            return;
        }

        // Filtrar proyectos según el filtro y el término de búsqueda
        /* if (filterValue) {
            projects = projects.filter(project => project.estado.toLowerCase() === filterValue.toLowerCase()||
            project.cliente_nombre.toLowerCase().includes(filterValue.toLowerCase())||
            project.correo.toLowerCase().includes(filterValue.toLowerCase())
        
            );
        } */

        //let projects;
        if (filterValue) {
            projects = projects.filter((project) => project.estado.toLowerCase() === filterValue.toLowerCase());
        } else {
            projects = projects; // Si no hay filtro, mostrar todos los projectos
        } 

        if (searchTerm) {
            projects = projects.filter(project =>
                project.proyecto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())||
                project.correo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const projectsToShow = projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

        const html = `
            <div class="project-grid">
                <div class="project-grid-header">
                    <div class="project-grid-cell">Nombre</div>
                    <div class="project-grid-cell">Ruc</div>
                    <div class="project-grid-cell">Cliente</div>
                    <div class="project-grid-cell">Teléfono</div>
                    <div class="project-grid-cell">Correo</div>
                    <div class="project-grid-cell">Estado</div>
                    <div class="project-grid-cell">Operaciones</div>
                </div>
                ${projectsToShow
                    .map(
                        (project) => `
                            <div class="project-grid-row" data-project-id="${project.id_proyecto}">
                                <div class="project-grid-cell">${project.proyecto_nombre}</div>
                                <div class="project-grid-cell">${project.cedula_ruc}</div>
                                <div class="project-grid-cell">${project.cliente_nombre}</div>
                                <div class="project-grid-cell">${project.telefono}</div>
                                <div class="project-grid-cell">${project.correo}</div>
                                <div class="project-grid-cell">${project.estado}</div>
                                <div class="project-grid-cell">
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
            <div class="pagination">
                <button class="prev-button" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>Página ${currentPage} de ${Math.ceil(projects.length / projectsPerPage)}</span>
                <button class="next-button" ${currentPage === Math.ceil(projects.length / projectsPerPage) ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        contentAreaSub.innerHTML = html;

        // Mantener el valor seleccionado en el filtro **después de que el HTML ha sido cargado**
        /* if (filterSelect) {
            filterSelect.value = filterValue; // Asegúrate de que el filtro se mantenga como estaba
        } */

        document.querySelector('.prev-button').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                // Obtén el valor del filtro actual
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadProjects(searchTerm); // Pasar los filtros como parámetros
            }
        });

        document.querySelector('.next-button').addEventListener('click', () => {
            if (currentPage < Math.ceil(projects.length / projectsPerPage)) {
                currentPage++;
                // Obtén el valor del filtro actual
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadProjects(searchTerm); // Pasar los filtros como parámetros
            }
        });

        document.querySelectorAll('.edit-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const projectId = projectRow.dataset.projectId;

                try {
                    const response = await fetch(`/api/proyectos/${projectId}`);
                    if (!response.ok) throw new Error('No se pudo obtener el proyecto.');

                    const project = await response.json();
                    configureProjectForm('edit', project);
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });

        /* document.querySelectorAll('.delete-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                if (projectRow) {
                    projectIdToDelete = projectRow.dataset.projectId;
                    deletePopup.style.display = 'flex';
                }
            });
        }); */
        document.querySelectorAll('.delete-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                if (projectRow) {
                    projectIdToDelete = projectRow.dataset.projectId;
        
                    // Actualiza el popup dinámicamente
                    const deleteEntitySpan = document.getElementById('delete-entity');
                    const deletePopupMessage = document.getElementById('delete-popup-message');
                    deleteEntitySpan.textContent = 'proyecto';
                    //deletePopupMessage.textContent = `Proyecto: ${projectRow.querySelector('.project-grid-cell:nth-child(1)').textContent}`;
        
                    deletePopup.style.display = 'flex';
                }
            });
        });

        // Filtrar los proyectos cuando cambie el filtro
        document.querySelector('.filter-select').addEventListener('change', async () => {
            currentPage = 1; // Reiniciar la página actual al cambiar el filtro
            // Obtén el valor del filtro actual
            const searchTerm = document.querySelector('.search-input').value.trim();

            await loadProjects(searchTerm); // Pasar los filtros como parámetros
        });
        
    }

    function setupSearchButton() {
        const searchButton = document.querySelector('.search-button');
        const searchInput = document.querySelector('.search-input');
    
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim();
                currentPage = 1; // Reiniciar a la primera página al realizar una búsqueda
                loadProjects(searchTerm); // Cargar los usuarios filtrados
            });
        }
    }

    confirmDeleteButton.addEventListener('click', async () => {
        if (projectIdToDelete) {
            try {
                const response = await fetch(`/api/proyectos/${projectIdToDelete}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showMessage('Proyecto eliminado exitosamente.', 'success');
                    await loadProjects();
                } else {
                    showMessage('Error al eliminar el proyecto.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                deletePopup.style.display = 'none';
                projectIdToDelete = null;
            }
        }
    });

    cancelDeleteButton.addEventListener('click', () => {
        deletePopup.style.display = 'none';
        projectIdToDelete = null;
    });

    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });

    projectForm.addEventListener('submit', async (e) => {
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
        const status = document.getElementById('status').value.trim();
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
                projectName: projectName,
                clientName: clientName,
                ruc: clientId,
                address: clientAddress,
                phone: clientPhone,
                email: clientEmail,
                description: projectDescription,
                status : status
            };

            // Llamada al servidor usando fetch
            fetch('/api/proyectos', {
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
                        projectForm.reset(); // Limpia el formulario
                        popupOverlay.style.display = 'none'; // Cerrar el popup
                        loadProjects(); // Recargar la lista de proyectos
                    } else {
                        showMessage(data.message || 'Hubo un problema al procesar la solicitud.', 'error'); // Modal para errores
                    }
                })
                .catch((error) => {
                    // Manejo de errores de red o del servidor
                    console.error('Error:', error);
                    showMessage('Hubo un problema con la conexión al servidor.', 'error');
                    
                });
        }

    });

    document.getElementById('update-project-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado
    
        const projectForm = document.getElementById('project-form');
        if (!projectForm) {
            showMessage("No se pudo encontrar el formulario. Inténtelo de nuevo.", "error");
            return;
        }
    
        const projectData = {
            idProyecto: document.getElementById('project-id').value.trim(), // Capturamos el ID del proyecto
            nombreProyecto: document.getElementById('project-name').value.trim(),
            nombreCliente: document.getElementById('client-name').value.trim(),
            rucCedula: document.getElementById('ruc').value.trim(),
            direccion: document.getElementById('address').value.trim(),
            telefono: document.getElementById('phone').value.trim(),
            correo: document.getElementById('email').value.trim(),
            descripcion: document.getElementById('description').value.trim(),
        };
    
        try {
            const response = await fetch(`/api/proyectos/${projectData.idProyecto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                showMessage(data.message || 'Proyecto actualizado exitosamente.', 'success');
                projectForm.reset(); // Limpiar el formulario
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadProjects(); // Recargar la lista de proyectos
            } else {
                showMessage(data.message || 'Error al actualizar el proyecto.', 'error');
                if (data.rucCedula) {
                    document.getElementById('error-ruc').textContent = data.rucCedula;
                }
                if (data.nombreCliente) {
                    document.getElementById('error-client-name').textContent = data.nombreCliente;
                }
            }
        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            showMessage('Hubo un problema. No se pudo actualizar el proyecto.', 'error');
        }
    });

    if (menuProyectos) {
        menuProyectos.addEventListener('click', async (e) => {
            e.preventDefault();
            renderInitialStructure();
            await loadProjects();
            setupSearchButton(); // Configurar el botón de búsqueda
        });
    }
});


// ================================== PROYECTO POR VIDEO DE GRUPO FOCAL =================================
document.addEventListener('DOMContentLoaded', () => {
    const menuProyectosVideos = document.getElementById('menu-proyecto-video');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('project-video-popup');
    const closeButton = document.getElementById('close-project-video-popup');
    const projectForm = document.getElementById('project-video-form');

    const deletePopup = document.getElementById('delete-popup');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    let projectIdToDelete = null;
    let currentPage = 1; // Página inicial
    const projectsPerPage = 5; // Número de proyectos por página
    let totalProjects = 0; // Total de proyectos
    let filteredProjects = []; // Guardar los proyectos filtrados

    // Configurar el formulario en donde vamos a subir el link del video
    function configureProjectForm(mode, project = null) {
        projectForm.reset(); // Limpiar el formulario
        const popup = document.getElementById('project-video-popup');
        const title = popup.querySelector('.popup-header h3'); // Selecciona el título del popup
        const createButton = document.getElementById('create-project-video-button');
        //const updateButton = document.getElementById('update-project-button');
        const projectIdField = document.getElementById('project-id');


        // Limpiar los mensajes de error
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((error) => {
            error.textContent = '';
        });

        projectIdField.value = project ? project.id_proyecto : ''; // Asignar el ID del proyecto si existe

        /* document.getElementById('ruc').addEventListener('input', async (e) => {
            const input = e.target.value.trim();
            const suggestionList = document.getElementById('ruc-suggestions');
        
            // Si el campo está vacío, limpiar las sugerencias
            if (input === '') {
                suggestionList.innerHTML = '';
                return;
            }
        
            try {
                // Realizar la solicitud al servidor
                const response = await fetch(`/api/clientes?q=${encodeURIComponent(input)}`);
                if (!response.ok) throw new Error('Error al obtener sugerencias');
        
                const clientes = await response.json();
        
                // Limpiar las opciones actuales
                suggestionList.innerHTML = '';
        
                // Agregar las nuevas opciones
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.cedula_ruc; // Mostrar cédula
                    option.textContent = `${cliente.cedula_ruc} - ${cliente.nombre}`; // Mostrar cédula y nombre
                    option.dataset.cliente = JSON.stringify(cliente); // Guardar datos completos en un atributo
                    suggestionList.appendChild(option);
                });
            } catch (error) {
                showMessage('Error al obtener sugerencias de clientes.', 'error');
            }
        });

        // Llenar los campos al seleccionar un cliente
        document.getElementById('ruc').addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            const suggestionList = document.getElementById('ruc-suggestions');

            // Buscar el cliente correspondiente en la lista
            const selectedOption = Array.from(suggestionList.children).find(
                option => option.value === selectedValue
            );

            if (selectedOption) {
                const cliente = JSON.parse(selectedOption.dataset.cliente);

                // Llenar los campos con los datos del cliente
                document.getElementById('client-name').value = cliente.nombre || '';
                document.getElementById('address').value = cliente.direccion || '';
                document.getElementById('phone').value = cliente.telefono || '';
                document.getElementById('email').value = cliente.correo || '';
            } else {
                // Si no se encuentra el cliente, limpiar los campos
                document.getElementById('client-name').value = '';
                document.getElementById('address').value = '';
                document.getElementById('phone').value = '';
                document.getElementById('email').value = '';
            }
        }); */

        if (mode === 'create') {
            /* title.textContent = 'Nuevo Proyecto'; // Cambia el título
            createButton.style.display = 'block';
            updateButton.style.display = 'none'; */
        } else if (mode === 'edit' && project) {
            title.textContent = 'Generacion de Cuestionario'; // Cambia el título
            //updateButton.style.display = 'block';
            createButton.style.display = 'block';
            document.getElementById('id-proyect').value      = project.id_proyecto;
            document.getElementById('projecto-nombre').value = project.proyecto_nombre;
            document.getElementById('cliente-nombre').value  = project.cliente_nombre;
            document.getElementById('ruc_cedula').value      = project.cedula_ruc;
            document.getElementById('id-proyect').setAttribute('readonly', true);
            document.getElementById('projecto-nombre').setAttribute('readonly', true);
            document.getElementById('cliente-nombre').setAttribute('readonly', true);
            document.getElementById('ruc_cedula').setAttribute('readonly', true);
        }

        popupOverlay.style.display = 'flex';
    }

    function renderInitialStructure() {
        if (!contentArea) {
            console.error("El contenedor '#content-area' no se encontró en el DOM.");
            return;
        }

        contentArea.innerHTML = `
            <div class="table-header">
                <h2>Registro de Videos a Proyectos </h2>
                <div class="filters">
                    <select class="filter-select">
                        <option value="">Todos</option>
                        <option value="Activo">Activo</option>  
                        <option value="Cerrado">Cerrado</option>
                    </select>
                    <input type="text" class="search-input" placeholder="Buscar Proyecto" />
                    <button class="search-button">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div id="contentAreaSub"></div> <!-- Tabla de proyectos -->
        `;

        /* document.querySelector('.create-button').addEventListener('click', () => {
            configureProjectForm('create');
        }); */

        document.querySelector('.search-button').addEventListener('click', () => {
            const searchTerm = document.querySelector('.search-input').value.trim();
            currentPage = 1;
            loadProjects(searchTerm);
        });


    }

    async function loadProjects(searchTerm = '') {
        let projects = [];
        
        const contentAreaSub = document.querySelector('#contentAreaSub');
        const filterSelect  = document.querySelector('.filter-select');
        let filterValue = filterSelect ? filterSelect.value : ''; // Obtén el valor del filtro inicial
 

        try {
            const response = await fetch('/api/proyectos-videos');
            if (!response.ok) throw new Error('Error al obtener los proyectos');
            projects = await response.json();
            totalProjects = projects.length;
        } catch (error) {
            console.error('Error:', error);
            contentAreaSub.innerHTML = `<p class="error-message">No se pudieron cargar los proyectos.</p>`;
            return;
        }

        // Filtrar proyectos según el filtro y el término de búsqueda
        /* if (filterValue) {
            projects = projects.filter(project => project.estado.toLowerCase() === filterValue.toLowerCase()||
            project.cliente_nombre.toLowerCase().includes(filterValue.toLowerCase())||
            project.correo.toLowerCase().includes(filterValue.toLowerCase())
        
            );
        } */

        //let projects;
        if (filterValue) {
            projects = projects.filter((project) => project.estado.toLowerCase() === filterValue.toLowerCase());
        } else {
            projects = projects; // Si no hay filtro, mostrar todos los projectos
        } 

        if (searchTerm) {
            projects = projects.filter(project =>
                project.proyecto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())||
                project.correo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const projectsToShow = projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

        const html = `
            <div class="project-grid">
                <div class="project-grid-header">
                    <div class="project-grid-cell">Id Proyecto</div>
                    <div class="project-grid-cell">Nombre</div>
                    <div class="project-grid-cell">Ruc</div>
                    <div class="project-grid-cell">Cliente</div>
                    <div class="project-grid-cell">Estado</div>
                    <div class="project-grid-cell">Generado</div>
                    <div class="project-grid-cell">Operaciones</div>
                </div>
                ${projectsToShow
                    .map(
                        (project) => `
                            <div class="project-grid-row" data-project-id="${project.id_proyecto}">
                                <div class="project-grid-cell">${project.id_proyecto}</div>
                                <div class="project-grid-cell">${project.proyecto_nombre}</div>
                                <div class="project-grid-cell">${project.cedula_ruc}</div>
                                <div class="project-grid-cell">${project.cliente_nombre}</div>                                
                                <div class="project-grid-cell">${project.estado}</div>
                                <div class="project-grid-cell">${project.generado}</div>
                                <div class="project-grid-cell">
                                    <button class="genera-button" title="Generar">
                                        <i class="fas fa-file-alt"></i>
                                    </button>
                                    <button class="print-button" title="Imprimir">
                                        <i class="fas fa-print"></i>
                                    </button>
                                </div>
                            </div>
                        `
                    )
                    .join('')}
            </div>
            <div class="pagination">
                <button class="prev-button" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>Página ${currentPage} de ${Math.ceil(projects.length / projectsPerPage)}</span>
                <button class="next-button" ${currentPage === Math.ceil(projects.length / projectsPerPage) ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        contentAreaSub.innerHTML = html;

        // Mantener el valor seleccionado en el filtro **después de que el HTML ha sido cargado**
        /* if (filterSelect) {
            filterSelect.value = filterValue; // Asegúrate de que el filtro se mantenga como estaba
        } */

        document.querySelector('.prev-button').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                // Obtén el valor del filtro actual
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadProjects(searchTerm); // Pasar los filtros como parámetros
            }
        });

        document.querySelector('.next-button').addEventListener('click', () => {
            if (currentPage < Math.ceil(projects.length / projectsPerPage)) {
                currentPage++;
                // Obtén el valor del filtro actual
                const searchTerm = document.querySelector('.search-input').value.trim();

                loadProjects(searchTerm); // Pasar los filtros como parámetros
            }
        });


        //boton en el grid para generar
        document.querySelectorAll('.genera-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const projectId = projectRow.dataset.projectId;

                try {
                    const response = await fetch(`/api/proyectos/${projectId}`);
                    if (!response.ok) throw new Error('No se pudo obtener el proyecto.');

                    const project = await response.json();
                    configureProjectForm('edit', project);
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });


        document.querySelectorAll('.print-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                if (projectRow) {
                    projectIdToDelete = projectRow.dataset.projectId;
        
                    // Actualiza el popup dinámicamente
                    const deleteEntitySpan = document.getElementById('delete-entity');
                    const deletePopupMessage = document.getElementById('delete-popup-message');
                    deleteEntitySpan.textContent = 'proyecto';
                    //deletePopupMessage.textContent = `Proyecto: ${projectRow.querySelector('.project-grid-cell:nth-child(1)').textContent}`;
        
                    deletePopup.style.display = 'flex';
                }
            });
        });

        // Filtrar los proyectos cuando cambie el filtro
        document.querySelector('.filter-select').addEventListener('change', async () => {
            currentPage = 1; // Reiniciar la página actual al cambiar el filtro
            // Obtén el valor del filtro actual
            const searchTerm = document.querySelector('.search-input').value.trim();

            await loadProjects(searchTerm); // Pasar los filtros como parámetros
        });
        
    }

    function setupSearchButton() {
        const searchButton = document.querySelector('.search-button');
        const searchInput = document.querySelector('.search-input');
    
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                const searchTerm = searchInput.value.trim();
                currentPage = 1; // Reiniciar a la primera página al realizar una búsqueda
                loadProjects(searchTerm); // Cargar los usuarios filtrados
            });
        }
    }

    confirmDeleteButton.addEventListener('click', async () => {
        if (projectIdToDelete) {
            try {
                const response = await fetch(`/api/proyectos/${projectIdToDelete}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showMessage('Proyecto eliminado exitosamente.', 'success');
                    await loadProjects();
                } else {
                    showMessage('Error al eliminar el proyecto.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                deletePopup.style.display = 'none';
                projectIdToDelete = null;
            }
        }
    });

    cancelDeleteButton.addEventListener('click', () => {
        deletePopup.style.display = 'none';
        projectIdToDelete = null;
    });

    closeButton.addEventListener('click', () => {
        console.log('Botón de cerrar clickeado');
        popupOverlay.style.display = 'none';
    });

    //AQUI VA A CONSUMIR EL API
    //projectForm.addEventListener('submit', async (e) => {
    document.getElementById('create-project-video-button').addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir el comportamiento predeterminado
        // Resetear mensajes de error

        console.log("entrasss");
        document.querySelectorAll('.error-message').forEach((msg) => (msg.textContent = ''));

        const audioUrl = document.getElementById('link').value.trim(); // Obtener el enlace del audio
        let isValid = true;

        // Validar el enlace
        if (!audioUrl || !/^https?:\/\/.+$/.test(audioUrl)) {
            document.getElementById('error-link').textContent = 'El enlace debe ser una URL válida.';
            isValid = false;
        }

        // Mostrar el indicador de carga
        loadingIndicator.style.display = 'flex';
        transcriptResult.textContent = ''; // Limpiar cualquier resultado previo

        // Mostrar éxito si todos los campos son válidos
        if (isValid) {
            // Datos del formulario
            const formData = {
                url: audioUrl,
            };

            // Llamada al servidor usando fetch
            fetch('/transcribe', {
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
                        throw new Error('Error al transcribir el audio. Verifique el enlace e intente nuevamente.');
                    }
                })
                .then((data) => {
                    // Mostrar mensaje de éxito o manejar la respuesta del servidor
                    if (data.transcript) {
                        showMessage('Transcripción exitosa.', 'success');
                        const transcriptText = data.transcript; // Asignar la transcripción a una variable
                        console.log('Transcripción:', transcriptText); // Para debug o uso adicional
                        // Opcional: Mostrar en un campo de texto o elemento del DOM
                        document.getElementById('transcript-result').textContent = transcriptText;
                    } else {
                        showMessage('No se pudo obtener la transcripción.', 'error');
                    }
                })
                .catch((error) => {
                    // Manejo de errores de red o del servidor
                    console.error('Error:', error);
                    showMessage('Hubo un problema con la conexión al servidor.', 'error');
                });
        }

    });

    /* document.getElementById('update-project-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado
    
        const projectForm = document.getElementById('project-form');
        if (!projectForm) {
            showMessage("No se pudo encontrar el formulario. Inténtelo de nuevo.", "error");
            return;
        }
    
        const projectData = {
            idProyecto: document.getElementById('project-id').value.trim(), // Capturamos el ID del proyecto
            nombreProyecto: document.getElementById('project-name').value.trim(),
            nombreCliente: document.getElementById('client-name').value.trim(),
            rucCedula: document.getElementById('ruc').value.trim(),
            direccion: document.getElementById('address').value.trim(),
            telefono: document.getElementById('phone').value.trim(),
            correo: document.getElementById('email').value.trim(),
            descripcion: document.getElementById('description').value.trim(),
        };
    
        try {
            const response = await fetch(`/api/proyectos/${projectData.idProyecto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                showMessage(data.message || 'Proyecto actualizado exitosamente.', 'success');
                projectForm.reset(); // Limpiar el formulario
                popupOverlay.style.display = 'none'; // Cerrar el popup
                await loadProjects(); // Recargar la lista de proyectos
            } else {
                showMessage(data.message || 'Error al actualizar el proyecto.', 'error');
                if (data.rucCedula) {
                    document.getElementById('error-ruc').textContent = data.rucCedula;
                }
                if (data.nombreCliente) {
                    document.getElementById('error-client-name').textContent = data.nombreCliente;
                }
            }
        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            showMessage('Hubo un problema. No se pudo actualizar el proyecto.', 'error');
        }
    }); */

    if (menuProyectosVideos) {
        menuProyectosVideos.addEventListener('click', async (e) => {
            e.preventDefault();
            renderInitialStructure();
            await loadProjects();
            setupSearchButton(); // Configurar el botón de búsqueda
        });
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

