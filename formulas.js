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
        // Direct assignment of pre-validated numeric properties
        const t = data.t;
        const w = data.width;
        const d = data.depth;
        const laVal = data.lArm;
        const raVal = data.rArm;
        const udRaw = data.uDepth || 0;
        const autoPocket = !!data.autoPocket; 

        const hasLips = (itemMode === 'threeQuarterFront');
        const lipL = hasLips ? (data.lipLeft ?? 0.188) : 0;
        const lipR = hasLips ? (data.lipRight ?? 0.188) : 0;

        const deduction = this.getDeduction(t);
        const gap = w - (laVal + raVal);

        let sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth;

        if (itemMode === 'dovetail') {
            sideLen = d - deduction;
            backWidth = w;
            // Cross-Checked: Overall Depth - Back Joint Deduction - Front Material Thickness
            udDisplay = autoPocket ? (d - deduction - t) : (udRaw + t - deduction);
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * t);
        } else if (itemMode === 'dowel') {
            sideLen = d;
            backWidth = w - (2 * t);
            // Cross-Checked: Overall Depth - Front Material Thickness
            udDisplay = autoPocket ? (d - t) : (udRaw + t);
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = gap;
        } else if (itemMode === 'hybrid') {
            backWidth = w;
            sideLen = d - (deduction / 2); 
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = w - (dLA + dRA + (4 * t));
            // Cross-Checked: Shortened Side Blank - Front Material Thickness
            udDisplay = autoPocket ? (d - (deduction / 2) - t) : (udRaw + t);
        } else if (itemMode === 'threeQuarterFront') {
            const frontT = 0.750;
            const frontDeduction = this.getDeduction(frontT); // 0.750
            backWidth = w + lipL + lipR;
            
            sideLen = d - ((frontDeduction / 2) + (deduction / 2) + 0.062);
            // Cross-Checked: Shortened Side Blank - Fixed 3/4" Front Panel Thickness
            udDisplay = autoPocket ? (d - (deduction / 2) - frontT) : (udRaw + frontT - frontDeduction);
            
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        }

        return { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth };
    }
};
