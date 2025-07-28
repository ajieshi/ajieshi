import ProductService from './product/service.js';
import { showLoader, hideLoader, showToast } from './utils/dom.js';

// 初始化产品服务
const productService = new ProductService();

// 状态管理
const state = {
  products: [],
  filteredProducts: [],
  selectedProducts: [],
  // ...其他状态
};

// 初始化应用
async function initApp() {
  try {
    showLoader('加载产品数据...');
    
    // 加载产品
    state.products = await productService.init();
    state.filteredProducts = [...state.products];
    
    // 初始化UI
    initQuotationInfo();
    renderProductList();
    setupSearch();
    initEventListeners();
	
// 渲染产品列表
function renderProductList() {
  // 使用productService获取数据
  const products = state.filteredProducts;
  // ...渲染逻辑
}

// 其他函数保持不变...
// 更新报价单信息函数
function updateQuotationInfo() {
  // 更新报价单头部信息
  const companyName = document.querySelector('[aria-label="公司名称"]').textContent;
  const companyPhone = document.querySelector('[aria-label="联系电话"]').textContent;
  const notes = document.querySelector('[aria-label="备注信息"]').textContent;

  // 更新状态
  state.currentQuotation = {
    ...state.currentQuotation,
    company: {
      name: companyName,
      phone: companyPhone
    },
    note: notes,
    number: document.getElementById('quotation-number').textContent,
    date: document.getElementById('quotation-date').textContent,
    validUntil: document.getElementById('valid-until').textContent
  };
}
/**
 * 从本地存储加载报价单
 */
function loadFromLocalStorage() {
  const quotationNumber = prompt('请输入要加载的报价单编号:');
  if (!quotationNumber) return;

  try {
    const quotation = JSON.parse(localStorage.getItem(`quotation_${quotationNumber}`));
    
    if (quotation) {
      // 更新状态
      state.currentQuotation = quotation;
      state.selectedProducts = quotation.products || [];
      
      // 更新UI
      document.getElementById('quotation-number').textContent = quotation.number;
      document.getElementById('quotation-date').textContent = quotation.date;
      document.getElementById('valid-until').textContent = quotation.validUntil;
      document.querySelector('[aria-label="备注信息"]').textContent = quotation.note || '无';
      document.querySelector('[aria-label="公司名称"]').textContent = quotation.company?.name || '';
      document.querySelector('[aria-label="联系电话"]').textContent = quotation.company?.phone || '';

      // 更新产品列表和总计
      updateSelectedProducts();
      showToast(`报价单 ${quotation.number} 已加载`, 'success');
    } else {
      showToast(`找不到报价单 ${quotationNumber}`, 'error');
    }
  } catch (error) {
    console.error('加载报价单失败:', error);
    showToast('加载报价单失败', 'error');
  }
}
// 加载报价单的函数
function loadFromLocalStorage() {
  const quotationNumber = prompt('请输入报价单编号（如 QT-20230001）:');
  if (!quotationNumber) return;

  // 从本地存储读取
  const savedData = localStorage.getItem(`quotation_${quotationNumber}`);
  if (!savedData) {
    alert('找不到该报价单！');
    return;
  }

  // 解析数据
  const quotation = JSON.parse(savedData);
  
  // 更新页面显示
  document.getElementById('quotation-number').textContent = quotation.number;
  document.getElementById('quotation-date').textContent = quotation.date;
  document.getElementById('valid-until').textContent = quotation.validUntil;
  
  // 更新产品表格
  state.selectedProducts = quotation.products;
  updateSelectedProducts();
  
  alert(`报价单 ${quotationNumber} 加载成功！`);
}

// 添加这个函数（放在文件顶部其他函数附近）
function updateQuotationInfo() {
  // 更新报价单头部信息
  state.currentQuotation = {
    number: document.getElementById('quotation-number').textContent,
    date: document.getElementById('quotation-date').textContent,
    validUntil: document.getElementById('valid-until').textContent,
    company: {
      name: document.querySelector('[aria-label="公司名称"]').textContent,
      phone: document.querySelector('[aria-label="联系电话"]').textContent
    },
    note: document.querySelector('[aria-label="备注信息"]').textContent
  };
}
// 在文件最后添加（确保HTML已加载）
document.addEventListener('DOMContentLoaded', function() {
  // 绑定"加载报价单"按钮
  document.getElementById('load-quotation-btn').addEventListener('click', loadFromLocalStorage);
});