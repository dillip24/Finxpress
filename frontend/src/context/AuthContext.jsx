import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";


const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await client.get("/api/users/me", { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);


  const login = async (credentials) => {
    console.log("Logging in with credentials:", credentials);
    
    const res = await client.post("/api/users/login", credentials, { withCredentials: true });
    setUser(res.data.data.user);
  };


  const logout = async () => {
    await client.post("/api/users/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}