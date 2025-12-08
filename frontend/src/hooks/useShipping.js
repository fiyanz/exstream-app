import { useState, useCallback } from 'react';
import { calculateShippingCost, formatShippingOptions } from '../services/hitungCostOngkir';
import { PRODUCT_WEIGHT } from '../features/transactions/constants';

export const useShipping = () => {
    const [shippingOptions, setShippingOptions] = useState([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);

    const checkShippingCost = useCallback(async (destinationId) => {
        if (!destinationId) {
            setShippingOptions([]);
            return;
        }

        try {
            setIsLoadingShipping(true);
            const res = await calculateShippingCost({
                receiver_destination_id: destinationId,
                weight: PRODUCT_WEIGHT
            });

            if (res.success) {
                setShippingOptions(formatShippingOptions(res));
            } else {
                setShippingOptions([]);
            }
        } catch (error) {
            console.error("Shipping calculation failed", error);
            setShippingOptions([]);
        } finally {
            setIsLoadingShipping(false);
        }
    }, []);

    const selectShippingOption = useCallback((optionId) => {
        const option = shippingOptions.find(o => o.id === optionId);
        if (option) {
            setShippingCost(option.cost);
            return option;
        }
        return null;
    }, [shippingOptions]);

    const resetShipping = useCallback(() => {
        setShippingOptions([]);
        setShippingCost(0);
    }, []);

    return {
        shippingOptions,
        isLoadingShipping,
        shippingCost,
        checkShippingCost,
        selectShippingOption,
        resetShipping
    };
};
