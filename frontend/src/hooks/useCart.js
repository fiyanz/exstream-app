import { useState, useMemo, useCallback } from 'react';
import { PRODUCT_PRICE, DISCOUNT_RATE } from '../features/transactions/constants';

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = useCallback((product) => {
        setCartItems(prev => [...prev, { ...product, id: Date.now() }]);
    }, []);

    const removeFromCart = useCallback((id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + (PRODUCT_PRICE * item.quantity), 0);
        const discount = subtotal * DISCOUNT_RATE;
        // handlingFee can be added here if dynamic
        return { subtotal, discount };
    }, [cartItems]);

    return {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        ...totals
    };
};
