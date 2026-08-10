import {
  CheckCircle2,
  Clock3,
  FileWarning,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function VerificationRequired() {
  const {
    user,
    reloadUser,
  } = useAuth();

  const [idType, setIdType] =
    useState("");

  const [
    governmentId,
    setGovernmentId,
  ] = useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const fileInputRef = useRef(null);

  const profile =
    user?.profile || {};

  useEffect(() => {
    setIdType(
      profile.government_id_type || ""
    );
  }, [
    profile.government_id_type,
  ]);

  function getErrorMessage(data) {
    if (!data) {
      return (
        "Government ID could not be uploaded. " +
        "Please try again."
      );
    }

    if (typeof data === "string") {
      return data;
    }

    if (
      Array.isArray(
        data?.government_id
      )
    ) {
      return data.government_id[0];
    }

    if (
      Array.isArray(
        data?.government_id_type
      )
    ) {
      return data.government_id_type[0];
    }

    if (
      Array.isArray(
        data?.non_field_errors
      )
    ) {
      return data.non_field_errors[0];
    }

    return (
      data?.detail ||
      data?.message ||
      "Government ID could not be uploaded."
    );
  }

  async function uploadGovernmentId(
    event
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!idType) {
      setError(
        "Please select the Government ID type."
      );
      return;
    }

    if (!governmentId) {
      setError(
        "Please select a Government ID document."
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        governmentId.type
      )
    ) {
      setError(
        "Please upload a JPG, PNG, WebP or PDF document."
      );
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      governmentId.size > maxSize
    ) {
      setError(
        "Government ID must be smaller than 5 MB."
      );
      return;
    }

    setUploading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "government_id_type",
        idType
      );

      formData.append(
        "government_id",
        governmentId
      );

      /*
       * IMPORTANT:
       * Do NOT manually set
       * Content-Type: multipart/form-data.
       *
       * Axios/browser will add the
       * multipart boundary correctly.
       */
      const response =
        await api.patch(
          "/profile/",
          formData
        );

      console.log(
        "Government ID upload response:",
        response.data
      );

      setGovernmentId(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setMessage(
        "Government ID uploaded successfully. It is now awaiting admin approval."
      );

      if (reloadUser) {
        await reloadUser();
      }
    } catch (requestError) {
      console.error(
        "Government ID upload failed"
      );

      console.error(
        "Status:",
        requestError.response?.status
      );

      console.error(
        "Response:",
        requestError.response?.data
      );

      console.error(
        "Full error:",
        requestError
      );

      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    } finally {
      setUploading(false);
    }
  }

  const isVerified =
    profile.is_verified === true &&
    profile.verification_status ===
      "approved";

  if (isVerified) {
    return (
      <main className="app-page verification-page">
        <section className="app-panel verification-card">
          <div className="verification-icon verified">
            <CheckCircle2 size={34} />
          </div>

          <div className="eyebrow">
            FoodKindl Safety
          </div>

          <h1>
            Identity verified
          </h1>

          <p>
            Your Government ID has
            been approved.
          </p>

          <p>
            You can now use Connect
            and private messaging with
            other verified FoodKindl
            members.
          </p>

          <div className="verification-status approved">
            <ShieldCheck size={20} />

            <div>
              <strong>
                Verified member
              </strong>

              <span>
                Your identity
                verification is active.
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-page verification-page">
      <section className="app-panel verification-card">
        <div className="verification-icon">
          <ShieldCheck size={34} />
        </div>

        <div className="eyebrow">
          FoodKindl Safety
        </div>

        <h1>
          Identity verification
        </h1>

        <p>
          Government ID verification
          is required for Connect and
          private messaging.
        </p>

        <p>
          CommuniQ remains available
          without identity
          verification.
        </p>

        {profile.verification_status ===
          "pending" && (
          <div className="verification-status pending">
            <Clock3 size={20} />

            <div>
              <strong>
                Verification pending       
              </strong>
              <br></br>
              <span>
                Your document is
                awaiting administrator
                approval.
              </span>
            </div>
          </div>
        )}

        {profile.verification_status ===
          "rejected" && (
          <div className="verification-status rejected">
            <FileWarning size={20} />

            <div>
              <strong>
                Verification rejected
              </strong>

              <span>
                {profile.rejection_reason ||
                  "Please upload a clearer or valid document."}
              </span>
            </div>
          </div>
        )}

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <form
          className="verification-form"
          onSubmit={
            uploadGovernmentId
          }
          encType="multipart/form-data"
        >
        </form>
      </section>
    </main>
  );
}