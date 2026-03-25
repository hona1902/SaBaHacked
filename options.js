/**
 * options.js — Settings page logic
 * Tab switching, general settings, question bank management,
 * Excel upload (SheetJS), and JSON import.
 */

// ── Tab Switching ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    sessionStorage.setItem('activeTab', tabId);
    if (tabId === 'bank') loadBankList();
  });
});

const savedTab = sessionStorage.getItem('activeTab');
if (savedTab) {
  const btn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
  if (btn) btn.click();
}

// ── Toast Utility ──
function showToast(id, text, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#dc2626' : '#16a34a';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════
// TAB 1: GENERAL SETTINGS
// ═══════════════════════════════════════════

(async function loadGeneralSettings() {
  // Load defaults from config.json shipped with the extension
  let defaults = { sessionMode: "reuse" };
  try {
    const resp = await fetch(chrome.runtime.getURL('config.json'));
    if (resp.ok) defaults = await resp.json();
  } catch (_) {}

  const cfg = await chrome.storage.sync.get({
    hostPatterns: "",
    sessionMode: defaults.sessionMode || "reuse"
  });
  document.getElementById('hostPatterns').value = cfg.hostPatterns || "";
  document.getElementById('sessionMode').value = cfg.sessionMode || "reuse";
})();

document.getElementById('saveGeneral').addEventListener('click', async () => {
  const hostPatterns = document.getElementById('hostPatterns').value;
  const sessionMode = document.getElementById('sessionMode').value;
  await chrome.storage.sync.set({ hostPatterns, sessionMode });
  showToast('statusGeneral', '✅ Đã lưu!');
});

// Toggle password visibility
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁️';
  });
});

// ═══════════════════════════════════════════
// TAB 2: QUESTION BANK MANAGER
// ═══════════════════════════════════════════

// ── Storage Helpers ──
async function getBankFiles() {
  const { localBankFiles } = await chrome.storage.sync.get({ localBankFiles: 'data/cong-nghe-so.json' });
  return (localBankFiles || '')
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

async function saveBankFiles(files) {
  await chrome.storage.sync.set({ localBankFiles: files.join(',') });
}

async function getStorageBanks() {
  const { questionBanks } = await chrome.storage.local.get({ questionBanks: {} });
  return questionBanks || {};
}

async function saveStorageBanks(banks) {
  await chrome.storage.local.set({ questionBanks: banks });
}

function isBundledFile(path) {
  return path === 'data/cong-nghe-so.json';
}

async function getBankQuestionCount(bankName) {
  const banks = await getStorageBanks();
  if (banks[bankName]) return banks[bankName].length;
  try {
    const url = chrome.runtime.getURL(bankName);
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      return Array.isArray(data) ? data.length : 0;
    }
  } catch (_) {}
  return 0;
}

// ── Load Bank List ──
async function loadBankList() {
  const listEl = document.getElementById('bankList');
  const files = await getBankFiles();
  const banks = await getStorageBanks();
  const selectEl = document.getElementById('targetBank');
  const selectJsonEl = document.getElementById('targetBankJson');

  // Merge all banks
  const allBanks = new Set(files);
  for (const name of Object.keys(banks)) {
    allBanks.add(name);
  }

  if (!allBanks.size) {
    listEl.innerHTML = '<div class="bank-empty">Chưa có ngân hàng nào. Tạo mới bên dưới!</div>';
    selectEl.innerHTML = '<option value="">-- Chưa có ngân hàng --</option>';
    if (selectJsonEl) selectJsonEl.innerHTML = '<option value="">-- Chưa có ngân hàng --</option>';
    return;
  }

  let html = '';
  let selectHtml = '<option value="">-- Chọn --</option>';

  for (const name of allBanks) {
    const count = await getBankQuestionCount(name);
    const isBundled = isBundledFile(name);
    const typeLabel = isBundled ? 'Bundled' : 'Custom';
    const typeClass = isBundled ? 'bundled' : 'custom';

    html += `
      <div class="bank-item" data-bank="${escapeAttr(name)}">
        <span class="bank-type ${typeClass}">${typeLabel}</span>
        <span class="bank-name">${escapeHtml(name)}</span>
        <span class="bank-count">${count} câu</span>
        <button class="btn btn-danger btn-sm delete-bank" data-bank="${escapeAttr(name)}" title="Xoá">🗑️</button>
      </div>
    `;

    // All banks (both bundled and custom) can be selected for import
    selectHtml += `<option value="${escapeAttr(name)}">${escapeHtml(name)} (${count} câu)</option>`;
  }

  listEl.innerHTML = html;
  selectEl.innerHTML = selectHtml;
  if (selectJsonEl) selectJsonEl.innerHTML = selectHtml;

  // Bind delete buttons for ALL banks
  listEl.querySelectorAll('.delete-bank').forEach(btn => {
    btn.addEventListener('click', async () => {
      const bankName = btn.dataset.bank;
      const label = isBundledFile(bankName)
        ? `Bỏ ngân hàng "${bankName}" khỏi danh sách active?`
        : `Xoá ngân hàng "${bankName}" và tất cả câu hỏi?`;
      if (!confirm(label)) return;
      await deleteBank(bankName);
    });
  });
}

