/* ─────────────────────────────────────────────────────────────────
   LEDGER — app.js
───────────────────────────────────────────────────────────────── */

// ─── State ────────────────────────────────────────────────────────
let transactions = JSON.parse(localStorage.getItem('ledger_txns') || '[]');
let budgets = JSON.parse(localStorage.getItem('ledger_budgets') || '[]');
let activeFilter = 'all';
let currentType = 'income';
let currentType2 = 'income';
let editId = null;
let editType = 'income';

const CATEGORY_ICONS = {
    General: '📌', Food: '🍽', Transport: '🚗', Shopping: '🛍',
    Entertainment: '🎬', Health: '💊', Housing: '🏠', Salary: '💼',
    Investment: '📈', Other: '🗂'
};

const CATEGORIES = ['General', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Housing', 'Salary', 'Investment', 'Other'];

// ─── Init ─────────────────────────────────────────────────────────
document.getElementById('headerDate').textContent =
    new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();

document.getElementById('budgetMonth').textContent =
    new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase();

// Set default datetime to now
function nowLocal() {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
}
document.getElementById('txDatetime').value = nowLocal();
document.getElementById('t2Datetime').value = nowLocal();

function save() {
    localStorage.setItem('ledger_txns', JSON.stringify(transactions));
    localStorage.setItem('ledger_budgets', JSON.stringify(budgets));
}

// ─── Tab navigation ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
    if (name === 'analytics') renderAnalytics();
    if (name === 'budgets') renderBudgets();
    if (name === 'transactions') renderTransactions();
}

// ─── Type toggles ─────────────────────────────────────────────────
function setType(t) {
    currentType = t;
    document.getElementById('btnIncome').className = 'type-btn' + (t === 'income' ? ' active-income' : '');
    document.getElementById('btnExpense').className = 'type-btn' + (t === 'expense' ? ' active-expense' : '');
}
function setType2(t) {
    currentType2 = t;
    document.getElementById('t2BtnIncome').className = 'type-btn' + (t === 'income' ? ' active-income' : '');
    document.getElementById('t2BtnExpense').className = 'type-btn' + (t === 'expense' ? ' active-expense' : '');
}
function setEditType(t) {
    editType = t;
    document.getElementById('editBtnIncome').className = 'type-btn' + (t === 'income' ? ' active-income' : '');
    document.getElementById('editBtnExpense').className = 'type-btn' + (t === 'expense' ? ' active-expense' : '');
}

// ─── Format currency ──────────────────────────────────────────────
function fmt(n) {
    return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Add Transaction (Dashboard form) ────────────────────────────
function addTransaction() {
    const desc = document.getElementById('txDesc').value.trim();
    const amt = parseFloat(document.getElementById('txAmount').value);
    const cat = document.getElementById('txCategory').value;
    const dt = document.getElementById('txDatetime').value || nowLocal();

    if (!desc) return showToast('Please enter a description.', 'error');
    if (!amt || amt <= 0) return showToast('Please enter a valid amount.', 'error');

    transactions.unshift({ id: Date.now(), desc, amt, cat, type: currentType, date: new Date(dt).toISOString() });
    save();
    document.getElementById('txDesc').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txDatetime').value = nowLocal();
    renderAll();
    showToast(currentType === 'income' ? 'Income recorded ✓' : 'Expense recorded ✓', 'success');
}

// ─── Add Transaction (Transactions tab form) ──────────────────────
function addTransaction2() {
    const desc = document.getElementById('t2Desc').value.trim();
    const amt = parseFloat(document.getElementById('t2Amount').value);
    const cat = document.getElementById('t2Category').value;
    const dt = document.getElementById('t2Datetime').value || nowLocal();

    if (!desc) return showToast('Please enter a description.', 'error');
    if (!amt || amt <= 0) return showToast('Please enter a valid amount.', 'error');

    transactions.unshift({ id: Date.now(), desc, amt, cat, type: currentType2, date: new Date(dt).toISOString() });
    save();
    document.getElementById('t2Desc').value = '';
    document.getElementById('t2Amount').value = '';
    document.getElementById('t2Datetime').value = nowLocal();
    renderAll();
    showToast(currentType2 === 'income' ? 'Income recorded ✓' : 'Expense recorded ✓', 'success');
}

// ─── Delete ───────────────────────────────────────────────────────
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    save();
    renderAll();
    showToast('Transaction removed.', 'info');
}

