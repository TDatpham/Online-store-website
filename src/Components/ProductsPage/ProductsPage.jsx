import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { SIMPLE_DELAYS } from "src/Data/globalVariables";
import { productCardCustomizations } from "src/Data/staticData";
import { updateLoadingState } from "src/Features/loadingSlice";
import useScrollOnMount from "src/Hooks/App/useScrollOnMount";
import useUpdateLoadingState from "src/Hooks/App/useUpdateLoadingState";
import useFetchProducts from "src/Hooks/App/useFetchProducts";
import PagesHistory from "../Shared/MiniComponents/PagesHistory/PagesHistory";
import SkeletonCards from "../Shared/SkeletonLoaders/ProductCard/SkeletonCards";
import ProductCard from "../Shared/ProductsCards/ProductCard/ProductCard";
import FilterSidebar from "./FilterSidebar/FilterSidebar";
import s from "./ProductsPage.module.scss";

const ProductsPage = () => {
  const { loadingProductsPage } = useSelector((state) => state.loading);
  const { products, loading: productsLoading } = useFetchProducts();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [filters, setFilters] = useState({
    categories: [],
    minPrice: "",
    maxPrice: "",
    colors: []
  });

  useUpdateLoadingState({
    loadingState: loadingProductsPage,
    loadingKey: "loadingProductsPage",
    actionMethod: updateLoadingState,
    delays: SIMPLE_DELAYS,
    cleanFunction: () =>
      dispatch(updateLoadingState({ key: "loadingProductsPage", value: true })),
  });
  useScrollOnMount(200);

  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const cols = new Set();
    products.forEach(p => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach(c => cols.add(c.color || c));
      }
    });
    return Array.from(cols);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;

      // Price filter
      const price = parseFloat(p.afterDiscount);
      if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;

      // Color filter
      if (filters.colors.length > 0) {
        const productColors = p.colors?.map(c => c.color || c) || [];
        if (!filters.colors.some(col => productColors.includes(col))) return false;
      }

      return true;
    });
  }, [products, filters]);

  const isLoading = loadingProductsPage || productsLoading;

  return (
    <>
      <Helmet>
        <title>Products List</title>
        <meta name="description" content="Browse and filter our electronics collection." />
      </Helmet>

      <div className="container">
        <PagesHistory history={["/", t("history.products")]} />

        <main className={s.productsPage}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            categories={availableCategories}
            availableColors={availableColors}
          />

          <section className={s.productsColumn}>
            {isLoading ? (
              <div className={s.SkeletonCards}>
                <SkeletonCards numberOfCards={6} />
              </div>
            ) : (
              <div className={s.productsGrid}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard
                      product={product}
                      key={product.id}
                      customization={productCardCustomizations.allProducts}
                    />
                  ))
                ) : (
                  <p className={s.noProducts}>No products match your filters.</p>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default ProductsPage;
