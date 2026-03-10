import { useEffect } from "react";
import { useSelector } from "react-redux";
import { saveUserData } from "src/Functions/userDataStorage";

/**
 * Hook to auto-save user-specific favorites and wishlist to localStorage
 * whenever they change. Uses the user's ID as the key so each user
 * has their own isolated data.
 */
const useSaveUserProducts = () => {
    const userId = useSelector((state) => state.user.loginInfo?.id);
    const isSignIn = useSelector((state) => state.user.loginInfo?.isSignIn);
    const favoritesProducts = useSelector((state) => state.products.favoritesProducts);
    const wishList = useSelector((state) => state.products.wishList);

    useEffect(() => {
        if (isSignIn && userId) {
            saveUserData("favoritesProducts", userId, favoritesProducts);
        }
    }, [favoritesProducts, isSignIn, userId]);

    useEffect(() => {
        if (isSignIn && userId) {
            saveUserData("wishList", userId, wishList);
        }
    }, [wishList, isSignIn, userId]);
};

export default useSaveUserProducts;
