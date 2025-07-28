import { fetchProductDirs, fetchProductInfo, fetchProductImages } from '../utils/api.js';
import { parseProductInfo } from './parser.js';

/**
 * 从服务器加载所有产品
 */
export async function loadAllProducts() {
  try {
    // 1. 获取产品目录列表
    const productDirs = await fetchProductDirs();
    
    // 2. 并行加载所有产品信息
    const productPromises = productDirs.map(dir => loadSingleProduct(dir));
    const products = (await Promise.all(productPromises)).filter(Boolean);
    
    return products;
    
  } catch (error) {
    console.error('加载产品失败:', error);
    throw error;
  }
}

/**
 * 加载单个产品信息
 */
export async function loadSingleProduct(productDir) {
  try {
    // 1. 加载产品信息文件
    const infoText = await fetchProductInfo(productDir);
    
    // 2. 解析产品信息
    const product = parseProductInfo(infoText);
    product.id = generateProductId(productDir);
    product.name = productDir;
    
    // 3. 加载产品图片
    const images = await fetchProductImages(productDir);
    if (images.length > 0) {
      product.image = images[0];
    }
    
    return product;
    
  } catch (error) {
    console.error(`加载产品 ${productDir} 失败:`, error);
    return null;
  }
}

/**
 * 生成产品ID
 */
function generateProductId(productDir) {
  return `prod_${productDir.replace(/\s+/g, '_').toLowerCase()}`;
}