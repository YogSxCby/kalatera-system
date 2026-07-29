const API_URL = 'http://localhost:3000/api';

// Check authentication on load
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const currentPage = window.location.pathname;
    
    if (!token && currentPage.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
    
    if (token && currentPage.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';
    
    const loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('adminToken', result.data.token);
            localStorage.setItem('adminUser', JSON.stringify(result.data.user));
            alert('✅ Login berhasil!');
            window.location.href = 'dashboard.html';
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Gagal login. Pastikan server backend sudah running.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Login';
    }
});

// Load inquiries for dashboard
async function loadInquiries() {
    const token = localStorage.getItem('adminToken');
    const tableBody = document.getElementById('inquiryTable');
    
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_URL}/inquiries`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateStats(result.data);
            
            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Belum ada inquiry</td></tr>';
                return;
            }
            
            tableBody.innerHTML = result.data.map(inquiry => `
                <tr>
                    <td>#${inquiry.id}</td>
                    <td>${inquiry.customer_name}</td>
                    <td>
                        <a href="https://wa.me/${inquiry.customer_phone}" target="_blank">
                            ${inquiry.customer_phone}
                        </a>
                    </td>
                    <td>${inquiry.product_name || '-'}</td>
                    <td>${inquiry.budget_range || '-'}</td>
                    <td>
                        <span class="badge bg-${getStatusColor(inquiry.status)}">
                            ${inquiry.status}
                        </span>
                    </td>
                    <td>${new Date(inquiry.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openStatusModal(${inquiry.id}, '${inquiry.status}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInquiry(${inquiry.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Gagal memuat data</td></tr>';
        }
    } catch (error) {
        console.error('Error loading inquiries:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error koneksi ke server</td></tr>';
    }
}

// Update stats cards
function updateStats(inquiries) {
    document.getElementById('totalInquiry').textContent = inquiries.length;
    document.getElementById('completedInquiry').textContent = inquiries.filter(i => i.status === 'completed').length;
    document.getElementById('progressInquiry').textContent = inquiries.filter(i => i.status === 'in_progress').length;
    document.getElementById('newInquiry').textContent = inquiries.filter(i => i.status === 'new').length;
}

// Get status badge color
function getStatusColor(status) {
    const colors = {
        'new': 'info',
        'contacted': 'primary',
        'in_progress': 'warning',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

// Open status modal
window.openStatusModal = function(id, currentStatus) {
    document.getElementById('inquiryId').value = id;
    document.getElementById('inquiryStatus').value = currentStatus;
    new bootstrap.Modal(document.getElementById('statusModal')).show();
}

// Save status update
document.getElementById('saveStatusBtn')?.addEventListener('click', async () => {
    const token = localStorage.getItem('adminToken');
    const inquiryId = document.getElementById('inquiryId').value;
    const status = document.getElementById('inquiryStatus').value;
    const notes = document.getElementById('inquiryNotes').value;
    
    try {
        const response = await fetch(`${API_URL}/inquiries/${inquiryId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, notes })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Status berhasil diupdate');
            bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
            loadInquiries();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('❌ Gagal update status');
    }
});

// Delete inquiry
window.deleteInquiry = async function(id) {
    if (!confirm('Yakin ingin menghapus inquiry ini?')) return;
    
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`${API_URL}/inquiries/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Inquiry berhasil dihapus');
            loadInquiries();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        alert('❌ Gagal menghapus inquiry');
    }
}

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Yakin ingin logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'login.html';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadInquiries();
});