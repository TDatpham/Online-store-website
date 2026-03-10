import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SIMPLE_DELAYS } from "src/Data/globalVariables";
import { productsData } from "src/Data/productsData";
import { updateLoadingState } from "src/Features/loadingSlice";
import useScrollOnMount from "src/Hooks/App/useScrollOnMount";
import useUpdateLoadingOnSamePage from "src/Hooks/App/useUpdateLoadingOnSamePage";
import useGetSearchParam from "src/Hooks/Helper/useGetSearchParam";
import PagesHistory from "../Shared/MiniComponents/PagesHistory/PagesHistory";
import ProductDetails from "./ProductDetails/ProductDetails";
import s from "./ProductDetailsPage.module.scss";
import RelatedItemsSection from "./RelatedItemsSection/RelatedItemsSection";
import useFetchProducts from "src/Hooks/App/useFetchProducts";

const ProductDetailsPage = () => {
  const { t } = useTranslation();
  const PRODUCT_NAME = useGetSearchParam("product");
  const PRODUCT_ID = useGetSearchParam("id");
  const { products: backendProducts, loading, refetch } = useFetchProducts();

  // All hooks must be called unconditionally at the top
  useUpdateLoadingOnSamePage({
    loadingKey: "loadingProductDetails",
    actionMethod: updateLoadingState,
    delays: SIMPLE_DELAYS,
    dependencies: [PRODUCT_NAME, PRODUCT_ID],
  });
  useScrollOnMount(200);

  // Use backend products if available, fallback to static data
  const allProducts =
    !loading && backendProducts.length > 0 ? backendProducts : productsData;

  const PRODUCT_DATA = allProducts.find((product) => {
    if (PRODUCT_ID && String(product?.id) === String(PRODUCT_ID)) return true;
    if (!PRODUCT_NAME) return false;
    const name = product?.name || "";
    const shortName = product?.shortName || "";
    return (
      name.toLowerCase() === PRODUCT_NAME.toLowerCase() ||
      shortName.toLowerCase() === PRODUCT_NAME.toLowerCase()
    );
  });

  // Memoize to avoid new object reference on every render (prevents infinite loop in ProductDetails useEffect)
  const normalizedProduct = useMemo(
    () =>
      PRODUCT_DATA
        ? {
          ...PRODUCT_DATA,
          shortName: PRODUCT_DATA.shortName || PRODUCT_DATA.name,
          otherImages: PRODUCT_DATA.otherImages?.length > 0
            ? PRODUCT_DATA.otherImages
            : [PRODUCT_DATA.img],
          colors: Array.isArray(PRODUCT_DATA.colors) ? PRODUCT_DATA.colors : [],
          sizes: Array.isArray(PRODUCT_DATA.sizes) ? PRODUCT_DATA.sizes : [],
          rate: PRODUCT_DATA.rate || 0,
          votes: PRODUCT_DATA.votes || 0,
          quantity: PRODUCT_DATA.quantity || 1,
        }
        : null,
    [PRODUCT_DATA]
  );

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "80px", textAlign: "center" }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!normalizedProduct) {
    return (
      <div className="container" style={{ paddingTop: "80px", textAlign: "center" }}>
        <h2>Product not found</h2>
        <p style={{ color: "gray", marginTop: "10px" }}>The product you are looking for does not exist.</p>
      </div>
    );
  }

  const productCategory = normalizedProduct.category?.toLowerCase() || "";
  const productCategoryTrans = t(`categoriesData.${productCategory}`, { defaultValue: productCategory });
  const productNameTrans = normalizedProduct.shortName;
  const history = [t("history.account"), productCategoryTrans, productNameTrans];
  const historyPaths = [
    { index: 0, path: "/profile" },
    { index: 1, path: `/category?type=${normalizedProduct.category}` },
  ];

  return (
    <>
      <Helmet>
        <title>{normalizedProduct.shortName}</title>
        <meta
          name="description"
          content="Explore the details and specifications of your favorite products on Exclusive. Find everything you need to know, from features to customer reviews, before making your purchase."
        />
      </Helmet>

      <div className="container">
        <main className={s.detailsPage}>
          <PagesHistory history={history} historyPaths={historyPaths} />
          <ProductDetails productData={normalizedProduct} onReviewChange={refetch} />
          <RelatedItemsSection
            productType={normalizedProduct.category}
            currentProduct={normalizedProduct}
          />
        </main>
      </div>
    </>
  );
};
export default ProductDetailsPage;
