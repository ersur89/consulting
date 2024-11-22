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
                if (!/^\d{10}$/.test(clientPhone)) {
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
                    alert('Proyecto creado con éxito!');
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