// ─── Edit ─────────────────────────────────────────────────────────
function openEdit(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    editId = id;
    document.getElementById('editDesc').value = tx.desc;
    document.getElementById('editAmount').value = tx.amt;
    document.getElementById('editCategory').value = tx.cat;
    document.getElementById('editDatetime').value = new Date(tx.date).toISOString().slice(0, 16);
    setEditType(tx.type);
    document.getElementById('editModal').classList.add('open');
}
function closeModal() {
    document.getElementById('editModal').classList.remove('open');
    editId = null;
}
function saveEdit() {
    const tx = transactions.find(t => t.id === editId);
    if (!tx) return;
    const desc = document.getElementById('editDesc').value.trim();
    const amt = parseFloat(document.getElementById('editAmount').value);
    const cat = document.getElementById('editCategory').value;
    const dt = document.getElementById('editDatetime').value;
    if (!desc) return showToast('Please enter a description.', 'error');
    if (!amt || amt <= 0) return showToast('Please enter a valid amount.', 'error');
    tx.desc = desc; tx.amt = amt; tx.cat = cat;
    tx.type = editType;
    tx.date = new Date(dt).toISOString();
    save();
    closeModal();
    renderAll();
    showToast('Transaction updated.', 'success');
}

// ─── Filter ───────────────────────────────────────────────────────
function setFilter(f, el) {
    activeFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderTransactions();
}

// ─── Summary ──────────────────────────────────────────────────────
function renderSummary() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
    const balance = totalIncome - totalExpense;
    const iCount = transactions.filter(t => t.type === 'income').length;
    const eCount = transactions.filter(t => t.type === 'expense').length;

    document.getElementById('balanceAmt').textContent = fmt(balance);
    document.getElementById('balanceAmt').style.color = balance >= 0 ? 'var(--gold-light)' : 'var(--red)';
    document.getElementById('incomeAmt').textContent = fmt(totalIncome);
    document.getElementById('expenseAmt').textContent = fmt(totalExpense);
    document.getElementById('incomeSub').textContent = iCount + ' transaction' + (iCount !== 1 ? 's' : '');
    document.getElementById('expenseSub').textContent = eCount + ' transaction' + (eCount !== 1 ? 's' : '');
}

// ─── Recent transactions (dashboard) ─────────────────────────────
function renderRecent() {
    const list = transactions.slice(0, 5);
    renderTxIntoBody('recentTxBody', list);
}

// ─── Transactions tab ─────────────────────────────────────────────
function renderTransactions() {
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const catF = document.getElementById('filterCategory')?.value || '';
    const fromD = document.getElementById('filterFrom')?.value;
    const toD = document.getElementById('filterTo')?.value;

    let list = transactions.filter(t => {
        if (activeFilter !== 'all' && t.type !== activeFilter) return false;
        if (catF && t.cat !== catF) return false;
        if (fromD) { const fd = new Date(fromD); fd.setHours(0, 0, 0, 0); if (new Date(t.date) < fd) return false; }
        if (toD) { const td = new Date(toD); td.setHours(23, 59, 59, 999); if (new Date(t.date) > td) return false; }
        if (q && !t.desc.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q)) return false;
        return true;
    });

    // Stats bar
    const totalInc = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
    const totalExp = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
    const sb = document.getElementById('txStatsBar');
    if (sb) sb.innerHTML = `
    <span class="tx-stat">Shown: <span>${list.length}</span></span>
    <span class="tx-stat">Income: <span style="color:var(--green)">${fmt(totalInc)}</span></span>
    <span class="tx-stat">Expenses: <span style="color:var(--red)">${fmt(totalExp)}</span></span>
    <span class="tx-stat">Net: <span style="color:${totalInc - totalExp >= 0 ? 'var(--gold-light)' : 'var(--red)'}">${fmt(totalInc - totalExp)}</span></span>
  `;

    renderTxIntoBody('txBody', list);
}

