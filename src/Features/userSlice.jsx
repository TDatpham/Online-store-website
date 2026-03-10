import { createSlice } from "@reduxjs/toolkit";

// Access token is stored in sessionStorage (cleared when browser/tab closes)
// Refresh token and user info stored separately

const SESSION_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function getSessionAccessToken() {
  return sessionStorage.getItem(SESSION_TOKEN_KEY) || "";
}

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

// Load user info (without tokens) from localStorage
const storedUserInfo = (() => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

// On page load: user is signed in only if they have a valid access token in sessionStorage
const sessionAccessToken = getSessionAccessToken();
const isSignedIn = !!(sessionAccessToken && storedUserInfo?.isSignIn);

const defaultLoginInfo = {
  username: "",
  emailOrPhone: "",
  password: "",
  address: "",
  isSignIn: false,
  accessToken: "",
  refreshToken: "",
};

// If there's a session token, restore the user; otherwise treat as guest
const initialState = {
  loginInfo: isSignedIn
    ? {
      ...storedUserInfo,
      accessToken: sessionAccessToken,
      refreshToken: getStoredRefreshToken(),
      isSignIn: true,
    }
    : defaultLoginInfo,
  signedUpUsers: [],
};

const userSlice = createSlice({
  initialState,
  name: "userSlice",
  reducers: {
    newSignUp: (state, { payload }) => {
      const info = payload.user
        ? { ...payload.user, accessToken: payload.accessToken, refreshToken: payload.refreshToken }
        : { ...payload };

      info.isSignIn = true;
      state.loginInfo = info;

      // Save tokens to their respective storages
      sessionStorage.setItem(SESSION_TOKEN_KEY, info.accessToken || "");
      if (info.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, info.refreshToken);
      }
      // Save user info (without tokens) to localStorage
      saveUserInfoToStorage(info);
    },

    setLoginData: (state, { payload }) => {
      let mappedData;
      if (payload.user) {
        mappedData = {
          ...payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        };
      } else {
        mappedData = { ...payload };
      }

      if (!mappedData.emailOrPhone && mappedData.email) {
        mappedData.emailOrPhone = mappedData.email;
      }

      mappedData.isSignIn = true;
      state.loginInfo = mappedData;

      // Store access token in sessionStorage (clears on tab/browser close)
      sessionStorage.setItem(SESSION_TOKEN_KEY, mappedData.accessToken || "");
      // Store refresh token in localStorage (persists)
      if (mappedData.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, mappedData.refreshToken);
      }
      // Save user info (without tokens) to localStorage for profile restore
      saveUserInfoToStorage(mappedData);
    },

    signOut: (state) => {
      state.loginInfo = { ...defaultLoginInfo };

      // Clear tokens from both storages
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("userInfo");
    },

    updateUserData: (state, { payload }) => {
      Object.assign(state.loginInfo, payload.updatedUserData);
      // Keep stored user info in sync
      saveUserInfoToStorage(state.loginInfo);
    },

    /** Update just the access token (after a token refresh) */
    updateAccessToken: (state, { payload: accessToken }) => {
      state.loginInfo.accessToken = accessToken;
      sessionStorage.setItem(SESSION_TOKEN_KEY, accessToken);
    },
  },
});

/** Save user info to localStorage (WITHOUT tokens - those are stored separately) */
function saveUserInfoToStorage(info) {
  const { accessToken, refreshToken, ...safeInfo } = info;
  localStorage.setItem("userInfo", JSON.stringify({ ...safeInfo, isSignIn: true }));
}

export const { newSignUp, setLoginData, signOut, updateUserData, updateAccessToken } =
  userSlice.actions;
export default userSlice.reducer;
