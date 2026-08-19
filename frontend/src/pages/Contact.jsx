import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CircleHelp,
  Handshake,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Send,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";


export default function Contact() {
  const [
    form,
    setForm,
  ] = useState({
    full_name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const enquiryTypes = [
    {
      value: "general",
      label: "General enquiry",
    },
    {
      value: "account_support",
      label: "Account support",
    },
    {
      value: "safety",
      label: "Safety concern",
    },
    {
      value: "report",
      label: "Report a user or content",
    },
    {
      value: "partnership",
      label: "Partnership",
    },
    {
      value: "creator",
      label: "Creator collaboration",
    },
    {
      value: "careers",
      label: "Careers",
    },
    {
      value: "media",
      label: "Media enquiry",
    },
  ];


  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    setForm(
      (
        previous
      ) => ({
        ...previous,
        [name]: value,
      })
    );
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSubmitting(true);
    setStatusMessage("");
    setError("");


    try {
      await api.post(
        "/website/contact/",
        {
          name:
            form.full_name,

          email:
            form.email,

          phone:
            form.phone,

          subject:
            form.reason,

          message:
            form.message,
        }
      );


      setStatusMessage(
        "Thank you. Your message has been received. Our team will get back to you as soon as possible."
      );


      setForm({
        full_name: "",
        email: "",
        phone: "",
        reason: "",
        message: "",
      });

    } catch (
      requestError
    ) {
      console.error(
        "CONTACT FORM ERROR:",
        requestError
      );


      setError(
        requestError?.response?.data?.detail ||
        "We could not send your message right now. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="contact-page">

      {/* =====================================================
          TOP
      ===================================================== */}

      <div className="contact-topbar">

        <Link
          to="/"
          className="contact-back-link"
        >
          <ArrowLeft size={18} />
          Back to FoodKindl
        </Link>

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">

        <div className="contact-pill">
          <HeartHandshake size={16} />
          WE'D LOVE TO HEAR FROM YOU
        </div>


        <h1>
          Contact <span>FoodKindl</span>
        </h1>


        <p>
          Have a question, need support, want to report a
          concern, or have an idea for collaboration?
          Send us a message and choose the category that
          best matches your enquiry.
        </p>

      </section>


      {/* =====================================================
          CONTACT AREA
      ===================================================== */}

      <section className="contact-layout">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="contact-information">

          <div className="contact-section-label">
            GET IN TOUCH
          </div>


          <h2>
            Tell us how we can help.
          </h2>


          <p className="contact-information-intro">
            We route enquiries to the appropriate FoodKindl
            team so that account, community, partnership and
            safety concerns can be handled appropriately.
          </p>


          <div className="contact-info-grid">

            <article className="contact-info-card">

              <div className="contact-info-icon">
                <Mail size={23} />
              </div>

              <div>
                <span>
                  Support Email
                </span>

                <strong>
                  support@foodkindl.com
                </strong>

                <p>
                  For general questions and
                  account-related support.
                </p>
              </div>

            </article>

{/* 
            <article className="contact-info-card">

              <div className="contact-info-icon">
                <Building2 size={23} />
              </div> */}

              {/* <div>
                <span>
                  Company
                </span>

                <strong>
                  KnightnKindle Pvt Ltd
                </strong>

                <p>
                  FoodKindl is operated by
                  KnightnKindle Pvt Ltd.
                </p>
              </div> */}

            {/* </article> */}


            <article className="contact-info-card">

              <div className="contact-info-icon">
                <MapPin size={23} />
              </div>

              <div>
                <span>
                  Business Location
                </span>

                <strong>
                  Bengaluru, India
                </strong>

                <p>
                  Replace this with your registered
                  office address before publishing.
                </p>
              </div>

            </article>


            <article className="contact-info-card">

              <div className="contact-info-icon">
                <CircleHelp size={23} />
              </div>

              <div>
                <span>
                  Response Time
                </span>

                <strong>
                  Usually within 2 business days
                </strong>

                <p>
                  Safety-related reports may be
                  prioritised separately.
                </p>
              </div>

            </article>

          </div>


          {/* ===============================================
              EMERGENCY NOTICE
          =============================================== */}

          <div className="contact-emergency-card">

            <ShieldAlert size={26} />

            <div>

              <strong>
                Emergency situations
              </strong>

              <p>
                FoodKindl does not provide emergency
                services. If you are in immediate danger,
                contact your local emergency services.
              </p>

            </div>

          </div>

        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        <div className="contact-form-card">

          <div className="contact-form-heading">

            <span>
              SEND A MESSAGE
            </span>

            <h2>
              How can we help?
            </h2>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="contact-form-row">

              <label>
                Full name

                <div className="contact-input-wrap">
                  <UserRound size={18} />

                  <input
                    type="text"
                    name="full_name"
                    value={
                      form.full_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>

              </label>


              <label>
                Email address

                <div className="contact-input-wrap">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>

              </label>

            </div>


            <label>
              Phone number
              <small>
                Optional
              </small>

              <div className="contact-input-wrap">
                <Phone size={18} />

                <input
                  type="tel"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="+91 ..."
                />
              </div>
            </label>


            <label>
              Reason for contacting

              <select
                name="reason"
                value={
                  form.reason
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select a category
                </option>

                {
                  enquiryTypes.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </option>
                    )
                  )
                }

              </select>
            </label>


            <label>
              Message

              <textarea
                name="message"
                value={
                  form.message
                }
                onChange={
                  handleChange
                }
                placeholder="Tell us how we can help..."
                rows={7}
                required
              />
            </label>


            {
              error &&
              (
                <p className="contact-error">
                  {error}
                </p>
              )
            }


            {
              statusMessage &&
              (
                <p className="contact-success">
                  {statusMessage}
                </p>
              )
            }


            <button
              type="submit"
              className="contact-submit-button"
              disabled={
                submitting
              }
            >
              {
                submitting
                  ? "Sending..."
                  : (
                      <>
                        Send Message
                        <Send size={18} />
                      </>
                    )
              }
            </button>

          </form>

        </div>

      </section>


      {/* =====================================================
          ENQUIRY CATEGORIES
      ===================================================== */}

      <section className="contact-categories-section">

        <div className="contact-categories-heading">

          <span>
            THE RIGHT TEAM
          </span>

          <h2>
            What can you contact us about?
          </h2>

        </div>


        <div className="contact-category-grid">

          <div className="contact-category">
            <CircleHelp />
            <span>
              General &amp; Account Support
            </span>
          </div>


          <div className="contact-category">
            <ShieldAlert />
            <span>
              Safety &amp; Reporting
            </span>
          </div>


          <div className="contact-category">
            <Handshake />
            <span>
              Partnerships
            </span>
          </div>


          <div className="contact-category">
            <Megaphone />
            <span>
              Creator &amp; Media
            </span>
          </div>


          <div className="contact-category">
            <BriefcaseBusiness />
            <span>
              Careers
            </span>
          </div>

        </div>

      </section>


      {/* =====================================================
          COMPANY FOOTNOTE
      ===================================================== */}

      <div className="contact-company-note">

        <strong>
          FoodKindl
        </strong>

        <span>
          A KnightnKindle Pvt Ltd initiative
        </span>

      </div>

    </main>
  );
}