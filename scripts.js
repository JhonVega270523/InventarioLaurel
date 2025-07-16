const defaultProducts = [
    { id: 'prod-1', name: 'Peluche Pequeño', price: 15000 },
    { id: 'prod-2', name: 'Caja Decorada Mediana', price: 10000 },
    { id: 'prod-3', name: 'Globo Metalizado (unidad)', price: 7000 },
    { id: 'prod-4', name: 'Rosas Rojas (unidad)', price: 5000 },
    { id: 'prod-5', name: 'Chocolates Surtidos (caja)', price: 20000 },
    { id: 'prod-6', name: 'Taza Personalizada', price: 18000 },
    { id: 'prod-7', name: 'Tarjeta Dedicatoria', price: 3000 }
];

const FIXED_LABOR_COST = 40000; // Definimos el costo fijo de mano de obra
const ORDERS_PER_PAGE = 6; // Número de pedidos a mostrar inicialmente

let products = [];
let orders = [];
let clientsDb = []; // Nueva base de datos para clientes
let allOrdersVisible = false; // Estado para controlar si todos los pedidos están visibles

const productsTableBody = document.querySelector('#products-table tbody');
const searchInput = document.getElementById('productSearch');
const searchResultsDiv = document.getElementById('search-results');
const deliveryCostInput = document.getElementById('deliveryCost');
const selectedProductsDiv = document.getElementById('selected-products');
const finalTotalSpan = document.getElementById('finalTotal');
const saveOrderBtn = document.getElementById('saveOrderBtn');
const orderHistoryList = document.getElementById('order-history-list');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const showMoreOrdersBtn = document.getElementById('showMoreOrdersBtn'); // Botón "Ver Más Pedidos"

const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const addProductBtn = document.getElementById('addProductBtn');
const updateProductBtn = document.getElementById('updateProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editProductIdInput = document.getElementById('editProductId');

// Nuevas referencias para los filtros de fecha y texto
const filterStartDateInput = document.getElementById('filterStartDate');
const filterEndDateInput = document.getElementById('filterEndDate');
const filterClientNameInput = document.getElementById('filterClientName');
const filterOrderNumberInput = document.getElementById('filterOrderNumber');
const filteredOrdersTotalSpan = document.getElementById('filteredOrdersTotal');

// Referencias al modal de detalles del cliente
const clientDetailsModal = document.getElementById('clientDetailsModal');
const clientModalCloseButton = document.querySelector('.client-modal-close');
const modalClientNameInput = document.getElementById('modalClientName');
const modalClientContactInput = document.getElementById('modalClientContact');
const modalDeliveryTimeInput = document.getElementById('modalDeliveryTime');
const modalDeliveryAddressInput = document.getElementById('modalDeliveryAddress');
const modalCityNeighborhoodInput = document.getElementById('modalCityNeighborhood');
const modalProductNameFinalInput = document.getElementById('modalProductNameFinal');
const modalClientDetailsTotalSpan = document.getElementById('modalClientDetailsTotal');
const confirmSaveOrderBtn = document.getElementById('confirmSaveOrderBtn');

// Referencias al modal de información del domiciliario
const deliveryInfoModal = document.getElementById('deliveryInfoModal');
const deliveryModalCloseButton = document.querySelector('.delivery-modal-close');
const deliveryModalOrderNumber = document.getElementById('deliveryModalOrderNumber');
const deliveryModalClientName = document.getElementById('deliveryModalClientName');
const deliveryModalClientContact = document.getElementById('deliveryModalClientContact');
const deliveryModalDeliveryTime = document.getElementById('deliveryModalDeliveryTime');
const deliveryModalDeliveryAddress = document.getElementById('deliveryModalDeliveryAddress');
const deliveryModalCityNeighborhood = document.getElementById('deliveryModalCityNeighborhood');
const deliveryModalProductNameFinal = document.getElementById('deliveryModalProductNameFinal');
const deliveryModalFinalTotal = document.getElementById('deliveryModalFinalTotal');
const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
const sendToWhatsappBtn = document.getElementById('sendToWhatsappBtn');

// Referencias al nuevo modal de la base de datos de clientes
const showClientsDbBtn = document.getElementById('showClientsDbBtn');
const clientsDbModal = document.getElementById('clientsDbModal');
const clientsDbModalCloseButton = document.querySelector('.clients-db-modal-close');
const clientsTableBody = document.querySelector('#clients-table tbody');
const noClientsMessageClientsDb = document.getElementById('noClientsMessage'); // Renombrado para evitar conflicto

// Nuevas referencias para los botones de exportar e importar
const exportProductsBtn = document.getElementById('exportProductsBtn');
const importProductsBtn = document.getElementById('importProductsBtn');
const importProductsFile = document.getElementById('importProductsFile');
const exportClientsBtn = document.getElementById('exportClientsBtn');


let nextProductId = 1;
let nextOrderId = 1;

// Objeto para almacenar temporalmente la Pedido antes de abrir el modal de cliente
let currentOrderToSave = null;
let currentClientToEdit = null; // Variable para almacenar el cliente que se está editando

// --- Funciones de LocalStorage ---

function saveProductsToLocalStorage() {
    localStorage.setItem('myProductsApp_products', JSON.stringify(products));
}

function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('myProductsApp_products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        if (products.length > 0) {
            const maxId = Math.max(...products.map(p => parseInt(p.id.replace('prod-', ''))));
            nextProductId = maxId + 1;
        } else {
            nextProductId = 1;
        }
    } else {
        products = [...defaultProducts];
        nextProductId = products.length + 1;
    }
}

