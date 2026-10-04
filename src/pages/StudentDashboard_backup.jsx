import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

function StudentDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // SEARCH
  const [collegeSearch, setCollegeSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // GPS
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMode, setLocationMode] = useState(false);

  // FAVORITES
  const [favoritePGs, setFavoritePGs] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // BOOKINGS
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  // COMPARE
  const [comparePGs, setComparePGs] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // =====================================================
  // UTILITY MESSAGE
  // =====================================================

  const showMessage = (text, duration = 2500) => {
    setMessage(text);

    window.clearTimeout(showMessage.timer);

    showMessage.timer = window.setTimeout(() => {
      setMessage("");
    }, duration);
  };

  // =====================================================
  // FETCH PGs
  // =====================================================

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);

        const snapshot = await getDocs(
          collection(db, "pgs")
        );

        const pgData = snapshot.docs.map((pgDoc) => ({
          id: pgDoc.id,
          ...pgDoc.data(),
        }));

        pgData.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : new Date(0);

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : new Date(0);

          return dateB - dateA;
        });

        setPgs(pgData);
        setSearchResults(pgData);
      } catch (error) {
        console.error("Error fetching PGs:", error);
        setMessage("Unable to load PG listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchPGs();
  }, []);

  // =====================================================
  // AUTH + FAVORITES + BOOKINGS + NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          navigate("/student-login");
          return;
        }

        // ---------------- FAVORITES ----------------

        try {
          setLoadingFavorites(true);

          const favoritesRef = collection(
            db,
            "students",
            user.uid,
            "favorites"
          );

          const snapshot = await getDocs(favoritesRef);

          setFavoritePGs(
            snapshot.docs.map(
              (favoriteDoc) => favoriteDoc.id
            )
          );
        } catch (error) {
          console.error(
            "Error loading favorites:",
            error
          );
        } finally {
          setLoadingFavorites(false);
        }

        // ---------------- BOOKINGS ----------------

        try {
          setLoadingRequests(true);

          const bookingQuery = query(
            collection(db, "bookingRequests"),
            where("studentId", "==", user.uid)
          );

          const snapshot = await getDocs(
            bookingQuery
          );

          const requests = snapshot.docs.map(
            (bookingDoc) => ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            })
          );

          requests.sort((a, b) => {
            const dateA = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(0);

            const dateB = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(0);

            return dateB - dateA;
          });

          setBookingRequests(requests);
        } catch (error) {
          console.error(
            "Error loading booking requests:",
            error
          );
        } finally {
          setLoadingRequests(false);
        }

        // ---------------- NOTIFICATIONS ----------------

        try {
          setLoadingNotifications(true);

          const notificationQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid)
          );

          const snapshot = await getDocs(
            notificationQuery
          );

          const notificationData =
            snapshot.docs.map(
              (notificationDoc) => ({
                id: notificationDoc.id,
                ...notificationDoc.data(),
              })
            );

          notificationData.sort((a, b) => {
            const dateA = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(0);

            const dateB = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(0);

            return dateB - dateA;
          });

          setNotifications(notificationData);
        } catch (error) {
          console.error(
            "Error loading notifications:",
            error
          );

          setNotifications([]);
        } finally {
          setLoadingNotifications(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // =====================================================
  // FACILITY HELPERS
  // =====================================================

  const formatFacilityName = (name) => {
    return String(name)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getFacilitiesList = (facilities) => {
    if (!facilities) {
      return [];
    }

    if (Array.isArray(facilities)) {
      return facilities
        .filter(Boolean)
        .map(formatFacilityName);
    }

    if (typeof facilities === "object") {
      return Object.entries(facilities)
        .filter(([, value]) => value === true)
        .map(([key]) =>
          formatFacilityName(key)
        );
    }

    if (typeof facilities === "string") {
      return facilities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map(formatFacilityName);
    }

    return [];
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    let results = [...pgs];

    // College
    if (collegeSearch.trim() !== "") {
      const text =
        collegeSearch.trim().toLowerCase();

      results = results.filter((pg) =>
        String(pg.nearbyCollege || "")
          .toLowerCase()
          .includes(text)
      );
    }

    // Location
    if (locationSearch.trim() !== "") {
      const text =
        locationSearch.trim().toLowerCase();

      results = results.filter((pg) =>
        String(pg.address || "")
          .toLowerCase()
          .includes(text)
      );
    }

    // Price
    if (priceFilter !== "") {
      results = results.filter(
        (pg) =>
          Number(pg.price || 0) <=
          Number(priceFilter)
      );
    }

    // Room
    if (roomFilter !== "") {
      const text =
        roomFilter.trim().toLowerCase();

      results = results.filter((pg) =>
        String(pg.roomType || "")
          .toLowerCase()
          .includes(text)
      );
    }

    // Facility
    if (facilityFilter !== "") {
      const text =
        facilityFilter.trim().toLowerCase();

      results = results.filter((pg) => {
        return getFacilitiesList(
          pg.facilities
        ).some((facility) =>
          facility
            .toLowerCase()
            .includes(text)
        );
      });
    }

    setSearchResults(results);
    setHasSearched(true);

    if (results.length === 0) {
      showMessage(
        "No PG found. Try different search values."
      );
    } else {
      showMessage(
        `${results.length} PG${
          results.length === 1 ? "" : "s"
        } found.`,
        3000
      );
    }

    // Keep search results accessible without
    // forcing the user to manually find them.
    setTimeout(() => {
      document
        .getElementById("pg-list-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const clearFilters = () => {
    setCollegeSearch("");
    setLocationSearch("");
    setPriceFilter("");
    setRoomFilter("");
    setFacilityFilter("");

    setSearchResults(pgs);
    setHasSearched(false);

    showMessage("Search filters cleared.");
  };

  // =====================================================
  // DISTANCE
  // =====================================================

  const calculateDistanceKm = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const earthRadiusKm = 6371;

    const toRadians = (value) =>
      (value * Math.PI) / 180;

    const dLat = toRadians(
      lat2 - lat1
    );

    const dLon = toRadians(
      lon2 - lon1
    );

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return (
      earthRadiusKm *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )
    );
  };

  // =====================================================
  // MY LOCATION
  // =====================================================

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    setMessage(
      "📍 Getting your location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setUserLocation({
          latitude,
          longitude,
        });

        setLocationMode(true);

        const pgWithDistance = pgs.map(
          (pg) => {
            const pgLatitude =
              Number(pg.latitude);

            const pgLongitude =
              Number(pg.longitude);

            if (
              !Number.isFinite(
                pgLatitude
              ) ||
              !Number.isFinite(
                pgLongitude
              )
            ) {
              return {
                ...pg,
                distanceKm: null,
              };
            }

            return {
              ...pg,
              distanceKm:
                calculateDistanceKm(
                  latitude,
                  longitude,
                  pgLatitude,
                  pgLongitude
                ),
            };
          }
        );

        pgWithDistance.sort((a, b) => {
          if (
            a.distanceKm === null
          ) {
            return 1;
          }

          if (
            b.distanceKm === null
          ) {
            return -1;
          }

          return (
            a.distanceKm -
            b.distanceKm
          );
        });

        setSearchResults(
          pgWithDistance
        );

        setHasSearched(true);
        setLocationLoading(false);

        showMessage(
          "📍 Location detected. PGs are sorted by distance.",
          3000
        );
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        if (error.code === 1) {
          showMessage(
            "Location permission denied. Please allow location permission."
          );
        } else if (error.code === 2) {
          showMessage(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          showMessage(
            "Location request timed out. Please try again."
          );
        } else {
          showMessage(
            "Unable to get your location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // CLEAR LOCATION
  // =====================================================

  const clearLocationMode = () => {
    setUserLocation(null);
    setLocationMode(false);
    setSearchResults(pgs);
    setHasSearched(false);

    showMessage(
      "Location search cleared."
    );
  };

  // =====================================================
  // FAVORITE
  // =====================================================

  const handleFavorite = async (pg) => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/student-login");
      return;
    }

    try {
      const favoriteRef = doc(
        db,
        "students",
        user.uid,
        "favorites",
        pg.id
      );

      if (favoritePGs.includes(pg.id)) {
        await deleteDoc(favoriteRef);

        setFavoritePGs((previous) =>
          previous.filter(
            (id) => id !== pg.id
          )
        );

        showMessage(
          "Removed from favorites."
        );
      } else {
        await setDoc(favoriteRef, {
          pgId: pg.id,
          pgName: pg.pgName || "",
          ownerId: pg.ownerId || "",
          location: pg.address || "",
          price: pg.price || "",
          imageUrl: pg.imageUrl || "",
        });

        setFavoritePGs((previous) => [
          ...previous,
          pg.id,
        ]);

        showMessage(
          "Added to favorites ❤️"
        );
      }
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      showMessage(
        "Unable to update favorite."
      );
    }
  };

  // =====================================================
  // DIRECTIONS
  // =====================================================

  const handleGetDirections = (pg) => {
    const latitude = Number(
      pg.latitude
    );

    const longitude = Number(
      pg.longitude
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      alert(
        "Directions unavailable because this PG has no valid GPS coordinates."
      );
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // CALL
  // =====================================================

  const handleCallOwner = (pg) => {
    if (!pg.phone) {
      showMessage(
        "Owner phone number is not available."
      );
      return;
    }

    const phone = String(
      pg.phone
    ).replace(/[^0-9+]/g, "");

    window.location.href =
      `tel:${phone}`;
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const handleWhatsAppOwner = (pg) => {
    if (!pg.phone) {
      showMessage(
        "Owner WhatsApp number is not available."
      );
      return;
    }

    let phone = String(
      pg.phone
    ).replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const text =
      `Hello, I am interested in ${
        pg.pgName || "your PG"
      }. I found your PG on Smart PG Finder.`;

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        text
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // MARK NOTIFICATION READ
  // =====================================================

  const handleMarkNotificationRead =
    async (notificationId) => {
      try {
        await updateDoc(
          doc(
            db,
            "notifications",
            notificationId
          ),
          {
            read: true,
          }
        );

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            )
        );
      } catch (error) {
        console.error(
          "Notification error:",
          error
        );
      }
    };

  // =====================================================
  // COMPARE
  // =====================================================

  const isCompared = (pgId) => {
    return comparePGs.some(
      (pg) => pg.id === pgId
    );
  };

  const handleCompare = (pg) => {
    if (isCompared(pg.id)) {
      setComparePGs(
        (previous) =>
          previous.filter(
            (item) => item.id !== pg.id
          )
      );

      setShowComparison(false);
      return;
    }

    if (comparePGs.length >= 2) {
      showMessage(
        "You can compare only 2 PGs at a time."
      );
      return;
    }

    setComparePGs((previous) => [
      ...previous,
      pg,
    ]);

    setShowComparison(false);
  };

  const clearComparison = () => {
    setComparePGs([]);
    setShowComparison(false);
  };

  const openComparison = () => {
    if (comparePGs.length !== 2) {
      showMessage(
        "Please select 2 PGs to compare."
      );
      return;
    }

    setShowComparison(true);
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const scrollToNotifications = () => {
    document
      .getElementById(
        "notifications-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const scrollToDashboard = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/student-login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // =====================================================
  // DISPLAY DATA
  // =====================================================

  const displayedPGs =
    hasSearched
      ? searchResults
      : pgs;

  const favoritePGData =
    pgs.filter((pg) =>
      favoritePGs.includes(pg.id)
    );

  const unreadNotificationCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // =====================================================
  // PG CARD
  // =====================================================

  const renderPGCard = (pg) => {
    const isFavorite =
      favoritePGs.includes(pg.id);

    const selectedForCompare =
      isCompared(pg.id);

    const facilities =
      getFacilitiesList(
        pg.facilities
      );

    return (
      <div
        className="student-pg-card"
        key={pg.id}
      >

        {/* IMAGE */}

        <div className="student-pg-image-wrapper">

          {pg.imageUrl ? (
            <img
              src={pg.imageUrl}
              alt={
                pg.pgName || "PG"
              }
              className="student-pg-image"
            />
          ) : (
            <div className="student-no-image">
              🏠 No Image
            </div>
          )}

          {locationMode &&
            Number.isFinite(
              pg.distanceKm
            ) && (
              <span className="student-distance">
                📍{" "}
                {pg.distanceKm < 1
                  ? `${Math.round(
                      pg.distanceKm *
                        1000
                    )} m away`
                  : `${pg.distanceKm.toFixed(
                      2
                    )} km away`}
              </span>
            )}

        </div>

        {/* CONTENT */}

        <div className="student-pg-content">

          <div className="student-pg-title-row">

            <h3>
              {pg.pgName || "PG"}
            </h3>

            <button
              type="button"
              className={
                isFavorite
                  ? "student-heart active"
                  : "student-heart"
              }
              onClick={() =>
                handleFavorite(pg)
              }
              title={
                isFavorite
                  ? "Remove favorite"
                  : "Add favorite"
              }
            >
              {isFavorite
                ? "❤️"
                : "♡"}
            </button>

          </div>

          <p className="student-pg-info">
            🎓{" "}
            {pg.nearbyCollege ||
              "College not specified"}
          </p>

          <p className="student-pg-info">
            📍{" "}
            {pg.address ||
              "Address not specified"}
          </p>

          {/* DETAILS */}

          <div className="student-details-grid">

            <div className="student-detail-box">
              <small>PRICE</small>
              <strong>
                ₹{pg.price || "N/A"}
              </strong>
            </div>

            <div className="student-detail-box">
              <small>ROOM</small>
              <strong>
                {pg.roomType || "N/A"}
              </strong>
            </div>

            <div className="student-detail-box">
              <small>AVAILABLE</small>
              <strong>
                {pg.availableRooms ??
                  "N/A"}
              </strong>
            </div>

          </div>

          {/* FACILITIES */}

          <div className="student-facilities">

            {facilities.length > 0 ? (
              <>
                {facilities
                  .slice(0, 5)
                  .map((facility) => (
                    <span
                      key={facility}
                      className="student-facility-tag"
                    >
                      {facility}
                    </span>
                  ))}

                {facilities.length > 5 && (
                  <span className="student-more-tag">
                    +{facilities.length - 5}
                  </span>
                )}
              </>
            ) : (
              <span className="student-no-facility">
                No facilities listed
              </span>
            )}

          </div>

          {/* VIEW + SAVE */}

          <div className="student-main-actions">

            <button
              type="button"
              className="student-view-button"
              onClick={() =>
                navigate(
                  `/pg-details/${pg.id}`
                )
              }
            >
              View Details
            </button>

            <button
              type="button"
              className="student-save-button"
              onClick={() =>
                handleFavorite(pg)
              }
            >
              {isFavorite
                ? "❤️ Saved"
                : "♡ Save"}
            </button>

          </div>

          {/* COMPARE */}

          <button
            type="button"
            className={
              selectedForCompare
                ? "student-compare-button selected"
                : "student-compare-button"
            }
            onClick={() =>
              handleCompare(pg)
            }
          >
            {selectedForCompare
              ? "⚖️ Selected for Compare"
              : "⚖️ Compare This PG"}
          </button>

          {/* OTHER ACTIONS */}

          <div className="student-secondary-actions">

            <button
              type="button"
              onClick={() =>
                handleGetDirections(pg)
              }
            >
              🗺️ Directions
            </button>

            <button
              type="button"
              onClick={() =>
                handleCallOwner(pg)
              }
            >
              📞 Call
            </button>

            <button
              type="button"
              className="whatsapp"
              onClick={() =>
                handleWhatsAppOwner(pg)
              }
            >
              💬 WhatsApp
            </button>

          </div>

        </div>
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="student-loading-page">

        <div className="student-spinner" />

        <h2>
          Loading Smart PG Finder...
        </h2>

        <p>
          Finding available PG listings.
        </p>

      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="student-dashboard">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="student-navbar">

        <div className="student-brand">

          <h2>
            🏠 Smart PG Finder
          </h2>

          <small>
            Student Dashboard
          </small>

        </div>

        <div className="student-nav-actions">

          <button
            type="button"
            className="notification-nav-button"
            onClick={
              scrollToNotifications
            }
          >
            🔔 {unreadNotificationCount} new
          </button>

          <button
            type="button"
            className="student-nav-button"
            onClick={
              scrollToDashboard
            }
          >
            Student
          </button>

          <button
            type="button"
            className="student-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="student-main">

        {/* HERO */}

        <section className="student-welcome">

          <div>

            <p className="student-welcome-label">
              FIND YOUR PERFECT STAY
            </p>

            <h1>
              Welcome Student 👋
            </h1>

            <p>
              Search, compare and connect
              with PGs near your college.
            </p>

          </div>

          <div className="student-count-card">

            <strong>
              {pgs.length}
            </strong>

            <span>
              PG Listings
            </span>

          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div className="student-message">
            ✓ {message}
          </div>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="student-section student-search-section">

          <h2>
            🔎 Find Your PG
          </h2>

          <p className="student-section-description">
            Search by college, location,
            price, room type and facilities.
          </p>

          <div className="student-search-grid">

            <input
              type="text"
              value={collegeSearch}
              onChange={(e) =>
                setCollegeSearch(
                  e.target.value
                )
              }
              placeholder="🎓 College Name"
            />

            <input
              type="text"
              value={locationSearch}
              onChange={(e) =>
                setLocationSearch(
                  e.target.value
                )
              }
              placeholder="📍 Location"
            />

          </div>

          <div className="student-filter-grid">

            <select
              value={priceFilter}
              onChange={(e) =>
                setPriceFilter(
                  e.target.value
                )
              }
              aria-label="Price filter"
            >
              <option value="">
                Any Price
              </option>

              <option value="5000">
                Below ₹5,000
              </option>

              <option value="8000">
                Below ₹8,000
              </option>

              <option value="10000">
                Below ₹10,000
              </option>

              <option value="15000">
                Below ₹15,000
              </option>
            </select>

            <select
              value={roomFilter}
              onChange={(e) =>
                setRoomFilter(
                  e.target.value
                )
              }
              aria-label="Room filter"
            >
              <option value="">
                Any Room
              </option>

              <option value="single">
                Single
              </option>

              <option value="double">
                Double
              </option>

              <option value="triple">
                Triple
              </option>

              <option value="sharing">
                Sharing
              </option>
            </select>

            <select
              value={facilityFilter}
              onChange={(e) =>
                setFacilityFilter(
                  e.target.value
                )
              }
              aria-label="Facility filter"
            >
              <option value="">
                Any Facility
              </option>

              <option value="wifi">
                WiFi
              </option>

              <option value="food">
                Food
              </option>

              <option value="parking">
                Parking
              </option>

              <option value="ac">
                AC
              </option>

              <option value="laundry">
                Laundry
              </option>

              <option value="security">
                Security
              </option>
            </select>

          </div>

          <div className="student-search-buttons">

            <button
              type="button"
              className="student-search-button"
              onClick={handleSearch}
            >
              🔍 Search PGs
            </button>

            <button
              type="button"
              className="student-location-button"
              onClick={
                handleUseMyLocation
              }
              disabled={locationLoading}
            >
              {locationLoading
                ? "📍 Getting Location..."
                : "📍 Use My Location"}
            </button>

            <button
              type="button"
              className="student-clear-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

            {locationMode && (
              <button
                type="button"
                className="student-clear-location"
                onClick={
                  clearLocationMode
                }
              >
                Clear Location
              </button>
            )}

          </div>

          {userLocation && (
            <div className="student-location-info">
              📍 Location detected:{" "}
              {userLocation.latitude.toFixed(4)}
              ,{" "}
              {userLocation.longitude.toFixed(4)}
            </div>
          )}

        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          id="notifications-section"
          className="student-section"
        >

          <div className="student-section-header">

            <div>
              <h2>
                🔔 Notifications
              </h2>

              <p className="student-section-description">
                Updates about your visit
                requests.
              </p>
            </div>

            {unreadNotificationCount > 0 && (
              <span className="student-count-badge">
                {unreadNotificationCount} new
              </span>
            )}

          </div>

          {loadingNotifications ? (

            <p>
              Loading notifications...
            </p>

          ) : notifications.length === 0 ? (

            <div className="student-empty-box">

              <div>
                🔕
              </div>

              <strong>
                No notifications yet
              </strong>

              <p>
                Booking updates from PG
                owners will appear here.
              </p>

            </div>

          ) : (

            <div className="student-notification-list">

              {notifications.map(
                (notification) => (
                  <div
                    key={
                      notification.id
                    }
                    className={
                      notification.read
                        ? "student-notification read"
                        : "student-notification unread"
                    }
                  >

                    <strong>
                      {notification.status ===
                      "accepted"
                        ? "✅"
                        : notification.status ===
                          "rejected"
                        ? "❌"
                        : "🔔"}{" "}
                      {notification.title ||
                        "Notification"}
                    </strong>

                    <p>
                      {notification.message ||
                        "You have a new notification."}
                    </p>

                    {notification.pgName && (
                      <small>
                        <strong>
                          PG:
                        </strong>{" "}
                        {notification.pgName}
                      </small>
                    )}

                    {notification.createdAt?.toDate && (
                      <small className="notification-time">
                        {notification.createdAt
                          .toDate()
                          .toLocaleString()}
                      </small>
                    )}

                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkNotificationRead(
                            notification.id
                          )
                        }
                      >
                        Mark as Read
                      </button>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            BOOKING REQUESTS
        ================================================= */}

        <section className="student-section">

          <h2>
            📩 My Booking Requests
          </h2>

          <p className="student-section-description">
            Track your PG visit requests.
          </p>

          {loadingRequests ? (

            <p>
              Loading booking requests...
            </p>

          ) : bookingRequests.length === 0 ? (

            <div className="student-empty-box">

              <div>
                📅
              </div>

              <p>
                You have not sent any
                booking/visit requests yet.
              </p>

            </div>

          ) : (

            <div className="student-booking-grid">

              {bookingRequests.map(
                (request) => (

                  <div
                    key={request.id}
                    className="student-booking-card"
                  >

                    <div className="booking-card-top">

                      <h3>
                        🏠{" "}
                        {request.pgName ||
                          "PG"}
                      </h3>

                      <span
                        className={
                          request.status ===
                          "accepted"
                            ? "status accepted"
                            : request.status ===
                              "rejected"
                            ? "status rejected"
                            : "status pending"
                        }
                      >
                        {request.status ||
                          "pending"}
                      </span>

                    </div>

                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {request.visitDate ||
                        "Not specified"}
                    </p>

                    <p>
                      <strong>
                        Time:
                      </strong>{" "}
                      {request.visitTime ||
                        "Not specified"}
                    </p>

                    <p>
                      <strong>
                        Message:
                      </strong>{" "}
                      {request.message ||
                        "No message"}
                    </p>

                    <p className="booking-status-text">
                      {request.status ===
                      "accepted"
                        ? "✅ Your visit request has been accepted by the owner."
                        : request.status ===
                          "rejected"
                        ? "❌ Your visit request was rejected by the owner."
                        : "⏳ Waiting for owner response."}
                    </p>

                  </div>

                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            FAVORITES
        ================================================= */}

        <section className="student-section">

          <div className="student-section-header">

            <div>

              <h2>
                ❤️ My Favorite PGs
              </h2>

              <p className="student-section-description">
                PGs you saved for later.
              </p>

            </div>

            <span className="student-count-badge">
              {favoritePGData.length}
            </span>

          </div>

          {loadingFavorites ? (

            <p>
              Loading favorites...
            </p>

          ) : favoritePGData.length === 0 ? (

            <div className="student-empty-box">

              <div>
                ♡
              </div>

              <strong>
                No favorite PGs yet
              </strong>

              <p>
                Click the heart on a PG
                to save it here.
              </p>

            </div>

          ) : (

            <div className="student-pg-grid">

              {favoritePGData.map(
                renderPGCard
              )}

            </div>
          )}

        </section>

        {/* =================================================
            PG LIST
        ================================================= */}

        <section
          id="pg-list-section"
          className="student-pg-list-section"
        >

          <div className="student-section-header">

            <div>

              <h2>
                {hasSearched
                  ? "🔎 Search Results"
                  : "📍 Available PGs"}
              </h2>

              <p className="student-section-description">
                {displayedPGs.length} PG
                {displayedPGs.length ===
                1
                  ? ""
                  : "s"}{" "}
                available
              </p>

            </div>

          </div>

          {displayedPGs.length === 0 ? (

            <div className="student-empty-box">

              <div>
                🏠
              </div>

              <h3>
                No PGs found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>

            </div>

          ) : (

            <div className="student-pg-grid">

              {displayedPGs.map(
                renderPGCard
              )}

            </div>
          )}

        </section>

      </main>

      {/* =================================================
          COMPARE FLOATING BAR
      ================================================= */}

      {comparePGs.length > 0 &&
        !showComparison && (

          <div className="compare-floating-bar">

            <div className="compare-floating-text">

              <strong>
                {comparePGs.length} PG
                {comparePGs.length ===
                1
                  ? ""
                  : "s"}{" "}
                selected
              </strong>

              <span>
                {comparePGs.length === 1
                  ? "Select one more PG."
                  : "Ready to compare."}
              </span>

            </div>

            <div className="compare-floating-actions">

              <button
                type="button"
                onClick={
                  clearComparison
                }
                className="compare-clear-button"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={
                  openComparison
                }
                disabled={
                  comparePGs.length !== 2
                }
                className={
                  comparePGs.length === 2
                    ? "compare-open-button active"
                    : "compare-open-button"
                }
              >
                ⚖️ Compare 2 PGs
              </button>

            </div>

          </div>
        )}

      {/* =================================================
          COMPARE MODAL
      ================================================= */}

      {showComparison &&
        comparePGs.length === 2 && (

          <div className="compare-modal-overlay">

            <div className="compare-modal">

              {/* HEADER */}

              <div className="compare-modal-header">

                <div>

                  <p className="compare-modal-label">
                    PG COMPARISON
                  </p>

                  <h2>
                    ⚖️ Compare PGs
                  </h2>

                </div>

                <button
                  type="button"
                  className="compare-close-button"
                  onClick={() =>
                    setShowComparison(
                      false
                    )
                  }
                >
                  ✕
                </button>

              </div>

              {/* TWO PG COLUMNS */}

              <div className="compare-columns">

                {comparePGs.map((pg, index) => {

                  const pgFacilities =
                    getFacilitiesList(
                      pg.facilities
                    );

                  return (
                    <div
                      className="compare-pg-column"
                      key={pg.id}
                    >

                      <div className="compare-column-number">
                        PG {index + 1}
                      </div>

                      <div className="compare-image-wrapper">

                        {pg.imageUrl ? (
                          <img
                            src={pg.imageUrl}
                            alt={
                              pg.pgName ||
                              "PG"
                            }
                            className="compare-pg-image"
                          />
                        ) : (
                          <div className="compare-no-image">
                            🏠
                          </div>
                        )}

                      </div>

                      <h3 className="compare-pg-name">
                        {pg.pgName ||
                          "PG"}
                      </h3>

                      <div className="compare-row">

                        <span>
                          💰 Price
                        </span>

                        <strong>
                          ₹
                          {pg.price ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-row">

                        <span>
                          🛏️ Room Type
                        </span>

                        <strong>
                          {pg.roomType ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-row">

                        <span>
                          🚪 Available
                        </span>

                        <strong>
                          {pg.availableRooms ??
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-row">

                        <span>
                          🎓 College
                        </span>

                        <strong>
                          {pg.nearbyCollege ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-row">

                        <span>
                          📍 Address
                        </span>

                        <strong>
                          {pg.address ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-row">

                        <span>
                          📞 Phone
                        </span>

                        <strong>
                          {pg.phone ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="compare-facilities">

                        <span>
                          Facilities
                        </span>

                        <div>

                          {pgFacilities.length >
                          0 ? (
                            pgFacilities.map(
                              (facility) => (
                                <span
                                  key={
                                    facility
                                  }
                                  className="compare-facility-tag"
                                >
                                  {facility}
                                </span>
                              )
                            )
                          ) : (
                            <small>
                              None
                            </small>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* FOOTER */}

              <div className="compare-modal-footer">

                <button
                  type="button"
                  onClick={
                    clearComparison
                  }
                  className="compare-footer-clear"
                >
                  Clear Comparison
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowComparison(
                      false
                    )
                  }
                  className="compare-footer-close"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        body {
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
          background: #f5f7fb;
          color: #172033;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        /* ================= LOADING ================= */

        .student-loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background: #f5f7fb;
          padding: 20px;
          text-align: center;
        }

        .student-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #dbeafe;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: studentSpin 1s linear infinite;
        }

        @keyframes studentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ================= NAVBAR ================= */

        .student-dashboard {
          min-height: 100vh;
          background: #f5f7fb;
        }

        .student-navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          min-height: 72px;
          padding: 12px 5%;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .student-brand {
          min-width: 0;
        }

        .student-brand h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1.2;
        }

        .student-brand small {
          color: #cbd5e1;
          font-size: 12px;
        }

        .student-nav-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .notification-nav-button,
        .student-nav-button {
          border: 1px solid #334155;
          border-radius: 20px;
          background: transparent;
          color: white;
          padding: 8px 11px;
          cursor: pointer;
          font-size: 12px;
          white-space: nowrap;
        }

        .student-logout {
          border: none;
          background: white;
          color: #111827;
          padding: 9px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          white-space: nowrap;
        }

        /* ================= MAIN ================= */

        .student-main {
          width: 92%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 30px 0 100px;
          min-width: 0;
        }

        /* ================= HERO ================= */

        .student-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
          min-width: 0;
        }

        .student-welcome > div:first-child {
          min-width: 0;
        }

        .student-welcome-label {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .student-welcome h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1.2;
        }

        .student-welcome p:last-child {
          color: #64748b;
          margin: 8px 0 0;
          line-height: 1.6;
        }

        .student-count-card {
          flex-shrink: 0;
          background: white;
          padding: 15px 25px;
          border-radius: 14px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }

        .student-count-card strong {
          display: block;
          font-size: 25px;
          color: #2563eb;
        }

        .student-count-card span {
          font-size: 12px;
          color: #64748b;
        }

        /* ================= MESSAGE ================= */

        .student-message {
          margin-bottom: 20px;
          padding: 12px 15px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
        }

        /* ================= SECTIONS ================= */

        .student-section {
          width: 100%;
          min-width: 0;
          background: white;
          padding: 22px;
          border-radius: 16px;
          margin-bottom: 25px;
          box-shadow: 0 3px 15px rgba(0,0,0,0.035);
        }

        .student-section h2 {
          margin-top: 0;
          color: #172033;
        }

        .student-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .student-section-description {
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .student-count-badge {
          flex-shrink: 0;
          background: #eff6ff;
          color: #2563eb;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
        }

        /* ================= SEARCH ================= */

        .student-search-section {
          overflow: visible;
        }

        .student-search-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 15px;
          width: 100%;
          min-width: 0;
        }

        .student-search-grid input {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          padding: 12px;
          border: 1px solid #d5dbe5;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          background: white;
        }

        .student-search-grid input:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37,99,235,0.10);
        }

        .student-filter-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
          width: 100%;
          min-width: 0;
        }

        .student-filter-grid select {
          display: block;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #d5dbe5;
          border-radius: 8px;
          font-size: 14px;
          background: #ffffff;
          color: #172033;
        }

        .student-search-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 16px;
          width: 100%;
          min-width: 0;
        }

        .student-search-button,
        .student-location-button,
        .student-clear-button,
        .student-clear-location {
          border: none;
          border-radius: 8px;
          padding: 11px 18px;
          cursor: pointer;
          font-weight: 700;
          white-space: nowrap;
        }

        .student-search-button {
          background: #2563eb;
          color: white;
        }

        .student-location-button {
          background: #16a34a;
          color: white;
        }

        .student-clear-button {
          background: #eef2f7;
          color: #334155;
        }

        .student-clear-location {
          background: #f59e0b;
          color: white;
        }

        .student-location-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .student-location-info {
          width: 100%;
          margin-top: 14px;
          padding: 10px 12px;
          background: #f0fdf4;
          border-radius: 8px;
          color: #166534;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        /* ================= EMPTY ================= */

        .student-empty-box {
          padding: 30px 20px;
          text-align: center;
          background: #f8fafc;
          border-radius: 12px;
          color: #64748b;
        }

        .student-empty-box > div {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .student-empty-box strong,
        .student-empty-box h3 {
          color: #334155;
        }

        /* ================= NOTIFICATIONS ================= */

        #notifications-section {
          scroll-margin-top: 90px;
        }

        .student-notification-list {
          display: grid;
          gap: 10px;
          margin-top: 15px;
        }

        .student-notification {
          padding: 15px;
          border-radius: 10px;
          min-width: 0;
        }

        .student-notification.unread {
          border: 2px solid #60a5fa;
          background: #eff6ff;
        }

        .student-notification.read {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .student-notification strong {
          overflow-wrap: anywhere;
        }

        .student-notification p {
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .student-notification small {
          display: block;
          overflow-wrap: anywhere;
        }

        .notification-time {
          color: #64748b;
          margin-top: 5px;
        }

        .student-notification button {
          margin-top: 10px;
          padding: 7px 12px;
          border: none;
          border-radius: 7px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

        /* ================= BOOKINGS ================= */

        .student-booking-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .student-booking-card {
          min-width: 0;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .booking-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }

        .booking-card-top h3 {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .status {
          flex-shrink: 0;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .status.accepted {
          background: #dcfce7;
          color: #166534;
        }

        .status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .student-booking-card p {
          overflow-wrap: anywhere;
          line-height: 1.6;
        }

        .booking-status-text {
          color: #475569;
          font-size: 13px;
        }

        /* ================= PG GRID ================= */

        .student-pg-list-section {
          width: 100%;
          min-width: 0;
        }

        .student-pg-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          width: 100%;
          min-width: 0;
        }

        .student-pg-card {
          min-width: 0;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow:
            0 6px 20px
            rgba(0,0,0,0.06);
        }

        .student-pg-image-wrapper {
          height: 190px;
          position: relative;
          width: 100%;
          background: #eef2f7;
          overflow: hidden;
        }

        .student-pg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .student-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 14px;
        }

        .student-distance {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: white;
          padding: 6px 10px;
          border-radius: 20px;
          color: #15803d;
          font-size: 12px;
          font-weight: 800;
          max-width: calc(100% - 24px);
        }

        .student-pg-content {
          padding: 17px;
          min-width: 0;
        }

        .student-pg-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .student-pg-title-row h3 {
          margin: 0;
          font-size: 18px;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .student-heart {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          font-size: 18px;
        }

        .student-heart.active {
          background: #fff1f2;
        }

        .student-pg-info {
          margin: 10px 0 5px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .student-details-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 7px;
          margin-top: 15px;
          width: 100%;
        }

        .student-detail-box {
          min-width: 0;
          padding: 9px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .student-detail-box small {
          display: block;
          color: #64748b;
          font-size: 10px;
        }

        .student-detail-box strong {
          display: block;
          margin-top: 3px;
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        .student-facilities {
          margin-top: 13px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          min-width: 0;
        }

        .student-facility-tag,
        .student-more-tag {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .student-facility-tag {
          background: #eff6ff;
          color: #2456a6;
        }

        .student-more-tag {
          background: #f1f5f9;
          color: #64748b;
        }

        .student-no-facility {
          color: #94a3b8;
          font-size: 12px;
        }

        .student-main-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          min-width: 0;
        }

        .student-view-button,
        .student-save-button {
          flex: 1;
          min-width: 0;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .student-view-button {
          background: #2563eb;
          color: white;
        }

        .student-save-button {
          background: #eef2f7;
          color: #334155;
        }

        .student-compare-button {
          display: block;
          width: 100%;
          min-width: 0;
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
          color: #334155;
          cursor: pointer;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .student-compare-button.selected {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
        }

        .student-secondary-actions {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
          min-width: 0;
        }

        .student-secondary-actions button {
          border: none;
          background: transparent;
          color: #475569;
          cursor: pointer;
          font-size: 12px;
          padding: 5px;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .student-secondary-actions button.whatsapp {
          color: #15803d;
          font-weight: 700;
        }

        /* ================= COMPARE BAR ================= */

        .compare-floating-bar {
          position: fixed;
          left: 50%;
          bottom: 20px;
          transform: translateX(-50%);
          width: calc(100% - 30px);
          max-width: 560px;
          box-sizing: border-box;
          padding: 13px 15px;
          background: #111827;
          color: white;
          border-radius: 14px;
          box-shadow:
            0 10px 35px
            rgba(0,0,0,0.25);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .compare-floating-text {
          min-width: 0;
        }

        .compare-floating-text strong {
          display: block;
        }

        .compare-floating-text span {
          display: block;
          margin-top: 3px;
          color: #cbd5e1;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .compare-floating-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .compare-clear-button,
        .compare-open-button {
          padding: 9px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          white-space: nowrap;
        }

        .compare-clear-button {
          border: 1px solid #475569;
          background: transparent;
          color: white;
        }

        .compare-open-button {
          border: none;
          background: #475569;
          color: white;
          cursor: not-allowed;
        }

        .compare-open-button.active {
          background: #2563eb;
          cursor: pointer;
        }

        /* ================= COMPARE MODAL ================= */

        .compare-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(15,23,42,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
        }

        .compare-modal {
          width: 100%;
          max-width: 1000px;
          max-height: 92vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: white;
          border-radius: 18px;
          padding: 22px;
          box-sizing: border-box;
        }

        .compare-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .compare-modal-label {
          margin: 0 0 5px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .compare-modal-header h2 {
          margin: 0;
          font-size: 25px;
        }

        .compare-close-button {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border: none;
          border-radius: 50%;
          background: #f1f5f9;
          cursor: pointer;
          font-size: 16px;
        }

        .compare-columns {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
          min-width: 0;
        }

        .compare-pg-column {
          min-width: 0;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          background: #ffffff;
        }

        .compare-column-number {
          padding: 8px 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .compare-image-wrapper {
          height: 180px;
          background: #eef2f7;
        }

        .compare-pg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .compare-no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 30px;
        }

        .compare-pg-name {
          padding: 15px 15px 8px;
          margin: 0;
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .compare-row {
          display: grid;
          grid-template-columns:
            minmax(90px, 0.9fr)
            minmax(0, 1.1fr);
          gap: 10px;
          padding: 10px 15px;
          border-top: 1px solid #f1f5f9;
          min-width: 0;
        }

        .compare-row span {
          color: #64748b;
          font-size: 12px;
        }

        .compare-row strong {
          color: #172033;
          font-size: 12px;
          text-align: right;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .compare-facilities {
          padding: 12px 15px 16px;
          border-top: 1px solid #f1f5f9;
        }

        .compare-facilities > span {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .compare-facilities > div {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .compare-facility-tag {
          padding: 5px 8px;
          border-radius: 20px;
          background: #eff6ff;
          color: #2456a6;
          font-size: 10px;
          font-weight: 700;
        }

        .compare-facilities small {
          color: #94a3b8;
        }

        .compare-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .compare-footer-clear,
        .compare-footer-close {
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .compare-footer-clear {
          border: none;
          background: #e2e8f0;
          color: #334155;
        }

        .compare-footer-close {
          border: none;
          background: #2563eb;
          color: white;
        }

        /* ================= TABLET ================= */

        @media (max-width: 950px) {

          .student-pg-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        /* ================= MOBILE ================= */

        @media (max-width: 700px) {

          .student-navbar {
            padding: 11px 12px;
            align-items: flex-start;
          }

          .student-brand h2 {
            font-size: 16px;
          }

          .student-brand small {
            display: none;
          }

          .student-nav-actions {
            gap: 5px;
          }

          .notification-nav-button,
          .student-nav-button,
          .student-logout {
            font-size: 11px;
            padding: 7px 8px;
          }

          .student-main {
            width: 94%;
            max-width: 100%;
            padding: 20px 0 100px;
          }

          .student-welcome {
            display: block;
          }

          .student-welcome h1 {
            font-size: 27px;
          }

          .student-count-card {
            display: inline-block;
            margin-top: 14px;
          }

          .student-search-grid {
            grid-template-columns: 1fr;
          }

          .student-filter-grid {
            grid-template-columns: 1fr;
          }

          .student-filter-grid select {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }

          .student-search-buttons {
            display: grid;
            grid-template-columns: 1fr;
            width: 100%;
          }

          .student-search-button,
          .student-location-button,
          .student-clear-button,
          .student-clear-location {
            width: 100%;
          }

          .student-booking-grid {
            grid-template-columns: 1fr;
          }

          .student-pg-grid {
            grid-template-columns: 1fr;
          }

          .student-details-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .student-secondary-actions {
            gap: 2px;
          }

          .student-secondary-actions button {
            font-size: 11px;
          }

          /* Compare bar */

          .compare-floating-bar {
            left: 10px;
            right: 10px;
            bottom: 10px;
            transform: none;
            width: calc(100% - 20px);
            max-width: none;
            flex-direction: column;
            align-items: stretch;
            padding: 12px;
          }

          .compare-floating-actions {
            width: 100%;
            display: grid;
            grid-template-columns:
              minmax(0, 0.75fr)
              minmax(0, 1.25fr);
          }

          .compare-clear-button,
          .compare-open-button {
            width: 100%;
            min-width: 0;
          }

          /* Compare modal */

          .compare-modal-overlay {
            padding: 8px;
          }

          .compare-modal {
            width: 100%;
            max-width: 100%;
            max-height: 94vh;
            padding: 14px;
            border-radius: 14px;
          }

          .compare-modal-header {
            margin-bottom: 14px;
          }

          .compare-modal-header h2 {
            font-size: 20px;
          }

          .compare-columns {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .compare-image-wrapper {
            height: 150px;
          }

          .compare-pg-name {
            font-size: 17px;
          }

          .compare-row {
            grid-template-columns:
              minmax(80px, 0.8fr)
              minmax(0, 1.2fr);
            padding: 9px 12px;
          }

          .compare-row span,
          .compare-row strong {
            font-size: 11px;
          }

          .compare-facilities {
            padding: 11px 12px 14px;
          }

          .compare-modal-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .compare-footer-clear,
          .compare-footer-close {
            width: 100%;
            min-width: 0;
            padding: 10px 8px;
          }

        }

        /* ================= SMALL PHONE ================= */

        @media (max-width: 420px) {

          .student-navbar {
            flex-direction: column;
          }

          .student-nav-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .student-section {
            padding: 17px;
          }

          .student-main {
            width: 95%;
          }

          .student-pg-content {
            padding: 14px;
          }

          .student-details-grid {
            gap: 5px;
          }

          .student-detail-box {
            padding: 7px;
          }

          .student-detail-box small {
            font-size: 9px;
          }

          .student-detail-box strong {
            font-size: 11px;
          }

          .compare-modal-overlay {
            padding: 5px;
          }

          .compare-modal {
            padding: 12px;
          }

        }

      `}</style>
    </div>
  );
}

export default StudentDashboard;