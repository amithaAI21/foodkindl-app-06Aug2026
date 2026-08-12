import {
  useEffect,
  useState,
} from "react";

import api from "../api";
import { useAuth } from "../context/AuthContext";


const initialFiles = {
  profile_image_1: null,
  profile_image_2: null,
  profile_image_3: null,
  government_id: null,
};


// ============================================================
// NETLIFY BLOB UPLOAD
// ============================================================

async function uploadMediaToNetlify(file, kind = "profile") {
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

  formData.append(
    "kind",
    kind
  );

  let response;

  try {
    response = await fetch(
      "/.netlify/functions/media-upload",
      {
        method: "POST",
        body: formData,
      }
    );
  } catch (networkError) {
    console.error(
      "NETLIFY UPLOAD NETWORK ERROR:",
      networkError
    );

    throw new Error(
      "Could not connect to the media upload service."
    );
  }


  // IMPORTANT:
  // Don't directly use response.json().
  // Netlify can sometimes return an empty
  // or non-JSON response.

  const responseText =
    await response.text();

  let data = null;


  if (responseText) {
    try {
      data =
        JSON.parse(
          responseText
        );
    } catch (parseError) {
      console.error(
        "NETLIFY NON-JSON RESPONSE:",
        responseText
      );

      throw new Error(
        `Media upload returned an invalid response. Status: ${response.status}`
      );
    }
  }


  if (!response.ok) {
    console.error(
      "NETLIFY UPLOAD FAILED:",
      {
        status:
          response.status,

        responseText,

        data,
      }
    );

    throw new Error(
      data?.error ||
      data?.detail ||
      `Profile photo upload failed with status ${response.status}.`
    );
  }


  if (
    !data ||
    !data.key
  ) {
    console.error(
      "NETLIFY UPLOAD MISSING KEY:",
      {
        status:
          response.status,

        responseText,

        data,
      }
    );

    throw new Error(
      "Netlify upload completed without returning a blob key."
    );
  }

  if (
    kind === "profile" &&
    !data.url
  ) {
    console.error(
      "NETLIFY PROFILE UPLOAD MISSING URL:",
      data
    );

    throw new Error(
      "Profile image upload completed without returning a media URL."
    );
  }


  return data;
}


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
// PROFILE
// ============================================================

