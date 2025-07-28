/**
 * 解析产品信息文本
 * @param {string} infoText - 产品信息文本
 * @returns {object} 产品对象
 */
export function parseProductInfo(infoText) {
  const product = {
    specs: '无',
    price: 0,
    unit: '个',
    description: ''
  };
  
  const lines = infoText.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    
    if (line.startsWith('规格:')) {
      product.specs = line.replace('规格:', '').trim();
    } else if (line.startsWith('单价:')) {
      product.price = parseFloat(line.replace('单价:', '').trim());
    } else if (line.startsWith('单位:')) {
      product.unit = line.replace('单位:', '').trim();
    } else if (line.startsWith('描述:')) {
      product.description = line.replace('描述:', '').trim();
    }
  }
  
  return product;
}