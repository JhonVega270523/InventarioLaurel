const defaultProducts = [
    { id: 'prod-1', name: 'Peluche Pequeño', price: 15000 },
    { id: 'prod-2', name: 'Caja Decorada Mediana', price: 10000 },
    { id: 'prod-3', name: 'Globo Metalizado (unidad)', price: 7000 },
    { id: 'prod-4', name: 'Rosas Rojas (unidad)', price: 5000 },
    { id: 'prod-5', name: 'Chocolates Surtidos (caja)', price: 20000 },
    { id: 'prod-6', name: 'Taza Personalizada', price: 18000 },
    { id: 'prod-7', name: 'Tarjeta Dedicatoria', price: 3000 },
    { id: 'prod-8', name: 'Bolsa de Regalo Grande', price: 8000 },
    { id: 'prod-9', name: 'Cerveza Artesanal (unidad)', price: 12000 },
    { id: 'prod-10', name: 'Vino Tinto Pequeño', price: 25000 },
    { id: 'prod-11', name: 'Snacks Salados (paquete)', price: 6000 },
    { id: 'prod-12', name: 'Dulces Importados', price: 9000 },
    { id: 'prod-13', name: 'Libreta Personalizada', price: 14000 },
    { id: 'prod-14', name: 'Esfero de Lujo', price: 11000 },
    { id: 'prod-15', name: 'Perfume Pequeño', price: 35000 },
    { id: 'prod-16', name: 'Set de Velas Aromáticas', price: 22000 },
    { id: 'prod-17', name: 'Marco de Fotos Digital', price: 50000 },
    { id: 'prod-18', name: 'Altavoz Bluetooth Mini', price: 40000 }
];

const ORDERS_PER_PAGE = 6; // Número de pedidos a mostrar inicialmente
const PRODUCTS_PER_PAGE = 15; // Número de productos a mostrar por página
let currentProductPage = 1;  // Página actual de productos

let products = [];
let orders = [];
let clientsDb = []; // Nueva base de datos para clientes
let allOrdersVisible = false; // Estado para controlar si todos los pedidos están visibles

const productsTableBody = document.querySelector('#products-table tbody');
const searchInput = document.getElementById('productSearch');
const searchResultsDiv = document.getElementById('search-results');
const laborCostInput = document.getElementById('laborCost');
const deliveryCostInput = document.getElementById('deliveryCost');
const profitPercentageInput = document.getElementById('profitPercentage'); // Input para porcentaje de ganancia
const estimatedProfitSpan = document.getElementById('estimatedProfit'); // Span para mostrar ganancia estimada
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
const filteredProfitsTotalSpan = document.getElementById('filteredProfitsTotal'); // Span para ganancias filtradas
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const clientDetailsModal = document.getElementById('clientDetailsModal');
const clientModalCloseButton = document.querySelector('.client-modal-close');
const modalClientNameInput = document.getElementById('modalClientName');
const modalClientContactInput = document.getElementById('modalClientContact');
const modalDeliveryDateInput = document.getElementById('modalDeliveryDate'); // Campo Fecha de Entrega
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
const exportClientsBtn = document.getElementById('exportClientsBtn'); // Botón de exportar clientes

const exportProductsBtn = document.getElementById('exportProductsBtn');
const importProductsBtn = document.getElementById('importProductsBtn');
const importProductsFile = document.getElementById('importProductsFile');
const exportOrdersBtn = document.getElementById('exportOrdersBtn');

const filterStatusPendingBtn = document.getElementById('filterStatusPending');
const filterStatusDispatchedBtn = document.getElementById('filterStatusDispatched');
const filterStatusDeliveredBtn = document.getElementById('filterStatusDelivered');
const filterStatusAllBtn = document.getElementById('filterStatusAll'); // Botón "Todos"

