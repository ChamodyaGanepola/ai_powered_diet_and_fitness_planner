import Header from "../../component/Header.jsx";
import "./Home.css";
import { useAuth } from "../../context/authContext.jsx";

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <div className="home-container">
        <h1 className="home-title">Welcome {user?.username}</h1>
      </div>
    </>
  );
};

export default Home;
