// ==== SETUP: paste your deployed Google Apps Script Web App URL below ====
const API_URL = 'https://script.google.com/macros/s/AKfycbwvqrC1fCl5jRJIfBizIIKquHS13YBhrMyuSgtuy5IzdwC4HWhR69MwzTBTrHQXXCy5/exec';
const SECRET_KEY = '3058d732b248b00519bae478e685e280'; // must match Code.gs
const CHEF_PIN = '0404'; // must match Code.gs - chef-only actions are re-checked on the server too
// ===========================================================================

const FETCH_TIMEOUT_MS = 8000;
const PENDING_KEY = 'pendingActions';
const CACHED_PRODUCTS_KEY = 'cachedProducts';

const translations = {
  de: {
    title: 'Bestellliste', loading: 'Wird geladen...',
    offlineBanner: 'Kein Internet - wird lokal gespeichert und später gesendet',
    chefLogin: 'Chef', chefLogout: 'Chef ✓ (abmelden)', chefPinPrompt: 'Chef-PIN eingeben:', chefPinWrong: 'Falscher PIN',
    tabCatalog: 'Katalog', tabBasket: 'Warenkorb', tabDelivery: 'Lieferung', tabCalendar: 'Kalender', tabNotes: 'Notizen', tabReport: 'Bericht', tabDocuments: 'Dokumente',
    yourName: 'Ihr Name', addToBasket: 'In den Warenkorb', sentToBasket: 'Zum Warenkorb hinzugefügt!',
    manageProducts: 'Produkte verwalten', addProductTitle: 'Neues Produkt (nur Chef)', nameDe: 'Name (Deutsch)', nameEn: 'Name (Englisch)', nameIt: 'Name (Italienisch)',
    unit: 'Einheit (kg, Stück...)', newCategoryOption: '+ Neue Kategorie', newCategoryName: 'Name der neuen Kategorie',
    price: 'Preis (€)', supplier: 'Lieferant / Bestellquelle',
    addProductBtn: 'Produkt hinzufügen', productAdded: 'Produkt hinzugefügt!',
    editProductTitle: 'Produkt bearbeiten (nur Chef)', saveProductBtn: 'Speichern',
    manageExpenses: 'Zusätzliche Ausgabe erfassen', expenseDesc: 'Was wurde gekauft (z.B. 2 kg Tomaten)',
    expenseAmount: 'Betrag (€)', addExpenseBtn: 'Ausgabe hinzufügen', expenseAdded: 'Ausgabe hinzugefügt!',
    grandTotal: 'Gesamt diesen Monat', productsCost: 'Bestellte Produkte', extraExpenses: 'Zusätzliche Ausgaben',
    monthlyReports: 'Monatsberichte', uploadDocTitle: 'Dokument hochladen', docDescription: 'Beschreibung (z.B. Rechnung Metro)',
    chooseOrPhoto: 'Foto aufnehmen oder Datei wählen', uploadBtn: 'Hochladen', docUploaded: 'Dokument hochgeladen!',
    saveAndSend: 'Speichern & Senden', accountantEmail: 'E-Mail des Buchhalters', sendEmailBtn: 'Per E-Mail senden', emailSent: 'E-Mail gesendet!',
    savedToDocuments: 'Als PDF in Dokumenten gespeichert!',
    catVegetables: 'Gemüse', catDairy: 'Milchprodukte', catMeat: 'Fleisch', catDrinks: 'Getränke', catOther: 'Sonstiges',
    basketEmpty: 'Der Warenkorb ist leer.', finalizeBtn: 'Bestellung abschließen (nur Chef)',
    orderFinalized: 'Bestellung abgeschlossen!', basketEmptyError: 'Warenkorb ist leer.',
    noOrderYet: 'Noch keine Bestellung.', statusPending: 'Ausstehend', statusArrived: 'Angekommen', statusMissing: 'Fehlt',
    notePlaceholder: 'Notiz schreiben...', markChefNote: 'Als Chef-Notiz markieren', addNoteBtn: 'Notiz hinzufügen',
    chefNoteLabel: 'Notiz vom Chef', queued: 'Kein Internet: wird automatisch gesendet, sobald Internet da ist.',
    syncError: 'Fehler beim Laden. Erneut versuchen.',
    searchPlaceholder: 'Produkt suchen...', noSearchResults: 'Kein Produkt gefunden.',
    cancelBtn: 'Abbrechen', confirmBtn: 'Bestätigen',
    confirmDeleteProduct: 'Produkt "{name}" wirklich löschen?', productDeleted: 'Produkt gelöscht.'
  },
  en: {
    title: 'Order List', loading: 'Loading...',
    offlineBanner: 'No internet - saved locally and sent later',
    chefLogin: 'Chef', chefLogout: 'Chef ✓ (log out)', chefPinPrompt: 'Enter chef PIN:', chefPinWrong: 'Wrong PIN',
    tabCatalog: 'Catalog', tabBasket: 'Basket', tabDelivery: 'Delivery', tabCalendar: 'Calendar', tabNotes: 'Notes', tabReport: 'Report', tabDocuments: 'Documents',
    yourName: 'Your Name', addToBasket: 'Add to basket', sentToBasket: 'Added to basket!',
    manageProducts: 'Manage products', addProductTitle: 'New product (chef only)', nameDe: 'Name (German)', nameEn: 'Name (English)', nameIt: 'Name (Italian)',
    unit: 'Unit (kg, piece...)', newCategoryOption: '+ New category', newCategoryName: 'New category name',
    price: 'Price (€)', supplier: 'Supplier / where to order',
    addProductBtn: 'Add product', productAdded: 'Product added!',
    editProductTitle: 'Edit product (chef only)', saveProductBtn: 'Save',
    manageExpenses: 'Log an extra expense', expenseDesc: 'What was bought (e.g. 2 kg tomatoes)',
    expenseAmount: 'Amount (€)', addExpenseBtn: 'Add expense', expenseAdded: 'Expense added!',
    grandTotal: 'Total this month', productsCost: 'Ordered products', extraExpenses: 'Extra expenses',
    monthlyReports: 'Monthly reports', uploadDocTitle: 'Upload document', docDescription: 'Description (e.g. Metro invoice)',
    chooseOrPhoto: 'Take a photo or choose a file', uploadBtn: 'Upload', docUploaded: 'Document uploaded!',
    saveAndSend: 'Save & Send', accountantEmail: "Accountant's email", sendEmailBtn: 'Send by email', emailSent: 'Email sent!',
    savedToDocuments: 'Saved as PDF in Documents!',
    catVegetables: 'Vegetables', catDairy: 'Dairy', catMeat: 'Meat', catDrinks: 'Drinks', catOther: 'Other',
    basketEmpty: 'The basket is empty.', finalizeBtn: 'Finalize order (chef only)',
    orderFinalized: 'Order finalized!', basketEmptyError: 'Basket is empty.',
    noOrderYet: 'No order yet.', statusPending: 'Pending', statusArrived: 'Arrived', statusMissing: 'Missing',
    notePlaceholder: 'Write a note...', markChefNote: 'Mark as chef note', addNoteBtn: 'Add note',
    chefNoteLabel: 'Note from the chef', queued: 'No internet: will be sent automatically once internet is back.',
    syncError: 'Failed to load. Retry.',
    searchPlaceholder: 'Search product...', noSearchResults: 'No product found.',
    cancelBtn: 'Cancel', confirmBtn: 'Confirm',
    confirmDeleteProduct: 'Really delete product "{name}"?', productDeleted: 'Product deleted.'
  },
  it: {
    title: 'Lista Ordini', loading: 'Caricamento...',
    offlineBanner: 'Nessuna connessione - salvato localmente e inviato più tardi',
    chefLogin: 'Chef', chefLogout: 'Chef ✓ (esci)', chefPinPrompt: 'Inserisci il PIN dello chef:', chefPinWrong: 'PIN errato',
    tabCatalog: 'Catalogo', tabBasket: 'Carrello', tabDelivery: 'Consegna', tabCalendar: 'Calendario', tabNotes: 'Note', tabReport: 'Rapporto', tabDocuments: 'Documenti',
    yourName: 'Il tuo nome', addToBasket: 'Aggiungi al carrello', sentToBasket: 'Aggiunto al carrello!',
    manageProducts: 'Gestisci prodotti', addProductTitle: 'Nuovo prodotto (solo chef)', nameDe: 'Nome (Tedesco)', nameEn: 'Nome (Inglese)', nameIt: 'Nome (Italiano)',
    unit: 'Unità (kg, pezzo...)', newCategoryOption: '+ Nuova categoria', newCategoryName: 'Nome della nuova categoria',
    price: 'Prezzo (€)', supplier: 'Fornitore / dove ordinare',
    addProductBtn: 'Aggiungi prodotto', productAdded: 'Prodotto aggiunto!',
    editProductTitle: 'Modifica prodotto (solo chef)', saveProductBtn: 'Salva',
    manageExpenses: 'Registra una spesa extra', expenseDesc: 'Cosa è stato comprato (es. 2 kg pomodori)',
    expenseAmount: 'Importo (€)', addExpenseBtn: 'Aggiungi spesa', expenseAdded: 'Spesa aggiunta!',
    grandTotal: 'Totale questo mese', productsCost: 'Prodotti ordinati', extraExpenses: 'Spese extra',
    monthlyReports: 'Rapporti mensili', uploadDocTitle: 'Carica documento', docDescription: 'Descrizione (es. fattura Metro)',
    chooseOrPhoto: 'Scatta una foto o scegli un file', uploadBtn: 'Carica', docUploaded: 'Documento caricato!',
    saveAndSend: 'Salva e invia', accountantEmail: 'Email del commercialista', sendEmailBtn: 'Invia per email', emailSent: 'Email inviata!',
    savedToDocuments: 'Salvato come PDF in Documenti!',
    catVegetables: 'Verdure', catDairy: 'Latticini', catMeat: 'Carne', catDrinks: 'Bevande', catOther: 'Altro',
    basketEmpty: 'Il carrello è vuoto.', finalizeBtn: 'Finalizza ordine (solo chef)',
    orderFinalized: 'Ordine finalizzato!', basketEmptyError: 'Il carrello è vuoto.',
    noOrderYet: 'Nessun ordine ancora.', statusPending: 'In attesa', statusArrived: 'Arrivato', statusMissing: 'Mancante',
    notePlaceholder: 'Scrivi una nota...', markChefNote: 'Segna come nota dello chef', addNoteBtn: 'Aggiungi nota',
    chefNoteLabel: 'Nota dello chef', queued: 'Senza internet: verrà inviato automaticamente quando torna internet.',
    syncError: 'Caricamento fallito. Riprova.',
    searchPlaceholder: 'Cerca prodotto...', noSearchResults: 'Nessun prodotto trovato.',
    cancelBtn: 'Annulla', confirmBtn: 'Conferma',
    confirmDeleteProduct: 'Eliminare davvero il prodotto "{name}"?', productDeleted: 'Prodotto eliminato.'
  }
};

