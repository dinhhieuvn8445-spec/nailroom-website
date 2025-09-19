// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    loadDashboardData();
    
    // Navigation handling
    setupNavigation();
    
    // Modal handling
    setupModals();
    
    // Load initial data
    loadCustomers();
    loadServices();
    loadAppointments();
});

// Initialize dashboard
function initializeDashboard() {
    // Check if user is admin
    checkAdminAuth();
    
    // Set active section
    showSection('dashboard');
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Check admin authentication
async function checkAdminAuth() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        
        if (!data.authenticated || data.user.role !== 'admin') {
            window.location.href = '/index.html';
            return;
        }
        
        document.getElementById('adminUsername').textContent = data.user.username;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/index.html';
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update page title
            updatePageTitle(this.textContent.trim());
        });
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Update page title
function updatePageTitle(title) {
    document.getElementById('pageTitle').textContent = title;
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        const stats = await Promise.all([
            fetch('/api/admin/stats/customers').then(r => r.json()),
            fetch('/api/admin/stats/revenue').then(r => r.json()),
            fetch('/api/admin/stats/appointments').then(r => r.json()),
            fetch('/api/admin/stats/services').then(r => r.json())
        ]);
        
        // Update dashboard cards
        document.getElementById('totalCustomers').textContent = stats[0].total || 0;
        document.getElementById('monthlyRevenue').textContent = formatCurrency(stats[1].monthly || 0);
        document.getElementById('todayAppointments').textContent = stats[2].today || 0;
        document.getElementById('totalServices').textContent = stats[3].total || 0;
        
        // Update revenue section
        document.getElementById('todayRevenue').textContent = formatCurrency(stats[1].today || 0);
        document.getElementById('weekRevenue').textContent = formatCurrency(stats[1].weekly || 0);
        document.getElementById('monthRevenue').textContent = formatCurrency(stats[1].monthly || 0);
        document.getElementById('yearRevenue').textContent = formatCurrency(stats[1].yearly || 0);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values if API fails
        document.getElementById('totalCustomers').textContent = '0';
        document.getElementById('monthlyRevenue').textContent = '0 VNĐ';
        document.getElementById('todayAppointments').textContent = '0';
        document.getElementById('totalServices').textContent = '0';
    }
}

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch('/api/admin/customers');
        const customers = await response.json();
        
        const tbody = document.querySelector('#customersTable tbody');
        tbody.innerHTML = '';
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.username}</td>
                <td>${customer.email}</td>
                <td><span class="badge badge-${customer.role === 'admin' ? 'danger' : 'info'}">${customer.role}</span></td>
                <td>${formatDate(customer.created_at)}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load services
