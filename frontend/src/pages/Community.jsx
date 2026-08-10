import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Repeat2,
  Share2,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/AuthContext";
// import AIRecipeSearch from "../components/AIRecipeSearch";

const REACTIONS = [
  { value: "like", label: "Like", emoji: "👍" },
  { value: "love", label: "Love", emoji: "❤️" },
  { value: "haha", label: "Haha", emoji: "😂" },
  { value: "wow", label: "Wow", emoji: "😮" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "angry", label: "Angry", emoji: "😡" },
];

const emptyForm = {
  post_type: "post",
  title: "",
  text: "",
  location_name: "",
  latitude: "",
  longitude: "",
};

export default function Community() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [reposts, setReposts] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [locating, setLocating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openReactionPostId, setOpenReactionPostId] =
    useState(null);

  const [composerOpen, setComposerOpen] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("feed");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";

  function getMediaUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    return `${API_BASE}${path}`;
  }

  function getAuthorName(author) {
    return (
      author?.full_name ||
      [author?.first_name, author?.last_name]
        .filter(Boolean)
        .join(" ") ||
      author?.email ||
      "FoodKindl Member"
    );
  }

  function getAuthorInitial(author) {
    return getAuthorName(author)
      .charAt(0)
      .toUpperCase();
  }

  function getAuthorImage(author) {
    return getMediaUrl(
      author?.profile?.profile_image_1
    );
  }

  function updatePost(postId, updates) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...updates,
            }
          : post
      )
    );

    setMyPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...updates,
            }
          : post
      )
    );

    setReposts((currentReposts) =>
      currentReposts.map((repost) => {
        if (
          repost.original_post?.id !== postId
        ) {
          return repost;
        }

        return {
          ...repost,
          original_post: {
            ...repost.original_post,
            ...updates,
          },
        };
      })
    );
  }

  function getErrorMessage(data) {
    if (!data) {
      return "The request could not be completed.";
    }

    if (typeof data === "string") {
      return data;
    }

    const firstValue = Object.values(data)
      .flat()
      .find(Boolean);

    return (
      data?.post_type?.[0] ||
      data?.title?.[0] ||
      data?.text?.[0] ||
      data?.image?.[0] ||
      data?.video?.[0] ||
      data?.location_name?.[0] ||
      data?.reaction_type?.[0] ||
      data?.message?.[0] ||
      data?.non_field_errors?.[0] ||
      data?.detail ||
      firstValue ||
      "The request could not be completed."
    );
  }

  async function loadPosts() {
    try {
      const response = await api.get("/posts/");

      const postList =
        response.data?.results || response.data;

      setPosts(
        Array.isArray(postList)
          ? postList
          : []
      );
    } catch (requestError) {
      console.error(
        "Unable to load posts:",
        requestError.response?.data ||
          requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Community posts could not be loaded."
      );
    }
  }

  async function loadMyPosts() {
    try {
      const response = await api.get(
        "/posts/my-posts/"
      );

      const postList =
        response.data?.results || response.data;

      setMyPosts(
        Array.isArray(postList)
          ? postList
          : []
      );
    } catch (requestError) {
      console.error(
        "Unable to load my posts:",
        requestError.response?.data ||
          requestError
      );
    }
  }

  async function loadReposts() {
    try {
      const response = await api.get(
        "/posts/reposts/"
      );

      const repostList =
        response.data?.results || response.data;

      setReposts(
        Array.isArray(repostList)
          ? repostList
          : []
      );
    } catch (requestError) {
      console.error(
        "Unable to load reposts:",
        requestError.response?.data ||
          requestError
      );
    }
  }

  async function loadCommunity() {
    setLoading(true);
    setError("");

    await Promise.all([
      loadPosts(),
      loadMyPosts(),
      loadReposts(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    loadCommunity();
  }, []);

  function clearFileInputs() {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function resetPublisher() {
    setForm(emptyForm);
    setImage(null);
    setVideo(null);
    setComposerOpen(false);
    clearFileInputs();
  }

  function selectPostType(postType) {
    setForm((previous) => ({
      ...emptyForm,
      location_name: previous.location_name,
      latitude: previous.latitude,
      longitude: previous.longitude,
      post_type: postType,
    }));

    setComposerOpen(true);
    setImage(null);
    setVideo(null);
    setError("");
    setSuccess("");
    clearFileInputs();
  }

  function validateBeforeSubmit() {
    const title = form.title.trim();
    const text = form.text.trim();

    if (
      form.post_type === "article" &&
      !title
    ) {
      return "Please enter an article title.";
    }

    if (
      ["post", "article"].includes(
        form.post_type
      ) &&
      !text
    ) {
      return "Please enter some content.";
    }

    if (
      form.post_type === "image" &&
      !image
    ) {
      return "Please select an image.";
    }

    if (
      form.post_type === "video" &&
      !video
    ) {
      return "Please select a video.";
    }

    return "";
  }

  async function createPost(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateBeforeSubmit();

    if (validationError) {
      setError(validationError);
      return;
    }

    setPublishing(true);

    try {
      const formData = new FormData();

      formData.append(
        "post_type",
        form.post_type
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "text",
        form.text.trim()
      );

      formData.append(
        "location_name",
        form.location_name.trim()
      );

      if (form.latitude) {
        formData.append(
          "latitude",
          form.latitude
        );
      }

      if (form.longitude) {
        formData.append(
          "longitude",
          form.longitude
        );
      }

      if (image) {
        formData.append("image", image);
      }

      if (video) {
        formData.append("video", video);
      }

      await api.post("/posts/", formData);

      const publishedType =
        form.post_type === "article"
          ? "Article"
          : form.post_type === "image"
            ? "Image"
            : form.post_type === "video"
              ? "Video"
              : "Post";

      resetPublisher();

      setSuccess(
        `${publishedType} published successfully.`
      );

      await loadCommunity();
    } catch (requestError) {
      console.error(
        "Unable to publish content:",
        requestError.response?.data ||
          requestError
      );

      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    } finally {
      setPublishing(false);
    }
  }

  function addCurrentLocation() {
    setError("");
    setSuccess("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: Number(
            position.coords.latitude
          ).toFixed(6),
          longitude: Number(
            position.coords.longitude
          ).toFixed(6),
        }));

        setSuccess(
          "Current location coordinates added."
        );
        setLocating(false);
      },
      () => {
        setError(
          "FoodKindl could not access your location."
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  async function reactToPost(
    event,
    post,
    reactionType
  ) {
    event.preventDefault();
    event.stopPropagation();

    setOpenReactionPostId(null);

    try {
      if (
        post.my_reaction === reactionType
      ) {
        const response = await api.delete(
          `/posts/${post.id}/remove_reaction/`
        );

        updatePost(post.id, {
          my_reaction:
            response.data.my_reaction,
          reaction_count:
            response.data.reaction_count,
          reaction_summary:
            response.data.reaction_summary,
        });

        return;
      }

      const response = await api.post(
        `/posts/${post.id}/react/`,
        {
          reaction_type: reactionType,
        }
      );

      updatePost(post.id, {
        my_reaction:
          response.data.my_reaction,
        reaction_count:
          response.data.reaction_count,
        reaction_summary:
          response.data.reaction_summary,
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function toggleSave(event, post) {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await api.post(
        `/posts/${post.id}/toggle_save/`
      );

      updatePost(post.id, {
        saved_by_me:
          response.data.saved,
      });

      setSuccess(
        response.data.saved
          ? "Post saved successfully."
          : "Post removed from saved posts."
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function shareToCommunity(
    event,
    post
  ) {
    event.preventDefault();
    event.stopPropagation();

    const message = window.prompt(
      "Add your thoughts to this repost (optional):",
      ""
    );

    if (message === null) {
      return;
    }

    try {
      const response = await api.post(
        `/posts/${post.id}/share_to_community/`,
        {
          message: message.trim(),
        }
      );

      updatePost(post.id, {
        community_share_count:
          (post.community_share_count || 0) +
          1,
        share_count:
          (post.share_count || 0) + 1,
      });

      setSuccess(
        "Post reposted successfully."
      );

      await loadReposts();

      if (
        response.data?.shared_by?.id ===
        user?.id
      ) {
        await loadMyPosts();
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }

  async function shareExternally(
    event,
    post
  ) {
    event.preventDefault();
    event.stopPropagation();

    const shareUrl =
      `${window.location.origin}/community/post/${post.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            post.title ||
            "FoodKindl community post",
          text:
            post.text ||
            "View this FoodKindl post.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setSuccess(
          "Post link copied successfully."
        );
      }
    } catch (shareError) {
      if (
        shareError?.name !==
        "AbortError"
      ) {
        console.error(
          "Unable to share:",
          shareError
        );
      }
    }
  }

  async function recordUniqueView(post) {
    const storageKey =
      `foodkindl-view-${post.id}`;

    if (
      sessionStorage.getItem(
        storageKey
      )
    ) {
      return;
    }

    sessionStorage.setItem(
      storageKey,
      "true"
    );

    try {
      const response = await api.post(
        `/posts/${post.id}/record_view/`
      );

      updatePost(post.id, {
        unique_view_count:
          response.data.unique_view_count,
      });
    } catch (requestError) {
      sessionStorage.removeItem(
        storageKey
      );
    }
  }

  function isGovernmentIdVerified(member) {
    return Boolean(
      member?.profile?.is_verified === true &&
      member?.profile?.verification_status === "approved"
    );
  }

  function openDirectMessage(
    event,
    member
  ) {
    event.preventDefault();
    event.stopPropagation();

    setError("");
    setSuccess("");

    if (!member?.id) {
      setError(
        "This member is unavailable for messaging."
      );
      return;
    }

    if (member.id === user?.id) {
      setError(
        "You cannot message yourself."
      );
      return;
    }

    /*
     * Community itself has NO ID-verification restriction.
     * Verification is required only when private messaging.
     */
    if (!isGovernmentIdVerified(user)) {
      setError(
        "Please complete Government ID verification before messaging members."
      );
      return;
    }

    if (!isGovernmentIdVerified(member)) {
      setError(
        "You can message only Government ID verified members."
      );
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "foodkindl:open-chat",
        {
          detail: {
            member,
          },
        }
      )
    );
  }

  function openPost(post) {
    recordUniqueView(post);

    navigate(
      `/community/post/${post.id}`
    );
  }

  function getReactionEmoji(
    reactionType
  ) {
    return (
      REACTIONS.find(
        (reaction) =>
          reaction.value ===
          reactionType
      )?.emoji || "👍"
    );
  }

  const savedPosts = posts.filter(
    (post) => post.saved_by_me
  );

  const normalFeedItems =
    posts.map((post) => ({
      itemType: "post",
      createdAt: post.created_at,
      post,
    }));

  const repostFeedItems =
    reposts
      .filter(
        (repost) =>
          repost.original_post
      )
      .map((repost) => ({
        itemType: "repost",
        createdAt: repost.created_at,
        repost,
        post:
          repost.original_post,
      }));

  const combinedFeed = [
    ...normalFeedItems,
    ...repostFeedItems,
  ].sort(
    (first, second) =>
      new Date(second.createdAt) -
      new Date(first.createdAt)
  );

  const visibleFeed =
    activeTab === "feed"
      ? combinedFeed
      : activeTab === "saved"
        ? savedPosts.map(
            (post) => ({
              itemType: "post",
              createdAt:
                post.created_at,
              post,
            })
          )
        : myPosts.map(
            (post) => ({
              itemType: "post",
              createdAt:
                post.created_at,
              post,
            })
          );

  function renderFeedCard(item) {
    const isRepost =
      item.itemType === "repost";

    const repost =
      isRepost
        ? item.repost
        : null;

    const post = item.post;

    if (!post) {
      return null;
    }

    const authorName =
      getAuthorName(post.author);

    const authorImage =
      getAuthorImage(post.author);

    return (
      <article
        className="feed-card community-card-link"
        key={
          isRepost
            ? `repost-${repost.id}`
            : `post-${post.id}`
        }
        role="button"
        tabIndex={0}
        onClick={() =>
          openPost(post)
        }
      >
        {isRepost && (
          <div className="repost-header">
            <Repeat2 size={15} />

            <strong>
              {getAuthorName(
                repost.shared_by
              )}
            </strong>

            <span>   reposted this</span>
          </div>
        )}

        {isRepost &&
          repost.message && (
            <div className="repost-message">
              {repost.message}
            </div>
          )}

        <div className="feed-author">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="community-avatar"
            />
          ) : (
            <div className="avatar-mini">
              {getAuthorInitial(
                post.author
              )}
            </div>
          )}

          <div>
            <strong>{authorName}</strong>

            <small>
              {new Date(
                post.created_at
              ).toLocaleString()}
            </small>
          </div>
        </div>

        <span className="post-type-label">
          {post.post_type || "post"}
        </span>

        {post.location_name && (
          <div className="post-location">
            <MapPin size={15} />
            {post.location_name}
          </div>
        )}

        {post.title && (
          <h2 className="community-card-title">
            {post.title}
          </h2>
        )}

        {post.text && (
          <p className="community-card-text">
            {post.text.length > 500
              ? `${post.text.slice(
                  0,
                  500
                )}...`
              : post.text}
          </p>
        )}

        {post.image && (
          <div className="post-media">
            <img
              src={getMediaUrl(
                post.image
              )}
              alt={
                post.title ||
                "FoodKindl community post"
              }
              className="post-image"
              loading="lazy"
            />
          </div>
        )}

        {post.video && (
          <div className="post-media">
            <video
              src={getMediaUrl(
                post.video
              )}
              className="post-video"
              controls
              playsInline
              preload="metadata"
              onPlay={() =>
                recordUniqueView(post)
              }
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              Your browser does not
              support video playback.
            </video>
          </div>
        )}

        <div className="community-metrics">
          <span>
            {post.reaction_count || 0}
            {" "}reactions
          </span>

          <span>
            {post.comment_count || 0}
            {" "}comments
          </span>

          <span>
            {post.unique_view_count || 0}
            {" "}views
          </span>

          <span>
            {post.community_share_count ||
              0}
            {" "}reposts
          </span>
        </div>

        <div className="community-interaction-bar">
          <div className="reaction-control">
            <button
              type="button"
              className={
                post.my_reaction
                  ? "interaction-button reacted"
                  : "interaction-button"
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setOpenReactionPostId(
                  openReactionPostId ===
                    post.id
                    ? null
                    : post.id
                );
              }}
            >
              <span>
                {getReactionEmoji(
                  post.my_reaction
                )}
              </span>

              {post.my_reaction
                ? post.my_reaction
                : "React"}
            </button>

            {openReactionPostId ===
              post.id && (
              <div
                className="reaction-picker"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                {REACTIONS.map(
                  (reaction) => (
                    <button
                      type="button"
                      key={
                        reaction.value
                      }
                      title={
                        reaction.label
                      }
                      className={
                        post.my_reaction ===
                        reaction.value
                          ? "reaction-option selected"
                          : "reaction-option"
                      }
                      onClick={(event) =>
                        reactToPost(
                          event,
                          post,
                          reaction.value
                        )
                      }
                    >
                      <span>
                        {
                          reaction.emoji
                        }
                      </span>

                      <small>
                        {
                          reaction.label
                        }
                      </small>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {post.author?.id !==
            user?.id && (
            <button
              type="button"
              className="interaction-button"
              onClick={(event) =>
                openDirectMessage(
                  event,
                  post.author
                )
              }
            >
              <MessagesSquare
                size={19}
              />
              Message
            </button>
          )}

          <button
            type="button"
            className="interaction-button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openPost(post);
            }}
          >
            <MessageCircle size={19} />
            Comment
          </button>

          <button
            type="button"
            className={
              post.saved_by_me
                ? "interaction-button saved"
                : "interaction-button"
            }
            onClick={(event) =>
              toggleSave(
                event,
                post
              )
            }
          >
            <Bookmark
              size={19}
              fill={
                post.saved_by_me
                  ? "currentColor"
                  : "none"
              }
            />

            {post.saved_by_me
              ? "Saved"
              : "Save"}
          </button>

          <button
            type="button"
            className="interaction-button"
            onClick={(event) =>
              shareToCommunity(
                event,
                post
              )
            }
          >
            <Repeat2 size={19} />
            Repost
          </button>

          <button
            type="button"
            className="interaction-button"
            onClick={(event) =>
              shareExternally(
                event,
                post
              )
            }
          >
            <Share2 size={19} />
            Share
          </button>
        </div>
      </article>
    );
  }

  return (
    <main className="app-page community-page">
      <div className="app-heading community-page-heading">
  <div>
    <div className="eyebrow left">
      Community
    </div>

    <h1>
      Food stories and moments
    </h1>

    <p>
      Share a post, publish an
      article, upload an image,
      or share a video.
    </p>
  </div>
</div>


{/* <AIRecipeSearch /> */}


<div
  className="community-tabs"
  role="tablist"
>
        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab === "feed"
          }
          className={
            activeTab === "feed"
              ? "community-tab active"
              : "community-tab"
          }
          onClick={() =>
            setActiveTab("feed")
          }
        >
          <MessageSquare size={18} />
          Feed
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab === "saved"
          }
          className={
            activeTab === "saved"
              ? "community-tab active"
              : "community-tab"
          }
          onClick={() =>
            setActiveTab("saved")
          }
        >
          <Bookmark size={18} />
          Saved
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab === "my-posts"
          }
          className={
            activeTab === "my-posts"
              ? "community-tab active"
              : "community-tab"
          }
          onClick={() =>
            setActiveTab("my-posts")
          }
        >
          <MessageSquare size={18} />
          My Posts
        </button>
      </div>

      <div className="community-layout">
        <section className="community-main">
          <div className="community-feed-section">
            <div className="community-feed-heading">
              <div>
                <div className="eyebrow left">
                  {activeTab === "saved"
                    ? "Saved"
                    : activeTab ===
                        "my-posts"
                      ? "My Posts"
                      : "Community Feed"}
                </div>

                <h2>
                  {activeTab === "saved"
                    ? "Posts you saved"
                    : activeTab ===
                        "my-posts"
                      ? "Posts you published"
                      : "Posts and reposts from other members"}
                </h2>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  loadCommunity
                }
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="app-panel">
                Loading posts...
              </div>
            ) : visibleFeed.length ===
              0 ? (
              <div className="app-panel community-empty-state">
                {activeTab === "saved"
                  ? "You have not saved any posts yet."
                  : activeTab ===
                      "my-posts"
                    ? "You have not published any posts yet."
                    : "No community posts yet."}
              </div>
            ) : (
              <div className="feed-list">
                {visibleFeed.map(
                  renderFeedCard
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="community-publish-sidebar">
          <div className="quick-publisher-card">
            <div className="quick-publisher-top">
              {getAuthorImage(user) ? (
                <img
                  src={getAuthorImage(
                    user
                  )}
                  alt={getAuthorName(
                    user
                  )}
                  className="community-avatar"
                />
              ) : (
                <div className="avatar-mini">
                  {getAuthorInitial(
                    user
                  )}
                </div>
              )}

              <button
                type="button"
                className="start-post-button"
                onClick={() =>
                  selectPostType(
                    "post"
                  )
                }
              >
                Start a post
              </button>
            </div>

            <div className="quick-publisher-actions">
              <button
                type="button"
                onClick={() =>
                  selectPostType(
                    "video"
                  )
                }
              >
                <Video size={20} />
                Video
              </button>

              <button
                type="button"
                onClick={() =>
                  selectPostType(
                    "image"
                  )
                }
              >
                <ImageIcon size={20} />
                Photo
              </button>

              <button
                type="button"
                onClick={() =>
                  selectPostType(
                    "article"
                  )
                }
              >
                <FileText size={20} />
                Write article
              </button>
            </div>
          </div>

          {composerOpen && (
            <form
              className="app-panel community-publisher community-publisher-sidebar"
              onSubmit={createPost}
              encType="multipart/form-data"
            >
              <div className="publisher-modal-heading">
                <div>
                  <strong>
                    {form.post_type ===
                    "article"
                      ? "Write article"
                      : form.post_type ===
                          "image"
                        ? "Share photo"
                        : form.post_type ===
                            "video"
                          ? "Share video"
                          : "Create post"}
                  </strong>

                  <small>
                    {getAuthorName(
                      user
                    )}
                  </small>
                </div>

                <button
                  type="button"
                  className="publisher-close-button"
                  onClick={() => {
                    setComposerOpen(
                      false
                    );
                    setError("");
                    setSuccess("");
                  }}
                >
                  ×
                </button>
              </div>

              {form.post_type ===
                "article" && (
                <input
                  type="text"
                  placeholder="Article title"
                  value={form.title}
                  maxLength={200}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        title:
                          event.target
                            .value,
                      })
                    )
                  }
                  required
                />
              )}

              <textarea
                className="community-sidebar-textarea"
                placeholder={
                  form.post_type ===
                  "article"
                    ? "Write your article..."
                    : form.post_type ===
                        "image"
                      ? "Add a caption..."
                      : form.post_type ===
                          "video"
                        ? "Describe your video..."
                        : "What's on your mind?"
                }
                value={form.text}
                maxLength={5000}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      text:
                        event.target
                          .value,
                    })
                  )
                }
                required={
                  form.post_type ===
                    "post" ||
                  form.post_type ===
                    "article"
                }
              />

              <label className="publisher-location-field">
                Location

                <input
                  type="text"
                  placeholder="Bengaluru, Indiranagar..."
                  value={
                    form.location_name
                  }
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        location_name:
                          event.target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="secondary-button publisher-location-button"
                onClick={
                  addCurrentLocation
                }
                disabled={locating}
              >
                <MapPin size={17} />

                {locating
                  ? "Finding Location..."
                  : "Use Current Location"}
              </button>

              {form.latitude &&
                form.longitude && (
                  <p className="location-coordinate-text">
                    Coordinates:{" "}
                    {form.latitude},{" "}
                    {form.longitude}
                  </p>
                )}

              {form.post_type ===
                "image" && (
                <label className="publisher-upload-field">
                  Upload Photo

                  <input
                    ref={
                      imageInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(
                      event
                    ) =>
                      setImage(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                    required
                  />
                </label>
              )}

              {form.post_type ===
                "video" && (
                <label className="publisher-upload-field">
                  Upload Video

                  <input
                    ref={
                      videoInputRef
                    }
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(
                      event
                    ) =>
                      setVideo(
                        event.target
                          .files?.[0] ||
                          null
                      )
                    }
                    required
                  />
                </label>
              )}

              {image && (
                <p className="form-message">
                  Selected image:{" "}
                  {image.name}
                </p>
              )}

              {video && (
                <p className="form-message">
                  Selected video:{" "}
                  {video.name}
                </p>
              )}

              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}

              {success && (
                <p className="form-message">
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="primary-button publisher-submit-button"
                disabled={
                  publishing
                }
              >
                {publishing
                  ? "Publishing..."
                  : "Publish"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}