const categoryKeys = ['vegetables', 'dairy', 'meat', 'drinks', 'other'];

const ICONS = {
  vegetables: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5-1 8-5 8-10a6 6 0 0 0-6-6c-5 0-9 4-9 10 0 3 2.5 5.5 7 6Z"/><path d="M15 6c1-2 2-3 4-3M12 6V3"/></svg>',
  dairy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6l1 3-2 2v13a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7L8 5l1-3Z"/></svg>',
  meat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3c3 0 6 3 6 6.5S18 17 14 17c-2 0-2.5 1-3.5 2.5S8 22 6 22a3 3 0 0 1-1-5.8"/><circle cx="9" cy="12" r="5"/></svg>',
  drinks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1 15a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2L7 3ZM6.5 8h11"/></svg>',
  other: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 9-5 9 5-9 5-9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
  pending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  arrived: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  missing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8ZM9 8a3 3 0 0 1 6 0"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M9 21v-4h6v4M6.5 8.5A3.5 3.5 0 0 1 10 5a2.5 2.5 0 0 1 4 0 3.5 3.5 0 0 1 3.5 3.5c0 1.6-1 3-2.5 3.4V15h-6v-3.1c-1.5-.4-2.5-1.8-2.5-3.4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18 10l-4-4L4 16v4Z"/><path d="M13 7l4 4"/></svg>',
  chevron: '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17.5 4 21l3.7-1a8 8 0 1 0-2.6-2.9L7 17.5Z"/><path d="M9 9.5c0 3.5 3 6.5 6.5 6.5.5 0 1-.5 1-1.2 0-.3-.1-.5-.4-.6l-1.9-.9a.6.6 0 0 0-.7.1l-.6.7a5 5 0 0 1-2.5-2.5l.7-.6a.6.6 0 0 0 .1-.7l-.9-1.9a.6.6 0 0 0-.6-.4c-.7 0-1.2.5-1.2 1"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 4-3 16-6-4.5L9 18l-1-6-6-2 19-6Z"/><path d="M18.5 5.5 8.5 13"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>'
};

