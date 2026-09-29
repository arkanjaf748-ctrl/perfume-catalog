// Global Perfumes Data
let perfumesData = [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const genderFilter = document.getElementById('gender-filter');
const stockFilter = document.getElementById('stock-filter');
const productCount = document.getElementById('product-count');

// Fetch JSON Data
async function loadPerfumes() {
    try {
        const response = await fetch('data/perfumes.json');
        perfumesData = await response.json();
        renderProducts(perfumesData);
    } catch (error) {
        console.error('Error loading perfume data:', error);
        productGrid.innerHTML = `<p class="text-rose-500 col-span-full text-center">کێشەیەک لە خوێندنەوەی داتاکان ڕوویدا!</p>`;
    }
}

// Render Product Cards
function renderProducts(items) {
    productGrid.innerHTML = '';
    productCount.textContent = items.length;

    if (items.length === 0) {
        productGrid.innerHTML = `<p class="text-slate-500 col-span-full text-center py-12">هیچ بۆنێک بەم تایبەتمەندییانە نەدۆزرایەوە.</p>`;
        return;
    }

    items.forEach(item => {
        // Star Rating Generation
        const stars = Array(item.longevity).fill('<i class="fa-solid fa-star text-amber-400 text-xs"></i>').join('');
        
        // Gender Label Badge
        const genderBadge = item.gender === 'men' ? 'پیاوانە' : item.gender === 'women' ? 'ژنانە' : 'هاوبەش';

        // Card HTML with Image Box
        const cardHtml = `
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div>
                    <!-- Product Image Container -->
                    <div class="h-52 w-full bg-slate-950 flex items-center justify-center p-4 border-b border-slate-800/60 overflow-hidden relative">
                        <img src="${item.image}" alt="${item.title}" 
                             class="h-full object-contain group-hover:scale-110 transition duration-500 filter drop-shadow-lg"
                             onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\'fa-solid fa-bottle-droplet text-5xl text-amber-500/30\'></i>';">
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Top Badge & Title -->
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <span class="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">${item.brand}</span>
                                <a href="product.html?id=${item.id}">
                                    <h4 class="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition mt-1">${item.title}</h4>
                                </a>
                            </div>
                            <span class="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">${genderBadge}</span>
                        </div>

                        <!-- Pyramid Notes Brief -->
                        <div class="text-xs text-slate-400 space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                            <p><strong class="text-slate-300">تۆپ نۆت:</strong> ${item.top_notes.join('، ')}</p>
                            <p><strong class="text-slate-300">مانەوە:</strong> ${stars}</p>
                        </div>

                        <!-- Pricing Section -->
                        <div class="flex items-center justify-between pt-2">
                            <div>
                                <span class="text-xs text-slate-400 block">نرخی 100ml:</span>
                                <span class="text-xl font-extrabold text-amber-400">$${item.price_retail_100ml}</span>
                            </div>
                            <div class="text-left">
                                <span class="text-xs text-slate-400 block">کۆ (kg):</span>
                                <span class="text-sm font-semibold text-slate-300">$${item.wholesale_per_kg}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="p-4 bg-slate-950/80 border-t border-slate-800/80">
                    <a href="https://wa.me/?text=${encodeURIComponent('سڵاو، داواکاری بۆنی: ' + item.title + ' (کۆد: ' + item.id + ')')}" 
                       target="_blank" 
                       class="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-200">
                        <i class="fa-brands fa-whatsapp text-base"></i>
                        داواکردن لە واتسئاپ
                    </a>
                </div>
            </div>
        `;
        productGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Filter Logic
function filterProducts() {
    const query = searchInput.value.toLowerCase();
    const selectedGender = genderFilter.value;
    const isStockOnly = stockFilter.checked;

    const filtered = perfumesData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query);
        const matchesGender = selectedGender === 'all' || item.gender === selectedGender;
        const matchesStock = !isStockOnly || item.in_stock;

        return matchesSearch && matchesGender && matchesStock;
    });

    renderProducts(filtered);
}

// Event Listeners
searchInput.addEventListener('input', filterProducts);
genderFilter.addEventListener('change', filterProducts);
stockFilter.addEventListener('change', filterProducts);

// Initial Load
document.addEventListener('DOMContentLoaded', loadPerfumes);