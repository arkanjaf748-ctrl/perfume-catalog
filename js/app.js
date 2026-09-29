import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ImgBB API Key
const IMGBB_API_KEY = "18ac6ddff9fe96cb1adc2a85566f0f83";

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
const authButtonsContainer = document.getElementById('auth-buttons');
const adminStatusIndicator = document.getElementById('admin-status-indicator');

// Modals
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const closeLoginBtn = document.getElementById('close-login-btn');

const editModal = document.getElementById('edit-perfume-modal');
const editForm = document.getElementById('edit-perfume-form');
const closeEditBtn = document.getElementById('close-edit-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

// Authentication Helper
function isAdmin() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
}

// Render Auth Header Buttons
function updateAuthUI() {
    if (!authButtonsContainer) return;

    if (isAdmin()) {
        authButtonsContainer.innerHTML = `
            <span class="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                <i class="fa-solid fa-shield-halved"></i>
                <span>arkan</span>
            </span>
            <a href="admin.html" class="text-xs bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700/80 px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm">
                <i class="fa-solid fa-user-shield text-amber-400"></i>
                <span class="hidden sm:inline">پانێڵی ئادمیین</span>
            </a>
            <button id="btn-logout" type="button" class="text-xs bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm" title="Log Out">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>دەروون</span>
            </button>
        `;

        if (adminStatusIndicator) adminStatusIndicator.classList.remove('hidden');

        // Bind logout event
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        authButtonsContainer.innerHTML = `
            <button id="btn-open-login" type="button" class="text-xs bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-700/80 px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm">
                <i class="fa-solid fa-lock text-amber-400"></i>
                <span>چوونەژوورەوەی ئادمیین</span>
            </button>
        `;

        if (adminStatusIndicator) adminStatusIndicator.classList.add('hidden');

        // Bind login open event
        const openLoginBtn = document.getElementById('btn-open-login');
        if (openLoginBtn) {
            openLoginBtn.addEventListener('click', () => {
                if (loginModal) {
                    loginModal.classList.remove('hidden');
                    const usernameInput = document.getElementById('login-username');
                    if (usernameInput) usernameInput.focus();
                }
            });
        }
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('isAdminLoggedIn');
    updateAuthUI();
    renderProducts(perfumesData);
}

// Setup Login Modal Logic
function setupLoginModal() {
    if (closeLoginBtn && loginModal) {
        closeLoginBtn.addEventListener('click', () => {
            loginModal.classList.add('hidden');
            if (loginError) loginError.classList.add('hidden');
        });

        // Click outside modal dialog to close
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.add('hidden');
                if (loginError) loginError.classList.add('hidden');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username')?.value.trim();
            const password = document.getElementById('login-password')?.value;

            // Strict credentials check
            if (username === 'arkan' && password === 'arkan123') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                loginForm.reset();
                if (loginError) loginError.classList.add('hidden');
                if (loginModal) loginModal.classList.add('hidden');
                updateAuthUI();
                renderProducts(perfumesData);
            } else {
                if (loginError) {
                    loginError.classList.remove('hidden');
                }
            }
        });
    }
}

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
                <p class="text-xs text-slate-400 max-w-md mx-auto">دڵنیابەوە لە هێڵی ئینتەرنێت و ڕێکخستنی دەستپێڕاگەیشتن بە داتابەیس.</p>
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
                <p class="text-slate-500 text-xs">دەتوانی لە ئادمیین پانێڵەوە بۆنی نوێ زیاد بکەیت.</p>
            </div>
        `;
        return;
    }

    const adminActive = isAdmin();

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

        // Top Notes Extraction
        let topNotesText = 'نۆتی تایبەت';
        if (Array.isArray(item.top_notes) && item.top_notes.length > 0) {
            topNotesText = item.top_notes.join('، ');
        } else if (typeof item.top_notes === 'string' && item.top_notes.trim()) {
            topNotesText = item.top_notes;
        } else if (item.notes && item.notes.top) {
            topNotesText = item.notes.top;
        }

        // Admin Actions Menu (if logged in)
        const adminActionsHtml = adminActive ? `
            <div class="absolute top-3 left-3 z-30 admin-menu-container">
                <button type="button" class="btn-toggle-admin-menu w-8 h-8 rounded-full bg-slate-950/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center transition shadow-lg" title="کردارەکانی ئادمیین (Edit/Delete)">
                    <i class="fa-solid fa-gear text-xs"></i>
                </button>
                <div class="admin-dropdown-menu hidden absolute left-0 mt-1.5 w-36 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-1 z-40 divide-y divide-slate-800/80">
                    <button type="button" class="btn-action-edit w-full px-3 py-2 text-right text-xs text-amber-400 hover:bg-slate-800 flex items-center gap-2 transition" data-id="${item.id}">
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                        <span>دەستکاریکردن</span>
                    </button>
                    <button type="button" class="btn-action-delete w-full px-3 py-2 text-right text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition" data-id="${item.id}">
                        <i class="fa-solid fa-trash text-xs"></i>
                        <span>ڕەشکردنەوە</span>
                    </button>
                </div>
            </div>
        ` : '';

        const cardHtml = `
            <div class="perfume-card bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group shadow-lg relative">
                
                ${adminActionsHtml}

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
                                    <h4 class="text-base sm:text-lg font-bold text-slate-100 group-hover:text-amber-400 transition mt-1">${item.title || 'بۆنی بێ ناو'}</h4>
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

    attachCardEventListeners();
}

