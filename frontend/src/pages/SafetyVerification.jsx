import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";


export default function SafetyVerification() {

  const {
    user,
  } = useAuth();


  const profile =
    user?.profile || {};


  // =========================================================
  // VERIFICATION
  // =========================================================

  const isVerified =
    profile.is_verified === true &&
    profile.verification_status ===
      "approved";


  const verificationStatus =
    profile.verification_status ||
    "not_submitted";


  const womenOnlyMode =
    profile.women_only_mode === true;


  // =========================================================
  // BLOCKED MEMBERS
  // =========================================================

  const [
    blockedMembers,
    setBlockedMembers,
  ] = useState([]);


  const [
    blockedLoading,
    setBlockedLoading,
  ] = useState(true);


  const [
    blockedError,
    setBlockedError,
  ] = useState("");


  const [
    unblockingId,
    setUnblockingId,
  ] = useState(null);


  // =========================================================
  // VERIFICATION LABEL
  // =========================================================

  function getVerificationLabel() {

    if (isVerified) {
      return "Verified";
    }


    if (
      verificationStatus ===
      "pending"
    ) {
      return "Pending review";
    }


    if (
      verificationStatus ===
      "rejected"
    ) {
      return "Verification rejected";
    }


    return "Not verified";
  }


  // =========================================================
  // VERIFICATION DESCRIPTION
  // =========================================================

  function getVerificationDescription() {

    if (isVerified) {

      return (
        "Your identity verification has been approved. " +
        "Verified-only FoodKindl features are available to you."
      );

    }


    if (
      verificationStatus ===
      "pending"
    ) {

      return (
        "Your Government ID has been submitted and is currently awaiting review."
      );

    }


    if (
      verificationStatus ===
      "rejected"
    ) {

      return (
        "Your previous verification submission was not approved. " +
        "Please upload another valid document from your profile."
      );

    }


    return (
      "Complete identity verification to access verified-only " +
      "FoodKindl Connect features."
    );
  }


  // =========================================================
  // LOAD BLOCKED MEMBERS
  // =========================================================

  async function loadBlockedMembers() {

    try {

      setBlockedLoading(true);

      setBlockedError("");


      const response =
        await api.get(
          "/auth/blocked-members/"
        );


      setBlockedMembers(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );

    } catch (
      requestError
    ) {

      console.error(
        "Unable to load blocked members:",
        requestError.response?.data ||
          requestError
      );


      setBlockedError(
        requestError
          .response
          ?.data
          ?.detail ||
        "Unable to load blocked members."
      );

    } finally {

      setBlockedLoading(false);

    }
  }


  // =========================================================
  // UNBLOCK MEMBER
  // =========================================================

  async function unblockMember(
    member
  ) {

    if (!member?.id) {
      return;
    }


    const memberName =
      member.full_name ||
      member.first_name ||
      "this member";


    const confirmed =
      window.confirm(
        `Unblock ${memberName}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setUnblockingId(
        member.id
      );


      setBlockedError("");


      await api.post(
        `/auth/unblock/${member.id}/`
      );


      setBlockedMembers(
        (
          current
        ) =>
          current.filter(
            (
              blockedMember
            ) =>
              blockedMember.id !==
              member.id
          )
      );

    } catch (
      requestError
    ) {

      console.error(
        "Unable to unblock member:",
        requestError.response?.data ||
          requestError
      );


      setBlockedError(
        requestError
          .response
          ?.data
          ?.detail ||
        "Unable to unblock this member."
      );

    } finally {

      setUnblockingId(
        null
      );

    }
  }


  // =========================================================
  // LOAD ON PAGE OPEN
  // =========================================================

  useEffect(() => {

    loadBlockedMembers();

  }, []);


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="safety-verification-page">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="safety-verification-topbar">

        <Link
          to="/dashboard"
          className="safety-verification-back"
        >
          <ArrowLeft
            size={18}
          />

          Back to Dashboard
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="safety-verification-hero">

        <div className="safety-verification-pill">

          <ShieldCheck
            size={16}
          />

          YOUR SAFETY CONTROLS

        </div>


        <h1>
          Safety &amp;{" "}
          <span>
            Verification
          </span>
        </h1>


        <p>
          Manage identity verification,
          gathering preferences, blocked
          members and your personal
          FoodKindl safety controls.
        </p>

      </section>


      {/* =====================================================
          VERIFICATION STATUS
      ===================================================== */}

      <section className="safety-verification-status-card">

        <div
          className={
            isVerified
              ? "safety-status-icon verified"
              : "safety-status-icon"
          }
        >

          {
            isVerified
              ? (
                  <BadgeCheck
                    size={30}
                  />
                )
              : (
                  <FileCheck2
                    size={30}
                  />
                )
          }

        </div>


        <div className="safety-status-content">

          <span className="safety-kicker">
            IDENTITY VERIFICATION
          </span>


          <h2>
            {getVerificationLabel()}
          </h2>


          <p>
            {getVerificationDescription()}
          </p>


          {!isVerified && (

            <Link
              to="/profile"
              className="safety-primary-button"
            >

              {
                verificationStatus ===
                "pending"
                  ? "View verification"
                  : "Complete verification"
              }

            </Link>

          )}

        </div>

      </section>


      {/* =====================================================
          SAFETY CONTROLS
      ===================================================== */}

      <section className="safety-verification-grid">


        {/* ===================================================
            VERIFIED PROFILE
        =================================================== */}

        <article className="safety-control-card">

          <div className="safety-control-icon">

            <UserCheck
              size={25}
            />

          </div>


          <div>

            <span className="safety-card-label">
              IDENTITY
            </span>


            <h3>
              Verified Profile
            </h3>


            <p>
              Verification helps reduce
              fake identities and enables
              verified-only FoodKindl features.
            </p>


            <div
              className={
                isVerified
                  ? "safety-control-status success"
                  : "safety-control-status"
              }
            >

              {
                isVerified
                  ? (
                      <>
                        <CheckCircle2
                          size={15}
                        />

                        Verified
                      </>
                    )
                  : (
                      <>
                        <AlertTriangle
                          size={15}
                        />

                        {
                          getVerificationLabel()
                        }
                      </>
                    )
              }

            </div>

          </div>

        </article>


        {/* ===================================================
            WOMEN ONLY
        =================================================== */}

        <article className="safety-control-card">

          <div className="safety-control-icon">

            <Users
              size={25}
            />

          </div>


          <div>

            <span className="safety-card-label">
              GATHERING PREFERENCE
            </span>


            <h3>
              Women-Only Preference
            </h3>


            <p>
              Where applicable, selected
              gatherings can be limited to
              verified female community members.
            </p>


            <div
              className={
                womenOnlyMode
                  ? "safety-control-status success"
                  : "safety-control-status"
              }
            >

              {
                womenOnlyMode
                  ? "Enabled"
                  : "Not enabled"
              }

            </div>


            <Link
              to="/profile"
              className="safety-inline-link"
            >
              Manage preference →
            </Link>

          </div>

        </article>


        {/* ===================================================
            BLOCKED MEMBERS
        =================================================== */}

        <article className="safety-control-card blocked-members-card">

          <div className="safety-control-icon">

            <Ban
              size={25}
            />

          </div>


          <div className="blocked-members-content">

            <span className="safety-card-label">
              PRIVACY &amp; SAFETY
            </span>


            <div className="blocked-members-heading">

              <div>

                <h3>
                  Blocked Members
                </h3>


                <p>
                  Members you block cannot
                  message you or interact
                  with you through supported
                  FoodKindl features.
                </p>

              </div>


              {!blockedLoading && (

                <span className="blocked-members-count">
                  {
                    blockedMembers.length
                  }
                </span>

              )}

            </div>


            {/* LOADING */}

            {blockedLoading && (

              <div className="blocked-members-empty">

                <span>
                  Loading blocked members...
                </span>

              </div>

            )}


            {/* ERROR */}

            {
              !blockedLoading &&
              blockedError &&
              (

                <div className="blocked-members-error">

                  <span>
                    {blockedError}
                  </span>


                  <button
                    type="button"
                    onClick={
                      loadBlockedMembers
                    }
                  >
                    Try again
                  </button>

                </div>

              )
            }


            {/* EMPTY */}

            {
              !blockedLoading &&
              !blockedError &&
              blockedMembers.length === 0 &&
              (

                <div className="blocked-members-empty">

                  <CheckCircle2
                    size={19}
                  />


                  <div>

                    <strong>
                      No blocked members
                    </strong>


                    <span>
                      People you block will
                      appear here.
                    </span>

                  </div>

                </div>

              )
            }


            {/* BLOCKED LIST */}

            {
              !blockedLoading &&
              !blockedError &&
              blockedMembers.length > 0 &&
              (

                <div className="blocked-members-list">

                  {
                    blockedMembers.map(
                      (
                        member
                      ) => (

                        <div
                          className="blocked-member-row"
                          key={
                            member.id
                          }
                        >

                          {/* NAME ONLY */}

                          <div className="blocked-member-info">

                            <strong>

                              {
                                member.full_name ||
                                member.first_name ||
                                "FoodKindl Member"
                              }

                            </strong>


                            <span>
                              Blocked member
                            </span>

                          </div>


                          {/* ACTIONS */}

                          <div className="blocked-member-actions">

                            <Link
                              to={`/connect/member/${member.id}`}
                              className="blocked-view-profile"
                            >
                              View Profile
                            </Link>


                            <button
                              type="button"

                              className="unblock-member-button"

                              disabled={
                                unblockingId ===
                                member.id
                              }

                              onClick={() =>
                                unblockMember(
                                  member
                                )
                              }
                            >

                              {
                                unblockingId ===
                                member.id
                                  ? "Unblocking..."
                                  : "Unblock"
                              }

                            </button>

                          </div>

                        </div>

                      )
                    )
                  }

                </div>

              )
            }

          </div>

        </article>


        {/* ===================================================
            SOS & TRUSTED CONTACTS
        =================================================== */}

        <article className="safety-control-card">

          <div className="safety-control-icon">

            <PhoneCall
              size={25}
            />

          </div>


          <div>

            <span className="safety-card-label">
              EMERGENCY SUPPORT
            </span>


            <h3>
              SOS &amp; Trusted Contacts
            </h3>


            <p>
              Add trusted contacts and access
              personal safety controls during
              FoodKindl gatherings.
            </p>


            <Link
              to="/sos-safety"
              className="safety-inline-link"
            >
              Manage safety controls →
            </Link>

          </div>

        </article>

      </section>


      {/* =====================================================
          SAFETY GUIDANCE
      ===================================================== */}

      <section className="safety-guidance-card">

        <LockKeyhole
          size={28}
        />


        <div>

          <span className="safety-kicker">
            BEFORE MEETING SOMEONE
          </span>


          <h2>
            Use FoodKindl safety features
            together with your own judgement.
          </h2>


          <div className="safety-guidance-list">

            <div>

              <CheckCircle2
                size={17}
              />

              Meet in a public or shared
              place for your first gathering.

            </div>


            <div>

              <CheckCircle2
                size={17}
              />

              Inform someone you trust
              about your plans.

            </div>


            <div>

              <CheckCircle2
                size={17}
              />

              Do not publicly share sensitive
              personal information.

            </div>


            <div>

              <CheckCircle2
                size={17}
              />

              Leave the gathering if you
              feel uncomfortable or unsafe.

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WARNING
      ===================================================== */}

      <section className="safety-warning-card">

        <AlertTriangle
          size={26}
        />


        <div>

          <strong>
            Verification does not guarantee
            behaviour or safety.
          </strong>


          <p>
            FoodKindl identity verification
            helps reduce fake profiles, but
            it cannot guarantee a member's
            conduct or the complete safety
            of an in-person gathering.
          </p>

        </div>

      </section>


      {/* =====================================================
          SAFETY CENTRE
      ===================================================== */}

      <section className="safety-centre-link-card">

        <ShieldCheck
          size={28}
        />


        <div>

          <h3>
            Need more safety information?
          </h3>


          <p>
            Read FoodKindl's general safety
            guidance for hosts, guests and
            community members.
          </p>

        </div>


        <Link
          to="/safety"
          className="safety-primary-button"
        >
          Visit Safety Centre
        </Link>

      </section>

    </main>
  );
}