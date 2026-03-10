import useStoreWebsiteDataToLocalStorage from "./Hooks/App/useStoreWebsiteDataToLocalStorage";
import useSaveUserProducts from "./Hooks/App/useSaveUserProducts";
import useSessionGuard from "./Hooks/App/useSessionGuard";
import AppRoutes from "./Routes/AppRoutes";

function App() {
  useSessionGuard();                    // Auto-logout when browser is closed
  useStoreWebsiteDataToLocalStorage();
  useSaveUserProducts();               // Auto-saves per-user favorites/wishlist
  // useChangeLangDirOnKeys();

  return <AppRoutes />;
}

export default App;
