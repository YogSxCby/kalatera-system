const API_URL = 'http://localhost:3000/api';
const IMG_URL = 'assets/images/products/';
const WA_NUMBER = '62895329398808';

let searchTimeout = null;

// Load products
async function loadProducts(searchQuery = '') {
    const productGrid = document.getElementById('productGrid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');
    
    try {
        loading.classList.remove('d-none');
        productGrid.innerHTML = '';
        noResults.classList.add('d-none');
        
        // Build URL
        let url = `${API_URL}/products`;
        if (searchQuery) {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        const res = await fetch(url);
        const result = await res.json();
        
        loading.classList.add('d-none');
        
        if (result.success && result.data.length > 0) {
            productGrid.innerHTML = result.data.map(p => `
                <div class="col-md-4 mb-4">
                    <div class="card product-card h-100 shadow-sm">
                        <img src="${IMG_URL}${p.primary_image}" class="product-img" onclick="window.location.href='detail.html?id=${p.id}'">
                        <div class="card-body d-flex flex-column">
                            <span class="badge bg-secondary mb-2 w-75">${p.category}</span>
                            <h5 class="card-title fw-bold">${p.name}</h5>
                            <p class="card-text text-muted small flex-grow-1">${p.description}</p>
                            <p class="price-tag mb-3 fw-bold">${p.price}</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm fw-bold" onclick="window.location.href='detail.html?id=${p.id}'">
                                    <i class="bi bi-images"></i> Lihat ${p.image_count} Foto
                                </button>
                                <a href="https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Kalatera.Interior, saya tertarik dengan produk: ' + p.name + '. Mohon infonya.')}" 
                                   class="btn btn-lg w-100 fw-bold" 
                                   style="background-color: #25D366; color: white; border: none;"
                                   target="_blank">
                                    <i class="bi bi-whatsapp"></i> Pesan via WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            noResults.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Error loading products:', err);
        loading.classList.add('d-none');
        productGrid.innerHTML = '<div class="col-12"><div class="alert alert-danger">Gagal memuat data. Pastikan backend running.</div></div>';
    }
}

// Search dengan debounce
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    searchTimeout = setTimeout(() => {
        loadProducts(query);
    }, 300);
});

// Clear search
document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    loadProducts('');
    document.getElementById('searchInput').focus();
});

// Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loadProducts(e.target.value.trim());
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts('');
});