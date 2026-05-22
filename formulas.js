// formulas.js - Isolated manufacturing logic engine
export const FORMULA_CONFIG = {
    // Material thickness deductions matrix
    deductions: {
        0.625: 0.624,   // 5/8"
        0.500: 0.374,   // 1/2"
        0.472: 0.318,   // 12mm
        0.750: 0.750    // 3/4"
    },

    getDeduction(thickness) {
        return this.deductions[thickness] !== undefined ? this.deductions[thickness] : thickness;
    },

    calculateValues(itemMode, data) {
        const t = parseFloat(data.t);
        const w = parseFloat(data.width);
        const d = parseFloat(data.depth);
        const laVal = parseFloat(data.lArm);
        const raVal = parseFloat(data.rArm);
        const udRaw = parseFloat(data.uDepth) || 0;
        const autoPocket = !!data.autoPocket; 

        // Overlays apply strictly to the 3/4" Front specification mode layout
        const hasLips = (itemMode === 'threeQuarterFront');
        const lipL = hasLips ? (parseFloat(data.lipLeft) ?? 0.188) : 0;
        const lipR = hasLips ? (parseFloat(data.lipRight) ?? 0.188) : 0;

        const deduction = this.getDeduction(t);
        const gap = w - (laVal + raVal);

        let sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth;

        if (itemMode === 'dovetail') {
            sideLen = d - deduction;
            backWidth = w;
            udDisplay = autoPocket ? (d - t - deduction) : (udRaw + t - deduction);
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * t);
        } else if (itemMode === 'dowel') {
            sideLen = d;
            backWidth = w - (2 * t);
            udDisplay = autoPocket ? (d - (2 * t)) : (udRaw + t);
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = gap;
        } else if (itemMode === 'hybrid') {
            backWidth = w;
            sideLen = d - (deduction / 2); 
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = w - (dLA + dRA + (4 * t));
            udDisplay = autoPocket ? (d - t - (deduction / 2)) : (udRaw + t);
        } else if (itemMode === 'threeQuarterFront') {
            const frontT = 0.750;
            const frontDeduction = this.getDeduction(frontT);
            backWidth = w + lipL + lipR;
            
            // Side length matches your engineered joint tolerances
            sideLen = d - ((frontDeduction / 2) + (deduction / 2) + 0.062);
            
            // Toggle On: Auto-Flush matching old Mode 5 math. Toggle Off: Normal adjustments.
            udDisplay = autoPocket ? (d - frontT - (deduction / 2)) : (udRaw + frontT - frontDeduction);
            
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        }

        return { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth };
    }
};
