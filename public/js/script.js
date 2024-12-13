
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

//INICIO
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/user-info');
        if (!response.ok) {
            throw new Error('No se pudo cargar la información del usuario');
        }
        const userInfo = await response.json();

        // Actualiza el nombre en el dashboard
        const profileInfo = document.querySelector('.profile-info p');
        profileInfo.textContent = userInfo.name || 'Usuario'; // Muestra el nombre o un valor predeterminado

        const userNameSpan = document.getElementById('user-name');
        userNameSpan.textContent = userInfo.name || 'Usuario Genérico';
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        window.location.href = '/'; // Redirige al login si no está autenticado
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuCrear = document.getElementById('menu-inicio');
    const contentArea = document.getElementById('content-area');

    if (menuCrear) {
        menuCrear.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                // Solicitar la información del usuario desde la API
                const response = await fetch('/api/user-info');
                if (!response.ok) {
                    throw new Error('No se pudo cargar la información del usuario');
                }
                const userInfo = await response.json();

                // Generar el contenido dinámico con el nombre del usuario
                const html = `
                    <h1>Bienvenido, <span id="user-name">${userInfo.name || 'Usuario Genérico'}</span></h1>
                    <p>Esta es tu página de inicio.</p>
                `;

                contentArea.innerHTML = html;

            } catch (error) {
                console.error('Error al obtener la información del usuario:', error);
                // Redirigir al login si hay un error
                window.location.href = '/login';
            }

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
        if (!document.getElementById('project-name').value.trim()) {
            showMessage("No se pudo encontrar el formulario. Inténtelo de nuevo.", "error");
            return;
        }

        let isValid = true;

        // Validar nombre del proyecto
        if (!document.getElementById('project-name').value.trim()) {
            document.getElementById('error-project-name').textContent = 'El nombre del proyecto es obligatorio.';
            isValid = false;
        }

        // Validar Cédula o RUC
        if (!/^\d{10,13}$/.test(document.getElementById('ruc').value.trim())) {
            document.getElementById('error-ruc').textContent = 'La cédula o RUC debe contener entre 10 y 13 números.';
            isValid = false;
        }

        // Validar nombre del cliente
        if (!document.getElementById('client-name').value.trim()) {
            document.getElementById('error-client-name').textContent = 'El nombre del cliente es obligatorio.';
            isValid = false;
        }

        // Validar dirección
        if (!document.getElementById('address').value.trim()) {
            document.getElementById('error-address').textContent = 'La dirección del cliente es obligatoria.';
            isValid = false;
        }

        if(isValid){
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
                    /* if (data.rucCedula) {
                        document.getElementById('error-ruc').textContent = data.rucCedula;
                    }
                    if (data.nombreCliente) {
                        document.getElementById('error-client-name').textContent = data.nombreCliente;
                    }
                    if (data.nombreCliente) {
                        document.getElementById('error-client-name').textContent = data.nombreCliente;
                    } */
                }
            } catch (error) {
                console.error('Error al actualizar el proyecto:', error);
                showMessage('Hubo un problema. No se pudo actualizar el proyecto.', 'error');
            }
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
    const loadingIndicator = document.getElementById('loading-indicator');

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
                                    <button class="genera-button" title="Generar" ${project.generado === 'S' ? 'disabled' : ''}>
                                        <i class="fas fa-file-alt" style="${project.generado === 'S' ? 'color: gray;' : ''}"></i>
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


        //GENERAR REPORTE DE CUESTIONARIO
        /* document.querySelectorAll('.print-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const idProyecto = projectRow.dataset.projectId;
                const idTranscripcion = projectRow.dataset.transcriptionId;

                try {
                    // Mostrar indicador de carga (opcional)
                    const loadingIndicator = document.getElementById('loading-indicator');
                    loadingIndicator.style.display = 'flex';

                    const response = await fetch(`/api/generar-reporte/${idProyecto}/${idTranscripcion}`);
                    if (!response.ok) {
                        throw new Error('Error al generar el reporte');
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_proyecto_${idProyecto}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Ocultar indicador de carga
                    loadingIndicator.style.display = 'none';

                    showMessage('Reporte descargado exitosamente.', 'success');
                } catch (error) {
                    console.error('Error al descargar el reporte:', error);
                    showMessage('Error al descargar el reporte.', 'error');
                }
            });
        }); */

        document.querySelectorAll('.print-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const idProyecto = projectRow.dataset.projectId;
                let idTranscripcion = projectRow.dataset.transcriptionId;
    
                try {
                    // Mostrar indicador de carga (opcional)
                    const loadingIndicator = document.getElementById('loading-indicator');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'flex';
                    }
    
                    // Si no tenemos el idTranscripcion, lo consultamos desde el servidor
                    if (!idTranscripcion) {
                        const transcripcionResponse = await fetch(`/api/proyecto/${idProyecto}/transcripcion`);
                        if (!transcripcionResponse.ok) {
                            throw new Error('Error al obtener el ID de la transcripción o no se ha generado el cuestionario aun.');
                        }
    
                        const transcripcionData = await transcripcionResponse.json();
                        idTranscripcion = transcripcionData.idTranscripcion;
    
                        if (!idTranscripcion) {
                            throw new Error('No se encontró un ID de transcripción asociado.');
                        }
                    }
    
                    // Generar y descargar el reporte
                    const response = await fetch(`/api/generar-reporte/${idProyecto}/${idTranscripcion}`);
                    if (!response.ok) {
                        throw new Error('Error al generar el reporte');
                    }
    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_proyecto_${idProyecto}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
    
                    //showMessage('Reporte descargado exitosamente.', 'success');
                } catch (error) {
                    console.error('Error al descargar el reporte:', error);
                    showMessage(error.message || 'Error al descargar el reporte.', 'error');
                } finally {
                    // Ocultar indicador de carga
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
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
    document.getElementById('create-project-video-button').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado
    
        // Resetear mensajes de error
        document.querySelectorAll('.error-message').forEach((msg) => (msg.textContent = ''));
        const audioUrl = document.getElementById('link').value.trim(); // Obtener el enlace del audio
        const loadingIndicator = document.getElementById('loading-indicator'); // Indicador de carga
        const errorProceso = document.getElementById('error-proceso'); // Elemento para mostrar errores del proceso
        const idProyecto   = document.getElementById('id-proyect').value.trim();
        let isValid = true;
    
        // Validar el enlace
        if (!audioUrl || !/^https?:\/\/.+$/.test(audioUrl)) {
            document.getElementById('error-link').textContent = 'El enlace debe ser una URL válida.';
            isValid = false;
        }
    
        // Mostrar el indicador de carga
        loadingIndicator.style.display = 'flex';
    
        // Mostrar éxito si todos los campos son válidos
        if (isValid) {
            // Datos del formulario
            const formData = { url: audioUrl };
    
            try {
                // Llamada a la API de transcripción
                const responseTranscribe = await fetch('/transcribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                if (!responseTranscribe.ok) {
                    const errorData = await responseTranscribe.json();
                    throw new Error(errorData.error || 'Error al transcribir el audio.');
                }
    
                const dataTranscribe = await responseTranscribe.json();
    
                if (dataTranscribe.transcript) {
                    const transcriptText = dataTranscribe.transcript; // Asignar la transcripción a una variable
                    //showMessage('Transcripción exitosa.', 'success');
                    console.log('Transcripción:', transcriptText);
    
                    // Llamada a la API para generar preguntas
                    const responseGenerate = await fetch('/generate-questions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            content: `${transcriptText} Según el texto que tienes anteriormente puedes generarme las preguntas y las opciones de respuestas de manera ordenada y junto a las respuesta entre parentesis el numero de veces q se repitio.`,
                        }),
                    });
    
                    if (!responseGenerate.ok) {
                        const errorData = await responseGenerate.json();
                        throw new Error(errorData.error || 'Error al generar preguntas.');
                    }
    
                    const dataGenerate = await responseGenerate.json();
    
                    if (dataGenerate.texto) {
                        // Mostrar las preguntas generadas
                        /* const questionsContainer = document.getElementById('questions-container');
                        questionsContainer.textContent = dataGenerate.texto; // Renderizar las preguntas generadas */

                        const transcriptText = dataGenerate.texto;
                        // Llamada para guardar la transcripción
                        fetch('/save-transcription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                idProyecto: idProyecto, // Asegúrate de tener este valor disponible
                                texto: transcriptText,
                            }),
                        })
                            .then((response) => {
                                if (response.ok) {
                                    return response.json(); // Parsear la respuesta del servidor
                                } else {
                                    throw new Error('No se pudo guardar la transcripción.');
                                }
                            })
                            .then((dataSave) => {
                                console.log('Transcripción guardada:', dataSave);
                                projectForm.reset(); // Limpiar el formulario
                                popupOverlay.style.display = 'none'; // Cerrar el popup
                                //showMessage(dataSave.message, 'success');
                                
                                // Opcional: usar el ID de la transcripción
                                const idTranscripcion = dataSave.idTranscripcion;

                                // Aquí puedes llamar a la función para guardar preguntas si lo necesitas
                                const content = {
                                    idProyecto: document.getElementById('project-id').value, // Asegúrate de tener este ID en el formulario
                                    idTranscripcion: idTranscripcion,
                                    text: transcriptText.content[0].text, // El texto de la transcripción generado
                                };
                            
                                // Llamar al endpoint para guardar el cuestionario
                                fetch('/guardar-cuestionario', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(content),
                                })
                                    .then((response) => {
                                        if (response.ok) {
                                            return response.json(); // Parsear respuesta
                                        } else {
                                            throw new Error('Error al guardar las preguntas del cuestionario.');
                                        }
                                    })
                                    .then((dataQuestions) => {
                                        console.log('Cuestionario guardado:', dataQuestions);
                                        showMessage(dataQuestions.message || 'Cuestionario generado exitosamente.', 'success');
                                    })
                                    .catch((error) => {
                                        console.error('Error al guardar el cuestionario:', error);
                                        document.getElementById('error-proceso').textContent = 'Error al guardar las preguntas del cuestionario. Verifique la transcripción.';
                                    });
                            })
                            .catch((error) => {
                                console.error('Error al guardar la transcripción:', error);
                                showMessage('Error al guardar la transcripción.', 'error');
                            });
                        console.log(dataGenerate.texto);
                        showMessage('Preguntas generadas con éxito.', 'success');
                    } else {
                        throw new Error('No se pudieron generar preguntas.');
                    }
                } else {
                    throw new Error('No se pudo obtener la transcripción.');
                }
            } catch (error) {
                console.error('Error:', error);
                errorProceso.textContent = error.message || 'Hubo un problema con la conexión al servidor.';
            } finally {
                // Ocultar el indicador de carga
                loadingIndicator.style.display = 'none';
            }
        } else {
            loadingIndicator.style.display = 'none'; // Ocultar el indicador de carga si no es válido
        }
    });


    if (menuProyectosVideos) {
        menuProyectosVideos.addEventListener('click', async (e) => {
            e.preventDefault();
            renderInitialStructure();
            await loadProjects();
            setupSearchButton(); // Configurar el botón de búsqueda
        });
    }
});


// logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout'); // Selecciona el elemento por su ID

    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace

            try {
                // Realizar la solicitud para cerrar sesión
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Redirigir al login después de cerrar la sesión
                    window.location.href = '/'; // Asegúrate de que esta sea la ruta de tu pantalla de inicio de sesión
                } else {
                    const data = await response.json();
                    console.error('Error al cerrar sesión:', data.error || 'Error desconocido');
                    alert('No se pudo cerrar la sesión. Intenta de nuevo.');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Hubo un problema al cerrar la sesión.');
            }
        });
    }
});


// Manejo de cuestionarios
document.addEventListener('DOMContentLoaded', () => {
    const menuCuestionario = document.getElementById('menu-cuestionario');
    const contentArea = document.getElementById('content-area');
    const popupOverlay = document.getElementById('edit-cuestionario-popup');
    const closeButton = document.getElementById('close-button-cuestionario');

    let currentPage = 1; // Página inicial
    const projectsPerPage = 5; // Número de proyectos por página
    let totalProjects = 0; // Total de proyectos
    let filteredProjects = []; // Guardar los proyectos filtrados

    if (menuCuestionario) {
        menuCuestionario.addEventListener('click', async (e) => {
            e.preventDefault();

            renderCuestionarioStructure();
            await loadCuestionarios();
            setupSearchButton(); // Configurar el botón de búsqueda
        });
    }

    async function loadCuestionarios(searchTerm = '') {
        const contentAreaSub = document.querySelector('#contentAreaSub');
        const filterSelect = document.querySelector('.filter-select'); // Asegúrate de que el filtro exista
        let filterValue = filterSelect ? filterSelect.value : ''; // Obtén el valor del filtro inicial
        let cuestionarios = [];

        try {
            const response = await fetch('/api/cuestionarios');
            if (!response.ok) throw new Error('Error al obtener los cuestionarios.');
            cuestionarios = await response.json();
        } catch (error) {
            console.error('Error al cargar cuestionarios:', error);
            contentAreaSub.innerHTML = `<p class="error-message">No se pudieron cargar los cuestionarios.</p>`;
            return;
        }

        // Filtrar cuestionarios por estado
        if (filterValue) {
            cuestionarios = cuestionarios.filter((cuestionario) =>
                cuestionario.estado.toLowerCase() === filterValue.toLowerCase()
            );
        }

        // Filtrar cuestionarios por término de búsqueda
        if (searchTerm) {
            cuestionarios = cuestionarios.filter((cuestionario) =>
                cuestionario.proyecto_nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Paginación
        const cuestionariosShow = cuestionarios.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

        // Generar HTML
        const html = `
            <div class="project-grid">
                <div class="project-grid-header">
                    <div class="project-grid-cell">Proyecto</div>
                    <div class="project-grid-cell">Cuestionario</div>
                    <div class="project-grid-cell">Nombre Proyecto</div>
                    <div class="project-grid-cell">Generado</div>
                    <div class="project-grid-cell">Estado</div>
                    <div class="project-grid-cell">Operaciones</div>
                </div>
                ${cuestionariosShow
                    .map(
                        (cuestionario) => `
                        <div class="project-grid-row" data-project-id="${cuestionario.id_proyecto}">
                            <div class="project-grid-cell">${cuestionario.id_proyecto}</div>
                            <div class="project-grid-cell">${cuestionario.id_transcripcion}</div>
                            <div class="project-grid-cell">${cuestionario.proyecto_nombre}</div>
                            <div class="project-grid-cell">${cuestionario.generado}</div>
                            <div class="project-grid-cell">${cuestionario.estado}</div>
                            <div class="project-grid-cell">
                                <button class="edit-button">
                                    <i class="fas fa-edit"></i>
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
                <span>Página ${currentPage} de ${Math.ceil(cuestionarios.length / projectsPerPage)}</span>
                <button class="next-button" ${currentPage === Math.ceil(cuestionarios.length / projectsPerPage) ? 'disabled' : ''}>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        // Mostrar el contenido generado
        contentAreaSub.innerHTML = html;

        // Agregar eventos para botones de paginación
        document.querySelector('.prev-button').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadCuestionarios(); // Recargar los cuestionarios
            }
        });

        document.querySelector('.next-button').addEventListener('click', () => {
            if (currentPage < Math.ceil(cuestionarios.length / projectsPerPage)) {
                currentPage++;
                loadCuestionarios(); // Recargar los cuestionarios
            }
        });

        document.querySelectorAll('.edit-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const idProyecto = projectRow.dataset.projectId;
        
                try {
                    let idCuestionario;
        
                    // Consultar el ID del cuestionario relacionado con el proyecto
                    const cuestionarioResponse = await fetch(`/api/proyecto/${idProyecto}/cuestionario`);
                    if (!cuestionarioResponse.ok) {
                        throw new Error('Error al obtener el ID del cuestionario.');
                    }
        
                    const cuestionarioData = await cuestionarioResponse.json();
                    if (cuestionarioData.length > 0) {
                        idCuestionario = cuestionarioData[0].id_cuestionario;
                    } else {
                        throw new Error('No se encontró un cuestionario asociado a este proyecto.');
                    }
        
                    // Llamar a la función openCuestionarioForm con los datos necesarios
                    openCuestionarioForm('edit', { idProyecto, idCuestionario });
                } catch (error) {
                    console.error('Error al editar el cuestionario:', error);
                    showMessage(error.message || 'Hubo un problema al cargar los datos del cuestionario.', 'error');
                }
            });
        });
        

        // Filtrar los proyectos cuando cambie el filtro
        document.querySelector('.filter-select').addEventListener('change', async () => {
            currentPage = 1; // Reiniciar la página actual al cambiar el filtro
            // Obtén el valor del filtro actual
            const searchTerm = document.querySelector('.search-input').value.trim();

            await loadCuestionarios(searchTerm); // Pasar los filtros como parámetros
        });

        document.querySelector('.search-button').addEventListener('click', () => {
            const searchTerm = document.querySelector('.search-input').value.trim();
            currentPage = 1;
            loadCuestionarios(searchTerm);
        });

        document.querySelectorAll('.print-button').forEach((button) => {
            button.addEventListener('click', async (e) => {
                const projectRow = e.target.closest('.project-grid-row');
                const idProyecto = projectRow.dataset.projectId;
                //console.log ("dato ver:",idProyecto);
                let idTranscripcion = "";
    
                try {
                    // Mostrar indicador de carga (opcional)
                    const loadingIndicator = document.getElementById('loading-indicator');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'flex';
                    }
    
                    // Si no tenemos el idTranscripcion, lo consultamos desde el servidor
                    if (!idTranscripcion) {
                        const transcripcionResponse = await fetch(`/api/proyecto/${idProyecto}/transcripcion`);
                        if (!transcripcionResponse.ok) {
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                            }
                            throw new Error('Error al obtener el ID de la transcripción o no se ha generado el cuestionario aun.');
                        }
    
                        const transcripcionData = await transcripcionResponse.json();
                        idTranscripcion = transcripcionData.idTranscripcion;
    
                        if (!idTranscripcion) {
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                            }
                            throw new Error('No se encontró un ID de transcripción asociado.');
                        }
                    }
    
                    // Generar y descargar el reporte
                    const response = await fetch(`/api/generar-reporte/${idProyecto}/${idTranscripcion}`);
                    if (!response.ok) {
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                        throw new Error('Error al generar el reporte');
                        
                    }
    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `reporte_proyecto_${idProyecto}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
    
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    //showMessage('Reporte descargado exitosamente.', 'success');
                } catch (error) {
                    console.error('Error al descargar el reporte:', error);
                    showMessage(error.message || 'Error al descargar el reporte.', 'error');
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                } finally {
                    // Ocultar indicador de carga
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                }
            });
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

    function renderCuestionarioStructure() {
        contentArea.innerHTML = `
            <div class="table-header">
                <h2>Cuestionarios Registrados</h2>
                <!-- <button class="create-button">CREAR NUEVO</button> -->
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
            <div id="contentAreaSub"></div> <!-- Tabla de cuestionarios -->
        `;


    }

    /* function openCuestionarioForm(mode, data) {
        const popupOverlay = document.getElementById('edit-cuestionario-popup');
        const questionTextInput = document.getElementById('question-text');
        const alternativesContainer = document.getElementById('alternatives-container');
        const popupTitle = document.querySelector('.popup-header h3');
        const prevButton = document.getElementById('prev-question-button');
        const nextButton = document.getElementById('next-question-button');
        const saveButton = document.getElementById('save-cuestionario-button');
    
        let currentQuestionIndex = 0;
        let cuestionario = []; // Aquí se almacenarán las preguntas y alternativas cargadas
    
        // Función para cargar el cuestionario desde el servidor
        async function loadCuestionario(idProyecto, idCuestionario) {
            try {
                const response = await fetch(`/api/cuestionariosdet/${idProyecto}/${idCuestionario}`);
                if (!response.ok) throw new Error('Error al cargar el cuestionario.');
                cuestionario = await response.json();
                renderQuestion(currentQuestionIndex);
            } catch (error) {
                console.error('Error al cargar el cuestionario:', error);
                showMessage('Hubo un problema al cargar el cuestionario.', 'error');
            }
        }
    
        // Renderizar una pregunta y sus alternativas
        function renderQuestion(index) {
            if (!cuestionario[index]) return;
    
            const question = cuestionario[index];
            questionTextInput.value = question.descripcion;
    
            // Renderizar alternativas
            alternativesContainer.innerHTML = '';
            question.alternativas.forEach((alt, altIndex) => {
                const alternativeHTML = `
                    <div class="alternative-row" data-alt-index="${altIndex}">
                        <input type="text" class="alternative-input" value="${alt.descripcion}" />
                        <input type="number" class="alternative-order" value="${alt.orden}" min="1" />
                        <button class="remove-alternative-button">&times;</button>
                    </div>
                `;
                const div = document.createElement('div');
                div.innerHTML = alternativeHTML;
                alternativesContainer.appendChild(div.firstElementChild);
    
                // Agregar funcionalidad para eliminar la alternativa
                div.querySelector('.remove-alternative-button').addEventListener('click', (e) => {
                    const altIndex = e.target.closest('.alternative-row').dataset.altIndex;
                    cuestionario[index].alternativas.splice(altIndex, 1); // Eliminar del array
                    renderQuestion(index); // Recargar la pregunta actual
                });
            });
    
            updateNavigationButtons();
        }
    
        // Actualizar visibilidad de botones de navegación
        function updateNavigationButtons() {
            prevButton.disabled = currentQuestionIndex === 0;
            nextButton.disabled = currentQuestionIndex === cuestionario.length - 1;
        }
    
        // Agregar una nueva alternativa
        document.getElementById('add-alternative-button').addEventListener('click', () => {
            const newAlternative = {
                descripcion: '',
                orden: cuestionario[currentQuestionIndex].alternativas.length + 1,
            };
            cuestionario[currentQuestionIndex].alternativas.push(newAlternative);
            renderQuestion(currentQuestionIndex);
        });
    
        // Navegar entre preguntas
        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuestion(currentQuestionIndex);
            }
        });
    
        nextButton.addEventListener('click', () => {
            if (currentQuestionIndex < cuestionario.length - 1) {
                currentQuestionIndex++;
                renderQuestion(currentQuestionIndex);
            }
        });
    
        // Guardar el cuestionario en el servidor
        saveButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/api/cuestionarios/${data.idProyecto}/${data.idCuestionario}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cuestionario),
                });
    
                if (!response.ok) throw new Error('Error al guardar el cuestionario.');
                showMessage('Cuestionario guardado con éxito.', 'success');
                popupOverlay.style.display = 'none';
            } catch (error) {
                console.error('Error al guardar el cuestionario:', error);
                showMessage('Error al guardar el cuestionario.', 'error');
            }
        });
    
        // Mostrar el popup
        popupOverlay.style.display = 'flex';
    
        // Cargar los datos del cuestionario si es modo "editar"
        if (mode === 'edit' && data) {
            popupTitle.textContent = `Editar Cuestionario: ${data.idCuestionario}`;
            loadCuestionario(data.idProyecto, data.idCuestionario);
        } else {
            popupTitle.textContent = 'Crear Nuevo Cuestionario';
        }
    } */

    function openCuestionarioForm(mode, data) {
        const popupOverlay = document.getElementById('edit-cuestionario-popup');
        const questionDescriptionInput = document.getElementById('question-description');
        const questionOrderInput = document.getElementById('question-order');
        const alternativesContainer = document.getElementById('alternatives-container');
        const popupTitle = document.getElementById('question-title');
        const addAlternativeButton = document.getElementById('add-alternative-button');
        const prevQuestionButton = document.getElementById('prev-question-button');
        const nextQuestionButton = document.getElementById('next-question-button');
        const saveCuestionarioButton = document.getElementById('save-cuestionario-button');
    
        // Variables para manejar las preguntas
        let currentQuestionIndex = 0;
        let cuestionario = [];
    
        // Limpiar los campos del formulario
        questionDescriptionInput.value = '';
        questionOrderInput.value = '';
        alternativesContainer.innerHTML = '';
    
        if (mode === 'edit' && data) {
            popupTitle.textContent = `Cuestionario: ${data.idCuestionario}`;
    
            // Cargar datos desde el servidor
            fetch(`/api/cuestionariosdet/${data.idProyecto}/${data.idCuestionario}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener los datos del cuestionario.');
                    }
                    return response.json();
                })
                .then(cuestionarioData => {
                    if (!cuestionarioData || cuestionarioData.length === 0) {
                        throw new Error('El cuestionario está vacío o no se pudo cargar correctamente.');
                    }
                    cuestionario = cuestionarioData;
                    renderQuestion(cuestionario[currentQuestionIndex]); // Renderizar la primera pregunta
                })
                .catch(error => {
                    console.error('Error al cargar el cuestionario:', error);
                    showMessage('Hubo un problema al cargar el cuestionario. Inténtalo nuevamente.', 'error');
                });
        } else if (mode === 'create') {
            popupTitle.textContent = 'Crear Nuevo Cuestionario';
        }
    
        // Mostrar el popup
        popupOverlay.style.display = 'flex';
    
        // Función para renderizar una pregunta y sus alternativas
        function renderQuestion(pregunta) {
            if (!pregunta) {
                console.error('Pregunta no encontrada para renderizar.');
                showMessage('No hay preguntas para mostrar.', 'error');
                return;
            }
            questionDescriptionInput.value = pregunta.descripcion || '';
            questionOrderInput.textContent = pregunta.orden || '';
            alternativesContainer.innerHTML = '';
        
            pregunta.alternativas.forEach((alt) => {
                const alternativeHTML = `
                    <div class="alternative-row" data-alternative-id="${alt.id_alternativa}">
                        <input type="text" class="alternative-input" value="${alt.descripcion}" />
                        <input type="number" class="alternative-order" value="${alt.orden}" min="1" />
                        <button class="remove-alternative-button">&times;</button>
                    </div>
                `;
        
                const div = document.createElement('div');
                div.innerHTML = alternativeHTML;
                const button = div.querySelector('.remove-alternative-button');
                if (button) {
                    button.addEventListener('click', (e) => {
                        e.target.closest('.alternative-row').remove();
                    });
                } else {
                    console.error('El botón para eliminar la alternativa no se encontró.');
                }
                alternativesContainer.appendChild(div.firstElementChild);
        
            });
        }
        
        /* function renderQuestion(pregunta) {
            if (!pregunta) {
                console.error('Pregunta no encontrada para renderizar.');
                showMessage('No hay preguntas para mostrar.', 'error');
                return;
            }
    
            questionDescriptionInput.value = pregunta.descripcion || '';
            questionOrderInput.textContent  = pregunta.orden || '';
            alternativesContainer.innerHTML = '';
    
            pregunta.alternativas.forEach((alt, index) => {
                const alternativeHTML = `
                    <div class="alternative-row" data-order="${alt.orden}">
                        <input type="text" class="alternative-input" value="${alt.descripcion || ''}" />
                        <input type="number" class="alternative-order" value="${alt.orden || index + 1}" min="1" />
                        <button class="remove-alternative-button">&times;</button>
                    </div>
                `;
            
                const div = document.createElement('div');
                div.innerHTML = alternativeHTML;
            
                // Verifica si el botón existe antes de intentar agregar un evento
                const button = div.querySelector('.remove-alternative-button');
                if (button) {
                    button.addEventListener('click', (e) => {
                        e.target.closest('.alternative-row').remove();
                    });
                } else {
                    console.error('El botón para eliminar la alternativa no se encontró.');
                }
            
                alternativesContainer.appendChild(div.firstElementChild);
            });
            
        } */
    
        // Función para guardar la pregunta actual
        function saveCurrentQuestion() {
            const currentQuestion = cuestionario[currentQuestionIndex];
        
            // Verificar si la pregunta actual existe
            if (!currentQuestion) {
                console.error("No se encontró la pregunta actual.");
                return;
            }
        
            const updatedDescription = questionDescriptionInput.value.trim();
            const updatedOrder = questionOrderInput.value.trim();
        
            // Solo actualizar el orden si es válido
            if (updatedOrder && !isNaN(updatedOrder)) {
                currentQuestion.orden = parseInt(updatedOrder, 10);
            }
        
            // Actualizar la descripción de la pregunta
            currentQuestion.descripcion = updatedDescription;
        
            // Actualizar las alternativas
            currentQuestion.alternativas = Array.from(alternativesContainer.children).map((altRow) => {
                const description = altRow.querySelector('.alternative-input').value.trim();
                const order = altRow.querySelector('.alternative-order').value.trim();
                const id = altRow.dataset.alternativeId;
        
                return {
                    id_alternativa: id,
                    descripcion: description,
                    orden: order ? parseInt(order, 10) : null, // Validar que el orden sea un número
                };
            });
        }
        
        
        /* function saveCurrentQuestion() {
            if (!cuestionario[currentQuestionIndex]) return;
    
            const currentQuestion = cuestionario[currentQuestionIndex];
            currentQuestion.orden = questionOrderInput.textContent;
            currentQuestion.descripcion = questionDescriptionInput.value;
            currentQuestion.alternativas = Array.from(alternativesContainer.children).map((row, index) => ({
                id_alternativa: row.dataset.order || index + 1,
                descripcion: row.querySelector('.alternative-input').value,
                orden: parseInt(row.querySelector('.alternative-order').value, 10),
            }));
        } */
    
        // Botón para agregar una nueva alternativa
        addAlternativeButton.addEventListener('click', () => {
            // Crear un contenedor para la nueva alternativa
            const div = document.createElement('div');
            div.className = 'alternative-row';

            // Agregar el contenido HTML de la nueva alternativa
            div.innerHTML = `
                <input type="text" class="alternative-input" placeholder="Nueva alternativa" />
                <input type="number" class="alternative-order" value="${alternativesContainer.children.length + 1}" min="1" />
                <button class="remove-alternative-button">&times;</button>
            `;

            // Agregar la nueva alternativa al contenedor de alternativas
            alternativesContainer.appendChild(div);

            // Seleccionar el botón recién agregado y asignar el evento
            const removeButton = div.querySelector('.remove-alternative-button');
            if (removeButton) {
                removeButton.addEventListener('click', (e) => {
                    e.target.closest('.alternative-row').remove();
                });
            }
        });

    
        // Navegación de preguntas
        prevQuestionButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                saveCurrentQuestion();
                currentQuestionIndex--; // Mover al índice anterior
                renderQuestion(cuestionario[currentQuestionIndex]); // Renderizar la pregunta actualizada
            }/*  else {
                showMessage('Estás en la primera pregunta.', 'info'); // Opcional: mostrar mensaje si ya estás en la primera pregunta
            } */
        });
    
        nextQuestionButton.addEventListener('click', () => {
            if (currentQuestionIndex < cuestionario.length - 1) {
                saveCurrentQuestion();
                currentQuestionIndex++; // Mover al siguiente índice
                renderQuestion(cuestionario[currentQuestionIndex]); // Renderizar la pregunta actualizada
            } /* else {
                showMessage('Estás en la última pregunta.', 'info'); // Opcional: mostrar mensaje si ya estás en la última pregunta
            } */
        });
    
        // Guardar cambios del cuestionario
        saveCuestionarioButton.addEventListener('click', async () => {
            saveCurrentQuestion(); // Guardar los datos de la pregunta actual
            try {
                const response = await fetch(`/api/cuestionarios/${data.idProyecto}/${data.idCuestionario}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    
                    body: JSON.stringify(cuestionario),
                });
                console.log ("Datos:",cuestionario);
                const result = await response.json();
                if (response.ok) {
                    showMessage(result.message || 'Cuestionario guardado correctamente.', 'success');
                    popupOverlay.style.display = 'none';
                } else {
                    showMessage(result.error || 'Error al guardar el cuestionario.', 'error');
                }
            } catch (error) {
                console.error('Error al guardar el cuestionario:', error);
                showMessage('Hubo un problema al guardar el cuestionario. Inténtalo nuevamente.', 'error');
            }
        });
    
        // Botón para cerrar el popup
        document.getElementById('close-cuestionario-button').addEventListener('click', () => {
            popupOverlay.style.display = 'none';
        });
    }

    
    closeButton.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
    });


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