function saveOrdersToLocalStorage() {
    const ordersToStore = orders.map(order => ({
        ...order,
        date: order.date.toISOString(),
    }));
    localStorage.setItem('myProductsApp_orders', JSON.stringify(ordersToStore));
}

function loadOrdersFromLocalStorage() {
    const storedOrders = localStorage.getItem('myProductsApp_orders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
        if (orders.length > 0) {
            orders.forEach(order => {
                order.date = new Date(order.date);
                // Asegurar que el estado exista, si no, establecerlo a 'pending'
                if (!order.status) {
                    order.status = 'pending';
                }
            });
            const maxOrderId = Math.max(...orders.map(o => o.orderNumber));
            nextOrderId = maxOrderId + 1;
        } else {
            nextOrderId = 1;
        }
    } else {
        orders = [];
    }
}

function saveClientsToLocalStorage() {
    localStorage.setItem('myProductsApp_clientsDb', JSON.stringify(clientsDb));
}

function loadClientsFromLocalStorage() {
    const storedClients = localStorage.getItem('myProductsApp_clientsDb');
    if (storedClients) {
        clientsDb = JSON.parse(storedClients);
    } else {
        clientsDb = [];
    }
}

// --- Funciones de Gestión de Productos (CRUD) ---

function renderProductTable() {
    productsTableBody.innerHTML = '';
    products.forEach(product => {
        const row = productsTableBody.insertRow();
        row.dataset.id = product.id;
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${formatCurrency(product.price)}</td>
            <td>
                <button class="edit-btn" data-id="${product.id}">Editar</button>
                <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            </td>
        `;
    });
    addTableEventListeners();
    filterAndRenderProductSelection();
    calculateTotal();
}

function addTableEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = (e) => editProduct(e.target.dataset.id);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = (e) => deleteProduct(e.target.dataset.id);
    });
}

function addProduct() {
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);

    if (!name || isNaN(price) || price <= 0) {
        alert('Por favor, ingresa un nombre y un precio válido para el producto.');
        return;
    }

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Ya existe un producto con este nombre. Por favor, usa un nombre diferente o edita el producto existente.');
        return;
    }

    const newProduct = {
        id: `prod-${nextProductId++}`,
        name: name,
        price: price
    };
    products.push(newProduct);
    saveProductsToLocalStorage();
    resetProductForm();
    renderProductTable();
}

function editProduct(id) {
    const productToEdit = products.find(p => p.id === id);
    if (productToEdit) {
        productNameInput.value = productToEdit.name;
        productPriceInput.value = productToEdit.price;
        editProductIdInput.value = productToEdit.id;

        addProductBtn.style.display = 'none';
        updateProductBtn.style.display = 'block';
        cancelEditBtn.style.display = 'block';
    }
}

function updateProduct() {
    const id = editProductIdInput.value;
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);

    if (!name || isNaN(price) || price <= 0) {
        alert('Por favor, ingresa un nombre y un precio válido para el producto.');
        return;
    }

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== id)) {
        alert('Ya existe otro producto con este nombre. Por favor, usa un nombre diferente.');
        return;
    }

    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
        products[productIndex].name = name;
        products[productIndex].price = price;
    }
    saveProductsToLocalStorage();
    resetProductForm();
    renderProductTable();
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este Producto? Esta acción no se puede deshacer.')) {
        products = products.filter(product => product.id !== id);
        saveProductsToLocalStorage();
        renderProductTable();
    }
}

function resetProductForm() {
    productNameInput.value = '';
    productPriceInput.value = '';
    editProductIdInput.value = '';
    addProductBtn.style.display = 'block';
    updateProductBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
}

// --- Funciones de la Calculadora ---

function filterAndRenderProductSelection() {
    const searchTerm = searchInput.value.toLowerCase();
    searchResultsDiv.innerHTML = '';

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );

    if (filteredProducts.length === 0 && searchTerm !== '') {
        searchResultsDiv.innerHTML = '<p>No se encontraron Productos.</p>';
    } else if (filteredProducts.length === 0 && searchTerm === '') {
        searchResultsDiv.innerHTML = '<p>No hay Productos disponibles. Agregue algunos en la sección de Gestión.</p>';
    }

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        // Asegúrate de que el valor inicial sea el que está en el carrito si ya existe
        const currentQuantity = currentOrderToSave && currentOrderToSave.items.find(item => item.id === product.id)
                                 ? currentOrderToSave.items.find(item => item.id === product.id).quantity
                                 : 0;

        productDiv.innerHTML = `
            <label for="${product.id}">${product.name} ($${formatCurrency(product.price)})</label>
            <input type="number" id="${product.id}" min="0" value="${currentQuantity}" data-price="${product.price}">
        `;
        searchResultsDiv.appendChild(productDiv);
    });

    document.querySelectorAll('#search-results input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateTotal);
        input.addEventListener('change', calculateTotal);
    });
}

function calculateTotal() {
    let totalBasePriceOfItems = 0;
    let totalItemsCount = 0;
    let currentOrderItems = [];
    let totalIncrementAmount = 0;

    products.forEach(product => {
        const input = document.getElementById(product.id);
        if (input) {
            const quantity = parseInt(input.value);

            if (quantity > 0) {
                const itemBasePrice = product.price * quantity;
                const itemIncrement = itemBasePrice * 0.20; // 20% de incremento
                const itemTotalWithIncrement = itemBasePrice + itemIncrement;

                totalBasePriceOfItems += itemBasePrice;
                totalIncrementAmount += itemIncrement;
                totalItemsCount += quantity;

                currentOrderItems.push({
                    id: product.id,
                    name: product.name,
                    quantity: quantity,
                    basePrice: product.price,
                    totalBasePrice: itemBasePrice,
                    itemIncrement: itemIncrement,
                    itemTotalWithIncrement: itemTotalWithIncrement
                });
            }
        }
    });

    const laborCost = totalItemsCount > 0 ? FIXED_LABOR_COST : 0;
    const deliveryCost = parseFloat(deliveryCostInput.value) || 0;

    const finalTotal = totalBasePriceOfItems + totalIncrementAmount + laborCost + deliveryCost;

    currentOrderToSave = {
        items: currentOrderItems,
        laborCost: laborCost,
        deliveryCost: deliveryCost,
        totalIncrementAmount: totalIncrementAmount,
        finalTotal: finalTotal,
        totalBasePriceOfItems: totalBasePriceOfItems
    };

    updateOrderSummary(currentOrderItems, laborCost, deliveryCost, finalTotal, totalIncrementAmount, totalBasePriceOfItems);
}

function updateOrderSummary(orderItems, labor, delivery, total, totalIncrementAmount, totalBasePriceOfItems) {
    selectedProductsDiv.innerHTML = '';

    saveOrderBtn.disabled = (orderItems.length === 0 && delivery === 0);

    if (orderItems.length === 0 && labor === 0 && delivery === 0) {
        selectedProductsDiv.innerHTML = '<p>No hay productos seleccionados ni costos adicionales.</p>';
        saveOrderBtn.disabled = true;
    } else {
        orderItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <span>${item.name} x ${item.quantity} ($${formatCurrency(item.basePrice)} c/u)</span>
                <span>$${formatCurrency(item.totalBasePrice)}</span>
                <button class="remove-item" data-id="${item.id}">❌</button>
            `;
            selectedProductsDiv.appendChild(itemElement);
        });

        if (totalBasePriceOfItems > 0) {
            const subtotalElement = document.createElement('div');
            subtotalElement.classList.add('order-item');
            subtotalElement.innerHTML = `
                <span>Subtotal Productos Base</span>
                <span>$${formatCurrency(totalBasePriceOfItems)}</span>
            `;
            selectedProductsDiv.appendChild(subtotalElement);
        }

        if (totalIncrementAmount > 0) {
            const incrementElement = document.createElement('div');
            incrementElement.classList.add('order-item');
            incrementElement.innerHTML = `
                <span>Incremento de Productos (20%)</span>
                <span>$${formatCurrency(totalIncrementAmount)}</span>
            `;
            selectedProductsDiv.appendChild(incrementElement);
        }

        if (labor > 0) {
            const laborElement = document.createElement('div');
            laborElement.classList.add('order-item');
            laborElement.innerHTML = `
                <span>Costo de Mano de Obra</span>
                <span>$${formatCurrency(labor)}</span>
            `;
            selectedProductsDiv.appendChild(laborElement);
        }

        if (delivery > 0) {
            const deliveryElement = document.createElement('div');
            deliveryElement.classList.add('order-item');
            deliveryElement.innerHTML = `
                <span>Costo de Domicilio</span>
                <span>$${formatCurrency(delivery)}</span>
            `;
            selectedProductsDiv.appendChild(deliveryElement);
        }
    }

    finalTotalSpan.textContent = `$${formatCurrency(total)}`;

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productIdToRemove = this.dataset.id;
            const inputToReset = document.getElementById(productIdToRemove);
            if (inputToReset) {
                inputToReset.value = 0;
                calculateTotal();
                filterAndRenderProductSelection(); // Volver a renderizar para que el input muestre 0
            }
        });
    });
}

