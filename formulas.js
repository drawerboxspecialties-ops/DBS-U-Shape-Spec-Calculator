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
        
        // Dynamic lips for 3/4" front profiles
        const hasLips = (itemMode === 'threeQuarterFront' || itemMode === 'threeQuarterFrontDowelInside');
        const lipL = hasLips ? (parseFloat(data.lipLeft) ?? 0.188) : 0;
        const lipR = hasLips ? (parseFloat(data.lipRight) ?? 0.188) : 0;

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
            const frontT = 0.750;
            const frontDeduction = this.getDeduction(frontT); // 0.750
            backWidth = w + lipL + lipR;
            
            // Processed side length matching engineered joint tolerances
            sideLen = d - ((frontDeduction / 2) + (deduction / 2) + 0.062);
            
            udDisplay = udRaw + frontT - frontDeduction;
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        } else if (itemMode === 'threeQuarterFrontDowelInside') {
            const frontT = 0.750;
            backWidth = w + lipL + lipR;
            
            // Reuses identical engineered joint side length deductions as the 3/4 DT profile
            sideLen = d - ((frontT / 2) + (deduction / 2) + 0.062);
            
            // Auto-Calculated: Overall Depth - Front Thickness (0.750) - Half back joint deduction
            udDisplay = d - frontT - (deduction / 2);
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        }

        return { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth };
    }
};