export default function Profile() {
  const {
    user,
    reloadUser,
  } = useAuth();


  const profile =
    user?.profile || {};


  const [form, setForm] =
    useState({
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


  const [files, setFiles] =
    useState(initialFiles);


  const [previews, setPreviews] =
    useState({
      profile_image_1:
        profile.profile_image_1_url ||
        profile.profile_image_1 ||
        "",

      profile_image_2:
        profile.profile_image_2_url ||
        profile.profile_image_2 ||
        "",

      profile_image_3:
        profile.profile_image_3_url ||
        profile.profile_image_3 ||
        "",
    });


  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  // ==========================================================
  // REFRESH PROFILE DATA
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
        profile.profile_image_1_url ||
        profile.profile_image_1 ||
        "",

      profile_image_2:
        profile.profile_image_2_url ||
        profile.profile_image_2 ||
        "",

      profile_image_3:
        profile.profile_image_3_url ||
        profile.profile_image_3 ||
        "",
    });

  }, [user]);


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
      (previousForm) => ({
        ...previousForm,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  }


  // ==========================================================
  // FILE CHANGE + IMMEDIATE PREVIEW
  // ==========================================================

  function handleFileChange(
    event
  ) {
    const {
      name,
      files: selectedFiles,
    } = event.target;


    const selectedFile =
      selectedFiles?.[0];


    if (!selectedFile) {
      return;
    }


    setError("");
    setMessage("");


    // --------------------------------------------------------
    // PROFILE PHOTO VALIDATION
    // --------------------------------------------------------

    if (
      name.startsWith(
        "profile_image"
      )
    ) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];


      if (
        !allowedImageTypes.includes(
          selectedFile.type
        )
      ) {
        setError(
          "Profile photos must be JPG, PNG or WebP."
        );

        event.target.value = "";

        return;
      }


      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Each profile photo must be smaller than 5 MB."
        );

        event.target.value = "";

        return;
      }
    }


    // --------------------------------------------------------
    // GOVERNMENT ID VALIDATION
    // --------------------------------------------------------

    if (
      name ===
      "government_id"
    ) {
      const allowedDocumentTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];


      if (
        !allowedDocumentTypes.includes(
          selectedFile.type
        )
      ) {
        setError(
          "Government ID must be JPG, PNG, WebP or PDF."
        );

        event.target.value = "";

        return;
      }


      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Government ID must be smaller than 5 MB."
        );

        event.target.value = "";

        return;
      }
    }


    // --------------------------------------------------------
    // SAVE FILE
    // --------------------------------------------------------

    setFiles(
      (previousFiles) => ({
        ...previousFiles,

        [name]:
          selectedFile,
      })
    );


    // --------------------------------------------------------
    // IMMEDIATE PHOTO PREVIEW
    // --------------------------------------------------------

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
        (previousPreviews) => ({
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
        ?.profile_image_1?.[0] ||

      data
        ?.profile_image_2?.[0] ||

      data
        ?.profile_image_3?.[0] ||

      data
        ?.government_id?.[0] ||

      data
        ?.government_id_type?.[0] ||

      data
        ?.dietary_preference?.[0] ||

      data
        ?.postcode?.[0] ||

      data
        ?.college_workplace?.[0] ||

      data
        ?.role?.[0] ||

      data
        ?.detail ||

      JSON.stringify(
        data
      )
    );
  }


  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function submit(
    event
  ) {
    event.preventDefault();


    setMessage("");
    setError("");


    const dietaryPreference =
      normalizeDietaryPreference(
        form.dietary_preference
      );


    // --------------------------------------------------------
    // GOVERNMENT ID TYPE REQUIRED
    // --------------------------------------------------------

    if (
      files.government_id &&
      !form.government_id_type
    ) {
      setError(
        "Please select the Government ID type."
      );

      return;
    }


    setSubmitting(
      true
    );


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
      // PROFILE PHOTOS -> NETLIFY BLOBS
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


        console.log(
          `Uploading ${field} to Netlify...`
        );


        const uploaded =
          await uploadMediaToNetlify(
            selectedFile,
            "profile"
          );


        console.log(
          "NETLIFY UPLOAD SUCCESS:",
          uploaded
        );


        // profile_image_1
        // becomes
        // profile_image_1_url

        formData.append(
          `${field}_url`,
          uploaded.url
        );
      }


      // ======================================================
      // GOVERNMENT ID -> PRIVATE NETLIFY BLOB STORE
      // ======================================================

      if (
        files.government_id
      ) {
        console.log(
          "Uploading Government ID to private Netlify Blob store..."
        );

        const uploadedGovernmentId =
          await uploadMediaToNetlify(
            files.government_id,
            "government_id"
          );

        console.log(
          "GOVERNMENT ID BLOB UPLOAD SUCCESS:",
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
      // DEBUG
      // ======================================================

      console.log(
        "Saving profile to Django..."
      );


      for (
        const pair of
        formData.entries()
      ) {
        console.log(
          pair[0],
          pair[1]
        );
      }


      // ======================================================
      // DJANGO SAVE
      // ======================================================

      const response =
        await api.patch(
          "/auth/profile/",
          formData
        );


      console.log(
        "PROFILE SAVE SUCCESS:",
        response.status,
        response.data
      );


      // ======================================================
      // RESET FILES
      // ======================================================

      setFiles(
        initialFiles
      );


      setForm(
        (previousForm) => ({
          ...previousForm,

          dietary_preference:
            dietaryPreference,
        })
      );


      setMessage(
        "Profile saved successfully."
      );


      // ======================================================
      // RELOAD USER
      // ======================================================

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
        "HTTP STATUS:",
        requestError
          ?.response
          ?.status
      );


      console.error(
        "BACKEND RESPONSE:",
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
      setSubmitting(
        false
      );
    }
  }


  // ==========================================================
  // KEEP YOUR EXISTING JSX BELOW THIS POINT
  // ==========================================================

  return (
    <main className="app-page">

      <div className="app-heading">

        <div>

          <div className="eyebrow left">
            Profile and Preferences
          </div>

          <h1>
            {user?.full_name ||
              user?.first_name ||
              user?.email}
          </h1>

          <p>
            {user?.email}
          </p>

        </div>

      </div>


      <form
        className="app-panel profile-form"
        onSubmit={submit}
        encType="multipart/form-data"
      >

        {/* PERSONAL INFORMATION */}

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


        {/* FOOD PREFERENCES */}

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
              placeholder="Home cooking, baking, Italian food, Kerala cuisine..."
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


        {/* PROFILE PHOTOS */}

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

            <label className="profile-image-upload">

              <span>
                Profile Photo 1
              </span>


              {previews.profile_image_1 ? (
                <img
                  src={
                    previews.profile_image_1
                  }
                  alt="Profile preview 1"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}


              <input
                type="file"
                name="profile_image_1"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

            </label>


            <label className="profile-image-upload">

              <span>
                Profile Photo 2
              </span>


              {previews.profile_image_2 ? (
                <img
                  src={
                    previews.profile_image_2
                  }
                  alt="Profile preview 2"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}


              <input
                type="file"
                name="profile_image_2"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
              />

            </label>


            <label className="profile-image-upload">

              <span>
                Profile Photo 3
              </span>


              {previews.profile_image_3 ? (
                <img
                  src={
                    previews.profile_image_3
                  }
                  alt="Profile preview 3"
                />
              ) : (
                <div className="image-placeholder">
                  No image selected
                </div>
              )}


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


        {/* GOVERNMENT ID */}

        <section className="profile-form-section">

          <h2>
            Identity Verification
          </h2>


          <p className="upload-help">
            Upload one government-issued
            identity document. It will not
            be displayed publicly.
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


          {files.government_id && (
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
          )}


          {profile.government_id_uploaded && (
            <p className="existing-file-message">
              A Government ID has already
              been uploaded.
            </p>
          )}


          <p className="existing-file-message">

            Verification status:{" "}

            <strong>
              {(
                profile
                  .verification_status ||
                "not_submitted"
              ).replaceAll(
                "_",
                " "
              )}
            </strong>

          </p>


          {profile.rejection_reason && (
            <p className="error-message">

              Rejection reason:{" "}

              {
                profile
                  .rejection_reason
              }

            </p>
          )}

        </section>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}


        {message && (
          <p className="form-message">
            {message}
          </p>
        )}


        <button
          type="submit"
          className="primary-button"
          disabled={submitting}
        >

          {submitting
            ? "Saving Profile..."
            : "Save Profile"}

        </button>

      </form>

    </main>
  );
}