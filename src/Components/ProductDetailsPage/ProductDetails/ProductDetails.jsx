import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProductsState } from "src/Features/productsSlice";
import { updateGlobalState } from "src/Features/globalSlice";
import { getProductImage } from "src/Functions/imageHelper";
import useOnlineStatus from "src/Hooks/Helper/useOnlineStatus";
import SkeletonProductDetails from "../../Shared/SkeletonLoaders/DetailsPage/SkeletonProductDetails";
import ProductPreview from "../ProductPreview/ProductPreview";
import ProductColorsSection from "./ProductColorsSection/ProductColorsSection";
import ProductDealingControls from "./ProductDealingControls/ProductDealingControls";
import s from "./ProductDetails.module.scss";
import ProductFeatures from "./ProductFeatures/ProductFeatures";
import ProductFirstInfos from "./ProductFirstInfos/ProductFirstInfos";
import ProductSizes from "./ProductSizes/ProductSizes";
import ProductReviews from "./ProductReviews/ProductReviews";

const ProductDetails = ({ productData, onReviewChange }) => {
  // All hooks must be called unconditionally — BEFORE any early return
  const { loadingProductDetails } = useSelector((state) => state.loading);
  const { previewImg, isZoomInPreviewActive } = useSelector(
    (state) => state.global
  );
  const dispatch = useDispatch();
  const zoomInImgRef = useRef();
  const isWebsiteOnline = useOnlineStatus();
  const activeClass = isZoomInPreviewActive ? s.active : "";

  // Use productData?.id to avoid infinite loop: normalizedProduct is a new object
  // every parent render, so [productData] would trigger effect repeatedly.
  useEffect(() => {
    if (!productData?.id) return;
    dispatch(
      updateProductsState({ key: "selectedProduct", value: productData })
    );
    const initialImg = getProductImage(productData?.img);
    dispatch(updateGlobalState({ key: "previewImg", value: initialImg }));
  }, [productData?.id]);

  // Early return AFTER hooks
  if (!productData) return null;

  function handleZoomInEffect(e) {
    const imgRect = e.target.getClientRects()[0];
    const xPosition = e.clientX - imgRect.left;
    const yPosition = e.clientY - imgRect.top;
    const positions = `-${xPosition * 2}px, -${yPosition * 2}px`;
    zoomInImgRef.current.style.transform = `translate(${positions})`;
  }

  return (
    <>
      {!loadingProductDetails && (
        <section className={s.detailsSection} id="details-section">
          <ProductPreview
            productData={productData}
            handleZoomInEffect={handleZoomInEffect}
          />

          <section className={s.details}>
            <div className={`${s.zoomInPreview} ${activeClass}`}>
              <img src={previewImg} alt="product preview" ref={zoomInImgRef} />
            </div>

            <ProductFirstInfos productData={productData} />
            <div className={s.horizontalLine} />
            <ProductColorsSection productData={productData} />
            {productData?.sizes && productData.sizes.length > 0 && (
              <ProductSizes productData={productData} />
            )}
            <ProductDealingControls productData={productData} />
            <ProductFeatures />
            <ProductReviews productData={productData} onReviewChange={onReviewChange} />
          </section>
        </section>
      )}

      {loadingProductDetails && <SkeletonProductDetails />}
    </>
  );
};
export default ProductDetails;
