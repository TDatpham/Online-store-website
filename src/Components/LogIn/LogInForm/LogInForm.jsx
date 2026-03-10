import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { showAlert } from "src/Features/alertsSlice";
import { setLoginData } from "src/Features/userSlice";
import { loadUserProducts } from "src/Features/productsSlice";
import { loadUserData } from "src/Functions/userDataStorage";
import { authApi } from "src/Services/api";
import { simpleValidationCheck } from "src/Functions/componentsFunctions";
import useOnlineStatus from "src/Hooks/Helper/useOnlineStatus";
import s from "./LogInForm.module.scss";
import LogInFormInputs from "./LogInFormInputs/LogInFormInputs";

// view modes
const VIEW = { LOGIN: "login", OTP: "otp", FORGOT: "forgot", RESET: "reset" };

const LogInForm = () => {
  const { emailOrPhone, password } = useSelector((state) => state.forms.login);
  const [view, setView] = useState(VIEW.LOGIN);
  const [otpCode, setOtpCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isWebsiteOnline = useOnlineStatus();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  async function login(e) {
    e.preventDefault();
    if (!isWebsiteOnline) { internetConnectionAlert(dispatch, t); return; }
    const inputs = e.target.querySelectorAll("input");
    const isFormValid = simpleValidationCheck(inputs);
    if (!isFormValid) return;
    try {
      const response = await authApi.login({ username: emailOrPhone, password });
      if (response.data) {
        dispatch(setLoginData(response.data));
        restoreUserProducts(dispatch, response.data);
        logInAlert(dispatch, t);
      }
    } catch (error) {
      dispatch(showAlert({ alertText: "Invalid email or password", alertState: "error", alertType: "alert" }));
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        dispatch(
          showAlert({
            alertText: "Google did not return a valid token. Please try again.",
            alertState: "error",
            alertType: "alert",
          })
        );
        return;
      }

      const response = await authApi.googleLogin(idToken);
      if (response.data) {
        dispatch(setLoginData(response.data));
        restoreUserProducts(dispatch, response.data);
        logInAlert(dispatch, t);
      }
    } catch (error) {
      const msg =
        error?.response?.data ||
        "Google Login Failed. Please try again later.";
      dispatch(
        showAlert({
          alertText: msg,
          alertState: "error",
          alertType: "alert",
        })
      );
    }
  };

  // OTP Login
  const sendLoginOtp = async () => {
    if (!emailOrPhone?.includes("@")) {
      dispatch(showAlert({ alertText: "Please enter a valid email address first", alertState: "error", alertType: "alert" }));
      return;
    }
    try {
      await authApi.sendOtp(emailOrPhone);
      setView(VIEW.OTP);
      dispatch(showAlert({ alertText: "OTP sent! Check your email inbox (and Spam folder)", alertState: "success", alertType: "alert" }));
    } catch (error) {
      const msg = error?.response?.data || "Failed to send OTP.";
      dispatch(showAlert({ alertText: msg, alertState: "error", alertType: "alert" }));
    }
  };

  const verifyLoginOtp = async () => {
    try {
      const response = await authApi.verifyOtp(emailOrPhone, otpCode);
      if (response.data) {
        dispatch(setLoginData(response.data));
        restoreUserProducts(dispatch, response.data);
        dispatch(showAlert({ alertText: "Logged in successfully with OTP!", alertState: "success", alertType: "alert" }));
        setView(VIEW.LOGIN);
      }
    } catch {
      dispatch(showAlert({ alertText: "Invalid or expired OTP", alertState: "error", alertType: "alert" }));
    }
  };

  // Forgot Password flow
  const sendForgotOtp = async () => {
    if (!forgotEmail?.includes("@")) {
      dispatch(showAlert({ alertText: "Please enter a valid email address", alertState: "error", alertType: "alert" }));
      return;
    }
    try {
      await authApi.sendOtp(forgotEmail);
      setView(VIEW.RESET);
      dispatch(showAlert({ alertText: "OTP sent to your email for password reset", alertState: "success", alertType: "alert" }));
    } catch (error) {
      const msg = error?.response?.data || "Failed to send OTP.";
      dispatch(showAlert({ alertText: msg, alertState: "error", alertType: "alert" }));
    }
  };

  const resetPassword = async () => {
    if (!resetOtp || !newPassword || !confirmPassword) {
      dispatch(showAlert({ alertText: "Please fill all fields", alertState: "error", alertType: "alert" }));
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch(showAlert({ alertText: "Passwords do not match", alertState: "error", alertType: "alert" }));
      return;
    }
    if (newPassword.length < 8) {
      dispatch(showAlert({ alertText: "Password must be at least 8 characters", alertState: "error", alertType: "alert" }));
      return;
    }
    try {
      await authApi.resetPassword(forgotEmail, resetOtp, newPassword);
      dispatch(showAlert({ alertText: "Password reset successfully! Please log in.", alertState: "success", alertType: "alert" }));
      setView(VIEW.LOGIN);
      setForgotEmail(""); setResetOtp(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      const msg = error?.response?.data || "Invalid OTP or request expired.";
      dispatch(showAlert({ alertText: msg, alertState: "error", alertType: "alert" }));
    }
  };

  return (
    <div className={s.formContainer}>
      <form className={s.form} onSubmit={login}>
        <h2>{t("loginSignUpPage.login")}</h2>
        <p>{t("loginSignUpPage.enterDetails")}</p>

        {/* ── Normal Login ── */}
        {view === VIEW.LOGIN && (
          <>
            <LogInFormInputs />
            <div className={s.buttons}>
              <button type="submit" className={s.loginBtn}>
                {t("buttons.login")}
              </button>
              <button
                type="button"
                className={s.forgotBtn}
                onClick={() => setView(VIEW.FORGOT)}
              >
                {t("loginSignUpPage.forgotPassword")}
              </button>
            </div>
            <span className={s.otpToggle} onClick={sendLoginOtp}>
              Login with OTP instead?
            </span>
          </>
        )}

        {/* ── OTP Login ── */}
        {view === VIEW.OTP && (
          <div className={s.otpVerification}>
            <p className={s.otpHint}>Enter the 6-digit code sent to <strong>{emailOrPhone}</strong></p>
            <div className={s.otpInput}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <button type="button" className={s.loginBtn} onClick={verifyLoginOtp}>
              Verify &amp; Login
            </button>
            <span className={s.otpToggle} onClick={() => setView(VIEW.LOGIN)}>
              ← Back to Password Login
            </span>
          </div>
        )}

        {/* ── Forgot Password ── */}
        {view === VIEW.FORGOT && (
          <div className={s.otpVerification}>
            <p className={s.otpHint}>Enter your account email to receive a reset OTP.</p>
            <div className={s.otpInput}>
              <input
                type="email"
                placeholder="Your account email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <button type="button" className={s.loginBtn} onClick={sendForgotOtp}>
              Send Reset OTP
            </button>
            <span className={s.otpToggle} onClick={() => setView(VIEW.LOGIN)}>
              ← Back to Login
            </span>
          </div>
        )}

        {/* ── Reset Password ── */}
        {view === VIEW.RESET && (
          <div className={s.otpVerification}>
            <p className={s.otpHint}>Enter the OTP sent to <strong>{forgotEmail}</strong> and your new password.</p>
            <div className={s.otpInput}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className={s.otpInput}>
              <input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className={s.otpInput}>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="button" className={s.loginBtn} onClick={resetPassword}>
              Reset Password
            </button>
            <span className={s.otpToggle} onClick={() => setView(VIEW.FORGOT)}>
              ← Resend OTP
            </span>
          </div>
        )}

        {/* Google Login — always visible */}
        <div className={s.googleBtnContainer}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              dispatch(
                showAlert({
                  alertText: "Google Login Failed. Please check your Google account or try again.",
                  alertState: "error",
                  alertType: "alert",
                })
              )
            }
          />
        </div>

        <p className={s.signUpMessage}>
          <span>{t("loginSignUpPage.dontHaveAcc")}</span>
          <Link to="/signup">{t("nav.signUp")}</Link>
        </p>
      </form>
    </div>
  );
};
export default LogInForm;

function logInAlert(dispatch, t) {
  const alertText = t("toastAlert.loginSuccess");
  const alertState = "success";
  setTimeout(
    () => dispatch(showAlert({ alertText, alertState, alertType: "alert" })),
    1500
  );
}

function internetConnectionAlert(dispatch, t) {
  const alertText = t("toastAlert.loginFailed");
  const alertState = "error";
  dispatch(showAlert({ alertText, alertState, alertType: "alert" }));
}

/**
 * After login, restore the user's saved favorites and wishlist
 * from their per-user localStorage slot.
 */
function restoreUserProducts(dispatch, responseData) {
  const userId = responseData?.user?.id || responseData?.id;
  if (!userId) return;
  const favoritesProducts = loadUserData("favoritesProducts", userId);
  const wishList = loadUserData("wishList", userId);
  dispatch(loadUserProducts({ favoritesProducts, wishList }));
}
