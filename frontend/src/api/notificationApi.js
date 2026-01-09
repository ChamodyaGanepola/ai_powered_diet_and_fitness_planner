import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* ===== Get all notifications ===== */
export const getNotifications = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

/* ===== Get unread notifications count ===== */
export const getUnreadCount = async () => {
  const res = await axios.get(`${API_URL}/unread-count`, getAuthHeader());
  return res.data;
};

/* ===== Mark all notifications as read ===== */
export const markNotificationsRead = async () => {
  const res = await axios.post(`${API_URL}/mark-read`, {}, getAuthHeader());
  return res.data;
};

/* ===== Create a new notification ===== */
export const createNotification = async (user_id, message) => {
  const res = await axios.post(
    API_URL,
    { user_id, message },
    getAuthHeader()
  );
  return res.data;
};
