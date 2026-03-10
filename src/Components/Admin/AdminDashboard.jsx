import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { showAlert } from "src/Features/alertsSlice";
import { productApi, orderApi, authApi, categoryApi } from "src/Services/api";
import { SalesByCategoryPie, SalesByCategoryBar, RevenueByMonthLine, OrdersCountByMonthLine } from "./AdminCharts";
import s from "./AdminDashboard.module.scss";

const TABS = {
  OVERVIEW: "overview",
  PRODUCTS: "products",
  CATEGORIES: "categories",
  USERS: "users",
  ORDERS: "orders",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: 0,
    category: "",
    stockQuantity: 0,
    description: "",
    img: "",
    shortName: "",
    discount: 0,
  });

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    id: null,
    fullName: "",
    email: "",
    address: "",
    role: "USER",
  });

  const dispatch = useDispatch();

  const fetchAllData = () => {
    fetchProducts();
    fetchStats();
    fetchOrders();
    fetchUsers();
    fetchCategories();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await productApi.getStats();
      setStats(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll?.();
      if (res?.data) setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authApi.getAllUsers?.();
      if (res?.data) setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: "",
    displayName: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingProduct) {
        await productApi.update(currentProduct.id, currentProduct);
        dispatch(
          showAlert({
            alertText: "Product updated successfully",
            alertState: "success",
            alertType: "alert",
          })
        );
      } else {
        await productApi.create(currentProduct);
        dispatch(
          showAlert({
            alertText: "Product created successfully",
            alertState: "success",
            alertType: "alert",
          })
        );
      }
      fetchProducts();
      fetchStats();
      resetProductForm();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Operation failed",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleProductEdit = (product) => {
    setCurrentProduct(product);
    setIsEditingProduct(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveTab(TABS.PRODUCTS);
  };

  const handleProductDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.delete(id);
        dispatch(
          showAlert({
            alertText: "Product deleted",
            alertState: "success",
            alertType: "alert",
          })
        );
        fetchProducts();
        fetchStats();
      } catch (err) {
        dispatch(
          showAlert({
            alertText: "Delete failed",
            alertState: "error",
            alertType: "alert",
          })
        );
      }
    }
  };

  const resetProductForm = () => {
    setCurrentProduct({
      name: "",
      price: 0,
      category: "",
      stockQuantity: 0,
      description: "",
      img: "",
      shortName: "",
      discount: 0,
    });
    setIsEditingProduct(false);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        displayName: categoryForm.displayName || categoryForm.name,
      };
      if (editingCategory) {
        await categoryApi.update(editingCategory, payload);
      } else {
        await categoryApi.create(payload);
      }
      dispatch(
        showAlert({
          alertText: editingCategory
            ? "Category updated successfully"
            : "Category created successfully",
          alertState: "success",
          alertType: "alert",
        })
      );
      setEditingCategory(null);
      setCategoryForm({ id: null, name: "", displayName: "" });
      fetchCategories();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Failed to save category",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleCategoryEditClick = (c) => {
    setEditingCategory(c.id);
    setCategoryForm({
      id: c.id,
      name: c.name,
      displayName: c.displayName,
    });
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await categoryApi.delete(id);
      dispatch(
        showAlert({
          alertText: "Category deleted successfully",
          alertState: "success",
          alertType: "alert",
        })
      );
      fetchCategories();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Failed to delete category",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleUserEditClick = (u) => {
    setEditingUser(u.id);
    setUserForm({
      id: u.id,
      fullName: u.fullName || "",
      email: u.email || "",
      address: u.address || "",
      role: u.role || "USER",
    });
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, fullName, email, address, role } = userForm;
      await authApi.updateUser(id, { fullName, email, address, role });
      dispatch(
        showAlert({
          alertText: "User updated successfully",
          alertState: "success",
          alertType: "alert",
        })
      );
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Failed to update user",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await authApi.deleteUser(id);
      dispatch(
        showAlert({
          alertText: "User deleted successfully",
          alertState: "success",
          alertType: "alert",
        })
      );
      await fetchUsers();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Failed to delete user",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      dispatch(
        showAlert({
          alertText: "Order status updated",
          alertState: "success",
          alertType: "alert",
        })
      );
      await fetchOrders();
    } catch (err) {
      dispatch(
        showAlert({
          alertText: "Failed to update order status",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => (o.status || "").toUpperCase() === statusFilter);

  const salesByCategory = useMemo(
    () =>
      products.reduce((acc, p) => {
        const cat = p.category || "Unknown";
        const sold = p.sold || 0;
        acc[cat] = (acc[cat] || 0) + sold;
        return acc;
      }, {}),
    [products]
  );

  const parseDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (Array.isArray(dateVal)) {
      // LocalDateTime as array [year, month, day, hour, minute]
      return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
    }
    return new Date(dateVal);
  };

  const revenueByMonth = useMemo(() => {
    const fullYear = {};
    for (let i = 1; i <= 12; i++) {
      fullYear[i.toString().padStart(2, "0")] = 0;
    }

    return orders.reduce((acc, o) => {
      const date = parseDate(o.orderDate);
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      acc[month] = (acc[month] || 0) + (o.totalAmount || 0);
      return acc;
    }, fullYear);
  }, [orders]);

  const ordersCountByMonth = useMemo(() => {
    const fullYear = {};
    for (let i = 1; i <= 12; i++) {
      fullYear[i.toString().padStart(2, "0")] = 0;
    }

    return orders.reduce((acc, o) => {
      const date = parseDate(o.orderDate);
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, fullYear);
  }, [orders]);

  return (
    <div className={s.adminDashboard}>
      <div className="container">
        <div className={s.header}>
          <h1>Admin Dashboard</h1>
          <button onClick={fetchAllData} className={s.refreshBtn}>
            Refresh Data
          </button>
        </div>

        <div className={s.adminLayout}>
          <aside className={s.sidebar}>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.OVERVIEW ? s.activeTab : ""
                }`}
              onClick={() => setActiveTab(TABS.OVERVIEW)}
            >
              Overview
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.PRODUCTS ? s.activeTab : ""
                }`}
              onClick={() => setActiveTab(TABS.PRODUCTS)}
            >
              Products
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.CATEGORIES ? s.activeTab : ""
                }`}
              onClick={() => setActiveTab(TABS.CATEGORIES)}
            >
              Categories
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.USERS ? s.activeTab : ""
                }`}
              onClick={() => setActiveTab(TABS.USERS)}
            >
              Users
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.ORDERS ? s.activeTab : ""
                }`}
              onClick={() => setActiveTab(TABS.ORDERS)}
            >
              Orders
            </button>
          </aside>

          <div className={s.content}>
            {activeTab === TABS.OVERVIEW && (
              <section className={s.statsSection}>
                <h2>Best Selling Products (Analysis)</h2>
                <div className={s.statsGrid}>
                  {stats.map((p) => (
                    <div key={p.id} className={s.statCard}>
                      <h3>{p.shortName}</h3>
                      <p>
                        Sold: <strong>{p.sold || 0}</strong> units
                      </p>
                      <p>
                        Revenue: $
                        {((p.sold || 0) * (p.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {stats.length === 0 && (
                    <p>No stats available yet. Place some orders first.</p>
                  )}
                </div>

                {/* Biểu đồ tròn: Số lượng bán theo thể loại */}
                <div className={s.chartBlock}>
                  <h2>Thống kê bán theo thể loại (Biểu đồ tròn)</h2>
                  {Object.keys(salesByCategory).length ? (
                    <SalesByCategoryPie data={salesByCategory} />
                  ) : (
                    <p>Chưa có dữ liệu bán theo thể loại.</p>
                  )}
                </div>

                {/* Biểu đồ cột: Số lượng bán theo thể loại */}
                <div className={s.chartBlock}>
                  <h2>Thống kê bán theo thể loại (Biểu đồ cột)</h2>
                  {Object.keys(salesByCategory).length ? (
                    <SalesByCategoryBar data={salesByCategory} />
                  ) : (
                    <p>Chưa có dữ liệu bán theo thể loại.</p>
                  )}
                </div>

                {/* Biểu đồ đường: Doanh thu theo tháng trong năm */}
                <div className={s.chartBlock}>
                  <h2>Doanh thu theo tháng trong năm (Biểu đồ đường)</h2>
                  {Object.keys(revenueByMonth).length ? (
                    <RevenueByMonthLine data={revenueByMonth} />
                  ) : (
                    <p>Chưa có đơn hàng để tính doanh thu theo tháng.</p>
                  )}
                </div>

                {/* Biểu đồ đường: Số đơn hàng theo tháng */}
                <div className={s.chartBlock}>
                  <h2>Số đơn hàng theo tháng (Biểu đồ đường)</h2>
                  {Object.keys(ordersCountByMonth).length ? (
                    <OrdersCountByMonthLine data={ordersCountByMonth} />
                  ) : (
                    <p>Chưa có đơn hàng để thống kê số lượng.</p>
                  )}
                </div>
              </section>
            )}

            {activeTab === TABS.PRODUCTS && (
              <>
                <section className={s.formSection}>
                  <h2>{isEditingProduct ? "Edit Product" : "Add New Product"}</h2>
                  <form onSubmit={handleProductSubmit} className={s.form}>
                    <div className={s.inputGroup}>
                      <input
                        name="name"
                        value={currentProduct.name}
                        onChange={handleProductInputChange}
                        placeholder="Product Full Name"
                        required
                      />
                      <input
                        name="shortName"
                        value={currentProduct.shortName}
                        onChange={handleProductInputChange}
                        placeholder="Short Name"
                        required
                      />
                    </div>
                    <div className={s.inputGroup}>
                      <input
                        type="number"
                        name="price"
                        value={currentProduct.price}
                        onChange={handleProductInputChange}
                        placeholder="Price"
                        required
                      />
                      <input
                        type="number"
                        name="discount"
                        value={currentProduct.discount}
                        onChange={handleProductInputChange}
                        placeholder="Discount %"
                      />
                    </div>
                    <div className={s.inputGroup}>
                      <input
                        name="category"
                        value={currentProduct.category}
                        onChange={handleProductInputChange}
                        placeholder="Category"
                        required
                      />
                      <input
                        type="number"
                        name="stockQuantity"
                        value={currentProduct.stockQuantity}
                        onChange={handleProductInputChange}
                        placeholder="Stock Quantity"
                        required
                      />
                    </div>
                    <input
                      name="img"
                      value={currentProduct.img}
                      onChange={handleProductInputChange}
                      placeholder="Image Filename/URL"
                      required
                    />
                    <textarea
                      name="description"
                      value={currentProduct.description}
                      onChange={handleProductInputChange}
                      placeholder="Description"
                      required
                    />

                    <div className={s.buttonGroup}>
                      <button type="submit" className={s.submitBtn}>
                        {isEditingProduct ? "Update" : "Create"}
                      </button>
                      {isEditingProduct && (
                        <button
                          type="button"
                          onClick={resetProductForm}
                          className={s.cancelBtn}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className={s.listSection}>
                  <h2>Product List</h2>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Sold</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.shortName}</td>
                          <td>{p.category}</td>
                          <td>${p.price}</td>
                          <td>{p.stockQuantity}</td>
                          <td>{p.sold || 0}</td>
                          <td>
                            <button
                              onClick={() => handleProductEdit(p)}
                              className={s.editBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleProductDelete(p.id)}
                              className={s.deleteBtn}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={6}>No products found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              </>
            )}

            {activeTab === TABS.CATEGORIES && (
              <section>
                <h2>Category Management</h2>

                <form onSubmit={handleCategorySubmit} className={s.form}>
                  <div className={s.inputGroup}>
                    <input
                      name="name"
                      value={categoryForm.name}
                      onChange={handleCategoryFormChange}
                      placeholder="Category key (e.g. gaming, phones)"
                      required
                    />
                    <input
                      name="displayName"
                      value={categoryForm.displayName}
                      onChange={handleCategoryFormChange}
                      placeholder="Display Name"
                    />
                  </div>
                  <div className={s.buttonGroup}>
                    <button type="submit" className={s.submitBtn}>
                      {editingCategory ? "Update Category" : "Add Category"}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        className={s.cancelBtn}
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({ id: null, name: "", displayName: "" });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <section className={s.listSection}>
                  <h2>Categories List</h2>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Key</th>
                        <th>Display Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td>{c.name}</td>
                          <td>{c.displayName}</td>
                          <td>
                            <button
                              type="button"
                              className={s.editBtn}
                              onClick={() => handleCategoryEditClick(c)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={s.deleteBtn}
                              onClick={() => handleCategoryDelete(c.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr>
                          <td colSpan={4}>No categories found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              </section>
            )}

            {activeTab === TABS.USERS && (
              <section>
                <h2>User Management</h2>
                {editingUser && (
                  <form onSubmit={handleUserSubmit} className={s.form}>
                    <div className={s.inputGroup}>
                      <input
                        name="fullName"
                        value={userForm.fullName}
                        onChange={handleUserFormChange}
                        placeholder="Full Name"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleUserFormChange}
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className={s.inputGroup}>
                      <input
                        name="address"
                        value={userForm.address}
                        onChange={handleUserFormChange}
                        placeholder="Address"
                      />
                      <select
                        name="role"
                        value={userForm.role}
                        onChange={handleUserFormChange}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className={s.buttonGroup}>
                      <button type="submit" className={s.submitBtn}>
                        Save User
                      </button>
                      <button
                        type="button"
                        className={s.cancelBtn}
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {users?.length ? (
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            <button
                              className={s.editBtn}
                              type="button"
                              onClick={() => handleUserEditClick(u)}
                            >
                              Edit
                            </button>
                            <button
                              className={s.deleteBtn}
                              type="button"
                              onClick={() => handleUserDelete(u.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No users found.</p>
                )}
              </section>
            )}

            {activeTab === TABS.ORDERS && (
              <section>
                <h2>Order Management</h2>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Status filter:{" "}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All</option>
                      <option value="PENDING">Pending</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </label>
                </div>

                {filteredOrders?.length ? (
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.userId}</td>
                          <td>${o.totalAmount}</td>
                          <td>
                            <select
                              value={o.status || "PENDING"}
                              onChange={(e) =>
                                handleOrderStatusChange(o.id, e.target.value)
                              }
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td>{o.orderDate}</td>
                          <td>-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No orders yet or admin list endpoint is not implemented.</p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
