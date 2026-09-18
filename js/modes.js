const MODE_BTN_ACTIVE = 'mode-btn mode-btn-active';
const MODE_BTN_INACTIVE = 'mode-btn mode-btn-inactive';

const MODE_BUTTONS = {
    dovetail: { btn: 'btn-dovetail', color: 'bg-orange-600' },
    dowel: { btn: 'btn-dowel', color: 'bg-blue-600' },
    hybrid: { btn: 'btn-hybrid', color: 'bg-indigo-600' },
    outerDtInnerDwl: { btn: 'btn-outer-dt-inner-dwl', color: 'bg-teal-700' },
    threeQuarterFront: { btn: 'btn-34front', color: 'bg-amber-700' }
};

const MODE_THEMES = {
    dovetail: {
        bodyClass: 'p-4 lg:p-8 mode-dovetail text-slate-800',
        headerClass: 'bg-orange-950 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl commercial-shadow mb-6 border-t-2 border-orange-600 transition-all',
        title: 'Dovetail Mode',
        chipText: 'Active: Dovetail',
        chipClass: 'px-3.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold uppercase rounded-full tracking-widest'
    },
    dowel: {
        bodyClass: 'p-4 lg:p-8 mode-dowel text-slate-800',
        headerClass: 'bg-slate-900 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl commercial-shadow mb-6 border-t-2 border-blue-600 transition-all',
        title: 'Dowel Mode',
        chipText: 'Active: Dowel',
        chipClass: 'px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-widest'
    },
    hybrid: {
        bodyClass: 'p-4 lg:p-8 mode-hybrid text-slate-800',
        headerClass: 'bg-indigo-950 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl commercial-shadow mb-6 border-t-2 border-indigo-600 transition-all',
        title: 'DT Front / DWL Back Mode',
        chipText: 'Active: DT Frt / DWL Bk',
        chipClass: 'px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-widest'
    },
    outerDtInnerDwl: {
        bodyClass: 'p-4 lg:p-8 mode-outerDtInnerDwl text-slate-800',
        headerClass: 'bg-teal-950 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl commercial-shadow mb-6 border-t-2 border-teal-600 transition-all',
        title: 'Outer DT / Inner DWL Mode',
        chipText: 'Active: Outer DT / Inner DWL',
        chipClass: 'px-3.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase rounded-full tracking-widest'
    },
    threeQuarterFront: {
        bodyClass: 'p-4 lg:p-8 mode-threeQuarterFront text-slate-800',
        headerClass: 'bg-amber-950 px-5 sm:px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl commercial-shadow mb-6 border-t-2 border-amber-600 transition-all',
        title: '3/4" Front Only / Dovetail Spec Mode',
        chipText: 'Active: 3/4" Frt DT',
        chipClass: 'px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded-full tracking-widest'
    }
};

export function applyModeButtonStates(mode) {
    Object.entries(MODE_BUTTONS).forEach(([key, cfg]) => {
        const el = document.getElementById(cfg.btn);
        if (!el) return;
        el.className = key === mode
            ? `${MODE_BTN_ACTIVE} ${cfg.color}`
            : MODE_BTN_INACTIVE;
    });
}

export function applyModeTheme(mode) {
    const theme = MODE_THEMES[mode];
    if (!theme) return;

    document.getElementById('main-body').className = theme.bodyClass;
    document.getElementById('header-bar').className = theme.headerClass;
    document.getElementById('header-title').textContent = theme.title;

    const chip = document.getElementById('status-chip');
    chip.textContent = theme.chipText;
    chip.className = theme.chipClass;
}

export function setLipFieldsVisible(visible) {
    const lipContainer = document.getElementById('lip-fields-container');
    lipContainer.classList.toggle('hidden', !visible);
}

export { MODE_BTN_ACTIVE, MODE_BTN_INACTIVE };
