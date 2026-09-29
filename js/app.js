import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUCIvX6nR7XpzCc5L55J4WGpCxr6NPeMk",
    authDomain: "perfume-catalog.firebaseapp.com",
    projectId: "perfume-catalog",
    storageBucket: "perfume-catalog.firebasestorage.app",
    messagingSenderId: "898553918018",
    appId: "1:898553918018:web:0b6a02adc082b144cb33db",
    measurementId: "G-JERX65M8W1"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Perfumes Data Cache
let perfumesData = [];

// DOM Elements
const perfumesGrid = document.getElementById('perfumes-grid') || document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const genderFilter = document.getElementById('gender-filter');
const stockFilter = document.getElementById('stock-filter');
const productCount = document.getElementById('product-count');

// Fetch All Documents from "perfumes" Firestore Collection
async function loadPerfumes() {
    if (!perfumesGrid) return;

    // Loading State
    perfumesGrid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div class="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
            <p class="text-sm font-medium text-slate-400">تکایە چاوەڕێ بە، بۆنەکان لە Firestore بار دەکرێن...</p>
        </div>
    `;

    try {
        const querySnapshot = await getDocs(collection(db, "perfumes"));
        perfumesData = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            perfumesData.push({
                id: docSnap.id,
                ...data
            });
        });

        renderProducts(perfumesData);
    } catch (error) {
        console.error('Error fetching perfumes from Firestore:', error);
        perfumesGrid.innerHTML = `
            <div class="col-span-full bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 text-center space-y-3">
                <i class="fa-solid fa-triangle-exclamation text-3xl text-rose-400"></i>
                <h4 class="font-bold text-rose-300 text-base">کێشەیەک لە خوێندنەوەی داتاکان لە Firestore ڕوویدا!</h4>
                <p class="text-xs text-slate-400 max-w-md mx-auto">دڵنیابەوە لە چالاککردنی Firestore Database لە کۆنسۆڵی فایەربەیس و هێڵی ئینتەرنێت.</p>
            </div>
        `;
    }
}

// Dynamically Render Perfume Cards inside #perfumes-grid
function renderProducts(items) {
    if (!perfumesGrid) return;

    perfumesGrid.innerHTML = '';
    if (productCount) {
        productCount.textContent = items.length;
    }

    if (items.length === 0) {
        perfumesGrid.innerHTML = `
            <div class="col-span-full text-center py-16 space-y-3">
                <div class="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 mx-auto text-2xl">
                    <i class="fa-solid fa-box-open"></i>
                </div>
                <p class="text-slate-400 font-medium text-sm">هیچ بۆنێک نەدۆزرایەوە.</p>
                <p class="text-slate-500 text-xs">دەتوانی لە ئادمیین پانێڵەوە بۆنی نوێ بۆ کۆمەڵەکە زیاد بکەیت.</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        // Longevity Stars
        const longevityVal = typeof item.longevity === 'number' ? item.longevity : 5;
        const stars = Array(Math.max(1, Math.min(5, longevityVal)))
            .fill('<i class="fa-solid fa-star text-amber-400 text-xs"></i>')
            .join('');

        // Gender Label Badge
        const genderBadge = item.gender === 'men' ? 'پیاوانە' : item.gender === 'women' ? 'ژنانە' : 'هاوبەش';

        // Price Normalization
        const retailPrice = item.price_retail_100ml ?? item.price_retail ?? item.price ?? 0;
        const wholesalePrice = item.wholesale_per_kg ?? (item.price_raw_oil_tola ? item.price_raw_oil_tola * 10 : null);

        // Top Notes Extraction (handles array or string or nested notes object)
        let topNotesText = 'نۆتی تایبەت';
        if (Array.isArray(item.top_notes) && item.top_notes.length > 0) {
            topNotesText = item.top_notes.join('، ');
        } else if (typeof item.top_notes === 'string' && item.top_notes.trim()) {
            topNotesText = item.top_notes;
        } else if (item.notes && item.notes.top) {
            topNotesText = item.notes.top;
        }

        const cardHtml = `
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div>
                    <!-- Product Image Container -->
                    <div class="h-52 w-full bg-slate-950 flex items-center justify-center p-4 border-b border-slate-800/60 overflow-hidden relative">
                        <a href="product.html?id=${item.id}" class="h-full w-full flex items-center justify-center">
                            <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.title || 'بۆن'}" 
                                 class="h-full object-contain group-hover:scale-110 transition duration-500 filter drop-shadow-lg"
                                 onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid fa-bottle-droplet text-5xl text-amber-500/30\\'></i>';">
                        </a>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Top Badge & Title -->
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <span class="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">${item.brand || 'براندی نێودەوڵەتی'}</span>
                                <a href="product.html?id=${item.id}">
                                    <h4 class="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition mt-1">${item.title || 'بۆنی بێ ناو'}</h4>
                                </a>
                            </div>
                            <span class="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">${genderBadge}</span>
                        </div>

                        <!-- Pyramid Notes Brief -->
                        <div class="text-xs text-slate-400 space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                            <p><strong class="text-slate-300">تۆپ نۆت:</strong> ${topNotesText}</p>
                            <p><strong class="text-slate-300">مانەوە:</strong> ${stars}</p>
                        </div>

                        <!-- Pricing Section -->
                        <div class="flex items-center justify-between pt-2">
                            <div>
                                <span class="text-xs text-slate-400 block">نرخی 100ml:</span>
                                <span class="text-xl font-extrabold text-amber-400">$${retailPrice}</span>
                            </div>
                            ${wholesalePrice ? `
                            <div class="text-left">
                                <span class="text-xs text-slate-400 block">کۆ (kg):</span>
                                <span class="text-sm font-semibold text-slate-300">$${wholesalePrice}</span>
                            </div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Action Button & Details Link -->
                <div class="p-4 bg-slate-950/80 border-t border-slate-800/80 space-y-2">
                    <a href="product.html?id=${item.id}" 
                       class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-200 border border-slate-700">
                        <i class="fa-solid fa-circle-info"></i>
                        بینینی وردەکارییەکان
                    </a>
                    <a href="https://wa.me/?text=${encodeURIComponent('سڵاو، داواکاری بۆنی: ' + (item.title || '') + ' (کۆد: ' + item.id + ')')}" 
                       target="_blank" 
                       class="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-200">
                        <i class="fa-brands fa-whatsapp text-base"></i>
                        داواکردن لە واتسئاپ
                    </a>
                </div>
            </div>
        `;
        perfumesGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Filter Logic
function filterProducts() {
    const query = searchInput?.value.toLowerCase().trim() || '';
    const selectedGender = genderFilter?.value || 'all';
    const isStockOnly = stockFilter?.checked || false;

    const filtered = perfumesData.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const brandMatch = (item.brand || '').toLowerCase().includes(query);
        const matchesSearch = !query || titleMatch || brandMatch;
        const matchesGender = selectedGender === 'all' || item.gender === selectedGender;
        const matchesStock = !isStockOnly || item.in_stock !== false;

        return matchesSearch && matchesGender && matchesStock;
    });

    renderProducts(filtered);
}

// Event Listeners
if (searchInput) searchInput.addEventListener('input', filterProducts);
if (genderFilter) genderFilter.addEventListener('change', filterProducts);
if (stockFilter) stockFilter.addEventListener('change', filterProducts);

// Initial Load
document.addEventListener('DOMContentLoaded', loadPerfumes);