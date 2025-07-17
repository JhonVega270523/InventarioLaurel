const defaultProducts = [
    { id: 'prod-1', name: 'Peluche Pequeño', price: 15000 },
    { id: 'prod-2', name: 'Caja Decorada Mediana', price: 10000 },
    { id: 'prod-3', name: 'Globo Metalizado (unidad)', price: 7000 },
    { id: 'prod-4', name: 'Rosas Rojas (unidad)', price: 5000 },
    { id: 'prod-5', name: 'Chocolates Surtidos (caja)', price: 20000 },
    { id: 'prod-6', name: 'Taza Personalizada', price: 18000 },
    { id: 'prod-7', name: 'Tarjeta Dedicatoria', price: 3000 }
];

const ORDERS_PER_PAGE = 6; // Número de pedidos a mostrar inicialmente

let products = [];
let orders = [];
let clientsDb = []; // Nueva base de datos para clientes
let allOrdersVisible = false; // Estado para controlar si todos los pedidos están visibles

const productsTableBody = document.querySelector('#products-table tbody');
const searchInput = document.getElementById('productSearch');
const searchResultsDiv = document.getElementById('search-results');
const laborCostInput = document.getElementById('laborCost');
const deliveryCostInput = document.getElementById('deliveryCost');
const profitPercentageInput = document.getElementById('profitPercentage'); // NUEVO: Input para porcentaje de ganancia
const estimatedProfitSpan = document.getElementById('estimatedProfit'); // NUEVO: Span para mostrar ganancia estimada
const selectedProductsDiv = document.getElementById('selected-products');
const finalTotalSpan = document.getElementById('finalTotal');
const saveOrderBtn = document.getElementById('saveOrderBtn');
const orderHistoryList = document.getElementById('order-history-list');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const showMoreOrdersBtn = document.getElementById('showMoreOrdersBtn');
const toast = document.getElementById('toast');

const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const addProductBtn = document.getElementById('addProductBtn');
const updateProductBtn = document.getElementById('updateProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editProductIdInput = document.getElementById('editProductId');

const filterStartDateInput = document.getElementById('filterStartDate');
const filterEndDateInput = document.getElementById('filterEndDate');
const filterClientNameInput = document.getElementById('filterClientName');
const filterOrderNumberInput = document.getElementById('filterOrderNumber');
const filteredOrdersTotalSpan = document.getElementById('filteredOrdersTotal');
const filteredProfitsTotalSpan = document.getElementById('filteredProfitsTotal'); // Nuevo: Span para ganancias filtradas
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const clientDetailsModal = document.getElementById('clientDetailsModal');
const clientModalCloseButton = document.querySelector('.client-modal-close');
const modalClientNameInput = document.getElementById('modalClientName');
const modalClientContactInput = document.getElementById('modalClientContact');
const modalDeliveryDateInput = document.getElementById('modalDeliveryDate'); // NUEVO: Campo Fecha de Entrega
const modalDeliveryTimeInput = document.getElementById('modalDeliveryTime');
const modalDeliveryAddressInput = document.getElementById('modalDeliveryAddress');
const modalReferencePointInput = document.getElementById('modalReferencePoint'); // Campo Punto de Referencia
const modalCityNeighborhoodInput = document.getElementById('modalCityNeighborhood');
const modalProductDetailsInput = document.getElementById('modalProductDetails'); // Campo Detalles del Producto
const modalProductNameFinalInput = document.getElementById('modalProductNameFinal'); // Campo Producto Final
const modalClientDetailsTotalSpan = document.getElementById('modalClientDetailsTotal');
const confirmSaveOrderBtn = document.getElementById('confirmSaveOrderBtn');

const deliveryInfoModal = document.getElementById('deliveryInfoModal');
const deliveryModalCloseButton = document.querySelector('.delivery-modal-close');
const deliveryModalOrderNumber = document.getElementById('deliveryModalOrderNumber');
const deliveryModalClientName = document.getElementById('deliveryModalClientName');
const deliveryModalClientContact = document.getElementById('deliveryModalClientContact');
const deliveryModalDeliveryDate = document.getElementById('deliveryModalDeliveryDate'); // Info Fecha de Entrega
const deliveryModalDeliveryTime = document.getElementById('deliveryModalDeliveryTime');
const deliveryModalDeliveryAddress = document.getElementById('deliveryModalDeliveryAddress');
const deliveryModalReferencePoint = document.getElementById('deliveryModalReferencePoint'); // Info Punto de Referencia
const deliveryModalCityNeighborhood = document.getElementById('deliveryModalCityNeighborhood');
const deliveryModalProductDetails = document.getElementById('deliveryModalProductDetails'); // Info Detalles del Producto
const deliveryModalProductNameFinal = document.getElementById('deliveryModalProductNameFinal');
const deliveryModalFinalTotal = document.getElementById('deliveryModalFinalTotal');
const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
const sendToWhatsappBtn = document.getElementById('sendToWhatsappBtn');

const showClientsDbBtn = document.getElementById('showClientsDbBtn');
const clientsDbModal = document.getElementById('clientsDbModal');
const clientsDbModalCloseButton = document.querySelector('.clients-db-modal-close');
const clientsTableBody = document.querySelector('#clients-table tbody');
const noClientsMessageClientsDb = document.getElementById('noClientsMessage');
const exportClientsBtn = document.getElementById('exportClientsBtn'); // Nuevo: Botón de exportar clientes

const exportProductsBtn = document.getElementById('exportProductsBtn');
const importProductsBtn = document.getElementById('importProductsBtn');
const importProductsFile = document.getElementById('importProductsFile');
const exportOrdersBtn = document.getElementById('exportOrdersBtn');

let nextProductId = 1;
let nextOrderId = 1;

let currentOrderToSave = null;
let currentClientToEdit = null;

// --- Funciones de Utilidad ---

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 3000);
}

