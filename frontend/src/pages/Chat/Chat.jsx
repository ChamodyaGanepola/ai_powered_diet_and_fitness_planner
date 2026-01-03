import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

const Chat = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();              // remove token & user
    navigate("/auth");    // go to auth page
  };

  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Chat;
