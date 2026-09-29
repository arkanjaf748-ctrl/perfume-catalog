let perfumesData = [];
let userChoices = {
    gender: null,
    season: null,
    vibe: null
};

// Fetch Perfume Data
async function loadPerfumes() {
    try {
        const response = await fetch('data/perfumes.json');
        perfumesData = await response.json();
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

// Select Quiz Options
function selectOption(key, value, nextStep) {
    userChoices[key] = value;
    goToStep(nextStep);
}

// Navigate Steps
function goToStep(step) {
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));

    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');

    if (step === 2) {
        document.getElementById('step-2').classList.remove('hidden');
        progressBar.style.width = '66%';
        stepIndicator.innerHTML = '<span>هەنگاوی ۲ لە ۳</span><span>کەشوهەوا و کات</span>';
    } else if (step === 3) {
        document.getElementById('step-3').classList.remove('hidden');
        progressBar.style.width = '100%';
        stepIndicator.innerHTML = '<span>هەنگاوی ۳ لە ۳</span><span>ستایل و هەست</span>';
    }
}

// Calculate Results
function finishQuiz(vibe) {
    userChoices.vibe = vibe;
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
    
    const resultsStep = document.getElementById('step-results');
    resultsStep.classList.remove('hidden');

    const stepIndicator = document.getElementById('step-indicator');
    stepIndicator.innerHTML = '<span>ئەنجامەکان</span><span>بۆنی پێشنیارکراو</span>';

    renderResults();
}

// Render Results Grid
function renderResults() {
    const resultsContainer = document.getElementById('quiz-results-grid');
    resultsContainer.innerHTML = '';

    // Filter Logic
    let filtered = perfumesData.filter(item => {
        const matchesGender = userChoices.gender === 'unisex' || item.gender === userChoices.gender || item.gender === 'unisex';
        return matchesGender;
    });

    if (filtered.length === 0) {
        filtered = perfumesData;
    }

    filtered.forEach(item => {
        const cardHtml = `
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center hover:border-amber-500/50 transition">
                <div class="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-800/80 flex-shrink-0 overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="max-h-full object-contain filter drop-shadow"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\'fa-solid fa-bottle-droplet text-3xl text-amber-500/40\'></i>';">
                </div>
                <div class="space-y-1 flex-grow">
                    <span class="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">${item.brand}</span>
                    <h4 class="font-bold text-slate-100 text-sm">${item.title}</h4>
                    <p class="text-xs text-amber-400 font-extrabold">$${item.price_retail_100ml}</p>
                    <a href="product.html?id=${item.id}" class="inline-block text-[11px] text-amber-400 hover:underline pt-1 font-semibold">
                        بینینی وردەکارییەکان <i class="fa-solid fa-arrow-left text-[9px]"></i>
                    </a>
                </div>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Reset Quiz
function resetQuiz() {
    userChoices = { gender: null, season: null, vibe: null };
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
    document.getElementById('step-1').classList.remove('hidden');

    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    progressBar.style.width = '33%';
    stepIndicator.innerHTML = '<span>هەنگاوی ۱ لە ۳</span><span>دیاریکردنی ڕەگەز</span>';
}

document.addEventListener('DOMContentLoaded', loadPerfumes);