function formatCurrency(amount) {
    return amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// --- Funciones de Gestión de Clientes ---

function saveClient(clientData) {
    const existingClientIndex = clientsDb.findIndex(c => c.name.toLowerCase() === clientData.name.toLowerCase());
    if (currentClientToEdit && currentClientToEdit.name.toLowerCase() === clientData.name.toLowerCase()) {
        // Estamos editando el mismo cliente, simplemente actualizamos sus datos
        Object.assign(clientsDb[existingClientIndex], clientData);
    } else if (existingClientIndex !== -1) {
        // Existe un cliente con el mismo nombre y no es el que estamos editando
        // Esto podría ser un error o una confirmación, por ahora lo dejamos como está o podrías añadir un alert
        // clientsDb[existingClientIndex] = { ...clientsDb[existingClientIndex], ...clientData };
    } else if (currentClientToEdit) {
        // Se cambió el nombre del cliente que se estaba editando, actualizamos el existente y limpiamos
        const oldClientIndex = clientsDb.findIndex(c => c.name.toLowerCase() === currentClientToEdit.name.toLowerCase());
        if(oldClientIndex !== -1) {
            clientsDb[oldClientIndex] = clientData;
        } else {
            clientsDb.push(clientData); // En caso de que no lo encuentre por alguna razón
        }
        currentClientToEdit = null; // Limpiar después de la edición
    } else {
        // Añadir nuevo cliente
        clientsDb.push(clientData);
    }
    saveClientsToLocalStorage();
    renderClientsTable();
}

function deleteClient(clientName) {
    if (confirm(`¿Estás seguro de que quieres eliminar al cliente "${clientName}"? Esta acción no se puede deshacer.'`)) {
        clientsDb = clientsDb.filter(client => client.name.toLowerCase() !== clientName.toLowerCase());
        saveClientsToLocalStorage();
        renderClientsTable();
    }
}

function editClient(clientName) {
    const clientToEdit = clientsDb.find(client => client.name.toLowerCase() === clientName.toLowerCase());
    if (clientToEdit) {
        currentClientToEdit = clientToEdit; // Establecer el cliente que se está editando
        closeClientsDbModal(); // Cerrar la base de datos de clientes
        handleSaveOrder(); // Abrir el modal de detalles del cliente para editar
        modalClientNameInput.value = clientToEdit.name;
        modalClientContactInput.value = clientToEdit.contact || '';
        modalDeliveryTimeInput.value = ''; // No guardamos la hora de entrega en la DB del cliente
        modalDeliveryAddressInput.value = clientToEdit.address || '';
        modalCityNeighborhoodInput.value = clientToEdit.cityNeighborhood || '';
        modalProductNameFinalInput.value = ''; // No guardamos el producto final en la DB del cliente
        modalClientDetailsTotalSpan.textContent = `$0`; // O el total de una Pedido previa si se está rellenando
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente';
    }
}


function renderClientsTable() {
    clientsTableBody.innerHTML = '';
    if (clientsDb.length === 0) {
        noClientsMessageClientsDb.style.display = 'block';
    } else {
        noClientsMessageClientsDb.style.display = 'none';
        clientsDb.forEach(client => {
            const row = clientsTableBody.insertRow();
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.contact || 'N/A'}</td>
                <td>${client.address || 'N/A'}</td>
                <td>${client.cityNeighborhood || 'N/A'}</td>
                <td>
                    <button class="edit-client-btn" data-name="${client.name}">Editar</button>
                    <button class="delete-client-btn" data-name="${client.name}">Eliminar</button>
                </td>
            `;
        });
        document.querySelectorAll('.delete-client-btn').forEach(button => {
            button.onclick = (e) => deleteClient(e.target.dataset.name);
        });
        document.querySelectorAll('.edit-client-btn').forEach(button => {
            button.onclick = (e) => editClient(e.target.dataset.name);
        });
    }
}

function autoFillClientDetails() {
    const clientName = modalClientNameInput.value.trim();
    const foundClient = clientsDb.find(client => client.name.toLowerCase() === clientName.toLowerCase());

    if (foundClient) {
        modalClientContactInput.value = foundClient.contact || '';
        modalDeliveryAddressInput.value = foundClient.address || '';
        modalCityNeighborhoodInput.value = foundClient.cityNeighborhood || '';
    }
}

// --- Funciones de Gestión de Órdenes (Registro) ---

function handleSaveOrder() {
    // Si no hay productos seleccionados Y no hay costo de domicilio, no permitir guardar
    // y si NO estamos editando un cliente existente
    if (currentOrderToSave.items.length === 0 && currentOrderToSave.deliveryCost === 0 && !currentClientToEdit) {
        alert('Por favor, agrega productos o un costo de domicilio para guardar el pedido.');
        return;
    }

    // Si estamos editando un cliente, prellenar los campos del modal con los datos del cliente
    if (currentClientToEdit) {
        modalClientNameInput.value = currentClientToEdit.name;
        modalClientContactInput.value = currentClientToEdit.contact || '';
        modalDeliveryAddressInput.value = currentClientToEdit.address || '';
        modalCityNeighborhoodInput.value = currentClientToEdit.cityNeighborhood || '';
        modalDeliveryTimeInput.value = ''; // No aplica hora de entrega para editar cliente
        modalProductNameFinalInput.value = ''; // No aplica producto final para editar cliente
        modalClientDetailsTotalSpan.textContent = `$0`; // O el total de una Pedido previa si se está rellenando
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente';
    } else {
        // Si no estamos editando un cliente, limpiar y prellenar con datos de la orden actual
        modalClientNameInput.value = '';
        modalClientContactInput.value = '';
        modalDeliveryTimeInput.value = '';
        modalDeliveryAddressInput.value = '';
        modalCityNeighborhoodInput.value = '';
        modalProductNameFinalInput.value = '';
        modalClientDetailsTotalSpan.textContent = `$${formatCurrency(currentOrderToSave.finalTotal)}`;
        confirmSaveOrderBtn.textContent = 'Confirmar y Guardar Pedido';
    }

    clientDetailsModal.style.display = 'flex';
}


function confirmAndSaveOrder() {
    const clientName = modalClientNameInput.value.trim();
    const clientContact = modalClientContactInput.value.trim();
    const deliveryTime = modalDeliveryTimeInput.value.trim();
    const deliveryAddress = modalDeliveryAddressInput.value.trim();
    const cityNeighborhood = modalCityNeighborhoodInput.value.trim();
    const productNameFinal = modalProductNameFinalInput.value.trim();

    // Lógica para actualizar datos de cliente si estamos en modo edición
    if (currentClientToEdit) {
        if (!clientName) {
            alert('El nombre del cliente no puede estar vacío.');
            return;
        }
        saveClient({
            name: clientName,
            contact: clientContact,
            address: deliveryAddress,
            cityNeighborhood: cityNeighborhood
        });
        currentClientToEdit = null; // Resetear el estado de edición
        closeClientDetailsModal();
        return; // Salir de la función ya que solo se actualizaron datos de cliente
    }

    if (!currentOrderToSave) {
        return;
    }

    // Validar si hay costo de domicilio y los campos del cliente/entrega están vacíos
    if (currentOrderToSave.deliveryCost > 0 && (!clientName || !clientContact || !deliveryAddress || !cityNeighborhood)) {
        alert('Por favor, completa los datos del cliente y de entrega si hay costo de domicilio.');
        return;
    }

    const now = new Date();
    const newOrder = {
        orderNumber: nextOrderId++,
        date: now,
        items: currentOrderToSave.items,
        laborCost: currentOrderToSave.laborCost,
        deliveryCost: currentOrderToSave.deliveryCost,
        totalIncrementAmount: currentOrderToSave.totalIncrementAmount,
        finalTotal: currentOrderToSave.finalTotal,
        totalBasePriceOfItems: currentOrderToSave.totalBasePriceOfItems,
        clientName: clientName,
        clientContact: clientContact,
        deliveryTime: deliveryTime,
        deliveryAddress: deliveryAddress,
        cityNeighborhood: cityNeighborhood,
        productNameFinal: productNameFinal,
        status: 'pending' // Estado inicial de la Pedido
    };
    orders.push(newOrder);
    saveOrdersToLocalStorage();

    // Guardar o actualizar cliente en la base de datos de clientes
    if (clientName) { // Solo guardar cliente si se ingresó un nombre
        saveClient({
            name: clientName,
            contact: clientContact,
            address: deliveryAddress,
            cityNeighborhood: cityNeighborhood
        });
    }

    renderOrderHistory();
    clearCalculatorInputs();
    closeClientDetailsModal();
}


function renderOrderHistory() {
    orderHistoryList.innerHTML = '';
    let totalFilteredOrdersAmount = 0; // Cambiado el nombre para mayor claridad

    const startDate = filterStartDateInput.value ? new Date(filterStartDateInput.value + 'T00:00:00') : null;
    const endDate = filterEndDateInput.value ? new Date(filterEndDateInput.value + 'T23:59:59') : null;
    const filterClientName = filterClientNameInput.value.toLowerCase();
    const filterOrderNumber = filterOrderNumberInput.value.trim();

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const matchesDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
        const matchesClient = !filterClientName || (order.clientName && order.clientName.toLowerCase().includes(filterClientName));
        const matchesOrderNumber = !filterOrderNumber || (order.orderNumber.toString() === filterOrderNumber);

        return matchesDate && matchesClient && matchesOrderNumber;
    });

    // Ordenar los pedidos filtrados por número de pedido de forma descendente
    filteredOrders.sort((a, b) => b.orderNumber - a.orderNumber);

    // Calcular el total de todos los pedidos filtrados ANTES de aplicar la paginación
    filteredOrders.forEach(order => {
        totalFilteredOrdersAmount += order.finalTotal;
    });
    filteredOrdersTotalSpan.textContent = `$${formatCurrency(totalFilteredOrdersAmount)}`; // Actualizar aquí

    if (filteredOrders.length === 0) {
        noOrdersMessage.style.display = 'block';
        showMoreOrdersBtn.style.display = 'none'; // Ocultar el botón si no hay pedidos
    } else {
        noOrdersMessage.style.display = 'none';
        
        // Mostrar solo los primeros ORDERS_PER_PAGE pedidos si no se ha activado "Ver Más"
        const ordersToShow = allOrdersVisible ? filteredOrders : filteredOrders.slice(0, ORDERS_PER_PAGE);

        ordersToShow.forEach(order => {
            const displayTotalBasePriceOfItems = order.totalBasePriceOfItems !== undefined ? order.totalBasePriceOfItems : (order.finalTotal - order.laborCost - order.deliveryCost - order.totalIncrementAmount);

            const orderCard = document.createElement('div');
            orderCard.classList.add('recorded-order-card');
            orderCard.innerHTML = `
                <button class="delete-order-btn" data-id="${order.orderNumber}">❌</button>
                <h4>Pedido #${order.orderNumber}</h4>
                <p><strong>Fecha:</strong> ${order.date.toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                ${order.productNameFinal ? `<p><strong>Producto Final:</strong> ${order.productNameFinal}</p>` : ''}
                ${order.clientName ? `<p><strong>Cliente:</strong> ${order.clientName}</p>` : ''}

                <div class="items-list">
                    <strong>Detalle de Productos:</strong>
                    ${order.items.map(item => `
                        <div class="item-detail item-sub-detail">
                            <span>- ${item.name} x ${item.quantity}</span>
                            <span>$${formatCurrency(item.totalBasePrice)}</span>
                        </div>
                    `).join('')}
                    ${displayTotalBasePriceOfItems > 0 ? `<div class="item-detail"><span>Subtotal Productos Base:</span><span>$${formatCurrency(displayTotalBasePriceOfItems)}</span></div>` : ''}
                    ${order.totalIncrementAmount > 0 ? `<div class="item-detail"><span>Incremento (20%):</span><span>$${formatCurrency(order.totalIncrementAmount)}</span></div>` : ''}
                </div>
                ${order.laborCost > 0 ? `<p><strong>Mano de Obra:</strong> $${formatCurrency(order.laborCost)}</p>` : ''}
                ${order.deliveryCost > 0 ? `<p><strong>Domicilio:</strong> $${formatCurrency(order.deliveryCost)}</p>` : ''}
                <p class="total-display">Total Cobrado: $${formatCurrency(order.finalTotal)}</p>

                ${order.deliveryCost > 0 ? `<button class="delivery-info-btn" data-id="${order.orderNumber}">Info Domiciliario</button>` : ''}
                <button class="status-btn ${order.status}" data-id="${order.orderNumber}" data-status="${order.status}">
                    ${order.status === 'pending' ? 'Pendiente' : order.status === 'dispatched' ? 'Despachado' : 'Entregado'}
                </button>
            `;
            orderHistoryList.appendChild(orderCard);
        });

        // Mostrar u ocultar el botón "Ver Más Pedidos"
        if (filteredOrders.length > ORDERS_PER_PAGE && !allOrdersVisible) {
            showMoreOrdersBtn.style.display = 'block';
            showMoreOrdersBtn.textContent = `Ver Más Pedidos (${filteredOrders.length - ORDERS_PER_PAGE} ocultos)`;
        } else if (allOrdersVisible) {
            showMoreOrdersBtn.style.display = 'block';
            showMoreOrdersBtn.textContent = 'Ver Menos Pedidos';
        } else {
            showMoreOrdersBtn.style.display = 'none';
        }

        addOrderHistoryEventListeners();
    }
}


function addOrderHistoryEventListeners() {
    document.querySelectorAll('.delete-order-btn').forEach(button => {
        button.onclick = (e) => deleteOrder(parseInt(e.target.dataset.id));
    });
    document.querySelectorAll('.delivery-info-btn').forEach(button => {
        button.onclick = (e) => showDeliveryInfoModal(parseInt(e.target.dataset.id));
    });
    // Nuevo event listener para el botón de estado
    document.querySelectorAll('.status-btn').forEach(button => {
        button.onclick = (e) => toggleOrderStatus(parseInt(e.target.dataset.id));
    });
}

function toggleOrderStatus(orderNumber) {
    const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);
    if (orderIndex !== -1) {
        let newStatus;
        switch (orders[orderIndex].status) {
            case 'pending':
                newStatus = 'dispatched';
                break;
            case 'dispatched':
                newStatus = 'delivered';
                break;
            case 'delivered':
                newStatus = 'pending'; // Puedes cambiar esto si no quieres que regrese a 'pending'
                break;
            default:
                newStatus = 'pending';
        }
        orders[orderIndex].status = newStatus;
        saveOrdersToLocalStorage();
        renderOrderHistory(); // Volver a renderizar para que el botón actualice su texto y color
    }
}

function deleteOrder(orderNumber) {
    if (confirm(`¿Estás seguro de que quieres eliminar la Pedido #${orderNumber}? Esta acción no se puede deshacer.'`)) {
        orders = orders.filter(order => order.orderNumber !== orderNumber);
        saveOrdersToLocalStorage();
        renderOrderHistory();
    }
}

function clearCalculatorInputs() {
    document.querySelectorAll('#search-results input[type="number"]').forEach(input => {
        input.value = 0;
    });
    deliveryCostInput.value = 0;
    modalClientNameInput.value = '';
    modalClientContactInput.value = '';
    modalDeliveryTimeInput.value = '';
    modalDeliveryAddressInput.value = '';
    modalCityNeighborhoodInput.value = '';
    modalProductNameFinalInput.value = '';
    calculateTotal(); // Recalcula el total para que se muestre $0
    confirmSaveOrderBtn.textContent = 'Confirmar y Guardar Pedido'; // Asegurarse de que el texto del botón vuelva a su estado original
    currentClientToEdit = null; // Restablecer el cliente en edición
}

// --- Funciones de Modales ---

function showDeliveryInfoModal(orderNumber) {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        deliveryModalOrderNumber.textContent = order.orderNumber;
        deliveryModalClientName.textContent = order.clientName || 'N/A';
        deliveryModalClientContact.textContent = order.clientContact || 'N/A';
        deliveryModalDeliveryTime.textContent = order.deliveryTime || 'N/A';
        deliveryModalDeliveryAddress.textContent = order.deliveryAddress || 'N/A';
        deliveryModalCityNeighborhood.textContent = order.cityNeighborhood || 'N/A';
        deliveryModalProductNameFinal.textContent = order.productNameFinal || 'N/A';
        deliveryModalFinalTotal.textContent = `$${formatCurrency(order.finalTotal)}`;
        deliveryInfoModal.style.display = 'flex';
    }
}

function closeDeliveryInfoModal() {
    deliveryInfoModal.style.display = 'none';
}

function closeClientDetailsModal() {
    clientDetailsModal.style.display = 'none';
    clearCalculatorInputs(); // Restablecer campos del modal y estado de edición
}

function showClientsDbModal() {
    renderClientsTable();
    clientsDbModal.style.display = 'flex';
}

function closeClientsDbModal() {
    clientsDbModal.style.display = 'none';
}

function copyDeliveryInfoToClipboard() {
    const orderNumber = deliveryModalOrderNumber.textContent;
    const clientName = deliveryModalClientName.textContent;
    const clientContact = deliveryModalClientContact.textContent;
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productNameFinal = deliveryModalProductNameFinal.textContent;
    const finalTotal = deliveryModalFinalTotal.textContent;

    const textToCopy = `
Información para Domiciliario:
Pedido #: ${orderNumber}
Cliente: ${clientName}
Contacto: ${clientContact}
Hora de Entrega: ${deliveryTime}
Dirección: ${deliveryAddress}
Ciudad/Barrio: ${cityNeighborhood}
Producto Final: ${productNameFinal}
Valor a Cobrar: ${finalTotal}
    `.trim();

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Información copiada al portapapeles!');
        })
        .catch(err => {
            console.error('Error al copiar al portapapeles:', err);
            alert('Error al copiar la información. Por favor, intente manualmente.');
        });
}

function sendDeliveryInfoToWhatsapp() {
    const orderNumber = deliveryModalOrderNumber.textContent;
    const clientName = deliveryModalClientName.textContent;
    const clientContact = deliveryModalClientContact.textContent;
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productNameFinal = deliveryModalProductNameFinal.textContent;
    const finalTotal = deliveryModalFinalTotal.textContent;

    const whatsappMessage = `
*Información para Domiciliario:*
*Pedido #:* ${orderNumber}
*Cliente:* ${clientName}
*Contacto:* ${clientContact}
*Hora de Entrega:* ${deliveryTime}
*Dirección:* ${deliveryAddress}
*Ciudad/Barrio:* ${cityNeighborhood}
*Producto Final:* ${productNameFinal}
*Valor a Cobrar:* ${finalTotal}
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// --- Función para Exportar Tablas a Excel (.xlsx) ---
function exportTableToExcel(tableId, filename = '') {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Tabla con ID '${tableId}' no encontrada.`);
        return;
    }

    // Clonar la tabla para no modificar la original
    const clonedTable = table.cloneNode(true);

    // Eliminar la columna de "Acciones" si existe
    const headerRow = clonedTable.querySelector('thead tr');
    if (headerRow) {
        const headers = Array.from(headerRow.children);
        let actionColumnIndex = -1;
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].textContent.includes('Acciones')) {
                actionColumnIndex = i;
                break;
            }
        }
        if (actionColumnIndex !== -1) {
            headerRow.deleteCell(actionColumnIndex);
            Array.from(clonedTable.querySelectorAll('tbody tr')).forEach(row => {
                // Asegurarse de que la fila tenga celdas antes de intentar eliminar
                if (row.cells.length > actionColumnIndex) {
                    row.deleteCell(actionColumnIndex);
                }
            });
        }
    }

    const ws = XLSX.utils.table_to_sheet(clonedTable);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelFileName = filename ? `${filename}.xlsx` : 'tabla.xlsx';
    XLSX.writeFile(wb, excelFileName);
}

// --- Nueva Función para Importar Productos desde Excel (.xlsx) ---
function importProductsFromExcel(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir la hoja a un array de objetos, usando la primera fila como encabezados
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length === 0) {
            alert('El archivo Excel está vacío.');
            return;
        }

        // Asumimos que la primera fila son los encabezados
        const headers = json[0];
        const productNameColumnIndex = headers.findIndex(h => h && h.toLowerCase().trim() === 'producto');
        const productPriceColumnIndex = headers.findIndex(h => h && h.toLowerCase().trim() === 'precio unitario');

        if (productNameColumnIndex === -1 || productPriceColumnIndex === -1) {
            alert('El archivo Excel debe contener las columnas "Producto" y "Precio Unitario".');
            return;
        }

        let productsAddedOrUpdated = 0;
        let newNextProductId = nextProductId; // Usar una variable temporal para el siguiente ID

        for (let i = 1; i < json.length; i++) { // Empezar desde la segunda fila para los datos
            const row = json[i];
            const name = row[productNameColumnIndex] ? String(row[productNameColumnIndex]).trim() : '';
            const price = parseFloat(row[productPriceColumnIndex]);

            if (name && !isNaN(price) && price > 0) {
                const existingProductIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

                if (existingProductIndex !== -1) {
                    // Actualizar producto existente
                    products[existingProductIndex].price = price;
                    productsAddedOrUpdated++;
                } else {
                    // Añadir nuevo producto
                    products.push({
                        id: `prod-${newNextProductId++}`,
                        name: name,
                        price: price
                    });
                    productsAddedOrUpdated++;
                }
            } else {
                console.warn(`Saltando fila ${i + 1} debido a datos inválidos: Producto="${name}", Precio="${row[productPriceColumnIndex]}"`);
            }
        }
        nextProductId = newNextProductId; // Actualizar el ID global después de la importación

        saveProductsToLocalStorage();
        renderProductTable();
        alert(`Se importaron ${productsAddedOrUpdated} productos (nuevos o actualizados) exitosamente.`);
        // Limpiar el input de tipo file para que el mismo archivo pueda ser seleccionado de nuevo
        event.target.value = '';
    };

    reader.onerror = (ex) => {
        console.error('Error al leer el archivo:', ex);
        alert('Hubo un error al leer el archivo Excel.');
    };

    reader.readAsArrayBuffer(file);
}


