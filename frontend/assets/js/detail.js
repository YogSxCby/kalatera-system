// Konfigurasi
const API_URL = '/api';
const IMAGE_BASE_URL = '/assets/images/products/';
const WA_NUMBER = '62895329398808';

let images = [];
let currentIndex = 0;
let isZoomed = false;

// Load detail produk
async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('🔍 Loading product ID:', productId);
    
    if (!productId) {
        showError();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        const result = await response.json();
        
        console.log('✅ API Response:', result);
        
        document.getElementById('loading').classList.add('d-none');
        
        if (result.success && result.data) {
            const product = result.data;
            images = product.images || [];
            
            console.log('📸 Total images:', images.length);
            console.log('📸 Image list:', images);
            
            currentIndex = 0;
            
            // Update info produk
            document.getElementById('pName').textContent = product.name;
            document.getElementById('pCategory').textContent = product.category;
            document.getElementById('pPrice').textContent = product.price;
            document.getElementById('pDesc').textContent = product.description;
            
            // Tampilkan satuan harga
            const unitBadge = document.getElementById('unitBadge');
            if (unitBadge) {
                if (product.price.includes('m¹')) {
                    unitBadge.innerHTML = '<i class="bi bi-rulers"></i> Harga per Meter Lari (m¹)';
                } else if (product.price.includes('m²')) {
                    unitBadge.innerHTML = '<i class="bi bi-rulers"></i> Harga per Meter Persegi (m²)';
                } else {
                    document.getElementById('priceUnit').style.display = 'none';
                }
            }
            
            // Update tombol WhatsApp
            const waMessage = `Halo Kalatera.Interior, saya tertarik dengan produk: ${product.name}. Mohon informasinya.`;
            document.getElementById('waBtn').href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;
            
            // Load gambar
            loadImages();
            
            // Tampilkan konten
            document.getElementById('content').classList.remove('d-none');
        } else {
            showError();
        }
    } catch (error) {
        console.error('❌ Error:', error);
        document.getElementById('loading').classList.add('d-none');
        showError();
    }
}

// Load semua gambar dengan error handling
function loadImages() {
    if (images.length === 0) {
        console.warn('⚠️ No images found for this product');
        return;
    }
    
    console.log('🖼️ Loading', images.length, 'images');
    
    updateMainImage();
    
    const thumbContainer = document.getElementById('thumbContainer');
    
    if (images.length > 1) {
        thumbContainer.innerHTML = images.map((img, index) => {
            const imageUrl = `${IMAGE_BASE_URL}${img.image_url}`;
            console.log(`🖼️ Thumbnail ${index + 1}:`, imageUrl);
            
            return `
                <img src="${imageUrl}" 
                     class="thumb ${index === 0 ? 'active' : ''}" 
                     alt="Foto ${index + 1}"
                     onclick="changeImage(${index})"
                     onerror="console.error('❌ Failed to load:', '${imageUrl}'); this.style.opacity='0.3'; this.title='Gambar tidak ditemukan: ${img.image_url}'">
            `;
        }).join('');
        thumbContainer.style.display = 'flex';
    } else {
        thumbContainer.style.display = 'none';
    }
    
    updateNavigationButtons();
}

// Update gambar utama
function updateMainImage() {
    const mainImage = document.getElementById('mainImg');
    const imageUrl = `${IMAGE_BASE_URL}${images[currentIndex].image_url}`;
    
    console.log(`🖼️ Main image ${currentIndex + 1}:`, imageUrl);
    
    mainImage.src = imageUrl;
    mainImage.alt = `Foto produk ${currentIndex + 1}`;
    
    // Error handler untuk gambar utama
    mainImage.onerror = function() {
        console.error('❌ Failed to load main image:', imageUrl);
        this.src = 'https://via.placeholder.com/400x500?text=Gambar+Tidak+Ditemukan';
    };
    
    // Update thumbnail active state
    document.querySelectorAll('.thumb').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentIndex);
    });
    
    // Reset zoom
    isZoomed = false;
    mainImage.classList.remove('zoomed');
}

// Update tombol navigasi
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }
}

// Ganti gambar
window.changeImage = function(index) {
    if (index >= 0 && index < images.length) {
        currentIndex = index;
        updateMainImage();
    }
};

// Tombol Previous
document.getElementById('prevBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateMainImage();
});

// Tombol Next
document.getElementById('nextBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
    updateMainImage();
});

// Zoom gambar
document.getElementById('mainImg')?.addEventListener('click', function() {
    if (images.length > 0) {
        isZoomed = !isZoomed;
        this.classList.toggle('zoomed', isZoomed);
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (document.getElementById('content').classList.contains('d-none')) return;
    if (images.length <= 1) return;
    
    if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateMainImage();
    } else if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % images.length;
        updateMainImage();
    } else if (e.key === 'Escape' && isZoomed) {
        isZoomed = false;
        document.getElementById('mainImg').classList.remove('zoomed');
    }
});

// Tampilkan error
function showError() {
    document.getElementById('loading').classList.add('d-none');
    document.getElementById('content').classList.add('d-none');
    document.getElementById('error').classList.remove('d-none');
}

// Initialize
document.addEventListener('DOMContentLoaded', loadProductDetail);