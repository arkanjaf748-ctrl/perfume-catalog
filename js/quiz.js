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

let perfumesData = [];
let userChoices = {
    gender: null,
    season: null,
    vibe: null
};

// Fetch Perfume Data from Firestore (with fallback)
async function loadPerfumes() {
    try {
        const querySnapshot = await getDocs(collection(db, "perfumes"));
        if (!querySnapshot.empty) {
            perfumesData = [];
            querySnapshot.forEach(docSnap => {
                perfumesData.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            return;
        }
    } catch (error) {
        console.warn('Error fetching perfumes from Firestore for quiz, falling back to JSON:', error);
    }

    try {
        const response = await fetch('data/perfumes.json');
        perfumesData = await response.json();
    } catch (error) {
        console.error('Error loading fallback JSON data for quiz:', error);
    }
}

// Select Quiz Options
export function selectOption(key, value, nextStep) {
    userChoices[key] = value;
    goToStep(nextStep);
}

// Navigate Steps
export function goToStep(step) {
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));

    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');

    if (step === 2) {
        document.getElementById('step-2').classList.remove('hidden');
        if (progressBar) progressBar.style.width = '66%';
        if (stepIndicator) stepIndicator.innerHTML = '<span>هەنگاوی ۲ لە ۳</span><span>کەشوهەوا و کات</span>';
    } else if (step === 3) {
        document.getElementById('step-3').classList.remove('hidden');
        if (progressBar) progressBar.style.width = '100%';
        if (stepIndicator) stepIndicator.innerHTML = '<span>هەنگاوی ۳ لە ۳</span><span>ستایل و هەست</span>';
    }
}

// Calculate Results
export function finishQuiz(vibe) {
    userChoices.vibe = vibe;
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
    
    const resultsStep = document.getElementById('step-results');
    if (resultsStep) resultsStep.classList.remove('hidden');

    const stepIndicator = document.getElementById('step-indicator');
    if (stepIndicator) stepIndicator.innerHTML = '<span>ئەنجامەکان</span><span>بۆنی پێشنیارکراو</span>';

    renderResults();
}

// Render Results Grid
export function renderResults() {
    const resultsContainer = document.getElementById('quiz-results-grid');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    // Filter Logic
    let filtered = perfumesData.filter(item => {
        const matchesGender = !userChoices.gender || userChoices.gender === 'unisex' || item.gender === userChoices.gender || item.gender === 'unisex';
        return matchesGender;
    });

    if (filtered.length === 0) {
        filtered = perfumesData;
    }

    filtered.forEach(item => {
        const price = item.price_retail_100ml ?? item.price_retail ?? item.price ?? 0;
        const cardHtml = `
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center hover:border-amber-500/50 transition">
                <div class="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-800/80 flex-shrink-0 overflow-hidden">
                    <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.title || 'بۆن'}" class="max-h-full object-contain filter drop-shadow"
                         onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fa-solid fa-bottle-droplet text-3xl text-amber-500/40\\'></i>';">
                </div>
                <div class="space-y-1 flex-grow">
                    <span class="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold">${item.brand || 'براند'}</span>
                    <h4 class="font-bold text-slate-100 text-sm">${item.title || 'بۆن'}</h4>
                    <p class="text-xs text-amber-400 font-extrabold">$${price}</p>
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
export function resetQuiz() {
    userChoices = { gender: null, season: null, vibe: null };
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.add('hidden'));
    const step1 = document.getElementById('step-1');
    if (step1) step1.classList.remove('hidden');

    const progressBar = document.getElementById('progress-bar');
    const stepIndicator = document.getElementById('step-indicator');
    if (progressBar) progressBar.style.width = '33%';
    if (stepIndicator) stepIndicator.innerHTML = '<span>هەنگاوی ۱ لە ۳</span><span>دیاریکردنی ڕەگەز</span>';
}

// Expose methods to window for inline onclick handlers
window.selectOption = selectOption;
window.goToStep = goToStep;
window.finishQuiz = finishQuiz;
window.resetQuiz = resetQuiz;

document.addEventListener('DOMContentLoaded', loadPerfumes);