// --- Event Listeners y Inicialización ---

addProductBtn.addEventListener('click', addProduct);
updateProductBtn.addEventListener('click', updateProduct);
cancelEditBtn.addEventListener('click', resetProductForm);

searchInput.addEventListener('input', filterAndRenderProductSelection);

deliveryCostInput.addEventListener('input', calculateTotal);
deliveryCostInput.addEventListener('change', calculateTotal);

saveOrderBtn.addEventListener('click', handleSaveOrder);
confirmSaveOrderBtn.addEventListener('click', confirmAndSaveOrder);

// Event listeners para los filtros de fecha y texto
filterStartDateInput.addEventListener('change', () => {
    allOrdersVisible = false; // Resetear al cambiar filtros
    renderOrderHistory();
});
filterEndDateInput.addEventListener('change', () => {
    allOrdersVisible = false; // Resetear al cambiar filtros
    renderOrderHistory();
});
filterClientNameInput.addEventListener('input', () => {
    allOrdersVisible = false; // Resetear al cambiar filtros
    renderOrderHistory();
});
filterOrderNumberInput.addEventListener('input', () => {
    allOrdersVisible = false; // Resetear al cambiar filtros
    renderOrderHistory();
});

showMoreOrdersBtn.addEventListener('click', () => {
    allOrdersVisible = !allOrdersVisible; // Cambiar el estado
    renderOrderHistory(); // Volver a renderizar con el nuevo estado
});


