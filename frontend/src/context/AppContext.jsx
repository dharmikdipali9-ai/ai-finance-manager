import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    // ✅ SINGLE SOURCE OF TRUTH (FIXED)
    const loadUser = async () => {
        try {
            const res = await API.get("/settings");
            setUser(res.data);
        } catch (err) {
            console.log("User load failed");
            setUser(null);
        }
    };

    const loadAlerts = async () => {
        try {
            const res = await API.get("/notifications/unread-count");
            setUnreadAlerts(res.data.count);
        } catch {
            console.log("Alert load failed");
        }
    };

    // 🚀 INITIAL LOAD (ONLY ONCE)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        loadUser();
        loadAlerts();
    }, []);

    // 🔥 SOCKET CONNECTION
    useEffect(() => {
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");

        if (!token || !user_id) return;

        const socket = io("https://ai-finance-manager-h6jl.onrender.com", {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            console.log("✅ Socket Connected");
            socket.emit("join", { user_id: String(user_id) });
        });

        socket.on("new_notification", (data) => {
            setUnreadAlerts((prev) => prev + 1);

            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => { });

            toast.info(data.message, { icon: "🔔" });
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
        });

        return () => socket.disconnect();
    }, []);

    // 🌙 THEME APPLY
    useEffect(() => {
        if (theme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [theme]);

    const markAlertsSeen = async () => {
        try {
            await API.put("/notifications/read");
            setUnreadAlerts(0);
        } catch {
            console.log("Mark read failed");
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                theme,
                toggleTheme,
                unreadAlerts,
                markAlertsSeen,
                loadUser,
                sidebarOpen,
                toggleSidebar
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);