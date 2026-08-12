import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";


const initialFiles = {
  profile_image_1: null,
  profile_image_2: null,
  profile_image_3: null,
  government_id: null,
};


// ============================================================
// DIETARY PREFERENCE
// ============================================================

function normalizeDietaryPreference(
  value
) {
  if (
    !value ||
    value === "none"
  ) {
    return "non_vegetarian";
  }

  return value;
}


// ============================================================
// NETLIFY BLOB UPLOAD
// ============================================================

async function uploadMediaToNetlify(
  file,
  uploadType = "public"
) {
  if (!file) {
    throw new Error(
      "No file selected."
    );
  }


  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  // IMPORTANT:
  // media-upload.mjs expects upload_type
  formData.append(
    "upload_type",
    uploadType
  );


  let response;


  try {
    response =
      await fetch(
        "/.netlify/functions/media-upload",
        {
          method: "POST",
          body: formData,
        }
      );

  } catch (
    networkError
  ) {
    console.error(
      "NETLIFY UPLOAD NETWORK ERROR:",
      networkError
    );


    throw new Error(
      "Could not connect to the media upload service."
    );
  }


  const responseText =
    await response.text();


  let data = null;


  if (responseText) {
    try {
      data =
        JSON.parse(
          responseText
        );

    } catch (
      parseError
    ) {
      console.error(
        "NETLIFY INVALID RESPONSE:",
        responseText
      );


      throw new Error(
        (
          "Media upload returned "
          +
          "an invalid response."
        )
      );
    }
  }


  if (!response.ok) {
    console.error(
      "NETLIFY UPLOAD FAILED:",
      {
        status:
          response.status,

        data,

        responseText,
      }
    );


    throw new Error(
      data?.error ||
      data?.detail ||
      (
        `Upload failed with `
        +
        `status ${response.status}.`
      )
    );
  }


  if (
    !data ||
    !data.success ||
    !data.key
  ) {
    console.error(
      "NETLIFY UPLOAD MISSING DATA:",
      data
    );


    throw new Error(
      (
        "Netlify upload did not "
        +
        "return a Blob key."
      )
    );
  }


  // Public/profile photos MUST have a URL.
  if (
    uploadType === "public" &&
    !data.url
  ) {
    console.error(
      "NETLIFY PUBLIC UPLOAD MISSING URL:",
      data
    );


    throw new Error(
      (
        "Profile photo uploaded "
        +
        "but no media URL was returned."
      )
    );
  }


  return data;
}


// ============================================================
// PROFILE PAGE
// ============================================================

