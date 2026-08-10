const CART_STORAGE_KEY = 'furnihub_cart';

export const getCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
};

export const saveCartItems = (items) => {
  if (typeof window === 'undefined') {
    return items;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const addToCartItem = (product) => {
  const items = getCartItems();
  const productId = product.id || product.productId;
  const existingItem = items.find((item) => item.id === productId);
  const addQty = Number(product.quantity) || 1;

  if (existingItem) {
    existingItem.quantity += addQty;
  } else {
    items.push({ ...product, id: productId, quantity: addQty });
  }

  saveCartItems(items);
  window.dispatchEvent(new Event('cart:updated'));
  return items;
};

export const getCartCount = () => {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
};

export const clearCart = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cart:updated'));
};