// ── Create Bank ──
document.getElementById('createBank').addEventListener('click', async () => {
  let name = document.getElementById('newBankName').value.trim();
  if (!name) return showToast('statusBank', '❌ Nhập tên file!', true);

  name = name.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase();
  const fullName = `data/${name}.json`;

  const files = await getBankFiles();
  if (files.includes(fullName)) {
    return showToast('statusBank', '❌ Ngân hàng đã tồn tại!', true);
  }

  const banks = await getStorageBanks();
  banks[fullName] = [];
  await saveStorageBanks(banks);

  files.push(fullName);
  await saveBankFiles(files);

  document.getElementById('newBankName').value = '';
  showToast('statusBank', `✅ Đã tạo "${fullName}"`);
  await loadBankList();
});

// ── Delete Bank ──
async function deleteBank(bankName) {
  const isBundled = isBundledFile(bankName);

  // Remove from localBankFiles
  const files = await getBankFiles();
  const updated = files.filter(f => f !== bankName);
  await saveBankFiles(updated);

  // Only delete storage data for custom banks
  if (!isBundled) {
    const banks = await getStorageBanks();
    delete banks[bankName];
    await saveStorageBanks(banks);
  }

  showToast('statusBank', `🗑️ Đã xoá "${bankName}"`);
  await loadBankList();
}

// ═══════════════════════════════════════════
// EXCEL UPLOAD
// ═══════════════════════════════════════════

let _parsedExcelData = null;

const uploadZone = document.getElementById('uploadZone');
const excelFileInput = document.getElementById('excelFile');
const excelPreview = document.getElementById('excelPreview');
const excelImportBtn = document.getElementById('excelImportBtn');

// Click to open file dialog
uploadZone.addEventListener('click', () => excelFileInput.click());

// Drag & Drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processExcelFile(file);
});

// File input change
excelFileInput.addEventListener('change', () => {
  const file = excelFileInput.files[0];
  if (file) processExcelFile(file);
});

function processExcelFile(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    showExcelPreview('❌ Chỉ hỗ trợ file .xlsx hoặc .xls', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Read first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length < 2) {
        showExcelPreview('❌ File Excel trống hoặc chỉ có header', true);
        return;
      }

      // Parse rows (skip header row 0)
      const questions = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue; // skip empty rows

        const question = String(row[0] || '').trim();
        const optA = String(row[1] || '').trim();
        const optB = String(row[2] || '').trim();
        const optC = String(row[3] || '').trim();
        const optD = String(row[4] || '').trim();
        const answer = String(row[5] || '').trim().charAt(0).toUpperCase();
        const explanation = String(row[6] || '').trim();

        if (!question || !answer) continue;
        if (!['A', 'B', 'C', 'D'].includes(answer)) continue;

        questions.push({
          question,
          options: { A: optA, B: optB, C: optC, D: optD },
          answer,
          explanation
        });
      }

      if (!questions.length) {
        showExcelPreview('❌ Không tìm thấy câu hỏi hợp lệ trong file', true);
        _parsedExcelData = null;
        excelImportBtn.disabled = true;
        return;
      }

      _parsedExcelData = questions;
      showExcelPreview(`✅ Đã đọc ${questions.length} câu hỏi từ "${file.name}" (sheet: ${sheetName})`, false);
      excelImportBtn.disabled = false;

    } catch (err) {
      showExcelPreview(`❌ Lỗi đọc file: ${err.message}`, true);
      _parsedExcelData = null;
      excelImportBtn.disabled = true;
    }
  };
  reader.readAsArrayBuffer(file);
}