// Nuevos elementos DOM para la paginación de productos
const productPaginationDiv = document.getElementById('product-pagination');
const prevProductPageBtn = document.getElementById('prevProductPageBtn');
const nextProductPageBtn = document.getElementById('nextProductPageBtn');
const productPageInfoSpan = document.getElementById('productPageInfo');

let currentStatusFilter = 'all'; // Variable para almacenar el filtro de estado activo

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
    
    // Calcular el inicio y fin de los productos a mostrar en la página actual
    const startIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    // Obtener los productos para la página actual
    const productsToDisplay = products.slice(startIndex, endIndex);

    if (productsToDisplay.length === 0 && products.length > 0 && currentProductPage > 1) {
        // Si no hay productos en la página actual pero sí en total, ir a la página anterior
        currentProductPage--;
        renderProductTable(); // Volver a llamar para renderizar la página correcta
        return;
    }

    if (products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="3">No hay productos registrados.</td></tr>';
        productPaginationDiv.style.display = 'none'; // Ocultar paginación si no hay productos
    } else {
        productsToDisplay.forEach(product => {
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
        updateProductPaginationControls(); // Actualizar los controles de paginación
    }
    
    filterAndRenderProductSelection(); // Asegurarse de que la lista de selección se actualice
    calculateTotal(); // Recalcular totales si es necesario (aunque no directamente relacionado con la tabla)
}

function updateProductPaginationControls() {
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

    if (totalPages > 1) {
        productPaginationDiv.style.display = 'flex'; // Mostrar la sección de paginación
        prevProductPageBtn.disabled = currentProductPage === 1;
        nextProductPageBtn.disabled = currentProductPage === totalPages;
        productPageInfoSpan.textContent = `Página ${currentProductPage} de ${totalPages}`;
    } else {
        productPaginationDiv.style.display = 'none'; // Ocultar si solo hay una página o menos
    }
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
    renderProductTable(); // Re-renderiza para aplicar paginación si aplica
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
    renderProductTable(); // Re-renderiza para aplicar paginación si aplica
    showToast('✅ Producto actualizado exitosamente.');
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este Producto? Esta acción no se puede deshacer.')) {
        products = products.filter(product => product.id !== id);
        saveProductsToLocalStorage();
        renderProductTable(); // Re-renderiza para aplicar paginación si aplica
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
    searchResultsDiv.innerHTML = ''; // Limpiar resultados de búsqueda anteriores

    let productsToDisplay;

    if (searchTerm === '') {
        // Si la barra de búsqueda está vacía, muestra todos los productos.
        productsToDisplay = products; 
    } else {
        // Si hay un término de búsqueda, filtra los productos.
        productsToDisplay = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
    }

    if (productsToDisplay.length > 0) {
        const dropdownList = document.createElement('ul');
        dropdownList.classList.add('search-dropdown'); // Clase CSS para estilizar como un desplegable

        productsToDisplay.forEach(product => {
            const listItem = document.createElement('li');
            listItem.textContent = `${product.name} ($${formatCurrency(product.price)})`;
            listItem.dataset.id = product.id; // Almacenar el ID del producto para fácil acceso
            dropdownList.appendChild(listItem);
        });
        searchResultsDiv.appendChild(dropdownList);

        // Añadir evento click a cada ítem del desplegable
        dropdownList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                addProductToSummary(productId); // Llamar a la función para añadir al resumen
                searchInput.value = ''; // Limpiar la barra de búsqueda
                searchResultsDiv.innerHTML = ''; // Ocultar el desplegable
            });
        });
    } else if (searchTerm !== '') {
        // Solo mostrar "No se encontraron productos" si hay un término de búsqueda y no hay coincidencias
        searchResultsDiv.innerHTML = '<p>No se encontraron productos.</p>';
    } else if (products.length === 0) {
        // Si no hay ningún producto cargado en la base de datos
        searchResultsDiv.innerHTML = '<p>No hay Productos disponibles. Agregue algunos en la sección de Gestión.</p>';
    }
    // Si no hay término de búsqueda y hay productos, pero no se hace clic, el div searchResultsDiv estará vacío, lo cual es el comportamiento deseado (desplegable oculto hasta interactuar).
}

