import { addToCartItem, getCartCount } from './cart';

describe('cart helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a new product to the cart', () => {
    const items = addToCartItem({ id: 1, name: 'Modern Chair', price: 12999 });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(expect.objectContaining({ id: 1, quantity: 1, price: 12999 }));
  });

  it('increments quantity for an existing product', () => {
    addToCartItem({ id: 1, name: 'Modern Chair', price: 12999 });
    const items = addToCartItem({ id: 1, name: 'Modern Chair', price: 12999 });

    expect(items[0].quantity).toBe(2);
  });

  it('returns the total number of cart items', () => {
    addToCartItem({ id: 1, name: 'Modern Chair', price: 12999 });
    addToCartItem({ id: 2, name: 'Dining Table', price: 34999 });
    addToCartItem({ id: 1, name: 'Modern Chair', price: 12999 });

    expect(getCartCount()).toBe(3);
  });
});
