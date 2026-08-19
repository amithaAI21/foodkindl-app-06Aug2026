import {
  ArrowLeft,
  BadgeCheck,
  Database,
  FileText,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="privacy-topbar">

        <Link
          to="/"
          className="privacy-back-link"
        >
          <ArrowLeft size={18} />
          Back to FoodKindl
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="privacy-hero">

        <div className="privacy-pill">
          <ShieldCheck size={16} />
          YOUR PRIVACY MATTERS
        </div>

        <h1>
          Privacy <span>Policy</span>
        </h1>

        <p>
          This Privacy Policy explains how FoodKindl,
          operated by KnightnKindle Pvt Ltd, collects,
          uses, stores and protects personal information
          when you use our website, applications and
          community features.
        </p>

        <div className="privacy-effective-date">
          Effective date: 19 August 2026
        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="privacy-intro-card">

        <LockKeyhole size={28} />

        <div>

          <strong>
            Privacy by design
          </strong>

          <p>
            We aim to collect only the information reasonably
            needed to provide FoodKindl services, support
            community safety, improve the platform and meet
            applicable legal requirements.
          </p>

        </div>

      </section>


      {/* =====================================================
          01 INFORMATION WE COLLECT
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            01 · INFORMATION WE COLLECT
          </span>

          <h2>
            Information you provide to FoodKindl
          </h2>

        </div>


        <div className="privacy-card-grid">

          <article className="privacy-card">

            <div className="privacy-icon">
              <UserRound size={25} />
            </div>

            <h3>
              Account Information
            </h3>

            <p>
              When you register, we may collect your name,
              email address, login credentials and other
              information required to create and manage
              your account.
            </p>

          </article>


          <article className="privacy-card">

            <div className="privacy-icon">
              <FileText size={25} />
            </div>

            <h3>
              Profile Information
            </h3>

            <p>
              You may provide profile photos, bio, city,
              locality, workplace or college, role, interests,
              gender and dietary preferences.
            </p>

          </article>


          <article className="privacy-card">

            <div className="privacy-icon">
              <MapPin size={25} />
            </div>

            <h3>
              Location Information
            </h3>

            <p>
              FoodKindl may process location-related information
              such as city, locality, postcode or approximate
              location to help you discover relevant community
              members, gatherings or content.
            </p>

          </article>


          <article className="privacy-card">

            <div className="privacy-icon">
              <BadgeCheck size={25} />
            </div>

            <h3>
              Identity Verification
            </h3>

            <p>
              Where verification is required, FoodKindl may
              process Government-ID related information and
              verification status for trust and safety purposes.
            </p>

          </article>

        </div>

      </section>


      {/* =====================================================
          02 CONTENT & COMMUNICATION
      ===================================================== */}

      <section className="privacy-split-section">

        <div>

          <span className="privacy-kicker">
            02 · CONTENT & COMMUNICATION
          </span>

          <h2>
            Information created when you use FoodKindl
          </h2>

          <p>
            When you participate in the FoodKindl community,
            we may process content and activity associated
            with your account.
          </p>

        </div>


        <div className="privacy-detail-card">

          <div>
            <strong>
              Posts and media
            </strong>

            <p>
              Photos, videos, articles, recipes, captions,
              comments, reactions, reposts and other content
              you choose to publish.
            </p>
          </div>


          <div>
            <strong>
              Messages
            </strong>

            <p>
              Messages exchanged through FoodKindl may be
              processed to provide messaging functionality,
              address abuse reports and support platform safety.
            </p>
          </div>


          <div>
            <strong>
              Food Invites and gatherings
            </strong>

            <p>
              Information such as date, venue, cuisine, menu,
              participants and other gathering details may be
              processed to provide Connect features.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          03 TECHNICAL DATA
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            03 · DEVICE & USAGE INFORMATION
          </span>

          <h2>
            Technical information
          </h2>

        </div>


        <div className="privacy-simple-list">

          <div>
            <Smartphone size={20} />

            <p>
              Device type, browser information, operating
              system and application version.
            </p>
          </div>


          <div>
            <Database size={20} />

            <p>
              IP address, request logs, error logs and security
              information used to operate and protect the service.
            </p>
          </div>


          <div>
            <FileText size={20} />

            <p>
              Usage information such as pages viewed, features
              used and interactions with FoodKindl.
            </p>
          </div>


          <div>
            <LockKeyhole size={20} />

            <p>
              Cookies or similar technologies where used for
              authentication, security, preferences, analytics
              or service functionality.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          04 WHY WE USE DATA
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            04 · HOW WE USE INFORMATION
          </span>

          <h2>
            Why FoodKindl processes personal information
          </h2>

        </div>


        <div className="privacy-purpose-grid">

          <article>
            <strong>
              Provide the service
            </strong>

            <p>
              Create accounts, display profiles, provide
              community features, Connect, messaging and
              FoodKindl AI experiences.
            </p>
          </article>


          <article>
            <strong>
              Personalisation
            </strong>

            <p>
              Recommend relevant people, recipes, content,
              communities or features based on your preferences.
            </p>
          </article>


          <article>
            <strong>
              Trust & Safety
            </strong>

            <p>
              Verify accounts, investigate reports, prevent
              fraud, enforce Community Guidelines and protect
              members.
            </p>
          </article>


          <article>
            <strong>
              Platform improvement
            </strong>

            <p>
              Understand usage, diagnose errors and improve
              functionality, accessibility and performance.
            </p>
          </article>


          <article>
            <strong>
              Communication
            </strong>

            <p>
              Send service-related communications, account
              notices, responses to support requests and
              important policy updates.
            </p>
          </article>


          <article>
            <strong>
              Legal obligations
            </strong>

            <p>
              Comply with applicable law, valid legal requests
              and regulatory obligations.
            </p>
          </article>

        </div>

      </section>


      {/* =====================================================
          05 GOVERNMENT ID
      ===================================================== */}

      <section className="privacy-sensitive-card">

        <ShieldCheck size={30} />

        <div>

          <span>
            SENSITIVE IDENTITY INFORMATION
          </span>

          <h2>
            Government-ID documents are not public
          </h2>

          <p>
            Identity documents used for verification are not
            intended to be visible on public FoodKindl profiles,
            posts or community pages.
          </p>

          <p>
            FoodKindl should minimise retention of complete
            identity documents and, where practical, may use
            specialised verification service providers instead
            of permanently retaining complete document copies.
          </p>

        </div>

      </section>


      {/* =====================================================
          06 SHARING
      ===================================================== */}

      <section className="privacy-split-section">

        <div>

          <span className="privacy-kicker">
            06 · SHARING INFORMATION
          </span>

          <h2>
            When information may be shared
          </h2>

        </div>


        <div className="privacy-detail-card">

          <div>
            <strong>
              Other FoodKindl members
            </strong>

            <p>
              Information you choose to make public or visible
              through your profile, posts, comments or gatherings
              may be visible to other users based on platform
              settings.
            </p>
          </div>


          <div>
            <strong>
              Service providers
            </strong>

            <p>
              FoodKindl may use hosting, cloud infrastructure,
              analytics, communications, media-storage,
              verification or other technology providers that
              process information on our behalf.
            </p>
          </div>


          <div>
            <strong>
              Legal requirements
            </strong>

            <p>
              Information may be disclosed when reasonably
              required to comply with applicable law, a valid
              legal request, protect users, prevent fraud or
              defend legal rights.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          07 STORAGE & SECURITY
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            07 · STORAGE & SECURITY
          </span>

          <h2>
            How we protect information
          </h2>

        </div>


        <div className="privacy-security-card">

          <LockKeyhole size={31} />

          <div>

            <p>
              FoodKindl uses reasonable administrative,
              technical and organisational safeguards designed
              to protect personal information against
              unauthorised access, disclosure, alteration,
              misuse or loss.
            </p>

            <p>
              No internet service or storage system can be
              guaranteed to be completely secure. Members should
              use strong passwords and avoid sharing account
              credentials with others.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          08 RETENTION
      ===================================================== */}

      <section className="privacy-split-section">

        <div>

          <span className="privacy-kicker">
            08 · DATA RETENTION
          </span>

          <h2>
            How long information is kept
          </h2>

        </div>


        <div className="privacy-text-block">

          <p>
            Personal information should be retained only for
            as long as reasonably necessary for the purpose
            for which it was collected, to provide FoodKindl
            services, resolve disputes, protect the community,
            comply with legal requirements and enforce agreements.
          </p>

          <p>
            Some information may be retained for a limited
            period after account deletion where necessary for
            security, fraud prevention, legal compliance,
            dispute resolution or backup processes.
          </p>

        </div>

      </section>


      {/* =====================================================
          09 USER RIGHTS
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            09 · YOUR CHOICES & RIGHTS
          </span>

          <h2>
            Control over your information
          </h2>

        </div>


        <div className="privacy-rights-grid">

          <article>
            <strong>
              Access
            </strong>

            <p>
              You may request information about personal data
              associated with your FoodKindl account, subject
              to applicable law.
            </p>
          </article>


          <article>
            <strong>
              Correction
            </strong>

            <p>
              You can update many profile details directly or
              request correction of inaccurate information.
            </p>
          </article>


          <article>
            <strong>
              Deletion
            </strong>

            <p>
              You may request deletion of your account and
              eligible personal information, subject to legal
              or legitimate retention requirements.
            </p>
          </article>


          <article>
            <strong>
              Withdraw consent
            </strong>

            <p>
              Where processing relies on your consent, you may
              withdraw that consent subject to applicable law
              and service requirements.
            </p>
          </article>

        </div>

      </section>


      {/* =====================================================
          10 ACCOUNT DELETION
      ===================================================== */}

      <section className="privacy-delete-card">

        <UserRound size={28} />

        <div>

          <h3>
            Account deletion
          </h3>

          <p>
            Until an in-product deletion feature is available,
            you may contact FoodKindl to request account deletion
            or removal of eligible personal information.
          </p>

          <Link
            to="/contact"
            className="privacy-contact-button"
          >
            Contact FoodKindl
          </Link>

        </div>

      </section>


      {/* =====================================================
          11 CHILDREN
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            11 · CHILDREN & AGE REQUIREMENTS
          </span>

          <h2>
            Minimum age
          </h2>

        </div>


        <div className="privacy-text-block">

          <p>
            FoodKindl is not intended for children below the
            minimum age permitted to independently use the
            service under applicable law.
          </p>

          <p>
            The final minimum-age requirement and any parental
            consent process should be stated consistently in
            both the Terms of Use and registration flow.
          </p>

        </div>

      </section>


      {/* =====================================================
          12 CROSS BORDER / THIRD PARTY
      ===================================================== */}

      <section className="privacy-section">

        <div className="privacy-section-heading">

          <span>
            12 · THIRD-PARTY SERVICES
          </span>

          <h2>
            Technology providers
          </h2>

        </div>


        <div className="privacy-text-block">

          <p>
            FoodKindl may rely on third-party infrastructure
            and service providers for hosting, databases,
            media storage, AI services, communications,
            analytics and verification.
          </p>

          <p>
            Depending on the provider, personal information
            may be processed in locations outside your state
            or country, subject to applicable legal requirements.
          </p>

        </div>

      </section>


      {/* =====================================================
          13 POLICY CHANGES
      ===================================================== */}

      <section className="privacy-split-section">

        <div>

          <span className="privacy-kicker">
            13 · POLICY UPDATES
          </span>

          <h2>
            Changes to this Privacy Policy
          </h2>

        </div>


        <div className="privacy-text-block">

          <p>
            FoodKindl may update this Privacy Policy as the
            platform, legal requirements or data practices change.
          </p>

          <p>
            When significant changes are made, we may provide
            notice through the website, application, email or
            another appropriate communication method.
          </p>

        </div>

      </section>


      {/* =====================================================
          14 CONTACT
      ===================================================== */}

      <section className="privacy-contact-section">

        <Mail size={30} />

        <div>

          <span>
            14 · PRIVACY QUESTIONS
          </span>

          <h2>
            Contact us about your privacy
          </h2>

          <p>
            For questions, requests or concerns about your
            personal information or this Privacy Policy,
            contact FoodKindl through our Contact page.
          </p>

          <Link
            to="/contact"
            className="privacy-contact-button"
          >
            Contact Us
          </Link>

        </div>

      </section>


      {/* =====================================================
          COMPANY
      ===================================================== */}

      <div className="privacy-company-note">

        <strong>
          KnightnKindle Pvt Ltd
        </strong>

        <span>
          Operator of FoodKindl
        </span>

        <p>
          © 2026 KnightnKindle Pvt Ltd.
          All rights reserved.
        </p>

      </div>

    </main>
  );
}