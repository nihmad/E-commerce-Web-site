export type CartItem = {
  productId: number;
  name: string;
  price: string;
  image_url: string;
  slug: string;
  stock: number;
  quantity: number;
};

const CART_KEY = "ecommerce_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      stock: typeof item.stock === "number" ? item.stock : 999,
    }));
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
  const maxStock = Math.max(0, item.stock);
  if (existing) {
    existing.stock = item.stock;
    existing.quantity = Math.min(existing.quantity + qty, maxStock);
  } else {
    cart.push({ ...item, quantity: Math.min(Math.max(qty, 1), maxStock) });
  }
  saveCart(cart.filter((line) => line.quantity > 0));
}

export function updateQuantity(productId: number, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.productId !== productId);
  } else {
    const item = cart.find((c) => c.productId === productId);
    if (item) item.quantity = Math.min(quantity, Math.max(0, item.stock));
  }
  saveCart(cart.filter((line) => line.quantity > 0));
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