function formatCurrency(amount) {
    return amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

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
        deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString() : null, // Guardar como ISO string
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
                if (order.deliveryDate) { // Convertir de nuevo a objeto Date
                    order.deliveryDate = new Date(order.deliveryDate);
                }
                if (!order.status) {
                    order.status = 'pending';
                }
                if (order.profitPercentage === undefined) {
                    order.profitPercentage = 0;
                }
                if (order.estimatedProfit === undefined) {
                    order.estimatedProfit = 0;
                }
                // Asegurarse de que los nuevos campos existan para evitar errores
                if (order.productDetails === undefined) order.productDetails = '';
                if (order.referencePoint === undefined) order.referencePoint = '';
                if (order.finalProfit === undefined) order.finalProfit = 0; // Asegurar el campo de ganancia final
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
        // Asegurarse de que el campo referencePoint exista para clientes existentes
        clientsDb.forEach(client => {
            if (client.referencePoint === undefined) {
                client.referencePoint = '';
            }
        });
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
        showToast('⚠️ Por favor, ingresa un nombre y un precio válido para el producto.');
        return;
    }

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast('❕ Ya existe un producto con este nombre. Por favor, usa un nombre diferente o edita el producto existente.');
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
    showToast('✅ Producto añadido exitosamente.');
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
        productNameInput.focus();
    }
}

function updateProduct() {
    const id = editProductIdInput.value;
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);

    if (!name || isNaN(price) || price <= 0) {
        showToast('⚠️ Por favor, ingresa un nombre y un precio válido para el producto.');
        return;
    }

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== id)) {
        showToast('❕ Ya existe otro producto con este nombre. Por favor, usa un nombre diferente.');
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
    showToast('✅ Producto actualizado exitosamente.');
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este Producto? Esta acción no se puede deshacer.')) {
        products = products.filter(product => product.id !== id);
        saveProductsToLocalStorage();
        renderProductTable();
        showToast('🗑️ Producto eliminado.');
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
                });
            }
        }
    });

    const laborCost = parseFloat(laborCostInput.value) || 0;
    const deliveryCost = parseFloat(deliveryCostInput.value) || 0;
    const profitPercentage = parseFloat(profitPercentageInput.value) || 0;

    // Calcular la base para la ganancia del porcentaje
    const baseForPercentageProfit = totalBasePriceOfItems + totalIncrementAmount + laborCost;
    const percentageProfit = baseForPercentageProfit * (profitPercentage / 100);

    // La ganancia estimada consolidada suma el incremento del 20% y la ganancia por porcentaje
    const estimatedProfitConsolidated = totalIncrementAmount + percentageProfit;

    // El total final ahora incluye la ganancia estimada consolidada
    const finalTotal = totalBasePriceOfItems + totalIncrementAmount + laborCost + deliveryCost + percentageProfit;

    currentOrderToSave = {
        items: currentOrderItems,
        laborCost: laborCost,
        deliveryCost: deliveryCost,
        totalIncrementAmount: totalIncrementAmount,
        estimatedProfit: estimatedProfitConsolidated, // Almacenar la ganancia consolidada
        profitPercentage: profitPercentage,
        finalTotal: finalTotal,
        totalBasePriceOfItems: totalBasePriceOfItems,
        finalProfit: estimatedProfitConsolidated // Guardar la ganancia consolidada para el historial
    };

    updateOrderSummary(currentOrderItems, laborCost, deliveryCost, finalTotal, totalIncrementAmount, totalBasePriceOfItems, estimatedProfitConsolidated, percentageProfit);
}

