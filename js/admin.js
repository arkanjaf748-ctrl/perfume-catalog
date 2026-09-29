import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ImgBB API Configuration
const IMGBB_API_KEY = "18ac6ddff9fe96cb1adc2a85566f0f83";

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const authGuard = document.getElementById('admin-auth-guard');
const mainDashboard = document.getElementById('admin-main-dashboard');
const guardLoginForm = document.getElementById('admin-guard-login-form');
const guardError = document.getElementById('guard-error');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminRefreshBtn = document.getElementById('admin-refresh-btn');

const listContainer = document.getElementById('admin-products-list');
const addForm = document.getElementById('add-perfume-form');

// Edit Modal Elements
const editModal = document.getElementById('admin-edit-modal');
const editForm = document.getElementById('admin-edit-form');
const closeEditBtn = document.getElementById('close-admin-edit-btn');
const editCancelBtn = document.getElementById('admin-edit-cancel-btn');

let adminProductsCache = [];

// Authentication Checker
function isAdmin() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
}

// Check & Apply Auth Guard
function checkAdminAuth() {
    if (isAdmin()) {
        if (authGuard) authGuard.classList.add('hidden');
        if (mainDashboard) mainDashboard.classList.remove('hidden');
        loadAdminProducts();
    } else {
        if (authGuard) authGuard.classList.remove('hidden');
        if (mainDashboard) mainDashboard.classList.add('hidden');
    }
}

// Setup Auth Guard Events
function setupAuthGuard() {
    if (guardLoginForm) {
        guardLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('guard-username')?.value.trim();
            const password = document.getElementById('guard-password')?.value;

            // Strict credentials check
            if (username === 'arkan' && password === 'arkan123') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                if (guardError) guardError.classList.add('hidden');
                guardLoginForm.reset();
                checkAdminAuth();
            } else {
                if (guardError) guardError.classList.remove('hidden');
            }
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminLoggedIn');
            checkAdminAuth();
        });
    }

    if (adminRefreshBtn) {
        adminRefreshBtn.addEventListener('click', () => {
            loadAdminProducts();
        });
    }
}

