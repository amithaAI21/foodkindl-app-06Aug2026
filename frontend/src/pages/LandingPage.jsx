import {
  ArrowRight,
  ChefHat,
  Heart,
  MapPin,
  MessageCircle,
  PackageCheck,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Utensils,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import SectionHeading from "../components/SectionHeading";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    icon: <Users />,
    number: "01",
    title: "Discover People Nearby",
    text: "Create your profile, add your dietary preferences and food interests, and discover like-minded people in your local community.",
  },
  {
    icon: <Send />,
    number: "02",
    title: "Connect and Send a Food Invite",
    text: "Message individuals or groups, choose a date, cuisine, menu, and venue, and send them a Food Invite. You can cook together at home, meet in a shared space, or plan a meal at a local eatery. For your first gathering, we recommend meeting as a group in a comfortable public or shared space.",
  },
  {
    icon: <Utensils />,
    number: "03",
    title: "Cook, Meet, and Eat Together",
    text: "Meet at the planned venue, prepare a meal together, or explore a local restaurant. Share good food, conversations, laughter, and memorable moments.",
  },
  {
    icon: <Heart />,
    number: "04",
    title: "Share the Experience",
    text: "Post photos and videos, share stories from your gathering, tag the people you met, and inspire others in the community. Food enthusiasts can also share their favourite recipes, cooking tips, and food discoveries for others to try.",
  },
];


export default function LandingPage() {
  // const [stats, setStats] = useState({
  //   members: 0,
  //   meals_shared: 0,
  //   waste_reduced_kg: 0,
  // });
  const [statsLoading, setStatsLoading] = useState(true);
  const { user } = useAuth();

  const videoRef = useRef(null);
  const [videoStarted, setVideoStarted] = useState(false);

  function playStoryVideo() {
    setVideoStarted(true);

    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    });
  }

//   useEffect(() => {
//   async function loadStats() {
//     try {
//       const response = await api.get("/stats/");
//       setStats(response.data);
//     } catch (error) {
//       console.error(
//         "Unable to load statistics:",
//         error.response?.data || error
//       );
//     } finally {
//       setStatsLoading(false);
//     }
//   }

//   loadStats();

//   const intervalId = setInterval(loadStats, 30000);

