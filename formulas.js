// formulas.js - Isolated manufacturing logic
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

        const deduction = this.getDeduction(t);
        const gap = w - (laVal + raVal);

        let sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth;

        if (itemMode === 'dovetail') {
            sideLen = d - deduction;
            backWidth = w;
            udDisplay = udRaw + t - deduction;
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * t);
        } else if (itemMode === 'dowel') {
            sideLen = d;
            backWidth = w - (2 * t);
            udDisplay = udRaw + t;
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = gap;
        } else if (itemMode === 'hybrid') {
            backWidth = w;
            sideLen = d - (deduction / 2); 
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = w - (dLA + dRA + (4 * t));
            udDisplay = udRaw + t;
        } else if (itemMode === 'threeQuarterFront') {
            // 3/4" Front Only, rest matches Dovetail spec
            const frontT = 0.750;
            const frontDeduction = this.getDeduction(frontT);
            
            // Side length deduction combines half of the 3/4" front joint and half of the standard back joint
            sideLen = d - ((frontDeduction / 2) + (deduction / 2));
            backWidth = w;
            
            // Pocket depth display compensates for the fixed 3/4" material thickness
            udDisplay = udRaw + frontT - frontDeduction;
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        }

        return { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth };
    }
};