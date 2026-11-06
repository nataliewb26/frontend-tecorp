const STORAGE_KEY = "tecorp_products";

const initialProducts = [
  {
    id: 1,
    name: "Laptop Lenovo IdeaPad",
    category: "Laptops",
    price: 2499,
    stock: 12,
  },
  {
    id: 2,
    name: "Mouse Logitech G203",
    category: "Accesorios",
    price: 89,
    stock: 25,
  },
  {
    id: 3,
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    price: 159,
    stock: 8,
  },
  {
    id: 4,
    name: "Monitor Samsung 24 pulgadas",
    category: "Monitores",
    price: 699,
    stock: 6,
  },
];

export function getProducts() {
  try {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts !== null) {
      const parsedProducts = JSON.parse(savedProducts);

      if (Array.isArray(parsedProducts)) {
        return parsedProducts;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));

    return initialProducts;
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    return initialProducts;
  }
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Error al guardar los productos:", error);
    return false;
  }
}