//   return () => clearInterval(intervalId);
// }, []);

  const [waitlist, setWaitlist] = useState({ full_name: "", email: "", city: "" });
  const [waitlistMessage, setWaitlistMessage] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactMessage, setContactMessage] = useState("");

  async function submitWaitlist(event) {
    event.preventDefault();
    try {
      await api.post("/website/waitlist/", waitlist);
      setWaitlistMessage("You are on the FoodKindl early-access list.");
      setWaitlist({ full_name: "", email: "", city: "" });
    } catch (error) {
      setWaitlistMessage(
        error.response?.data?.email?.[0] || "We could not add you right now."
      );
    }
  }

  async function submitContact(event) {
    event.preventDefault();
    try {
      await api.post("/website/contact/", contact);
      setContactMessage("Thank you. Your message has been received.");
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch {
      setContactMessage("We could not send your message. Please try again.");
    }
  }

  return (
    <main>
      <section className="hero-section" id="connect">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-copy">
          <div className="status-pill">
            <span />
              Platform Now Live
          </div>

          <h1>
            Connect with people
            <br />
            Through <span>Food</span>
          </h1>

          <p>
            Discover people through food. Cook together, eat together, and create lasting connections.
            Share recipes, photos, and videos—all in one human-centred food community.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/register">
              Explore FoodKindl Connect <ArrowRight size={18} />
            </Link>
            <a className="secondary-button" href="#how-it-works">
              How It Works
            </a>
          </div>
        </div>

        <div className="hero-visual">
  <div className="hero-floating-wrapper">
    <div className="hero-main-card">
      <img
        src="/images/homepage1.jpg"
        alt="Healthy FoodKindl meal"
        className="hero-main-image"
      />
    </div>

    {/* <div className="hero-floating-image hero-floating-one">
      <img
        src="/images/food2.png"
        alt="Healthy meal"
      />
    </div> */}
{/* 
    <div className="hero-floating-image hero-floating-two">
      <img
        src="/images/food3.png"
        alt="Fresh food bowl"
      />
    </div> */}
  </div>
</div>

        {/* <div className="stats-row">
          <StatCard
            value={statsLoading ? "..." : stats.members}
            label="Active members"
          />
          <StatCard
            value={statsLoading ? "..." : stats.meals_shared}
            label="Meals shared"
          />
          <StatCard
            value={
              statsLoading
                ? "..."
                : `${Number(stats.waste_reduced_kg || 0).toFixed(2)} kg`
            }
            label="Waste reduced"
          />
        </div> */}
      </section>
      

      <section className="content-section" id="how-it-works">
        <SectionHeading
          // eyebrow="Simple flow"
          title="How FoodKindl"
          accent="Connect Works"
          description="In four simple steps, turn a shared love of food into meaningful connections, memorable meals, and new friendships."
        />

        <div className="feature-grid four">
          {steps.map((step) => (
            <article className="feature-card" key={step.number}>
              <div className="feature-top">
                <span className="icon-box">{step.icon}</span>
                <span className="step-number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================
          LEARN, CREATE AND SHARE
      ========================================================= */}

     <section
  className="content-section learn-create-section"
  id="learn-create-share"
>
  {/* =====================================================
      HEADER
  ===================================================== */}

  <div className="learn-create-header">

    <div className="learn-create-pill">
      <Heart size={15} fill="currentColor" />
      FOR FOOD LOVERS, BY FOOD LOVERS
    </div>

    <h2>
      Learn, Create and <span>Share</span>
    </h2>

    <div className="learn-create-divider">
      <span />
      <Utensils size={25} />
      <span />
    </div>

    <p>
      Get personalised recipes with FoodKindl AI and
      discover food content shared by your community-all
      on one platform dedicated entirely to food.
    </p>

  </div>


  {/* =====================================================
      FEATURE CARDS
  ===================================================== */}

  <div className="learn-create-grid">


    {/* ===================================================
        FOODKINDL AI
    =================================================== */}

    <article className="learn-image-card">

      <img
        src="/images/food11.png"
        alt="FoodKindl AI personalised recipes"
        className="learn-image-card-bg"
      />

      <div className="learn-image-card-overlay" />


      <div className="learn-image-card-content">

        <div className="learn-circle-icon">
          <Sparkles size={33} />
        </div>


        <h3>
          FoodKindl AI
        </h3>


        <div className="learn-small-line" />


        <p>
          Get personalised recipes based on
          your dietary preferences and
          available ingredients.
        </p>


        {/* Logged in → AI Kitchen
            Logged out → Login */}

        <Link
          to={
            user
              ? "/ai-kitchen"
              : "/login"
          }
          className="learn-image-button"
        >
          Smart recipes for you

          <ArrowRight size={19} />
        </Link>

      </div>

    </article>


    {/* ===================================================
        FOOD VIDEOS
    =================================================== */}

    <article className="learn-image-card">

      <img
        src="/images/food22.png"
        alt="Food preparation videos"
        className="learn-image-card-bg video-image-position"
      />

      <div className="learn-image-card-overlay" />


      <div className="learn-image-card-content">

        <div className="learn-circle-icon">
          <Play size={34} />
        </div>


        <h3>
          Food Videos
        </h3>


        <div className="learn-small-line" />


        <p>
          View photos, recipes and food-preparation
          videos shared by your connections,
          influencers, chefs and food creators.
          Discover cooking tips, food reviews and
          regional dishes.
        </p>


        {/* Logged in → Community
            Logged out → Login */}

        <Link
          to={
            user
              ? "/community"
              : "/login"
          }
          className="learn-image-button"
        >
          Watch &amp; share

          <ArrowRight size={19} />
        </Link>

      </div>

    </article>

  </div>

</section>

      <section className="showcase-section">
        <SectionHeading
          eyebrow="Product showcase"
          title="The"
          accent="FoodKindl App"
          description="FoodKindl is a food-focused social community where people can connect online and come together in real life through cooking and shared meals."
        />

        <div className="phone-showcase">
          <div className="phone-tabs">
            <span className="active">Host Profile</span>
            <span>Food Invite</span>
            <span>Group Chat</span>
          </div>

          <div className="phone-shell">
            <div className="phone-notch" />
            <div className="profile-mini">
              <div className="avatar-mini">LN</div>
              <div>
                <strong>Lakshmi Nair</strong>
                <small>UI Designer · 2.4 km away</small>
              </div>
            </div>
            <div className="tag-row">
              <span>Vegan</span><span>Italian Food</span><span>Weekend Host</span>
            </div>
            <div className="meal-photo">
              <Utensils size={42} />
              <strong>Mexican Taco Night</strong>
            </div>
            <p>
                Love cooking spices from scratch. Looking for clean eaters to
                co-cook and share ingredients this Sunday.
              </p>

              <div className="coming-soon-tag">
                🚀 Coming Soon
                <small>Mobile App Coming Soon</small>
              </div>

              <button disabled className="coming-soon-button">
                View Active Invites
              </button>
          </div>
        </div>

        <div className="story-block">
  <div>
    <div className="eyebrow left">
      Human-centric food platform
    </div>

    <h3>Social Dining, Simplified.</h3>

    <p>
      
We believe meaningful connections often begin around food- cooking together, sharing a meal, and enjoying warm conversations that can grow into lasting friendships.

FoodKindl makes it easy for individuals and groups to discover like-minded people, plan food gatherings, and build genuine relationships. Members can also share recipes, articles, photos, and cooking videos to inspire the wider food community.
    </p>
  </div>

  <div className="video-card">

  <video
    ref={videoRef}
    className="story-video"
    preload="metadata"
    poster="/images/video-thumbnail.jpg"
    controls={videoStarted}
  >
    <source
      src="/videos/video1.mp4"
      type="video/mp4"
    />

    Your browser does not support the video tag.
  </video>


  {!videoStarted && (

    <div className="story-video-overlay">

      <button
        type="button"
        className="story-video-play"
        onClick={playStoryVideo}
        aria-label="Play FoodKindl video"
      >
        <Play
          size={27}
          fill="currentColor"
        />
      </button>


      <div className="story-video-title">
        See How FoodKindl Brings People Together
      </div>

    </div>

  )}

</div>
</div>
      </section>

      {/* <section className="content-section redistribution" id="food-service"> */}
        {/* <SectionHeading
          eyebrow="Zero waste protocol"
          title="Redistribution"
          accent="Engine"
          description="A high-efficiency pipeline connecting restaurants, caterers, and individuals with verified volunteers."
        /> */}

        {/* <div className="node-grid">
          <article className="node-card">
            <PackageCheck />
            <h3>Node 01: Producers</h3>
            <p>Restaurants, caterers, households, and event venues list safe surplus meals.</p>
          </article>
          <article className="node-card highlighted">
            <Truck />
            <h3>Node 02: Transit</h3>
            <p>Verified local volunteers coordinate timely pickup and responsible transport.</p>
          </article>
          <article className="node-card">
            <MapPin />
            <h3>Node 03: Delivery</h3>
            <p>Meals reach intended communities while freshness and dignity are protected.</p>
          </article>
        </div>
      </section> */}

      <section className="content-section safety safety-premium">

  <div className="safety-intro">

    <div>
      <div className="eyebrow left">
        SAFETY FIRST PROTOCOL
      </div>

      <h2>
        Trust &amp; <span>Safety</span>
      </h2>

      <p className="safety-subtitle">
        Built to help every FoodKindl connection feel
        safer, more respectful, and more comfortable.
      </p>
    </div>


    <p className="safety-description">
      Connecting with new people should never compromise
      peace of mind. FoodKindl uses layered safeguards,
      verified profiles, and safety-first controls to
      support a respectful food community.
    </p>

  </div>


  <div className="safety-card-grid">


    {/* VERIFIED PROFILES */}

    <article className="safety-feature-card">

      <div className="safety-card-number">
        01
      </div>

      <div className="safety-icon verified">
        <UserCheck size={28} />
      </div>

      <h3>
        Verified Profiles
      </h3>

      <p>
        Government-issued photo ID can be required before
        members join selected private gatherings.
      </p>

      <div className="safety-card-footer">
        Identity-backed trust
      </div>

    </article>


    {/* WOMEN ONLY */}

    <article className="safety-feature-card">

      <div className="safety-card-number">
        02
      </div>

      <div className="safety-icon women">
        <ShieldCheck size={28} />
      </div>

      <h3>
        Women-Only Preference
      </h3>

      <p>
        Hosts can limit applicable gatherings to verified
        female community members for added comfort and safety.
      </p>

      <div className="safety-card-footer">
        Comfort-led participation
      </div>

    </article>


    {/* SOS - COMING SOON */}

    <article className="safety-feature-card safety-coming-soon">

      <div className="safety-card-number">
        03
      </div>

      <div className="safety-coming-badge">
        Coming Soon
      </div>

      <div className="safety-icon sos">
        <MessageCircle size={28} />
      </div>

      <h3>
        One-Tap SOS
      </h3>

      <p>
        A future emergency safety control designed to quickly
        alert trusted contacts during an active gathering.
      </p>

      <div className="safety-card-footer">
        Emergency support layer
      </div>

    </article>

  </div>

</section>

      {/* <section className="content-section products" id="products">
        <SectionHeading
          eyebrow="Product vertical expansion"
          title="Future"
          accent="Vision"
          description="Cooking together is the starting point. FoodKindl can grow into a sustainable food and serveware ecosystem."
        />

        <div className="product-grid">

  <article className="product-card">
    <div className="product-image">
      <img
        src="/images/species.png"
        alt="FoodKindl Spices"
      />

      <div className="coming-overlay">
        Coming Soon
      </div>
    </div>

    <div>
      <h3>FoodKindl Spices</h3>

      <p>
        Curated spice bundles designed with local chefs to bring aroma,
        colour, and culinary stories into homes.
      </p>

      <small>Status: Planned Launch</small>
    </div>
  </article> */}

  {/* <article className="product-card">
    <div className="product-image">
      <img
        src="/images/frontend\public\images\ceramic.png"
        alt="Sustainable Serveware"
      />

      <div className="coming-overlay">
        Coming Soon
      </div>
    </div>

    <div>
      <h3>Sustainable Serveware</h3>

      <p>
        Eco-conscious serving pieces made using clay, bamboo, and responsibly
        sourced materials.
      </p>

      <small>Status: Planned Launch</small>
    </div>
  </article>

</div>
      </section> */}

      {/* <section className="form-section" id="waitlist">
        <div className="form-card">
          <SectionHeading
            eyebrow="Exclusive reservation"
            title="Join the FoodKindl"
            accent="Community"
            description="Register for early access and secure your place in the local FoodKindl community."
          />

          <form onSubmit={submitWaitlist}>
            <div className="form-row">
              <label>
                Full name
                <input
                  value={waitlist.full_name}
                  onChange={(e) => setWaitlist({ ...waitlist, full_name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={waitlist.email}
                  onChange={(e) => setWaitlist({ ...waitlist, email: e.target.value })}
                  required
                  placeholder="johndoe@example.com"
                />
              </label>
            </div>

            <label>
              Select your city
              <input
                value={waitlist.city}
                onChange={(e) => setWaitlist({ ...waitlist, city: e.target.value })}
                required
                placeholder="Bengaluru"
              />
            </label>

            <button className="primary-button full">Get Early Access</button>
            {waitlistMessage && <p className="form-message">{waitlistMessage}</p>}
          </form>
        </div>
      </section> */}

      

      <footer className="site-footer">

  {/* ================================
      FOOTER LINKS
  ================================= */}

  <div className="footer-links-grid">

    {/* COMPANY */}
    <div className="footer-column">
      <h4>Company</h4>

      <Link to="/about">
        About FoodKindl
      </Link>

      <Link to="/careers">
        Careers
      </Link>

      <Link to="/contact">
        Contact Us
      </Link>
    </div>


    {/* COMMUNITY & SAFETY */}
    <div className="footer-column">
      <h4>Community &amp; Safety</h4>

      <Link to="/community-guidelines">
        Community Guidelines
      </Link>

      <Link to="/safety">
        Safety Centre
      </Link>
    </div>


    {/* LEGAL */}
    <div className="footer-column">
      <h4>Legal</h4>

      <Link to="/privacy">
        Privacy Policy
      </Link>

      <Link to="/terms">
        Terms of Use
      </Link>
    </div>


    {/* SOCIAL MEDIA
        Keep this section hidden until you have
        official FoodKindl social accounts.

        When ready, uncomment and replace URLs.
    */}

    {/*
    <div className="footer-column">
      <h4>Follow FoodKindl</h4>

      <a
        href="YOUR_INSTAGRAM_URL"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="FoodKindl on Instagram"
      >
        Instagram
      </a>

      <a
        href="YOUR_YOUTUBE_URL"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="FoodKindl on YouTube"
      >
        YouTube
      </a>

      <a
        href="YOUR_LINKEDIN_URL"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="FoodKindl on LinkedIn"
      >
        LinkedIn
      </a>

      <a
        href="YOUR_FACEBOOK_URL"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="FoodKindl on Facebook"
      >
        Facebook
      </a>
    </div>
    */}

  </div>


  {/* ================================
      DIVIDER
  ================================= */}

  <div className="footer-divider" />


  {/* ================================
      LOGO
  ================================= */}

  <div className="footer-brand">

    <img
      src="/images/icon.png"
      alt="FoodKindl"
      className="footer-logo-image"
    />

    <p className="footer-tagline">
      Where Food Connects People &amp; Planet
    </p>

  </div>


  {/* ================================
      COPYRIGHT
  ================================= */}

  <div className="footer-bottom">

    <p>
      © 2026 KnightnKindle Pvt Ltd.
      All rights reserved.
    </p>

    <p className="footer-ownership">
      FoodKindl and its associated name, logo and
      visual identity are owned by KnightnKindle Pvt Ltd.
    </p>


    {/* <div className="footer-bottom-links">

      <Link to="/privacy">
        Privacy Policy
      </Link> */}

      {/* <span>•</span>

      <Link to="/terms">
        Terms of Use
      </Link>

      <span>•</span> */}
{/* 
      <Link to="/community-guidelines">
        Community Guidelines
      </Link> */}

      {/* <span>•</span> */}

      {/* <Link to="/safety">
        Safety Centre
      </Link> */}

    </div>

  {/* </div> */}

</footer>
    </main>
  );
}