function renderTxIntoBody(bodyId, list) {
    const tbody = document.getElementById(bodyId);
    if (!tbody) return;
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">₹</div><p>No transactions found.</p></div></td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(t => {
        const icon = CATEGORY_ICONS[t.cat] || '📌';
        return `
      <tr class="tx-row">
        <td>
          <div class="tx-desc">
            <div class="tx-icon ${t.type}">${icon}</div>
            <div>
              <div class="tx-name">${esc(t.desc)}</div>
              <div class="tx-category">${t.cat}</div>
            </div>
          </div>
        </td>
        <td class="tx-date">${fmtDateTime(t.date)}</td>
        <td class="tx-date">${t.cat}</td>
        <td><span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '−'} ${fmt(t.amt)}</span></td>
        <td>
          <div class="tx-actions">
            <button class="tx-btn edit" onclick="openEdit(${t.id})" title="Edit">✎</button>
            <button class="tx-btn del"  onclick="deleteTransaction(${t.id})" title="Delete">✕</button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

// ─── Monthly bar chart ─────────────────────────────────────────────
function renderChart() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-IN', { month: 'short' }) });
    }
    const data = months.map(m => {
        const inc = transactions.filter(t => { const d = new Date(t.date); return t.type === 'income' && d.getFullYear() === m.year && d.getMonth() === m.month; }).reduce((s, t) => s + t.amt, 0);
        const exp = transactions.filter(t => { const d = new Date(t.date); return t.type === 'expense' && d.getFullYear() === m.year && d.getMonth() === m.month; }).reduce((s, t) => s + t.amt, 0);
        return { ...m, inc, exp };
    });
    const maxVal = Math.max(...data.map(d => Math.max(d.inc, d.exp)), 1);
    document.getElementById('barChart').innerHTML = data.map(d => {
        const incH = Math.round((d.inc / maxVal) * 110);
        const expH = Math.round((d.exp / maxVal) * 110);
        return `<div class="bar-group">
      <div class="bar-pair">
        <div class="bar income"  style="height:${incH}px" title="Income: ${fmt(d.inc)}"></div>
        <div class="bar expense" style="height:${expH}px" title="Expense: ${fmt(d.exp)}"></div>
      </div>
      <div class="bar-label">${d.label}</div>
    </div>`;
    }).join('');
}

// ─── Budgets ──────────────────────────────────────────────────────
function addBudget() {
    const cat = document.getElementById('budgetCategory').value;
    const amt = parseFloat(document.getElementById('budgetAmount').value);
    const period = document.getElementById('budgetPeriod').value;

    if (!amt || amt <= 0) return showToast('Please enter a valid budget amount.', 'error');

    const existing = budgets.findIndex(b => b.cat === cat);
    const entry = { id: Date.now(), cat, amt, period };
    if (existing >= 0) { budgets[existing] = entry; showToast(`Budget for ${cat} updated.`, 'info'); }
    else { budgets.push(entry); showToast(`Budget for ${cat} set ✓`, 'success'); }

    document.getElementById('budgetAmount').value = '';
    save();
    renderBudgets();
}

function deleteBudget(id) {
    budgets = budgets.filter(b => b.id !== id);
    save();
    renderBudgets();
    showToast('Budget removed.', 'info');
}

function getSpentForBudget(budget) {
    const now = new Date();
    let from;
    if (budget.period === 'monthly') from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (budget.period === 'weekly') {
        from = new Date(now); from.setDate(now.getDate() - now.getDay());
        from.setHours(0, 0, 0, 0);
    } else { // yearly
        from = new Date(now.getFullYear(), 0, 1);
    }
    return transactions
        .filter(t => t.type === 'expense' && t.cat === budget.cat && new Date(t.date) >= from)
        .reduce((s, t) => s + t.amt, 0);
}

function renderBudgets() {
    const grid = document.getElementById('budgetGrid');
    if (!budgets.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><p>No budgets set yet. Add one above.</p></div>`;
        return;
    }
    grid.innerHTML = budgets.map(b => {
        const spent = getSpentForBudget(b);
        const pct = Math.min((spent / b.amt) * 100, 100);
        const rawPct = (spent / b.amt) * 100;
        const cls = rawPct >= 100 ? 'over' : rawPct >= 80 ? 'warn' : 'ok';
        const icon = CATEGORY_ICONS[b.cat] || '📌';
        return `
      <div class="budget-card">
        <div class="budget-card-header">
          <div class="budget-cat">
            <span class="budget-cat-icon">${icon}</span>
            <div>
              <div class="budget-cat-name">${b.cat}</div>
              <div class="budget-limit">Budget: ${fmt(b.amt)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="budget-period-tag">${b.period}</span>
            <button class="budget-del" onclick="deleteBudget(${b.id})" title="Remove">✕</button>
          </div>
        </div>
        <div class="budget-amounts">
          <div>
            <div class="budget-spent ${cls}">${fmt(spent)}</div>
            <div style="font-size:0.6rem;color:var(--muted);margin-top:2px">spent</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:0.9rem;font-family:'Playfair Display',serif;color:var(--muted)">${fmt(Math.max(b.amt - spent, 0))}</div>
            <div style="font-size:0.6rem;color:var(--muted);margin-top:2px">${rawPct > 100 ? 'over by ' + fmt(spent - b.amt) : 'remaining'}</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cls}" style="width:${pct}%"></div>
        </div>
        <div class="budget-pct">${rawPct.toFixed(1)}% used</div>
      </div>
    `;
    }).join('');
}

