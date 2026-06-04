// Email Validation Function — works for any section
function EmailValidation(inputId, errId) {
    const EmailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailInput = document.getElementById(inputId);
    const emailErr = document.getElementById(errId);

    //Clear previous error message
    emailErr.textContent = '';

    if (!EmailReg.test(emailInput.value)) {
        emailErr.textContent = 'Enter Valid Email ID';
        return false;
    }
    return true;
}

// ============================================================================
// ADMIN DASHBOARD - CAR MANAGEMENT SYSTEM
// ============================================================================

// Data Store (using localStorage)
const STORAGE_KEY = 'autolux_cars';
let cars = [];
let deleteCarId = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadCarsFromStorage();
    setupEventListeners();
    updateDashboard();
    displayCars();
});

// Setup Event Listeners
function setupEventListeners() {
    // Menu Items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Add Car Form
    document.getElementById('add-car-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addNewCar();
    });

    // Search and Filter
    document.getElementById('searchCars').addEventListener('input', filterCars);
    document.getElementById('filterStatus').addEventListener('change', filterCars);
}

// Switch Section
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Update active menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });

    // Refresh data if needed
    if (sectionName === 'cars') {
        displayCars();
    } else if (sectionName === 'analytics') {
        updateAnalytics();
    }
}

// Add New Car
function addNewCar() {
    const carData = {
        id: Date.now(),
        brand: document.getElementById('carBrand').value,
        model: document.getElementById('carModel').value,
        year: parseInt(document.getElementById('carYear').value),
        color: document.getElementById('carColor').value,
        price: parseFloat(document.getElementById('carPrice').value),
        mileage: parseInt(document.getElementById('carMileage').value),
        fuelType: document.getElementById('carFuelType').value,
        transmission: document.getElementById('carTransmission').value,
        status: document.getElementById('carStatus').value,
        description: document.getElementById('carDescription').value || '',
        addedDate: new Date().toLocaleDateString()
    };

    cars.push(carData);
    saveCarToStorage();
    showAlert('Car added successfully!', 'success');
    document.getElementById('add-car-form').reset();
    updateDashboard();
    displayCars();
}

