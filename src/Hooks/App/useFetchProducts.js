import { useEffect, useState, useCallback } from 'react';
import { productApi } from '../../Services/api';

const useFetchProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await productApi.getAll();

      // Normalize backend products so they match the existing frontend shape
      const normalized = (response.data || []).map((p) => {
        const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
        const discount = typeof p.discount === "number" ? p.discount : Number(p.discount) || 0;

        const discountedPrice =
          discount > 0 ? price - (price * discount) / 100 : price;

        return {
          ...p,
          // `afterDiscount` is used heavily in cart, checkout, etc.
          afterDiscount: discountedPrice.toFixed(2),
          // Ensure quantity exists for cart calculations
          quantity: p.quantity || 1,
        };
      });

      setProducts(normalized);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export default useFetchProducts;