// Fetch & Render Products in Admin Panel
export async function loadAdminProducts() {
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div class="w-4 h-4 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
            <span>لە بارکردنی بەرهەمەکان لە Firestore...</span>
        </div>
    `;

    try {
        const querySnapshot = await getDocs(collection(db, "perfumes"));
        listContainer.innerHTML = '';
        adminProductsCache = [];

        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="py-8 text-center space-y-2">
                    <p class="text-xs text-slate-500">هیچ بەرهەمێک لە کاتالۆگی Firestore تۆمار نەکراوە.</p>
                </div>
            `;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            adminProductsCache.push({ id, ...data });

            const retailPrice = data.price_retail_100ml ?? data.price_retail ?? data.price ?? 0;
            const genderLabel = data.gender === 'men' ? 'پیاوانە' : data.gender === 'women' ? 'ژنانە' : 'هاوبەش';

            const itemHtml = `
                <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 last:border-0 hover:bg-slate-950/40 px-2 rounded-xl transition">
                    <div class="flex items-center gap-3">
                        <img src="${data.image || 'assets/images/placeholder.png'}" 
                             class="w-12 h-12 object-contain bg-slate-950 rounded-lg p-1 border border-slate-800 flex-shrink-0" 
                             onerror="this.src='assets/images/placeholder.png';">
                        <div>
                            <h4 class="font-bold text-sm text-slate-100 flex items-center gap-2">
                                ${data.title || 'بۆنی بێ ناو'} 
                                <span class="text-xs font-normal text-amber-400">(${data.brand || 'بێ براند'})</span>
                            </h4>
                            <p class="text-xs text-slate-400 mt-0.5">
                                <span class="text-amber-300 font-semibold">$${retailPrice}</span>
                                <span class="text-slate-600 mx-1">•</span>
                                <span>${genderLabel}</span>
                                <span class="text-slate-600 mx-1">•</span>
                                <span class="text-[10px] text-slate-500 font-mono">ID: ${id}</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 self-end sm:self-center">
                        <a href="product.html?id=${id}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1">
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            <span>بینین</span>
                        </a>
                        <button type="button" data-edit-id="${id}" class="btn-edit-item text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1">
                            <i class="fa-solid fa-pen-to-square"></i>
                            <span>دەستکاری</span>
                        </button>
                        <button type="button" data-delete-id="${id}" class="btn-delete-item text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1">
                            <i class="fa-solid fa-trash"></i>
                            <span>سڕینەوە</span>
                        </button>
                    </div>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
    } catch (error) {
        console.error("Error loading products from Firestore:", error);
        listContainer.innerHTML = `
            <div class="p-4 text-center text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                <p class="font-bold">کێشەیەک ڕوویدا لە کاتی بارکردنی بەرهەمەکان.</p>
                <p class="text-[11px] text-slate-400">دڵنیابەوە لەوەی Firestore Database چالاک کراوە و یاساکانی ڕێگەپێدانی دەستپێڕاگەیشتن دروستن.</p>
            </div>
        `;
    }
}

// Add New Perfume Form Handling
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = addForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
        }

        const fileInput = document.getElementById('perfume-image-file');
        const urlInput = document.getElementById('perfume-image-url') || document.getElementById('image_url');
        const file = fileInput?.files?.[0];
        const imageUrlVal = urlInput?.value.trim() || '';

        let finalImageUrl = imageUrlVal;

        // 1. Upload file to ImgBB API if selected
        if (file) {
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-spin ml-2"></i> لەبارکردنی وێنە بۆ ImgBB...';
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
                    throw new Error(result.error?.message || 'کێشەیەک لە بارکردنی وێنە بۆ ImgBB ڕوویدا');
                }

                finalImageUrl = result.data.url;
            } catch (imgbbError) {
                console.error("Error uploading to ImgBB:", imgbbError);
                alert("کێشەیەک ڕوویدا لە کاتی بارکردنی وێنە بۆ ImgBB: " + (imgbbError.message || 'Error'));
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                return;
            }
        }

        if (!finalImageUrl) {
            finalImageUrl = 'assets/images/placeholder.png';
        }

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-2"></i> لە پاشەکەوتکردندایە...';
        }

        const topNotesVal = document.getElementById('note_top').value.trim();
        const middleNotesVal = document.getElementById('note_middle').value.trim();
        const baseNotesVal = document.getElementById('note_base').value.trim();
        const rawOilPrice = parseFloat(document.getElementById('price_raw').value) || 0;

        const newPerfume = {
            title: document.getElementById('title').value.trim(),
            brand: document.getElementById('brand').value.trim(),
            price_retail_100ml: parseFloat(document.getElementById('price_retail').value) || 0,
            price_raw_oil_tola: rawOilPrice,
            wholesale_per_kg: rawOilPrice * 10,
            gender: document.getElementById('gender').value,
            top_notes: topNotesVal ? topNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            heart_notes: middleNotesVal ? middleNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            base_notes: baseNotesVal ? baseNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            notes: {
                top: topNotesVal,
                middle: middleNotesVal,
                base: baseNotesVal
            },
            image: finalImageUrl,
            longevity: 5,
            sillage: 5,
            in_stock: true,
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "perfumes"), newPerfume);
            alert("بەرهەمەکە بە سەرکەوتوویی لە Firestore زیادکرا!");
            addForm.reset();
            await loadAdminProducts();
        } catch (error) {
            console.error("Error adding document to Firestore:", error);
            alert("کێشەیەک ڕوویدا لە کاتی زیادکردنی بەرهەم: " + (error.message || 'Error'));
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
}

// Delete Perfume by Document ID
export async function deletePerfume(id) {
    if (!id) return;
    if (confirm("دڵنیایت لە ڕەشکردنەوەی ئەم بەرهەمە لە داتابەیسی Firestore؟")) {
        try {
            await deleteDoc(doc(db, "perfumes", id));
            await loadAdminProducts();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("کێشەیەک ڕوویدا لە سڕینەوەی بەرهەمەکە: " + (error.message || 'Error'));
        }
    }
}
window.deletePerfume = deletePerfume;

// Open Edit Modal for Admin
function openAdminEditModal(id) {
    const item = adminProductsCache.find(p => p.id === id);
    if (!item || !editModal) return;

    document.getElementById('admin-edit-id').value = id;
    document.getElementById('admin-edit-title').value = item.title || '';
    document.getElementById('admin-edit-brand').value = item.brand || '';
    document.getElementById('admin-edit-price-retail').value = item.price_retail_100ml ?? item.price_retail ?? '';
    document.getElementById('admin-edit-price-raw').value = item.wholesale_per_kg ? item.wholesale_per_kg / 10 : (item.price_raw_oil_tola || '');
    document.getElementById('admin-edit-gender').value = item.gender || 'men';

    const topNotes = Array.isArray(item.top_notes) ? item.top_notes.join('، ') : (item.notes?.top || item.top_notes || '');
    const middleNotes = Array.isArray(item.heart_notes) ? item.heart_notes.join('، ') : (item.notes?.middle || item.heart_notes || '');
    const baseNotes = Array.isArray(item.base_notes) ? item.base_notes.join('، ') : (item.notes?.base || item.base_notes || '');

    document.getElementById('admin-edit-note-top').value = topNotes;
    document.getElementById('admin-edit-note-middle').value = middleNotes;
    document.getElementById('admin-edit-note-base').value = baseNotes;

    document.getElementById('admin-edit-image-url').value = item.image || '';
    const fileInput = document.getElementById('admin-edit-image-file');
    if (fileInput) fileInput.value = '';

    editModal.classList.remove('hidden');
}

// Setup Admin Edit Modal Events
function setupAdminEditModal() {
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

            const saveBtn = document.getElementById('admin-edit-save-btn');
            const originalSaveBtnText = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) saveBtn.disabled = true;

            const id = document.getElementById('admin-edit-id').value;
            const fileInput = document.getElementById('admin-edit-image-file');
            const file = fileInput?.files?.[0];
            let finalImageUrl = document.getElementById('admin-edit-image-url').value.trim();

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

            if (!finalImageUrl) finalImageUrl = 'assets/images/placeholder.png';

            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-1.5"></i> لە پاشەکەوتکردندایە...';
            }

            const topNotesVal = document.getElementById('admin-edit-note-top').value.trim();
            const middleNotesVal = document.getElementById('admin-edit-note-middle').value.trim();
            const baseNotesVal = document.getElementById('admin-edit-note-base').value.trim();
            const rawOilPrice = parseFloat(document.getElementById('admin-edit-price-raw').value) || 0;

            const updatedData = {
                title: document.getElementById('admin-edit-title').value.trim(),
                brand: document.getElementById('admin-edit-brand').value.trim(),
                price_retail_100ml: parseFloat(document.getElementById('admin-edit-price-retail').value) || 0,
                price_raw_oil_tola: rawOilPrice,
                wholesale_per_kg: rawOilPrice * 10,
                gender: document.getElementById('admin-edit-gender').value,
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
                alert("بۆنەکە بە سەرکەوتوویی دەستکاری کرا!");
                editModal.classList.add('hidden');
                await loadAdminProducts();
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

// Event Delegation for List Container Buttons (Delete & Edit)
if (listContainer) {
    listContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('[data-delete-id]');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-delete-id');
            deletePerfume(id);
            return;
        }

        const editBtn = e.target.closest('[data-edit-id]');
        if (editBtn) {
            const id = editBtn.getAttribute('data-edit-id');
            openAdminEditModal(id);
        }
    });
}

// Initial Load & Auth Check
document.addEventListener('DOMContentLoaded', () => {
    setupAuthGuard();
    setupAdminEditModal();
    checkAdminAuth();
});