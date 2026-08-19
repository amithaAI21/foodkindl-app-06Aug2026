import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  ChefHat,
  Copyright,
  FileText,
  Gavel,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
  Users,
  Utensils,
} from "lucide-react";

import { Link } from "react-router-dom";


export default function TermsOfUse() {
  return (
    <main className="terms-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="terms-topbar">

        <Link
          to="/"
          className="terms-back-link"
        >
          <ArrowLeft size={18} />
          Back to FoodKindl
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="terms-hero">

        <div className="terms-pill">
          <FileText size={16} />
          FOODKINDL TERMS
        </div>

        <h1>
          Terms of <span>Use</span>
        </h1>

        <p>
          These Terms of Use govern your access to and use of
          FoodKindl, including FoodKindl Connect, CommuniQ,
          FoodKindl AI, Food Invites, messaging and other
          features made available through the platform.
        </p>

        <div className="terms-effective-date">
          Effective date: 19 August 2026
        </div>

      </section>


      {/* =====================================================
          IMPORTANT NOTICE
      ===================================================== */}

      <section className="terms-important-card">

        <Gavel size={30} />

        <div>

          <strong>
            Please read these Terms carefully
          </strong>

          <p>
            By creating an account or using FoodKindl, you
            agree to these Terms of Use, our Privacy Policy
            and applicable Community Guidelines.
          </p>

          <p>
            If you do not agree with these Terms, you should
            not create an account or use the FoodKindl
            platform.
          </p>

        </div>

      </section>


      {/* =====================================================
          01 ABOUT FOODKINDL
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            01 · ABOUT FOODKINDL
          </span>

          <h2>
            A platform built around food and human connection
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            FoodKindl is a human-centred food community operated
            by KnightnKindle Pvt Ltd. The platform is designed
            to help people discover and connect with others
            through food, cooking, shared meals, recipes,
            food content and community experiences.
          </p>

          <p>
            FoodKindl may provide features including member
            profiles, community posts, Food Invites, messaging,
            food-related videos, recipes, FoodKindl AI and
            other services introduced from time to time.
          </p>

        </div>

      </section>


      {/* =====================================================
          02 ELIGIBILITY
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            02 · ELIGIBILITY
          </span>

          <h2>
            Who can use FoodKindl
          </h2>

        </div>


        <div className="terms-card-grid">

          <article className="terms-card">

            <div className="terms-icon">
              <UserCheck size={26} />
            </div>

            <h3>
              Minimum Age
            </h3>

            <p>
              You must meet the minimum age requirements
              applicable to the FoodKindl service and your
              jurisdiction.
            </p>

          </article>


          <article className="terms-card">

            <div className="terms-icon">
              <Users size={26} />
            </div>

            <h3>
              Genuine Identity
            </h3>

            <p>
              You must provide accurate information and must
              not impersonate another person or create a
              misleading identity.
            </p>

          </article>


          <article className="terms-card">

            <div className="terms-icon">
              <ShieldCheck size={26} />
            </div>

            <h3>
              Platform Rules
            </h3>

            <p>
              You must use FoodKindl in accordance with these
              Terms, our Community Guidelines and applicable
              laws.
            </p>

          </article>

        </div>

      </section>


      {/* =====================================================
          03 ACCOUNT RESPONSIBILITY
      ===================================================== */}

      <section className="terms-split-section">

        <div>

          <span className="terms-kicker">
            03 · YOUR ACCOUNT
          </span>

          <h2>
            Keep your account accurate and secure
          </h2>

        </div>


        <div className="terms-detail-card">

          <div>

            <strong>
              Accurate information
            </strong>

            <p>
              You are responsible for providing accurate,
              current and truthful information when creating
              and maintaining your FoodKindl profile.
            </p>

          </div>


          <div>

            <strong>
              Password security
            </strong>

            <p>
              You are responsible for protecting your login
              credentials and for activity performed through
              your account.
            </p>

          </div>


          <div>

            <strong>
              Unauthorised access
            </strong>

            <p>
              Contact FoodKindl promptly if you believe your
              account has been compromised or accessed without
              your permission.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          04 VERIFICATION
      ===================================================== */}

      <section className="terms-verification-card">

        <ShieldCheck size={31} />

        <div>

          <span>
            IDENTITY VERIFICATION
          </span>

          <h2>
            Verification helps build trust,
            but it is not a guarantee of behaviour.
          </h2>

          <p>
            FoodKindl may require identity, mobile or other
            verification before certain features become
            available, including selected Connect or
            gathering features.
          </p>

          <p>
            A verified badge indicates that specified
            verification steps have been completed. It does
            not mean that FoodKindl endorses a member or
            guarantees that a person will behave safely,
            appropriately or as expected.
          </p>

        </div>

      </section>


      {/* =====================================================
          05 ACCEPTABLE USE
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            05 · ACCEPTABLE USE
          </span>

          <h2>
            Treat people and the community with respect
          </h2>

        </div>


        <div className="terms-simple-list">

          <div>
            <HeartHandshake size={20} />

            <p>
              Communicate respectfully with other members.
            </p>
          </div>


          <div>
            <Users size={20} />

            <p>
              Respect personal boundaries, dietary choices,
              culture and individual preferences.
            </p>
          </div>


          <div>
            <ChefHat size={20} />

            <p>
              Use FoodKindl for genuine food, community,
              learning and social interactions.
            </p>
          </div>


          <div>
            <ShieldCheck size={20} />

            <p>
              Follow applicable safety instructions when
              participating in Food Invites and gatherings.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          06 PROHIBITED CONDUCT
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            06 · PROHIBITED CONDUCT
          </span>

          <h2>
            What you must not do
          </h2>

        </div>


        <div className="terms-prohibited-card">

          <Ban size={30} />

          <div className="terms-prohibited-grid">

            <p>
              Harass, threaten, stalk, intimidate or abuse
              another person.
            </p>

            <p>
              Discriminate against members or publish hateful
              or abusive content.
            </p>

            <p>
              Impersonate another person or create fake or
              misleading accounts.
            </p>

            <p>
              Upload illegal, harmful, deceptive or
              inappropriate content.
            </p>

            <p>
              Send spam, scams, unsolicited promotions or
              fraudulent requests.
            </p>

            <p>
              Attempt to gain unauthorised access to another
              account or FoodKindl systems.
            </p>

            <p>
              Scrape, harvest or improperly collect information
              about other members.
            </p>

            <p>
              Use FoodKindl to facilitate unlawful activities
              or activities that may endanger others.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          07 FOOD INVITES
      ===================================================== */}

      <section className="terms-split-section">

        <div>

          <span className="terms-kicker">
            07 · FOOD INVITES & GATHERINGS
          </span>

          <h2>
            Meeting people through FoodKindl
          </h2>

        </div>


        <div className="terms-detail-card">

          <div>

            <strong>
              FoodKindl facilitates connections
            </strong>

            <p>
              FoodKindl provides technology that may help
              members discover one another, communicate and
              organise food-related gatherings.
            </p>

          </div>


          <div>

            <strong>
              Members make their own decisions
            </strong>

            <p>
              Members are responsible for deciding whether
              to send, accept, decline or participate in a
              Food Invite or gathering.
            </p>

          </div>


          <div>

            <strong>
              First meetings
            </strong>

            <p>
              We strongly encourage first-time meetings to
              take place in an appropriate public or shared
              location and recommend informing a trusted
              person about your plans.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          08 WOMEN ONLY
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            08 · GATHERING PREFERENCES
          </span>

          <h2>
            Women-only gathering preferences
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            Where available, eligible hosts may choose to
            restrict selected gatherings to verified female
            members as an additional comfort and safety
            preference.
          </p>

          <p>
            Members must not intentionally misrepresent
            information used to determine eligibility for
            restricted gathering features.
          </p>

          <p>
            Such preferences are an additional platform
            control and do not guarantee the safety or
            behaviour of participants.
          </p>

        </div>

      </section>


      {/* =====================================================
          09 FOOD SAFETY
      ===================================================== */}

      <section className="terms-food-card">

        <Utensils size={30} />

        <div>

          <span>
            09 · FOOD, ALLERGIES & DIETARY CHOICES
          </span>

          <h2>
            Members remain responsible for what they eat,
            prepare and serve.
          </h2>

          <p>
            Members should communicate allergies, dietary
            restrictions and relevant food preferences before
            participating in meals or cooking activities.
          </p>

          <p>
            Hosts and participants are responsible for
            appropriate food handling, preparation, storage
            and hygiene.
          </p>

          <p>
            Unless FoodKindl expressly states otherwise for
            a particular service, FoodKindl does not prepare,
            inspect or certify food exchanged or served by
            members.
          </p>

        </div>

      </section>


      {/* =====================================================
          10 IN PERSON SAFETY
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            10 · IN-PERSON SAFETY
          </span>

          <h2>
            Use appropriate judgement when meeting others
          </h2>

        </div>


        <div className="terms-warning-card">

          <AlertTriangle size={28} />

          <div>

            <p>
              Meeting people in person involves risks that
              cannot be completely eliminated by an online
              platform.
            </p>

            <p>
              You are responsible for evaluating whether you
              feel comfortable meeting another member and
              participating in a gathering.
            </p>

            <p>
              If you feel unsafe or uncomfortable, leave the
              situation and use available reporting, blocking
              or safety features as appropriate.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          11 FOODKINDL IS A PLATFORM
      ===================================================== */}

      <section className="terms-platform-card">

        <AlertTriangle size={31} />

        <div>

          <span>
            IMPORTANT
          </span>

          <h2>
            FoodKindl facilitates connections.
          </h2>

          <p>
            Unless expressly stated otherwise, FoodKindl is
            not the host, restaurant, caterer, chef, food
            provider or organiser of gatherings created
            independently by members.
          </p>

          <p>
            FoodKindl does not provide emergency services.
          </p>

          <p>
            Members remain responsible for their own decisions,
            interactions, travel, food choices, gatherings and
            other offline activities.
          </p>

        </div>

      </section>


      {/* =====================================================
          12 USER CONTENT
      ===================================================== */}

      <section className="terms-split-section">

        <div>

          <span className="terms-kicker">
            12 · YOUR CONTENT
          </span>

          <h2>
            Photos, videos, recipes and posts
          </h2>

        </div>


        <div className="terms-detail-card">

          <div>

            <strong>
              Your ownership
            </strong>

            <p>
              You retain ownership of original content that
              you create and post on FoodKindl, subject to
              rights belonging to others.
            </p>

          </div>


          <div>

            <strong>
              Permission to operate the service
            </strong>

            <p>
              By posting content, you grant FoodKindl the
              permissions reasonably necessary to host,
              store, reproduce, display and distribute that
              content through the platform in accordance
              with your settings and applicable law.
            </p>

          </div>


          <div>

            <strong>
              Your responsibility
            </strong>

            <p>
              You must have the necessary rights and
              permissions for content you upload or share.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          13 OTHER PEOPLE
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            13 · OTHER PEOPLE'S PRIVACY
          </span>

          <h2>
            Respect people featured in your content
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            Do not post another person's private information
            without appropriate permission.
          </p>

          <p>
            You should obtain appropriate permission before
            sharing identifiable photos or videos of other
            people, particularly content captured during
            private FoodKindl gatherings.
          </p>

        </div>

      </section>


      {/* =====================================================
          14 FOODKINDL IP
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            14 · FOODKINDL INTELLECTUAL PROPERTY
          </span>

          <h2>
            Our platform and brand
          </h2>

        </div>


        <div className="terms-ip-card">

          <Copyright size={29} />

          <div>

            <p>
              FoodKindl's software, product design, branding,
              logos, visual identity and other proprietary
              materials are owned by or licensed to
              KnightnKindle Pvt Ltd, except where otherwise
              stated.
            </p>

            <p>
              You may not copy, reproduce, modify, distribute
              or commercially exploit FoodKindl proprietary
              materials without appropriate permission.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          15 AI
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            15 · FOODKINDL AI
          </span>

          <h2>
            AI-generated recipes and suggestions
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            FoodKindl AI may generate recipes, cooking
            suggestions and other food-related information
            using automated systems.
          </p>

          <p>
            AI-generated information may occasionally be
            inaccurate, incomplete or unsuitable for a
            particular person.
          </p>

          <p>
            You are responsible for checking ingredients,
            cooking methods, allergies, dietary restrictions
            and food-safety requirements before relying on
            an AI-generated recipe or suggestion.
          </p>

        </div>

      </section>


      {/* =====================================================
          16 ENFORCEMENT
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            16 · ENFORCEMENT
          </span>

          <h2>
            Content removal and account action
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            FoodKindl may investigate reported behaviour or
            content that appears to violate these Terms,
            Community Guidelines, safety requirements or
            applicable law.
          </p>

          <p>
            Depending on the circumstances, FoodKindl may
            remove content, restrict features, issue warnings,
            temporarily suspend accounts or permanently
            terminate access.
          </p>

        </div>

      </section>


      {/* =====================================================
          17 REPORTING
      ===================================================== */}

      <section className="terms-split-section">

        <div>

          <span className="terms-kicker">
            17 · REPORTING
          </span>

          <h2>
            Help us protect the community
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            Members may report users, content or gatherings
            that they believe violate FoodKindl policies or
            create a safety concern.
          </p>

          <p>
            Reports may be reviewed and appropriate action
            may be taken based on the information available
            and applicable policies.
          </p>

          <Link
            to="/contact"
            className="terms-button"
          >
            Contact FoodKindl
          </Link>

        </div>

      </section>


      {/* =====================================================
          18 SERVICE
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            18 · SERVICE AVAILABILITY
          </span>

          <h2>
            FoodKindl may evolve
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            FoodKindl may add, modify, suspend or discontinue
            features as the platform develops.
          </p>

          <p>
            We do not guarantee that every feature will always
            be available, uninterrupted or error-free.
          </p>

        </div>

      </section>


      {/* =====================================================
          19 LIABILITY
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            19 · LIMITATION OF LIABILITY
          </span>

          <h2>
            Responsibilities and limitations
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            To the extent permitted by applicable law,
            FoodKindl and KnightnKindle Pvt Ltd will not be
            responsible for losses arising solely from
            interactions, arrangements or activities between
            members outside FoodKindl's direct control.
          </p>

          <p>
            Nothing in these Terms excludes or limits rights
            or liabilities that cannot legally be excluded
            or limited.
          </p>

        </div>

      </section>


      {/* =====================================================
          20 GOVERNING LAW
      ===================================================== */}

      <section className="terms-section">

        <div className="terms-section-heading">

          <span>
            20 · GOVERNING LAW
          </span>

          <h2>
            Legal jurisdiction
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            These Terms are governed by the laws of India,
            subject to applicable mandatory legal rights.
          </p>

          <p>
            The final jurisdiction and dispute-resolution
            provisions should reflect KnightnKindle Pvt Ltd's
            registered office and should be reviewed by
            qualified legal counsel before publication.
          </p>

        </div>

      </section>


      {/* =====================================================
          21 CHANGES
      ===================================================== */}

      <section className="terms-split-section">

        <div>

          <span className="terms-kicker">
            21 · CHANGES TO THESE TERMS
          </span>

          <h2>
            Updates to our Terms
          </h2>

        </div>


        <div className="terms-text-block">

          <p>
            FoodKindl may update these Terms as the platform,
            services or legal requirements change.
          </p>

          <p>
            Where appropriate, significant changes may be
            communicated through the platform, website,
            email or another reasonable method.
          </p>

        </div>

      </section>


      {/* =====================================================
          22 CONTACT
      ===================================================== */}

      <section className="terms-contact-section">

        <Mail size={30} />

        <div>

          <span>
            22 · CONTACT
          </span>

          <h2>
            Questions about these Terms?
          </h2>

          <p>
            For questions about these Terms of Use,
            contact FoodKindl through our Contact page.
          </p>

          <Link
            to="/contact"
            className="terms-button"
          >
            Contact Us
          </Link>

        </div>

      </section>


      {/* =====================================================
          RELATED POLICIES
      ===================================================== */}

      <section className="terms-related">

        <span>
          RELATED POLICIES
        </span>

        <div>

          <Link to="/privacy">
            Privacy Policy
          </Link>

          <Link to="/community-guidelines">
            Community Guidelines
          </Link>

          <Link to="/safety">
            Safety Centre
          </Link>

        </div>

      </section>


      {/* =====================================================
          COMPANY
      ===================================================== */}

      <div className="terms-company-note">

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