export default function Profile() {
  const {
    user,
    reloadUser,
  } = useAuth();


  const profile =
    user?.profile || {};


  const API_BASE = (
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000"
  ).replace(
    /\/+$/,
    ""
  );


  // ==========================================================
  // MEDIA URL
  // ==========================================================

  function getMediaUrl(
    value
  ) {
    if (!value) {
      return "";
    }


    if (
      value.startsWith(
        "http://"
      ) ||
      value.startsWith(
        "https://"
      ) ||
      value.startsWith(
        "blob:"
      )
    ) {
      return value;
    }


    if (
      value.startsWith(
        "/.netlify/"
      )
    ) {
      return (
        `${window.location.origin}${value}`
      );
    }


    return (
      `${API_BASE}${value}`
    );
  }


  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState({
    bio:
      profile.bio || "",

    city:
      profile.city || "",

    locality:
      profile.locality || "",

    postcode:
      profile.postcode || "",

    college_workplace:
      profile.college_workplace ||
      "",

    role:
      profile.role || "",

    interests:
      profile.interests || "",

    dietary_preference:
      normalizeDietaryPreference(
        profile.dietary_preference
      ),

    women_only_mode:
      profile.women_only_mode ||
      false,

    government_id_type:
      profile.government_id_type ||
      "",
  });


  const [
    files,
    setFiles,
  ] = useState(
    initialFiles
  );


  const [
    previews,
    setPreviews,
  ] = useState({
    profile_image_1:
      getMediaUrl(
        profile.profile_image_1_url ||
        profile.profile_image_1
      ),

    profile_image_2:
      getMediaUrl(
        profile.profile_image_2_url ||
        profile.profile_image_2
      ),

    profile_image_3:
      getMediaUrl(
        profile.profile_image_3_url ||
        profile.profile_image_3
      ),
  });


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    uploadStatus,
    setUploadStatus,
  ] = useState("");


  // ==========================================================
  // RELOAD FORM AFTER USER REFRESH
  // ==========================================================

  useEffect(() => {
    setForm({
      bio:
        profile.bio || "",

      city:
        profile.city || "",

      locality:
        profile.locality || "",

      postcode:
        profile.postcode || "",

      college_workplace:
        profile.college_workplace ||
        "",

      role:
        profile.role || "",

      interests:
        profile.interests || "",

      dietary_preference:
        normalizeDietaryPreference(
          profile.dietary_preference
        ),

      women_only_mode:
        profile.women_only_mode ||
        false,

      government_id_type:
        profile.government_id_type ||
        "",
    });


    setPreviews({
      profile_image_1:
        getMediaUrl(
          profile.profile_image_1_url ||
          profile.profile_image_1
        ),

      profile_image_2:
        getMediaUrl(
          profile.profile_image_2_url ||
          profile.profile_image_2
        ),

      profile_image_3:
        getMediaUrl(
          profile.profile_image_3_url ||
          profile.profile_image_3
        ),
    });

  }, [user]);


  // ==========================================================
  // REFRESH PROFILE
  // ==========================================================

  async function refreshProfile() {
    if (!reloadUser) {
      return;
    }


    setRefreshing(true);
    setError("");
    setMessage("");


    try {
      await reloadUser();


      setMessage(
        "Profile refreshed."
      );

    } catch (
      refreshError
    ) {
      console.error(
        "PROFILE REFRESH ERROR:",
        refreshError
      );


      setError(
        (
          "Profile could not "
          +
          "be refreshed."
        )
      );

    } finally {
      setRefreshing(false);
    }
  }


  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  function handleInputChange(
    event
  ) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setForm(
      (
        previousForm
      ) => ({
        ...previousForm,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  }


  // ==========================================================
  // FILE CHANGE
  // ==========================================================

  function handleFileChange(
    event
  ) {
    const {
      name,
      files:
        selectedFiles,
    } = event.target;


    const selectedFile =
      selectedFiles?.[0];


    if (!selectedFile) {
      return;
    }


    setError("");
    setMessage("");


    // ========================================================
    // PROFILE PHOTO VALIDATION
    // ========================================================

    if (
      name.startsWith(
        "profile_image"
      )
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];


      const extension =
        selectedFile.name
          .split(".")
          .pop()
          ?.toLowerCase();


      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
      ];


      if (
        !allowedTypes.includes(
          selectedFile.type
        ) &&
        !allowedExtensions.includes(
          extension
        )
      ) {
        setError(
          (
            "Profile photos must "
            +
            "be JPG, PNG or WebP."
          )
        );


        event.target.value =
          "";

        return;
      }


      if (
        selectedFile.size >
        10 * 1024 * 1024
      ) {
        setError(
          (
            "Each profile photo "
            +
            "must be smaller than 10 MB."
          )
        );


        event.target.value =
          "";

        return;
      }
    }


    // ========================================================
    // GOVERNMENT ID VALIDATION
    // ========================================================

    if (
      name ===
      "government_id"
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];


      const extension =
        selectedFile.name
          .split(".")
          .pop()
          ?.toLowerCase();


      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "pdf",
      ];


      if (
        !allowedTypes.includes(
          selectedFile.type
        ) &&
        !allowedExtensions.includes(
          extension
        )
      ) {
        setError(
          (
            "Government ID must "
            +
            "be JPG, PNG, WebP or PDF."
          )
        );


        event.target.value =
          "";

        return;
      }


      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setError(
          (
            "Government ID must "
            +
            "be smaller than 5 MB."
          )
        );


        event.target.value =
          "";

        return;
      }
    }


    // ========================================================
    // STORE FILE
    // ========================================================

    setFiles(
      (
        previousFiles
      ) => ({
        ...previousFiles,

        [name]:
          selectedFile,
      })
    );


    // ========================================================
    // IMMEDIATE PROFILE PREVIEW
    // ========================================================

    if (
      name.startsWith(
        "profile_image"
      )
    ) {
      const previewUrl =
        URL.createObjectURL(
          selectedFile
        );


      setPreviews(
        (
          previousPreviews
        ) => ({
          ...previousPreviews,

          [name]:
            previewUrl,
        })
      );
    }
  }


  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  function getErrorMessage(
    data
  ) {
    if (!data) {
      return (
        "Your profile could not be saved."
      );
    }


    if (
      typeof data ===
      "string"
    ) {
      return data;
    }


    return (
      data
        ?.profile_image_1_url?.[0] ||

      data
        ?.profile_image_2_url?.[0] ||

      data
        ?.profile_image_3_url?.[0] ||

      data
        ?.profile_image_1_blob_key?.[0] ||

      data
        ?.profile_image_2_blob_key?.[0] ||

      data
        ?.profile_image_3_blob_key?.[0] ||

      data
        ?.government_id_blob_key?.[0] ||

      data
        ?.government_id_original_name?.[0] ||

      data
        ?.government_id_content_type?.[0] ||

      data
        ?.government_id_type?.[0] ||

      data
        ?.dietary_preference?.[0] ||

      data
        ?.detail ||

      JSON.stringify(
        data
      )
    );
  }


  // ==========================================================
  // SAVE
  // ==========================================================

  async function submit(
    event
  ) {
    event.preventDefault();


    setMessage("");
    setError("");
    setUploadStatus("");


    const dietaryPreference =
      normalizeDietaryPreference(
        form.dietary_preference
      );


    if (
      files.government_id &&
      !form.government_id_type
    ) {
      setError(
        (
          "Please select the "
          +
          "Government ID type."
        )
      );

      return;
    }


    setSubmitting(true);


    try {
      const formData =
        new FormData();


      // ======================================================
      // NORMAL PROFILE DATA
      // ======================================================

      formData.append(
        "bio",
        form.bio
      );


      formData.append(
        "city",
        form.city
      );


      formData.append(
        "locality",
        form.locality
      );


      formData.append(
        "postcode",
        form.postcode
      );


      formData.append(
        "college_workplace",
        form.college_workplace
      );


      formData.append(
        "role",
        form.role
      );


      formData.append(
        "interests",
        form.interests
      );


      formData.append(
        "dietary_preference",
        dietaryPreference
      );


      formData.append(
        "women_only_mode",
        form.women_only_mode
          ? "true"
          : "false"
      );


      if (
        form.government_id_type
      ) {
        formData.append(
          "government_id_type",
          form.government_id_type
        );
      }


      // ======================================================
      // PROFILE PHOTOS -> NETLIFY BLOB
      // ======================================================

      const imageFields = [
        "profile_image_1",
        "profile_image_2",
        "profile_image_3",
      ];


      for (
        const field of
        imageFields
      ) {
        const selectedFile =
          files[field];


        if (!selectedFile) {
          continue;
        }


        setUploadStatus(
          `Uploading ${
            field.replaceAll(
              "_",
              " "
            )
          }...`
        );


        console.log(
          "PROFILE IMAGE SELECTED:",
          field,
          selectedFile
        );


        const uploaded =
          await uploadMediaToNetlify(
            selectedFile,
            "public"
          );


        console.log(
          "PROFILE IMAGE BLOB RESULT:",
          field,
          uploaded
        );


        // URL
        formData.append(
          `${field}_url`,
          uploaded.url
        );


        // Blob key
        formData.append(
          `${field}_blob_key`,
          uploaded.key
        );
      }


      // ======================================================
      // GOVERNMENT ID -> PRIVATE BLOB
      // ======================================================

      if (
        files.government_id
      ) {
        setUploadStatus(
          "Uploading Government ID..."
        );


        const uploadedGovernmentId =
          await uploadMediaToNetlify(
            files.government_id,
            "government_id"
          );


        console.log(
          "GOVERNMENT ID RESULT:",
          uploadedGovernmentId
        );


        formData.append(
          "government_id_blob_key",
          uploadedGovernmentId.key
        );


        formData.append(
          "government_id_original_name",
          uploadedGovernmentId.filename ||
          files.government_id.name
        );


        formData.append(
          "government_id_content_type",
          uploadedGovernmentId.contentType ||
          files.government_id.type
        );
      }


      // ======================================================
      // DEBUG BEFORE DJANGO
      // ======================================================

      console.log(
        "PROFILE DATA SENT TO DJANGO:"
      );


      for (
        const [
          key,
          value,
        ] of formData.entries()
      ) {
        console.log(
          key,
          value
        );
      }


      setUploadStatus(
        "Saving profile..."
      );


      // ======================================================
      // SAVE TO DJANGO
      // ======================================================

      const response =
        await api.patch(
          "/auth/profile/",
          formData
        );


      console.log(
        "PROFILE SAVE RESPONSE:",
        response.status,
        response.data
      );


      // ======================================================
      // IMPORTANT:
      // USE RESPONSE URLS IMMEDIATELY
      // ======================================================

      const savedProfile =
        response.data?.profile ||
        response.data ||
        {};


      setPreviews(
        (
          previous
        ) => ({
          profile_image_1:
            getMediaUrl(
              savedProfile
                .profile_image_1_url
              ||
              savedProfile
                .profile_image_1
              ||
              previous
                .profile_image_1
            ),

          profile_image_2:
            getMediaUrl(
              savedProfile
                .profile_image_2_url
              ||
              savedProfile
                .profile_image_2
              ||
              previous
                .profile_image_2
            ),

          profile_image_3:
            getMediaUrl(
              savedProfile
                .profile_image_3_url
              ||
              savedProfile
                .profile_image_3
              ||
              previous
                .profile_image_3
            ),
        })
      );


      setFiles({
        ...initialFiles,
      });


      setUploadStatus("");


      setMessage(
        "Profile saved successfully."
      );


      // Reload latest profile from backend
      if (reloadUser) {
        await reloadUser();
      }


    } catch (
      requestError
    ) {
      console.error(
        "PROFILE SAVE FAILED:",
        requestError
      );


      console.error(
        "PROFILE BACKEND RESPONSE:",
        requestError
          ?.response
          ?.data
      );


      if (
        requestError instanceof Error &&
        !requestError.response
      ) {
        setError(
          requestError.message
        );

      } else {
        setError(
          getErrorMessage(
            requestError
              ?.response
              ?.data
          )
        );
      }


    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="app-page">

      {/* ======================================================
          TOP ACTIONS
      ====================================================== */}

      <div
        className="profile-page-actions"
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >

        <Link
          to="/dashboard"
          className="secondary-button"
        >
          <ArrowLeft
            size={18}
          />

          Back to Dashboard
        </Link>


        <button
          type="button"
          className="secondary-button"
          onClick={
            refreshProfile
          }
          disabled={
            refreshing ||
            submitting
          }
        >
          <RefreshCw
            size={18}
          />

          {
            refreshing
              ? "Refreshing..."
              : "Refresh"
          }
        </button>

      </div>


      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="app-heading">

        <div>

          <div className="eyebrow left">
            Profile and Preferences
          </div>


          <h1>
            {
              user?.full_name ||
              user?.first_name ||
              user?.email
            }
          </h1>


          <p>
            {user?.email}
          </p>

        </div>

      </div>


      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        className="app-panel profile-form"
        onSubmit={submit}
        encType="multipart/form-data"
      >

        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <section className="profile-form-section">

          <h2>
            Personal Information
          </h2>


          <div className="form-row">

            <label>
              City

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={
                  handleInputChange
                }
                placeholder="Bengaluru"
              />

            </label>


            <label>
              Locality

              <input
                type="text"
                name="locality"
                value={
                  form.locality
                }
                onChange={
                  handleInputChange
                }
                placeholder="Indiranagar"
              />

            </label>

          </div>


          <div className="form-row">

            <label>
              Postcode

              <input
                type="text"
                name="postcode"
                value={
                  form.postcode
                }
                onChange={
                  handleInputChange
                }
                placeholder="560038"
                maxLength={12}
              />

            </label>


            <label>
              College or Workplace

              <input
                type="text"
                name="college_workplace"
                value={
                  form.college_workplace
                }
                onChange={
                  handleInputChange
                }
                placeholder="Scaler or university name"
              />

            </label>

          </div>


          <label>
            Role

            <input
              type="text"
              name="role"
              value={form.role}
              onChange={
                handleInputChange
              }
              placeholder="Software Engineer, Student, Chef..."
            />

          </label>


          <label>
            Bio

            <textarea
              name="bio"
              value={form.bio}
              onChange={
                handleInputChange
              }
              placeholder="Tell the FoodKindl community about yourself."
            />

          </label>

        </section>


        {/* ====================================================
            FOOD PREFERENCES
        ==================================================== */}

        <section className="profile-form-section">

          <h2>
            Food Preferences
          </h2>


          <label>
            Dietary Preference

            <select
              name="dietary_preference"
              value={
                form.dietary_preference
              }
              onChange={
                handleInputChange
              }
            >

              <option value="non_vegetarian">
                Non-Vegetarian
              </option>

              <option value="vegetarian">
                Vegetarian
              </option>

              <option value="vegan">
                Vegan
              </option>

              <option value="halal">
                Halal
              </option>

              <option value="keto">
                Keto
              </option>

              <option value="pescatarian">
                Pescatarian
              </option>

              <option value="gluten_free">
                Gluten-free
              </option>

            </select>

          </label>


          <label>
            Food Interests

            <input
              type="text"
              name="interests"
              value={
                form.interests
              }
              onChange={
                handleInputChange
              }
              placeholder="Home cooking, baking, Kerala cuisine..."
            />

          </label>


          <label className="checkbox-row">

            <input
              type="checkbox"
              name="women_only_mode"
              checked={
                form.women_only_mode
              }
              onChange={
                handleInputChange
              }
            />

            Enable women-only preference
            for applicable gatherings

          </label>

        </section>


        {/* ====================================================
            PROFILE PHOTOS
        ==================================================== */}

        <section className="profile-form-section">

          <h2>
            Profile Photos
          </h2>


          <p className="upload-help">
            Upload up to three clear
            profile photos. JPG, PNG and
            WebP files are supported.
          </p>


          <div className="profile-image-grid">

            {/* PROFILE PHOTO 1 */}

            <label className="profile-image-upload">

              <span>
                Profile Photo 1
              </span>


              <div className="profile-photo-preview">

                {
                  previews
                    .profile_image_1
                    ? (
                      <img
                        src={
                          previews
                            .profile_image_1
                        }
                        alt="Profile preview 1"
                      />
                    )
                    : (
                      <div className="image-placeholder">
                        No image selected
                      </div>
                    )
                }

              </div>


              <input
                type="file"
                name="profile_image_1"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

            </label>


            {/* PROFILE PHOTO 2 */}

            <label className="profile-image-upload">

              <span>
                Profile Photo 2
              </span>


              <div className="profile-photo-preview">

                {
                  previews
                    .profile_image_2
                    ? (
                      <img
                        src={
                          previews
                            .profile_image_2
                        }
                        alt="Profile preview 2"
                      />
                    )
                    : (
                      <div className="image-placeholder">
                        No image selected
                      </div>
                    )
                }

              </div>


              <input
                type="file"
                name="profile_image_2"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

            </label>


            {/* PROFILE PHOTO 3 */}

            <label className="profile-image-upload">

              <span>
                Profile Photo 3
              </span>


              <div className="profile-photo-preview">

                {
                  previews
                    .profile_image_3
                    ? (
                      <img
                        src={
                          previews
                            .profile_image_3
                        }
                        alt="Profile preview 3"
                      />
                    )
                    : (
                      <div className="image-placeholder">
                        No image selected
                      </div>
                    )
                }

              </div>


              <input
                type="file"
                name="profile_image_3"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

            </label>

          </div>

        </section>


        {/* ====================================================
            GOVERNMENT ID
        ==================================================== */}

        <section className="profile-form-section">

          <h2>
            Identity Verification
          </h2>


          <p className="upload-help">
            Upload one government-issued
            identity document. It will
            remain private.
          </p>


          <label>
            Government ID Type

            <select
              name="government_id_type"
              value={
                form.government_id_type
              }
              onChange={
                handleInputChange
              }
              required={
                Boolean(
                  files.government_id
                )
              }
            >

              <option value="">
                Select ID type
              </option>

              <option value="aadhaar">
                Aadhaar Card
              </option>

              <option value="passport">
                Passport
              </option>

              <option value="driving_licence">
                Driving Licence
              </option>

              <option value="voter_id">
                Voter ID
              </option>

              <option value="pan">
                PAN Card
              </option>

              <option value="other">
                Other
              </option>

            </select>

          </label>


          <label>
            Government ID Proof

            <input
              type="file"
              name="government_id"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={
                handleFileChange
              }
            />

          </label>


          {
            files.government_id &&
            (
              <p className="existing-file-message">

                Selected document:{" "}

                <strong>
                  {
                    files
                      .government_id
                      .name
                  }
                </strong>

              </p>
            )
          }


          {
            profile
              .government_id_uploaded &&
            (
              <p className="existing-file-message">

                A Government ID has
                already been uploaded.

              </p>
            )
          }


          <p className="existing-file-message">

            Verification status:{" "}

            <strong>
              {
                (
                  profile
                    .verification_status ||
                  "not_submitted"
                )
                  .replaceAll(
                    "_",
                    " "
                  )
              }
            </strong>

          </p>


          {
            profile
              .rejection_reason &&
            (
              <p className="error-message">

                Rejection reason:{" "}

                {
                  profile
                    .rejection_reason
                }

              </p>
            )
          }

        </section>


        {/* ====================================================
            STATUS
        ==================================================== */}

        {
          uploadStatus &&
          (
            <p className="form-message">
              {uploadStatus}
            </p>
          )
        }


        {
          error &&
          (
            <p className="error-message">
              {error}
            </p>
          )
        }


        {
          message &&
          (
            <p className="form-message">
              {message}
            </p>
          )
        }


        {/* ====================================================
            SAVE
        ==================================================== */}

        <button
          type="submit"
          className="primary-button"
          disabled={
            submitting
          }
        >

          {
            submitting
              ? "Saving Profile..."
              : "Save Profile"
          }

        </button>

      </form>

    </main>
  );
}