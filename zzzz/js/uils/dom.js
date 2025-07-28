// 状态管理
const state = {
  products: [],
  filteredProducts: [],
  selectedProducts: [],
  currentQuotation: {
    number: '',
    date: '',
    validUntil: '',
    company: {
      name: 'ABC科技有限公司',
      phone: '13800138000'
    },
    note: '本报价单有效期为30天'
  },
  zoomLevel: 100
};

// DOM引用
const dom = {
  productList: document.getElementById('product-list'),
  selectedProducts: document.getElementById('selected-products'),
  searchInput: document.getElementById('search-input'),
  quotationNumber: document.getElementById('quotation-number'),
  quotationDate: document.getElementById('quotation-date'),
  validUntil: document.getElementById('valid-until'),
  totals: document.getElementById('totals'),
  addProductBtn: document.getElementById('add-product-btn'),
  previewPdfBtn: document.getElementById('preview-pdf-btn'),
  generatePdfBtn: document.getElementById('generate-pdf-btn'),
  saveQuotationBtn: document.getElementById('save-quotation-btn'),
  loadQuotationBtn: document.getElementById('load-quotation-btn'),
  loaderContainer: document.getElementById('loader-container'),
  quotationDocument: document.getElementById('quotation-document')
};

// 工具函数
function formatCurrency(amount) {
  return '¥' + amount.toFixed(2);
}

