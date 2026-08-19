import {
  LockKeyhole,
  MessageSquare,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Dashboard() {
  const { user } = useAuth();

  const profile =
    user?.profile || {};


  const API_BASE = (
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");


  // =========================================================
  // PROFILE IMAGE URL
  //
  // Supports:
  // 1. Netlify Blob absolute URLs
  // 2. Netlify function relative URLs
  // 3. Old Django media URLs
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
  // NETLIFY BLOB FIRST
  // OLD DJANGO IMAGE SECOND
  // =========================================================

  const profileImage =
    getProfileImageUrl(
      profile.profile_image_1_url ||
      profile.profile_image_1
    );


  const displayName =
    user?.first_name ||
    user?.full_name ||
    user?.email ||
    "FoodKindl Member";


  const isVerified =
    profile.is_verified === true &&
    profile.verification_status ===
      "approved";


  const verificationStatus =
    profile.verification_status ||
    "not_submitted";


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
        "Connect and private messaging will unlock after approval."
      );
    }


    if (
      verificationStatus ===
      "rejected"
    ) {
      return (
        "Government ID was rejected. " +
        "Please upload a new document to use Connect and private messaging."
      );
    }


    return (
      "Government ID verification is required " +
      "for Connect and private messaging."
    );
  }


  // =========================================================
  // REFRESH DASHBOARD
  // =========================================================

  function handleRefresh() {
    window.location.reload();
  }


  // =========================================================
  // DASHBOARD CARDS
  // =========================================================

  const cards = [
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


    {
      icon:
        <UsersRound />,

      title:
        "Connect",

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


    {
      icon:
        <UserRound />,

      title:
        "Profile",

      text:
        (
          "Update your city, preferences, profile photos, " +
          "Government ID, and safety controls."
        ),

      path:
        "/profile",

      locked:
        false,
    },
  ];


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="app-page">

      <section className="dashboard-hero">

        <div className="dashboard-welcome">

          <div className="eyebrow left">
            FoodKindl Connect
          </div>


          {/* =================================================
              TITLE + REFRESH
          ================================================= */}

          <div className="dashboard-title-row">

            <h1>
              Welcome, {displayName}
            </h1>


            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={handleRefresh}
              title="Refresh dashboard"
            >

              <RefreshCw
                size={18}
              />

              <span>
                Refresh
              </span>

            </button>

          </div>


          <p>
            What would you like to do
            today?
          </p>


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
                      ? (
                          "Verification pending"
                        )

                      : verificationStatus ===
                          "rejected"
                        ? (
                            "Verification rejected"
                          )

                        : (
                            "Identity verification required"
                          )
                  }
                </strong>


                <span>
                  {
                    getVerificationMessage()
                  }
                </span>

              </div>

            </Link>
          )}

        </div>


        {/* ===================================================
            PROFILE PHOTO

            Netlify:
            profile_image_1_url

            Legacy Django:
            profile_image_1
        =================================================== */}

        <div className="dashboard-profile-visual">

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
                  "Dashboard profile image failed to load:",
                  profileImage
                );


                event.currentTarget.style.display =
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
              `dashboard-profile-placeholder ${
                profileImage
                  ? "hidden"
                  : ""
              }`
            }
          >

            <UserRound
              size={72}
              strokeWidth={1.4}
            />


            <span>
              No profile photo uploaded
            </span>


            <Link
              to="/profile"
              className="primary-button"
            >
              Add Profile Photo
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          DASHBOARD CARDS
      ===================================================== */}

      <section className="dashboard-grid">

        {cards.map(
          (card) => (

            <Link
              key={
                card.title
              }

              to={
                card.path
              }

              className={
                card.locked
                  ? (
                      "dashboard-card locked"
                    )
                  : (
                      "dashboard-card"
                    )
              }
            >

              <span className="icon-box">

                {
                  card.locked
                    ? (
                        <LockKeyhole />
                      )
                    : (
                        card.icon
                      )
                }

              </span>


              <h2>
                {card.title}
              </h2>


              <p>
                {card.text}
              </p>


              {card.locked && (

                <span className="dashboard-lock-label">

                  <LockKeyhole
                    size={15}
                  />


                  {
                    verificationStatus ===
                    "pending"
                      ? (
                          "Awaiting admin approval"
                        )

                      : verificationStatus ===
                          "rejected"
                        ? (
                            "Upload another ID"
                          )

                        : (
                            "Verification required"
                          )
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