import {
  Accessibility,
  ArrowLeft,
  Bell,
  Eye,
  Globe2,
  LockKeyhole,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Utensils,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";


export default function Settings() {

  const [
    theme,
    setTheme,
  ] = useState(
    localStorage.getItem(
      "foodkindl_theme"
    ) || "dark"
  );


  const [
    reducedMotion,
    setReducedMotion,
  ] = useState(
    localStorage.getItem(
      "foodkindl_reduced_motion"
    ) === "true"
  );


  const [
    largeText,
    setLargeText,
  ] = useState(
    localStorage.getItem(
      "foodkindl_large_text"
    ) === "true"
  );


  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);


  const [
    messageNotifications,
    setMessageNotifications,
  ] = useState(true);


  const [
    gatheringNotifications,
    setGatheringNotifications,
  ] = useState(true);


  const [
    profileVisibility,
    setProfileVisibility,
  ] = useState("community");


  const [
    locationVisibility,
    setLocationVisibility,
  ] = useState("approximate");


  const [
    whoCanMessage,
    setWhoCanMessage,
  ] = useState("connections");


  // =========================================================
  // APPLY THEME
  // =========================================================

  useEffect(() => {

    localStorage.setItem(
      "foodkindl_theme",
      theme
    );


    const root =
      document.documentElement;


    if (
      theme === "system"
    ) {

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;


      root.setAttribute(
        "data-theme",
        prefersDark
          ? "dark"
          : "light"
      );

    } else {

      root.setAttribute(
        "data-theme",
        theme
      );

    }

  }, [theme]);


  // =========================================================
  // ACCESSIBILITY
  // =========================================================

  useEffect(() => {

    localStorage.setItem(
      "foodkindl_reduced_motion",
      String(
        reducedMotion
      )
    );


    document.documentElement
      .classList.toggle(
        "reduced-motion",
        reducedMotion
      );

  }, [reducedMotion]);


  useEffect(() => {

    localStorage.setItem(
      "foodkindl_large_text",
      String(
        largeText
      )
    );


    document.documentElement
      .classList.toggle(
        "large-text",
        largeText
      );

  }, [largeText]);


  return (
    <main className="settings-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="settings-topbar">

        <Link
          to="/dashboard"
          className="settings-back-link"
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

      <section className="settings-hero">

        <div className="settings-pill">
          <Palette
            size={16}
          />

          PERSONALISE FOODKINDL
        </div>


        <h1>
          Your <span>Settings</span>
        </h1>


        <p>
          Personalise how FoodKindl looks, communicates
          with you, and handles your privacy preferences.
        </p>

      </section>


      <div className="settings-layout">

        {/* ===================================================
            APPEARANCE
        =================================================== */}

        {/* <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Palette size={24} />
            </div>

            <div>

              <h2>
                Appearance
              </h2>

              <p>
                Choose how FoodKindl looks on your device.
              </p>

            </div>

          </div>


          <div className="theme-selector">

            <button
              type="button"
              className={
                theme === "light"
                  ? "theme-option active"
                  : "theme-option"
              }
              onClick={() =>
                setTheme("light")
              }
            >
              <Sun size={20} />

              <span>
                Light
              </span>
            </button>


            <button
              type="button"
              className={
                theme === "dark"
                  ? "theme-option active"
                  : "theme-option"
              }
              onClick={() =>
                setTheme("dark")
              }
            >
              <Moon size={20} />

              <span>
                Dark
              </span>
            </button>


            <button
              type="button"
              className={
                theme === "system"
                  ? "theme-option active"
                  : "theme-option"
              }
              onClick={() =>
                setTheme("system")
              }
            >
              <Palette size={20} />

              <span>
                System
              </span>
            </button>

          </div>

        </section> */}


        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}
{/* 
        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Bell size={24} />
            </div>

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Choose which FoodKindl updates you receive.
              </p>

            </div>

          </div>


          <SettingToggle
            title="Email notifications"
            description="Important account and community updates."
            enabled={emailNotifications}
            onChange={setEmailNotifications}
          />


          <SettingToggle
            title="Message notifications"
            description="Get notified when someone messages you."
            enabled={messageNotifications}
            onChange={setMessageNotifications}
          />


          <SettingToggle
            title="Gathering reminders"
            description="Reminders for upcoming Food Invites and gatherings."
            enabled={gatheringNotifications}
            onChange={setGatheringNotifications}
          />

        </section> */}


        {/* ===================================================
            PRIVACY
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Eye size={24} />
            </div>

            <div>

              <h2>
                Privacy
              </h2>

              <p>
                Control who can see and contact you.
              </p>

            </div>

          </div>


          <label className="settings-select-row">

            <div>
              <strong>
                Profile visibility
              </strong>

              <span>
                Decide who can view your profile.
              </span>
            </div>


            <select
              value={
                profileVisibility
              }
              onChange={
                (
                  event
                ) =>
                  setProfileVisibility(
                    event.target.value
                  )
              }
            >
              <option value="community">
                FoodKindl community
              </option>

              <option value="connections">
                Connections only
              </option>
            </select>

          </label>


          <label className="settings-select-row">

            <div>
              <strong>
                Location visibility
              </strong>

              <span>
                Control how your location is displayed.
              </span>
            </div>


            <select
              value={
                locationVisibility
              }
              onChange={
                (
                  event
                ) =>
                  setLocationVisibility(
                    event.target.value
                  )
              }
            >
              <option value="approximate">
                Approximate only
              </option>

              <option value="city">
                City only
              </option>

              <option value="hidden">
                Hidden
              </option>
            </select>

          </label>


          <label className="settings-select-row">

            <div>
              <strong>
                Who can message me?
              </strong>

              <span>
                Control private messaging access.
              </span>
            </div>


            <select
              value={
                whoCanMessage
              }
              onChange={
                (
                  event
                ) =>
                  setWhoCanMessage(
                    event.target.value
                  )
              }
            >
              <option value="connections">
                Connections only
              </option>

              <option value="community">
                Verified members
              </option>
            </select>

          </label>

        </section>


        {/* ===================================================
            FOOD PREFERENCES
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Utensils size={24} />
            </div>

            <div>

              <h2>
                Food Preferences
              </h2>

              <p>
                Manage dietary and food interests from your
                profile.
              </p>

            </div>

          </div>


          <Link
            to="/profile"
            className="settings-link-row"
          >
            <div>

              <strong>
                Dietary preferences
              </strong>

              <span>
                Vegetarian, vegan, halal, keto and more.
              </span>

            </div>

            <span>
              Manage →
            </span>
          </Link>


          <Link
            to="/profile"
            className="settings-link-row"
          >
            <div>

              <strong>
                Food interests
              </strong>

              <span>
                Update cuisines, cooking interests and
                preferences.
              </span>

            </div>

            <span>
              Manage →
            </span>
          </Link>

        </section>


        {/* ===================================================
            ACCESSIBILITY
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Accessibility
                size={24}
              />
            </div>

            <div>

              <h2>
                Accessibility
              </h2>

              <p>
                Adjust FoodKindl to make it more comfortable
                to use.
              </p>

            </div>

          </div>


          <SettingToggle
            title="Larger text"
            description="Increase the overall interface text size."
            enabled={largeText}
            onChange={setLargeText}
          />


          <SettingToggle
            title="Reduce motion"
            description="Reduce animations and moving effects."
            enabled={reducedMotion}
            onChange={setReducedMotion}
          />

        </section>


        {/* ===================================================
            LANGUAGE
        =================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Globe2 size={24} />
            </div>

            <div>

              <h2>
                Language
              </h2>

              <p>
                Choose your FoodKindl interface language.
              </p>

            </div>

          </div>


          <label className="settings-select-row">

            <div>

              <strong>
                Display language
              </strong>

              <span>
                More languages can be added later.
              </span>

            </div>


            <select
              defaultValue="en"
            >
              <option value="en">
                English
              </option>
            </select>

          </label>

        </section>


        {/* ===================================================
            ACCOUNT
        =================================================== */}

        <section className="settings-card settings-account-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <LockKeyhole
                size={24}
              />
            </div>

            <div>

              <h2>
                Account
              </h2>

              <p>
                Manage your FoodKindl account and security.
              </p>

            </div>

          </div>


          <Link
            to="/profile"
            className="settings-link-row"
          >
            <div>

              <strong>
                Account information
              </strong>

              <span>
                Update your profile and account details.
              </span>

            </div>

            <span>
              Manage →
            </span>
          </Link>


          <Link
            to="/safety-verification"
            className="settings-link-row"
          >
            <div>

              <strong>
                Safety &amp; Verification
              </strong>

              <span>
                Identity verification, blocked members and
                safety controls.
              </span>

            </div>

            <span>
              Manage →
            </span>
          </Link>


          <Link
            to="/contact"
            className="settings-link-row"
          >
            <div>

              <strong>
                Account deletion
              </strong>

              <span>
                Request deletion of your FoodKindl account.
              </span>

            </div>

            <span>
              Contact →
            </span>
          </Link>

        </section>

      </div>

    </main>
  );
}


// ============================================================
// TOGGLE COMPONENT
// ============================================================

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}) {

  return (
    <div className="settings-toggle-row">

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <button
        type="button"
        className={
          enabled
            ? "settings-toggle enabled"
            : "settings-toggle"
        }
        onClick={() =>
          onChange(
            !enabled
          )
        }
        aria-pressed={
          enabled
        }
      >

        <span />

      </button>

    </div>
  );
}