import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "src/Features/userSlice";
import { clearUserProducts } from "src/Features/productsSlice";

/**
 * Hook that guards the session by checking for the access token in sessionStorage.
 *
 * - sessionStorage is cleared automatically when the browser/tab is closed.
 * - On the next page load, if Redux says the user is signed in but there is no
 *   access token in sessionStorage, this hook will force a sign-out, ensuring
 *   the user is logged out after closing the browser.
 */
const useSessionGuard = () => {
    const dispatch = useDispatch();
    const isSignIn = useSelector((state) => state.user.loginInfo?.isSignIn);

    useEffect(() => {
        const sessionToken = sessionStorage.getItem("accessToken");

        // If Redux thinks the user is signed in but there's no sessionStorage token,
        // the browser was likely closed and reopened → force sign-out.
        if (isSignIn && !sessionToken) {
            dispatch(clearUserProducts());
            dispatch(signOut());
        }
    }, []); // Only run once on mount
};

export default useSessionGuard;
