/**
 * Hook để sinh ra srcset string cho responsive images
 * @param {string} baseName - Tên cơ bản của ảnh (không có extension)
 * @param {string[]} sizes - Các kích thước cần tạo srcset
 * @param {string} format - Format ảnh (webp, avif, jpg)
 * @returns {string} srcset string
 */
export function generateSrcSet(baseName, sizes, format = 'webp') {
  return sizes
    .map((size) => `./images/optimized/${baseName}-${size}w.${format} ${size}w`)
    .join(', ');
}

/**
 * Hook để sinh ra responsive image sources
 * @param {string} baseName - Tên cơ bản của ảnh
 * @param {string[]} sizes - Các kích thước cần tạo
 * @returns {Object} Object chứa sources cho picture element
 */
export function generateResponsiveImage(baseName, sizes = [480, 768, 1024, 1280]) {
  return {
    avif: generateSrcSet(baseName, sizes, 'avif'),
    webp: generateSrcSet(baseName, sizes, 'webp'),
    jpg: `./images/${baseName}-full.jpg`,
  };
}

/**
 * Hook để lấy cấu hình srcset cho từng loại ảnh
 */
export function getImageSrcSetConfig(imageName) {
  const profileImages = ['profile1', 'profile2', 'profile3'];
  const timelineImages = [
    'ultimateZ_1', 'ultimateZ_2',
    'premium1_1', 'premium1_2', 'premium1_3', 'premium1_4', 'premium1_5',
    'premium2_1', 'premium2_2', 'premium2_3',
    'giamkhao', 'giamkhao_1', 'giamkhao_2', 'giamkhao_3', 'giamkhao_4',
    'championship_1', 'southern_1', 'BOT_II'
  ];

  if (profileImages.includes(imageName)) {
    return generateResponsiveImage(imageName, [320, 480]);
  }
  if (timelineImages.includes(imageName)) {
    return generateResponsiveImage(imageName, [480, 768, 1024, 1280]);
  }
  return generateResponsiveImage(imageName);
}
