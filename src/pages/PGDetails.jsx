import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

import { auth, db } from "../services/firebase";
import "./PGDetails.css";

function PGDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState(null);

  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [message, setMessage] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // =====================================================
  // AUTH
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // =====================================================
  // LOAD PG
  // =====================================================

  useEffect(() => {
    const fetchPG = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        console.log("PG Details ID:", id);

        if (!id) {
          setErrorMessage("PG ID is missing.");
          setLoading(false);
          return;
        }

        // Get PG directly using Firestore document ID
        const pgRef = doc(db, "pgs", id);
        const pgSnapshot = await getDoc(pgRef);

        console.log("PG exists:", pgSnapshot.exists());

        if (!pgSnapshot.exists()) {
          setPg(null);
          setErrorMessage(
            "This PG could not be found. It may have been deleted."
          );
          setLoading(false);
          return;
        }

        const data = pgSnapshot.data();

        console.log("PG data:", data);

        setPg({
          id: pgSnapshot.id,
          ...data,
        });
      } catch (error) {
        console.error("Error loading PG:", error);

        setPg(null);

        if (error.code === "permission-denied") {
          setErrorMessage(
            "You do not have permission to view this PG."
          );
        } else if (error.code === "failed-precondition") {
          setErrorMessage(
            "Firebase connection problem. Please try again."
          );
        } else {
          setErrorMessage(
            "Unable to load PG details. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPG();
  }, [id]);

  // =====================================================
  // FACILITIES
  // =====================================================

  const getFacilities = () => {
    if (!pg?.facilities) {
      return [];
    }

    const facilities = pg.facilities;

    if (typeof facilities === "string") {
      return facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (Array.isArray(facilities)) {
      return facilities;
    }

    if (typeof facilities === "object") {
      const facilityNames = {
        wifi: "Wi-Fi",
        food: "Food",
        ac: "AC",
        laundry: "Laundry",
        parking: "Parking",
        security: "Security",
      };

      return Object.keys(facilities)
        .filter((key) => facilities[key] === true)
        .map((key) => facilityNames[key] || key);
    }

    return [];
  };

  // =====================================================
  // GOOGLE MAPS
  // =====================================================

  const handleDirections = () => {
    if (!pg) return;

    const location = [
      pg.pgName,
      pg.address,
      pg.nearbyCollege || pg.college,
    ]
      .filter(Boolean)
      .join(", ");

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`;

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  // =====================================================
  // CALL OWNER
  // =====================================================

  const handleCall = () => {
    if (!pg?.phone) {
      alert("Owner phone number is not available.");
      return;
    }

    window.location.href = `tel:${String(pg.phone).replace(/\D/g, "")}`;
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const handleWhatsApp = () => {
    if (!pg?.phone) {
      alert("Owner phone number is not available.");
      return;
    }

    let phone = String(pg.phone).replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const whatsappMessage = `Hello, I am interested in ${
      pg.pgName || "your PG"
    }. I found your PG on Smart PG Finder.`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // =====================================================
  // BOOKING / VISIT REQUEST
  // =====================================================

  const handleBookingRequest = async (event) => {
    event.preventDefault();

    setBookingMessage("");

    if (!user) {
      navigate("/student-login");
      return;
    }

    if (!pg) {
      return;
    }

    if (!visitDate || !visitTime) {
      setBookingMessage(
        "Please select your preferred visit date and time."
      );
      return;
    }

    try {
      setBookingLoading(true);

      await addDoc(collection(db, "bookingRequests"), {
        pgId: pg.id,
        pgName: pg.pgName || "PG",
        ownerId: pg.ownerId || "",
        studentId: user.uid,
        studentEmail: user.email || "",
        visitDate: visitDate,
        visitTime: visitTime,
        message: message.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setBookingMessage(
        "Visit request sent successfully! Waiting for owner response."
      );

      setVisitDate("");
      setVisitTime("");
      setMessage("");
    } catch (error) {
      console.error("Booking request error:", error);

      if (error.code === "permission-denied") {
        setBookingMessage(
          "Permission denied. Please check your Firebase rules."
        );
      } else {
        setBookingMessage(
          "Unable to send request. Please try again."
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="pg-details-page">
        <div className="pg-details-loading">
          <div className="loading-spinner"></div>
          <h2>Loading PG Details...</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND / ERROR
  // =====================================================

  if (!pg) {
    return (
      <div className="pg-details-page">
        <div className="pg-error-card">
          <div className="pg-error-icon">🏠</div>

          <h1>PG Not Found</h1>

          <p>
            {errorMessage ||
              "The PG details could not be loaded."}
          </p>

          <div className="error-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/student-dashboard")}
            >
              ← Back to PG Listings
            </button>

            <button
              className="secondary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const facilities = getFacilities();

  const college =
    pg.nearbyCollege ||
    pg.college ||
    "Not specified";

  const address =
    pg.address ||
    pg.location ||
    "Location not specified";

  const roomType =
    pg.roomType ||
    "Not specified";

  const availableRooms =
    pg.availableRooms ??
    pg.rooms ??
    "Not specified";

  const price =
    pg.price !== undefined &&
    pg.price !== null &&
    pg.price !== ""
      ? pg.price
      : "Not specified";

  return (
    <div className="pg-details-page">

      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="pg-details-navbar">
        <div
          className="pg-details-logo"
          onClick={() => navigate("/student-dashboard")}
        >
          <span className="logo-icon">🏠</span>
          <span>Smart PG Finder</span>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="pg-details-container">

        {/* BACK LINK */}

        <button
          className="back-link"
          onClick={() => navigate("/student-dashboard")}
        >
          ← Back to PG Listings
        </button>

        <div className="pg-details-grid">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="pg-main-card">

            {/* IMAGE */}

            <div className="pg-main-image">

              {pg.imageUrl ? (
                <img
                  src={pg.imageUrl}
                  alt={pg.pgName || "PG"}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextSibling.style.display =
                      "flex";
                  }}
                />
              ) : null}

              <div
                className="image-fallback"
                style={{
                  display: pg.imageUrl ? "none" : "flex",
                }}
              >
                <span>🏠</span>
                <p>PG Image</p>
              </div>

              <div className="image-badge">
                ✓ Verified Listing
              </div>
            </div>

            {/* DETAILS */}

            <div className="pg-main-content">

              <div className="title-section">
                <div>
                  <p className="small-label">
                    PG ACCOMMODATION
                  </p>

                  <h1>
                    {pg.pgName || "PG Accommodation"}
                  </h1>
                </div>

                <div className="price-box">
                  <span>Starting from</span>
                  <strong>₹{price}</strong>
                  <small>/ month</small>
                </div>
              </div>

              {/* LOCATION */}

              <div className="location-box">
                <div className="location-icon">
                  📍
                </div>

                <div>
                  <strong>{address}</strong>

                  <span>
                    Near {college}
                  </span>
                </div>
              </div>

              {/* QUICK DETAILS */}

              <div className="quick-details">

                <div className="quick-item">
                  <span className="quick-icon">
                    🏫
                  </span>

                  <div>
                    <small>Nearby College</small>
                    <strong>{college}</strong>
                  </div>
                </div>

                <div className="quick-item">
                  <span className="quick-icon">
                    🛏️
                  </span>

                  <div>
                    <small>Room Type</small>
                    <strong>{roomType}</strong>
                  </div>
                </div>

                <div className="quick-item">
                  <span className="quick-icon">
                    🚪
                  </span>

                  <div>
                    <small>Available Rooms</small>
                    <strong>{availableRooms}</strong>
                  </div>
                </div>

              </div>

              {/* FACILITIES */}

              <div className="details-section">

                <div className="section-heading">
                  <span>✨</span>
                  <h2>Facilities & Amenities</h2>
                </div>

                {facilities.length > 0 ? (
                  <div className="facility-grid">
                    {facilities.map((facility) => (
                      <div
                        className="facility-item"
                        key={facility}
                      >
                        <span>✓</span>
                        {facility}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-facilities">
                    No facilities information available.
                  </div>
                )}

              </div>

              {/* OWNER CONTACT */}

              <div className="details-section">

                <div className="section-heading">
                  <span>👤</span>
                  <h2>Owner Contact</h2>
                </div>

                <div className="owner-contact-card">

                  <div className="owner-avatar">
                    👤
                  </div>

                  <div className="owner-info">
                    <strong>PG Owner</strong>
                    <span>
                      {pg.phone || "Phone number unavailable"}
                    </span>
                  </div>

                  <div className="owner-actions">

                    <button
                      className="call-btn"
                      onClick={handleCall}
                      disabled={!pg.phone}
                    >
                      📞 Call
                    </button>

                    <button
                      className="whatsapp-btn"
                      onClick={handleWhatsApp}
                      disabled={!pg.phone}
                    >
                      💬 WhatsApp
                    </button>

                  </div>

                </div>

              </div>

              {/* MAP */}

              <div className="details-section">

                <div className="section-heading">
                  <span>🗺️</span>
                  <h2>Location</h2>
                </div>

                <div className="map-preview">

                  <div className="map-icon">
                    📍
                  </div>

                  <div>
                    <strong>
                      {pg.pgName || "PG Location"}
                    </strong>

                    <p>{address}</p>
                  </div>

                  <button
                    className="directions-btn"
                    onClick={handleDirections}
                  >
                    Get Directions
                  </button>

                </div>

              </div>

            </div>
          </section>

          {/* =================================================
              RIGHT SIDE - VISIT REQUEST
          ================================================= */}

          <aside className="booking-card">

            <div className="booking-header">

              <div className="booking-icon">
                📅
              </div>

              <div>
                <h2>Visit this PG</h2>
                <p>
                  Schedule a visit with the owner
                </p>
              </div>

            </div>

            <div className="booking-divider"></div>

            <form
              onSubmit={handleBookingRequest}
              className="booking-form"
            >

              <label>
                Preferred Visit Date
              </label>

              <input
                type="date"
                value={visitDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setVisitDate(event.target.value)
                }
              />

              <label>
                Preferred Visit Time
              </label>

              <input
                type="time"
                value={visitTime}
                onChange={(event) =>
                  setVisitTime(event.target.value)
                }
              />

              <label>
                Message
                <span> (Optional)</span>
              </label>

              <textarea
                rows="4"
                placeholder="Write a message to the PG owner..."
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
              />

              {bookingMessage && (
                <div
                  className={
                    bookingMessage.includes(
                      "successfully"
                    )
                      ? "booking-success"
                      : "booking-error"
                  }
                >
                  {bookingMessage}
                </div>
              )}

              <button
                type="submit"
                className="request-btn"
                disabled={bookingLoading}
              >
                {bookingLoading
                  ? "Sending Request..."
                  : "📅 Request a Visit"}
              </button>

            </form>

            <div className="booking-note">
              🔒 Your contact information is only
              shared with the PG owner for this
              request.
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}

export default PGDetails;