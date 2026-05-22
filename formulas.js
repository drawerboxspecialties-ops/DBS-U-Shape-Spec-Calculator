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
        // Direct assignment of clean floats passed from the application boundary contract
        const t = data.t;
        const w = data.width;
        const d = data.depth;
        const laVal = data.lArm;
        const raVal = data.rArm;
        const udRaw = data.uDepth || 0;
        const autoPocket = !!data.autoPocket; 

        // Overlays apply strictly to the 3/4" Front specification mode layout
        const hasLips = (itemMode === 'threeQuarterFront');
        const lipL = hasLips ? (data.lipLeft ?? 0.188) : 0;
        const lipR = hasLips ? (data.lipRight ?? 0.188) : 0;

        const deduction = this.getDeduction(t);
        const gap = w - (laVal + raVal);

        let sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth;

        if (itemMode === 'dovetail') {
            sideLen = d - deduction;
            backWidth = w;
            // Toggle ON: Total Depth - Back Joint Deduction - Front Material Thickness (e.g. 18 - 0.159 - 0.472 = 17.369)
            // Toggle OFF: Returns exact raw manual entry value
            udDisplay = autoPocket ? (d - deduction - t) : udRaw;
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * t);
        } else if (itemMode === 'dowel') {
            sideLen = d;
            backWidth = w - (2 * t);
            // Toggle ON: Total Depth - Front Material Thickness (e.g. 18 - 0.472 = 17.528)
            // Toggle OFF: Returns exact raw manual entry value
            udDisplay = autoPocket ? (d - t) : udRaw;
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = gap;
        } else if (itemMode === 'hybrid') {
            backWidth = w;
            sideLen = d - (deduction / 2); 
            dLA = laVal - (2 * t); 
            dRA = raVal - (2 * t);
            notchHorizontalWidth = w - (dLA + dRA + (4 * t));
            // Toggle ON: Shortened Side Blank - Front Material Thickness
            // Toggle OFF: Returns exact raw manual entry value
            udDisplay = autoPocket ? (d - (deduction / 2) - t) : udRaw;
        } else if (itemMode === 'threeQuarterFront') {
            const frontT = 0.750;
            const frontDeduction = this.getDeduction(frontT); // 0.750
            backWidth = w + lipL + lipR;
            
            sideLen = d - ((frontDeduction / 2) + (deduction / 2) + 0.062);
            // Toggle ON: Shortened Side Blank - Fixed 3/4" Front Panel Thickness
            // Toggle OFF: Returns exact raw manual entry value Flawlessly
            udDisplay = autoPocket ? (d - (deduction / 2) - frontT) : udRaw;
            
            dLA = laVal; 
            dRA = raVal;
            notchHorizontalWidth = gap + (2 * frontT);
        }

        return { sideLen, backWidth, udDisplay, dLA, dRA, notchHorizontalWidth };
    }
};
