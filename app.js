import { FORMULA_CONFIG } from './formulas.js';
import { getCurrentMode, setCurrentMode } from './js/state.js';
import { parseFraction, normalizeFractionField } from './js/utils.js';
import { getFormPayload, getValidationIssue, getRequiredFieldIds } from './js/validation.js';
import { generateSVG } from './js/svg.js';
import {
    setValidationMessage, updateSpecReadout, hideSpecReadout,
    setPreviewStatus, setAddButtonEnabled, showToast
} from './js/ui.js';
import {
    applyModeButtonStates, applyModeTheme, setLipFieldsVisible
} from './js/modes.js';
import {
    loadQueueFromStorage, renderQueue, addItem,
    removeItem, clearQueue, exportQueueJson, importQueueJson, duplicateItem
} from './js/queue.js';

/** Dimension fields that accept mixed fractions like "19 1/2" — all modes. */
const FRACTION_FIELD_IDS = ['width', 'depth', 'height', 'uDepth', 'lArm', 'rArm', 'lipLeft', 'lipRight'];

function normalizeAllFractionInputs() {
    let changed = false;
    FRACTION_FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (normalizeFractionField(el)) changed = true;
    });
    return changed;
}

function onFractionFieldBlur(e) {
    if (normalizeFractionField(e.target)) validateInput();
}

function validateInput() {
    const mode = getCurrentMode();
    const isAutoPocketChecked = document.getElementById('autoPocketToggle').checked;
    const pocketInputContainer = document.getElementById('pocket-input-container');
    const frame = document.getElementById('display-frame');

    pocketInputContainer.classList.toggle('hidden', isAutoPocketChecked);

    const fields = getRequiredFieldIds(mode, isAutoPocketChecked);
    let isComplete = true;
    let hasAnyInput = false;

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const empty = el.value.trim() === '';
        if (!empty) hasAnyInput = true;
        el.classList.remove('input-invalid');

        if (empty) {
            isComplete = false;
        } else {
            const parsed = (id === 'qty') ? parseFloat(el.value) : parseFraction(el.value);
            if (isNaN(parsed) || parsed < 0) {
                isComplete = false;
                el.classList.add('input-invalid');
            }
            if ((id !== 'lipLeft' && id !== 'lipRight') && parsed <= 0) {
                isComplete = false;
                el.classList.add('input-invalid');
            }
        }
    });

    if (isComplete) {
        const payload = getFormPayload();
        if (isNaN(payload.width) || isNaN(payload.depth) || isNaN(payload.lArm) || isNaN(payload.rArm) || isNaN(payload.t)) {
            isComplete = false;
        } else {
            const issue = getValidationIssue(payload, mode);
            if (issue) {
                isComplete = false;
                setValidationMessage(issue);
            } else {
                setValidationMessage('');
            }
        }
    } else if (hasAnyInput) {
        setValidationMessage('Fill all required fields with valid positive values.');
    } else {
        setValidationMessage('');
    }

    if (isComplete) {
        frame.classList.add('is-live');
        setPreviewStatus('live');
        setAddButtonEnabled(true, mode);
        updatePreview();
    } else {
        frame.classList.remove('is-live');
        setPreviewStatus(hasAnyInput ? 'incomplete' : 'idle');
        setAddButtonEnabled(false, mode);
        hideSpecReadout();
    }
}

function resetForm() {
    document.querySelectorAll('#entry-form input:not([readonly])').forEach(i => {
        if (i.id !== 'lipLeft' && i.id !== 'lipRight') i.value = '';
        i.classList.remove('input-invalid');
    });
    document.getElementById('thick').value = '0.500';
    document.getElementById('lipLeft').value = '0.188';
    document.getElementById('lipRight').value = '0.188';
    document.getElementById('display-frame').classList.remove('is-live');
    setValidationMessage('');
    validateInput();
}

function setMode(mode) {
    const filledInputs = Array.from(document.querySelectorAll('#entry-form input:not([readonly])'))
        .some(i => i.value.trim() !== '' && i.id !== 'lipLeft' && i.id !== 'lipRight');
    if (filledInputs && !confirm('Switch construction mode? This will discard your unsaved specifications.')) {
        return;
    }

    setCurrentMode(mode);
    resetForm();
    document.getElementById('autoPocketToggle').checked = false;
    applyModeButtonStates(mode);
    applyModeTheme(mode);
    setLipFieldsVisible(mode === 'threeQuarterFront');
    validateInput();
}

function updatePreview() {
    const payload = getFormPayload();
    const calcs = FORMULA_CONFIG.calculateValues(getCurrentMode(), payload);
    generateSVG(payload, 'preview-svg', true, getCurrentMode(), false);
    updateSpecReadout(payload, calcs, getCurrentMode());
}

function addToQueue() {
    normalizeAllFractionInputs();

    const sel = document.getElementById('thick');
    const isAutoChecked = document.getElementById('autoPocketToggle').checked;

    addItem({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        mode: getCurrentMode(),
        label: document.getElementById('label').value || 'Unit',
        qty: parseFloat(document.getElementById('qty').value) || 1,
        t: parseFloat(sel.value),
        tName: sel.options[sel.selectedIndex].text,
        width: parseFraction(document.getElementById('width').value),
        depth: parseFraction(document.getElementById('depth').value),
        height: parseFraction(document.getElementById('height').value),
        uDepth: isAutoChecked ? 0 : parseFraction(document.getElementById('uDepth').value),
        lArm: parseFraction(document.getElementById('lArm').value),
        rArm: parseFraction(document.getElementById('rArm').value),
        lipLeft: parseFraction(document.getElementById('lipLeft').value),
        lipRight: parseFraction(document.getElementById('lipRight').value),
        autoPocket: isAutoChecked
    });
    showToast('Added to queue');
    resetForm();
}

function triggerImport() {
    document.getElementById('import-file').click();
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const addBtn = document.getElementById('add-btn');
            if (addBtn && !addBtn.disabled) {
                e.preventDefault();
                addToQueue();
            }
        }
    });
}

window.validateInput = validateInput;
window.resetForm = resetForm;
window.setMode = setMode;
window.addToQueue = addToQueue;
window.removeItem = removeItem;
window.clearQueue = clearQueue;
window.duplicateItem = duplicateItem;
window.exportQueueJson = exportQueueJson;
window.triggerImport = triggerImport;

window.onload = function() {
    loadQueueFromStorage();
    applyModeButtonStates(getCurrentMode());
    applyModeTheme(getCurrentMode());
    setLipFieldsVisible(getCurrentMode() === 'threeQuarterFront');
    renderQueue();
    validateInput();
    initKeyboardShortcuts();

    FRACTION_FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('blur', onFractionFieldBlur);
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) importQueueJson(file);
        e.target.value = '';
    });
};
