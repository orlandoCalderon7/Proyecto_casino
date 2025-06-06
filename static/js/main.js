// Mostrar sección seleccionada
function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('d-none');
    });
    document.getElementById(sectionId).classList.remove('d-none');
}

// Cargar datos de fecha
document.addEventListener('DOMContentLoaded', function() {
    // Llenar días (1-31)
    const diaSelect = document.getElementById('dia');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        diaSelect.appendChild(option);
    }

    // Llenar meses
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesSelect = document.getElementById('mes');
    meses.forEach((mes, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = mes;
        mesSelect.appendChild(option);
    });

    // Llenar años (1940-actual)
    const anioSelect = document.getElementById('anio');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1940; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        anioSelect.appendChild(option);
    }

    // Cargar clientes al iniciar
    cargarClientes();
});

// Función para enviar datos del cliente
async function submitCliente(event) {
    event.preventDefault();
    
    const clienteData = {
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        dni: document.getElementById('dni').value,
        nacionalidad: document.getElementById('nacionalidad').value,
        fecha_nacimiento: `${document.getElementById('anio').value}-${document.getElementById('mes').value}-${document.getElementById('dia').value}`,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value 
    };

    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData)
        });

        if (response.ok) {
            alert('Cliente registrado con éxito');
            cargarClientes();
            document.getElementById('clienteForm').reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar cliente');
    }
}

// Cargar lista de clientes
async function cargarClientes() {
    try {
        const response = await fetch('/api/clientes');
        const clientes = await response.json();        
        const tableBody = document.getElementById('clientesTable');
        tableBody.innerHTML = '';
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.dni}</td>
                <td>${cliente.nombres}</td>
                <td>${cliente.apellidos}</td>
                <td>${cliente.nacionalidad}</td>
                <td>${new Date(cliente.fecha_nacimiento).toLocaleDateString()}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono}</td> 
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editarCliente('${cliente.dni}')">Editar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Funciones para editar, actualizar y eliminar
async function editarCliente(dni) {
    try {
        const response = await fetch(`/api/clientes/${dni}`);
        const cliente = await response.json();
        
        document.getElementById('nombres').value = cliente.nombres;
        document.getElementById('apellidos').value = cliente.apellidos;
        document.getElementById('dni').value = cliente.dni;
        document.getElementById('nacionalidad').value = cliente.nacionalidad;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono; 
        
        // Establecer fecha de nacimiento
        const fecha = new Date(cliente.fecha_nacimiento);
        document.getElementById('dia').value = fecha.getDate();
        document.getElementById('mes').value = fecha.getMonth() + 1;
        document.getElementById('anio').value = fecha.getFullYear();
    } catch (error) {
        console.error('Error al cargar cliente:', error);
    }
}

//Actulizar clientes
async function actualizarCliente() {
    const dni = document.getElementById('dni').value;
    if (!dni) {
        alert('Seleccione un cliente para actualizar');
        return;
    }
    
    const clienteData = {
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        dni: dni,
        nacionalidad: document.getElementById('nacionalidad').value,
        fecha_nacimiento: `${document.getElementById('anio').value}-${document.getElementById('mes').value}-${document.getElementById('dia').value}`,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value 
    };

    try {
        const response = await fetch(`/api/clientes/${dni}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData)
        });

        if (response.ok) {
            alert('Cliente actualizado con éxito');
            cargarClientes();
            document.getElementById('clienteForm').reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar cliente');
    }
}

//Eliminar clientes
async function eliminarCliente() {
    const dni = document.getElementById('dni').value;
    if (!dni) {
        alert('Seleccione un cliente para eliminar');
        return;
    }
    
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            const response = await fetch(`/api/clientes/${dni}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Cliente eliminado con éxito');
                cargarClientes();
                document.getElementById('clienteForm').reset();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar cliente');
        }
    }
}