function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function generateQuotationNumber() {
  const now = new Date();
  return `QT-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} show`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 产品管理
function renderProductList() {
  dom.productList.innerHTML = state.filteredProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="no-image">暂无图片</div>'}
      <h3>${product.name}</h3>
      <p>${product.specs}</p>
      <p>${formatCurrency(product.price)}/${product.unit}</p>
      <button class="add-to-quotation">添加到报价单</button>
    </div>
  `).join('');
  
  // 添加事件监听
  document.querySelectorAll('.add-to-quotation').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.closest('.product-card').dataset.id;
      const product = state.filteredProducts.find(p => p.id === productId);
      if (product) addToQuotation(product);
    });
  });
}

// 报价单管理
function addToQuotation(product, quantity = 1) {
  const existingItem = state.selectedProducts.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.selectedProducts.push({
      ...product,
      quantity,
      discount: 0,
      subtotal: product.price * quantity
    });
  }
  
  updateSelectedProducts();
  showToast(`已添加 ${product.name}`, 'success');
}

function updateSelectedProducts() {
  dom.selectedProducts.innerHTML = state.selectedProducts.map((product, index) => `
    <tr data-id="${product.id}">
      <td class="product-img-cell">
        ${product.image ? `<img src="${product.image}" class="product-thumbnail" alt="${product.name}">` : '无图片'}
      </td>
      <td>${product.name}</td>
      <td>${product.specs}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>
        <button class="quantity-btn minus">-</button>
        <span class="quantity-value">${product.quantity}</span>
        <button class="quantity-btn plus">+</button>
      </td>
      <td>${formatCurrency(product.price * product.quantity)}</td>
      <td>
        <button class="remove-btn">删除</button>
      </td>
    </tr>
  `).join('');
  
  // 添加事件监听
  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('tr').dataset.id;
      const product = state.selectedProducts.find(p => p.id === productId);
      if (product && product.quantity > 1) {
        product.quantity--;
        updateSelectedProducts();
      }
    });
  });
  
  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('tr').dataset.id;
      const product = state.selectedProducts.find(p => p.id === productId);
      if (product) {
        product.quantity++;
        updateSelectedProducts();
      }
    });
  });
  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.closest('tr').dataset.id;
      state.selectedProducts = state.selectedProducts.filter(p => p.id !== productId);
      updateSelectedProducts();
      showToast('产品已移除', 'error');
    });
  });
  
  updateTotals();
}

function updateTotals() {
  const subtotal = state.selectedProducts.reduce((sum, product) => 
    sum + (product.price * product.quantity), 0);
  
  dom.totals.innerHTML = `
    <div class="total-row">
      <span>小计:</span>
      <span>${formatCurrency(subtotal)}</span>
    </div>
    <div class="total-row">
      <span>税费 (6%):</span>
      <span>${formatCurrency(subtotal * 0.06)}</span>
    </div>
    <div class="total-row total">
      <span>总计:</span>
      <span>${formatCurrency(subtotal * 1.06)}</span>
    </div>
  `;
}

// PDF生成
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // 添加标题
  doc.setFontSize(20);
  doc.text('七彩天空报价单', 105, 20, { align: 'center' });
  
  // 添加公司信息
  doc.setFontSize(12);
  doc.text(`公司名称: ${state.currentQuotation.company.name}`, 20, 40);
  doc.text(`联系电话: ${state.currentQuotation.company.phone}`, 20, 50);
  
  // 添加报价单信息
  doc.text(`报价单号: ${state.currentQuotation.number || dom.quotationNumber.textContent}`, 140, 40);
  doc.text(`日期: ${state.currentQuotation.date || dom.quotationDate.textContent}`, 140, 50);
  doc.text(`有效期: ${state.currentQuotation.validUntil || dom.validUntil.textContent}`, 140, 60);
  
  // 添加表格
  const headers = ['序号', '产品名称', '规格', '单价', '数量', '小计'];
  const data = state.selectedProducts.map((product, index) => [
    index + 1,
    product.name,
    product.specs,
    formatCurrency(product.price),
    product.quantity,
    formatCurrency(product.price * product.quantity)
  ]);
  
  doc.autoTable({
    startY: 80,
    head: [headers],
    body: data,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [242, 242, 242] }
  });
  
  // 添加总计
  const subtotal = state.selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const finalY = doc.lastAutoTable.finalY + 20;
  
  doc.text(`小计: ${formatCurrency(subtotal)}`, 150, finalY);
  doc.text(`税费 (6%): ${formatCurrency(subtotal * 0.06)}`, 150, finalY + 10);
  doc.text(`总计: ${formatCurrency(subtotal * 1.06)}`, 150, finalY + 20);
  
  // 添加备注
  doc.text(`备注: ${state.currentQuotation.note}`, 20, finalY + 40);
  
  // 保存PDF
  doc.save(`报价单_${state.currentQuotation.number || dom.quotationNumber.textContent}.pdf`);
  showToast('PDF生成成功', 'success');
}

// 初始化函数
function initQuotationInfo() {
  if (!dom.quotationNumber.textContent) {
    dom.quotationNumber.textContent = generateQuotationNumber();
  }
  if (!dom.quotationDate.textContent) {
    dom.quotationDate.textContent = formatDate(new Date());
  }
  if (!dom.validUntil.textContent) {
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    dom.validUntil.textContent = formatDate(validDate);
  }
}

function loadSampleProducts() {
  state.products = [
    {
      id: 'prod001',
      name: '高性能服务器',
      specs: 'Intel Xeon 16核/32GB内存/1TB SSD',
      unit: '台',
      price: 12999,
      image: 'https://via.placeholder.com/150?text=服务器'
    },
    {
      id: 'prod002',
      name: '企业级交换机',
      specs: '24口千兆/网管型',
      unit: '台',
      price: 3599,
      image: 'https://via.placeholder.com/150?text=交换机'
    },
    {
      id: 'prod003',
      name: '无线AP',
      specs: '双频1200M/支持POE',
      unit: '台',
      price: 899,
      image: 'https://via.placeholder.com/150?text=无线AP'
    },
    {
      id: 'prod004',
      name: '监控摄像头',
      specs: '400万像素/红外夜视',
      unit: '台',
      price: 499,
      image: 'https://via.placeholder.com/150?text=摄像头'
    },
    {
      id: 'prod005',
      name: 'NAS存储',
      specs: '4盘位/8TB*4',
      unit: '套',
      price: 8999,
      image: 'https://via.placeholder.com/150?text=NAS'
    },
    {
      id: 'prod006',
      name: '视频会议系统',
      specs: '4K摄像头/全向麦克风',
      unit: '套',
      price: 12999,
      image: 'https://via.placeholder.com/150?text=会议系统'
    }
  ];
  state.filteredProducts = [...state.products];
}

function setupSearch() {
  dom.searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    state.filteredProducts = state.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.specs.toLowerCase().includes(searchTerm));
    renderProductList();
  });
}

function initEventListeners() {
  // 预览PDF按钮
  dom.previewPdfBtn.addEventListener('click', () => {
    showToast('预览功能将在浏览器中直接显示', 'info');
  });
  
  // 生成PDF按钮
  dom.generatePdfBtn.addEventListener('click', async () => {
    dom.loaderContainer.style.display = 'flex';
    try {
      await generatePDF();
    } catch (error) {
      console.error('生成PDF失败:', error);
      showToast('生成PDF失败', 'error');
    } finally {
      dom.loaderContainer.style.display = 'none';
    }
  });
  
  // 保存报价单按钮
  dom.saveQuotationBtn.addEventListener('click', () => {
    const quotation = {
      ...state.currentQuotation,
      products: state.selectedProducts,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`quotation_${quotation.number || dom.quotationNumber.textContent}`, JSON.stringify(quotation));
    showToast(`报价单已保存`, 'success');
  });
  
  // 加载报价单按钮
  dom.loadQuotationBtn.addEventListener('click', () => {
    const quotationNumber = prompt('请输入要加载的报价单编号:');
    if (!quotationNumber) return;
    
    const quotation = JSON.parse(localStorage.getItem(`quotation_${quotationNumber}`));
    
    if (quotation) {
      state.currentQuotation = quotation;
      state.selectedProducts = quotation.products;
      
      // 更新UI
      dom.quotationNumber.textContent = quotation.number || generateQuotationNumber();
      dom.quotationDate.textContent = quotation.date || formatDate(new Date());
      dom.validUntil.textContent = quotation.validUntil || formatDate(new Date(new Date().setDate(new Date().getDate() + 30)));
      updateSelectedProducts();
      
      showToast(`报价单 ${quotation.number} 已加载`, 'success');
    } else {
      showToast(`找不到报价单 ${quotationNumber}`, 'error');
    }
  });
  
  // 添加产品按钮
  dom.addProductBtn.addEventListener('click', () => {
    const productName = prompt('请输入产品名称:');
    if (!productName) return;
    
    const productSpecs = prompt('请输入产品规格:') || '无';
    const productPrice = parseFloat(prompt('请输入产品单价:') || '0');
    const productUnit = prompt('请输入单位(如:台、个):') || '个';
    
    const newProduct = {
      id: `prod_${Date.now()}`,
      name: productName,
      specs: productSpecs,
      unit: productUnit,
      price: productPrice,
      image: ''
    };
    
    state.products.push(newProduct);
    state.filteredProducts = [...state.products];
    renderProductList();
    addToQuotation(newProduct);
  });
}

// 初始化应用
function initApp() {
  initQuotationInfo();
  loadSampleProducts();
  renderProductList();
  setupSearch();
  initEventListeners();
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);