function updateOrderSummary(orderItems, labor, delivery, total, totalIncrementAmount, totalBasePriceOfItems, estimatedProfitConsolidated, percentageProfit) {
    selectedProductsDiv.innerHTML = '';

    saveOrderBtn.disabled = (orderItems.length === 0 && labor === 0 && delivery === 0 && estimatedProfitConsolidated === 0);

    if (orderItems.length === 0 && labor === 0 && delivery === 0 && estimatedProfitConsolidated === 0) {
        selectedProductsDiv.innerHTML = '<p>No hay productos seleccionados ni costos adicionales.</p>';
        saveOrderBtn.disabled = true;
    } else {
        orderItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item');
            itemElement.innerHTML = `
                <span>${item.name} x ${item.quantity} ($${formatCurrency(item.basePrice)} c/u)</span>
                <span>$${formatCurrency(item.totalBasePrice)}</span>
                <button class="remove-item" data-id="${item.id}" aria-label="Eliminar ${item.name}"></button>
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

        if (percentageProfit > 0) { // Mostrar la ganancia del porcentaje por separado en el resumen
            const profitElement = document.createElement('div');
            profitElement.classList.add('order-item');
            profitElement.innerHTML = `
                <span>Ganancia (${profitPercentageInput.value}%)</span>
                <span>$${formatCurrency(percentageProfit)}</span>
            `;
            selectedProductsDiv.appendChild(profitElement);
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

    estimatedProfitSpan.textContent = `$${formatCurrency(estimatedProfitConsolidated)}`;
    finalTotalSpan.textContent = `$${formatCurrency(total)}`;

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productIdToRemove = this.dataset.id;
            const inputToReset = document.getElementById(productIdToRemove);
            if (inputToReset) {
                inputToReset.value = 0;
                calculateTotal();
                filterAndRenderProductSelection();
            }
        });
    });
}

// --- Funciones de Gestión de Clientes ---

function saveClient(clientData) {
    const existingClientIndex = clientsDb.findIndex(c => c.name.toLowerCase() === clientData.name.toLowerCase());

    if (currentClientToEdit) {
        const oldClientIndex = clientsDb.findIndex(c => c.name.toLowerCase() === currentClientToEdit.name.toLowerCase());
        if(oldClientIndex !== -1) {
            clientsDb[oldClientIndex] = { ...clientsDb[oldClientIndex], ...clientData };
        } else {
            clientsDb.push(clientData);
        }
    } else if (existingClientIndex !== -1) {
        clientsDb[existingClientIndex] = { ...clientsDb[existingClientIndex], ...clientData };
    } else {
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
        showToast(`🗑️ Cliente "${clientName}" eliminado.`);
    }
}

function editClient(clientName) {
    const clientToEdit = clientsDb.find(client => client.name.toLowerCase() === clientName.toLowerCase());
    if (clientToEdit) {
        currentClientToEdit = clientToEdit;
        closeClientsDbModal();
        handleSaveOrder();
        modalClientNameInput.value = clientToEdit.name;
        modalClientContactInput.value = clientToEdit.contact || '';
        modalDeliveryDateInput.value = ''; // No auto-llenar fecha de entrega para edición
        modalDeliveryTimeInput.value = '';
        modalDeliveryAddressInput.value = clientToEdit.address || '';
        modalReferencePointInput.value = clientToEdit.referencePoint || ''; // Nuevo: Punto de Referencia
        modalCityNeighborhoodInput.value = clientToEdit.cityNeighborhood || '';
        modalProductDetailsInput.value = ''; // No auto-llenar detalles de producto
        modalProductNameFinalInput.value = '';
        modalClientDetailsTotalSpan.textContent = `$0`;
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente';
        modalClientNameInput.focus();
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
                <td>${client.referencePoint || 'N/A'}</td>
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
        modalReferencePointInput.value = foundClient.referencePoint || ''; // Nuevo: Punto de Referencia
        modalCityNeighborhoodInput.value = foundClient.cityNeighborhood || '';
    }
}

// --- Funciones de Gestión de Órdenes (Registro) ---

function handleSaveOrder() {
    if (currentOrderToSave.items.length === 0 && currentOrderToSave.laborCost === 0 && currentOrderToSave.deliveryCost === 0 && currentOrderToSave.estimatedProfit === 0 && !currentClientToEdit) {
        showToast('⚠️ Agrega productos, costo de mano de obra, un costo de domicilio o una ganancia para guardar el pedido.');
        return;
    }

    if (currentClientToEdit) {
        modalClientNameInput.value = currentClientToEdit.name;
        modalClientContactInput.value = currentClientToEdit.contact || '';
        modalDeliveryDateInput.value = ''; // No auto-llenar fecha de entrega para edición
        modalDeliveryTimeInput.value = '';
        modalDeliveryAddressInput.value = currentClientToEdit.address || '';
        modalReferencePointInput.value = currentClientToEdit.referencePoint || ''; // Nuevo: Punto de Referencia
        modalCityNeighborhoodInput.value = currentClientToEdit.cityNeighborhood || '';
        modalProductDetailsInput.value = ''; // No auto-llenar detalles de producto
        modalProductNameFinalInput.value = '';
        modalClientDetailsTotalSpan.textContent = `$0`;
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente';
    } else {
        modalClientNameInput.value = '';
        modalClientContactInput.value = '';
        modalDeliveryDateInput.value = ''; // Resetear campo de fecha
        modalDeliveryTimeInput.value = '';
        modalDeliveryAddressInput.value = '';
        modalReferencePointInput.value = ''; // Resetear
        modalCityNeighborhoodInput.value = '';
        modalProductDetailsInput.value = ''; // Resetear
        modalProductNameFinalInput.value = '';
        modalClientDetailsTotalSpan.textContent = `$${formatCurrency(currentOrderToSave.finalTotal)}`;
        confirmSaveOrderBtn.textContent = 'Confirmar y Guardar Pedido';
    }

    clientDetailsModal.style.display = 'flex';
}

function confirmAndSaveOrder() {
    const clientName = modalClientNameInput.value.trim();
    const clientContact = modalClientContactInput.value.trim();
    const deliveryDateStr = modalDeliveryDateInput.value;
    const deliveryDate = deliveryDateStr ? new Date(deliveryDateStr + 'T00:00:00') : null; // Convertir a Date
    const deliveryTime = modalDeliveryTimeInput.value.trim();
    const deliveryAddress = modalDeliveryAddressInput.value.trim();
    const referencePoint = modalReferencePointInput.value.trim(); // Nuevo
    const cityNeighborhood = modalCityNeighborhoodInput.value.trim();
    const productDetails = modalProductDetailsInput.value.trim(); // Nuevo
    const productNameFinal = modalProductNameFinalInput.value.trim();

    if (currentClientToEdit) {
        if (!clientName) {
            showToast('⚠️ El nombre del cliente no puede estar vacío.');
            return;
        }
        saveClient({
            name: clientName,
            contact: clientContact,
            address: deliveryAddress,
            referencePoint: referencePoint, // Guardar
            cityNeighborhood: cityNeighborhood
        });
        currentClientToEdit = null;
        closeClientDetailsModal();
        showToast('✅ Cliente actualizado exitosamente.');
        return;
    }

    if (!currentOrderToSave) {
        return;
    }

    if ((currentOrderToSave.deliveryCost > 0 || currentOrderToSave.laborCost > 0 || currentOrderToSave.items.length > 0 || currentOrderToSave.estimatedProfit > 0) && (!clientName || !clientContact || !deliveryAddress || !cityNeighborhood)) {
        showToast('⚠️ Por favor, completa los datos del cliente y de entrega si hay costos o productos asociados.');
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
        estimatedProfit: currentOrderToSave.estimatedProfit, // Ya es la ganancia consolidada
        profitPercentage: currentOrderToSave.profitPercentage,
        finalTotal: currentOrderToSave.finalTotal,
        totalBasePriceOfItems: currentOrderToSave.totalBasePriceOfItems,
        clientName: clientName,
        clientContact: clientContact,
        deliveryDate: deliveryDate, // Nuevo
        deliveryTime: deliveryTime,
        deliveryAddress: deliveryAddress,
        referencePoint: referencePoint, // Nuevo
        cityNeighborhood: cityNeighborhood,
        productDetails: productDetails, // Nuevo
        productNameFinal: productNameFinal,
        status: 'pending',
        finalProfit: currentOrderToSave.finalProfit // Guardar la ganancia consolidada
    };
    orders.push(newOrder);
    saveOrdersToLocalStorage();

    if (clientName) {
        saveClient({
            name: clientName,
            contact: clientContact,
            address: deliveryAddress,
            referencePoint: referencePoint, // Guardar
            cityNeighborhood: cityNeighborhood
        });
    }

    renderOrderHistory();
    clearCalculatorInputs();
    closeClientDetailsModal();
    showToast('✅ Pedido guardado exitosamente.');
}

function renderOrderHistory() {
    orderHistoryList.innerHTML = '';
    let totalFilteredOrdersAmount = 0;
    let totalFilteredProfitsAmount = 0; // Nuevo: total de ganancias filtradas

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

    filteredOrders.sort((a, b) => b.orderNumber - a.orderNumber);

    filteredOrders.forEach(order => {
        totalFilteredOrdersAmount += order.finalTotal;
        totalFilteredProfitsAmount += order.finalProfit || 0; // Sumar la ganancia consolidada
    });
    filteredOrdersTotalSpan.textContent = `$${formatCurrency(totalFilteredOrdersAmount)}`;
    filteredProfitsTotalSpan.textContent = `$${formatCurrency(totalFilteredProfitsAmount)}`; // Mostrar ganancias filtradas

    if (filteredOrders.length === 0) {
        noOrdersMessage.style.display = 'block';
        showMoreOrdersBtn.style.display = 'none';
    } else {
        noOrdersMessage.style.display = 'none';

        const ordersToShow = allOrdersVisible ? filteredOrders : filteredOrders.slice(0, ORDERS_PER_PAGE);

        ordersToShow.forEach(order => {
            const displayTotalBasePriceOfItems = order.totalBasePriceOfItems !== undefined ? order.totalBasePriceOfItems : (order.finalTotal - (order.laborCost || 0) - (order.deliveryCost || 0) - (order.totalIncrementAmount || 0) - (order.estimatedProfit || 0));

            const orderCard = document.createElement('div');
            orderCard.classList.add('recorded-order-card');
            orderCard.innerHTML = `
                <button class="delete-order-btn" data-id="${order.orderNumber}" aria-label="Eliminar Pedido ${order.orderNumber}">❌</button>
                <h4>Pedido #${order.orderNumber}</h4>
                <p><strong>Fecha Registro:</strong> ${order.date.toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                ${order.clientName ? `<p><strong>Cliente:</strong> ${order.clientName}</p>` : ''}
                ${order.productNameFinal ? `<p><strong>Producto Final:</strong> ${order.productNameFinal}</p>` : ''}

                <div class="items-list">
                    <strong>Detalle de Productos:</strong>
                    ${order.items.map(item => `
                        <div class="item-detail item-sub-detail">
                            <span>- ${item.name} x ${item.quantity}</span>
                            <span>$${formatCurrency(item.basePrice)}</span>
                        </div>
                    `).join('')}
                    ${displayTotalBasePriceOfItems > 0 ? `<div class="item-detail"><span>Subtotal Productos Base:</span><span>$${formatCurrency(displayTotalBasePriceOfItems)}</span></div>` : ''}
                    ${order.totalIncrementAmount > 0 ? `<div class="item-detail"><span>Incremento (20%):</span><span>$${formatCurrency(order.totalIncrementAmount)}</span></div>` : ''}
                </div>
                ${order.laborCost > 0 ? `<p><strong>Mano de Obra:</strong> $${formatCurrency(order.laborCost)}</p>` : ''}
                ${order.estimatedProfit > 0 ? `<p><strong>Ganancia Total:</strong> $${formatCurrency(order.estimatedProfit)}</p>` : ''}
                ${order.deliveryCost > 0 ? `<p><strong>Domicilio:</strong> $${formatCurrency(order.deliveryCost)}</p>` : ''}
                <p class="total-display">Total Cobrado: $${formatCurrency(order.finalTotal)}</p>

                ${order.deliveryCost > 0 || (order.clientName && order.clientContact && order.deliveryAddress && order.cityNeighborhood) ? `<button class="delivery-info-btn" data-id="${order.orderNumber}">Info Domiciliario</button>` : ''}
                <button class="status-btn ${order.status}" data-id="${order.orderNumber}" data-status="${order.status}">
                    ${order.status === 'pending' ? 'Pendiente' : order.status === 'dispatched' ? 'Despachado' : 'Entregado'}
                </button>
            `;
            orderHistoryList.appendChild(orderCard);
        });

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
    document.querySelectorAll('.status-btn').forEach(button => {
        button.onclick = (e) => toggleOrderStatus(parseInt(e.target.dataset.id));
    });
}

function toggleOrderStatus(orderNumber) {
    const orderIndex = orders.findIndex(order => order.orderNumber === orderNumber);
    if (orderIndex !== -1) {
        let newStatus;
        let statusText;
        switch (orders[orderIndex].status) {
            case 'pending':
                newStatus = 'dispatched';
                statusText = 'Despachado';
                break;
            case 'dispatched':
                newStatus = 'delivered';
                statusText = 'Entregado';
                break;
            case 'delivered':
                newStatus = 'pending';
                statusText = 'Pendiente';
                break;
            default:
                newStatus = 'pending';
                statusText = 'Pendiente';
        }
        orders[orderIndex].status = newStatus;
        saveOrdersToLocalStorage();
        renderOrderHistory();
        showToast(`🔄 Estado de Pedido #${orderNumber} actualizado a: ${statusText}.`);
    }
}

function deleteOrder(orderNumber) {
    if (confirm(`¿Estás seguro de que quieres eliminar la Pedido #${orderNumber}? Esta acción no se puede deshacer.'`)) {
        orders = orders.filter(order => order.orderNumber !== orderNumber);
        saveOrdersToLocalStorage();
        renderOrderHistory();
        showToast(`🗑️ Pedido #${orderNumber} eliminado.`);
    }
}

function clearCalculatorInputs() {
    document.querySelectorAll('#search-results input[type="number"]').forEach(input => {
        input.value = 0;
    });
    laborCostInput.value = 0;
    deliveryCostInput.value = 0;
    profitPercentageInput.value = 0;
    modalClientNameInput.value = '';
    modalClientContactInput.value = '';
    modalDeliveryDateInput.value = ''; // Resetear
    modalDeliveryTimeInput.value = '';
    modalDeliveryAddressInput.value = '';
    modalReferencePointInput.value = ''; // Resetear
    modalCityNeighborhoodInput.value = '';
    modalProductDetailsInput.value = ''; // Resetear
    modalProductNameFinalInput.value = '';
    calculateTotal();
    confirmSaveOrderBtn.textContent = 'Confirmar y Guardar Pedido';
    currentClientToEdit = null;
}

function clearAllFilters() {
    filterStartDateInput.value = '';
    filterEndDateInput.value = '';
    filterClientNameInput.value = '';
    filterOrderNumberInput.value = '';
    allOrdersVisible = false;
    renderOrderHistory();
    showToast('🧹 Filtros de pedidos limpiados.');
}

// --- Funciones de Modales ---

function showDeliveryInfoModal(orderNumber) {
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        deliveryModalOrderNumber.textContent = order.orderNumber;
        deliveryModalClientName.textContent = order.clientName || 'N/A';
        deliveryModalClientContact.textContent = order.clientContact || 'N/A';
        deliveryModalDeliveryDate.textContent = order.deliveryDate ? order.deliveryDate.toLocaleDateString('es-CO') : 'N/A'; // Nuevo
        deliveryModalDeliveryTime.textContent = order.deliveryTime || 'N/A';
        deliveryModalDeliveryAddress.textContent = order.deliveryAddress || 'N/A';
        deliveryModalReferencePoint.textContent = order.referencePoint || 'N/A'; // Nuevo
        deliveryModalCityNeighborhood.textContent = order.cityNeighborhood || 'N/A';
        deliveryModalProductDetails.textContent = order.productDetails || 'N/A'; // Nuevo
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
    clearCalculatorInputs();
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
    const deliveryDate = deliveryModalDeliveryDate.textContent; // Nuevo
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const referencePoint = deliveryModalReferencePoint.textContent; // Nuevo
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productDetails = deliveryModalProductDetails.textContent; // Nuevo
    const productNameFinal = deliveryModalProductNameFinal.textContent;
    const finalTotal = deliveryModalFinalTotal.textContent;

    const textToCopy = `
*Información para Domiciliario:*
*Pedido #:* ${orderNumber}
*Cliente:* ${clientName}
*Contacto:* ${clientContact}
*Fecha de Entrega:* ${deliveryDate}
*Hora de Entrega:* ${deliveryTime}
*Dirección:* ${deliveryAddress}
*Punto de Referencia:* ${referencePoint}
*Ciudad/Barrio:* ${cityNeighborhood}
*Detalles Producto:* ${productDetails}
*Producto Final:* ${productNameFinal}
*Valor a Cobrar:* ${finalTotal}
    `.trim();

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showToast('📋 Información copiada al portapapeles!');
        })
        .catch(err => {
            console.error('Error al copiar al portapapeles:', err);
            showToast('❌ Error al copiar la información. Intenta manualmente.');
        });
}

