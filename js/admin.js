import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const listContainer = document.getElementById('admin-products-list');
const addForm = document.getElementById('add-perfume-form');

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

            const retailPrice = data.price_retail_100ml ?? data.price_retail ?? data.price ?? 0;
            const genderLabel = data.gender === 'men' ? 'پیاوانە' : data.gender === 'women' ? 'ژنانە' : 'هاوبەش';

            const itemHtml = `
                <div class="py-3 flex items-center justify-between gap-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-950/40 px-2 rounded-xl transition">
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
                    <div class="flex items-center gap-2">
                        <a href="product.html?id=${id}" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1">
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            پیشاندان
                        </a>
                        <button type="button" data-delete-id="${id}" class="btn-delete text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                            <i class="fa-solid fa-trash"></i>
                            سڕینەوە
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
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-2"></i> لە پاشەکەوتکردندایە...';
        }

        const topNotesVal = document.getElementById('note_top').value.trim();
        const middleNotesVal = document.getElementById('note_middle').value.trim();
        const baseNotesVal = document.getElementById('note_base').value.trim();

        const newPerfume = {
            title: document.getElementById('title').value.trim(),
            brand: document.getElementById('brand').value.trim(),
            price_retail_100ml: parseFloat(document.getElementById('price_retail').value) || 0,
            price_raw_oil_tola: parseFloat(document.getElementById('price_raw').value) || 0,
            wholesale_per_kg: (parseFloat(document.getElementById('price_raw').value) || 0) * 10,
            gender: document.getElementById('gender').value,
            top_notes: topNotesVal ? topNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            heart_notes: middleNotesVal ? middleNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            base_notes: baseNotesVal ? baseNotesVal.split(/[،,]/).map(s => s.trim()).filter(Boolean) : [],
            notes: {
                top: topNotesVal,
                middle: middleNotesVal,
                base: baseNotesVal
            },
            image: document.getElementById('image_url').value.trim() || 'assets/images/placeholder.png',
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
    if (confirm("دڵنیایت لە سڕینەوەی ئەم بەرهەمە لە داتابەیسی Firestore؟")) {
        try {
            await deleteDoc(doc(db, "perfumes", id));
            await loadAdminProducts();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("کێشەیەک ڕوویدا لە سڕینەوەی بەرهەمەکە: " + (error.message || 'Error'));
        }
    }
}

// Expose deletePerfume globally on window for inline handlers
window.deletePerfume = deletePerfume;

// Event Delegation for Delete Buttons on the List Container
if (listContainer) {
    listContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('[data-delete-id]');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-delete-id');
            deletePerfume(id);
        }
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadAdminProducts);