const WISHLIST_STORAGE_KEY = 'furnihub_wishlist';

export const getWishlistItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveWishlistItems = (items) => {
  if (typeof window === 'undefined') {
    return items;
  }

  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const getWishlistCount = () => {
  return getWishlistItems().length;
};

export const isInWishlist = (productId) => {
  return getWishlistItems().some((item) => item.productId === productId);
};

export const toggleWishlistItem = (product) => {
  const items = getWishlistItems();
  const productId = product.productId || product.id;
  const existingIndex = items.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    items.splice(existingIndex, 1);
  } else {
    items.push({
      productId,
      name: product.name,
      price: product.price,
      imageUrls: product.imageUrls,
      categoryName: product.categoryName,
      stock: product.stock,
    });
  }

  saveWishlistItems(items);
  window.dispatchEvent(new Event('wishlist:updated'));
  return items;
};

export const clearWishlist = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
  window.dispatchEvent(new Event('wishlist:updated'));
};
