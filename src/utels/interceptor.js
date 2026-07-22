import Cookies from "js-cookie";
import { Domain } from "./const";

const originalFetch = window.fetch;

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

window.fetch = async function (url, options = {}) {
  // Ensure headers object exists
  options.headers = options.headers || {};

  // Get current access token
  const token = Cookies.get("token");

  // Skip adding auth header for login, signup, refresh, etc.
  const isAuthRequest =
    typeof url === "string" &&
    (url.includes("/users/login") ||
      url.includes("/users/signup") ||
      url.includes("/users/refresh-token") ||
      url.includes("/users/verify-email") ||
      url.includes("/users/forgot-password") ||
      url.includes("/users/reset-password"));

  if (token && !isAuthRequest) {
    if (options.headers instanceof Headers) {
      options.headers.set("Authorization", `Bearer ${token}`);
    } else if (Array.isArray(options.headers)) {
      const hasAuth = options.headers.some(
        ([key]) => key.toLowerCase() === "authorization"
      );
      if (!hasAuth) {
        options.headers.push(["Authorization", `Bearer ${token}`]);
      }
    } else {
      const hasAuth = Object.keys(options.headers).some(
        (key) => key.toLowerCase() === "authorization"
      );
      if (!hasAuth) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  try {
    const response = await originalFetch(url, options);

    // If 401 Unauthorized, try to refresh token
    if (response.status === 401 && !isAuthRequest) {
      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        handleLogout();
        return response;
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await originalFetch(`${Domain}/users/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccessToken = refreshData?.data?.accessToken;
            const newRefreshToken = refreshData?.data?.refreshToken;

            if (newAccessToken && newRefreshToken) {
              Cookies.set("token", newAccessToken);
              Cookies.set("refreshToken", newRefreshToken);

              isRefreshing = false;
              onRefreshed(newAccessToken);
            } else {
              throw new Error("Token refresh response missing tokens");
            }
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (err) {
          isRefreshing = false;
          handleLogout();
          return response;
        }
      }

      // Retry request after token refreshed
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          if (options.headers instanceof Headers) {
            options.headers.set("Authorization", `Bearer ${newToken}`);
          } else if (Array.isArray(options.headers)) {
            options.headers = options.headers.map(([key, val]) =>
              key.toLowerCase() === "authorization" ? [key, `Bearer ${newToken}`] : [key, val]
            );
          } else {
            options.headers["Authorization"] = `Bearer ${newToken}`;
          }
          resolve(originalFetch(url, options));
        });
      });
    }

    return response;
  } catch (error) {
    throw error;
  }
};

function handleLogout() {
  Cookies.remove("token", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  Cookies.remove("userId", { path: "/" });
  if (
    !window.location.pathname.includes("/login") &&
    !window.location.pathname.includes("/signup")
  ) {
    window.location.href = "/login";
  }
}
