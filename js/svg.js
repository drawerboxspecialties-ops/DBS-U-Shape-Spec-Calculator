import { FORMULA_CONFIG } from '../formulas.js';
import { escapeHTML, fmt } from './utils.js';

export function generateSVG(data, svgId, showWood, itemMode, isPrint) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const w = parseFloat(data.width);
    const d = parseFloat(data.depth);
    const h = parseFloat(data.height);
    const t = parseFloat(data.t);

    const calcs = FORMULA_CONFIG.calculateValues(itemMode, data);
    const { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth } = calcs;

    const hMargin = isPrint ? 60 : 85;
    const vTopMargin = isPrint ? 80 : 105;
    const vBottomMargin = isPrint ? 80 : 85;

    const scale = Math.min((500 - hMargin * 2) / w, (400 - (vTopMargin + vBottomMargin) - 10) / d);
    const dW = w * scale;
    const dD = d * scale;
    const sLA = dLA * scale;
    const sRA = dRA * scale;
    const sUD = udDisplay * scale;
    const x0 = (500 - dW) / 2;
    const y0 = vTopMargin + (400 - (vTopMargin + vBottomMargin) - dD) / 2;

    const path = `M ${x0} ${y0} L ${x0+sLA} ${y0} L ${x0+sLA} ${y0+sUD} L ${x0+dW-sRA} ${y0+sUD} L ${x0+dW-sRA} ${y0} L ${x0+dW} ${y0} L ${x0+dW} ${y0+dD} L ${x0} ${y0+dD} Z`;

    let sideColor = '#000';
    let backColor = '#1e40af';
    if (itemMode === 'dovetail' || itemMode === 'hybrid') { sideColor = '#4a044e'; backColor = '#c2410c'; }
    if (itemMode === 'outerDtInnerDwl') { sideColor = '#134e4a'; backColor = '#0f766e'; }
    if (itemMode === 'threeQuarterFront') { sideColor = '#78350f'; backColor = '#b45309'; }

    const hideNotchLine = !!data.autoPocket;
    const safeLabel = escapeHTML(data.label);
    const safeSvgId = escapeHTML(svgId);

    const joineryTags = itemMode === 'outerDtInnerDwl' ? `
        <text x="${x0 + sLA / 2}" y="${y0 - 52}" text-anchor="middle" font-size="14" font-weight="900" fill="#0f766e">DT</text>
        <text x="${x0 + dW - sRA / 2}" y="${y0 - 52}" text-anchor="middle" font-size="14" font-weight="900" fill="#0f766e">DT</text>
        <text x="${x0 + dW / 2}" y="${y0 + dD + 78}" text-anchor="middle" font-size="14" font-weight="900" fill="#0f766e">DT</text>
        <text x="${x0 - 88}" y="${y0 + dD / 2}" text-anchor="middle" font-size="14" font-weight="900" fill="#0f766e" transform="rotate(-90, ${x0 - 88}, ${y0 + dD / 2})">DT</text>
        <text x="${x0 + sLA + 22}" y="${y0 + (sUD / 2) + 22}" text-anchor="start" font-size="14" font-weight="900" fill="#b45309">DWL</text>
        ${!hideNotchLine ? `<text x="${x0 + sLA + ((dW - sLA - sRA) / 2)}" y="${y0 + sUD + 58}" text-anchor="middle" font-size="14" font-weight="900" fill="#b45309">DWL</text>` : ''}
    ` : '';

    svg.innerHTML = `
        <defs>
            <marker id="m-s-${safeSvgId}" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="auto"><path d="M10,0 L0,5 L10,10 Z" fill="#000"/></marker>
            <marker id="m-e-${safeSvgId}" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#000"/></marker>
        </defs>
        <path d="${path}" fill="${showWood ? '#dec19e' : 'none'}" stroke="#000" stroke-width="2" />
        
        ${!isPrint ? `
        <text x="15" y="35" text-anchor="start" font-weight="900" font-size="28" class="uppercase fill-slate-900">${safeLabel}</text>
        <text x="15" y="62" text-anchor="start" font-weight="bold" font-size="18" fill="#2563eb">QTY: ${fmt(data.qty)}</text>
        <text x="15" y="85" text-anchor="start" font-weight="bold" font-size="18" fill="#1e40af">H: ${fmt(h)}</text>
        ` : ''}
        
        <line x1="${x0-35}" y1="${y0}" x2="${x0-35}" y2="${y0+dD}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0-65}" y="${y0+dD/2}" text-anchor="middle" font-weight="bold" font-size="22" fill="${sideColor}" transform="rotate(-90, ${x0-65}, ${y0+dD/2})">${fmt(sideLen)}</text>
        
        <line x1="${x0}" y1="${y0+dD+25}" x2="${x0+dW}" y2="${y0+dD+25}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0+dW/2}" y="${y0+dD+55}" text-anchor="middle" font-weight="900" font-size="32" fill="${backColor}">${fmt(backWidth)}</text>
        
        <line x1="${x0}" y1="${y0-25}" x2="${x0+sLA}" y2="${y0-25}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0+sLA/2}" y="${y0-35}" text-anchor="middle" font-size="20" font-weight="bold">${fmt(dLA)}</text>
        <line x1="${x0+dW-sRA}" y1="${y0-25}" x2="${x0+dW}" y2="${y0-25}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0+dW-sRA/2}" y="${y0-35}" text-anchor="middle" font-size="20" font-weight="bold">${fmt(dRA)}</text>
        
        <line x1="${x0+sLA+12}" y1="${y0}" x2="${x0+sLA+12}" y2="${y0+sUD}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0+sLA+22}" y="${y0+(sUD/2)}" text-anchor="start" font-size="22" font-weight="bold" fill="red">${fmt(udDisplay)}</text>
        
        ${!hideNotchLine ? `
        <line x1="${x0+sLA}" y1="${y0+sUD+10}" x2="${x0+dW-sRA}" y2="${y0+sUD+10}" stroke="#000" marker-start="url(#m-s-${safeSvgId})" marker-end="url(#m-e-${safeSvgId})" />
        <text x="${x0+sLA+((sLA?((dW-sLA-sRA)/2):0))}" y="${y0+sUD+40}" text-anchor="middle" font-weight="bold" fill="red" font-size="28">${fmt(notchHorizontalWidth)}</text>
        ` : ''}
        
        <text x="${x0+dW}" y="${y0+dD-5}" text-anchor="end" font-size="14" font-weight="bold">T = ${fmt(t)}</text>
        ${joineryTags}
    `;
}