function sendDeliveryInfoToWhatsapp() {
    const clientContact = deliveryModalClientContact.textContent;
    const orderNumber = deliveryModalOrderNumber.textContent;
    const clientName = deliveryModalClientName.textContent;
    const deliveryDate = deliveryModalDeliveryDate.textContent; // Nuevo
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const referencePoint = deliveryModalReferencePoint.textContent; // Nuevo
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productDetails = deliveryModalProductDetails.textContent; // Nuevo
    const productNameFinal = deliveryModalProductNameFinal.textContent;
    const finalTotal = deliveryModalFinalTotal.textContent;

    const whatsappMessage = `
*Información para Domiciliario:*
*Pedido #:* ${orderNumber}
*Cliente:* ${clientName}
*Contacto:* ${clientContact}
*Fecha de Entrega:* ${deliveryDate}
*Hora de Entrega:* ${deliveryTime}
*Dirección:* ${deliveryAddress}
*Punto de Referencia:* ${referencePoint}
*Ciudad/Barrio:* ${cityNeighborhood}
*Detalles Producto:* ${productDetails}
*Producto Final:* ${productNameFinal}
*Valor a Cobrar:* ${finalTotal}
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${clientContact.replace(/\D/g, '')}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}

// --- Función para Exportar Tablas a Excel (.xlsx) ---
function exportTableToExcel(tableId, filename = '', includeOrderDetails = false) {
    let wb = XLSX.utils.book_new();
    let ws;

    if (includeOrderDetails) {
        const data = [
            ["Número Pedido", "Fecha Registro", "Cliente", "Contacto", "Fecha Entrega", "Hora Entrega", "Dirección", "Punto de Referencia", "Ciudad/Barrio", "Detalle Productos (Observación)", "Producto Final (Descripción para cliente)", "Detalle Productos Listado", "Subtotal Base Productos", "Incremento (20%)", "Mano de Obra", "Ganancia Total Estimada", "Porcentaje Ganancia (%)", "Domicilio", "Total Cobrado", "Estado"]
        ];

        orders.forEach(order => {
            const itemsDetail = order.items.map(item => `${item.name} x ${item.quantity} ($${formatCurrency(item.basePrice)} c/u)`).join('; ');
            data.push([
                order.orderNumber,
                order.date.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                order.clientName || 'N/A',
                order.clientContact || 'N/A',
                order.deliveryDate ? order.deliveryDate.toLocaleDateString('es-CO') : 'N/A', // Nuevo
                order.deliveryTime || 'N/A',
                order.deliveryAddress || 'N/A',
                order.referencePoint || 'N/A', // Nuevo
                order.cityNeighborhood || 'N/A',
                order.productDetails || 'N/A', // Nuevo
                order.productNameFinal || 'N/A',
                itemsDetail,
                order.totalBasePriceOfItems,
                order.totalIncrementAmount,
                order.laborCost,
                order.estimatedProfit, // Ganancia consolidada
                order.profitPercentage,
                order.deliveryCost,
                order.finalTotal,
                order.status
            ]);
        });
        ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Pedidos");

    } else if (tableId === 'products-table') {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Tabla con ID '${tableId}' no encontrada.`);
            showToast(`❌ Error: Tabla con ID '${tableId}' no encontrada.`);
            return;
        }

        const data = [];
        const headerCells = table.querySelector('thead tr').querySelectorAll('th');
        const headers = [];
        for (let i = 0; i < headerCells.length - 1; i++) {
            headers.push(headerCells[i].textContent.trim());
        }
        data.push(headers);

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            for (let i = 0; i < cells.length - 1; i++) {
                rowData.push(cells[i].textContent.trim());
            }
            data.push(rowData);
        });

        ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Productos");

    } else if (tableId === 'clients-table') { // Nueva lógica para exportar clientes
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Tabla con ID '${tableId}' no encontrada.`);
            showToast(`❌ Error: Tabla con ID '${tableId}' no encontrada.`);
            return;
        }

        const data = [
            ["Nombre", "Contacto", "Dirección", "Punto de Referencia", "Ciudad/Barrio"]
        ];

        clientsDb.forEach(client => {
            data.push([
                client.name || 'N/A',
                client.contact || 'N/A',
                client.address || 'N/A',
                client.referencePoint || 'N/A',
                client.cityNeighborhood || 'N/A'
            ]);
        });
        ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    } else {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Tabla con ID '${tableId}' no encontrada.`);
            showToast(`❌ Error: Tabla con ID '${tableId}' no encontrada.`);
            return;
        }
        ws = XLSX.utils.table_to_sheet(table, {
            raw: false,
            cellDates: false
        });
        XLSX.utils.book_append_sheet(wb, ws, "Datos");
    }

    const excelFileName = filename ? `${filename}.xlsx` : 'datos.xlsx';
    XLSX.writeFile(wb, excelFileName);
    showToast(`📊 "${filename}" exportado exitosamente.`);
}