function addProductToSummary(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!currentOrderToSave) {
        currentOrderToSave = {
            items: [],
            laborCost: parseFloat(laborCostInput.value) || 0,
            deliveryCost: parseFloat(deliveryCostInput.value) || 0,
            profitPercentage: parseFloat(profitPercentageInput.value) || 0,
            totalIncrementAmount: 0,
            estimatedProfit: 0,
            finalTotal: 0,
            totalBasePriceOfItems: 0,
            finalProfit: 0
        };
    }

    const existingItemIndex = currentOrderToSave.items.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
        currentOrderToSave.items[existingItemIndex].quantity++;
        showToast(`Cantidad de "${product.name}" aumentada.`);
    } else {
        currentOrderToSave.items.push({
            id: product.id,
            name: product.name,
            quantity: 1,
            basePrice: product.price,
            totalBasePrice: product.price,
            itemIncrement: product.price * 0.20
        });
        showToast(`"${product.name}" añadido al pedido.`);
    }
    calculateTotal();
}

function updateItemQuantity(productId, newQuantity) {
    if (!currentOrderToSave || !currentOrderToSave.items) {
        return;
    }

    const existingItemIndex = currentOrderToSave.items.findIndex(item => item.id === productId);

    if (newQuantity <= 0) {
        if (existingItemIndex !== -1) {
            currentOrderToSave.items.splice(existingItemIndex, 1);
            showToast(`Producto removido del pedido.`);
        }
    } else {
        if (existingItemIndex !== -1) {
            const product = products.find(p => p.id === productId);
            if (product) {
                currentOrderToSave.items[existingItemIndex].quantity = newQuantity;
                currentOrderToSave.items[existingItemIndex].totalBasePrice = product.price * newQuantity;
                currentOrderToSave.items[existingItemIndex].itemIncrement = (product.price * newQuantity) * 0.20;
            }
        } else {
            const product = products.find(p => p.id === productId);
            if (product) {
                currentOrderToSave.items.push({
                    id: product.id,
                    name: product.name,
                    quantity: newQuantity,
                    basePrice: product.price,
                    totalBasePrice: product.price * newQuantity,
                    itemIncrement: (product.price * newQuantity) * 0.20,
                });
            }
        }
    }
    calculateTotal();
}

function calculateTotal() {
    let totalBasePriceOfItems = 0;
    let totalIncrementAmount = 0;
    
    // Asegúrate de que currentOrderToSave.items no sea nulo al inicio
    let currentOrderItems = currentOrderToSave && currentOrderToSave.items ? [...currentOrderToSave.items] : [];

    currentOrderItems.forEach(item => {
        const productData = products.find(p => p.id === item.id);
        if (productData) {
            item.basePrice = productData.price; // Asegura usar el precio más reciente
            item.totalBasePrice = item.basePrice * item.quantity;
            item.itemIncrement = item.totalBasePrice * 0.20; // 20% de incremento

            totalBasePriceOfItems += item.totalBasePrice;
            totalIncrementAmount += item.itemIncrement;
        }
    });

    const laborCost = parseFloat(laborCostInput.value) || 0;
    const deliveryCost = parseFloat(deliveryCostInput.value) || 0;
    const profitPercentage = parseFloat(profitPercentageInput.value) || 0;

    const baseForPercentageProfit = totalBasePriceOfItems + totalIncrementAmount + laborCost;
    const percentageProfit = baseForPercentageProfit * (profitPercentage / 100);

    const estimatedProfitConsolidated = totalIncrementAmount + percentageProfit;

    const finalTotal = totalBasePriceOfItems + totalIncrementAmount + laborCost + deliveryCost + percentageProfit;

    // Si currentOrderToSave es nulo por alguna razón, inicialízalo aquí
    if (!currentOrderToSave) {
        currentOrderToSave = {};
    }
    currentOrderToSave.items = currentOrderItems; // Actualiza los ítems
    currentOrderToSave.laborCost = laborCost;
    currentOrderToSave.deliveryCost = deliveryCost;
    currentOrderToSave.totalIncrementAmount = totalIncrementAmount;
    currentOrderToSave.estimatedProfit = estimatedProfitConsolidated;
    currentOrderToSave.profitPercentage = profitPercentage;
    currentOrderToSave.finalTotal = finalTotal;
    currentOrderToSave.totalBasePriceOfItems = totalBasePriceOfItems;
    currentOrderToSave.finalProfit = estimatedProfitConsolidated;

    updateOrderSummary(currentOrderItems, laborCost, deliveryCost, finalTotal, totalIncrementAmount, totalBasePriceOfItems, estimatedProfitConsolidated, percentageProfit);

    // Actualiza los spans de totales visibles
    estimatedProfitSpan.textContent = `$${formatCurrency(estimatedProfitConsolidated)}`;
    finalTotalSpan.textContent = `$${formatCurrency(finalTotal)}`;
    
    if (modalClientDetailsTotalSpan) {
        modalClientDetailsTotalSpan.textContent = `$${formatCurrency(finalTotal)}`;
    }
    
    if (deliveryModalFinalTotal) {
        deliveryModalFinalTotal.textContent = `$${formatCurrency(finalTotal)}`;
    }
}

