import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

async function loadProductDetail() {
    const detailContainer = document.getElementById('product-detail');
    if (!detailContainer) return;
    
    // Get Product ID from URL parameters (?id=docId)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        detailContainer.innerHTML = `<p class="text-rose-500 col-span-full text-center py-12">هیچ بۆنێک هەڵنەبژێردراوە!</p>`;
        return;
    }

    // Loading State
    detailContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
            <div class="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
            <p class="text-sm text-slate-400">تکایە چاوەڕێ بکە، زانیارییەکانی بۆن بار دەکرێن...</p>
        </div>
    `;

    try {
        let item = null;

        // Try fetching document directly by ID from Firestore
        try {
            const docRef = doc(db, "perfumes", productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                item = { id: docSnap.id, ...docSnap.data() };
            }
        } catch (fsErr) {
            console.warn('Direct Firestore doc lookup failed:', fsErr);
        }

        // Fallback: If not found by doc id, search for document having an "id" field in Firestore
        if (!item) {
            try {
                const querySnapshot = await getDocs(collection(db, "perfumes"));
                querySnapshot.forEach((d) => {
                    const data = d.data();
                    if (d.id === productId || data.id === productId) {
                        item = { id: d.id, ...data };
                    }
                });
            } catch (err) {
                console.warn('Querying Firestore collection failed:', err);
            }
        }

        // Fallback to local JSON if Firestore doesn't contain this item (e.g. legacy static data)
        if (!item) {
            try {
                const response = await fetch('data/perfumes.json');
                const perfumes = await response.json();
                item = perfumes.find(p => p.id === productId);
            } catch (jsonErr) {
                console.warn('Fallback to local JSON failed:', jsonErr);
            }
        }

        if (!item) {
            detailContainer.innerHTML = `
                <div class="col-span-full text-center py-12 space-y-3">
                    <i class="fa-solid fa-circle-question text-4xl text-rose-500"></i>
                    <p class="text-rose-400 font-bold text-base">ئەم بۆنە لە داتابەیسدا نەدۆزرایەوە!</p>
                    <a href="index.html" class="inline-block text-xs text-amber-400 hover:underline pt-2">گەڕانەوە بۆ کاتالۆگی سەرەکی</a>
                </div>
            `;
            return;
        }

        // Longevity Stars
        const longevityVal = typeof item.longevity === 'number' ? item.longevity : 5;
        const stars = Array(Math.max(1, Math.min(5, longevityVal)))
            .fill('<i class="fa-solid fa-star text-amber-400"></i>')
            .join('');

        // Gender Badge
        const genderBadge = item.gender === 'men' ? 'پیاوانە' : item.gender === 'women' ? 'ژنانە' : 'هاوبەش';

        // Extract Notes
        const topNotesText = Array.isArray(item.top_notes) && item.top_notes.length > 0 
            ? item.top_notes.join('، ') 
            : (item.notes?.top || item.top_notes || 'نۆتی تایبەت');

        const middleNotesText = Array.isArray(item.heart_notes) && item.heart_notes.length > 0
            ? item.heart_notes.join('، ')
            : (item.notes?.middle || item.heart_notes || 'نۆتی ناوەڕاستی تایبەت');

        const baseNotesText = Array.isArray(item.base_notes) && item.base_notes.length > 0
            ? item.base_notes.join('، ')
            : (item.notes?.base || item.base_notes || 'نۆتی بنچینەیی تایبەت');

        // Price formatting
        const retailPrice = item.price_retail_100ml ?? item.price_retail ?? item.price ?? 0;
        const wholesalePrice = item.wholesale_per_kg ?? (item.price_raw_oil_tola ? item.price_raw_oil_tola * 10 : null);

        detailContainer.innerHTML = `
            <!-- Left Column: Product Image -->
            <div class="bg-slate-950 rounded-2xl p-8 border border-slate-800/80 flex items-center justify-center min-h-[350px]">
                <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.title || 'بۆن'}" 
                     class="max-h-80 object-contain filter drop-shadow-[0_20px_20px_rgba(245,158,11,0.15)] hover:scale-105 transition duration-500"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'text-center space-y-3\\'><i class=\\'fa-solid fa-bottle-droplet text-6xl text-amber-500/40\\'></i><p class=\\'text-xs text-slate-500\\'>وێنەی بتڵەکە نەدۆزرایەوە</p></div>';">
            </div>

            <!-- Right Column: Olfactory Info -->
            <div class="space-y-6">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold">${item.brand || 'براندی نێودەوڵەتی'}</span>
                        <span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">${genderBadge}</span>
                    </div>
                    <h2 class="text-3xl font-black text-slate-100">${item.title || 'بۆنی بێ ناو'}</h2>
                </div>

                <!-- Fragrance Pyramid -->
                <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                    <h3 class="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <i class="fa-solid fa-layer-group"></i>
                        پێکهاتەی بۆنەکە (Fragrance Pyramid)
                    </h3>
                    <div class="text-xs space-y-2 text-slate-300">
                        <p><strong class="text-amber-200">تۆپ نۆت (سەرەتایی):</strong> ${topNotesText}</p>
                        <p><strong class="text-amber-200">میدڵ نۆت (ناوەڕاست):</strong> ${middleNotesText}</p>
                        <p><strong class="text-amber-200">بەیزی نۆت (بنچینە):</strong> ${baseNotesText}</p>
                    </div>
                </div>

                <!-- Performance -->
                <div class="flex items-center justify-between text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                    <span class="text-slate-400">ئاستی مانەوە:</span>
                    <div class="flex gap-1">${stars}</div>
                </div>

                <!-- Prices -->
                <div class="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <div>
                        <span class="text-xs text-slate-400 block">نرخی تاك (100ml):</span>
                        <span class="text-2xl font-black text-amber-400">$${retailPrice}</span>
                    </div>
                    ${wholesalePrice ? `
                    <div>
                        <span class="text-xs text-slate-400 block">نرخی کۆ (بۆ کیلو):</span>
                        <span class="text-2xl font-bold text-slate-200">$${wholesalePrice}</span>
                    </div>` : ''}
                </div>

                <!-- WhatsApp Order Button -->
                <a href="https://wa.me/?text=${encodeURIComponent('سڵاو، دەمەوێت بۆنی ' + (item.title || '') + ' (کۆد: ' + item.id + ') داوا بکەم.')}" 
                   target="_blank" 
                   class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20">
                    <i class="fa-brands fa-whatsapp text-xl"></i>
                    داواکردن بە واتسئاپ
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error loading product details:', error);
        detailContainer.innerHTML = `<p class="text-rose-500 col-span-full text-center py-12">کێشەیەک لە بارکردنی زانیارییەکان ڕوویدا!</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);