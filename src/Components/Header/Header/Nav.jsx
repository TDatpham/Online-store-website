import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import s from "./Nav.module.scss";

const Nav = () => {
  const { t, i18n } = useTranslation();
  const { loginInfo } = useSelector((state) => state.user);
  const { isSignIn, role } = loginInfo;
  const navDirection = i18n.dir() === "ltr" ? "ltr" : "rtl";
  const isAdmin = role === "ADMIN" || role === "admin";

  return (
    <nav className={s.nav} dir={navDirection}>
      <ul>
        <li>
          <NavLink to="/">{t("nav.home")}</NavLink>
        </li>

        <li>
          <NavLink to="/contact">{t("nav.contact")}</NavLink>
        </li>

        <li>
          <NavLink to="/about">{t("nav.about")}</NavLink>
        </li>

        <li>
          {isSignIn ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" style={{ marginRight: "10px" }}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/order" style={{ marginRight: "10px" }}>
                My Orders
              </NavLink>
              <NavLink to="/profile">{t("nav.profile")}</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" style={{ marginRight: "10px" }}>
                {t("nav.login")}
              </NavLink>
              <NavLink to="/signup">{t("nav.signUp")}</NavLink>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