let currentLang = localStorage.getItem('lang') || 'de';
let products = [];
let chefMode = sessionStorage.getItem('chefMode') === 'true';
let activeTab = 'catalog';
let addProductOpen = false;
let addExpenseOpen = false;
let emailReportOpen = false;
let docFileBase64 = null;
let docFileMime = null;
let editingProductId = null;
const collapsedCategories = {};

// ---------- sound feedback ----------
// Generated with the Web Audio API (no audio files needed, works fully offline).
// Must be created/resumed inside a real click handler - browsers block audio until a user gesture.
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freq, duration, delay, volume) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startTime = ctx.currentTime + (delay || 0);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (e) { /* Web Audio unavailable - fail silently */ }
}
function playClickSound() { playTone(700, 0.05, 0, 0.07); }
function playSuccessSound() { playTone(660, 0.11, 0, 0.12); playTone(990, 0.16, 0.1, 0.12); }

document.addEventListener('click', e => {
  if (e.target.closest('button')) playClickSound();
}, true);

function t(key) { return translations[currentLang][key]; }

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, Object.assign({}, options, { signal: controller.signal })).finally(() => clearTimeout(timer));
}

function apiGet(action, params) {
  const qs = new URLSearchParams(Object.assign({ action, key: SECRET_KEY }, params || {}));
  return fetchWithTimeout(`${API_URL}?${qs.toString()}`).then(r => r.json());
}

function apiPost(action, payload) {
  return fetchWithTimeout(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ action, key: SECRET_KEY }, payload))
  }).then(r => r.json());
}

// ---------- offline queue ----------

function getPending() { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }
function savePending(list) { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); }

function queueAction(action, payload) {
  const pending = getPending();
  pending.push({ action, payload });
  savePending(pending);
  updateOfflineBanner();
}

function flushPending() {
  const pending = getPending();
  if (pending.length === 0 || !navigator.onLine) { updateOfflineBanner(); return; }
  const remaining = [...pending];
  const next = remaining.shift();
  apiPost(next.action, next.payload)
    .then(() => { savePending(remaining); updateOfflineBanner(); if (remaining.length > 0) flushPending(); })
    .catch(() => updateOfflineBanner());
}

function postOrQueue(action, payload) {
  if (!navigator.onLine) { queueAction(action, payload); return Promise.resolve({ queued: true }); }
  return apiPost(action, payload).catch(() => { queueAction(action, payload); return { queued: true }; });
}

// Disables the button immediately (instant visual feedback + blocks accidental double-submits
// while the slow Apps Script backend is still responding) and restores it once settled.
function withBusy(btn, promise) {
  if (!btn) return promise;
  btn.disabled = true;
  btn.classList.add('is-busy');
  return promise.finally(() => { btn.disabled = false; btn.classList.remove('is-busy'); });
}

function updateOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  const pending = getPending();
  if (!navigator.onLine || pending.length > 0) {
    banner.style.display = 'block';
    banner.textContent = t('offlineBanner');
  } else {
    banner.style.display = 'none';
  }
}

function showMsg(elId, text, kind) {
  const el = document.getElementById(elId);
  el.textContent = text;
  el.className = 'msg ' + kind;
  setTimeout(() => { el.style.display = 'none'; el.className = 'msg'; }, 4000);
}

