import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// زانیارییە ڕاستەقینەکانی پڕۆژەی perfume-catalog
const firebaseConfig = {
    apiKey: "AIzaSyAUCIvX6nR7XpzCc5L55J4WGpCxr6NPeMk",
    authDomain: "perfume-catalog.firebaseapp.com",
    projectId: "perfume-catalog",
    storageBucket: "perfume-catalog.firebasestorage.app",
    messagingSenderId: "898553918018",
    appId: "1:898553918018:web:0b6a02adc082b144cb33db",
    measurementId: "G-JERX65M8W1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch & Render Products in Admin Panel
async function loadAdminProducts() {
    const listContainer = document.getElementById('admin-products-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p class="text-xs text-slate-500 py-4">لە باربووندایە...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "perfumes"));
        listContainer.innerHTML = '';

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p class="text-xs text-slate-500 py-4">هیچ بەرهەمێک نەدۆزرایەوە.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;

            const itemHtml = `
                <div class="py-3 flex items-center justify-between gap-4 border-b border-slate-800/60 last:border-0">
                    <div class="flex items-center gap-3">
                        <img src="${data.image}" class="w-12 h-12 object-contain bg-slate-950 rounded-lg p-1 border border-slate-800" onerror="this.src='https://via.placeholder.com/50';">
                        <div>
                            <h4 class="font-bold text-sm text-slate-100">${data.title} <span class="text-xs font-normal text-amber-400">(${data.brand})</span></h4>
                            <p class="text-xs text-slate-400">$${data.price_retail_100ml} - ${data.gender}</p>
                        </div>
                    </div>
                    <button onclick="window.deletePerfume('${id}')" class="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg transition">
                        <i class="fa-solid fa-trash"></i> سڕینەوە
                    </button>
                </div>
            `;
            listContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
    } catch (error) {
        console.error("Error loading products:", error);
        listContainer.innerHTML = '<p class="text-xs text-rose-400 py-4">کێشەیەک ڕوویدا. دڵنیابەوە لە چالاککردنی Firestore Database.</p>';
    }
}

// Add New Perfume
const addForm = document.getElementById('add-perfume-form');
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPerfume = {
            title: document.getElementById('title').value,
            brand: document.getElementById('brand').value,
            price_retail_100ml: parseFloat(document.getElementById('price_retail').value),
            price_raw_oil_tola: parseFloat(document.getElementById('price_raw').value),
            gender: document.getElementById('gender').value,
            notes: {
                top: document.getElementById('note_top').value,
                middle: document.getElementById('note_middle').value,
                base: document.getElementById('note_base').value
            },
            image: document.getElementById('image_url').value
        };

        try {
            await addDoc(collection(db, "perfumes"), newPerfume);
            alert("بەرهەمەکە بە سەرکەوتوویی زیادکرا!");
            addForm.reset();
            loadAdminProducts();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("کێشەیەک ڕوویدا لە کاتی زیادکردندا.");
        }
    });
}

// Delete Perfume
window.deletePerfume = async (docId) => {
    if (confirm("دڵنیایت لە سڕینەوەی ئەم بەرهەمە؟")) {
        try {
            await deleteDoc(doc(db, "perfumes", docId));
            loadAdminProducts();
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    }
};

document.addEventListener('DOMContentLoaded', loadAdminProducts);