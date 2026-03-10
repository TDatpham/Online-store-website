import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "src/Features/alertsSlice";
import { orderApi } from "src/Services/api";
import ConfirmOrderProductBtn from "./ConfirmOrderProductBtn";
import s from "./OrderProduct.module.scss";
import RemoveOrderProductBtn from "./RemoveOrderProductBtn";

const OrderProduct = ({ data }) => {
  const { img, name, shortName, afterDiscount, quantity, orderId, status } = data;
  const priceAfterDiscount = afterDiscount.replaceAll(",", "");
  const subTotal = (quantity * priceAfterDiscount).toFixed(2);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const translatedProduct = translateProduct({
    productName: shortName,
    translateMethod: t,
    translateKey: "shortName",
  });

  async function updateOrderStatus(newStatus) {
    if (!orderId) return;
    try {
      await orderApi.updateStatus(orderId, newStatus);
      dispatch(
        showAlert({
          alertText:
            newStatus === "DELIVERED"
              ? "Cảm ơn bạn đã xác nhận đã nhận hàng."
              : "Đơn hàng đã được yêu cầu hủy.",
          alertState: "success",
          alertType: "alert",
        })
      );
      // Reload to reflect updated status
      window.location.reload();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  }

  const canUpdateStatus = !!orderId;

  return (
    <tr className={s.productContainer}>
      <td className={s.product}>
        <div className={s.imgHolder}>
          <img src={img} alt={`${shortName} product`} />
          {/* Local order-management buttons (fallback for old flow) */}
          {!orderId && (
            <>
              <RemoveOrderProductBtn
                productName={shortName}
                translatedProduct={translatedProduct}
              />
              <ConfirmOrderProductBtn
                productName={shortName}
                translatedProduct={translatedProduct}
              />
            </>
          )}
        </div>

        <Link to={`/details?product=${name}`}>{translatedProduct}</Link>
      </td>

      <td className={s.price}>${afterDiscount}</td>

      <td>{quantity}</td>

      <td>${subTotal}</td>

      <td className={s.status}>
        <span className={s[(status || "PENDING").toLowerCase()]}>
          {status || "PENDING"}
        </span>
        {canUpdateStatus && (
          <div className={s.statusActions}>
            <button
              type="button"
              onClick={() => updateOrderStatus("DELIVERED")}
              disabled={status === "DELIVERED" || status === "CANCELLED"}
            >
              Đã nhận hàng
            </button>
            <button
              type="button"
              onClick={() => updateOrderStatus("CANCELLED")}
              disabled={status === "DELIVERED" || status === "CANCELLED"}
            >
              Hủy đơn
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};
export default OrderProduct;

export function translateProduct({
  productName,
  translateMethod,
  translateKey,
  uppercase = false,
  dynamicData = {},
}) {
  const shortNameKey = productName?.replaceAll(" ", "");
  const productTrans = `products.${shortNameKey}`;
  const translateText = translateMethod(
    `${productTrans}.${translateKey}`,
    dynamicData
  );
  return uppercase ? translateText.toUpperCase() : translateText;
}