function showExcelPreview(text, isError) {
  excelPreview.style.display = 'block';
  excelPreview.textContent = text;
  excelPreview.classList.toggle('error', isError);
}

// Import button
excelImportBtn.addEventListener('click', async () => {
  const bankName = document.getElementById('targetBank').value;
  if (!bankName) return showToast('statusExcel', '❌ Chọn ngân hàng trước!', true);
  if (!_parsedExcelData || !_parsedExcelData.length) return;

  const banks = await getStorageBanks();
  if (!banks[bankName]) banks[bankName] = [];
  banks[bankName].push(..._parsedExcelData);
  await saveStorageBanks(banks);

  const count = _parsedExcelData.length;
  showToast('statusExcel', `✅ Đã import ${count} câu!`);
  
  // Reset
  _parsedExcelData = null;
  excelImportBtn.disabled = true;
  excelPreview.style.display = 'none';
  excelFileInput.value = '';
  
  await loadBankList();
});

// ═══════════════════════════════════════════
// JSON IMPORT
// ═══════════════════════════════════════════

document.getElementById('importBtn').addEventListener('click', async () => {
  const bankName = document.getElementById('targetBankJson').value;
  if (!bankName) return showToast('statusImport', '❌ Chọn ngân hàng trước!', true);

  const raw = document.getElementById('importJson').value.trim();
  if (!raw) return showToast('statusImport', '❌ Paste JSON!', true);

  let items;
  try {
    items = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error('Not an array');
  } catch (e) {
    return showToast('statusImport', `❌ JSON không hợp lệ: ${e.message}`, true);
  }

  const valid = items.filter(it =>
    it.question && it.options && it.answer &&
    typeof it.options === 'object'
  );

  if (!valid.length) {
    return showToast('statusImport', '❌ Không tìm thấy câu hỏi hợp lệ!', true);
  }

  const banks = await getStorageBanks();
  if (!banks[bankName]) banks[bankName] = [];
  banks[bankName].push(...valid);
  await saveStorageBanks(banks);

  document.getElementById('importJson').value = '';
  showToast('statusImport', `✅ Đã import ${valid.length} câu!`);
  await loadBankList();
});

// ═══════════════════════════════════════════
// EXCEL TEMPLATE DOWNLOAD
// ═══════════════════════════════════════════

document.getElementById('downloadTemplate').addEventListener('click', (e) => {
  e.preventDefault();
  downloadTemplate();
});

function downloadTemplate() {
  const data = [
    ['Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án', 'Giải thích'],
    ['Ngân hàng nào có tổng tài sản lớn nhất Việt Nam?', 'Vietcombank', 'Agribank', 'BIDV', 'Techcombank', 'B', 'Agribank có tổng tài sản lớn nhất hệ thống ngân hàng VN'],
    ['HTML là viết tắt của gì?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Không có đáp án đúng', 'A', 'HTML = Hyper Text Markup Language']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 45 },  // Câu hỏi
    { wch: 30 },  // A
    { wch: 30 },  // B
    { wch: 30 },  // C
    { wch: 30 },  // D
    { wch: 10 },  // Đáp án
    { wch: 40 },  // Giải thích
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mẫu');
  XLSX.writeFile(wb, 'mau-ngan-hang-cau-hoi.xlsx');
}

// ── Utilities ──
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(s) {
  return (s || '').replace(/"/g, '&quot;');
}

// ── Init ──
loadBankList();