// --- Nueva Función para Importar Productos desde Excel (.xlsx) ---
function importProductsFromExcel(event) {
    const file = event.target.files[0];
    if (!file) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

            if (rawData.length < 2) {
                showToast('⚠️ El archivo Excel está vacío o solo contiene encabezados.');
                event.target.value = '';
                return;
            }

            const headers = rawData[0].map(h => String(h).toLowerCase().trim());
            const productNameColumnIndex = headers.indexOf('producto');
            const productPriceColumnIndex = headers.indexOf('precio unitario');

            if (productNameColumnIndex === -1 || productPriceColumnIndex === -1) {
                showToast('⚠️ El archivo Excel debe contener las columnas "Producto" y "Precio Unitario".');
                event.target.value = '';
                return;
            }

            let productsAddedOrUpdated = 0;
            let productsSkipped = 0;
            let newNextProductId = nextProductId;

            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                const name = row[productNameColumnIndex] ? String(row[productNameColumnIndex]).trim() : '';
                const priceValue = row[productPriceColumnIndex];
                let price = NaN;

                if (typeof priceValue === 'number') {
                    price = priceValue;
                } else if (typeof priceValue === 'string') {
                    price = parseFloat(priceValue.replace(/\$|,/g, ''));
                }

                if (name && !isNaN(price) && price > 0) {
                    const existingProductIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

                    if (existingProductIndex !== -1) {
                        products[existingProductIndex].price = price;
                        productsAddedOrUpdated++;
                    } else {
                        products.push({
                            id: `prod-${newNextProductId++}`,
                            name: name,
                            price: price
                        });
                        productsAddedOrUpdated++;
                    }
                } else {
                    console.warn(`Saltando fila ${i + 1} debido a datos inválidos: Producto="${name}", Precio="${row[productPriceColumnIndex]}"`);
                    productsSkipped++;
                }
            }
            nextProductId = newNextProductId;

            saveProductsToLocalStorage();
            renderProductTable();
            showToast(`✅ Se importaron ${productsAddedOrUpdated} productos. (${productsSkipped} omitidos por datos inválidos)`);
        } catch (error) {
            console.error('Error al procesar el archivo Excel:', error);
            showToast('❌ Hubo un error al procesar el archivo Excel. Asegúrate de que sea un formato válido.');
        } finally {
            event.target.value = '';
        }
    };

    reader.onerror = (ex) => {
        console.error('Error al leer el archivo:', ex);
        showToast('❌ Hubo un error al leer el archivo Excel.');
        event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
}