// ---------- chef mode ----------

function onChefButton() {
  if (chefMode) {
    chefMode = false;
    sessionStorage.removeItem('chefMode');
    updateChefUI();
    renderCatalog();
    return;
  }
  openChefPinModal();
}

function openChefPinModal() {
  const modal = document.getElementById('chef-pin-modal');
  const input = document.getElementById('chefPinInput');
  const err = document.getElementById('chefPinError');
  input.value = '';
  err.style.display = 'none';
  modal.style.display = 'flex';
  setTimeout(() => input.focus(), 50);
}

function closeChefPinModal() {
  document.getElementById('chef-pin-modal').style.display = 'none';
}

function confirmChefPin() {
  const input = document.getElementById('chefPinInput');
  const err = document.getElementById('chefPinError');
  if (input.value === CHEF_PIN) {
    chefMode = true;
    sessionStorage.setItem('chefMode', 'true');
    updateChefUI();
    renderCatalog();
    closeChefPinModal();
  } else {
    err.textContent = t('chefPinWrong');
    err.style.display = 'block';
    input.value = '';
    input.focus();
  }
}

function onChefPinKey(e) {
  if (e.key === 'Enter') confirmChefPin();
}

function updateChefUI() {
  document.querySelectorAll('.chef-only-inline').forEach(el => { el.style.display = chefMode ? 'flex' : 'none'; });
  document.getElementById('finalizeBtn').style.display = chefMode ? 'block' : 'none';
  document.getElementById('chefNoteLabelWrap').style.display = chefMode ? 'flex' : 'none';
  document.getElementById('addProductBox').style.display = (chefMode && addProductOpen) ? 'flex' : 'none';
  document.getElementById('addExpenseBox').style.display = (chefMode && addExpenseOpen) ? 'flex' : 'none';
  document.getElementById('emailReportBox').style.display = (chefMode && emailReportOpen) ? 'flex' : 'none';
  const btn = document.getElementById('chef-btn');
  const label = document.getElementById('chef-btn-label');
  btn.classList.toggle('active', chefMode);
  label.textContent = chefMode ? t('chefLogout') : t('chefLogin');
}

function toggleAddProduct() {
  addProductOpen = !addProductOpen;
  if (addProductOpen && !editingProductId) resetProductForm();
  if (!addProductOpen) editingProductId = null;
  updateChefUI();
}

function resetProductForm() {
  editingProductId = null;
  ['newProdDe', 'newProdEn', 'newProdIt', 'newProdUnit', 'newProdPrice', 'newProdSupplier'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('newProdCategoryCustom').value = '';
  renderCategoryOptions();
  onCategorySelectChange();
  document.querySelector('#addProductBox h3 span').textContent = t('addProductTitle');
  document.querySelector('#addProductBox .submit-btn span').textContent = t('addProductBtn');
}
function toggleAddExpense() { addExpenseOpen = !addExpenseOpen; updateChefUI(); }

// ---------- language + tabs ----------

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
  document.getElementById('employeeName').placeholder = t('yourName');
  ['de', 'en', 'it'].forEach(l => document.getElementById('btn-' + l).classList.toggle('active', l === currentLang));
  document.documentElement.lang = currentLang;
  updateChefUI();
  renderCatalog();
  renderCategoryOptions();
  if (activeTab === 'basket') loadBasket();
  if (activeTab === 'delivery') loadDelivery();
  if (activeTab === 'calendar') loadCalendarDate();
  if (activeTab === 'notes') loadNotes();
  if (activeTab === 'report') loadReport();
  renderChefNoteBanner();
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
  document.getElementById('lang-menu').style.display = 'none';
}

