import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";
import { io } from "socket.io-client";
import { toast } from "react-toastify";


const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    // 🔥 PUT IT HERE
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            API.get("/settings")
                .then((res) => setUser(res.data))
                .catch(() => setUser(null));
        }
    }, []);

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    // 🔥 LOAD USER
    const loadUser = async () => {
        try {
            const res = await API.get("/settings");
            setUser(res.data);
        } catch {
            console.log("User load failed");
        }
    };

    // 🔥 LOAD INITIAL COUNT
    const loadAlerts = async () => {
        try {
            const res = await API.get("/notifications/unread-count");
            setUnreadAlerts(res.data.count);
        } catch {
            console.log("Alert load failed");
        }
    };

    // 🔥 SOCKET CONNECTION (MAIN FIX)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const user_id = localStorage.getItem("user_id");

        if (!token || !user_id) return;

        const socket = io("http://localhost:5000", {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            console.log("✅ Socket Connected");

            // 🔥 MUST MATCH BACKEND ROOM TYPE
            socket.emit("join", { user_id: String(user_id) });
        });

        // 🔥 REALTIME NOTIFICATION
        socket.on("new_notification", (data) => {
            console.log("🔔 Incoming:", data);

            // 🔴 UPDATE BADGE
            setUnreadAlerts((prev) => prev + 1);

            // 🔊 SOUND
            const audio = new Audio("/notification.mp3");
            audio.play().catch(() => { });

            // 🔥 TOAST
            toast.info(data.message, {
                icon: "🔔",
            });
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

    // 🚀 INITIAL LOAD
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        loadUser();
        loadAlerts();
    }, []);

    // 🔔 MARK AS READ
    const markAlertsSeen = async () => {
        try {
            await API.put("/notifications/read");
            setUnreadAlerts(0); // 🔥 reset badge
        } catch {
            console.log("Mark read failed");
        }
    };

    // 🌙 TOGGLE THEME
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
                sidebarOpen,     // ✅ THIS WAS MISSING
                toggleSidebar
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);