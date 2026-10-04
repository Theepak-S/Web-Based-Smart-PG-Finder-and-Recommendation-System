import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Owner login successful!");

      navigate("/owner-dashboard");
    } catch (error) {
      console.error("Owner login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="owner-login-page">

      {/* MOBILE RESPONSIVE LAYOUT ONLY */}
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

        .owner-login-page {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .owner-login-navbar {
          width: 100%;
          min-width: 0;
        }

        .owner-login-main {
          width: 100%;
          min-width: 0;
        }

        .owner-login-container {
          width: 100%;
          min-width: 0;
        }

        .owner-login-left-panel,
        .owner-login-right-panel,
        .owner-login-form-container {
          min-width: 0;
          max-width: 100%;
        }

        .owner-login-feature {
          min-width: 0;
          max-width: 100%;
        }

        .owner-login-feature-text {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .owner-login-input {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .owner-login-button {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 760px) {

          .owner-login-page {
            min-height: 100vh;
            width: 100%;
            padding: 0 !important;
          }

          .owner-login-navbar {
            height: auto !important;
            min-height: 65px !important;
            padding: 12px 16px !important;
            gap: 10px !important;
          }

          .owner-login-navbar-logo {
            font-size: 18px !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-navbar-home {
            font-size: 14px !important;
            white-space: nowrap !important;
          }

          .owner-login-main {
            padding: 18px 10px !important;
            width: 100% !important;
            min-width: 0 !important;
            align-items: flex-start !important;
          }

          .owner-login-container {
            width: 100% !important;
            max-width: 540px !important;
            grid-template-columns: 1fr !important;
            border-radius: 16px !important;
            overflow: hidden !important;
          }

          .owner-login-left-panel {
            width: 100% !important;
            padding: 30px 22px !important;
          }

          .owner-login-right-panel {
            width: 100% !important;
            padding: 30px 22px !important;
          }

          .owner-login-form-container {
            width: 100% !important;
            max-width: 100% !important;
          }

          .owner-login-left-title {
            font-size: 29px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-left-description {
            max-width: 100% !important;
            font-size: 14px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-features {
            width: 100% !important;
          }

          .owner-login-feature {
            width: 100% !important;
          }

          .owner-login-heading {
            font-size: 27px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-subtitle {
            font-size: 14px !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-register-section {
            width: 100% !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-register-link,
          .owner-login-back-link {
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
          }

          .owner-login-footer {
            width: 100% !important;
            padding: 18px 12px !important;
            overflow-wrap: anywhere !important;
          }
        }

        @media (max-width: 420px) {

          .owner-login-navbar {
            padding: 10px 12px !important;
          }

          .owner-login-navbar-logo {
            font-size: 16px !important;
          }

          .owner-login-navbar-home {
            font-size: 13px !important;
          }

          .owner-login-main {
            padding: 10px 8px !important;
          }

          .owner-login-container {
            border-radius: 14px !important;
          }

          .owner-login-left-panel {
            padding: 24px 15px !important;
          }

          .owner-login-right-panel {
            padding: 24px 15px !important;
          }

          .owner-login-left-title {
            font-size: 25px !important;
          }

          .owner-login-left-description {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }

          .owner-login-heading {
            font-size: 23px !important;
          }

          .owner-login-subtitle {
            font-size: 13px !important;
          }

          .owner-login-input {
            font-size: 16px !important;
            padding: 13px !important;
          }

          .owner-login-button {
            font-size: 14px !important;
            padding: 13px !important;
          }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}

      <header
        style={styles.navbar}
        className="owner-login-navbar"
      >
        <Link
          to="/"
          style={styles.logo}
          className="owner-login-navbar-logo"
        >
          🏠 Smart PG Finder
        </Link>

        <Link
          to="/"
          style={styles.homeLink}
          className="owner-login-navbar-home"
        >
          Home
        </Link>
      </header>


      {/* ================= MAIN ================= */}

      <main
        style={styles.main}
        className="owner-login-main"
      >

        <div
          style={styles.container}
          className="owner-login-container"
        >

          {/* ================= LEFT PANEL ================= */}

          <section
            style={styles.leftPanel}
            className="owner-login-left-panel"
          >

            <div style={styles.mainIcon}>
              🏢
            </div>

            <h1
              style={styles.leftTitle}
              className="owner-login-left-title"
            >
              Manage Your PG
            </h1>

            <p
              style={styles.leftDescription}
              className="owner-login-left-description"
            >
              Login to manage your PG listings and
              connect with students looking for accommodation.
            </p>


            <div
              style={styles.features}
              className="owner-login-features"
            >

              <Feature
                icon="🏠"
                title="Manage PG Listings"
                text="Add and manage your PG properties."
              />

              <Feature
                icon="📝"
                title="Update PG Details"
                text="Keep your property information updated."
              />

              <Feature
                icon="📩"
                title="Manage Visit Requests"
                text="View and respond to student requests."
              />

              <Feature
                icon="📱"
                title="Connect With Students"
                text="Contact students interested in your PG."
              />

            </div>

          </section>


          {/* ================= LOGIN PANEL ================= */}

          <section
            style={styles.loginPanel}
            className="owner-login-right-panel"
          >

            <div
              style={styles.formContainer}
              className="owner-login-form-container"
            >

              <div style={styles.headingArea}>

                <div style={styles.portalText}>
                  PG OWNER LOGIN
                </div>

                <h2
                  style={styles.heading}
                  className="owner-login-heading"
                >
                  Welcome Back 👋
                </h2>

                <p
                  style={styles.subtitle}
                  className="owner-login-subtitle"
                >
                  Login to access your owner dashboard.
                </p>

              </div>


              {/* ================= FORM ================= */}

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div style={styles.inputGroup}>

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
                    className="owner-login-input"
                  />

                </div>


                {/* PASSWORD */}

                <div style={styles.inputGroup}>

                  <label style={styles.label}>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                    className="owner-login-input"
                  />

                </div>


                {/* ERROR */}

                {error && (
                  <div style={styles.errorBox}>
                    ⚠️ {error}
                  </div>
                )}


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.loginButton,
                    backgroundColor: loading
                      ? "#94a3b8"
                      : "#2563a8",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                  className="owner-login-button"
                >
                  {loading
                    ? "Logging in..."
                    : "Login to Owner Dashboard"}
                </button>

              </form>


              {/* ================= REGISTER ================= */}

              <div
                style={styles.registerSection}
                className="owner-login-register-section"
              >

                <p style={styles.registerText}>
                  Don't have an owner account?
                </p>

                <Link
                  to="/owner-register"
                  style={styles.registerLink}
                  className="owner-login-register-link"
                >
                  Create Owner Account →
                </Link>

              </div>


              {/* ================= HOME ================= */}

              <div style={styles.backHome}>

                <Link
                  to="/"
                  style={styles.backLink}
                  className="owner-login-back-link"
                >
                  ← Back to Home
                </Link>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer
        style={styles.footer}
        className="owner-login-footer"
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
      className="owner-login-feature"
    >

      <div style={styles.featureIcon}>
        {icon}
      </div>

      <div className="owner-login-feature-text">

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
   STYLES
===================================================== */

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef5ff 0%, #f8fbff 50%, #eaf3ff 100%)",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  navbar: {
    height: "70px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 7%",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.04)",
  },

  logo: {
    textDecoration: "none",
    color: "#173b72",
    fontSize: "22px",
    fontWeight: "800",
  },

  homeLink: {
    textDecoration: "none",
    color: "#4b5563",
    fontWeight: "600",
    fontSize: "15px",
  },

  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "45px 20px",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#ffffff",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow:
      "0 20px 55px rgba(15,23,42,0.12)",
  },

  /* LEFT PANEL */

  leftPanel: {
    background:
      "linear-gradient(145deg, #173b72, #2563a8)",
    color: "#ffffff",
    padding: "50px 45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  mainIcon: {
    fontSize: "50px",
    marginBottom: "18px",
  },

  leftTitle: {
    fontSize: "36px",
    lineHeight: "1.2",
    margin: "0 0 18px",
  },

  leftDescription: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#e6f0ff",
    marginBottom: "30px",
    maxWidth: "450px",
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
  },

  featureIcon: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  featureTitle: {
    display: "block",
    fontSize: "15px",
  },

  featureText: {
    margin: "4px 0 0",
    color: "#dbeafe",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  /* RIGHT PANEL */

  loginPanel: {
    padding: "55px 45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  formContainer: {
    width: "100%",
    maxWidth: "420px",
    margin: "0 auto",
  },

  headingArea: {
    marginBottom: "30px",
  },

  portalText: {
    color: "#2563a8",
    fontWeight: "800",
    fontSize: "13px",
    letterSpacing: "1px",
    marginBottom: "8px",
  },

  heading: {
    fontSize: "32px",
    color: "#172033",
    margin: "0 0 10px",
  },

  subtitle: {
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.6",
    fontSize: "15px",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    padding: "11px 14px",
    borderRadius: "9px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow:
      "0 6px 18px rgba(37,99,168,0.25)",
  },

  registerSection: {
    textAlign: "center",
    marginTop: "25px",
    paddingTop: "22px",
    borderTop: "1px solid #e5e7eb",
  },

  registerText: {
    color: "#6b7280",
    margin: "0 0 9px",
    fontSize: "14px",
  },

  registerLink: {
    color: "#2563a8",
    fontWeight: "700",
    textDecoration: "none",
    fontSize: "15px",
  },

  backHome: {
    textAlign: "center",
    marginTop: "20px",
  },

  backLink: {
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "14px",
  },

  footer: {
    textAlign: "center",
    padding: "20px",
    color: "#6b7280",
    fontSize: "13px",
  },
};

export default OwnerLogin;