// --- Event Listeners y Inicialización ---

addProductBtn.addEventListener('click', addProduct);
updateProductBtn.addEventListener('click', updateProduct);
cancelEditBtn.addEventListener('click', resetProductForm);

searchInput.addEventListener('input', filterAndRenderProductSelection);

laborCostInput.addEventListener('input', calculateTotal);
laborCostInput.addEventListener('change', calculateTotal);
deliveryCostInput.addEventListener('input', calculateTotal);
deliveryCostInput.addEventListener('change', calculateTotal);
profitPercentageInput.addEventListener('input', calculateTotal);
profitPercentageInput.addEventListener('change', calculateTotal);

saveOrderBtn.addEventListener('click', handleSaveOrder);
confirmSaveOrderBtn.addEventListener('click', confirmAndSaveOrder);

filterStartDateInput.addEventListener('change', () => {
    allOrdersVisible = false;
    renderOrderHistory();
});
filterEndDateInput.addEventListener('change', () => {
    allOrdersVisible = false;
    renderOrderHistory();
});
filterClientNameInput.addEventListener('input', () => {
    allOrdersVisible = false;
    renderOrderHistory();
});
filterOrderNumberInput.addEventListener('input', () => {
    allOrdersVisible = false;
    renderOrderHistory();
});
clearFiltersBtn.addEventListener('click', clearAllFilters);