// Display Cars in Table
function displayCars() {
    const tableBody = document.getElementById('cars-table-body');

    if (cars.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No cars added yet</td></tr>';
        return;
    }

    tableBody.innerHTML = cars.map(car => `
        <tr>
            <td>
                <strong>${car.brand}</strong><br>
                <small class="text-muted">${car.model}</small>
            </td>
            <td>${car.year}</td>
            <td>$${car.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td>${car.mileage.toLocaleString()} km</td>
            <td>${car.fuelType}</td>
            <td>
                <span class="status-badge status-${car.status.toLowerCase()}">
                    ${car.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteCar(${car.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Edit Car
function editCar(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;

    document.getElementById('editCarId').value = car.id;
    document.getElementById('editCarBrand').value = car.brand;
    document.getElementById('editCarModel').value = car.model;
    document.getElementById('editCarYear').value = car.year;
    document.getElementById('editCarColor').value = car.color;
    document.getElementById('editCarPrice').value = car.price;
    document.getElementById('editCarMileage').value = car.mileage;
    document.getElementById('editCarFuelType').value = car.fuelType;
    document.getElementById('editCarTransmission').value = car.transmission;
    document.getElementById('editCarStatus').value = car.status;
    document.getElementById('editCarDescription').value = car.description;

    const modal = new bootstrap.Modal(document.getElementById('editCarModal'));
    modal.show();
}

// Save Edit Car
function saveEditCar() {
    const id = parseInt(document.getElementById('editCarId').value);
    const carIndex = cars.findIndex(c => c.id === id);

    if (carIndex === -1) return;

    cars[carIndex] = {
        ...cars[carIndex],
        brand: document.getElementById('editCarBrand').value,
        model: document.getElementById('editCarModel').value,
        year: parseInt(document.getElementById('editCarYear').value),
        color: document.getElementById('editCarColor').value,
        price: parseFloat(document.getElementById('editCarPrice').value),
        mileage: parseInt(document.getElementById('editCarMileage').value),
        fuelType: document.getElementById('editCarFuelType').value,
        transmission: document.getElementById('editCarTransmission').value,
        status: document.getElementById('editCarStatus').value,
        description: document.getElementById('editCarDescription').value
    };

    saveCarToStorage();
    showAlert('Car updated successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('editCarModal')).hide();
    updateDashboard();
    displayCars();
}

// Delete Car
function deleteCar(id) {
    deleteCarId = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

// Confirm Delete
function confirmDelete() {
    if (deleteCarId === null) return;

    cars = cars.filter(c => c.id !== deleteCarId);
    saveCarToStorage();
    showAlert('Car deleted successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
    updateDashboard();
    displayCars();
    deleteCarId = null;
}

// Filter Cars
function filterCars() {
    const searchTerm = document.getElementById('searchCars').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = cars.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm) ||
            car.model.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === '' || car.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const tableBody = document.getElementById('cars-table-body');

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No cars found</td></tr>';
        return;
    }

    tableBody.innerHTML = filtered.map(car => `
        <tr>
            <td>
                <strong>${car.brand}</strong><br>
                <small class="text-muted">${car.model}</small>
            </td>
            <td>${car.year}</td>
            <td>$${car.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td>${car.mileage.toLocaleString()} km</td>
            <td>${car.fuelType}</td>
            <td>
                <span class="status-badge status-${car.status.toLowerCase()}">
                    ${car.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteCar(${car.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update Dashboard
function updateDashboard() {
    const totalCars = cars.length;
    const availableCars = cars.filter(c => c.status === 'Available').length;
    const soldCars = cars.filter(c => c.status === 'Sold').length;

    // Sidebar Stats
    document.getElementById('total-cars').textContent = totalCars;
    document.getElementById('available-cars').textContent = availableCars;

    // Dashboard Stats
    document.getElementById('dash-total-cars').textContent = totalCars;
    document.getElementById('dash-available-cars').textContent = availableCars;
    document.getElementById('dash-sold-cars').textContent = soldCars;
}

// Update Analytics
function updateAnalytics() {
    updateFuelTypeStats();
    updateStatusStats();
    updatePriceStats();
}

// Fuel Type Statistics
function updateFuelTypeStats() {
    const fuelTypes = {};
    cars.forEach(car => {
        fuelTypes[car.fuelType] = (fuelTypes[car.fuelType] || 0) + 1;
    });

    const statsHTML = Object.entries(fuelTypes).length === 0
        ? '<p class="text-muted">No data available</p>'
        : Object.entries(fuelTypes).map(([type, count]) => `
            <div class="stat-row">
                <span class="stat-row-label">${type}</span>
                <span class="stat-row-value">${count} cars</span>
            </div>
        `).join('');

    document.getElementById('fuel-type-stats').innerHTML = statsHTML;
}

// Status Statistics
function updateStatusStats() {
    const statuses = {};
    cars.forEach(car => {
        statuses[car.status] = (statuses[car.status] || 0) + 1;
    });

    const statsHTML = Object.entries(statuses).length === 0
        ? '<p class="text-muted">No data available</p>'
        : Object.entries(statuses).map(([status, count]) => `
            <div class="stat-row">
                <span class="stat-row-label">${status}</span>
                <span class="stat-row-value">${count} cars</span>
            </div>
        `).join('');

    document.getElementById('status-stats').innerHTML = statsHTML;
}

// Price Statistics
function updatePriceStats() {
    if (cars.length === 0) {
        document.getElementById('price-stats').innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    const prices = cars.map(c => c.price).sort((a, b) => a - b);
    const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];

    document.getElementById('price-stats').innerHTML = `
        <div class="stat-row">
            <span class="stat-row-label">Average Price</span>
            <span class="stat-row-value">$${parseFloat(avgPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="stat-row">
            <span class="stat-row-label">Minimum Price</span>
            <span class="stat-row-value">$${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="stat-row">
            <span class="stat-row-label">Maximum Price</span>
            <span class="stat-row-value">$${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
    `;
}

// Storage Functions
function saveCarToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

function loadCarsFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    cars = stored ? JSON.parse(stored) : [];
}

// Show Alert Toast
function showAlert(message, type = 'success') {
    const toast = document.getElementById('alertToast');
    document.getElementById('alertMessage').textContent = message;
    toast.classList.remove('error');
    if (type === 'error') {
        toast.classList.add('error');
    }
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Logout Admin
function logoutAdmin(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

// Export Cars (CSV)
function exportToCSV() {
    if (cars.length === 0) {
        showAlert('No cars to export!', 'error');
        return;
    }

    const headers = ['Brand', 'Model', 'Year', 'Price', 'Mileage', 'Fuel Type', 'Transmission', 'Status', 'Added Date'];
    const rows = cars.map(car => [
        car.brand,
        car.model,
        car.year,
        car.price,
        car.mileage,
        car.fuelType,
        car.transmission,
        car.status,
        car.addedDate
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `autolux-cars-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showAlert('Cars exported successfully!');
}

// Print Cars Report
function printReport() {
    if (cars.length === 0) {
        showAlert('No cars to print!', 'error');
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    const style = `
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; background: white; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
    `;

    let tableHTML = `
        <h1>AutoLux - Car Inventory Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <table>
            <thead>
                <tr>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price</th>
                    <th>Mileage</th>
                    <th>Fuel Type</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    cars.forEach(car => {
        tableHTML += `
            <tr>
                <td>${car.brand}</td>
                <td>${car.model}</td>
                <td>${car.year}</td>
                <td>$${car.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>${car.mileage.toLocaleString()} km</td>
                <td>${car.fuelType}</td>
                <td>${car.status}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    printWindow.document.write(style + tableHTML);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}
