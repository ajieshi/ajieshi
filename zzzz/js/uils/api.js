/**
 * 获取产品目录列表
 */
export async function fetchProductDirs() {
  const response = await fetch('/api/getProductDirs');
  if (!response.ok) throw new Error('获取产品目录失败');
  return await response.json();
}

/**
 * 获取产品信息文件
 */
export async function fetchProductInfo(productDir) {
  const response = await fetch(`/chanp/${encodeURIComponent(productDir)}/info.txt`);
  if (!response.ok) throw new Error('获取产品信息失败');
  return await response.text();
}

/**
 * 获取产品图片列表
 */
export async function fetchProductImages(productDir) {
  try {
    const response = await fetch(`/api/getProductImages?dir=${encodeURIComponent(productDir)}`);
    if (!response.ok) throw new Error('获取产品图片失败');
    const data = await response.json();
    
    return data.images.map(img => 
      `/chanp/${encodeURIComponent(productDir)}/${encodeURIComponent(img)}`
    );
    
  } catch (error) {
    console.error('获取产品图片失败:', error);
    return [];
  }
}