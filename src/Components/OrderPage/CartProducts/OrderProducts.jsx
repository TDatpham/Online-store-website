import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import OrderProduct from "./OrderProduct";
import s from "./OrderProducts.module.scss";

import useFetchOrders from "src/Hooks/App/useFetchOrders";
import useFetchProducts from "src/Hooks/App/useFetchProducts";
import { productsData as staticProducts } from "src/Data/productsData";

const OrderProducts = () => {
  const { t } = useTranslation();
  const { orderProducts: localOrders } = useSelector((state) => state.products);
  const { orders: backendOrders, loading } = useFetchOrders();
  const { products: backendProducts } = useFetchProducts();
  const productsTable = "cartPage.productsTable";

  const allProducts = backendProducts.length > 0 ? backendProducts : staticProducts;

  const ordersToDisplay = backendOrders.length > 0
    ? backendOrders.flatMap(o => o.items.map(item => {
      const pInfo = allProducts.find(p => p.id === item.productId);
      return {
        ...item,
        id: `${o.id}-${item.productId}`,
        orderId: o.id,
        img: pInfo?.img || "",
        name: pInfo?.name || "Unknown",
        shortName: pInfo?.shortName || "Unknown",
        afterDiscount: item.price.toString(),
        status: o.status
      };
    }))
    : localOrders;

  if (loading && localOrders.length === 0) return <div>Loading orders...</div>;

  return (
    <table className={s.orderProducts}>
      <thead>
        <tr>
          <th>{t(`${productsTable}.product`)}</th>
          <th>{t(`${productsTable}.price`)}</th>
          <th>{t(`${productsTable}.quantity`)}</th>
          <th>{t(`${productsTable}.subtotal`)}</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {ordersToDisplay?.map((item) => (
          <OrderProduct key={item.id} data={item} />
        ))}
      </tbody>
    </table>
  );
};
export default OrderProducts;
