import { createContext, useEffect, useState } from "react";
import getUser from "../Helpers/getUser";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message, options = {}) => {
    const id = Math.random().toString(36).slice(2);
    const durationMs = options.durationMs ?? 3500;

    setToasts((prev) => [
      ...prev,
      { id, message }
    ]);

    window.setTimeout(() => removeToast(id), durationMs);
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, showToast }}>
      {children}
      {/* Toast overlay */}
      <div style={{ position: "fixed", top: 16, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 9999 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {toasts.map((t) => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <div style={{
                background: "#FFF8D6",
                color: "#7A5B00",
                border: "1px solid #F7E2A1",
                boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                borderRadius: 12,
                padding: "10px 14px",
                minWidth: 280,
                maxWidth: 520,
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <span style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#F2C200"
                }} />
                <div style={{ fontWeight: 600 }}>{t.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserContext.Provider>
  );
};
