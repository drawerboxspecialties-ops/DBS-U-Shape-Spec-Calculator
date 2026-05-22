// app.js - DOM interaction and SVG rendering
import { FORMULA_CONFIG } from './formulas.js';

let queue = [];
let currentMode = 'dovetail';

try {
    const cachedQueue = localStorage.getItem('dbs_production_queue');
    if (cachedQueue) queue = JSON.parse(cachedQueue);
} catch (e) {
    console.error("Could not load cached production queue", e);
}

function parseFraction(val) {
    if (val === undefined || val === null) return 0;
    let str = val.toString().trim();
    if (!str) return 0;
    if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);

    str = str.replace(/-/g, ' ').replace(/\s+/g, ' ');
    const parts = str.split(' ');

    if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split('/');
        if (fracParts.length === 2) {
            const num = parseFloat(fracParts[0]);
            const den = parseFloat(fracParts[1]);
            if (den !== 0) return whole + (num / den);
        }
    } else if (parts.length === 1 && parts[0].includes('/')) {
        const fracParts = parts[0].split('/');
        if (fracParts.length === 2) {
            const num = parseFloat(fracParts[0]);
            const den = parseFloat(fracParts[1]);
            if (den !== 0) return num / den;
        }
    }
    const fallback = parseFloat(str);
    return isNaN(fallback) ? 0 : fallback;
}

function fmt(num) {
    if (num === undefined || num === null || isNaN(num)) return "0";
    return parseFloat(parseFloat(num).toFixed(3)).toString();
}

function validateInput() {
    const fields = ['qty', 'width', 'depth', 'height', 'lArm', 'rArm'];
    
    if (currentMode !== 'threeQuarterFrontDowelInside') {
        fields.push('uDepth');
    }
    if (currentMode === 'threeQuarterFront' || currentMode === 'threeQuarterFrontDowelInside') {
        fields.push('lipLeft', 'lipRight');
    }
    
    const frame = document.getElementById('display-frame');
    const addBtn = document.getElementById('add-btn');
    let isComplete = true;
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.value.trim() === "") {
            isComplete = false;
        } else {
            const parsed = (id === 'qty') ? parseFloat(el.value) : parseFraction(el.value);
            if (parsed < 0 || isNaN(parsed)) isComplete = false;
            if ((id !== 'lipLeft' && id !== 'lipRight') && parsed <= 0) isComplete = false;
        }
    });

    if (isComplete) {
        const boxW = parseFraction(document.getElementById('width').value) || 0;
        const leftA = parseFraction(document.getElementById('lArm').value) || 0;
        const rightA = parseFraction(document.getElementById('rArm').value) || 0;
        if ((leftA + rightA) >= boxW) isComplete = false;
    }

    if (isComplete) {
        frame.classList.add('is-live');
        let btnColor = 'bg-orange-600 hover:bg-orange-500';
        if (currentMode === 'dowel') btnColor = 'bg-blue-600 hover:bg-blue-500';
        if (currentMode === 'hybrid') btnColor = 'bg-indigo-600 hover:bg-indigo-500';
        if (currentMode === 'threeQuarterFront') btnColor = 'bg-amber-700 hover:bg-amber-600';
        if (currentMode === 'threeQuarterFrontDowelInside') btnColor = 'bg-rose-700 hover:bg-rose-600';
        
        addBtn.className = `w-full ${btnColor} text-white font-extrabold py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-xs cursor-pointer active:scale-[0.99]`;
        addBtn.disabled = false;
        updatePreview();
    } else {
        frame.classList.remove('is-live');
        addBtn.className = "w-full bg-slate-100 text-slate-300 font-extrabold py-4 rounded-xl uppercase tracking-widest text-xs cursor-not-allowed border border-slate-200/40";
        addBtn.disabled = true;
    }
}

function resetForm() {
    const inputs = document.querySelectorAll('#entry-form input:not([readonly])');
    inputs.forEach(i => {
        if(i.id !== 'lipLeft' && i.id !== 'lipRight') {
            i.value = "";
        }
    });
    document.getElementById('thick').selectedIndex = 0;
    document.getElementById('lipLeft').value = "0.188";
    document.getElementById('lipRight').value = "0.188";
    document.getElementById('display-frame').classList.remove('is-live');
    validateInput();
}

