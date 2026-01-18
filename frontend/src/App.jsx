import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth.jsx";
import Home from "./pages/Home/Home.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import DietPlan from "./pages/DietPlan/DietPlan.jsx";
import Workouts from "./pages/Workouts/Workouts.jsx";
import DailyProgress from "./pages/DailyProgress/DailyProgress.jsx";
import ForgotPassword from "./component/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";
import { useAuth } from "./context/authContext.jsx";
import PageLayout from "./layouts/PageLayout.jsx";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/home" replace />
          ) : (
            <PageLayout hideNavLinks>
              <Auth />
            </PageLayout>
          )
        }
      />

      <Route
        path="/forgot-password"
        element={
          user ? (
            <Navigate to="/home" replace />
          ) : (
            <PageLayout hideNavLinks>
              <ForgotPassword />
            </PageLayout>
          )
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          user ? (
            <Navigate to="/home" replace />
          ) : (
            <PageLayout hideNavLinks>
              <ResetPassword />
            </PageLayout>
          )
        }
      />

      {/* PROTECTED PAGES */}
      <Route
        path="/home"
        element={
          user ? (
            <PageLayout>
              <Home />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          user ? (
            <PageLayout>
              <Profile />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* ADD OTHERS */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <PageLayout>
              <Dashboard />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/dietplan"
        element={
          user ? (
            <PageLayout>
              <DietPlan />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/workouts"
        element={
          user ? (
            <PageLayout>
              <Workouts />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/dailyprogress"
        element={
          user ? (
            <PageLayout>
              <DailyProgress />
            </PageLayout>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      
    </Routes>
  );
}

export default App;
