import {
  ArrowLeft,
  BriefcaseBusiness,
  Code2,
  HeartHandshake,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";


export default function Careers() {
  const workAreas = [
    {
      icon: <Code2 size={28} />,
      title: "Technology",
      text:
        "Build reliable, thoughtful products that help people discover, connect, communicate and share through food.",
    },
    {
      icon: <Sparkles size={28} />,
      title: "Product",
      text:
        "Shape simple, human-centred experiences across FoodKindl Connect, CommuniQ, AI Kitchen and future products.",
    },
    {
      icon: <Users size={28} />,
      title: "Community",
      text:
        "Help create meaningful local communities where people feel welcome, respected and inspired to participate.",
    },
    {
      icon: <Megaphone size={28} />,
      title: "Marketing & Creators",
      text:
        "Tell the FoodKindl story, support food creators and build partnerships that grow the community responsibly.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Trust & Safety",
      text:
        "Design safeguards, community standards and support systems that make online and in-person interactions safer.",
    },
    {
      icon: <BriefcaseBusiness size={28} />,
      title: "Operations",
      text:
        "Help FoodKindl scale smoothly across partnerships, community operations, customer support and future initiatives.",
    },
  ];


  return (
    <main className="careers-page">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="careers-topbar">

        <Link
          to="/"
          className="careers-back-link"
        >
          <ArrowLeft size={18} />
          Back to FoodKindl
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="careers-hero">

        <div className="careers-pill">
          <HeartHandshake size={16} />
          BUILD WITH PURPOSE
        </div>


        <h1>
          Help us build a world where
          <span> food brings people closer.</span>
        </h1>


        <p>
          FoodKindl is building a human-centred food community
          where technology, shared meals and meaningful
          connections come together.
        </p>

      </section>


      {/* =====================================================
          MISSION
      ===================================================== */}

      <section className="careers-mission">

        <div className="careers-section-number">
          01
        </div>

        <div>

          <span className="careers-kicker">
            WHY FOODKINDL
          </span>

          <h2>
            Work on something that
            matters beyond the screen.
          </h2>

        </div>


        <p>
          We are looking for thoughtful people who care about
          technology, food, community and positive social impact.
          Our goal is to build products that help people discover
          one another, cook together, share knowledge and form
          stronger local communities.
        </p>

      </section>


      {/* =====================================================
          WORK AREAS
      ===================================================== */}

      <section className="careers-work-section">

        <div className="careers-section-header">

          <span>
            Where you could contribute
          </span>

          <h2>
            Different skills.
            <br />
            One shared mission.
          </h2>

        </div>


        <div className="careers-grid">

          {workAreas.map(
            (
              area,
              index
            ) => (

              <article
                className="careers-card"
                key={area.title}
              >

                <span className="careers-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>


                <div className="careers-card-icon">
                  {area.icon}
                </div>


                <h3>
                  {area.title}
                </h3>


                <p>
                  {area.text}
                </p>

              </article>

            )
          )}

        </div>

      </section>


      {/* =====================================================
          OPENINGS
      ===================================================== */}

      <section className="careers-openings">

        <div className="careers-openings-copy">

          <span className="careers-kicker">
            CURRENT OPPORTUNITIES
          </span>

          <h2>
            No open roles right now.
          </h2>

          <p>
            We do not have any open positions currently.
            You may still share your profile with us for
            future opportunities.
          </p>

        </div>


        <div className="careers-interest-card">

          <div className="careers-interest-icon">
            <BriefcaseBusiness size={30} />
          </div>


          <h3>
            Interested in joining later?
          </h3>


          <p>
            Send us a short introduction, the type of work
            you are interested in, and a link to your
            LinkedIn, portfolio or resume.
          </p>


          <a
            href="mailto:careers@foodkindl.com"
            className="careers-primary-button"
          >
            careers@foodkindl.com
          </a>

          <small>
            Replace this email if you use a different
            official careers address.
          </small>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="careers-values">

        <div>
          <span className="careers-kicker">
            HOW WE WANT TO BUILD
          </span>

          <h2>
            Thoughtfully.
            Responsibly.
            Human-first.
          </h2>
        </div>


        <div className="careers-values-list">

          <div>
            <strong>
              Start with people
            </strong>

            <p>
              Build around real human needs rather than
              adding complexity for its own sake.
            </p>
          </div>


          <div>
            <strong>
              Earn trust
            </strong>

            <p>
              Treat privacy, safety and community responsibility
              as product fundamentals.
            </p>
          </div>


          <div>
            <strong>
              Stay curious
            </strong>

            <p>
              Learn continuously from members, creators,
              partners and the communities we serve.
            </p>
          </div>


          <div>
            <strong>
              Create with care
            </strong>

            <p>
              Sweat the details while keeping experiences
              simple, useful and welcoming.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          COMPANY
      ===================================================== */}

      <section className="careers-company-note">

        <strong>
          FoodKindl
        </strong>

        <p>
          FoodKindl is a product and community initiative
          of KnightnKindle Pvt Ltd.
        </p>

      </section>

    </main>
  );
}