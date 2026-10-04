import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { useNavigate } from "react-router-dom";

function OwnerDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // FORM STATES
  // =====================================================

  const [pgName, setPgName] = useState("");
  const [address, setAddress] = useState("");
  const [college, setCollege] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [rooms, setRooms] = useState("");
  const [phone, setPhone] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // =====================================================
  // FACILITIES
  // =====================================================

  const [facilities, setFacilities] = useState({
    wifi: false,
    food: false,
    ac: false,
    laundry: false,
    parking: false,
    security: false,
  });

  // =====================================================
  // GENERAL STATES
  // =====================================================

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // MY PG
  // =====================================================

  const [myPGs, setMyPGs] = useState([]);
  const [loadingPGs, setLoadingPGs] = useState(true);

  // =====================================================
  // EDIT
  // =====================================================

  const [editingPGId, setEditingPGId] = useState(null);

  // =====================================================
  // BOOKING REQUESTS
  // =====================================================

  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // =====================================================
  // FACILITY CHANGE
  // =====================================================

  const handleFacilityChange = (facility) => {
    setFacilities((previous) => ({
      ...previous,
      [facility]: !previous[facility],
    }));
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setMessage("Image selected successfully.");
  };

  // =====================================================
  // COMPRESS IMAGE FOR FIRESTORE
  // =====================================================

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 600;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }

          const canvas = document.createElement("canvas");

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);

          const ctx = canvas.getContext("2d");

          ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const compressedImage = canvas.toDataURL(
            "image/jpeg",
            0.65
          );

          // Firestore document size safety check
          if (compressedImage.length > 850000) {
            reject(
              new Error(
                "Image is still too large. Please choose another image."
              )
            );
            return;
          }

          resolve(compressedImage);
        };

        img.onerror = () => {
          reject(new Error("Unable to process image."));
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(new Error("Unable to read image."));
      };

      reader.readAsDataURL(file);
    });
  };

  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLatitude =
          position.coords.latitude.toFixed(6);

        const currentLongitude =
          position.coords.longitude.toFixed(6);

        setLatitude(currentLatitude);
        setLongitude(currentLongitude);

        setLocationLoading(false);
        setMessage("Location detected successfully!");
      },
      (error) => {
        console.error("Location error:", error);

        setLocationLoading(false);

        if (error.code === 1) {
          setMessage(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setMessage(
            "Unable to determine your location."
          );
        } else if (error.code === 3) {
          setMessage(
            "Location request timed out. Please try again."
          );
        } else {
          setMessage(
            "Unable to get current location."
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
  // FETCH MY PGs
  // =====================================================

  const fetchMyPGs = async (user) => {
    try {
      if (!user) {
        setMyPGs([]);
        setLoadingPGs(false);
        return;
      }

      const q = query(
        collection(db, "pgs"),
        where("ownerId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const pgData = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      pgData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;

        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;

        return timeB - timeA;
      });

      setMyPGs(pgData);
    } catch (error) {
      console.error(
        "Error fetching owner PGs:",
        error
      );

      setMessage(
        "Unable to load your PG listings."
      );
    } finally {
      setLoadingPGs(false);
    }
  };

  // =====================================================
  // FETCH BOOKING REQUESTS
  // =====================================================

  const fetchBookingRequests = async (user) => {
    try {
      if (!user) {
        setBookingRequests([]);
        setLoadingRequests(false);
        return;
      }

      setLoadingRequests(true);

      const q = query(
        collection(db, "bookingRequests"),
        where("ownerId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const requestData = snapshot.docs.map(
        (document) => ({
          id: document.id,
          ...document.data(),
        })
      );

      requestData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : 0;

        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : 0;

        return timeB - timeA;
      });

      setBookingRequests(requestData);
    } catch (error) {
      console.error(
        "Error fetching booking requests:",
        error
      );

      setBookingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // =====================================================
  // AUTH
  // =====================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setLoadingPGs(true);
        setLoadingRequests(true);

        fetchMyPGs(user);
        fetchBookingRequests(user);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setPgName("");
    setAddress("");
    setCollege("");
    setPrice("");
    setRoomType("");
    setRooms("");
    setPhone("");

    setImageUrl("");
    setImageFile(null);
    setImagePreview("");

    setLatitude("");
    setLongitude("");

    setFacilities({
      wifi: false,
      food: false,
      ac: false,
      laundry: false,
      parking: false,
      security: false,
    });

    setEditingPGId(null);
  };

  // =====================================================
  // ADD / UPDATE PG
  // =====================================================

  const handleAddPG = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login again.");
        navigate("/owner-login");
        return;
      }

      // -----------------------------------------------
      // LOCATION VALIDATION
      // -----------------------------------------------

      if (
        latitude === "" ||
        longitude === ""
      ) {
        setMessage(
          "Please enter the PG location or use your current location."
        );

        setLoading(false);
        return;
      }

      const numericLatitude = Number(latitude);
      const numericLongitude = Number(longitude);

      if (
        Number.isNaN(numericLatitude) ||
        Number.isNaN(numericLongitude)
      ) {
        setMessage(
          "Please enter valid latitude and longitude."
        );

        setLoading(false);
        return;
      }

      if (
        numericLatitude < -90 ||
        numericLatitude > 90
      ) {
        setMessage(
          "Latitude must be between -90 and 90."
        );

        setLoading(false);
        return;
      }

      if (
        numericLongitude < -180 ||
        numericLongitude > 180
      ) {
        setMessage(
          "Longitude must be between -180 and 180."
        );

        setLoading(false);
        return;
      }

      // -----------------------------------------------
      // IMAGE
      // -----------------------------------------------

      let finalImageUrl = imageUrl || "";

      if (imageFile) {
        setMessage("Preparing PG image...");

        finalImageUrl = await compressImage(
          imageFile
        );
      }

      // -----------------------------------------------
      // UPDATE EXISTING PG
      // -----------------------------------------------

      if (editingPGId) {
        const pgRef = doc(
          db,
          "pgs",
          editingPGId
        );

        await updateDoc(pgRef, {
          pgName,
          address,
          nearbyCollege: college,
          price: Number(price),
          roomType,
          availableRooms: Number(rooms),
          phone,
          imageUrl: finalImageUrl,
          latitude: numericLatitude,
          longitude: numericLongitude,
          facilities,
          updatedAt: new Date(),
        });

        setMessage(
          "PG updated successfully!"
        );
      }

      // -----------------------------------------------
      // ADD NEW PG
      // -----------------------------------------------

      else {
        await addDoc(
          collection(db, "pgs"),
          {
            ownerId: user.uid,
            pgName,
            address,
            nearbyCollege: college,
            price: Number(price),
            roomType,
            availableRooms: Number(rooms),
            phone,
            imageUrl: finalImageUrl,
            latitude: numericLatitude,
            longitude: numericLongitude,
            facilities,
            createdAt: new Date(),
          }
        );

        setMessage(
          "PG added successfully!"
        );
      }

      clearForm();

      await fetchMyPGs(user);
    } catch (error) {
      console.error(
        "Error saving PG:",
        error
      );

      setMessage(
        error.message ||
          "Failed to save PG. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT PG
  // =====================================================

  const handleEditPG = (pg) => {
    setEditingPGId(pg.id);

    setPgName(pg.pgName || "");
    setAddress(pg.address || "");
    setCollege(pg.nearbyCollege || "");

    setPrice(
      pg.price !== undefined
        ? String(pg.price)
        : ""
    );

    setRoomType(pg.roomType || "");

    setRooms(
      pg.availableRooms !== undefined
        ? String(pg.availableRooms)
        : ""
    );

    setPhone(pg.phone || "");

    setImageUrl(pg.imageUrl || "");
    setImageFile(null);
    setImagePreview(pg.imageUrl || "");

    setLatitude(
      pg.latitude !== undefined &&
      pg.latitude !== null
        ? String(pg.latitude)
        : ""
    );

    setLongitude(
      pg.longitude !== undefined &&
      pg.longitude !== null
        ? String(pg.longitude)
        : ""
    );

    setFacilities({
      wifi: pg.facilities?.wifi || false,
      food: pg.facilities?.food || false,
      ac: pg.facilities?.ac || false,
      laundry:
        pg.facilities?.laundry || false,
      parking:
        pg.facilities?.parking || false,
      security:
        pg.facilities?.security || false,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    clearForm();
    setMessage("");
  };

  // =====================================================
  // DELETE PG
  // =====================================================

  const handleDeletePG = async (pgId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this PG?"
      );

    if (!confirmDelete) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        navigate("/owner-login");
        return;
      }

      const pgRef = doc(
        db,
        "pgs",
        pgId
      );

      await deleteDoc(pgRef);

      setMessage(
        "PG deleted successfully!"
      );

      if (editingPGId === pgId) {
        clearForm();
      }

      await fetchMyPGs(user);
    } catch (error) {
      console.error(
        "Error deleting PG:",
        error
      );

      setMessage(
        "Failed to delete PG. Please try again."
      );
    }
  };

  // =====================================================
  // ACCEPT / REJECT BOOKING
  // =====================================================

  const handleBookingStatus = async (
    requestId,
    status
  ) => {
    try {
      const request =
        bookingRequests.find(
          (item) => item.id === requestId
        );

      if (!request) {
        alert(
          "Booking request not found."
        );
        return;
      }

      if (request.status === status) {
        setMessage(
          `This booking request is already ${status}.`
        );
        return;
      }

      const requestRef = doc(
        db,
        "bookingRequests",
        requestId
      );

      await updateDoc(requestRef, {
        status,
      });

      // -----------------------------------------------
      // STUDENT NOTIFICATION
      // -----------------------------------------------

      if (request.studentId) {
        await addDoc(
          collection(db, "notifications"),
          {
            userId: request.studentId,
            type: "booking_status",

            title:
              status === "accepted"
                ? "Booking Request Accepted"
                : "Booking Request Rejected",

            message:
              status === "accepted"
                ? `Your visit request for ${
                    request.pgName ||
                    "the PG"
                  } has been accepted by the owner.`
                : `Your visit request for ${
                    request.pgName ||
                    "the PG"
                  } has been rejected by the owner.`,

            relatedId: requestId,
            pgId: request.pgId || "",
            pgName: request.pgName || "",
            status,
            read: false,
            createdAt: new Date(),
          }
        );
      }

      setBookingRequests(
        (previous) =>
          previous.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  status,
                }
              : item
          )
      );

      setMessage(
        status === "accepted"
          ? "Booking request accepted and student notified."
          : "Booking request rejected and student notified."
      );
    } catch (error) {
      console.error(
        "Error updating booking request:",
        error
      );

      alert(
        "Unable to update booking request or create notification. Please try again."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/owner-login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // =====================================================
  // FACILITY DISPLAY
  // =====================================================

  const getFacilities = (pg) => {
    const list = [];

    if (pg.facilities?.wifi)
      list.push("Wi-Fi");

    if (pg.facilities?.food)
      list.push("Food");

    if (pg.facilities?.ac)
      list.push("AC");

    if (pg.facilities?.laundry)
      list.push("Laundry");

    if (pg.facilities?.parking)
      list.push("Parking");

    if (pg.facilities?.security)
      list.push("Security");

    return list;
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <header style={styles.navbar}>

        <div style={styles.logoSection}>

          <div style={styles.logoIcon}>
            🏠
          </div>

          <div>
            <div style={styles.logo}>
              Smart PG Finder
            </div>

            <div style={styles.logoSub}>
              Owner Portal
            </div>
          </div>

        </div>

        <div style={styles.navRight}>

          <div style={styles.ownerBadge}>
            👤 PG Owner
          </div>

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>

        </div>

      </header>

      {/* MAIN */}
      <main style={styles.container}>

        {/* HERO */}
        <section style={styles.hero}>

          <div>

            <div style={styles.heroTag}>
              OWNER DASHBOARD
            </div>

            <h1 style={styles.heroTitle}>
              Manage Your PG
              <br />
              <span style={styles.heroHighlight}>
                Properties Easily
              </span>
            </h1>

            <p style={styles.heroText}>
              Add your PG properties, manage
              listings, and respond to student
              visit requests.
            </p>

          </div>

          <div style={styles.heroIcon}>
            🏢
          </div>

        </section>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              ...styles.message,
              background:
                message.includes(
                  "successfully"
                ) ||
                message.includes(
                  "detected"
                )
                  ? "#ecfdf5"
                  : "#fff1f2",
              color:
                message.includes(
                  "successfully"
                ) ||
                message.includes(
                  "detected"
                )
                  ? "#047857"
                  : "#be123c",
              borderColor:
                message.includes(
                  "successfully"
                ) ||
                message.includes(
                  "detected"
                )
                  ? "#a7f3d0"
                  : "#fecdd3",
            }}
          >
            {message}
          </div>
        )}

        {/* STATS */}
        <section style={styles.statsGrid}>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              🏠
            </div>

            <div>
              <div style={styles.statNumber}>
                {myPGs.length}
              </div>

              <div style={styles.statLabel}>
                My PG Listings
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              📩
            </div>

            <div>
              <div style={styles.statNumber}>
                {
                  bookingRequests.filter(
                    (item) =>
                      !item.status ||
                      item.status ===
                        "pending"
                  ).length
                }
              </div>

              <div style={styles.statLabel}>
                Pending Requests
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ✅
            </div>

            <div>
              <div style={styles.statNumber}>
                {
                  bookingRequests.filter(
                    (item) =>
                      item.status ===
                      "accepted"
                  ).length
                }
              </div>

              <div style={styles.statLabel}>
                Accepted Visits
              </div>
            </div>
          </div>

        </section>

        {/* BOOKING REQUESTS */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>

              <div style={styles.sectionTag}>
                REQUEST MANAGEMENT
              </div>

              <h2 style={styles.sectionTitle}>
                📩 Booking / Visit Requests
              </h2>

              <p style={styles.sectionDescription}>
                Review and respond to students
                who want to visit your PG.
              </p>

            </div>

            <div style={styles.countBadge}>
              {bookingRequests.length} Requests
            </div>

          </div>

          {loadingRequests ? (

            <div style={styles.emptyBox}>
              <div style={styles.loadingIcon}>
                ⏳
              </div>
              <p>
                Loading booking requests...
              </p>
            </div>

          ) : bookingRequests.length ===
            0 ? (

            <div style={styles.emptyBox}>

              <div style={styles.emptyIcon}>
                📭
              </div>

              <h3 style={styles.emptyTitle}>
                No Booking Requests
              </h3>

              <p style={styles.emptyText}>
                When a student sends a visit
                request, it will appear here.
              </p>

            </div>

          ) : (

            <div style={styles.requestGrid}>

              {bookingRequests.map(
                (request) => {

                  const status =
                    request.status ||
                    "pending";

                  return (
                    <div
                      key={request.id}
                      style={styles.requestCard}
                    >

                      <div
                        style={styles.requestTop}
                      >

                        <div>

                          <div
                            style={
                              styles.requestPG
                            }
                          >
                            🏠{" "}
                            {request.pgName ||
                              "PG"}
                          </div>

                          <div
                            style={
                              styles.requestStudent
                            }
                          >
                            👤{" "}
                            {request.studentEmail ||
                              "Student"}
                          </div>

                        </div>

                        <span
                          style={{
                            ...styles.statusBadge,

                            ...(status ===
                            "accepted"
                              ? styles.acceptedBadge
                              : status ===
                                "rejected"
                              ? styles.rejectedBadge
                              : styles.pendingBadge),
                          }}
                        >
                          {status.toUpperCase()}
                        </span>

                      </div>

                      <div
                        style={
                          styles.requestDetails
                        }
                      >

                        <div
                          style={
                            styles.detailItem
                          }
                        >
                          <span>📅</span>

                          <div>
                            <small>
                              Visit Date
                            </small>

                            <strong>
                              {request.visitDate ||
                                "Not selected"}
                            </strong>
                          </div>
                        </div>

                        <div
                          style={
                            styles.detailItem
                          }
                        >
                          <span>⏰</span>

                          <div>
                            <small>
                              Visit Time
                            </small>

                            <strong>
                              {request.visitTime ||
                                "Not selected"}
                            </strong>
                          </div>
                        </div>

                      </div>

                      <div
                        style={
                          styles.studentMessage
                        }
                      >

                        <div
                          style={
                            styles.messageTitle
                          }
                        >
                          💬 Student Message
                        </div>

                        <p>
                          {request.message ||
                            "No message provided."}
                        </p>

                      </div>

                      {status ===
                      "pending" ? (

                        <div
                          style={
                            styles.requestActions
                          }
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleBookingStatus(
                                request.id,
                                "accepted"
                              )
                            }
                            style={
                              styles.acceptButton
                            }
                          >
                            ✓ Accept Request
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleBookingStatus(
                                request.id,
                                "rejected"
                              )
                            }
                            style={
                              styles.rejectButton
                            }
                          >
                            ✕ Reject
                          </button>

                        </div>

                      ) : (

                        <div
                          style={{
                            ...styles.completedMessage,
                            background:
                              status ===
                              "accepted"
                                ? "#ecfdf5"
                                : "#fff1f2",
                            color:
                              status ===
                              "accepted"
                                ? "#047857"
                                : "#be123c",
                          }}
                        >
                          {status ===
                          "accepted"
                            ? "✓ You accepted this visit request."
                            : "✕ You rejected this visit request."}
                        </div>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* ADD / EDIT PG */}
        <section style={styles.formSection}>

          <div style={styles.sectionHeader}>

            <div>

              <div style={styles.sectionTag}>
                PROPERTY MANAGEMENT
              </div>

              <h2 style={styles.sectionTitle}>
                {editingPGId
                  ? "✏️ Edit PG"
                  : "➕ Add New PG"}
              </h2>

              <p style={styles.sectionDescription}>
                {editingPGId
                  ? "Update your PG information below."
                  : "Add your PG details so students can find your property."}
              </p>

            </div>

            {editingPGId && (
              <div style={styles.editBadge}>
                Editing Property
              </div>
            )}

          </div>

          <form onSubmit={handleAddPG}>

            {/* BASIC INFORMATION */}
            <div style={styles.formHeading}>
              <span style={styles.numberCircle}>
                1
              </span>
              Basic Information
            </div>

            <div style={styles.formGrid}>

              <div style={styles.field}>

                <label style={styles.label}>
                  PG / Property Name
                </label>

                <input
                  type="text"
                  placeholder="Example: Green View PG"
                  value={pgName}
                  onChange={(e) =>
                    setPgName(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

              <div style={styles.field}>

                <label style={styles.label}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter contact number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

            </div>

            <div style={styles.field}>

              <label style={styles.label}>
                Full Address
              </label>

              <input
                type="text"
                placeholder="Enter complete PG address"
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                required
                style={styles.input}
              />

            </div>

            <div style={styles.formGrid}>

              <div style={styles.field}>

                <label style={styles.label}>
                  Nearby College
                </label>

                <input
                  type="text"
                  placeholder="Example: Pondicherry University"
                  value={college}
                  onChange={(e) =>
                    setCollege(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

              <div style={styles.field}>

                <label style={styles.label}>
                  Monthly Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Example: 7500"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

            </div>

            <div style={styles.formGrid}>

              <div style={styles.field}>

                <label style={styles.label}>
                  Room Type
                </label>

                <select
                  value={roomType}
                  onChange={(e) =>
                    setRoomType(e.target.value)
                  }
                  required
                  style={styles.input}
                >
                  <option value="">
                    Select room type
                  </option>

                  <option value="Single Room">
                    Single Room
                  </option>

                  <option value="Double Sharing">
                    Double Sharing
                  </option>

                  <option value="Triple Sharing">
                    Triple Sharing
                  </option>
                </select>

              </div>

              <div style={styles.field}>

                <label style={styles.label}>
                  Available Rooms
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Number of rooms"
                  value={rooms}
                  onChange={(e) =>
                    setRooms(e.target.value)
                  }
                  required
                  style={styles.input}
                />

              </div>

            </div>

            {/* LOCATION */}
            <div style={styles.locationBox}>

              <div style={styles.formHeading}>
                <span style={styles.numberCircle}>
                  2
                </span>
                PG Location
              </div>

              <p style={styles.locationText}>
                Save the PG location so students
                can calculate distance and get
                Google Maps directions.
              </p>

              <button
                type="button"
                onClick={
                  handleUseCurrentLocation
                }
                disabled={locationLoading}
                style={styles.locationButton}
              >
                {locationLoading
                  ? "📍 Getting Location..."
                  : "📍 Use My Current Location"}
              </button>

              <div style={styles.formGrid}>

                <div style={styles.field}>

                  <label style={styles.label}>
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    placeholder="Example: 11.913900"
                    value={latitude}
                    onChange={(e) =>
                      setLatitude(
                        e.target.value
                      )
                    }
                    required
                    style={styles.input}
                  />

                </div>

                <div style={styles.field}>

                  <label style={styles.label}>
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    placeholder="Example: 79.814500"
                    value={longitude}
                    onChange={(e) =>
                      setLongitude(
                        e.target.value
                      )
                    }
                    required
                    style={styles.input}
                  />

                </div>

              </div>

              {latitude &&
                longitude && (
                  <div
                    style={
                      styles.locationSuccess
                    }
                  >
                    ✓ Location ready:{" "}
                    {latitude},{" "}
                    {longitude}
                  </div>
                )}

            </div>

            {/* IMAGE */}
            <div style={styles.formHeading}>
              <span style={styles.numberCircle}>
                3
              </span>
              PG Image
            </div>

            <div style={styles.uploadBox}>

              <div style={styles.uploadIcon}>
                🖼️
              </div>

              <div style={{ flex: 1 }}>

                <label style={styles.label}>
                  Upload PG Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  style={
                    styles.fileInput
                  }
                />

                <small
                  style={
                    styles.helperText
                  }
                >
                  JPG or PNG. Maximum
                  original size: 5 MB.
                  Image will be compressed
                  automatically.
                </small>

              </div>

            </div>

            {imagePreview && (
              <div style={styles.previewBox}>

                <div
                  style={
                    styles.previewTitle
                  }
                >
                  Image Preview
                </div>

                <img
                  src={imagePreview}
                  alt="PG Preview"
                  style={
                    styles.previewImage
                  }
                />

              </div>
            )}

            {/* FACILITIES */}
            <div style={styles.formHeading}>
              <span style={styles.numberCircle}>
                4
              </span>
              Facilities
            </div>

            <div
              style={
                styles.facilitiesGrid
              }
            >

              {[
                ["wifi", "📶", "Wi-Fi"],
                ["food", "🍱", "Food"],
                ["ac", "❄️", "AC"],
                [
                  "laundry",
                  "🧺",
                  "Laundry",
                ],
                [
                  "parking",
                  "🚗",
                  "Parking",
                ],
                [
                  "security",
                  "🔒",
                  "Security",
                ],
              ].map(
                ([key, icon, label]) => (
                  <label
                    key={key}
                    style={{
                      ...styles.facilityCard,
                      ...(facilities[key]
                        ? styles.facilityActive
                        : {}),
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={
                        facilities[key]
                      }
                      onChange={() =>
                        handleFacilityChange(
                          key
                        )
                      }
                      style={
                        styles.checkbox
                      }
                    />

                    <span>{icon}</span>

                    <strong>
                      {label}
                    </strong>

                  </label>
                )
              )}

            </div>

            {/* BUTTONS */}
            <div style={styles.formButtons}>

              <button
                type="submit"
                disabled={loading}
                style={
                  styles.primaryButton
                }
              >
                {loading
                  ? "⏳ Saving..."
                  : editingPGId
                  ? "✓ Update PG"
                  : "＋ Add PG"}
              </button>

              {editingPGId && (
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  style={
                    styles.cancelButton
                  }
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>

        {/* MY PG LISTINGS */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>

              <div style={styles.sectionTag}>
                YOUR PROPERTIES
              </div>

              <h2 style={styles.sectionTitle}>
                🏠 My PG Listings
              </h2>

              <p
                style={
                  styles.sectionDescription
                }
              >
                View and manage all your
                registered PG properties.
              </p>

            </div>

            <div style={styles.countBadge}>
              {myPGs.length} Properties
            </div>

          </div>

          {loadingPGs ? (

            <div style={styles.emptyBox}>

              <div
                style={
                  styles.loadingIcon
                }
              >
                ⏳
              </div>

              <p>
                Loading your PG listings...
              </p>

            </div>

          ) : myPGs.length === 0 ? (

            <div style={styles.emptyBox}>

              <div style={styles.emptyIcon}>
                🏠
              </div>

              <h3
                style={
                  styles.emptyTitle
                }
              >
                No PG Listings Yet
              </h3>

              <p
                style={
                  styles.emptyText
                }
              >
                Add your first PG using
                the form above.
              </p>

            </div>

          ) : (

            <div style={styles.pgGrid}>

              {myPGs.map((pg) => {

                const pgFacilities =
                  getFacilities(pg);

                return (
                  <div
                    key={pg.id}
                    style={styles.pgCard}
                  >

                    <div
                      style={
                        styles.pgImageWrapper
                      }
                    >

                      {pg.imageUrl ? (

                        <img
                          src={pg.imageUrl}
                          alt={pg.pgName}
                          style={
                            styles.pgImage
                          }
                        />

                      ) : (

                        <div
                          style={
                            styles.noImage
                          }
                        >
                          🏠
                          <span>
                            No PG Image
                          </span>
                        </div>

                      )}

                      <div
                        style={
                          styles.priceBadge
                        }
                      >
                        ₹{pg.price}
                        <small>
                          {" "}
                          / month
                        </small>
                      </div>

                    </div>

                    <div
                      style={
                        styles.pgContent
                      }
                    >

                      <h3
                        style={
                          styles.pgTitle
                        }
                      >
                        {pg.pgName}
                      </h3>

                      <div
                        style={
                          styles.pgInfo
                        }
                      >
                        📍 {pg.address}
                      </div>

                      <div
                        style={
                          styles.pgInfo
                        }
                      >
                        🎓 Near{" "}
                        {pg.nearbyCollege}
                      </div>

                      <div
                        style={
                          styles.pgInfoRow
                        }
                      >

                        <span>
                          🛏️{" "}
                          {pg.roomType}
                        </span>

                        <span>
                          🚪{" "}
                          {pg.availableRooms}{" "}
                          rooms
                        </span>

                      </div>

                      {pgFacilities.length >
                        0 && (
                        <div
                          style={
                            styles.facilityTags
                          }
                        >

                          {pgFacilities.map(
                            (facility) => (
                              <span
                                key={
                                  facility
                                }
                                style={
                                  styles.facilityTag
                                }
                              >
                                {facility}
                              </span>
                            )
                          )}

                        </div>
                      )}

                      {pg.latitude !==
                        undefined &&
                        pg.longitude !==
                          undefined && (
                          <div
                            style={
                              styles.coordinates
                            }
                          >
                            📍{" "}
                            {pg.latitude},{" "}
                            {pg.longitude}
                          </div>
                        )}

                      <div
                        style={
                          styles.cardButtons
                        }
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleEditPG(
                              pg
                            )
                          }
                          style={
                            styles.editButton
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePG(
                              pg.id
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* RESPONSIVE CSS */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #f6f8fc;
          color: #172033;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        button {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            opacity 0.15s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {

          .owner-form-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-stats-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-request-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-pg-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-hero {
            grid-template-columns: 1fr !important;
          }

        }

        @media (max-width: 650px) {

          .owner-form-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-stats-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-request-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-pg-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-hero {
            grid-template-columns: 1fr !important;
          }

        }

        @media (max-width: 500px) {

          .owner-owner-badge {
            display: none !important;
          }

          .owner-form-buttons {
            flex-direction: column !important;
          }

          .owner-form-buttons button {
            width: 100% !important;
          }

        }

      `}</style>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f6f8fc",
  },

  navbar: {
    height: "72px",
    background: "#ffffff",
    borderBottom: "1px solid #e7eaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 5%",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  logo: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
  },

  logoSub: {
    fontSize: "11px",
    color: "#64748b",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  ownerBadge: {
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "20px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
  },

  logoutButton: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#dc2626",
    padding: "9px 16px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
  },

  container: {
    width: "min(1180px, 92%)",
    margin: "0 auto",
    padding: "32px 0 60px",
  },

  hero: {
    background:
      "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
    borderRadius: "22px",
    padding: "42px",
    color: "#ffffff",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  heroTag: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#a5b4fc",
    marginBottom: "12px",
  },

  heroTitle: {
    fontSize: "42px",
    lineHeight: "1.12",
    margin: 0,
    fontWeight: "800",
  },

  heroHighlight: {
    color: "#c7d2fe",
  },

  heroText: {
    maxWidth: "600px",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: "1.7",
    marginTop: "16px",
    marginBottom: 0,
  },

  heroIcon: {
    width: "120px",
    height: "120px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "55px",
  },

  message: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "13px 16px",
    marginBottom: "22px",
    fontSize: "14px",
    fontWeight: "600",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e8ebf1",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 4px 18px rgba(15, 23, 42, 0.04)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  statNumber: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e8ebf1",
    borderRadius: "18px",
    padding: "26px",
    marginBottom: "28px",
    boxShadow:
      "0 4px 18px rgba(15, 23, 42, 0.035)",
  },

  formSection: {
    background: "#ffffff",
    border: "1px solid #e8ebf1",
    borderRadius: "18px",
    padding: "30px",
    marginBottom: "28px",
    boxShadow:
      "0 4px 18px rgba(15, 23, 42, 0.035)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "24px",
  },

  sectionTag: {
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    marginBottom: "7px",
  },

  sectionTitle: {
    fontSize: "25px",
    margin: 0,
    color: "#111827",
    fontWeight: "800",
  },

  sectionDescription: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "7px",
    marginBottom: 0,
  },

  countBadge: {
    whiteSpace: "nowrap",
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  editBadge: {
    background: "#fff7ed",
    color: "#c2410c",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  emptyBox: {
    textAlign: "center",
    padding: "48px 20px",
    background: "#f8fafc",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1",
  },

  emptyIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  loadingIcon: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: "0 0 7px",
    fontSize: "18px",
    color: "#1e293b",
  },

  emptyText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  requestGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  requestCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
    padding: "20px",
    background: "#ffffff",
  },

  requestTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  requestPG: {
    fontWeight: "800",
    color: "#111827",
    fontSize: "16px",
  },

  requestStudent: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "5px",
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  acceptedBadge: {
    background: "#dcfce7",
    color: "#15803d",
  },

  rejectedBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#b45309",
  },

  requestDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "15px",
  },

  detailItem: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    gap: "9px",
  },

  studentMessage: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "16px",
  },

  messageTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#475569",
    marginBottom: "5px",
  },

  requestActions: {
    display: "flex",
    gap: "9px",
  },

  acceptButton: {
    flex: 1,
    border: "none",
    background: "#16a34a",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: "700",
  },

  rejectButton: {
    flex: 1,
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: "700",
  },

  completedMessage: {
    padding: "11px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "700",
  },

  formHeading: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "16px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "24px 0 16px",
  },

  numberCircle: {
    width: "25px",
    height: "25px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    outline: "none",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
  },

  locationBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    marginTop: "10px",
  },

  locationText: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  locationButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    padding: "11px 16px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    marginBottom: "15px",
  },

  locationSuccess: {
    color: "#047857",
    background: "#ecfdf5",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "700",
  },

  uploadBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: "13px",
    background: "#f8fafc",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  uploadIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  fileInput: {
    display: "block",
    width: "100%",
    fontSize: "13px",
  },

  helperText: {
    color: "#64748b",
    display: "block",
    marginTop: "7px",
    fontSize: "11px",
  },

  previewBox: {
    marginTop: "15px",
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "12px",
    display: "inline-block",
  },

  previewTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#475569",
    marginBottom: "9px",
  },

  previewImage: {
    width: "280px",
    height: "170px",
    objectFit: "cover",
    borderRadius: "9px",
    display: "block",
  },

  facilitiesGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  facilityCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "12px",
    cursor: "pointer",
    background: "#ffffff",
    fontSize: "13px",
  },

  facilityActive: {
    background: "#eef2ff",
    borderColor: "#818cf8",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#4f46e5",
  },

  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "28px",
  },

  primaryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
  },

  cancelButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    padding: "12px 20px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
  },

  pgGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  pgCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 5px 20px rgba(15, 23, 42, 0.05)",
  },

  pgImageWrapper: {
    height: "220px",
    position: "relative",
    background: "#e2e8f0",
  },

  pgImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  noImage: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "8px",
    color: "#64748b",
    fontSize: "30px",
  },

  priceBadge: {
    position: "absolute",
    bottom: "12px",
    left: "12px",
    background: "#111827",
    color: "#ffffff",
    padding: "8px 11px",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "14px",
  },

  pgContent: {
    padding: "19px",
  },

  pgTitle: {
    margin: "0 0 12px",
    fontSize: "19px",
    color: "#111827",
    fontWeight: "800",
  },

  pgInfo: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "7px",
  },

  pgInfoRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
    marginBottom: "12px",
  },

  coordinates: {
    background: "#f8fafc",
    color: "#64748b",
    borderRadius: "8px",
    padding: "8px",
    fontSize: "11px",
    marginTop: "12px",
  },

  facilityTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "10px",
  },

  facilityTag: {
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "20px",
    padding: "5px 8px",
    fontSize: "10px",
    fontWeight: "700",
  },

  cardButtons: {
    display: "flex",
    gap: "9px",
    marginTop: "17px",
  },

  editButton: {
    flex: 1,
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "9px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },
};

export default OwnerDashboard;