// Renombramos y modificamos esta función para que sea más completa
function clearCalculator() {
    // 1. Resetear los campos de búsqueda y el desplegable de resultados
    searchInput.value = '';
    searchResultsDiv.innerHTML = '';

    // 2. Resetear los inputs de costos adicionales
    laborCostInput.value = '0';
    deliveryCostInput.value = '0';
    profitPercentageInput.value = '0';

    // 3. Resetear el resumen de productos seleccionados
    selectedProductsDiv.innerHTML = '<p>No hay productos seleccionados ni costos adicionales.</p>';

    // 4. Resetear los spans de totales visibles en la calculadora
    estimatedProfitSpan.textContent = '$0';
    finalTotalSpan.textContent = '$0';

    // 5. Reiniciar la variable del pedido actual, es CRUCIAL
    currentOrderToSave = {
        items: [],
        laborCost: 0,
        deliveryCost: 0,
        profitPercentage: 0,
        totalIncrementAmount: 0,
        estimatedProfit: 0,
        finalTotal: 0,
        totalBasePriceOfItems: 0,
        finalProfit: 0
    };

    // 6. Resetear los campos del modal de detalles del cliente
    modalClientNameInput.value = '';
    modalClientContactInput.value = '';
    modalDeliveryDateInput.value = '';
    modalDeliveryTimeInput.value = '';
    modalDeliveryAddressInput.value = '';
    modalReferencePointInput.value = '';
    modalCityNeighborhoodInput.value = '';
    modalProductDetailsInput.value = '';
    modalProductNameFinalInput.value = '';
    modalClientDetailsTotalSpan.textContent = `$0`; 

    // 7. Deshabilitar el botón de guardar pedido si no hay nada en la calculadora
    saveOrderBtn.disabled = true;

    // 8. Reiniciar la variable de cliente a editar
    currentClientToEdit = null;
    confirmSaveOrderBtn.textContent = 'Confirmar y Guardar Pedido'; 

    showToast('Calculadora reiniciada.');
}