function setMode(mode) {
    currentMode = mode;
    const body = document.getElementById('main-body');
    const header = document.getElementById('header-bar');
    const title = document.getElementById('header-title');
    const chip = document.getElementById('status-chip');
    const lipContainer = document.getElementById('lip-fields-container');
    const pocketInputContainer = document.getElementById('pocket-input-container');
    
    const btnDovetail = document.getElementById('btn-dovetail');
    const btnDowel = document.getElementById('btn-dowel');
    const btnHybrid = document.getElementById('btn-hybrid');
    const btn34Front = document.getElementById('btn-34front');
    const btn34DowelIn = document.getElementById('btn-34dovelin');
    resetForm(); 

    const inactiveClass = 'py-2 rounded-md text-[9px] font-black uppercase transition-all text-slate-500 hover:text-slate-700 hover:bg-white/50 text-center';
    btnDovetail.className = inactiveClass;
    btnDowel.className = inactiveClass;
    btnHybrid.className = inactiveClass;
    btn34Front.className = inactiveClass;
    btn34DowelIn.className = inactiveClass;

    if (mode === 'threeQuarterFront' || mode === 'threeQuarterFrontDowelInside') {
        lipContainer.classList.remove('hidden');
    } else {
        lipContainer.classList.add('hidden');
    }

    if (mode === 'threeQuarterFrontDowelInside') {
        pocketInputContainer.classList.add('hidden');
    } else {
        pocketInputContainer.classList.remove('hidden');
    }

    const activeClass = 'py-2 rounded-md text-[9px] font-black uppercase transition-all text-white shadow-sm text-center ';

    if (mode === 'dovetail') {
        body.className = 'p-4 lg:p-8 mode-dovetail';
        header.className = 'bg-orange-950 p-4 text-white flex justify-between items-center rounded-2xl shadow-md border-t-2 border-orange-600';
        title.textContent = 'Dovetail Mode';
        chip.textContent = 'Active: Dovetail';
        chip.className = 'px-3.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold uppercase rounded-full tracking-widest';
        btnDovetail.className = activeClass + 'bg-orange-600';
    } else if (mode === 'dowel') {
        body.className = 'p-4 lg:p-8 mode-dowel';
        header.className = 'bg-slate-900 p-4 text-white flex justify-between items-center rounded-2xl shadow-md border-t-2 border-blue-600';
        title.textContent = 'Dowel Mode';
        chip.textContent = 'Active: Dowel';
        chip.className = 'px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-widest';
        btnDowel.className = activeClass + 'bg-blue-600';
    } else if (mode === 'hybrid') {
        body.className = 'p-4 lg:p-8 mode-hybrid';
        header.className = 'bg-indigo-950 p-4 text-white flex justify-between items-center rounded-2xl shadow-md border-t-2 border-indigo-600';
        title.textContent = 'DT Front / DWL Back Mode';
        chip.textContent = 'Active: DT Frt / DWL Bk';
        chip.className = 'px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-widest';
        btnHybrid.className = activeClass + 'bg-indigo-600';
    } else if (mode === 'threeQuarterFront') {
        body.className = 'p-4 lg:p-8 mode-dovetail'; 
        header.className = 'bg-amber-950 p-4 text-white flex justify-between items-center rounded-2xl shadow-md border-t-2 border-amber-600';
        title.textContent = '3/4" Front Only / Dovetail Spec Mode';
        chip.textContent = 'Active: 3/4" Frt DT';
        chip.className = 'px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded-full tracking-widest';
        btn34Front.className = activeClass + 'bg-amber-700';
    } else if (mode === 'threeQuarterFrontDowelInside') {
        body.className = 'p-4 lg:p-8 mode-dowel';
        header.className = 'bg-rose-950 p-4 text-white flex justify-between items-center rounded-2xl shadow-md border-t-2 border-rose-600';
        title.textContent = '3/4" Front / Dowel Inside Spec Mode';
        chip.textContent = 'Active: 3/4" Frt DWL In';
        chip.className = 'px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase rounded-full tracking-widest';
        btn34DowelIn.className = activeClass + 'bg-rose-700';
    }
    validateInput();
}

