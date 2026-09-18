import { fmt } from './utils.js';

export function setValidationMessage(message) {
    const el = document.getElementById('validation-msg');
    if (!el) return;
    if (message) {
        el.textContent = message;
        el.classList.remove('hidden');
    } else {
        el.textContent = '';
        el.classList.add('hidden');
    }
}

export function updateSpecReadout(payload, calcs) {
    const panel = document.getElementById('spec-readout');
    if (!panel) return;

    const chips = [
        { label: 'Side Length', value: fmt(calcs.sideLen), highlight: true },
        { label: 'Back Width', value: fmt(calcs.backWidth), highlight: true },
        { label: 'U-Pocket', value: fmt(calcs.udDisplay), highlight: true },
        { label: 'Left Arm', value: fmt(calcs.dLA) },
        { label: 'Right Arm', value: fmt(calcs.dRA) },
        { label: 'Notch W', value: payload.autoPocket ? '—' : fmt(calcs.notchHorizontalWidth) }
    ];

    panel.innerHTML = chips.map(chip => `
        <div class="spec-chip${chip.highlight ? ' spec-highlight' : ''}">
            <div class="spec-label">${chip.label}</div>
            <div class="spec-value">${chip.value}</div>
        </div>
    `).join('');
    panel.classList.remove('hidden');
}

export function hideSpecReadout() {
    const panel = document.getElementById('spec-readout');
    if (panel) {
        panel.innerHTML = '';
        panel.classList.add('hidden');
    }
}

export function updateQueueChrome(count) {
    const summary = document.getElementById('queue-summary');
    const badge = document.getElementById('queue-badge');
    const printBtn = document.getElementById('print-btn');
    const empty = document.getElementById('queue-empty');
    const list = document.getElementById('queue-list');

    if (summary) summary.textContent = `${count} item${count === 1 ? '' : 's'} in queue`;
    if (badge) badge.textContent = String(count);
    if (printBtn) printBtn.disabled = count === 0;
    if (empty && list) {
        empty.classList.toggle('hidden', count > 0);
        list.classList.toggle('hidden', count === 0);
    }
}

export function setPreviewStatus(state) {
    const previewStatus = document.getElementById('preview-status');
    if (!previewStatus) return;

    if (state === 'live') {
        previewStatus.textContent = 'Live preview';
        previewStatus.className = 'text-[10px] font-bold uppercase tracking-wider text-emerald-600';
    } else if (state === 'incomplete') {
        previewStatus.textContent = 'Incomplete';
        previewStatus.className = 'text-[10px] font-bold uppercase tracking-wider text-amber-600';
    } else {
        previewStatus.textContent = 'Awaiting input';
        previewStatus.className = 'text-[10px] font-bold uppercase tracking-wider text-slate-400';
    }
}

export function setAddButtonEnabled(enabled, mode) {
    const addBtn = document.getElementById('add-btn');
    if (!addBtn) return;

    if (enabled) {
        let btnColor = 'bg-orange-600 hover:bg-orange-500';
        if (mode === 'dowel') btnColor = 'bg-blue-600 hover:bg-blue-500';
        if (mode === 'hybrid') btnColor = 'bg-indigo-600 hover:bg-indigo-500';
        if (mode === 'outerDtInnerDwl') btnColor = 'bg-teal-700 hover:bg-teal-600';
        if (mode === 'threeQuarterFront') btnColor = 'bg-amber-700 hover:bg-amber-600';
        addBtn.className = `w-full ${btnColor} text-white font-extrabold py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-xs cursor-pointer active:scale-[0.99]`;
        addBtn.disabled = false;
    } else {
        addBtn.className = 'w-full bg-slate-100 text-slate-300 font-extrabold py-4 rounded-xl uppercase tracking-widest text-xs cursor-not-allowed border border-slate-200/40 shadow-none';
        addBtn.disabled = true;
    }
}

export function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden', 'opacity-0');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2200);
}
