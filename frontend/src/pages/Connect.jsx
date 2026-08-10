import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  MapPin,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../api";
import { useAuth } from "../context/AuthContext";


export default function Connect() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] =
    useState("discover");

  const [members, setMembers] =
    useState([]);

  const [
    incomingRequests,
    setIncomingRequests,
  ] = useState([]);

  const [
    sentRequests,
    setSentRequests,
  ] = useState([]);

  const [
    connections,
    setConnections,
  ] = useState([]);

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "http://127.0.0.1:8000";


  // -----------------------------------------
  // Media helpers
  // -----------------------------------------

  function getMediaUrl(path) {
    if (!path) {
      return "";
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_BASE}${path}`;
  }


  function getMemberName(member) {
    return (
      member?.full_name ||
      [
        member?.first_name,
        member?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      member?.email ||
      "FoodKindl Member"
    );
  }


  function getMemberInitial(member) {
    return getMemberName(member)
      .charAt(0)
      .toUpperCase();
  }


  function getMemberPhoto(member) {
    return getMediaUrl(
      member?.profile
        ?.profile_image_1
    );
  }


  function getOtherMember(connection) {
    if (
      connection.sender?.id ===
      user?.id
    ) {
      return connection.receiver;
    }

    return connection.sender;
  }


  // -----------------------------------------
  // Error helper
  // -----------------------------------------

  function getErrorMessage(data) {
    if (!data) {
      return (
        "The request could not be completed."
      );
    }

    if (
      typeof data === "string"
    ) {
      return data;
    }

    return (
      data?.receiver_id?.[0] ||
      data?.non_field_errors?.[0] ||
      data?.detail ||
      "The request could not be completed."
    );
  }


  // -----------------------------------------
  // Load members
  // -----------------------------------------

  async function loadMembers(
    query = ""
  ) {
    setError("");

    try {
      const response =
        await api.get(
          "/members/",
          {
            params: {
              q: query.trim(),
            },
          }
        );

      const memberList =
        response.data?.results ||
        response.data;

      setMembers(
        Array.isArray(memberList)
          ? memberList
          : []
      );
    } catch (requestError) {
      console.error(
        "Unable to load members:",
        requestError.response?.status,
        requestError.response?.data ||
          requestError
      );

      const data =
        requestError.response?.data;

      setError(
        data?.detail ||
          data?.message ||
          (
            typeof data ===
            "string"
              ? data
              : ""
          ) ||
          "Registered members could not be loaded."
      );
    }
  }


  // -----------------------------------------
  // Load connection data
  // -----------------------------------------

  async function loadConnections() {
    try {
      const [
        incomingResponse,
        sentResponse,
        acceptedResponse,
      ] = await Promise.all([
        api.get(
          "/connections/incoming/"
        ),

        api.get(
          "/connections/sent/"
        ),

        api.get(
          "/connections/accepted/"
        ),
      ]);

      setIncomingRequests(
        incomingResponse.data
          ?.results ||
          incomingResponse.data ||
          []
      );

      setSentRequests(
        sentResponse.data
          ?.results ||
          sentResponse.data ||
          []
      );

      setConnections(
        acceptedResponse.data
          ?.results ||
          acceptedResponse.data ||
          []
      );
    } catch (requestError) {
      console.error(
        "Unable to load connections:",
        requestError
      );

      setError(
        "Connection details could not be loaded."
      );
    }
  }


  // -----------------------------------------
  // Initial load
  // -----------------------------------------

  async function loadPage() {
    setLoading(true);
    setError("");

    await Promise.all([
      loadMembers(),
      loadConnections(),
    ]);

    setLoading(false);
  }


  useEffect(() => {
    loadPage();
  }, []);


  // -----------------------------------------
  // Search members
  // -----------------------------------------

  async function searchMembers(
    event
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    await loadMembers(
      searchValue
    );

    setLoading(false);
  }


  async function showAllMembers() {
    setSearchValue("");

    setLoading(true);
    setError("");
    setMessage("");

    await loadMembers("");

    setLoading(false);
  }


  // -----------------------------------------
  // Connection actions
  // -----------------------------------------

  async function sendRequest(
    memberId
  ) {
    setError("");
    setMessage("");

    try {
      await api.post(
        "/connections/",
        {
          receiver_id: memberId,
        }
      );

      setMessage(
        "Connection request sent."
      );

      await Promise.all([
        loadMembers(
          searchValue
        ),
        loadConnections(),
      ]);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }


  async function acceptRequest(
    connectionId
  ) {
    setError("");
    setMessage("");

    try {
      await api.post(
        `/connections/${connectionId}/accept/`
      );

      setMessage(
        "Connection request accepted."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }


  async function declineRequest(
    connectionId
  ) {
    setError("");
    setMessage("");

    try {
      await api.post(
        `/connections/${connectionId}/decline/`
      );

      setMessage(
        "Connection request declined."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }


  async function cancelRequest(
    connectionId
  ) {
    setError("");
    setMessage("");

    try {
      await api.post(
        `/connections/${connectionId}/cancel/`
      );

      setMessage(
        "Connection request cancelled."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }


  async function removeConnection(
    connectionId
  ) {
    const confirmed =
      window.confirm(
        "Remove this member from your connections?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.post(
        `/connections/${connectionId}/remove/`
      );

      setMessage(
        "Connection removed."
      );

      await loadPage();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError.response?.data
        )
      );
    }
  }


  // -----------------------------------------
  // Member UI
  // -----------------------------------------

  function renderMemberAvatar(
    member
  ) {
    const photo =
      getMemberPhoto(member);

    if (photo) {
      return (
        <img
          src={photo}
          alt={
            getMemberName(
              member
            )
          }
          className="connect-member-photo"
        />
      );
    }

    return (
      <div className="connect-member-placeholder">
        {getMemberInitial(
          member
        )}
      </div>
    );
  }


  function renderMemberDetails(
    member
  ) {
    const profile =
      member?.profile || {};

    const dietaryLabel =
      profile.dietary_preference
        ? profile
            .dietary_preference
            .replaceAll(
              "_",
              " "
            )
        : "";

    return (
      <>
        <h3>
          {getMemberName(member)}
        </h3>

        {profile.role && (
          <p className="connect-member-role">
            {profile.role}
          </p>
        )}

        {(
          profile.city ||
          profile.locality
        ) && (
          <p className="connect-member-location">
            <MapPin size={15} />

            {[
              profile.locality,
              profile.city,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {profile.college_workplace && (
          <p>
            {
              profile
                .college_workplace
            }
          </p>
        )}

        {dietaryLabel && (
          <span className="connect-preference">
            {dietaryLabel}
          </span>
        )}
      </>
    );
  }


  if (loading) {
    return (
      <main className="app-page">
        <div className="app-panel">
          Loading FoodKindl members...
        </div>
      </main>
    );
  }


  return (
    <main className="app-page">
      <div className="app-heading">
        <div>
          <div className="eyebrow left">
            FoodKindl Connect
          </div>

          <h1>
            Discover and connect
          </h1>

          <p>
            Find FoodKindl members,
            manage connection requests,
            and build your food
            community.
          </p>
        </div>
      </div>


      {/* =================================
          TOP TABS
      ================================= */}

      <div className="connect-tabs">
        <button
          type="button"
          className={
            activeTab === "discover"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab(
              "discover"
            )
          }
        >
          <Search size={18} />

          Discover Members
        </button>


        <button
          type="button"
          className={
            activeTab === "requests"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab(
              "requests"
            )
          }
        >
          <UserPlus size={18} />

          Requests

          {incomingRequests.length >
            0 && (
            <span className="connect-count">
              {
                incomingRequests
                  .length
              }
            </span>
          )}
        </button>


        <button
          type="button"
          className={
            activeTab ===
            "connections"
              ? "connect-tab active"
              : "connect-tab"
          }
          onClick={() =>
            setActiveTab(
              "connections"
            )
          }
        >
          <UsersRound size={18} />

          My Connections
        </button>
      </div>


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


      {/* =================================
          DISCOVER MEMBERS
      ================================= */}

      {activeTab === "discover" && (
        <section>
          <form
            className="app-panel connect-search-form"
            onSubmit={
              searchMembers
            }
          >
            <div className="connect-global-search">
              <Search
                size={21}
                className="connect-global-search-icon"
              />

              <input
                type="search"
                value={
                  searchValue
                }
                onChange={(
                  event
                ) =>
                  setSearchValue(
                    event.target
                      .value
                  )
                }
                placeholder="Search by name, postcode, city, locality, workplace, role or food preference..."
                autoComplete="off"
              />

              <button
                type="submit"
                className="primary-button connect-search-button"
              >
                <Search
                  size={18}
                />

                Search
              </button>
            </div>


            <div className="connect-search-help">
              Try:
              {" "}
              <span>Alex</span>
              {" · "}
              <span>560001</span>
              {" · "}
              <span>Bengaluru</span>
              {" · "}
              <span>Scaler</span>
              {" · "}
              <span>Engineer</span>
              {" · "}
              <span>Vegetarian</span>
            </div>


            <button
              type="button"
              className="connect-show-all"
              onClick={
                showAllMembers
              }
            >
              Show All Members
            </button>
          </form>


          {/* RESULTS */}

          <div className="connect-member-grid">
            {members.length ===
            0 ? (
              <div className="app-panel">
                No members matched
                your search.
              </div>
            ) : (
              members.map(
                (member) => (
                  <article
                    className="connect-member-card"
                    key={
                      member.id
                    }
                  >
                    {renderMemberAvatar(
                      member
                    )}

                    <div className="connect-member-info">
                      {renderMemberDetails(
                        member
                      )}

                      <div className="connect-card-actions">
                        <Link
                          to={`/connect/member/${member.id}`}
                          className="secondary-button"
                        >
                          View Profile
                        </Link>


                        {member.connection_status ===
                          "none" && (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              sendRequest(
                                member.id
                              )
                            }
                          >
                            <UserPlus
                              size={
                                17
                              }
                            />

                            Connect
                          </button>
                        )}


                        {member.connection_status ===
                          "request_sent" && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              cancelRequest(
                                member.connection_id
                              )
                            }
                          >
                            <Clock3
                              size={
                                17
                              }
                            />

                            Request Sent
                          </button>
                        )}


                        {member.connection_status ===
                          "request_received" && (
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() =>
                              setActiveTab(
                                "requests"
                              )
                            }
                          >
                            Review Request
                          </button>
                        )}


                        {member.connection_status ===
                          "connected" && (
                          <span className="connected-badge">
                            <UserCheck
                              size={
                                17
                              }
                            />

                            Connected
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </section>
      )}


      {/* =================================
          REQUESTS
      ================================= */}

      {activeTab === "requests" && (
        <section className="connect-request-layout">

          <div>
            <div className="connect-section-heading">
              <h2>
                Incoming Requests
              </h2>

              <span>
                {
                  incomingRequests
                    .length
                }
              </span>
            </div>


            <div className="connect-list">
              {incomingRequests.length ===
              0 ? (
                <div className="app-panel">
                  No incoming
                  requests.
                </div>
              ) : (
                incomingRequests.map(
                  (connection) => {
                    const member =
                      connection.sender;

                    return (
                      <article
                        className="connect-request-card"
                        key={
                          connection.id
                        }
                      >
                        {renderMemberAvatar(
                          member
                        )}

                        <div className="connect-request-info">
                          {renderMemberDetails(
                            member
                          )}

                          <div className="connect-card-actions">
                            <Link
                              to={`/connect/member/${member.id}`}
                              className="secondary-button"
                            >
                              View Profile
                            </Link>

                            <button
                              type="button"
                              className="primary-button"
                              onClick={() =>
                                acceptRequest(
                                  connection.id
                                )
                              }
                            >
                              <Check
                                size={
                                  17
                                }
                              />
                              Accept
                            </button>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                declineRequest(
                                  connection.id
                                )
                              }
                            >
                              <X
                                size={
                                  17
                                }
                              />
                              Decline
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </div>


          <div>
            <div className="connect-section-heading">
              <h2>
                Sent Requests
              </h2>

              <span>
                {
                  sentRequests
                    .length
                }
              </span>
            </div>


            <div className="connect-list">
              {sentRequests.length ===
              0 ? (
                <div className="app-panel">
                  No pending sent
                  requests.
                </div>
              ) : (
                sentRequests.map(
                  (connection) => {
                    const member =
                      connection.receiver;

                    return (
                      <article
                        className="connect-request-card"
                        key={
                          connection.id
                        }
                      >
                        {renderMemberAvatar(
                          member
                        )}

                        <div className="connect-request-info">
                          {renderMemberDetails(
                            member
                          )}

                          <div className="connect-card-actions">
                            <Link
                              to={`/connect/member/${member.id}`}
                              className="secondary-button"
                            >
                              View Profile
                            </Link>

                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() =>
                                cancelRequest(
                                  connection.id
                                )
                              }
                            >
                              <X
                                size={
                                  17
                                }
                              />
                              Cancel Request
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              )}
            </div>
          </div>
        </section>
      )}


      {/* =================================
          MY CONNECTIONS
      ================================= */}

      {activeTab ===
        "connections" && (
        <section>
          <div className="connect-section-heading">
            <h2>
              My Connections
            </h2>

            <span>
              {connections.length}
            </span>
          </div>


          <div className="connect-member-grid">
            {connections.length ===
            0 ? (
              <div className="app-panel">
                You do not have any
                connections yet.
              </div>
            ) : (
              connections.map(
                (connection) => {
                  const member =
                    getOtherMember(
                      connection
                    );

                  return (
                    <article
                      className="connect-member-card"
                      key={
                        connection.id
                      }
                    >
                      {renderMemberAvatar(
                        member
                      )}

                      <div className="connect-member-info">
                        {renderMemberDetails(
                          member
                        )}

                        <div className="connect-card-actions">
                          <Link
                            to={`/connect/member/${member.id}`}
                            className="primary-button"
                          >
                            View Profile
                          </Link>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              removeConnection(
                                connection.id
                              )
                            }
                          >
                            <UserMinus
                              size={
                                17
                              }
                            />
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}