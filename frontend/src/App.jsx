import {
  Navigate,
  Route,
  Routes,
  useLocation,
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
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";

import {
  useAuth,
} from "./context/AuthContext";

import CommunityGuidelines from "./pages/CommunityGuidelines";
import SafetyCentre from "./pages/SafetyCentre";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";

// ============================================================
// PROTECTED ROUTE
// ============================================================

function Protected({
  children,
}) {

  const {
    user,
    loading,
  } = useAuth();


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


// ============================================================
// VERIFIED USERS ONLY
// ============================================================

function VerifiedOnly({
  children,
}) {

  const {
    user,
    loading,
  } = useAuth();


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


// ============================================================
// APP
// ============================================================

export default function App() {

  const {
    user,
  } = useAuth();


  const location =
    useLocation();


  // ==========================================================
  // VERIFIED STATUS
  // ==========================================================

  const verified =
    user?.profile?.is_verified === true &&
    user?.profile?.verification_status ===
      "approved";


  // ==========================================================
  // HIDE MESSAGING ON PUBLIC PAGES
  //
  // Messaging will NOT appear on:
  // - Landing Page
  // - Login
  // - Register
  // - Careers
  // - Contact Us
  // ==========================================================

  const hideMessaging = [
    "/",
    "/login",
    "/register",
    "/careers",
    "/contact",
    "/community-guidelines",
    "/safety",
    "/privacy",
    "/terms",
  ].includes(
    location.pathname
  );


  return (
    <>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />


      {/* =====================================================
          ROUTES
      ===================================================== */}

      <Routes>


       {/* ===================================================
    PUBLIC PAGES
=================================================== */}

<Route
  path="/"
  element={<LandingPage />}
/>

<Route
  path="/careers"
  element={<Careers />}
/>

<Route
  path="/contact"
  element={<Contact />}
/>

<Route
  path="/community-guidelines"
  element={<CommunityGuidelines />}
/>

<Route
  path="/safety"
  element={<SafetyCentre />}
/>

<Route
  path="/privacy"
  element={<PrivacyPolicy />}
/>

<Route
  path="/terms"
  element={<TermsOfUse />}
/>

<Route
  path="/login"
  element={<Login />}
/>

<Route
  path="/register"
  element={<Register />}
/>


        {/* ===================================================
            DASHBOARD
        =================================================== */}

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />


        {/* ===================================================
            AI KITCHEN
        =================================================== */}

        <Route
          path="/ai-kitchen"
          element={
            <Protected>
              <AIKitchen />
            </Protected>
          }
        />


        {/* ===================================================
            VERIFICATION
        =================================================== */}

        <Route
          path="/verification-required"
          element={
            <Protected>
              <VerificationRequired />
            </Protected>
          }
        />


        {/* ===================================================
            COMMUNIQ

            Login required.
            Government ID verification NOT required.
        =================================================== */}

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


        {/* ===================================================
            CONNECT

            Government ID verification required.
        =================================================== */}

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


        {/* ===================================================
            FOOD
        =================================================== */}

        <Route
          path="/food"
          element={
            <Protected>
              <FoodListings />
            </Protected>
          }
        />


        {/* ===================================================
            PROFILE
        =================================================== */}

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />


        {/* ===================================================
            FALLBACK
        =================================================== */}

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


      {/* =====================================================
          PRIVATE MESSAGING

          Messaging appears ONLY when:

          1. User is verified
          2. Page is NOT:
             /
             /login
             /register
             /careers
             /contact
      ===================================================== */}

      {
        verified &&
        !hideMessaging &&
        (
          <MessagingDock />
        )
      }

    </>
  );
}