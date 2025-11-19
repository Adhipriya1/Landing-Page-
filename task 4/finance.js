class FinanceTracker {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.setTodayDate();
    this.render();
  }

  cacheElements() {
    this.amountInput = document.getElementById('amount');
    this.categorySelect = document.getElementById('category');
    this.typeSelect = document.getElementById('type');
    this.dateInput = document.getElementById('date');
    this.descriptionInput = document.getElementById('description');
    this.addBtn = document.getElementById('addTransactionBtn');
    this.transactionList = document.getElementById('transactionList');
    this.emptyState = document.getElementById('emptyState');
    this.categoryBtns = document.querySelectorAll('.category-btn');
    this.exportBtn = document.getElementById('exportBtn');
    this.hamburger = document.getElementById('hamburger');
  }

  attachEventListeners() {
    this.addBtn.addEventListener('click', () => this.addTransaction());
    this.amountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTransaction();
    });
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => this.filterTransactions(btn));
    });
    this.exportBtn.addEventListener('click', () => this.exportData());
    this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
  }

  setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    this.dateInput.value = today;
  }

  addTransaction() {
    const amount = parseFloat(this.amountInput.value);
    const category = this.categorySelect.value;
    const type = this.typeSelect.value;
    const date = this.dateInput.value;
    const description = this.descriptionInput.value.trim();

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!date) {
      alert('Please select a date');
      return;
    }

    const transaction = {
      id: Date.now(),
      amount,
      category,
      type,
      date,
      description: description || category,
      timestamp: new Date()
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();
    this.clearForm();
    this.render();
  }

  deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.saveTransactions();
      this.render();
    }
  }

  filterTransactions(btn) {
    this.categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.currentFilter = btn.dataset.category;
    this.render();
  }

  getFilteredTransactions() {
    if (this.currentFilter === 'all') {
      return this.transactions;
    }
    return this.transactions.filter(t => t.category === this.currentFilter);
  }

  calculateStats() {
    const filtered = this.getFilteredTransactions();
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    const thisMonth = this.transactions.filter(t => {
      const transDate = new Date(t.date);
      const now = new Date();
      return transDate.getMonth() === now.getMonth() &&
             transDate.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);

    const avgDaily = this.transactions.length > 0 ? (thisMonth / 30).toFixed(2) : 0;

    return { income, expense, balance, thisMonth, avgDaily };
  }

  updateStats() {
    const stats = this.calculateStats();
    document.getElementById('totalIncome').textContent = `$${stats.income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${stats.expense.toFixed(2)}`;
    document.getElementById('currentBalance').textContent = `$${stats.balance.toFixed(2)}`;
    document.getElementById('transactionCount').textContent = this.transactions.length;
    document.getElementById('monthSpending').textContent = `$${stats.thisMonth.toFixed(2)}`;
    document.getElementById('avgDaily').textContent = `$${stats.avgDaily}`;
  }

  renderTransactions() {
    const filtered = this.getFilteredTransactions();
    this.transactionList.innerHTML = '';

    if (filtered.length === 0) {
      this.emptyState.classList.add('show');
      return;
    }

    this.emptyState.classList.remove('show');

    filtered.forEach(transaction => {
      const li = document.createElement('li');
      li.className = 'transaction-item';

      const date = new Date(transaction.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      li.innerHTML = `
        <div class="transaction-info">
          <div class="transaction-description">${transaction.description}</div>
          <div class="transaction-meta">${date} • ${transaction.category}</div>
        </div>
        <div class="transaction-amount ${transaction.type}">
          ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
        </div>
        <button class="transaction-delete" onclick="financeTracker.deleteTransaction(${transaction.id})">
          Delete
        </button>
      `;

      this.transactionList.appendChild(li);
    });
  }

  renderCharts() {
    this.renderCategoryChart();
    this.renderMiniChart();
  }

  renderCategoryChart() {
    const filtered = this.getFilteredTransactions();
    const expenses = filtered.filter(t => t.type === 'expense');
    const categoryTotals = {};

    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const canvas = document.getElementById('categoryChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    canvas.width = 250;
    canvas.height = 200;

    const categories = Object.keys(categoryTotals);
    const colors = ['#00e5ff', '#1de9b6', '#ff4081', '#ffc107', '#ff6b6b', '#4fc3f7'];
    let currentAngle = 0;

    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    if (total === 0) {
      ctx.fillStyle = '#546e7a';
      ctx.font = '14px Poppins';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No expense data', centerX, centerY);
      return;
    }

    categories.forEach((category, index) => {
      const amount = categoryTotals[category];
      const sliceAngle = (amount / total) * Math.PI * 2;

      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      currentAngle += sliceAngle;
    });

    this.renderChartLegend(categoryTotals, colors);
  }

  renderChartLegend(categoryTotals, colors) {
    const legend = document.getElementById('chartLegend');
    legend.innerHTML = '';

    let index = 0;
    for (const [category, amount] of Object.entries(categoryTotals)) {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const colorDiv = document.createElement('div');
      colorDiv.className = 'legend-color';
      colorDiv.style.backgroundColor = colors[index % colors.length];

      const text = document.createElement('span');
      text.textContent = `${category}: $${amount.toFixed(2)}`;
      text.style.fontSize = '12px';
      text.style.color = '#b2ebf2';

      item.appendChild(colorDiv);
      item.appendChild(text);
      legend.appendChild(item);

      index++;
    }
  }

  renderMiniChart() {
    const svg = document.querySelector('.trend-chart');
    svg.innerHTML = '';

    const filtered = this.getFilteredTransactions();
    const last7Days = this.getLast7DaysData(filtered);

    const width = 300;
    const height = 100;
    const padding = 10;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const maxValue = Math.max(...Object.values(last7Days), 1);
    const points = [];

    let x = padding;
    for (const value of Object.values(last7Days)) {
      const y = height - padding - (value / maxValue) * graphHeight;
      points.push({ x, y });
      x += graphWidth / 6;
    }

    // Draw line
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('stroke', 'url(#gradient)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    // Draw gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00bcd4');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#1de9b6');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Draw points
    points.forEach(point => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#00e5ff');
      svg.appendChild(circle);
    });
  }

  getLast7DaysData(transactions) {
    const data = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      data[dateKey] = 0;
    }

    transactions.forEach(t => {
      if (t.type === 'expense' && data.hasOwnProperty(t.date)) {
        data[t.date] += t.amount;
      }
    });

    return data;
  }

  exportData() {
    const dataStr = JSON.stringify(this.transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  }

  clearForm() {
    this.amountInput.value = '';
    this.descriptionInput.value = '';
    this.categorySelect.value = 'Food';
    this.typeSelect.value = 'expense';
    this.setTodayDate();
  }

  saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
  }

  render() {
    this.updateStats();
    this.renderTransactions();
    this.renderCharts();
  }
}

const financeTracker = new FinanceTracker();
