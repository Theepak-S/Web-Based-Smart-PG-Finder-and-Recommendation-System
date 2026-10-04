import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";

function StudentLogin() {
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
        email.trim(),
        password
      );

      navigate("/student-dashboard");
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-page">

      {/* ================= NAVBAR ================= */}

      <header className="student-login-navbar">
        <Link
          to="/"
          className="student-login-brand"
        >
          🏠 Smart PG Finder
        </Link>

        <Link
          to="/"
          className="student-login-home-link"
        >
          Home
        </Link>
      </header>

      {/* ================= MAIN ================= */}

      <main className="student-login-main">

        <div className="student-login-card">

          {/* ================= LEFT SIDE ================= */}

          <section className="student-login-left">

            <div className="student-login-house-icon">
              🏠
            </div>

            <h1>
              Find Your Perfect PG
            </h1>

            <p className="student-login-left-description">
              Search for comfortable and affordable
              accommodation near your college.
            </p>

            <div className="student-login-points">

              <div className="student-login-point">
                <div className="student-login-point-icon">
                  🔍
                </div>

                <div>
                  <strong>Easy Search</strong>

                  <p>
                    Find PGs based on college
                    and location.
                  </p>
                </div>
              </div>

              <div className="student-login-point">
                <div className="student-login-point-icon">
                  💰
                </div>

                <div>
                  <strong>Compare Prices</strong>

                  <p>
                    Compare rent, rooms
                    and facilities.
                  </p>
                </div>
              </div>

              <div className="student-login-point">
                <div className="student-login-point-icon">
                  📍
                </div>

                <div>
                  <strong>Find Nearby PGs</strong>

                  <p>
                    Find PGs close to your
                    current location.
                  </p>
                </div>
              </div>

              <div className="student-login-point">
                <div className="student-login-point-icon">
                  📩
                </div>

                <div>
                  <strong>Request a Visit</strong>

                  <p>
                    Contact owners and
                    request a PG visit.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* ================= RIGHT SIDE ================= */}

          <section className="student-login-right">

            <div className="student-login-form-wrapper">

              <div className="student-login-heading">

                <p className="student-login-label">
                  STUDENT PORTAL
                </p>

                <h2>
                  Welcome Back 👋
                </h2>

                <p>
                  Login to continue finding
                  your ideal PG.
                </p>

              </div>

              {/* ================= FORM ================= */}

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="student-login-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                  />

                </div>

                {/* PASSWORD */}

                <div className="student-login-field">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    autoComplete="current-password"
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="student-login-error">
                    ⚠️ {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="student-login-submit"
                >
                  {loading
                    ? "Logging in..."
                    : "Login as Student"}
                </button>

              </form>

              {/* ================= REGISTER ================= */}

              <div className="student-login-register">

                <p>
                  Don't have a student account?
                </p>

                <Link to="/student-register">
                  Create Student Account →
                </Link>

              </div>

              {/* ================= BACK HOME ================= */}

              <div className="student-login-back-home">

                <Link to="/">
                  ← Back to Home
                </Link>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="student-login-footer">
        © 2026 Smart PG Finder. All rights reserved.
      </footer>

      {/* ================= RESPONSIVE CSS ================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }

        .student-login-page {
          min-height: 100vh;
          width: 100%;
          background:
            linear-gradient(
              135deg,
              #eef5ff 0%,
              #f8fbff 50%,
              #eaf3ff 100%
            );
          display: flex;
          flex-direction: column;
          color: #172033;
        }

        .student-login-navbar {
          min-height: 70px;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 7%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          gap: 15px;
        }

        .student-login-brand {
          text-decoration: none;
          color: #173b72;
          font-size: 22px;
          font-weight: 800;
          white-space: nowrap;
        }

        .student-login-home-link {
          text-decoration: none;
          color: #555;
          font-weight: 600;
          white-space: nowrap;
        }

        .student-login-main {
          flex: 1;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 50px 20px;
        }

        .student-login-card {
          width: 100%;
          max-width: 1050px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 45px rgba(0,0,0,0.10);
        }

        .student-login-left {
          min-width: 0;
          background:
            linear-gradient(
              145deg,
              #173b72,
              #2563a8
            );
          color: white;
          padding: 55px 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .student-login-house-icon {
          font-size: 52px;
          margin-bottom: 20px;
        }

        .student-login-left h1 {
          margin: 0 0 18px;
          font-size: 36px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .student-login-left-description {
          margin: 0 0 30px;
          color: #e6f0ff;
          font-size: 17px;
          line-height: 1.7;
        }

        .student-login-points {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .student-login-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .student-login-point-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-login-point strong {
          display: block;
          font-size: 14px;
        }

        .student-login-point p {
          margin: 5px 0 0;
          color: #dbeafe;
          font-size: 13px;
          line-height: 1.5;
        }

        .student-login-right {
          min-width: 0;
          background: #ffffff;
          padding: 50px 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .student-login-form-wrapper {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          min-width: 0;
        }

        .student-login-heading {
          margin-bottom: 30px;
        }

        .student-login-label {
          color: #2563a8;
          font-weight: 700;
          margin: 0 0 8px;
          letter-spacing: 0.5px;
          font-size: 13px;
        }

        .student-login-heading h2 {
          font-size: 32px;
          color: #172033;
          margin: 0 0 10px;
          line-height: 1.15;
          overflow-wrap: anywhere;
        }

        .student-login-heading > p:last-child {
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
          font-size: 14px;
        }

        .student-login-field {
          margin-bottom: 20px;
        }

        .student-login-field label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .student-login-field input {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 14px 15px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          background: #ffffff;
        }

        .student-login-field input:focus {
          border-color: #2563a8;
          box-shadow: 0 0 0 3px rgba(37,99,168,0.10);
        }

        .student-login-error {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 14px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          overflow-wrap: anywhere;
        }

        .student-login-submit {
          display: block;
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: #2563a8;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(37,99,168,0.25);
        }

        .student-login-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .student-login-register {
          text-align: center;
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid #e5e7eb;
        }

        .student-login-register p {
          color: #6b7280;
          margin: 0 0 10px;
          font-size: 14px;
        }

        .student-login-register a {
          color: #2563a8;
          font-weight: 700;
          text-decoration: none;
        }

        .student-login-back-home {
          text-align: center;
          margin-top: 22px;
        }

        .student-login-back-home a {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
        }

        .student-login-footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
          width: 100%;
        }

        /* ================= TABLET ================= */

        @media (max-width: 850px) {

          .student-login-navbar {
            padding: 0 5%;
          }

          .student-login-main {
            padding: 35px 16px;
          }

          .student-login-card {
            max-width: 700px;
          }

          .student-login-left {
            padding: 40px 30px;
          }

          .student-login-right {
            padding: 40px 30px;
          }

          .student-login-left h1 {
            font-size: 30px;
          }

          .student-login-heading h2 {
            font-size: 28px;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 650px) {

          .student-login-navbar {
            min-height: 64px;
            padding: 0 16px;
          }

          .student-login-brand {
            font-size: 17px;
          }

          .student-login-home-link {
            font-size: 13px;
          }

          .student-login-main {
            display: block;
            width: 100%;
            padding: 20px 12px 30px;
          }

          .student-login-card {
            width: 100%;
            max-width: 100%;
            display: block;
            border-radius: 16px;
            overflow: hidden;
          }

          .student-login-left {
            width: 100%;
            padding: 30px 24px;
            display: block;
          }

          .student-login-house-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .student-login-left h1 {
            font-size: 31px;
            line-height: 1.12;
            margin-bottom: 14px;
          }

          .student-login-left-description {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 22px;
          }

          .student-login-points {
            gap: 14px;
          }

          .student-login-point {
            gap: 10px;
          }

          .student-login-point-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;
            font-size: 14px;
          }

          .student-login-point strong {
            font-size: 13px;
          }

          .student-login-point p {
            font-size: 12px;
          }

          .student-login-right {
            width: 100%;
            padding: 32px 24px;
          }

          .student-login-form-wrapper {
            width: 100%;
            max-width: 100%;
          }

          .student-login-heading {
            margin-bottom: 24px;
          }

          .student-login-label {
            font-size: 11px;
          }

          .student-login-heading h2 {
            font-size: 28px;
            line-height: 1.15;
          }

          .student-login-heading > p:last-child {
            font-size: 13px;
          }

          .student-login-field {
            margin-bottom: 17px;
          }

          .student-login-field input {
            width: 100%;
            font-size: 14px;
            padding: 13px;
          }

          .student-login-submit {
            width: 100%;
            font-size: 15px;
            padding: 13px;
          }

          .student-login-register {
            margin-top: 20px;
            padding-top: 18px;
          }

          .student-login-register p,
          .student-login-register a {
            font-size: 13px;
          }

          .student-login-back-home {
            margin-top: 18px;
          }

          .student-login-footer {
            padding: 16px 12px;
            font-size: 12px;
          }
        }

        /* ================= SMALL MOBILE ================= */

        @media (max-width: 400px) {

          .student-login-navbar {
            padding: 0 12px;
          }

          .student-login-brand {
            font-size: 15px;
          }

          .student-login-home-link {
            font-size: 12px;
          }

          .student-login-main {
            padding: 14px 8px 24px;
          }

          .student-login-left {
            padding: 25px 18px;
          }

          .student-login-right {
            padding: 26px 18px;
          }

          .student-login-left h1 {
            font-size: 28px;
          }

          .student-login-heading h2 {
            font-size: 25px;
          }

        }

      `}</style>

    </div>
  );
}

export default StudentLogin;