import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { showAlert } from "src/Features/alertsSlice";
import { productApi, orderApi, authApi, categoryApi } from "src/Services/api";
import { AVAILABLE_COLORS } from "src/Data/staticData";
import {
  SalesByCategoryPie,
  SalesByCategoryBar,
  RevenueByCategoryLine,
} from "./AdminCharts";
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
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: 0,
    category: "",
    brand: "",
    colors: [],
    stockQuantity: 0,
    description: "",
    img: "",
    otherImages: ["", "", ""],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      await productApi.getStats();
    } catch (_err) {
      // console.error(_err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      if (res?.data) setOrders(res.data);
    } catch (_err) {
      console.error(_err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authApi.getAllUsers();
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

  const handleOtherImageChange = (index, value) => {
    setCurrentProduct((prev) => {
      const newOtherImages = [...(prev.otherImages || ["", "", ""])];
      newOtherImages[index] = value;
      return { ...prev, otherImages: newOtherImages };
    });
  };

  const handleColorToggle = (colorObj) => {
    setCurrentProduct(prev => {
      const isSelected = (prev.colors || []).some(c => c.name === colorObj.name);
      const newColors = isSelected
        ? prev.colors.filter(c => c.name !== colorObj.name)
        : [...(prev.colors || []), colorObj];
      return { ...prev, colors: newColors };
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditingProduct) {
        await productApi.update(currentProduct.id, { ...currentProduct, status: currentProduct.status || "APPROVED" });
        dispatch(
          showAlert({
            alertText: "Product updated successfully",
            alertState: "success",
            alertType: "alert",
          })
        );
      } else {
        await productApi.create({ ...currentProduct, status: "APPROVED" });
        dispatch(
          showAlert({
            alertText: "Product created and approved",
            alertState: "success",
            alertType: "alert",
          })
        );
      }
      fetchProducts();
      fetchStats();
      resetProductForm();
    } catch (_err) {
      dispatch(
        showAlert({
          alertText: "Operation failed",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleApproveProduct = async (productId, status) => {
    try {
      await productApi.updateStatus(productId, status);
      dispatch(
        showAlert({
          alertText: `Product ${status.toLowerCase()} successfully`,
          alertState: "success",
          alertType: "alert",
        })
      );
      fetchProducts();
    } catch (_err) {
      dispatch(
        showAlert({
          alertText: "Failed to update product status",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleProductEdit = (product) => {
    const defaultOtherImages = Array.isArray(product.otherImages)
      ? [...product.otherImages, "", "", ""].slice(0, 3)
      : ["", "", ""];
    setCurrentProduct({ ...product, otherImages: defaultOtherImages });
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
      } catch (_err) {
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
      brand: "",
      colors: [],
      stockQuantity: 0,
      description: "",
      img: "",
      otherImages: ["", "", ""],
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
    } catch (_err) {
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
    } catch (_err) {
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
    } catch (_err) {
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
    } catch (_err) {
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
    } catch (_err) {
      dispatch(
        showAlert({
          alertText: "Failed to update order status",
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderApi.delete(orderId);
        dispatch(
          showAlert({
            alertText: "Order deleted successfully",
            alertState: "success",
            alertType: "alert",
          })
        );
        await fetchOrders();
      } catch (_err) {
        dispatch(
          showAlert({
            alertText: "Failed to delete order",
            alertState: "error",
            alertType: "alert",
          })
        );
      }
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



  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0), [orders]);
  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  // Revenue by product category (totalAmount of orders multiplied by product proportion)
  const revenueByCategoryData = useMemo(() => {
    // Calculate estimated revenue by category based on sold products
    const catRevenue = {};
    products.forEach((p) => {
      const cat = p.category || "Unknown";
      const sold = p.sold || 0;
      const price = p.price || 0;
      catRevenue[cat] = (catRevenue[cat] || 0) + sold * price;
    });
    return catRevenue;
  }, [products]);


  return (
    <div className={s.adminDashboard}>
      <div className="container">
        <div className={s.adminLayout}>
          <aside className={s.sidebar}>
            <div className={s.logoArea}>
              <span className={s.logoIcon}>⚡</span>
              <h1>
                Admin Panel
                <span>Electronics Store</span>
              </h1>
            </div>
            <div className={s.navSection}>Main Menu</div>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.OVERVIEW ? s.activeTab : ""}`}
              onClick={() => setActiveTab(TABS.OVERVIEW)}
            >
              <span className={s.tabIcon}>📊</span> Statistics
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.PRODUCTS ? s.activeTab : ""}`}
              onClick={() => setActiveTab(TABS.PRODUCTS)}
            >
              <span className={s.tabIcon}>🛒</span> Products
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.CATEGORIES ? s.activeTab : ""}`}
              onClick={() => setActiveTab(TABS.CATEGORIES)}
            >
              <span className={s.tabIcon}>🗂️</span> Categories
            </button>
            <div className={s.navSection}>Management</div>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.USERS ? s.activeTab : ""}`}
              onClick={() => setActiveTab(TABS.USERS)}
            >
              <span className={s.tabIcon}>👤</span> Users
            </button>
            <button
              type="button"
              className={`${s.tabBtn} ${activeTab === TABS.ORDERS ? s.activeTab : ""}`}
              onClick={() => setActiveTab(TABS.ORDERS)}
            >
              <span className={s.tabIcon}>📦</span> Orders
            </button>
          </aside>

          <div className={s.content}>
            {activeTab === TABS.OVERVIEW && (
              <section className={s.statsSection}>
                <div className={s.pageHeader}>
                  <h2>Website Overview</h2>
                  <p>Real-time analytics and performance metrics</p>
                </div>
                <div className={s.statsGrid}>
                  <div className={`${s.statCard} ${s.statRevenue}`}>
                    <div className={s.statIcon}>💰</div>
                    <h3>Total Revenue</h3>
                    <p className={s.statNumber}>${totalRevenue.toLocaleString()}</p>
                    <span className={s.statGrowth}>12.5% vs last month</span>
                  </div>
                  <div className={`${s.statCard} ${s.statOrders}`}>
                    <div className={s.statIcon}>🛍️</div>
                    <h3>Total Orders</h3>
                    <p className={s.statNumber}>{totalOrders}</p>
                    <span className={s.statGrowth}>5.2% vs last month</span>
                  </div>
                  <div className={`${s.statCard} ${s.statCustomers}`}>
                    <div className={s.statIcon}>👥</div>
                    <h3>Total Customers</h3>
                    <p className={s.statNumber}>{totalUsers}</p>
                    <span className={s.statGrowth}>2.4% vs last month</span>
                  </div>
                  <div className={`${s.statCard} ${s.statProducts}`}>
                    <div className={s.statIcon}>📦</div>
                    <h3>Total Products</h3>
                    <p className={s.statNumber}>{totalProducts}</p>
                    <span className={s.statGrowthNeutral}>Active in store</span>
                  </div>
                </div>

                <div className={s.chartsGrid}>
                  <div className={s.chartBlock}>
                    <h2>📊 Sales by Category</h2>
                    {Object.keys(salesByCategory).length ? (
                      <SalesByCategoryBar data={salesByCategory} />
                    ) : (
                      <p>No data for sales by category.</p>
                    )}
                  </div>

                  <div className={s.chartBlock}>
                    <div className={s.chartHeader}>
                      <h2>🥧 Revenue Distribution</h2>
                    </div>
                    {Object.keys(salesByCategory).length ? (
                      <SalesByCategoryPie data={salesByCategory} />
                    ) : (
                      <p>No data.</p>
                    )}
                  </div>

                  <div className={`${s.chartBlock} ${s.fullWidth}`}>
                    <h2>📈 Revenue by Product Category</h2>
                    {Object.keys(revenueByCategoryData).length > 0 ? (
                      <RevenueByCategoryLine data={revenueByCategoryData} />
                    ) : (
                      <p>No category revenue data available.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeTab === TABS.PRODUCTS && (
              <>
                <div className={s.pageHeader}>
                  <h2>Product Management</h2>
                  <p>Add, edit and manage your product catalog</p>
                </div>
                <section className={s.formSection}>
                  <h2>{isEditingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
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
                      <input
                        name="brand"
                        value={currentProduct.brand}
                        onChange={handleProductInputChange}
                        placeholder="Brand (e.g. Apple, Sony)"
                        required
                      />
                    </div>
                    <div className={s.inputSection}>
                      <label>Select Available Colors:</label>
                      <div className={s.colorOptions}>
                        {AVAILABLE_COLORS.map(c => (
                          <button
                            key={c.name}
                            type="button"
                            title={c.name}
                            className={`${s.colorOption} ${(currentProduct.colors || []).some(pc => pc.name === c.name) ? s.selectedColor : ""}`}
                            style={{ backgroundColor: c.color }}
                            onClick={() => handleColorToggle(c)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className={s.inputGroup}>
                      <input
                        name="img"
                        value={currentProduct.img}
                        onChange={handleProductInputChange}
                        placeholder="Main Image Filename/URL"
                        required
                      />
                      <input
                        value={(currentProduct.otherImages || ["", "", ""])[0]}
                        onChange={(e) => handleOtherImageChange(0, e.target.value)}
                        placeholder="Additional Image 1 Filename/URL"
                      />
                    </div>
                    <div className={s.inputGroup}>
                      <input
                        value={(currentProduct.otherImages || ["", "", ""])[1]}
                        onChange={(e) => handleOtherImageChange(1, e.target.value)}
                        placeholder="Additional Image 2 Filename/URL"
                      />
                      <input
                        value={(currentProduct.otherImages || ["", "", ""])[2]}
                        onChange={(e) => handleOtherImageChange(2, e.target.value)}
                        placeholder="Additional Image 3 Filename/URL"
                      />
                    </div>
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
                  <h2>🛒 Product List</h2>
                  <table className={s.table}>
                    <thead>
                      <tr>
                         <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Seller ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>{p.shortName}</td>
                          <td>{p.category}</td>
                          <td>${p.price}</td>
                          <td data-status={p.status}>
                            <span className={`${s.statusBadge} ${s[p.status?.toLowerCase()]}`}>
                              {p.status || "PENDING"}
                            </span>
                          </td>
                          <td>{p.sellerId || "System"}</td>
                          <td>
                            <div className={s.actionBtns}>
                              {p.status === "PENDING" && (
                                <>
                                  <button onClick={() => handleApproveProduct(p.id, "APPROVED")} className={s.approveBtn}>Approve</button>
                                  <button onClick={() => handleApproveProduct(p.id, "REJECTED")} className={s.rejectBtn}>Reject</button>
                                </>
                              )}
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
                            </div>
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
                <div className={s.pageHeader}>
                  <h2>Category Management</h2>
                  <p>Organize your product categories</p>
                </div>

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
                  <h2>🗂️ Categories List</h2>
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
                <div className={s.pageHeader}>
                  <h2>User Management</h2>
                  <p>Manage user accounts and permissions</p>
                </div>
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
                        <option value="SELLER">SELLER</option>
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
                <div className={s.pageHeader}>
                  <h2>Order Management</h2>
                  <p>Track and manage customer orders</p>
                </div>

                <div className={s.filterBar}>
                  <label>Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Orders</option>
                    <option value="PENDING">Pending</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {filteredOrders?.length ? (
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>User ID</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{o.userId}</td>
                          <td>${o.totalAmount}</td>
                          <td>
                            <select
                              value={o.status || "PENDING"}
                              onChange={(e) =>
                                handleOrderStatusChange(o.id, e.target.value)
                              }
                              className={s.statusSelect}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                          <td>
                            <div className={s.actionBtns}>
                                <button
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className={s.deleteBtn}
                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                    Delete
                                </button>
                            </div>
                          </td>
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