async function loadServices() {
    try {
        const response = await fetch('/api/admin/services');
        const services = await response.json();
        
        const tbody = document.querySelector('#servicesTable tbody');
        tbody.innerHTML = '';
        
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.description || ''}</td>
                <td>${formatCurrency(service.price)}</td>
                <td>${service.image ? `<img src="${service.image}" width="50" height="50" style="object-fit: cover; border-radius: 4px;">` : 'Không có'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editService(${service.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load appointments
async function loadAppointments() {
    try {
        const response = await fetch('/api/admin/appointments');
        const appointments = await response.json();
        
        const tbody = document.querySelector('#appointmentsTable tbody');
        tbody.innerHTML = '';
        
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.customer_name || appointment.customer_id}</td>
                <td>${appointment.service_name || appointment.service_id}</td>
                <td>${formatDate(appointment.appointment_date)}</td>
                <td>${appointment.appointment_time}</td>
                <td><span class="badge badge-${getStatusColor(appointment.status)}">${appointment.status}</span></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editAppointment(${appointment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appointment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Setup modals
function setupModals() {
    // Service modal
    document.getElementById('saveService').addEventListener('click', saveService);
    
    // Customer modal
    document.getElementById('saveCustomer').addEventListener('click', saveCustomer);
}

// Service functions
function editService(id) {
    // Fetch service data and populate modal
    fetch(`/api/admin/services/${id}`)
        .then(response => response.json())
        .then(service => {
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description || '';
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('serviceImage').value = service.image || '';
            
            const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
            modal.show();
        })
        .catch(error => console.error('Error fetching service:', error));
}

async function saveService() {
    const serviceData = {
        id: document.getElementById('serviceId').value,
        name: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        price: parseFloat(document.getElementById('servicePrice').value),
        image: document.getElementById('serviceImage').value
    };
    
    try {
        const url = serviceData.id ? `/api/admin/services/${serviceData.id}` : '/api/admin/services';
        const method = serviceData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
            modal.hide();
            loadServices();
            showAlert('Dịch vụ đã được lưu thành công!', 'success');
        } else {
            showAlert('Có lỗi xảy ra khi lưu dịch vụ!', 'danger');
        }
    } catch (error) {
        console.error('Error saving service:', error);
        showAlert('Có lỗi xảy ra khi lưu dịch vụ!', 'danger');
    }
}

function deleteService(id) {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
        fetch(`/api/admin/services/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadServices();
                showAlert('Dịch vụ đã được xóa thành công!', 'success');
            } else {
                showAlert('Có lỗi xảy ra khi xóa dịch vụ!', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting service:', error);
            showAlert('Có lỗi xảy ra khi xóa dịch vụ!', 'danger');
        });
    }
}

// Customer functions
function editCustomer(id) {
    fetch(`/api/admin/customers/${id}`)
        .then(response => response.json())
        .then(customer => {
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerUsername').value = customer.username;
            document.getElementById('customerEmail').value = customer.email;
            document.getElementById('customerPassword').value = '';
            document.getElementById('customerRole').value = customer.role;
            
            const modal = new bootstrap.Modal(document.getElementById('customerModal'));
            modal.show();
        })
        .catch(error => console.error('Error fetching customer:', error));
}

async function saveCustomer() {
    const customerData = {
        id: document.getElementById('customerId').value,
        username: document.getElementById('customerUsername').value,
        email: document.getElementById('customerEmail').value,
        password: document.getElementById('customerPassword').value,
        role: document.getElementById('customerRole').value
    };
    
    try {
        const url = customerData.id ? `/api/admin/customers/${customerData.id}` : '/api/admin/customers';
        const method = customerData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
        });
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
            modal.hide();
            loadCustomers();
            showAlert('Khách hàng đã được lưu thành công!', 'success');
        } else {
            showAlert('Có lỗi xảy ra khi lưu khách hàng!', 'danger');
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showAlert('Có lỗi xảy ra khi lưu khách hàng!', 'danger');
    }
}

function deleteCustomer(id) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        fetch(`/api/admin/customers/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadCustomers();
                showAlert('Khách hàng đã được xóa thành công!', 'success');
            } else {
                showAlert('Có lỗi xảy ra khi xóa khách hàng!', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting customer:', error);
            showAlert('Có lỗi xảy ra khi xóa khách hàng!', 'danger');
        });
    }
}

// Appointment functions
function editAppointment(id) {
    // Implementation for editing appointments
    console.log('Edit appointment:', id);
}

function deleteAppointment(id) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
        fetch(`/api/admin/appointments/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadAppointments();
                showAlert('Lịch hẹn đã được xóa thành công!', 'success');
            } else {
                showAlert('Có lỗi xảy ra khi xóa lịch hẹn!', 'danger');
            }
        })
        .catch(error => {
            console.error('Error deleting appointment:', error);
            showAlert('Có lỗi xảy ra khi xóa lịch hẹn!', 'danger');
        });
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function getStatusColor(status) {
    switch (status) {
        case 'confirmed': return 'success';
        case 'pending': return 'warning';
        case 'cancelled': return 'danger';
        case 'completed': return 'info';
        default: return 'secondary';
    }
}

function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/index.html';
    }
}

// Clear modal forms when hidden
document.getElementById('serviceModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
});

document.getElementById('customerModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
});