function toggleLangMenu() {
  const menu = document.getElementById('lang-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', e => {
  const menu = document.getElementById('lang-menu');
  const btn = document.getElementById('lang-btn');
  if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function showTab(tabName) {
  activeTab = tabName;
  ['catalog', 'basket', 'delivery', 'calendar', 'notes', 'report', 'documents'].forEach(name => {
    document.getElementById('view-' + name).style.display = name === tabName ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName));
  if (tabName === 'basket') loadBasket();
  if (tabName === 'delivery') loadDelivery();
  if (tabName === 'calendar') loadCalendarDate();
  if (tabName === 'notes') loadNotes();
  if (tabName === 'report') loadReport();
  if (tabName === 'documents') loadDocuments();
}

// ---------- catalog ----------

function loadProducts() {
  const cached = localStorage.getItem(CACHED_PRODUCTS_KEY);
  if (cached) { products = JSON.parse(cached); renderCatalog(); }
  else document.getElementById('loading-products').style.display = 'block';

  apiGet('products').then(data => {
    products = data;
    localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(data));
    if (!localStorage.getItem('collapsedInit') && data.length > 20) {
      Array.from(new Set(data.map(p => p.category || 'other'))).forEach(c => { collapsedCategories[c] = true; });
      localStorage.setItem('collapsedInit', '1');
    }
    document.getElementById('loading-products').style.display = 'none';
    renderCatalog();
  }).catch(() => { document.getElementById('loading-products').style.display = 'none'; });
}

function categoryLabel(cat) {
  return categoryKeys.includes(cat) ? t('cat' + cat.charAt(0).toUpperCase() + cat.slice(1)) : cat.charAt(0).toUpperCase() + cat.slice(1);
}

function renderCatalog() {
  const list = document.getElementById('catalogList');
  list.innerHTML = '';
  const searchInput = document.getElementById('catalogSearch');
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const searching = query.length > 0;
  const matches = p => !searching || ['name_de', 'name_en', 'name_it'].some(k => (p[k] || '').toLowerCase().includes(query));

  const extraCats = Array.from(new Set(products.map(p => p.category || 'other').filter(c => !categoryKeys.includes(c))));
  const allCats = categoryKeys.filter(cat => products.some(p => (p.category || 'other') === cat)).concat(extraCats);

  let anyMatch = false;

  allCats.forEach(cat => {
    const allItemsInCat = products.filter(p => (p.category || 'other') === cat);
    const items = allItemsInCat.filter(matches);
    if (allItemsInCat.length === 0 || (searching && items.length === 0)) return;
    anyMatch = true;
    const collapsed = searching ? false : !!collapsedCategories[cat];

    const header = document.createElement('div');
    header.className = 'category-header cat-' + (categoryKeys.includes(cat) ? cat : 'other');
    header.classList.toggle('collapsed', collapsed);
    header.innerHTML = `
      <button type="button" class="category-toggle">${ICONS[categoryKeys.includes(cat) ? cat : 'other']}<span>${categoryLabel(cat)}</span><small class="cat-count">${items.length}</small>${ICONS.chevron}</button>
      ${chefMode ? `<button type="button" class="cat-add-btn" aria-label="+"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>` : ''}
    `;
    header.querySelector('.category-toggle').onclick = () => { collapsedCategories[cat] = !collapsedCategories[cat]; renderCatalog(); };
    const addBtn = header.querySelector('.cat-add-btn');
    if (addBtn) addBtn.onclick = () => quickAddToCategory(cat);
    list.appendChild(header);

    if (collapsed) return;

    items.forEach(p => {
      const name = p['name_' + currentLang] || p.name_de;
      const row = document.createElement('div');
      row.className = 'product-row';
      row.innerHTML = `<span>${name} <small>(${p.unit}${p.price ? ' - ' + p.price + ' €' : ''})</small></span>
        <div class="row-actions">
          ${chefMode ? `<button type="button" class="edit-btn" onclick="startEditProduct('${p.id}')" aria-label="edit">${ICONS.edit}</button>` : ''}
          ${chefMode ? `<button type="button" class="delete-btn" onclick="deleteProductRow('${p.id}')" aria-label="delete">${ICONS.trash}</button>` : ''}
          <div class="stepper">
            <button type="button" class="step-btn" onclick="stepQty('${p.id}',-1)" aria-label="-">-</button>
            <input type="number" min="0" inputmode="numeric" data-id="${p.id}" value="0">
            <button type="button" class="step-btn plus" onclick="stepQty('${p.id}',1)" aria-label="+">+</button>
          </div>
        </div>`;
      list.appendChild(row);
    });
  });

  if (searching && !anyMatch) {
    list.innerHTML = `<div class="empty-state">${ICONS.empty}<p>${t('noSearchResults')}</p></div>`;
  }
}

function quickAddToCategory(cat) {
  addProductOpen = true;
  editingProductId = null;
  resetProductForm();
  const select = document.getElementById('newProdCategory');
  if ([...select.options].some(o => o.value === cat)) select.value = cat;
  onCategorySelectChange();
  updateChefUI();
  document.getElementById('addProductBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function startEditProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  editingProductId = id;
  document.getElementById('newProdDe').value = product.name_de || '';
  document.getElementById('newProdEn').value = product.name_en || '';
  document.getElementById('newProdIt').value = product.name_it || '';
  document.getElementById('newProdUnit').value = product.unit || '';
  document.getElementById('newProdPrice').value = product.price || '';
  document.getElementById('newProdSupplier').value = product.supplier || '';
  renderCategoryOptions();
  const select = document.getElementById('newProdCategory');
  if ([...select.options].some(o => o.value === product.category)) select.value = product.category;
  onCategorySelectChange();
  document.querySelector('#addProductBox h3 span').textContent = t('editProductTitle');
  document.querySelector('#addProductBox .submit-btn span').textContent = t('saveProductBtn');
  addProductOpen = true;
  updateChefUI();
  document.getElementById('addProductBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Generic confirm modal - never use window.confirm()/alert()/prompt() here: those are
// silently disabled in installed (standalone) PWA mode on iOS and some Android browsers.
let confirmModalCallback = null;
function showConfirm(text, callback) {
  document.getElementById('confirmModalText').textContent = text;
  confirmModalCallback = callback;
  document.getElementById('confirm-modal').style.display = 'flex';
}
function closeConfirmModal() {
  document.getElementById('confirm-modal').style.display = 'none';
  confirmModalCallback = null;
}
function confirmModalYes() {
  const cb = confirmModalCallback;
  closeConfirmModal();
  if (cb) cb();
}

function deleteProductRow(id) {
  const product = products.find(p => p.id === id);
  const name = product ? (product['name_' + currentLang] || product.name_de) : id;
  showConfirm(t('confirmDeleteProduct').replace('{name}', name), () => {
    postOrQueue('deleteProduct', { pin: CHEF_PIN, id }).then(res => {
      if (res.error) { showMsg('addProductMessage', res.error, 'error'); return; }
      showMsg('addProductMessage', res.queued ? t('queued') : t('productDeleted'), res.queued ? 'info' : 'success');
      if (!res.queued) loadProducts();
    });
  });
}

function stepQty(id, delta) {
  const input = document.querySelector(`#catalogList input[data-id="${id}"]`);
  if (!input) return;
  const next = Math.max(0, (Number(input.value) || 0) + delta);
  input.value = next;
}

function renderCategoryOptions() {
  const select = document.getElementById('newProdCategory');
  select.innerHTML = '';
  categoryKeys.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = t('cat' + cat.charAt(0).toUpperCase() + cat.slice(1));
    select.appendChild(opt);
  });
  const extraCats = Array.from(new Set(products.map(p => p.category).filter(c => !categoryKeys.includes(c))));
  extraCats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(opt);
  });
  const newOpt = document.createElement('option');
  newOpt.value = '__new__';
  newOpt.textContent = t('newCategoryOption');
  select.appendChild(newOpt);
}

function onCategorySelectChange() {
  const isNew = document.getElementById('newProdCategory').value === '__new__';
  document.getElementById('newProdCategoryCustom').style.display = isNew ? 'block' : 'none';
}

function submitToBasket(btn) {
  if (btn && btn.disabled) return;
  const employeeName = document.getElementById('employeeName').value;
  const inputs = document.querySelectorAll('#catalogList input');
  const items = [];
  inputs.forEach(inp => { if (inp.value && Number(inp.value) > 0) items.push({ id: inp.getAttribute('data-id'), quantity: inp.value }); });
  if (items.length === 0) return;
  withBusy(btn, postOrQueue('addToBasket', { employeeName, items })).then(res => {
    inputs.forEach(inp => inp.value = '');
    showMsg('catalogMessage', res.queued ? t('queued') : t('sentToBasket'), res.queued ? 'info' : 'success');
  });
}

function submitProduct(btn) {
  if (btn && btn.disabled) return;
  const categorySelect = document.getElementById('newProdCategory').value;
  const category = categorySelect === '__new__' ? document.getElementById('newProdCategoryCustom').value.trim() : categorySelect;
  const product = {
    name_de: document.getElementById('newProdDe').value,
    name_en: document.getElementById('newProdEn').value,
    name_it: document.getElementById('newProdIt').value,
    unit: document.getElementById('newProdUnit').value,
    category: category || 'other',
    price: document.getElementById('newProdPrice').value,
    supplier: document.getElementById('newProdSupplier').value
  };
  if (!product.name_de) return;

  const isEdit = !!editingProductId;
  const action = isEdit ? 'updateProduct' : 'addProduct';
  const payload = isEdit ? { pin: CHEF_PIN, id: editingProductId, product } : { pin: CHEF_PIN, product };

  withBusy(btn, postOrQueue(action, payload)).then(res => {
    if (res.error) { showMsg('addProductMessage', res.error, 'error'); return; }
    showMsg('addProductMessage', res.queued ? t('queued') : t('productAdded'), res.queued ? 'info' : 'success');
    if (!res.queued) { playSuccessSound(); resetProductForm(); addProductOpen = false; updateChefUI(); loadProducts(); }
  });
}

// ---------- basket ----------

function loadBasket() {
  const list = document.getElementById('basketList');
  list.innerHTML = t('loading');
  apiGet('basket').then(data => renderBasket(data)).catch(() => { list.innerHTML = t('syncError'); });
}

function renderBasket(data) {
  const list = document.getElementById('basketList');
  list.innerHTML = '';
  if (data.length === 0) { list.innerHTML = `<div class="empty-state">${ICONS.empty}<p>${t('basketEmpty')}</p></div>`; return; }
  data.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const name = product ? (product['name_' + currentLang] || product.name_de) : item.id;
    const row = document.createElement('div');
    row.className = 'basket-row';
    row.innerHTML = `<span>${name}</span>
      <div class="basket-row-right">
        <strong>${item.quantity} ${item.unit}</strong>
        <button class="delete-btn" onclick="removeFromBasket('${item.id}')" aria-label="delete">${ICONS.trash}</button>
      </div>`;
    list.appendChild(row);
  });
}

