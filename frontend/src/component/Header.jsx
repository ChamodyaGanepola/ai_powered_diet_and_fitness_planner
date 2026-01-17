import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { io } from "socket.io-client";
import "./Header.css";
import {
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
} from "../api/notificationApi.js";

const Header = ({ disableLinks }) => {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const socketRef = useRef(null);

  // Handle window resize to update isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- SOCKET.IO ---
  useEffect(() => {
    if (!user?.id) return;

    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", user.id);
    });

    socket.on(`notification-${user.id}`, (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setAnimateBadge(true);
      setTimeout(() => setAnimateBadge(false), 300);
    });

    return () => socket.disconnect();
  }, [user?.id]);

  // Fetch initial unread count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.count || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
  }, []);

  const toggleNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      try {
        const data = await getNotifications();
        setNotifications(data || []);
        await markNotificationsRead();
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
        setNotifications([]);
      }
    }
  };

  const handleLogout = () => {
    logOut();
    navigate("/");
    setOpen(false);
  };

  // Close dropdown if click outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !isMobile &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);
  const handleNav = (path) => {
    if (disableLinks) return;
    navigate(path);
  };

  return (
    <>
      <header className={`header ${disableLinks ? "disabled" : ""}`}>
        <div className="logo" onClick={() => handleNav("/")}>
          HealthPilot
        </div>

        <nav className="nav-links">
          <span onClick={() => handleNav("/home")}>Home</span>
          <span onClick={() => handleNav("/dashboard")}>Dashboard</span>
          <span onClick={() => handleNav("/dietplan")}>Diet Plan</span>
          <span onClick={() => handleNav("/workouts")}>Workouts</span>
          <span onClick={() => handleNav("/dailyprogress")}>Progress</span>

          <div className="icon-group">
            {/* Notifications */}
            <div
              ref={notifRef}
              className="icon-item"
              data-label="Notifications"
              onClick={() => (disableLinks ? null : toggleNotifications())}
            >
              <FiBell />
              {unreadCount > 0 && (
                <span
                  className={`notification-badge ${animateBadge ? "pop" : ""}`}
                >
                  {unreadCount}
                </span>
              )}

              {/* Desktop Dropdown */}
              {!isMobile && notifOpen && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <p className="notification-title">Notifications</p>
                    <span
                      className="notif-close"
                      onClick={() => setNotifOpen(false)}
                    >
                      ✕
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-item empty">
                      No notifications
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map((n) => {
                        const time = new Date(n.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit", hour12: true },
                        );
                        return (
                          <div
                            key={n._id}
                            className={`notification-item ${n.isRead ? "read" : "unread"}`}
                          >
                            <span className="notif-message">{n.message}</span>
                            <span className="notif-time">{time}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div
              className="icon-item"
              data-label="Profile"
              onClick={() => (disableLinks ? null : navigate("/profile"))}
            >
              <FiUser />
            </div>
            {/* Logout */}
            <div
              className="icon-item"
              data-label="Logout"
              onClick={() => (disableLinks ? null : handleLogout())}
            >
              <FiLogOut />
            </div>
          </div>
        </nav>

        <div
          className="menu-icon"
          onClick={() => (disableLinks ? null : setOpen(true))}
        >
          ☰
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`side-navbar ${open ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setOpen(false)}>
          ✕
        </div>
        <span
          onClick={() => {
            navigate("/home");
            setOpen(false);
          }}
        >
          Home
        </span>
        <span
          onClick={() => {
            navigate("/dashboard");
            setOpen(false);
          }}
        >
          Dashboard
        </span>
        <span
          onClick={() => {
            navigate("/dietplan");
            setOpen(false);
          }}
        >
          Diet Plan
        </span>
        <span
          onClick={() => {
            navigate("/workouts");
            setOpen(false);
          }}
        >
          Workouts
        </span>
        <span
          onClick={() => {
            navigate("/dailyprogress");
            setOpen(false);
          }}
        >
          Progress
        </span>
        {/* Trigger Mobile Notifications */}
        <span
          onClick={() => {
            setNotifOpen(true);
            setOpen(false);
          }}
        >
          Notifications
        </span>
        <span
          onClick={() => {
            navigate("/profile");
            setOpen(false);
          }}
        >
          Profile
        </span>
        <span onClick={handleLogout}>Logout</span>
      </div>

      {/* Mobile Notifications Panel */}
      {isMobile && notifOpen && (
        <div className="mobile-notif-panel">
          <div className="notif-header">
            <p className="notification-title">Notifications</p>
            <span className="notif-close" onClick={() => setNotifOpen(false)}>
              ✕
            </span>
          </div>
          {notifications.length === 0 ? (
            <div className="notification-item empty">No notifications</div>
          ) : (
            <div className="notification-list">
              {notifications.map((n) => {
                const time = new Date(n.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <div
                    key={n._id}
                    className={`notification-item ${n.isRead ? "read" : "unread"}`}
                  >
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">{time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </>
  );
};

export default Header;