function generateSVG(data, svgId, showWood, itemMode) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    
    const w = parseFloat(data.width); 
    const d = parseFloat(data.depth); 
    const h = parseFloat(data.height);
    const t = parseFloat(data.t);

    const calcs = FORMULA_CONFIG.calculateValues(itemMode, data);
    const { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth } = calcs;

    const isPrint = svgId.includes('svg-p');
    const hMargin = isPrint ? 60 : 85; 
    const vTopMargin = isPrint ? 80 : 105; 
    const vBottomMargin = isPrint ? 80 : 85;

    const scale = Math.min((500 - hMargin * 2) / w, (400 - (vTopMargin + vBottomMargin) - 10) / d);
    const dW = w * scale; const dD = d * scale; 
    const sLA = dLA * scale; const sRA = dRA * scale;
    const sUD = udDisplay * scale;
    
    const x0 = (500 - dW) / 2; 
    const y0 = vTopMargin + (400 - (vTopMargin + vBottomMargin) - dD) / 2;

    const path = `M ${x0} ${y0} L ${x0+sLA} ${y0} L ${x0+sLA} ${y0+sUD} L ${x0+dW-sRA} ${y0+sUD} L ${x0+dW-sRA} ${y0} L ${x0+dW} ${y0} L ${x0+dW} ${y0+dD} L ${x0} ${y0+dD} Z`;

    let sideColor = '#000';
    let backColor = '#1e40af';
    
    if (itemMode === 'dovetail' || itemMode === 'hybrid') { sideColor = '#4a044e'; backColor = '#c2410c'; }
    if (itemMode === 'threeQuarterFront') { sideColor = '#78350f'; backColor = '#b45309'; }
    if (itemMode === 'threeQuarterFrontDowelInside') { sideColor = '#9f1239'; backColor = '#be123c'; }

    svg.innerHTML = `
        <defs>
            <marker id="m-s-${svgId}" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto"><path d="M10,0 L0,5 L10,10 Z" fill="#000"/></marker>
            <marker id="m-e-${svgId}" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#000"/></marker>
        </defs>
        <path d="${path}" fill="${showWood ? '#dec19e' : 'none'}" stroke="#000" stroke-width="2" />
        
        ${!isPrint ? `
        <text x="15" y="35" text-anchor="start" font-weight="900" font-size="28" class="uppercase fill-slate-900">${data.label}</text>
        <text x="15" y="62" text-anchor="start" font-weight="bold" font-size="18" fill="#2563eb">QTY: ${fmt(data.qty)}</text>
        <text x="15" y="85" text-anchor="start" font-weight="bold" font-size="18" fill="#1e40af">H: ${fmt(h)}</text>
        ` : ''}
        
        <line x1="${x0-35}" y1="${y0}" x2="${x0-35}" y2="${y0+dD}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0-65}" y="${y0+dD/2}" text-anchor="middle" font-weight="bold" font-size="22" fill="${sideColor}" transform="rotate(-90, ${x0-65}, ${y0+dD/2})">${fmt(sideLen)}</text>
        
        <line x1="${x0}" y1="${y0+dD+25}" x2="${x0+dW}" y2="${y0+dD+25}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0+dW/2}" y="${y0+dD+55}" text-anchor="middle" font-weight="900" font-size="32" fill="${backColor}">${fmt(backWidth)}</text>
        
        <line x1="${x0}" y1="${y0-25}" x2="${x0+sLA}" y2="${y0-25}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0+sLA/2}" y="${y0-35}" text-anchor="middle" font-size="20" font-weight="bold">${fmt(dLA)}</text>
        <line x1="${x0+dW-sRA}" y1="${y0-25}" x2="${x0+dW}" y2="${y0-25}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0+dW-sRA/2}" y="${y0-35}" text-anchor="middle" font-size="20" font-weight="bold">${fmt(dRA)}</text>
        
        <line x1="${x0+sLA+12}" y1="${y0}" x2="${x0+sLA+12}" y2="${y0+sUD}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0+sLA+22}" y="${y0+(sUD/2)}" text-anchor="start" font-size="22" font-weight="bold" fill="red">${fmt(udDisplay)}</text>
        
        ${itemMode !== 'threeQuarterFrontDowelInside' ? `
        <line x1="${x0+sLA}" y1="${y0+sUD+10}" x2="${x0+dW-sRA}" y2="${y0+sUD+10}" stroke="#000" marker-start="url(#m-s-${svgId})" marker-end="url(#m-e-${svgId})" />
        <text x="${x0+sLA+((sLA?((dW-sLA-sRA)/2):0))}" y="${y0+sUD+40}" text-anchor="middle" font-weight="bold" fill="red" font-size="28">${fmt(notchHorizontalWidth)}</text>
        ` : ''}
        
        <text x="${x0+dW}" y="${y0+dD-5}" text-anchor="end" font-size="14" font-weight="bold">T = ${fmt(t)}</text>
    `;
}

function updatePreview() {
    const data = {
        label: document.getElementById('label').value || "Unit",
        qty: parseFloat(document.getElementById('qty').value) || 0,
        t: parseFloat(document.getElementById('thick').value),
        width: parseFraction(document.getElementById('width').value),
        depth: parseFraction(document.getElementById('depth').value),
        height: parseFraction(document.getElementById('height').value),
        uDepth: parseFraction(document.getElementById('uDepth').value),
        lArm: parseFraction(document.getElementById('lArm').value),
        rArm: parseFraction(document.getElementById('rArm').value),
        lipLeft: parseFraction(document.getElementById('lipLeft').value),
        lipRight: parseFraction(document.getElementById('lipRight').value)
    };
    generateSVG(data, 'preview-svg', true, currentMode);
}

