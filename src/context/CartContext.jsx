import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tecorp_cart";

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || product.id === undefined || product.id === null) {
      console.error("El producto necesita un identificador.");
      return;
    }

    const amount = Math.max(1, Math.floor(Number(quantity) || 1));
    const productStock = Number(product.stock);
    const maximum = Number.isFinite(productStock)
      ? Math.max(0, Math.floor(productStock))
      : Infinity;

    if (maximum === 0) return;

    setCart((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                ...product,
                quantity: Math.min(item.quantity + amount, maximum),
              }
            : item
        );
      }

      return [
        ...current,
        { ...product, quantity: Math.min(amount, maximum) },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((current) =>
      current.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const amount = Number(quantity);

    setCart((current) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return current.filter(
          (item) => String(item.id) !== String(productId)
        );
      }

      return current.map((item) => {
        if (String(item.id) !== String(productId)) return item;

        const itemStock = Number(item.stock);
        const maximum = Number.isFinite(itemStock)
          ? Math.max(0, Math.floor(itemStock))
          : Infinity;

        if (maximum === 0) return item;

        return {
          ...item,
          quantity: Math.min(Math.floor(amount), maximum),
        };
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.price || 0) * item.quantity,
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider.");
  }

  return context;
}
