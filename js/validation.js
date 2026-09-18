import { FORMULA_CONFIG } from '../formulas.js';
import { parseFraction } from './utils.js';

export function getFormPayload() {
    const isAutoChecked = document.getElementById('autoPocketToggle').checked;
    return {
        label: document.getElementById('label').value || 'Unit',
        qty: parseFloat(document.getElementById('qty').value) || 0,
        t: parseFloat(document.getElementById('thick').value),
        width: parseFraction(document.getElementById('width').value),
        depth: parseFraction(document.getElementById('depth').value),
        height: parseFraction(document.getElementById('height').value),
        uDepth: isAutoChecked ? 0 : parseFraction(document.getElementById('uDepth').value),
        lArm: parseFraction(document.getElementById('lArm').value),
        rArm: parseFraction(document.getElementById('rArm').value),
        lipLeft: parseFraction(document.getElementById('lipLeft').value),
        lipRight: parseFraction(document.getElementById('lipRight').value),
        autoPocket: isAutoChecked
    };
}

/** Same rules as original app — do not change thresholds without shop verification. */
export function getValidationIssue(payload, mode) {
    const { width: boxW, depth: boxD, lArm: leftA, rArm: rightA, t, autoPocket } = payload;
    const deduction = FORMULA_CONFIG.getDeduction(t);

    if ((leftA + rightA) >= (boxW - 1.000)) return 'Left and right arms are too wide for the box width.';
    if (leftA >= boxW || rightA >= boxW) return 'Each arm width must be less than the outer box width.';

    if (!autoPocket) {
        const uDepthVal = payload.uDepth;
        if (isNaN(uDepthVal) || uDepthVal >= (boxD - 1.000) || uDepthVal <= 0) {
            return 'U-shape pocket depth must be greater than 0 and at least 1" less than box depth.';
        }
    } else {
        if (mode === 'dovetail' && boxD <= (t + deduction)) return 'Box depth is too shallow for auto-flush dovetail at this thickness.';
        if (mode === 'dowel' && boxD <= (2 * t)) return 'Box depth is too shallow for auto-flush dowel at this thickness.';
        if (mode === 'hybrid' && boxD <= (t + (deduction / 2))) return 'Box depth is too shallow for auto-flush hybrid at this thickness.';
        if (mode === 'outerDtInnerDwl' && boxD <= (t + deduction)) return 'Box depth is too shallow for auto-flush Outer DT / Inner DWL at this thickness.';
        if (mode === 'threeQuarterFront' && boxD <= (0.750 + (deduction / 2))) return 'Box depth is too shallow for 3/4" front auto-flush at this thickness.';
    }

    const mathResult = FORMULA_CONFIG.calculateValues(mode, payload);
    if (isNaN(mathResult.sideLen) || isNaN(mathResult.backWidth) || isNaN(mathResult.udDisplay)) {
        return 'Calculated dimensions are invalid for the current inputs.';
    }
    return '';
}

export function getRequiredFieldIds(mode, autoPocket) {
    const fields = ['qty', 'width', 'depth', 'height', 'lArm', 'rArm'];
    if (!autoPocket) fields.push('uDepth');
    if (mode === 'threeQuarterFront') fields.push('lipLeft', 'lipRight');
    return fields;
}