showMoreOrdersBtn.addEventListener('click', () => {
    allOrdersVisible = !allOrdersVisible;
    renderOrderHistory();
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

exportProductsBtn.addEventListener('click', () => exportTableToExcel('products-table', 'productos'));
exportOrdersBtn.addEventListener('click', () => exportTableToExcel(null, 'pedidos_registrados', true));
exportClientsBtn.addEventListener('click', () => exportTableToExcel('clients-table', 'clientes')); // Event listener para el nuevo botón

importProductsBtn.addEventListener('click', () => {
    importProductsFile.click();
});
importProductsFile.addEventListener('change', importProductsFromExcel);

// --- Funciones de Tabs ---
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Recalcular y renderizar al cambiar de pestaña si es necesario
            if (targetTab === 'order-calculator') {
                filterAndRenderProductSelection();
                calculateTotal();
            } else if (targetTab === 'order-history') {
                renderOrderHistory();
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadClientsFromLocalStorage();

    renderProductTable(); // Renderiza la tabla de productos
    filterAndRenderProductSelection(); // Renderiza los productos seleccionables en la calculadora
    calculateTotal(); // Calcula el total inicial (debería ser 0 si no hay nada)
    renderOrderHistory(); // Renderiza el historial de pedidos

    setupTabs(); // Configura la lógica de las pestañas
});

// --- Bloqueo de Funciones de Desarrollador ---
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showToast('🚫 Clic derecho deshabilitado.');
});

document.addEventListener('keydown', function(e) {
    // Bloquear Ctrl+U
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        showToast('🚫 Ctrl+U deshabilitado.');
    }
    // Bloquear Fn+F12 (o F12 solo en algunos teclados)
    if (e.key === 'F12') {
        e.preventDefault();
        showToast('🚫 F12 deshabilitado.');
    }
});