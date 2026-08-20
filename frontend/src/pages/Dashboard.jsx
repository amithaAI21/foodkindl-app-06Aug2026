import {
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


export default function Dashboard() {

  const {
    user,
    refreshUser,
  } = useAuth();


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    refreshError,
    setRefreshError,
  ] = useState("");


  const profile =
    user?.profile || {};


  const API_BASE = (
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000"
  ).replace(
    /\/+$/,
    ""
  );


  // =========================================================
  // PROFILE IMAGE URL
  // =========================================================

  function getProfileImageUrl(
    imagePath
  ) {

    if (!imagePath) {
      return null;
    }


    if (
      imagePath.startsWith(
        "http://"
      ) ||
      imagePath.startsWith(
        "https://"
      ) ||
      imagePath.startsWith(
        "blob:"
      )
    ) {

      return imagePath;

    }


    if (
      imagePath.startsWith(
        "/.netlify/"
      )
    ) {

      return (
        `${window.location.origin}${imagePath}`
      );

    }


    return (
      `${API_BASE}${imagePath}`
    );
  }


  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const profileImage =
    getProfileImageUrl(
      profile.profile_image_1_url ||
      profile.profile_image_1
    );


  // =========================================================
  // DISPLAY NAME
  // =========================================================

  const displayName =
    user?.first_name ||
    user?.full_name ||
    user?.email ||
    "FoodKindl Member";


  // =========================================================
  // VERIFICATION
  // =========================================================

  const verificationStatus =
    profile.verification_status ||
    "not_submitted";


  const isVerified =
    profile.is_verified === true &&
    verificationStatus ===
      "approved";


  // =========================================================
  // REFRESH USER
  // =========================================================

  async function handleRefresh() {

    if (
      typeof refreshUser !==
      "function"
    ) {

      setRefreshError(
        "Account refresh is not available."
      );

      return;
    }


    try {

      setRefreshing(true);

      setRefreshError("");


      await refreshUser();

    } catch (error) {

      console.error(
        "Unable to refresh account:",
        error.response?.data ||
        error
      );


      setRefreshError(
        "Unable to refresh your account status. Please try again."
      );

    } finally {

      setRefreshing(false);

    }
  }


  // =========================================================
  // SYNC VERIFICATION WHEN DASHBOARD OPENS
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    async function syncUser() {

      if (
        typeof refreshUser !==
        "function"
      ) {
        return;
      }


      try {

        await refreshUser();

      } catch (error) {

        if (!cancelled) {

          console.error(
            "Unable to sync account:",
            error.response?.data ||
            error
          );

        }

      }

    }


    syncUser();


    return () => {
      cancelled = true;
    };

  }, [
    refreshUser,
  ]);


  // =========================================================
  // VERIFICATION MESSAGE
  // =========================================================

  function getVerificationMessage() {

    if (
      verificationStatus ===
      "pending"
    ) {

      return (
        "Government ID approval is pending. " +
        "Circles and private messaging will unlock after approval."
      );

    }


    if (
      verificationStatus ===
      "rejected"
    ) {

      return (
        "Government ID was rejected. " +
        "Please upload a new document to use Circles and private messaging."
      );

    }


    return (
      "Government ID verification is required " +
      "for Circles and private messaging."
    );
  }


  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  const cards = [

    // --------------------------------------------------------
    // COMMUNIQ
    //
    // Login only.
    // ID verification NOT required.
    // --------------------------------------------------------

    {
      icon:
        <MessageSquare />,

      title:
        "CommuniQ",

      text:
        (
          "Share food stories, photos, videos, " +
          "articles, comments, reactions, saves and reposts."
        ),

      path:
        "/community",

      locked:
        false,
    },


    // --------------------------------------------------------
    // CIRCLES
    //
    // Verification required.
    // --------------------------------------------------------

    {
      icon:
        <UsersRound />,

      title:
        "Circles",

      text:
        isVerified
          ? (
              "Discover members, send connection requests, " +
              "manage connections, and view profiles."
            )
          : getVerificationMessage(),

      path:
        isVerified
          ? "/connect"
          : "/verification-required",

      locked:
        !isVerified,
    },

  ];


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="app-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-welcome">

          <div className="eyebrow left">
            FoodKindl Connect
          </div>


          <div className="dashboard-title-row">

            <h1>
              Welcome, {displayName}
            </h1>


            <button
              type="button"

              className="dashboard-refresh-button"

              onClick={
                handleRefresh
              }

              disabled={
                refreshing
              }

              title="Check latest account status"
            >

              <RefreshCw
                size={18}

                className={
                  refreshing
                    ? "refresh-spin"
                    : ""
                }
              />


              <span>
                {
                  refreshing
                    ? "Checking..."
                    : "Refresh"
                }
              </span>

            </button>

          </div>


          <p>
            What would you like to do today?
          </p>


          {refreshError && (

            <p className="error-message">
              {refreshError}
            </p>

          )}


          {/* ===============================================
              VERIFIED
          =============================================== */}

          {isVerified && (

            <div className="dashboard-verification-approved">

              <span>
                ✓
              </span>


              <div>

                <strong>
                  Identity verified
                </strong>


                <small>
                  Circles and verified-member features are available.
                </small>

              </div>

            </div>

          )}


          {/* ===============================================
              NOT VERIFIED
          =============================================== */}

          {!isVerified && (

            <Link
              to="/verification-required"

              className={
                `dashboard-verification-banner ${
                  verificationStatus
                }`
              }
            >

              <LockKeyhole
                size={20}
              />


              <div>

                <strong>

                  {
                    verificationStatus ===
                    "pending"
                      ? "Verification pending"

                      : verificationStatus ===
                          "rejected"
                        ? "Verification rejected"

                        : "Identity verification required"
                  }

                </strong>


                <span>
                  {getVerificationMessage()}
                </span>

              </div>

            </Link>

          )}

        </div>


        {/* ===================================================
            PROFILE
        =================================================== */}

        <Link
          to="/profile"

          className="dashboard-profile-identity"

          aria-label="Open my FoodKindl profile"
        >

          <div className="dashboard-profile-photo-wrap">

            {profileImage ? (

              <img
                src={
                  profileImage
                }

                alt={
                  `${displayName}'s profile`
                }

                className="dashboard-profile-image"

                onError={(event) => {

                  console.error(
                    "Dashboard profile image failed:",
                    profileImage
                  );


                  event.currentTarget
                    .style
                    .display =
                    "none";


                  event.currentTarget
                    .nextElementSibling
                    ?.classList.remove(
                      "hidden"
                    );

                }}
              />

            ) : null}


            <div
              className={
                `dashboard-profile-fallback ${
                  profileImage
                    ? "hidden"
                    : ""
                }`
              }
            >

              <UserRound
                size={44}
                strokeWidth={1.4}
              />

            </div>


            {isVerified && (

              <span
                className="dashboard-verified-dot"
                title="Verified profile"
              >
                ✓
              </span>

            )}

          </div>


          <div className="dashboard-profile-meta">

            <strong>
              {displayName}
            </strong>


            <span
              className={
                isVerified
                  ? "profile-status verified"
                  : "profile-status"
              }
            >

              {
                isVerified
                  ? "✓ Verified member"
                  : "Complete verification"
              }

            </span>


            {profile.city && (

              <small>
                {profile.city}
              </small>

            )}


            <span className="dashboard-view-profile">
              View Profile →
            </span>

          </div>

        </Link>

      </section>


      {/* =====================================================
          DASHBOARD CARDS
      ===================================================== */}

      <section className="dashboard-grid">

        {cards.map(
          (
            card
          ) => (

            <Link
              key={
                card.title
              }

              to={
                card.path
              }

              className={
                card.locked
                  ? "dashboard-card locked"
                  : "dashboard-card"
              }
            >

              <span className="icon-box">

                {
                  card.locked
                    ? (
                        <LockKeyhole />
                      )
                    : card.icon
                }

              </span>


              <h2>
                {card.title}
              </h2>


              <p>
                {card.text}
              </p>


              <span className="dashboard-card-action">

                {
                  card.locked
                    ? (
                        verificationStatus ===
                        "pending"
                          ? "Awaiting approval"

                          : verificationStatus ===
                              "rejected"
                            ? "Update verification"

                            : "Complete verification"
                      )

                    : `Explore ${card.title}`
                }

                {" "}→

              </span>


              {card.locked && (

                <span className="dashboard-lock-label">

                  <LockKeyhole
                    size={15}
                  />


                  {
                    verificationStatus ===
                    "pending"
                      ? "Awaiting admin approval"

                      : verificationStatus ===
                          "rejected"
                        ? "Upload another ID"

                        : "Verification required"
                  }

                </span>

              )}

            </Link>

          )
        )}

      </section>

    </main>
  );
}