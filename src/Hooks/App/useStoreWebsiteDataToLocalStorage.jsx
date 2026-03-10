import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setItemToLocalStorage } from "../Helper/useLocalStorage";

const useStoreWebsiteDataToLocalStorage = () => {
  const productsData = useSelector((state) => state.products);
  const localStorageData = useSelector((state) => state.localStorage);

  useEffect(() => {
    setItemToLocalStorage("productsSliceData", productsData);
    setItemToLocalStorage("storageSliceData", localStorageData);
    // NOTE: User auth state is now managed separately inside userSlice itself:
    //   - accessToken  → sessionStorage (clears on browser/tab close)
    //   - refreshToken → localStorage
    //   - user profile → localStorage as "userInfo" key
    // So we do NOT persist the full userSliceData here anymore.
  }, [productsData, localStorageData]);
};
export default useStoreWebsiteDataToLocalStorage;