function addToQueue() {
    const sel = document.getElementById('thick');
    const item = {
        id: Date.now(), mode: currentMode,
        label: document.getElementById('label').value || 'Unit',
        qty: parseFloat(document.getElementById('qty').value) || 1,
        t: parseFloat(sel.value), tName: sel.options[sel.selectedIndex].text,
        width: parseFraction(document.getElementById('width').value),
        depth: parseFraction(document.getElementById('depth').value),
        height: parseFraction(document.getElementById('height').value),
        uDepth: parseFraction(document.getElementById('uDepth').value),
        lArm: parseFraction(document.getElementById('lArm').value),
        rArm: parseFraction(document.getElementById('rArm').value),
        lipLeft: parseFraction(document.getElementById('lipLeft').value),
        lipRight: parseFraction(document.getElementById('lipRight').value)
    };
    queue.push(item); 
    saveQueueToStorage();
    renderQueue();
}

function renderQueue() {
    const list = document.getElementById('queue-list');
    const printList = document.getElementById('print-items');
    if (!list || !printList) return;
    list.innerHTML = ''; printList.innerHTML = '';
    queue.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = "flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-sm shadow-sm font-medium";
        
        let labelName = item.mode.toUpperCase();
        if (item.mode === 'hybrid') labelName = 'DT FRT / DWL BK';
        if (item.mode === 'threeQuarterFrontDowelInside') labelName = '3/4" FRT / DWL POCKET';
        
        row.innerHTML = `<span class="text-slate-700"><b>${index+1}. ${item.label}</b> <span class="text-[10px] ml-1.5 px-2 py-0.5 rounded-md bg-slate-200/60 font-bold text-slate-500">${labelName}</span></span> <button onclick="removeItem(${item.id})" class="text-rose-600 font-bold uppercase text-[10px] hover:underline tracking-wider">Delete</button>`;
        list.appendChild(row);
        
        const container = document.createElement('div');
        container.className = "item-container";
        
        // Cleaned up long descriptors for landscape print cut sheets
        let displayMode = 'Dovetail';
        if (item.mode === 'dowel') displayMode = 'Dowel';
        if (item.mode === 'hybrid') displayMode = 'DT Front / DWL Back';
        if (item.mode === 'threeQuarterFront') displayMode = '3/4" Front Dovetail';
        if (item.mode === 'threeQuarterFrontDowelInside') displayMode = '3/4" Front and Dowel U-Depth Inside';
        
        let specialInstructionTag = '';
        if (item.mode === 'hybrid') specialInstructionTag = `<div class="hybrid-spec-tag">Front: Dovetail | Back: Dowel</div>`;
        if (item.mode === 'threeQuarterFront') {
            specialInstructionTag = `<div class="hybrid-spec-tag bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-black text-center border border-amber-300">⚠️ PRODUCTION NOTE: 3/4" FRONT ONLY SPEC (L-Lip: ${fmt(item.lipLeft)} | R-Lip: ${fmt(item.lipRight)})</div>`;
        }
        if (item.mode === 'threeQuarterFrontDowelInside') {
            specialInstructionTag = `<div class="hybrid-spec-tag bg-rose-100 text-rose-950 px-1 py-0.5 rounded font-black text-center border border-rose-300">⚠️ PRODUCTION NOTE: 3/4" FRONT / DOWEL TO INSIDE FACE (L-Lip: ${fmt(item.lipLeft)} | R-Lip: ${fmt(item.lipRight)})</div>`;
        }
        
        container.innerHTML = `
            <div class="print-header-single">
                <div class="header-left">#${index+1} ${displayMode} - ${item.label}</div>
                <div class="header-right">QTY: ${fmt(item.qty)} | W: ${fmt(item.width)} | D: ${fmt(item.depth)} | H: ${fmt(item.height)}</div>
            </div>
            ${specialInstructionTag}
            <svg id="svg-p-${item.id}" viewBox="0 0 500 400"></svg>`;
        printList.appendChild(container);
        generateSVG(item, `svg-p-${item.id}`, false, item.mode);
    });
}

function removeItem(id) { 
    queue = queue.filter(i => i.id !== id); 
    saveQueueToStorage();
    renderQueue(); 
}

function clearQueue() { 
    if(confirm("Clear order?")) { 
        queue = []; 
        saveQueueToStorage();
        renderQueue(); 
    } 
}

function saveQueueToStorage() {
    try {
        localStorage.setItem('dbs_production_queue', JSON.stringify(queue));
    } catch (e) {
        console.error("Could not preserve production entries to local storage memory", e);
    }
}

window.validateInput = validateInput;
window.resetForm = resetForm;
window.setMode = setMode;
window.addToQueue = addToQueue;
window.removeItem = removeItem;
window.clearQueue = clearQueue;

window.onload = function() {
    renderQueue();
    validateInput();
};
