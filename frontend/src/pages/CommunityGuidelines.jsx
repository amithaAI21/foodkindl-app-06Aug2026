import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Camera,
  HeartHandshake,
  MessageSquareWarning,
  ShieldCheck,
  UserCheck,
  Users,
  Utensils,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


export default function CommunityGuidelines() {
  const guidelines = [
    {
      icon: <HeartHandshake size={26} />,
      title: "Be Respectful and Inclusive",
      text:
        "Treat every member with dignity. Harassment, threats, bullying, hate speech, discrimination and abusive behaviour are not allowed.",
    },

    {
      icon: <UserCheck size={26} />,
      title: "Use a Genuine Identity",
      text:
        "Use accurate profile information and do not impersonate another person. Do not intentionally misrepresent who you are.",
    },

    {
      icon: <Users size={26} />,
      title: "Respect Personal Boundaries",
      text:
        "Respect dietary choices, culture, personal space and comfort levels. Never pressure someone to meet, share private information or attend a gathering.",
    },

    {
      icon: <Camera size={26} />,
      title: "Share Content Responsibly",
      text:
        "Do not post offensive, illegal, deceptive or harmful content. Do not publish another person's photo, video or private information without appropriate permission.",
    },

    {
      icon: <Ban size={26} />,
      title: "No Spam or Impersonation",
      text:
        "Do not send unwanted promotions, repetitive messages, misleading offers or spam. Do not create accounts pretending to be another person or organisation.",
    },

    {
      icon: <Utensils size={26} />,
      title: "Follow Food Safety Practices",
      text:
        "Hosts should follow reasonable hygiene practices, disclose relevant food information and take allergies and dietary restrictions seriously.",
    },
  ];


  return (
    <main className="guidelines-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="guidelines-topbar">

        <Link
          to="/"
          className="guidelines-back-link"
        >
          <ArrowLeft size={18} />
          Back to FoodKindl
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="guidelines-hero">

        <div className="guidelines-pill">
          <ShieldCheck size={16} />
          COMMUNITY STANDARDS
        </div>

        <h1>
          Community <span>Guidelines</span>
        </h1>

        <p>
          FoodKindl is built around meaningful human
          connection through food. These guidelines help
          keep the community respectful, welcoming and safer
          for everyone.
        </p>

      </section>


      {/* =====================================================
          CORE PRINCIPLES
      ===================================================== */}

      <section className="guidelines-section">

        <div className="guidelines-section-header">

          <span>
            01 · COMMUNITY EXPECTATIONS
          </span>

          <h2>
            How we expect members to behave
          </h2>

        </div>


        <div className="guidelines-grid">

          {guidelines.map(
            (
              guideline,
              index
            ) => (

              <article
                className="guideline-card"
                key={guideline.title}
              >

                <span className="guideline-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="guideline-icon">
                  {guideline.icon}
                </div>

                <h3>
                  {guideline.title}
                </h3>

                <p>
                  {guideline.text}
                </p>

              </article>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          IN PERSON GATHERINGS
      ===================================================== */}

      <section className="guidelines-meetups">

        <div className="guidelines-section-header">

          <span>
            02 · IN-PERSON GATHERINGS
          </span>

          <h2>
            Meet thoughtfully and safely
          </h2>

          <p>
            FoodKindl helps people connect, but every member
            should use their own judgement when meeting
            someone in person.
          </p>

        </div>


        <div className="guidelines-meetup-list">

          <div>
            <BadgeCheck size={20} />
            <p>
              For your first gathering, meet in a public,
              shared or familiar place where you feel comfortable.
            </p>
          </div>


          <div>
            <BadgeCheck size={20} />
            <p>
              Inform a trusted friend or family member about
              where you are going and who you are meeting.
            </p>
          </div>


          <div>
            <BadgeCheck size={20} />
            <p>
              Do not pressure another member to reveal their
              home address, phone number or other private details.
            </p>
          </div>


          <div>
            <BadgeCheck size={20} />
            <p>
              If something feels unsafe or uncomfortable,
              leave the situation and report it to FoodKindl.
            </p>
          </div>


          <div>
            <BadgeCheck size={20} />
            <p>
              Respect the host's rules, food preferences,
              allergies, boundaries and gathering conditions.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="guidelines-content-rules">

        <div className="guidelines-content-copy">

          <span>
            03 · CONTENT & COMMUNICATION
          </span>

          <h2>
            Keep conversations constructive
          </h2>

          <p>
            Posts, comments, messages, photos and videos should
            support a respectful food community. Content that
            harms, intimidates, deceives or targets another
            person may be removed.
          </p>

        </div>


        <div className="guidelines-content-card">

          <MessageSquareWarning size={30} />

          <h3>
            Report inappropriate behaviour
          </h3>

          <p>
            Report users, posts, messages or gatherings that
            appear abusive, unsafe, misleading, illegal or
            inconsistent with these guidelines.
          </p>

          <Link
            to="/contact"
            className="guidelines-action-link"
          >
            Contact FoodKindl
          </Link>

        </div>

      </section>


      {/* =====================================================
          ENFORCEMENT
      ===================================================== */}

      <section className="guidelines-enforcement">

        <div className="guidelines-section-header">

          <span>
            04 · ENFORCEMENT
          </span>

          <h2>
            What happens when guidelines are violated?
          </h2>

        </div>


        <div className="guidelines-enforcement-grid">

          <article>
            <strong>
              Warning
            </strong>

            <p>
              Minor or first-time violations may result in
              a warning and removal of the affected content.
            </p>
          </article>


          <article>
            <strong>
              Temporary Restriction
            </strong>

            <p>
              FoodKindl may temporarily restrict posting,
              messaging, Connect features or gathering access.
            </p>
          </article>


          <article>
            <strong>
              Suspension
            </strong>

            <p>
              Serious or repeated violations may result in
              temporary suspension of the account.
            </p>
          </article>


          <article>
            <strong>
              Account Termination
            </strong>

            <p>
              Severe abuse, fraud, threats, illegal activity
              or repeated violations may result in permanent
              account termination.
            </p>
          </article>

        </div>

      </section>


      {/* =====================================================
          IMPORTANT NOTE
      ===================================================== */}

      <section className="guidelines-note">

        <ShieldCheck size={26} />

        <div>
          <strong>
            Community safety is shared responsibility
          </strong>

          <p>
            Verification, reporting tools and community rules
            can reduce risk, but they cannot guarantee another
            person's behaviour or the complete safety of any
            online or in-person interaction.
          </p>
        </div>

      </section>


      {/* =====================================================
          FOOTNOTE
      ===================================================== */}

      <div className="guidelines-footer-note">

        <p>
          These guidelines may be updated as FoodKindl grows
          and new community features are introduced.
        </p>

        <span>
          © 2026 KnightnKindle Pvt Ltd.
        </span>

      </div>

    </main>
  );
}