export const getProductImageSrc = (item) => {
  if (!item) return null;
  if (item.imageUrls && item.imageUrls.length > 0) return item.imageUrls[0];
  if (item.imageUrl) return item.imageUrl;
  return null;
};

export const getProductImageFallback = (width = 80, height = 80) => {
  return `https://via.placeholder.com/${width}x${height}/f1f5f9/94a3b8?text=No+Image`;
};