// ─── Analytics ────────────────────────────────────────────────────
function getAnalyticsTxns() {
    const period = document.getElementById('analyticsPeriod')?.value || 'this_month';
    const now = new Date();
    let from;
    if (period === 'this_month') from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'last_month') { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); }
    else if (period === 'last_3') from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    else if (period === 'last_6') from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    else if (period === 'this_year') from = new Date(now.getFullYear(), 0, 1);
    else from = new Date(0);

    let list = transactions.filter(t => new Date(t.date) >= from);
    if (period === 'last_month') {
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        list = list.filter(t => new Date(t.date) <= endOfLastMonth);
    }
    return list;
}

function renderAnalytics() {
    const list = getAnalyticsTxns();

    // --- Category horizontal bar charts ---
    ['expense', 'income'].forEach(type => {
        const filtered = list.filter(t => t.type === type);
        const totals = {};
        CATEGORIES.forEach(c => { totals[c] = filtered.filter(t => t.cat === c).reduce((s, t) => s + t.amt, 0); });
        const maxVal = Math.max(...Object.values(totals), 1);
        const sorted = CATEGORIES.filter(c => totals[c] > 0).sort((a, b) => totals[b] - totals[a]);
        const containerId = type === 'expense' ? 'expenseCategoryChart' : 'incomeCategoryChart';
        const fillClass = type === 'expense' ? 'expense-fill' : 'income-fill';
        const el = document.getElementById(containerId);
        if (!el) return;
        if (!sorted.length) {
            el.innerHTML = `<div class="empty-state" style="padding:24px"><div class="empty-icon">${type === 'expense' ? '💸' : '💰'}</div><p>No ${type} data.</p></div>`;
            return;
        }
        el.innerHTML = sorted.map(cat => {
            const pct = (totals[cat] / maxVal * 100).toFixed(1);
            return `<div class="cat-bar-row">
        <div class="cat-bar-label">${CATEGORY_ICONS[cat] || ''} ${cat}</div>
        <div class="cat-bar-track"><div class="cat-bar-fill ${fillClass}" style="width:${pct}%"></div></div>
        <div class="cat-bar-amt">${fmt(totals[cat])}</div>
      </div>`;
        }).join('');
    });

    // --- Full breakdown table ---
    const tableEl = document.getElementById('categoryBreakdownTable');
    if (tableEl) {
        const rows = CATEGORIES.map(cat => {
            const inc = list.filter(t => t.type === 'income' && t.cat === cat).reduce((s, t) => s + t.amt, 0);
            const exp = list.filter(t => t.type === 'expense' && t.cat === cat).reduce((s, t) => s + t.amt, 0);
            const cnt = list.filter(t => t.cat === cat).length;
            return { cat, inc, exp, net: inc - exp, cnt };
        }).filter(r => r.cnt > 0).sort((a, b) => b.exp - a.exp);

        if (!rows.length) {
            tableEl.innerHTML = `<div class="empty-state" style="padding:32px"><div class="empty-icon">📊</div><p>No data for this period.</p></div>`;
        } else {
            tableEl.innerHTML = `<table class="breakdown-table">
        <thead><tr>
          <th>Category</th><th>Transactions</th>
          <th>Income</th><th>Expenses</th><th>Net</th>
        </tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td><div class="bd-cat">${CATEGORY_ICONS[r.cat] || ''} <span style="margin-left:6px">${r.cat}</span></div></td>
          <td>${r.cnt}</td>
          <td class="bd-income">${r.inc > 0 ? fmt(r.inc) : '—'}</td>
          <td class="bd-expense">${r.exp > 0 ? fmt(r.exp) : '—'}</td>
          <td class="bd-net ${r.net >= 0 ? 'pos' : 'neg'}">${r.net >= 0 ? '+' : '−'} ${fmt(r.net)}</td>
        </tr>`).join('')}</tbody>
      </table>`;
        }
    }

    // --- Day of week chart ---
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowTotals = Array(7).fill(0);
    list.filter(t => t.type === 'expense').forEach(t => { dowTotals[new Date(t.date).getDay()] += t.amt; });
    const maxDow = Math.max(...dowTotals, 1);
    const dowEl = document.getElementById('dowChart');
    if (dowEl) {
        dowEl.className = 'single-bar-chart';
        dowEl.innerHTML = DAYS.map((d, i) => {
            const h = Math.round((dowTotals[i] / maxDow) * 100);
            return `<div class="sbar-group">
        <div class="sbar" style="height:${h}px" title="${fmt(dowTotals[i])}"></div>
        <div class="sbar-label">${d}</div>
      </div>`;
        }).join('');
    }

    // --- Hour of day chart ---
    const hourTotals = Array(24).fill(0);
    list.filter(t => t.type === 'expense').forEach(t => { hourTotals[new Date(t.date).getHours()] += t.amt; });
    const maxHour = Math.max(...hourTotals, 1);
    const hourEl = document.getElementById('hourChart');
    if (hourEl) {
        hourEl.innerHTML = hourTotals.map((v, i) => {
            const h = Math.round((v / maxHour) * 80);
            const label = i === 0 ? '12am' : i < 12 ? i + 'am' : i === 12 ? '12pm' : (i - 12) + 'pm';
            return `<div class="sbar-group" style="flex:none;width:3.8%">
        <div class="sbar" style="height:${h}px;max-width:none;width:100%" title="${label}: ${fmt(v)}"></div>
        <div class="sbar-label">${i % 6 === 0 ? label : ''}</div>
      </div>`;
        }).join('');
    }
}

// ─── Toast ────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast ' + type + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ─── Keyboard shortcuts ───────────────────────────────────────────
['txDesc', 'txAmount'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction(); });
});
['t2Desc', 't2Amount'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') addTransaction2(); });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// ─── Render all ───────────────────────────────────────────────────
function renderAll() {
    renderSummary();
    renderRecent();
    renderTransactions();
    renderChart();
    renderBudgets();
}

renderAll();