modalClientNameInput.addEventListener('input', autoFillClientDetails);

showClientsDbBtn.addEventListener('click', showClientsDbModal);
clientsDbModalCloseButton.addEventListener('click', closeClientsDbModal);

clientModalCloseButton.addEventListener('click', closeClientDetailsModal);
deliveryModalCloseButton.addEventListener('click', closeDeliveryInfoModal);

window.addEventListener('click', (event) => {
    if (event.target === clientDetailsModal) {
        closeClientDetailsModal();
    }
    if (event.target === deliveryInfoModal) {
        closeDeliveryInfoModal();
    }
    if (event.target === clientsDbModal) {
        closeClientsDbModal();
    }
});

copyToClipboardBtn.addEventListener('click', copyDeliveryInfoToClipboard);
sendToWhatsappBtn.addEventListener('click', sendDeliveryInfoToWhatsapp);

// Nuevos event listeners para los botones de exportar e importar
exportProductsBtn.addEventListener('click', () => exportTableToExcel('products-table', 'productos'));
exportClientsBtn.addEventListener('click', () => exportTableToExcel('clients-table', 'clientes'));

importProductsBtn.addEventListener('click', () => {
    importProductsFile.click(); // Simula el click en el input file oculto
});
importProductsFile.addEventListener('change', importProductsFromExcel);


document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadClientsFromLocalStorage();

    renderProductTable();
    filterAndRenderProductSelection();
    calculateTotal();
    renderOrderHistory();
});