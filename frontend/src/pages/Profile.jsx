import { useEffect, useState } from "react";

import api from "../api";
import { useAuth } from "../context/AuthContext";


const initialFiles = {
  profile_image_1: null,
  profile_image_2: null,
  profile_image_3: null,
  government_id: null,
};


function normalizeDietaryPreference(value) {
  if (
    !value ||
    value === "none"
  ) {
    return "non_vegetarian";
  }

  return value;
}


export default function Profile() {
  const {
    user,
    reloadUser,
  } = useAuth();

  const profile =
    user?.profile || {};

  const [form, setForm] =
    useState({
      bio: profile.bio || "",
      city: profile.city || "",
      locality: profile.locality || "",
      postcode: profile.postcode || "",

      college_workplace:
        profile.college_workplace || "",

      role: profile.role || "",
      interests: profile.interests || "",

      dietary_preference:
        normalizeDietaryPreference(
          profile.dietary_preference
        ),

      women_only_mode:
        profile.women_only_mode || false,

      government_id_type:
        profile.government_id_type || "",
    });

  const [files, setFiles] =
    useState(initialFiles);

  const [previews, setPreviews] =
    useState({
      profile_image_1:
        profile.profile_image_1 || "",

      profile_image_2:
        profile.profile_image_2 || "",

      profile_image_3:
        profile.profile_image_3 || "",
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  useEffect(() => {
    setForm({
      bio: profile.bio || "",
      city: profile.city || "",
      locality: profile.locality || "",
      postcode: profile.postcode || "",

      college_workplace:
        profile.college_workplace || "",

      role: profile.role || "",
      interests: profile.interests || "",

      dietary_preference:
        normalizeDietaryPreference(
          profile.dietary_preference
        ),

      women_only_mode:
        profile.women_only_mode || false,

      government_id_type:
        profile.government_id_type || "",
    });

    setPreviews({
      profile_image_1:
        profile.profile_image_1 || "",

      profile_image_2:
        profile.profile_image_2 || "",

      profile_image_3:
        profile.profile_image_3 || "",
    });
  }, [user]);


  function handleInputChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previousForm) => ({
      ...previousForm,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }


  function handleFileChange(event) {
    const {
      name,
      files: selectedFiles,
    } = event.target;

    const selectedFile =
      selectedFiles?.[0];

    if (!selectedFile) {
      return;
    }

    setFiles((previousFiles) => ({
      ...previousFiles,
      [name]: selectedFile,
    }));

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
          [name]: previewUrl,
        })
      );
    }
  }


  function getErrorMessage(data) {
    if (!data) {
      return (
        "Your profile could not be saved."
      );
    }

    if (
      typeof data === "string"
    ) {
      return data;
    }

    return (
      data?.profile_image_1?.[0] ||
      data?.profile_image_2?.[0] ||
      data?.profile_image_3?.[0] ||
      data?.government_id?.[0] ||
      data
        ?.government_id_type?.[0] ||
      data
        ?.dietary_preference?.[0] ||
      data?.postcode?.[0] ||
      data
        ?.college_workplace?.[0] ||
      data?.role?.[0] ||
      data?.detail ||
      JSON.stringify(data)
    );
  }


  async function submit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    /*
     * Old database profiles may still
     * contain "none".
     *
     * Always convert that before
     * sending data to Django.
     */
    const dietaryPreference =
      normalizeDietaryPreference(
        form.dietary_preference
      );

    if (
      files.government_id &&
      !form.government_id_type
    ) {
      setError(
        "Please select the Government ID type."
      );

      return;
    }


    // ---------------------------------
    // Profile image validation
    // ---------------------------------

    const imageFields = [
      "profile_image_1",
      "profile_image_2",
      "profile_image_3",
    ];

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    for (
      const field of imageFields
    ) {
      const selectedFile =
        files[field];

      if (!selectedFile) {
        continue;
      }

      if (
        !allowedImageTypes.includes(
          selectedFile.type
        )
      ) {
        setError(
          "Profile photos must be JPG, PNG or WebP."
        );

        return;
      }

      if (
        selectedFile.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Each profile photo must be smaller than 5 MB."
        );

        return;
      }
    }


    // ---------------------------------
    // Government ID validation
    // ---------------------------------

    if (files.government_id) {
      const allowedDocumentTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];

      if (
        !allowedDocumentTypes.includes(
          files.government_id.type
        )
      ) {
        setError(
          "Government ID must be JPG, PNG, WebP or PDF."
        );

        return;
      }

      if (
        files.government_id.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Government ID must be smaller than 5 MB."
        );

        return;
      }
    }


    setSubmitting(true);

    try {
      const formData =
        new FormData();

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


      if (
        files.profile_image_1
      ) {
        formData.append(
          "profile_image_1",
          files.profile_image_1
        );
      }


      if (
        files.profile_image_2
      ) {
        formData.append(
          "profile_image_2",
          files.profile_image_2
        );
      }


      if (
        files.profile_image_3
      ) {
        formData.append(
          "profile_image_3",
          files.profile_image_3
        );
      }


      if (
        files.government_id
      ) {
        formData.append(
          "government_id",
          files.government_id
        );
      }


      console.log(
        "Uploading profile..."
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


      if (reloadUser) {
        await reloadUser();
      }
    } catch (requestError) {
      console.error(
        "PROFILE SAVE FAILED"
      );

      console.error(
        "HTTP STATUS:",
        requestError.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        requestError.response?.data
      );

      console.error(
        "FULL ERROR:",
        requestError
      );

      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    } finally {
      setSubmitting(false);
    }
  }


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
        {/* ---------------------------------
            PERSONAL INFORMATION
        ---------------------------------- */}

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


        {/* ---------------------------------
            FOOD PREFERENCES
        ---------------------------------- */}

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
              <option
                value="non_vegetarian"
              >
                Non-Vegetarian
              </option>

              <option
                value="vegetarian"
              >
                Vegetarian
              </option>

              <option
                value="vegan"
              >
                Vegan
              </option>

              <option
                value="halal"
              >
                Halal
              </option>

              <option
                value="keto"
              >
                Keto
              </option>

              <option
                value="pescatarian"
              >
                Pescatarian
              </option>

              <option
                value="gluten_free"
              >
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


        {/* ---------------------------------
            PROFILE PHOTOS
        ---------------------------------- */}

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


        {/* ---------------------------------
            GOVERNMENT ID
        ---------------------------------- */}

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