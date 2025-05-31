import { create } from "zustand";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};
type addToCartItem = Omit<CartItem, "quantity">;

interface CartState {
  items: CartItem[];
  addToCart: (item: addToCartItem) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (newItem) => {
    // Check if the product already exists in the cart
    // if it exists, increment the quantity
    // if it doesn't exist, add it to the cart with quantity 1
    set((currentState) => {
      const duplicateItems = [...currentState.items];

      const existingItemIndex = duplicateItems.findIndex(
        (cartItem) => cartItem.productId === newItem.productId,
      );
      if (existingItemIndex === -1) {
        duplicateItems.push({
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          quantity: 1,
          imageUrl: newItem.imageUrl,
        });
      } else {
        const itemToUpdate = duplicateItems[existingItemIndex];
        if (!itemToUpdate)
          return {
            ...currentState,
          };

        itemToUpdate.quantity += 1;
      }

      return {
        ...currentState,
        items: duplicateItems,
      };
    });
  },
}));