function removeFromBasket(productId) {
  postOrQueue('removeFromBasket', { productId }).then(() => loadBasket());
}

function finalizeOrder(btn) {
  if (btn && btn.disabled) return;
  withBusy(btn, postOrQueue('finalizeOrder', { pin: CHEF_PIN })).then(res => {
    if (res.error === 'empty') { showMsg('basketMessage', t('basketEmptyError'), 'error'); return; }
    if (res.error) { showMsg('basketMessage', res.error, 'error'); return; }
    showMsg('basketMessage', res.queued ? t('queued') : t('orderFinalized'), res.queued ? 'info' : 'success');
    if (!res.queued) { playSuccessSound(); loadBasket(); }
  });
}

// ---------- delivery (latest order) ----------

function loadDelivery() {
  apiGet('orderDates').then(dates => {
    if (dates.length === 0) {
      document.getElementById('deliveryDateLabel').textContent = '';
      document.getElementById('deliveryList').innerHTML = `<p>${t('noOrderYet')}</p>`;
      return;
    }
    const latest = dates[0];
    document.getElementById('deliveryDateLabel').textContent = latest;
    apiGet('orderByDate', { date: latest }).then(items => renderStatusList('deliveryList', latest, items));
  }).catch(() => { document.getElementById('deliveryList').innerHTML = t('syncError'); });
}

