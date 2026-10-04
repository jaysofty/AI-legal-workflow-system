import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { AuthContext } from "./AuthContext.jsx";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("legalflow_token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        // console.log("AUTH ME RESPONSE:", response);

        const authenticatedUser =
          response.data?.user ?? response.user ?? response.data ?? null;

        // console.log("AUTHENTICATED USER:", authenticatedUser);

        setUser(authenticatedUser);
      } catch {
        localStorage.removeItem("legalflow_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const accessToken =
      response.data?.accessToken ??
      response.data?.token ??
      response.accessToken ??
      response.token;

    if (!accessToken) {
      throw new Error(
        "Login succeeded but no authentication token was returned.",
      );
    }

    localStorage.setItem("legalflow_token", accessToken);

    const authenticatedUser = response.data?.user ?? response.user ?? null;

    if (authenticatedUser) {
      setUser(authenticatedUser);
    } else {
      const meResponse = await api.get("/auth/me");

      setUser(meResponse.data?.user ?? meResponse.user ?? null);
    }

    return response;
  }

  function logout() {
    localStorage.removeItem("legalflow_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
   [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
