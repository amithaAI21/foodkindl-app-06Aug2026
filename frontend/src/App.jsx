import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import MessagingDock from "./components/MessagingDock";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import FoodListings from "./pages/FoodListings";
import Connect from "./pages/Connect";
import MemberProfile from "./pages/MemberProfile";
import Profile from "./pages/Profile";
import VerificationRequired from "./pages/VerificationRequired";
import AIKitchen from "./pages/AIKitchen";
import { useAuth } from "./context/AuthContext";


function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="app-page">
        Loading FoodKindl...
      </main>
    );
  }

  return user
    ? children
    : (
      <Navigate
        to="/login"
        replace
      />
    );
}


function VerifiedOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="app-page">
        Checking verification...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const approved =
    user?.profile?.is_verified === true &&
    user?.profile?.verification_status ===
      "approved";

  return approved
    ? children
    : (
      <Navigate
        to="/verification-required"
        replace
      />
    );
}


export default function App() {
  const { user } = useAuth();

  const verified =
    user?.profile?.is_verified === true &&
    user?.profile?.verification_status ===
      "approved";

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
        path="/ai-kitchen"
        element={
          <Protected>
            <AIKitchen />
          </Protected>
        }
      />

        <Route
          path="/verification-required"
          element={
            <Protected>
              <VerificationRequired />
            </Protected>
          }
        />

        {/* ---------------------------------
            COMMUNIQ — LOGIN ONLY
            NO GOVERNMENT ID VERIFICATION
        ---------------------------------- */}

        <Route
          path="/community"
          element={
            <Protected>
              <Community />
            </Protected>
          }
        />

        <Route
          path="/community/post/:postId"
          element={
            <Protected>
              <CommunityPostDetail />
            </Protected>
          }
        />

        {/* ---------------------------------
            CONNECT — ID VERIFICATION REQUIRED
        ---------------------------------- */}

        <Route
          path="/connect"
          element={
            <VerifiedOnly>
              <Connect />
            </VerifiedOnly>
          }
        />

        <Route
          path="/connect/member/:memberId"
          element={
            <VerifiedOnly>
              <MemberProfile />
            </VerifiedOnly>
          }
        />

        <Route
          path="/food"
          element={
            <Protected>
              <FoodListings />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>

      {/* Private messaging remains verified-only */}
      {verified && <MessagingDock />}
    </>
  );
}