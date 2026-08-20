import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Ban,
  Building2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Utensils,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/AuthContext";


export default function MemberProfile() {

  const {
    memberId,
  } = useParams();


  const {
    user,
  } = useAuth();


  const [
    member,
    setMember,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    messaging,
    setMessaging,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // BLOCKING
  // =========================================================

  const [
    blockedByMe,
    setBlockedByMe,
  ] = useState(false);


  const [
    interactionBlocked,
    setInteractionBlocked,
  ] = useState(false);


  const [
    blockLoading,
    setBlockLoading,
  ] = useState(false);


  const [
    blockStatusLoading,
    setBlockStatusLoading,
  ] = useState(true);


  const API_BASE = (
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000"
  ).replace(
    /\/+$/,
    ""
  );


  // =========================================================
  // MEDIA URL
  // =========================================================

  function getMediaUrl(
    path
  ) {

    if (!path) {
      return "";
    }


    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("blob:")
    ) {

      return path;

    }


    if (
      path.startsWith(
        "/.netlify/"
      )
    ) {

      return (
        `${window.location.origin}${path}`
      );

    }


    return (
      `${API_BASE}${path}`
    );
  }


  // =========================================================
  // MEMBER NAME
  // =========================================================

  function getMemberName(
    currentMember
  ) {

    return (
      currentMember?.full_name ||

      [
        currentMember?.first_name,
        currentMember?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||

      currentMember?.email ||

      "FoodKindl Member"
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  function getErrorMessage(
    data
  ) {

    if (!data) {
      return "The request could not be completed.";
    }


    if (
      typeof data ===
      "string"
    ) {

      return data;

    }


    return (
      data?.user_id?.[0] ||
      data?.detail ||
      "The request could not be completed."
    );
  }


  // =========================================================
  // LOAD MEMBER
  // =========================================================

  useEffect(() => {

    async function loadMember() {

      setLoading(true);

      setError("");


      try {

        const response =
          await api.get(
            `/members/${memberId}/`
          );


        setMember(
          response.data
        );

      } catch (
        requestError
      ) {

        console.error(
          "Unable to load member profile:",
          requestError.response?.status,
          requestError.response?.data ||
            requestError
        );


        if (
          requestError
            .response
            ?.status === 404
        ) {

          setError(
            "This member was not found."
          );

        } else {

          setError(
            requestError
              .response
              ?.data
              ?.detail ||
            "Member profile could not be loaded."
          );

        }

      } finally {

        setLoading(false);

      }

    }


    if (memberId) {
      loadMember();
    }

  }, [memberId]);


  // =========================================================
  // LOAD BLOCK STATUS
  // =========================================================

  useEffect(() => {

    async function loadBlockStatus() {

      if (!memberId) {
        return;
      }


      if (
        String(memberId) ===
        String(user?.id)
      ) {

        setBlockedByMe(false);

        setInteractionBlocked(false);

        setBlockStatusLoading(false);

        return;

      }


      try {

        setBlockStatusLoading(true);


        const response =
          await api.get(
            `/auth/block-status/${memberId}/`
          );


        setBlockedByMe(
          response.data
            ?.blocked_by_me === true
        );


        setInteractionBlocked(
          response.data
            ?.interaction_blocked === true
        );

      } catch (
        requestError
      ) {

        console.error(
          "Unable to load block status:",
          requestError.response?.data ||
            requestError
        );

      } finally {

        setBlockStatusLoading(false);

      }

    }


    loadBlockStatus();

  }, [
    memberId,
    user?.id,
  ]);


  // =========================================================
  // BLOCK MEMBER
  // =========================================================

  async function blockMember() {

    if (!member?.id) {
      return;
    }


    if (
      member.id ===
      user?.id
    ) {

      return;
    }


    const confirmed =
      window.confirm(
        `Block ${getMemberName(member)}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setBlockLoading(true);

      setError("");


      await api.post(
        `/auth/block/${member.id}/`
      );


      setBlockedByMe(true);

      setInteractionBlocked(true);

    } catch (
      requestError
    ) {

      console.error(
        "Unable to block member:",
        requestError.response?.data ||
          requestError
      );


      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );

    } finally {

      setBlockLoading(false);

    }
  }


  // =========================================================
  // UNBLOCK MEMBER
  // =========================================================

  async function unblockMember() {

    if (!member?.id) {
      return;
    }


    try {

      setBlockLoading(true);

      setError("");


      await api.post(
        `/auth/unblock/${member.id}/`
      );


      setBlockedByMe(false);


      const response =
        await api.get(
          `/auth/block-status/${member.id}/`
        );


      setInteractionBlocked(
        response.data
          ?.interaction_blocked === true
      );

    } catch (
      requestError
    ) {

      console.error(
        "Unable to unblock member:",
        requestError.response?.data ||
          requestError
      );


      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );

    } finally {

      setBlockLoading(false);

    }
  }


  // =========================================================
  // MESSAGE MEMBER
  // =========================================================

  async function messageMember() {

    if (!member?.id) {
      return;
    }


    if (
      member.id ===
      user?.id
    ) {

      setError(
        "You cannot message yourself."
      );

      return;
    }


    if (
      interactionBlocked
    ) {

      setError(
        "This interaction is not available."
      );

      return;
    }


    setMessaging(true);

    setError("");


    try {

      const response =
        await api.post(
          "/conversations/",
          {
            user_id:
              member.id,
          }
        );


      const conversation =
        response.data;


      window.dispatchEvent(
        new CustomEvent(
          "foodkindl:open-conversation",
          {
            detail: {
              conversation,
              member,
            },
          }
        )
      );

    } catch (
      requestError
    ) {

      console.error(
        "Unable to start conversation:",
        requestError.response?.status,
        requestError.response?.data ||
          requestError
      );


      setError(
        getErrorMessage(
          requestError
            .response
            ?.data
        )
      );

    } finally {

      setMessaging(false);

    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <main className="app-page">

        <div className="app-panel">
          Loading member profile...
        </div>

      </main>
    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (
    error &&
    !member
  ) {

    return (
      <main className="app-page">

        <p className="error-message">
          {error}
        </p>


        <Link
          to="/connect"
          className="secondary-button"
        >

          <ArrowLeft size={18} />

          Back to Connect

        </Link>

      </main>
    );

  }


  if (!member) {
    return null;
  }


  // =========================================================
  // PROFILE DATA
  // =========================================================

  const profile =
    member.profile || {};


  const profileImage =
    getMediaUrl(
      profile.profile_image_1_url ||
      profile.profile_image_1
    );


  const additionalImages = [

    profile.profile_image_2_url ||
      profile.profile_image_2,

    profile.profile_image_3_url ||
      profile.profile_image_3,

  ]
    .filter(Boolean)
    .map(
      getMediaUrl
    );


  const location = [
    profile.locality,
    profile.city,
  ]
    .filter(Boolean)
    .join(", ");


  const isOwnProfile =
    member.id === user?.id;


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="member-profile-page">

      <div className="member-profile-container">

        <Link
          to="/connect"
          className="community-back-link"
        >
          <ArrowLeft size={18} />

          Back to Connect
        </Link>


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="member-profile-hero">

          <div className="member-profile-photo-wrapper">

            {profileImage ? (

              <a
                href={profileImage}
                target="_blank"
                rel="noreferrer"
              >

                <img
                  src={profileImage}
                  alt={
                    getMemberName(
                      member
                    )
                  }
                  className="member-profile-main-photo"
                />

              </a>

            ) : (

              <div className="member-profile-main-placeholder">

                <UserRound
                  size={70}
                />

              </div>

            )}

          </div>


          <div className="member-profile-heading">

            <div className="eyebrow left">
              FoodKindl Member
            </div>


            <h1>
              {getMemberName(member)}
            </h1>


            {profile.role && (

              <p className="member-profile-role">
                {profile.role}
              </p>

            )}


            <div className="member-profile-actions">

              {
                member.connection_status ===
                "connected" &&
                (

                  <span className="connected-badge">

                    <ShieldCheck
                      size={18}
                    />

                    Connected

                  </span>

                )
              }


              {!isOwnProfile && (

                <>
                  <button
                    type="button"
                    className="primary-button"

                    onClick={
                      messageMember
                    }

                    disabled={
                      messaging ||
                      interactionBlocked ||
                      blockStatusLoading
                    }
                  >

                    <MessageCircle
                      size={19}
                    />


                    {
                      messaging
                        ? "Opening chat..."

                        : interactionBlocked
                          ? "Interaction unavailable"

                          : "Message"
                    }

                  </button>


                  {
                    blockedByMe
                      ? (

                          <button
                            type="button"
                            className="member-unblock-button"

                            onClick={
                              unblockMember
                            }

                            disabled={
                              blockLoading
                            }
                          >

                            <Ban size={18} />

                            {
                              blockLoading
                                ? "Unblocking..."
                                : "Unblock"
                            }

                          </button>

                        )
                      : (

                          <button
                            type="button"
                            className="member-block-button"

                            onClick={
                              blockMember
                            }

                            disabled={
                              blockLoading
                            }
                          >

                            <Ban size={18} />

                            {
                              blockLoading
                                ? "Blocking..."
                                : "Block Member"
                            }

                          </button>

                        )
                  }

                </>

              )}

            </div>


            {
              interactionBlocked &&
              !blockedByMe &&
              (

                <p className="member-interaction-notice">
                  This interaction is currently unavailable.
                </p>

              )
            }


            {error && (

              <p className="error-message">
                {error}
              </p>

            )}

          </div>

        </section>


        {/* ===================================================
            DETAILS
        =================================================== */}

        <section className="member-profile-details-grid">

          <article className="member-profile-detail-card">

            <MapPin size={22} />


            <div>

              <small>
                Location
              </small>


              <strong>
                {
                  location ||
                  "Not provided"
                }
              </strong>


              {profile.postcode && (

                <span>
                  Postcode:{" "}
                  {profile.postcode}
                </span>

              )}

            </div>

          </article>


          <article className="member-profile-detail-card">

            <Building2 size={22} />


            <div>

              <small>
                College or workplace
              </small>


              <strong>
                {
                  profile.college_workplace ||
                  "Not provided"
                }
              </strong>

            </div>

          </article>


          <article className="member-profile-detail-card">

            <Utensils size={22} />


            <div>

              <small>
                Food preference
              </small>


              <strong>

                {
                  profile.dietary_preference &&
                  profile.dietary_preference !==
                    "none"

                    ? profile
                        .dietary_preference
                        .replaceAll(
                          "_",
                          " "
                        )

                    : "No preference"
                }

              </strong>

            </div>

          </article>

        </section>


        {/* ===================================================
            ABOUT
        =================================================== */}

        <section className="member-profile-content-grid">

          <article className="app-panel member-profile-about">

            <div className="eyebrow left">
              About
            </div>


            <h2>
              About{" "}
              {
                member.first_name ||
                "this member"
              }
            </h2>


            <p>
              {
                profile.bio ||
                "This member has not added a bio yet."
              }
            </p>


            {profile.interests && (
              <>

                <h3>
                  Food interests
                </h3>

                <p>
                  {profile.interests}
                </p>

              </>
            )}

          </article>


          {
            additionalImages.length > 0 &&
            (

              <article className="app-panel">

                <div className="eyebrow left">
                  More photos
                </div>


                <div className="member-profile-gallery">

                  {
                    additionalImages.map(
                      (
                        image,
                        index
                      ) => (

                        <a
                          href={image}
                          target="_blank"
                          rel="noreferrer"

                          key={
                            `${image}-${index}`
                          }
                        >

                          <img
                            src={image}

                            alt={
                              `${getMemberName(
                                member
                              )} profile ${
                                index + 2
                              }`
                            }

                            loading="lazy"
                          />

                        </a>

                      )
                    )
                  }

                </div>

              </article>

            )
          }

        </section>

      </div>

    </main>
  );
}