// Attach Event Listeners to Cards (Admin Dropdowns, Edit & Delete)
function attachCardEventListeners() {
    // Toggle Dropdown Menu
    document.querySelectorAll('.btn-toggle-admin-menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = btn.closest('.admin-menu-container');
            const menu = container.querySelector('.admin-dropdown-menu');

            // Close all other dropdowns
            document.querySelectorAll('.admin-dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.add('hidden');
            });

            menu.classList.toggle('hidden');
        });
    });

    // Handle Delete Button
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await handleDeletePerfume(id);
        });
    });

    // Handle Edit Button
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openEditModal(id);
        });
    });
}

// Global Document Click to Close Dropdowns
document.addEventListener('click', () => {
    document.querySelectorAll('.admin-dropdown-menu').forEach(m => m.classList.add('hidden'));
});

// Delete Perfume Function
async function handleDeletePerfume(id) {
    if (!id) return;
    if (!confirm("دڵنیایت لە ڕەشکردنەوەی ئەم بۆنە لە داتابەیس؟ ئەم کردارە ناگەڕێتەوە.")) return;

    try {
        await deleteDoc(doc(db, "perfumes", id));
        alert("بۆنەکە بە سەرکەوتوویی ڕەشکرایەوە!");
        await loadPerfumes();
    } catch (error) {
        console.error("Error deleting perfume:", error);
        alert("کێشەیەک ڕوویدا لە ڕەشکردنەوەی بۆنەکە: " + (error.message || ''));
    }
}

// Open Edit Modal with Pre-filled Data
function openEditModal(id) {
    const item = perfumesData.find(p => p.id === id);
    if (!item || !editModal) return;

    document.getElementById('edit-perfume-id').value = id;
    document.getElementById('edit-title').value = item.title || '';
    document.getElementById('edit-brand').value = item.brand || '';
    document.getElementById('edit-price-retail').value = item.price_retail_100ml ?? item.price_retail ?? '';
    document.getElementById('edit-price-raw').value = item.wholesale_per_kg ? item.wholesale_per_kg / 10 : (item.price_raw_oil_tola || '');
    document.getElementById('edit-gender').value = item.gender || 'men';

    // Top, middle, base notes
    const topNotes = Array.isArray(item.top_notes) ? item.top_notes.join('، ') : (item.notes?.top || item.top_notes || '');
    const middleNotes = Array.isArray(item.heart_notes) ? item.heart_notes.join('، ') : (item.notes?.middle || item.heart_notes || '');
    const baseNotes = Array.isArray(item.base_notes) ? item.base_notes.join('، ') : (item.notes?.base || item.base_notes || '');

    document.getElementById('edit-note-top').value = topNotes;
    document.getElementById('edit-note-middle').value = middleNotes;
    document.getElementById('edit-note-base').value = baseNotes;

    // Image URL & File
    document.getElementById('edit-image-url').value = item.image || '';
    const fileInput = document.getElementById('edit-image-file');
    if (fileInput) fileInput.value = '';

    editModal.classList.remove('hidden');
}

// Setup Edit Modal Events
function setupEditModal() {
    if (!editModal) return;

    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    }
    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', () => editModal.classList.add('hidden'));
    }

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.add('hidden');
    });

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const saveBtn = document.getElementById('edit-save-btn');
            const originalSaveBtnText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.disabled = true;
            }

            const id = document.getElementById('edit-perfume-id').value;
            const fileInput = document.getElementById('edit-image-file');
            const file = fileInput?.files?.[0];
            let finalImageUrl = document.getElementById('edit-image-url').value.trim();

            // If new file chosen, upload to ImgBB
            if (file) {
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-spin ml-1.5"></i> لەبارکردنی وێنە بۆ ImgBB...';
                }
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                        throw new Error(result.error?.message || 'کێشە لە بارکردنی وێنە');
                    }
                    finalImageUrl = result.data.url;
                } catch (uploadErr) {
                    console.error("Error uploading to ImgBB during edit:", uploadErr);
                    alert("کێشەیەک ڕوویدا لە بارکردنی وێنەکە بۆ ImgBB: " + (uploadErr.message || ''));
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = originalSaveBtnText;
                    }
                    return;
                }
            }

            if (!finalImageUrl) {
                finalImageUrl = 'assets/images/placeholder.png';
            }

            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-1.5"></i> لە پاشەکەوتکردندایە...';
            }

            const topNotesVal = document.getElementById('edit-note-top').value.trim();
            const middleNotesVal = document.getElementById('edit-note-middle').value.trim();
            const baseNotesVal = document.getElementById('edit-note-base').value.trim();
            const rawOilPrice = parseFloat(document.getElementById('edit-price-raw').value) || 0;

            const updatedData = {
                title: document.getElementById('edit-title').value.trim(),
                brand: document.getElementById('edit-brand').value.trim(),
                price_retail_100ml: parseFloat(document.getElementById('edit-price-retail').value) || 0,
                price_raw_oil_tola: rawOilPrice,
                wholesale_per_kg: rawOilPrice * 10,
                gender: document.getElementById('edit-gender').value,
                top_notes: topNotesVal ? topNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
                heart_notes: middleNotesVal ? middleNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
                base_notes: baseNotesVal ? baseNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
                notes: {
                    top: topNotesVal,
                    middle: middleNotesVal,
                    base: baseNotesVal
                },
                image: finalImageUrl,
                updatedAt: new Date().toISOString()
            };

            try {
                await updateDoc(doc(db, "perfumes", id), updatedData);
                alert("بۆنەکە بە سەرکەوتوویی نوێکرایەوە!");
                editModal.classList.add('hidden');
                await loadPerfumes();
            } catch (err) {
                console.error("Error updating document:", err);
                alert("کێشەیەک ڕوویدا لە کاتی پاشەکەوتکردنی گۆڕانکارییەکان: " + (err.message || ''));
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalSaveBtnText;
                }
            }
        });
    }
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
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    setupLoginModal();
    setupEditModal();
    loadPerfumes();
});