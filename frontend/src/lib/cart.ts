export type CartItem = {
  productId: number;
  name: string;
  price: string;
  image_url: string;
  slug: string;
  quantity: number;
};

const CART_KEY = "ecommerce_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }
  saveCart(cart);
}

export function updateQuantity(productId: number, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.productId !== productId);
  } else {
    const item = cart.find((c) => c.productId === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(cart);
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter((c) => c.productId !== productId);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
}