function updateOrderSummary(orderItems, labor, delivery, total, totalIncrementAmount, totalBasePriceOfItems, estimatedProfitConsolidated, percentageProfit) {
    selectedProductsDiv.innerHTML = ''; // ¡Borra el contenido anterior!

    saveOrderBtn.disabled = (orderItems.length === 0 && labor === 0 && delivery === 0 && estimatedProfitConsolidated === 0);

    if (orderItems.length === 0 && labor === 0 && delivery === 0 && estimatedProfitConsolidated === 0) {
        selectedProductsDiv.innerHTML = '<p>No hay productos seleccionados ni costos adicionales.</p>';
        saveOrderBtn.disabled = true;
    } else {
        orderItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('order-item-summary');
            itemElement.innerHTML = `
                <div class="item-info">
                    <span>${item.name} ($${formatCurrency(item.basePrice)} c/u)</span>
                    <span class="item-total-price">$${formatCurrency(item.totalBasePrice + item.itemIncrement)}</span>
                </div>
                <div class="item-controls">
                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="0" data-id="${item.id}" class="quantity-input">
                    <button class="increase-quantity" data-id="${item.id}">+</button>
                    <button class="remove-item-from-summary" data-id="${item.id}" aria-label="Eliminar ${item.name}"></button>
                </div>
            `;
            selectedProductsDiv.appendChild(itemElement);
        });

        selectedProductsDiv.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('input', (e) => updateItemQuantity(e.target.dataset.id, parseInt(e.target.value) || 0));
            input.addEventListener('change', (e) => updateItemQuantity(e.target.dataset.id, parseInt(e.target.value) || 0));
        });
        selectedProductsDiv.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = selectedProductsDiv.querySelector(`.quantity-input[data-id="${e.target.dataset.id}"]`);
                if (input && parseInt(input.value) > 0) {
                    input.value = parseInt(input.value) - 1;
                    updateItemQuantity(e.target.dataset.id, parseInt(input.value));
                }
            });
        });
        selectedProductsDiv.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = selectedProductsDiv.querySelector(`.quantity-input[data-id="${e.target.dataset.id}"]`);
                if (input) {
                    input.value = parseInt(input.value) + 1;
                    updateItemQuantity(e.target.dataset.id, parseInt(input.value));
                }
            });
        });
        selectedProductsDiv.querySelectorAll('.remove-item-from-summary').forEach(button => {
            button.addEventListener('click', function() {
                const productIdToRemove = this.dataset.id;
                updateItemQuantity(productIdToRemove, 0); // Establecer cantidad a 0 para eliminar
            });
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

        if (percentageProfit > 0) {
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

    if (currentClientToSave) { // Si estamos editando un cliente existente
        modalClientNameInput.value = currentClientToSave.clientName || '';
        modalClientContactInput.value = currentClientToSave.clientContact || '';
        modalDeliveryDateInput.value = currentOrderToSave.deliveryDate ? currentOrderToSave.deliveryDate.toISOString().split('T')[0] : ''; // Formato YYYY-MM-DD
        modalDeliveryTimeInput.value = currentOrderToSave.deliveryTime || '';
        modalDeliveryAddressInput.value = currentOrderToSave.deliveryAddress || '';
        modalReferencePointInput.value = currentOrderToSave.referencePoint || '';
        modalCityNeighborhoodInput.value = currentOrderToSave.cityNeighborhood || '';
        modalProductDetailsInput.value = currentOrderToSave.productDetails || '';
        modalProductNameFinalInput.value = currentOrderToSave.productNameFinal || '';
        modalClientDetailsTotalSpan.textContent = `$${formatCurrency(currentOrderToSave.finalTotal)}`;
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente'; // Cambiar texto del botón
    } else if (currentClientToEdit) { // Si estamos editando un cliente desde la DB de clientes
        modalClientNameInput.value = currentClientToEdit.name;
        modalClientContactInput.value = currentClientToEdit.contact || '';
        modalDeliveryDateInput.value = '';
        modalDeliveryTimeInput.value = '';
        modalDeliveryAddressInput.value = currentClientToEdit.address || '';
        modalReferencePointInput.value = currentClientToEdit.referencePoint || '';
        modalCityNeighborhoodInput.value = currentClientToEdit.cityNeighborhood || '';
        modalProductDetailsInput.value = '';
        modalProductNameFinalInput.value = '';
        modalClientDetailsTotalSpan.textContent = `$0`; // No hay total asociado a solo editar cliente
        confirmSaveOrderBtn.textContent = 'Actualizar Datos de Cliente';
    }
     else { // Nuevo pedido
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
        showToast('⚠️ No hay datos de pedido para guardar.');
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
    clearCalculator(); // Llama a la nueva función para reiniciar la calculadora
    closeClientDetailsModal();
    showToast('✅ Pedido guardado exitosamente.');
}

function renderOrderHistory() {
    orderHistoryList.innerHTML = '';
    let totalFilteredOrdersAmount = 0;
    let totalFilteredProfitsAmount = 0;

    const startDate = filterStartDateInput.value ? new Date(filterStartDateInput.value + 'T00:00:00') : null;
    const endDate = filterEndDateInput.value ? new Date(filterEndDateInput.value + 'T23:59:59') : null;
    const filterClientName = filterClientNameInput.value.toLowerCase();
    const filterOrderNumber = filterOrderNumberInput.value.trim();

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const matchesDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
        const matchesClient = !filterClientName || (order.clientName && order.clientName.toLowerCase().includes(filterClientName));
        const matchesOrderNumber = !filterOrderNumber || (order.orderNumber.toString() === filterOrderNumber);
        // Nuevo filtro por estado
        const matchesStatus = currentStatusFilter === 'all' || (order.status && order.status === currentStatusFilter);

        return matchesDate && matchesClient && matchesOrderNumber && matchesStatus; // Incluir el nuevo filtro
    });

    filteredOrders.sort((a, b) => {
        const statusOrder = { 'pending': 0, 'dispatched': 1, 'delivered': 2 };

        const statusA = statusOrder[a.status || 'pending'];
        const statusB = statusOrder[b.status || 'pending'];

        if (statusA !== statusB) {
            return statusA - statusB;
        }

        const dateA = a.deliveryDate ? a.deliveryDate.getTime() : Infinity;
        const dateB = b.deliveryDate ? b.deliveryDate.getTime() : Infinity;

        if (dateA !== dateB) {
            return dateA - dateB;
        }

        const timeA = a.deliveryTime ? parseInt(a.deliveryTime.replace(':', '')) : Infinity;
        const timeB = b.deliveryTime ? parseInt(b.deliveryTime.replace(':', '')) : Infinity;
        
        return timeA - timeB;
    });

    filteredOrders.forEach(order => {
        totalFilteredOrdersAmount += order.finalTotal;
        totalFilteredProfitsAmount += order.finalProfit || 0;
    });
    filteredOrdersTotalSpan.textContent = `$${formatCurrency(totalFilteredOrdersAmount)}`;
    filteredProfitsTotalSpan.textContent = `$${formatCurrency(totalFilteredProfitsAmount)}`;

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
                ${order.deliveryDate ? `<p><strong>Fecha de Entrega:</strong> ${order.deliveryDate.toLocaleDateString('es-CO')}</p>` : ''}
                ${order.deliveryTime ? `<p><strong>Hora de Entrega:</strong> ${order.deliveryTime}</p>` : ''}

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
        
        currentStatusFilter = newStatus; // Establece el filtro al nuevo estado
        updateStatusFilterButtons(newStatus); // Actualiza la clase activa de los botones
        renderOrderHistory(); // Vuelve a renderizar con el nuevo filtro
        
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
        deliveryModalDeliveryDate.textContent = order.deliveryDate ? order.deliveryDate.toLocaleDateString('es-CO') : 'N/A';
        deliveryModalDeliveryTime.textContent = order.deliveryTime || 'N/A';
        deliveryModalDeliveryAddress.textContent = order.deliveryAddress || 'N/A';
        deliveryModalReferencePoint.textContent = order.referencePoint || 'N/A';
        deliveryModalCityNeighborhood.textContent = order.cityNeighborhood || 'N/A';
        deliveryModalProductDetails.textContent = order.productDetails || 'N/A';
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
    const deliveryDate = deliveryModalDeliveryDate.textContent;
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const referencePoint = deliveryModalReferencePoint.textContent;
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productDetails = deliveryModalProductDetails.textContent;
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
    const deliveryDate = deliveryModalDeliveryDate.textContent;
    const deliveryTime = deliveryModalDeliveryTime.textContent;
    const deliveryAddress = deliveryModalDeliveryAddress.textContent;
    const referencePoint = deliveryModalReferencePoint.textContent;
    const cityNeighborhood = deliveryModalCityNeighborhood.textContent;
    const productDetails = deliveryModalProductDetails.textContent;
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
                order.deliveryDate ? order.deliveryDate.toLocaleDateString('es-CO') : 'N/A',
                order.deliveryTime || 'N/A',
                order.deliveryAddress || 'N/A',
                order.referencePoint || 'N/A',
                order.cityNeighborhood || 'N/A',
                order.productDetails || 'N/A',
                order.productNameFinal || 'N/A',
                itemsDetail,
                order.totalBasePriceOfItems,
                order.totalIncrementAmount,
                order.laborCost,
                order.estimatedProfit,
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

        // Exportar TODOS los productos, no solo los de la página actual
        products.forEach(product => {
            data.push([
                product.name,
                `$${formatCurrency(product.price)}`
            ]);
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
searchInput.addEventListener('focus', () => {
    if (searchInput.value === '') {
        filterAndRenderProductSelection();
    }
});
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
        searchResultsDiv.innerHTML = '';
    }
});

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

filterStatusPendingBtn.addEventListener('click', () => setStatusFilter('pending'));
filterStatusDispatchedBtn.addEventListener('click', () => setStatusFilter('dispatched'));
filterStatusDeliveredBtn.addEventListener('click', () => setStatusFilter('delivered'));
filterStatusAllBtn.addEventListener('click', () => setStatusFilter('all'));

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
exportClientsBtn.addEventListener('click', () => exportTableToExcel('clients-table', 'clientes'));

importProductsBtn.addEventListener('click', () => {
    importProductsFile.click();
});
importProductsFile.addEventListener('change', importProductsFromExcel);

// Event Listeners para los botones de paginación de productos
prevProductPageBtn.addEventListener('click', () => {
    if (currentProductPage > 1) {
        currentProductPage--;
        renderProductTable();
    }
});

nextProductPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    if (currentProductPage < totalPages) {
        currentProductPage++;
        renderProductTable();
    }
});

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
            } else if (targetTab === 'product-management') {
                renderProductTable(); // Asegurar que la tabla de productos se renderice con paginación
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromLocalStorage();
    loadOrdersFromLocalStorage();
    loadClientsFromLocalStorage();

    renderProductTable(); // Ahora renderProductTable manejará la paginación
    filterAndRenderProductSelection();
    
    // Inicializar currentOrderToSave si no existe
    if (!currentOrderToSave) {
        currentOrderToSave = {
            items: [],
            laborCost: 0,
            deliveryCost: 0,
            profitPercentage: 0,
            totalIncrementAmount: 0,
            estimatedProfit: 0,
            finalTotal: 0,
            totalBasePriceOfItems: 0,
            finalProfit: 0
        };
    }
    calculateTotal();
    
    currentStatusFilter = 'all';
    updateStatusFilterButtons(currentStatusFilter);
    renderOrderHistory(); 

    setupTabs();
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

function setStatusFilter(status) {
    currentStatusFilter = status;
    allOrdersVisible = false; // Resetear "Ver Más/Menos" al cambiar de filtro
    renderOrderHistory();
    updateStatusFilterButtons(status);
}

function updateStatusFilterButtons(activeStatus) {
    const allFilterButtons = document.querySelectorAll('.status-filter-btn');
    allFilterButtons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(`filterStatus${activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)}`).classList.add('active');
}