function renderStatusList(containerId, orderDate, items) {
  const list = document.getElementById(containerId);
  list.innerHTML = '';
  if (items.length === 0) { list.innerHTML = `<div class="empty-state">${ICONS.pending}<p>${t('noOrderYet')}</p></div>`; return; }
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const name = product ? (product['name_' + currentLang] || product.name_de) : item.productId;
    const row = document.createElement('div');
    row.className = 'status-row';
    const pills = ['pending', 'arrived', 'missing'].map(s =>
      `<button class="status-pill ${s} ${item.status === s ? 'active' : ''}" onclick="setStatus('${orderDate}','${item.productId}','${s}','${containerId}')">${ICONS[s]}${t('status' + s.charAt(0).toUpperCase() + s.slice(1))}</button>`
    ).join('');
    row.innerHTML = `<span>${name} <small>(${item.quantity} ${item.unit})</small></span><div class="status-pills">${pills}</div>`;
    list.appendChild(row);
  });
}

function setStatus(orderDate, productId, status, containerId) {
  postOrQueue('setDeliveryStatus', { orderDate, productId, status, updatedBy: document.getElementById('employeeName').value }).then(() => {
    if (containerId === 'deliveryList') loadDelivery(); else loadCalendarDate();
  });
}

// ---------- calendar ----------

function loadCalendarDate() {
  const input = document.getElementById('calendarDate');
  if (!input.value) input.value = new Date().toISOString().slice(0, 10);
  apiGet('orderByDate', { date: input.value }).then(items => renderStatusList('calendarList', input.value, items))
    .catch(() => { document.getElementById('calendarList').innerHTML = t('syncError'); });
}

// ---------- notes ----------

function loadNotes() {
  apiGet('notes').then(data => { renderNotes(data); renderChefNoteBanner(data); })
    .catch(() => { document.getElementById('notesList').innerHTML = t('syncError'); });
}

function renderNotes(data) {
  const list = document.getElementById('notesList');
  list.innerHTML = '';
  data.forEach(note => {
    const row = document.createElement('div');
    row.className = 'note-item' + (note.isChef ? ' chef' : '');
    row.innerHTML = `<div>${note.text}</div><div class="note-meta">${note.isChef ? t('chefNoteLabel') + ' - ' : ''}${note.author || ''} - ${note.date}</div>`;
    list.appendChild(row);
  });
}

function renderChefNoteBanner(notesData) {
  const banner = document.getElementById('chef-note-banner');
  const useData = notesData || JSON.parse(localStorage.getItem('cachedNotes') || '[]');
  if (notesData) localStorage.setItem('cachedNotes', JSON.stringify(notesData));
  const chefNote = useData.find(n => n.isChef);
  if (chefNote) {
    banner.style.display = 'block';
    banner.innerHTML = `<span class="label">${ICONS.chef}${t('chefNoteLabel')} (${chefNote.date})</span>${chefNote.text}`;
  } else {
    banner.style.display = 'none';
  }
}

function submitNote(btn) {
  if (btn && btn.disabled) return;
  const text = document.getElementById('noteText').value;
  if (!text) return;
  const date = document.getElementById('noteDate').value || new Date().toISOString().slice(0, 10);
  const isChef = chefMode && document.getElementById('noteIsChef').checked;
  const author = document.getElementById('employeeName').value;
  withBusy(btn, postOrQueue('addNote', { author, text, date, isChef, pin: isChef ? CHEF_PIN : undefined })).then(() => {
    document.getElementById('noteText').value = '';
    document.getElementById('noteIsChef').checked = false;
    loadNotes();
  });
}

// ---------- report ----------

function loadReport() {
  const input = document.getElementById('reportMonth');
  if (!input.value) input.value = new Date().toISOString().slice(0, 7);
  apiGet('monthlyReport', { month: input.value }).then(renderReport)
    .catch(() => { document.getElementById('reportSummary').innerHTML = t('syncError'); });
}

