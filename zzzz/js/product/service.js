import { loadAllProducts, loadSingleProduct } from './loader.js';

export default class ProductService {
  constructor() {
    this.products = [];
    this.cache = new Map();
  }

  /**
   * 初始化加载所有产品
   */
  async init() {
    this.products = await loadAllProducts();
    return this.products;
  }

  /**
   * 获取所有产品
   */
  getAllProducts() {
    return [...this.products];
  }

  /**
   * 根据ID获取产品
   */
  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  /**
   * 搜索产品
   */
  searchProducts(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(lowerKeyword) || 
      product.specs.toLowerCase().includes(lowerKeyword) ||
      product.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 添加新产品
   */
  async addProduct(productDir) {
    const product = await loadSingleProduct(productDir);
    if (product) {
      this.products.push(product);
    }
    return product;
  }
}