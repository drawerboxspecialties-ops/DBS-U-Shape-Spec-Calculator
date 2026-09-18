import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMULA_CONFIG } from '../formulas.js';

const basePayload = {
    width: 20,
    height: 6,
    lArm: 4,
    rArm: 4,
    uDepth: 12,
    lipLeft: 0.188,
    lipRight: 0.188,
    autoPocket: false
};

function approx(actual, expected, label) {
    assert.equal(Number(actual.toFixed(3)), Number(expected.toFixed(3)), label);
}

test('getDeduction returns known thickness values', () => {
    assert.equal(FORMULA_CONFIG.getDeduction(0.500), 0.374);
    assert.equal(FORMULA_CONFIG.getDeduction(0.591), 0.556);
    assert.equal(FORMULA_CONFIG.getDeduction(0.472), 0.318);
});

test('15mm dovetail D21 → side 20.444 (shop verified)', () => {
    const r = FORMULA_CONFIG.calculateValues('dovetail', {
        ...basePayload,
        t: 0.591,
        depth: 21
    });
    approx(r.sideLen, 20.444, 'side length');
});

test('dovetail back width equals outer width', () => {
    const r = FORMULA_CONFIG.calculateValues('dovetail', { ...basePayload, t: 0.500, depth: 18 });
    approx(r.backWidth, 20, 'back width');
});

test('dowel back width subtracts 2× thickness', () => {
    const r = FORMULA_CONFIG.calculateValues('dowel', { ...basePayload, t: 0.500, depth: 18 });
    approx(r.backWidth, 19, 'dowel back');
});

test('hybrid side uses half deduction', () => {
    const r = FORMULA_CONFIG.calculateValues('hybrid', { ...basePayload, t: 0.591, depth: 21 });
    approx(r.sideLen, 21 - 0.278, 'hybrid side');
});

test('auto-flush dovetail pocket depth formula', () => {
    const r = FORMULA_CONFIG.calculateValues('dovetail', {
        ...basePayload,
        t: 0.591,
        depth: 21,
        autoPocket: true,
        uDepth: 0
    });
    approx(r.udDisplay, 21 - 0.556 - 0.313, 'auto-flush u-depth');
});

test('dowel display arms subtract 2× thickness', () => {
    const r = FORMULA_CONFIG.calculateValues('dowel', { ...basePayload, t: 0.500, depth: 18 });
    approx(r.dLA, 3, 'left arm display');
    approx(r.dRA, 3, 'right arm display');
});

test('3/4" front notch and U-pocket use sides/back thickness like dovetail', () => {
    const r = FORMULA_CONFIG.calculateValues('threeQuarterFront', {
        ...basePayload,
        t: 0.472,
        depth: 18,
        lArm: 5,
        rArm: 5,
        uDepth: 5
    });
    // gap = 20 - 5 - 5 = 10; notch = 10 + 2*0.472 = 10.944
    approx(r.notchHorizontalWidth, 10.944, 'notch width');
    // U-pocket same as dovetail: 5 + 0.472 - 0.318 = 5.154
    approx(r.udDisplay, 5.154, 'u-pocket depth');
    approx(r.backWidth, 20.376, 'back width with lips');
});

test('Outer DT / Inner DWL: outer blanks dovetail, cutout dowel-style', () => {
    const r = FORMULA_CONFIG.calculateValues('outerDtInnerDwl', {
        ...basePayload,
        t: 0.472,
        depth: 18,
        lArm: 5,
        rArm: 5,
        uDepth: 5
    });
    approx(r.sideLen, 18 - 0.318, 'side length (dovetail outer)');
    approx(r.backWidth, 20, 'back width (dovetail outer)');
    approx(r.dLA, 5, 'left arm as entered');
    approx(r.dRA, 5, 'right arm as entered');
    approx(r.notchHorizontalWidth, 10, 'notch = gap (dowel cutout)');
    approx(r.udDisplay, 5.472, 'u-pocket dowel-style');
});
