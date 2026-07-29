// API Configuration
const API_URL = 'http://localhost:3000/api';
const WHATSAPP_NUMBER = '6281234567890'; // Ganti dengan nomor Kalatera

// Load products on catalog page
async function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('noProducts');
    
    if (!productGrid) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        loading.classList.add('d-none');
        
        if (result.success && result.data.length > 0) {
            productGrid.innerHTML = result.data.map(product => `
                <div class="col-md-4 mb-4" data-category="${product.category}">
                    <div class="card h-100 shadow-sm">
                        <img src="../assets/images/${product.image_url}" 
                             class="card-img-top" 
                             alt="${product.name}"
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-muted small">${product.description}</p>
                            <p class="mb-1"><strong>Kategori:</strong> ${product.category}</p>
                            <p class="mb-3 text-primary fw-bold">${product.price_range}</p>
                            <div class="d-grid gap-2">
                                <a href="inquiry.html?product_id=${product.id}" class="btn btn-primary">
                                    <i class="bi bi-cart"></i> Pesan
                                </a>
                                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo, saya tertarik dengan ' + product.name)}" 
                                   class="btn btn-success" 
                                   target="_blank">
                                   <i class="bi bi-whatsapp"></i> Tanya via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            noProducts.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loading.classList.add('d-none');
        productGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Gagal memuat katalog. Pastikan backend server sudah running.
                </div>
            </div>
        `;
    }
}

// Load products for select dropdown
async function loadProductOptions() {
    const productSelect = document.getElementById('product_id');
    if (!productSelect) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
            productSelect.innerHTML += result.data.map(product => 
                `<option value="${product.id}">${product.name} - ${product.price_range}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Handle inquiry form submission
document.getElementById('inquiryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Mengirim...';
    
    const formData = {
        customer_name: document.getElementById('customer_name').value,
        customer_phone: document.getElementById('customer_phone').value,
        customer_email: document.getElementById('customer_email').value,
        product_id: document.getElementById('product_id').value || null,
        message: document.getElementById('message').value,
        budget_range: document.getElementById('budget_range').value || null
    };

    try {
        const response = await fetch(`${API_URL}/inquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ ' + result.message);
            // Redirect to WhatsApp
            const whatsappMsg = `Halo, saya ${formData.customer_name}. Saya sudah mengirim inquiry melalui website. ${formData.message}`;
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
            document.getElementById('inquiryForm').reset();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan. Silakan coba lagi atau chat via WhatsApp.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Category filter
document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    const category = e.target.value;
    const products = document.querySelectorAll('#productGrid > div');
    
    products.forEach(product => {
        if (category === '' || product.dataset.category === category) {
            product.classList.remove('d-none');
        } else {
            product.classList.add('d-none');
        }
    });
});

// Auto-fill product from URL parameter
function autoFillProductFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    
    if (productId && document.getElementById('product_id')) {
        document.getElementById('product_id').value = productId;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadProductOptions();
    autoFillProductFromURL();
});