function renderReport(data) {
  const fmt = n => n.toLocaleString(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.getElementById('reportSummary').innerHTML = `
    <div class="report-total"><span class="label">${t('grandTotal')}</span><span class="value">${fmt(data.grandTotal)} €</span></div>
    <div class="report-subtotal"><span>${t('productsCost')}</span><span>${fmt(data.totalProductCost)} €</span></div>
    <div class="report-subtotal"><span>${t('extraExpenses')}</span><span>${fmt(data.totalExpenses)} €</span></div>
  `;

  const productsBox = document.getElementById('reportProducts');
  if (data.products.length === 0) {
    productsBox.innerHTML = '';
  } else {
    productsBox.innerHTML = `<div class="report-section-title">${t('tabCatalog')}</div>` + data.products.map(item => {
      const product = products.find(p => p.id === item.productId);
      const name = product ? (product['name_' + currentLang] || product.name_de) : item.productId;
      return `<div class="report-row"><span>${name}<div class="qty">${item.quantity} ${item.unit}</div></span><span class="cost">${fmt(item.cost)} €</span></div>`;
    }).join('');
  }

  const expensesBox = document.getElementById('reportExpenses');
  if (data.expenses.length === 0) {
    expensesBox.innerHTML = '';
  } else {
    expensesBox.innerHTML = `<div class="report-section-title">${t('extraExpenses')}</div>` + data.expenses.map(ex =>
      `<div class="report-row"><span>${ex.description}<div class="qty">${ex.date}</div></span><span class="cost">${fmt(ex.amount)} €</span></div>`
    ).join('');
  }
}

function submitExpense(btn) {
  if (btn && btn.disabled) return;
  const description = document.getElementById('newExpenseDesc').value;
  const amount = document.getElementById('newExpenseAmount').value;
  const date = document.getElementById('newExpenseDate').value || new Date().toISOString().slice(0, 10);
  if (!description || !amount) return;
  const addedBy = document.getElementById('employeeName').value;
  withBusy(btn, postOrQueue('addExpense', { pin: CHEF_PIN, description, amount, date, addedBy })).then(res => {
    if (res.error) { showMsg('addExpenseMessage', res.error, 'error'); return; }
    document.getElementById('newExpenseDesc').value = '';
    document.getElementById('newExpenseAmount').value = '';
    showMsg('addExpenseMessage', res.queued ? t('queued') : t('expenseAdded'), res.queued ? 'info' : 'success');
    if (!res.queued) loadReport();
  });
}

function exportReportToDocs() {
  const month = document.getElementById('reportMonth').value;
  postOrQueue('exportReportToDocuments', { pin: CHEF_PIN, month }).then(res => {
    if (res.error) return;
    if (!res.queued) showShareLinks(res.url, month);
  });
}

function toggleEmailReport() { emailReportOpen = !emailReportOpen; updateChefUI(); }

function submitEmailReport(btn) {
  if (btn && btn.disabled) return;
  const month = document.getElementById('reportMonth').value;
  const toEmail = document.getElementById('reportEmailTo').value;
  if (!toEmail) return;
  withBusy(btn, postOrQueue('emailReport', { pin: CHEF_PIN, month, toEmail })).then(res => {
    if (res.error) { showMsg('emailReportMessage', res.error, 'error'); return; }
    showMsg('emailReportMessage', res.queued ? t('queued') : t('emailSent'), res.queued ? 'info' : 'success');
  });
}

function showShareLinks(url, month) {
  const box = document.getElementById('reportShareLinks');
  const text = encodeURIComponent(`Monatsbericht ${month}: ${url}`);
  box.style.display = 'flex';
  box.innerHTML = `
    <a class="share-link wa" href="https://wa.me/?text=${text}" target="_blank" rel="noopener">${ICONS.whatsapp}</a>
    <a class="share-link tg" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Monatsbericht ' + month)}" target="_blank" rel="noopener">${ICONS.telegram}</a>
    <a class="share-link mail" href="mailto:?subject=${encodeURIComponent('Monatsbericht ' + month)}&body=${text}" target="_blank" rel="noopener">${ICONS.mail}</a>
  `;
}

// ---------- documents ----------

function onDocFileChosen() {
  const input = document.getElementById('docFileInput');
  const file = input.files[0];
  if (!file) return;
  document.getElementById('docFileLabel').textContent = file.name;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1400;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      docFileBase64 = dataUrl.split(',')[1];
      docFileMime = 'image/jpeg';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitDocument(btn) {
  if (btn && btn.disabled) return;
  if (!docFileBase64) return;
  const description = document.getElementById('docDescription').value;
  const date = document.getElementById('docDate').value || new Date().toISOString().slice(0, 10);
  const uploadedBy = document.getElementById('employeeName').value;
  withBusy(btn, postOrQueue('uploadDocument', {
    description, date, uploadedBy, base64Data: docFileBase64, mimeType: docFileMime, filename: 'doc.jpg'
  })).then(res => {
    if (res.error) { showMsg('docMessage', res.error, 'error'); return; }
    showMsg('docMessage', res.queued ? t('queued') : t('docUploaded'), res.queued ? 'info' : 'success');
    if (!res.queued) {
      document.getElementById('docDescription').value = '';
      document.getElementById('docFileInput').value = '';
      document.getElementById('docFileLabel').textContent = t('chooseOrPhoto');
      docFileBase64 = null;
      loadDocuments();
    }
  });
}

function loadDocuments() {
  document.getElementById('docDate').value = document.getElementById('docDate').value || new Date().toISOString().slice(0, 10);
  apiGet('documents').then(renderDocuments).catch(() => {});
  apiGet('monthlySummaries').then(renderMonthlyReportsList).catch(() => {});
}

function renderDocuments(docs) {
  const list = document.getElementById('documentsList');
  if (docs.length === 0) { list.innerHTML = `<div class="empty-state">${ICONS.empty}<p>-</p></div>`; return; }
  list.innerHTML = docs.map(d => `
    <a class="doc-item" href="${d.url}" target="_blank" rel="noopener">
      <div class="doc-icon">${ICONS.doc}</div>
      <div class="doc-text">${d.description || '-'}<div class="doc-meta">${d.date} - ${d.uploadedBy || ''}</div></div>
    </a>`).join('');
}

function renderMonthlyReportsList(summaries) {
  const card = document.getElementById('monthlyReportsCard');
  const list = document.getElementById('monthlyReportsList');
  if (!summaries || summaries.length === 0) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  const fmt = n => n.toLocaleString(currentLang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  list.innerHTML = summaries.map(s => `
    <button type="button" class="month-link" onclick="goToReportMonth('${s.month}')">
      <span>${s.month}</span><span class="cost">${fmt(s.grandTotal)} €</span>
    </button>`).join('');
}

function goToReportMonth(month) {
  showTab('report');
  document.getElementById('reportMonth').value = month;
  loadReport();
}

// ---------- boot ----------

window.addEventListener('online', () => { updateOfflineBanner(); flushPending(); });
window.addEventListener('offline', updateOfflineBanner);
setInterval(flushPending, 30000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('service-worker.js').catch(() => {}); });
}

document.getElementById('noteDate').value = new Date().toISOString().slice(0, 10);
applyTranslations();
loadProducts();
flushPending();
