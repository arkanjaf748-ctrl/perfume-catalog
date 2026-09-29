async function loadProductDetail() {
    const detailContainer = document.getElementById('product-detail');
    
    // Get Product ID from URL parameters (?id=prf-001)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        detailContainer.innerHTML = `<p class="text-rose-500 col-span-full text-center">هیچ بۆنێک هەڵنەبژێردراوە!</p>`;
        return;
    }

    try {
        const response = await fetch('data/perfumes.json');
        const perfumes = await response.json();
        const item = perfumes.find(p => p.id === productId);

        if (!item) {
            detailContainer.innerHTML = `<p class="text-rose-500 col-span-full text-center">ئەم بۆنە لە داتابەیسدا نەدۆزرایەوە!</p>`;
            return;
        }

        const stars = Array(item.longevity).fill('<i class="fa-solid fa-star text-amber-400"></i>').join('');
        const genderBadge = item.gender === 'men' ? 'پیاوانە' : item.gender === 'women' ? 'ژنانە' : 'هاوبەش';

        detailContainer.innerHTML = `
            <!-- Left Column: Product Image -->
            <div class="bg-slate-950 rounded-2xl p-8 border border-slate-800/80 flex items-center justify-center min-h-[350px]">
                <img src="${item.image}" alt="${item.title}" 
                     class="max-h-80 object-contain filter drop-shadow-[0_20px_20px_rgba(245,158,11,0.15)] hover:scale-105 transition duration-500"
                     onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'text-center space-y-3\'><i class=\'fa-solid fa-bottle-droplet text-6xl text-amber-500/40\'></i><p class=\'text-xs text-slate-500\'>وێنەی بتڵەکە نەدۆزرایەوە</p></div>';">
            </div>

            <!-- Right Column: Olfactory Info -->
            <div class="space-y-6">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold">${item.brand}</span>
                        <span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">${genderBadge}</span>
                    </div>
                    <h2 class="text-3xl font-black text-slate-100">${item.title}</h2>
                </div>

                <!-- Fragrance Pyramid -->
                <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                    <h3 class="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <i class="fa-solid fa-layer-group"></i>
                        پێکهاتەی بۆنەکە (Fragrance Pyramid)
                    </h3>
                    <div class="text-xs space-y-2 text-slate-300">
                        <p><strong class="text-amber-200">تۆپ نۆت (سەرەتایی):</strong> ${item.top_notes.join('، ')}</p>
                        <p><strong class="text-amber-200">میدڵ نۆت (ناوەڕاست):</strong> ${item.heart_notes.join('، ')}</p>
                        <p><strong class="text-amber-200">بەیزی نۆت (بنچینە):</strong> ${item.base_notes.join('، ')}</p>
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
                        <span class="text-2xl font-black text-amber-400">$${item.price_retail_100ml}</span>
                    </div>
                    <div>
                        <span class="text-xs text-slate-400 block">نرخی کۆ (بۆ کیلو):</span>
                        <span class="text-2xl font-bold text-slate-200">$${item.wholesale_per_kg}</span>
                    </div>
                </div>

                <!-- WhatsApp Order Button -->
                <a href="https://wa.me/?text=${encodeURIComponent('سڵاو، دەمەوێت بۆنی ' + item.title + ' (کۆد: ' + item.id + ') داوا بکەم.')}" 
                   target="_blank" 
                   class="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20">
                    <i class="fa-brands fa-whatsapp text-xl"></i>
                    داواکردن بە واتسئاپ
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error loading product details:', error);
        detailContainer.innerHTML = `<p class="text-rose-500 col-span-full text-center">کێشەیەک لە بارکردنی زانیارییەکان ڕوویدا!</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadProductDetail);