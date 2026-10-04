import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";

import { doc, setDoc } from "firebase/firestore";

function OwnerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pgName, setPgName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "owners", user.uid), {
        name: name,
        email: email,
        phone: phone,
        pgName: pgName,
        role: "owner",
        createdAt: new Date(),
      });

      alert("Owner account created successfully!");

      navigate("/owner-login");
    } catch (error) {
      console.error("Owner registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="owner-register-page">

      {/* ONLY RESPONSIVE LAYOUT CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .owner-register-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .owner-register-navbar {
          width: 100%;
          min-width: 0;
        }

        .owner-register-main {
          width: 100%;
          min-width: 0;
        }

        .owner-register-container {
          width: 100%;
          min-width: 0;
        }

        .owner-register-left-panel,
        .owner-register-right-panel,
        .owner-register-form-container {
          min-width: 0;
          max-width: 100%;
        }

        .owner-register-feature {
          min-width: 0;
          max-width: 100%;
        }

        .owner-register-feature-text {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .owner-register-form-field {
          width: 100%;
          min-width: 0;
        }

        .owner-register-input {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .owner-register-button {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 760px) {

          .owner-register-page {
            width: 100%;
            min-height: 100vh;
            padding: 0 !important;
          }

          .owner-register-navbar {
            height: auto !important;
            min-height: 65px !important;
            padding: 12px 16px !important;
            gap: 10px !important;
          }

          .owner-register-navbar-logo {
            font-size: 18px !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-navbar-home {
            font-size: 14px !important;
            white-space: nowrap !important;
          }

          .owner-register-main {
            width: 100% !important;
            min-width: 0 !important;
            padding: 18px 10px !important;
            align-items: flex-start !important;
          }

          .owner-register-container {
            width: 100% !important;
            max-width: 540px !important;
            grid-template-columns: 1fr !important;
            border-radius: 16px !important;
            overflow: hidden !important;
          }

          .owner-register-left-panel {
            width: 100% !important;
            padding: 30px 22px !important;
          }

          .owner-register-right-panel {
            width: 100% !important;
            padding: 30px 22px !important;
          }

          .owner-register-form-container {
            width: 100% !important;
            max-width: 100% !important;
          }

          .owner-register-left-title {
            font-size: 29px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-left-description {
            max-width: 100% !important;
            font-size: 14px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-features {
            width: 100% !important;
          }

          .owner-register-feature {
            width: 100% !important;
          }

          .owner-register-title {
            font-size: 27px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-subtitle {
            font-size: 14px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-login-section {
            width: 100% !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-login-link,
          .owner-register-back-link {
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-register-footer {
            width: 100% !important;
            padding: 18px 12px !important;
            overflow-wrap: anywhere !important;
          }
        }

        @media (max-width: 420px) {

          .owner-register-navbar {
            padding: 10px 12px !important;
          }

          .owner-register-navbar-logo {
            font-size: 16px !important;
          }

          .owner-register-navbar-home {
            font-size: 13px !important;
          }

          .owner-register-main {
            padding: 10px 8px !important;
          }

          .owner-register-container {
            border-radius: 14px !important;
          }

          .owner-register-left-panel {
            padding: 24px 15px !important;
          }

          .owner-register-right-panel {
            padding: 24px 15px !important;
          }

          .owner-register-left-title {
            font-size: 25px !important;
          }

          .owner-register-left-description {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }

          .owner-register-title {
            font-size: 23px !important;
          }

          .owner-register-subtitle {
            font-size: 13px !important;
          }

          .owner-register-input {
            font-size: 16px !important;
            padding: 13px !important;
          }

          .owner-register-button {
            font-size: 14px !important;
            padding: 13px !important;
          }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}

      <header
        style={styles.navbar}
        className="owner-register-navbar"
      >
        <Link
          to="/"
          style={styles.logo}
          className="owner-register-navbar-logo"
        >
          🏠 Smart PG Finder
        </Link>

        <Link
          to="/"
          style={styles.homeLink}
          className="owner-register-navbar-home"
        >
          Home
        </Link>
      </header>

      {/* ================= MAIN ================= */}

      <main
        style={styles.main}
        className="owner-register-main"
      >

        <div
          style={styles.container}
          className="owner-register-container"
        >

          {/* ================= LEFT PANEL ================= */}

          <div
            style={styles.leftPanel}
            className="owner-register-left-panel"
          >

            <div style={styles.icon}>🏢</div>

            <h1
              style={styles.leftTitle}
              className="owner-register-left-title"
            >
              List Your PG
            </h1>

            <p
              style={styles.leftDescription}
              className="owner-register-left-description"
            >
              Create your owner account and start
              connecting your PG with students.
            </p>

            <div
              style={styles.features}
              className="owner-register-features"
            >

              <Feature
                icon="🏠"
                title="List Your Property"
                text="Add your PG details and make them visible to students."
              />

              <Feature
                icon="📝"
                title="Manage PG Details"
                text="Update your property information whenever needed."
              />

              <Feature
                icon="📩"
                title="Receive Visit Requests"
                text="View and manage requests from students."
              />

              <Feature
                icon="📱"
                title="Connect With Students"
                text="Contact students interested in your PG."
              />

            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}

          <div
            style={styles.rightPanel}
            className="owner-register-right-panel"
          >

            <div
              style={styles.formContainer}
              className="owner-register-form-container"
            >

              <div style={styles.headingSection}>

                <p style={styles.smallHeading}>
                  OWNER REGISTRATION
                </p>

                <h2
                  style={styles.title}
                  className="owner-register-title"
                >
                  Create Owner Account 🏢
                </h2>

                <p
                  style={styles.subtitle}
                  className="owner-register-subtitle"
                >
                  Register your details to start managing your PG.
                </p>

              </div>

              <form onSubmit={handleRegister}>

                {/* OWNER NAME */}

                <div
                  style={styles.field}
                  className="owner-register-form-field"
                >
                  <label style={styles.label}>
                    Owner Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                    className="owner-register-input"
                  />
                </div>

                {/* EMAIL */}

                <div
                  style={styles.field}
                  className="owner-register-form-field"
                >
                  <label style={styles.label}>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    className="owner-register-input"
                  />
                </div>

                {/* PHONE */}

                <div
                  style={styles.field}
                  className="owner-register-form-field"
                >
                  <label style={styles.label}>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={styles.input}
                    className="owner-register-input"
                  />
                </div>

                {/* PASSWORD */}

                <div
                  style={styles.field}
                  className="owner-register-form-field"
                >
                  <label style={styles.label}>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    style={styles.input}
                    className="owner-register-input"
                  />

                  <small style={styles.helperText}>
                    Minimum 6 characters
                  </small>
                </div>

                {/* PG NAME */}

                <div
                  style={styles.field}
                  className="owner-register-form-field"
                >
                  <label style={styles.label}>
                    PG / Property Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your PG name"
                    value={pgName}
                    onChange={(e) => setPgName(e.target.value)}
                    required
                    style={styles.input}
                    className="owner-register-input"
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div style={styles.errorBox}>
                    ⚠️ {error}
                  </div>
                )}

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    background: loading ? "#94a3b8" : "#2563a8",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  className="owner-register-button"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Owner Account"}
                </button>

              </form>

              {/* LOGIN LINK */}

              <div
                style={styles.loginSection}
                className="owner-register-login-section"
              >

                <p style={styles.loginText}>
                  Already have an owner account?
                </p>

                <Link
                  to="/owner-login"
                  style={styles.loginLink}
                  className="owner-register-login-link"
                >
                  Login to Owner Account →
                </Link>

              </div>

              {/* HOME LINK */}

              <div style={styles.backHome}>
                <Link
                  to="/"
                  style={styles.backHomeLink}
                  className="owner-register-back-link"
                >
                  ← Back to Home
                </Link>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer
        style={styles.footer}
        className="owner-register-footer"
      >
        © 2026 Smart PG Finder. All rights reserved.
      </footer>

    </div>
  );
}


/* =====================================================
   FEATURE COMPONENT
===================================================== */

function Feature({ icon, title, text }) {
  return (
    <div
      style={styles.feature}
      className="owner-register-feature"
    >

      <div style={styles.featureIcon}>
        {icon}
      </div>

      <div className="owner-register-feature-text">

        <strong style={styles.featureTitle}>
          {title}
        </strong>

        <p style={styles.featureText}>
          {text}
        </p>

      </div>

    </div>
  );
}


/* =====================================================
   FORM FIELD COMPONENT
===================================================== */

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div
      style={styles.field}
      className="owner-register-form-field"
    >

      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        style={styles.input}
        className="owner-register-input"
      />

    </div>
  );
}


/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef5ff 0%, #f8fbff 50%, #eaf3ff 100%)",
    display: "flex",
    flexDirection: "column",
  },

  /* NAVBAR */

  navbar: {
    height: "70px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 7%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },

  logo: {
    textDecoration: "none",
    color: "#173b72",
    fontSize: "22px",
    fontWeight: "800",
  },

  homeLink: {
    textDecoration: "none",
    color: "#555",
    fontWeight: "600",
  },

  /* MAIN */

  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "45px 20px",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 15px 45px rgba(0,0,0,0.10)",
  },

  /* LEFT */

  leftPanel: {
    background:
      "linear-gradient(145deg, #173b72, #2563a8)",
    color: "#ffffff",
    padding: "50px 45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  icon: {
    fontSize: "52px",
    marginBottom: "18px",
  },

  leftTitle: {
    fontSize: "36px",
    lineHeight: "1.2",
    margin: "0 0 18px",
  },

  leftDescription: {
    fontSize: "17px",
    lineHeight: "1.7",
    color: "#e6f0ff",
    marginBottom: "30px",
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  featureIcon: {
    fontSize: "20px",
    width: "28px",
  },

  featureTitle: {
    fontSize: "15px",
  },

  featureText: {
    margin: "5px 0 0",
    color: "#dbeafe",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  /* RIGHT */

  rightPanel: {
    padding: "45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  formContainer: {
    maxWidth: "440px",
    width: "100%",
    margin: "0 auto",
  },

  headingSection: {
    marginBottom: "25px",
  },

  smallHeading: {
    color: "#2563a8",
    fontWeight: "700",
    marginBottom: "8px",
    letterSpacing: "0.5px",
    fontSize: "13px",
  },

  title: {
    fontSize: "31px",
    color: "#172033",
    margin: "0 0 10px",
  },

  subtitle: {
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.6",
  },

  /* FORM */

  field: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },

  helperText: {
    display: "block",
    marginTop: "5px",
    color: "#6b7280",
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    padding: "11px 14px",
    borderRadius: "8px",
    marginBottom: "17px",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow: "0 5px 15px rgba(37,99,168,0.25)",
  },

  /* LOGIN */

  loginSection: {
    textAlign: "center",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #e5e7eb",
  },

  loginText: {
    color: "#6b7280",
    marginBottom: "8px",
  },

  loginLink: {
    color: "#2563a8",
    fontWeight: "700",
    textDecoration: "none",
  },

  /* HOME */

  backHome: {
    textAlign: "center",
    marginTop: "16px",
  },

  backHomeLink: {
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "14px",
  },

  /* FOOTER */

  footer: {
    textAlign: "center",
    padding: "18px",
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default OwnerRegister;