import { fmt, escapeHTML } from './utils.js';

export function getModeLabel(mode, autoPocket) {
    if (mode === 'hybrid') return 'DT FRT / DWL BK';
    if (mode === 'outerDtInnerDwl') return autoPocket ? 'OUTER DT / INNER DWL (AUTO-FLUSH)' : 'OUTER DT / INNER DWL';
    if (autoPocket && mode === 'threeQuarterFront') return '3/4" FRT / DWL INSIDE';
    if (mode === 'dovetail') return autoPocket ? 'DOVETAIL (AUTO-FLUSH)' : 'DOVETAIL';
    if (mode === 'dowel') return autoPocket ? 'DOWEL (AUTO-FLUSH)' : 'DOWEL';
    if (mode === 'threeQuarterFront') return '3/4" FRONT DT';
    return mode.toUpperCase();
}

export function getPrintDisplayMode(item) {
    if (item.mode === 'dowel') return 'Dowel';
    if (item.mode === 'hybrid') return 'DT Front / DWL Back';
    if (item.mode === 'outerDtInnerDwl') return 'Outer DT / Inner DWL';
    if (item.mode === 'threeQuarterFront') {
        return item.autoPocket ? '3/4" Front and Dowel U-Depth Inside' : '3/4" Front Dovetail';
    }
    return 'Dovetail';
}

/** Print production notes — markup/classes unchanged for @media print compatibility. */
export function buildPrintInstructionTag(item) {
    if (item.mode === 'hybrid') {
        return `<div class="hybrid-spec-tag">Front: Dovetail | Back: Dowel ${item.autoPocket ? '(Auto-Flush Pocket)' : ''}</div>`;
    }

    if (item.mode === 'outerDtInnerDwl') {
        return `<div class="hybrid-spec-tag bg-teal-50 text-teal-950 px-1 py-0.5 rounded font-black text-center border border-teal-300">⚠️ PRODUCTION NOTE: OUTER CORNERS DOVETAIL | CUTOUT CORNERS DOWEL ${item.autoPocket ? '(Auto-Flush Pocket)' : ''}</div>`;
    }

    if (item.mode === 'threeQuarterFront') {
        if (item.autoPocket) {
            return `<div class="hybrid-spec-tag bg-rose-100 text-rose-950 px-1 py-0.5 rounded font-black text-center border border-rose-300">⚠️ PRODUCTION NOTE: 3/4" FRONT / DOWEL TO INSIDE FACE (L-Lip: ${fmt(item.lipLeft)} | R-Lip: ${fmt(item.lipRight)})</div>`;
        }
        return `<div class="hybrid-spec-tag bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-black text-center border border-amber-300">⚠️ PRODUCTION NOTE: 3/4" FRONT ONLY SPEC (L-Lip: ${fmt(item.lipLeft)} | R-Lip: ${fmt(item.lipRight)})</div>`;
    }

    if (item.autoPocket && item.mode === 'dovetail') {
        return `<div class="hybrid-spec-tag bg-blue-50 text-blue-950 px-1 py-0.5 rounded font-black text-center border border-blue-300">⚠️ PRODUCTION NOTE: FLUSH U-DEPTH POCKET DOVETAIL</div>`;
    }
    if (item.autoPocket && item.mode === 'dowel') {
        return `<div class="hybrid-spec-tag bg-blue-50 text-blue-950 px-1 py-0.5 rounded font-black text-center border border-blue-300">⚠️ PRODUCTION NOTE: FLUSH U-DEPTH POCKET DOWEL</div>`;
    }
    return '';
}

export function buildPrintHeaderHtml(item, index) {
    const displayMode = escapeHTML(getPrintDisplayMode(item));
    const label = escapeHTML(item.label);
    return `
        <div class="print-header-single">
            <div class="header-left">#${index + 1} ${displayMode} - ${label}</div>
            <div class="header-right">QTY: ${fmt(item.qty)} | W: ${fmt(item.width)} | D: ${fmt(item.depth)} | H: ${fmt(item.height)}</div>
        </div>`;
}

export function buildScreenQueueRowHtml(item, index) {
    const modeLabel = escapeHTML(getModeLabel(item.mode, item.autoPocket));
    const dims = `W ${fmt(item.width)} × D ${fmt(item.depth)} × H ${fmt(item.height)}`;
    return `
        <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-black text-slate-400">#${index + 1}</span>
                <span class="font-extrabold text-slate-800">${escapeHTML(item.label)}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600 uppercase tracking-wide">${modeLabel}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1.5 font-medium">${dims} · Qty ${fmt(item.qty)} · ${escapeHTML(item.tName || '')}</p>
        </div>
        <div class="flex gap-2 shrink-0">
            <button type="button" data-id="${escapeHTML(item.id)}" class="queue-dup-btn text-slate-600 hover:text-slate-800 font-bold uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" title="Duplicate">Copy</button>
            <button type="button" data-id="${escapeHTML(item.id)}" class="queue-del-btn text-rose-600 hover:text-rose-700 font-bold uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors">Remove</button>
        </div>`;
}
