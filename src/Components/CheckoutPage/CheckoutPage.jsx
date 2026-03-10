import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showAlert } from "src/Features/alertsSlice";
import { orderApi } from "src/Services/api";
import { store } from "src/App/store";
import { transferProducts, clearCart, updateProductsState } from "src/Features/productsSlice";
import {
  blurInputs,
  isCheckoutFormValid,
  showInvalidInputAlert,
} from "src/Functions/componentsFunctions";
import useScrollOnMount from "src/Hooks/App/useScrollOnMount";
import useFormData from "src/Hooks/Helper/useFormData";
import PagesHistory from "../Shared/MiniComponents/PagesHistory/PagesHistory";
import BillingDetails from "./BillingDetails/BillingDetails";
import s from "./CheckoutPage.module.scss";
import PaymentSection from "./PaymentSection/PaymentSection";

const CheckoutPage = () => {
  useScrollOnMount(160);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saveBillingInfoToLocal, cartProducts } = useSelector(
    (state) => state.products
  );
  const { values: billingValues, handleChange } = useFormData({
    initialValues: {
      firstName: "",
      companyName: "",
      streetAddress: "",
      address: "", // Mapping to apartment/address in staticData
      cityOrTown: "",
      phoneNumber: "",
      email: "",
    },
    onSubmit: handleSubmitPayment,
    storeInLocalStorage: saveBillingInfoToLocal,
    localStorageKey: "billingInfo",
  });

  const pageHistory = [t("history.account"), t("history.checkout")];
  const historyPaths = [
    {
      index: 0,
      path: "/profile",
    },
  ];

  async function handleSubmitPayment(event) {
    const isCheckboxFocused = document.activeElement.id === "save-info";
    const isInputFocused = document.activeElement.tagName === "INPUT";
    const inputs = event.target.querySelectorAll("input");
    const isCartEmpty = cartProducts.length === 0;
    const isFormValid = isCheckoutFormValid(event);

    event.preventDefault();
    blurInputs(inputs);
    showInvalidInputAlert(event);
    if (!saveBillingInfoToLocal) localStorage.removeItem("billingInfo");

    if (isInputFocused && isCheckboxFocused) return;
    if (!isFormValid) {
      console.log("Form invalid, inputs:", inputs);
      dispatch(showAlert({ alertText: "Please fill in all required fields correctly.", alertState: "warning", alertType: "alert" }));
      return;
    }

    if (isCartEmpty) {
      showEmptyCartAlert(dispatch, t);
      return;
    }

    try {
      const { loginInfo } = store.getState().user;
      const orderData = {
        userId: loginInfo?.id || 1,
        totalAmount: cartProducts.reduce((acc, p) => {
          const price = typeof p.afterDiscount === 'string'
            ? parseFloat(p.afterDiscount.replaceAll(",", ""))
            : p.afterDiscount;
          return acc + (price * p.quantity);
        }, 0),
        items: cartProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          price: typeof p.afterDiscount === 'string'
            ? parseFloat(p.afterDiscount.replaceAll(",", ""))
            : p.afterDiscount
        }))
      };

      dispatch(showAlert({ alertText: "Placing your order...", alertState: "info", alertType: "alert" }));
      await orderApi.create(orderData);

      // Clear cart and move to orders
      dispatch(transferProducts({ from: "cartProducts", to: "orderProducts" }));
      dispatch(clearCart());

      dispatch(
        showAlert({
          alertState: "success",
          alertText: t("toastAlert.checkoutSuccess"),
          alertType: "alert",
        })
      );

      // Redirect after a small delay
      setTimeout(() => navigate("/order"), 1500);
    } catch (error) {
      console.error("Order failed:", error);
      dispatch(showAlert({ alertText: "Failed to place order. Please try again.", alertState: "error", alertType: "alert" }));
    }
  }

  return (
    <>
      <Helmet>
        <title>Checkout</title>
        <meta
          name="description"
          content="Complete your purchase on Exclusive by reviewing your cart, adding your shipping details, and choosing payment options such as cash or bank card for a smooth checkout experience."
        />
      </Helmet>

      <div className="container">
        <main className={s.checkoutPage} id="checkout-page">
          <PagesHistory history={pageHistory} historyPaths={historyPaths} />

          <form
            method="POST"
            className={s.checkoutPageContent}
            onSubmit={handleSubmitPayment}
          >
            <BillingDetails inputsData={{ billingValues, handleChange }} />
            <PaymentSection />
          </form>
        </main>
      </div>
    </>
  );
};
export default CheckoutPage;

function showEmptyCartAlert(dispatch, t) {
  dispatch(
    showAlert({
      alertState: "warning",
      alertText: t("toastAlert.cartEmpty"),
      alertType: "alert",
    })
  );
}

function finalizeOrder(dispatch, t) {
  dispatch(transferProducts({ from: "cartProducts", to: "orderProducts" }));

  setTimeout(() => {
    dispatch(
      showAlert({
        alertState: "success",
        alertText: t("toastAlert.checkoutSuccess"),
        alertType: "alert",
      })
    );
  }, 600);
}
