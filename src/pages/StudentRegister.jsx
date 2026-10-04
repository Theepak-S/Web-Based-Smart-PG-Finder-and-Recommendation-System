import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

function StudentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      await setDoc(
        doc(db, "students", user.uid),
        {
          name: name.trim(),
          email: email.trim(),
          college: college.trim(),
          role: "student",
          createdAt: new Date(),
        }
      );

      alert("Student account created successfully!");

      navigate("/student-login");
    } catch (error) {
      console.error("Registration error:", error);

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
    <div className="student-register-page">

      {/* ================= NAVBAR ================= */}

      <header className="student-register-navbar">

        <Link
          to="/"
          className="student-register-brand"
        >
          🏠 Smart PG Finder
        </Link>

        <Link
          to="/"
          className="student-register-home"
        >
          Home
        </Link>

      </header>

      {/* ================= MAIN ================= */}

      <main className="student-register-main">

        <div className="student-register-card">

          {/* ================= LEFT PANEL ================= */}

          <section className="student-register-left">

            <div className="student-register-icon">
              🎓
            </div>

            <h1>
              Start Your PG Search
            </h1>

            <p className="student-register-description">
              Create your student account and discover
              PG accommodations near your college.
            </p>

            <div className="student-register-points">

              <div className="student-register-point">

                <div className="student-register-point-icon">
                  🏠
                </div>

                <div>
                  <strong>
                    Find Suitable PGs
                  </strong>

                  <p>
                    Search PGs according to your needs.
                  </p>
                </div>

              </div>

              <div className="student-register-point">

                <div className="student-register-point-icon">
                  📍
                </div>

                <div>
                  <strong>
                    Location Based Search
                  </strong>

                  <p>
                    Find PGs near your current location.
                  </p>
                </div>

              </div>

              <div className="student-register-point">

                <div className="student-register-point-icon">
                  ❤️
                </div>

                <div>
                  <strong>
                    Save Favorites
                  </strong>

                  <p>
                    Save PGs and check them later.
                  </p>
                </div>

              </div>

              <div className="student-register-point">

                <div className="student-register-point-icon">
                  📩
                </div>

                <div>
                  <strong>
                    Request a Visit
                  </strong>

                  <p>
                    Send visit requests directly to owners.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* ================= RIGHT PANEL ================= */}

          <section className="student-register-right">

            <div className="student-register-form-wrapper">

              <div className="student-register-heading">

                <p className="student-register-label">
                  STUDENT REGISTRATION
                </p>

                <h2>
                  Create Account 🎓
                </h2>

                <p>
                  Register to start searching for your
                  perfect PG.
                </p>

              </div>

              {/* ================= FORM ================= */}

              <form onSubmit={handleRegister}>

                {/* NAME */}

                <div className="student-register-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                    autoComplete="name"
                  />

                </div>

                {/* EMAIL */}

                <div className="student-register-field">

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

                <div className="student-register-field">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    minLength={6}
                    required
                    autoComplete="new-password"
                  />

                  <small>
                    Minimum 6 characters
                  </small>

                </div>

                {/* COLLEGE */}

                <div className="student-register-field">

                  <label>
                    College Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your college name"
                    value={college}
                    onChange={(e) =>
                      setCollege(e.target.value)
                    }
                    required
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="student-register-error">
                    ⚠️ {error}
                  </div>
                )}

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="student-register-submit"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Student Account"}
                </button>

              </form>

              {/* ================= LOGIN LINK ================= */}

              <div className="student-register-login">

                <p>
                  Already have an account?
                </p>

                <Link to="/student-login">
                  Login to Student Account →
                </Link>

              </div>

              {/* ================= HOME ================= */}

              <div className="student-register-back">

                <Link to="/">
                  ← Back to Home
                </Link>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="student-register-footer">
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

        .student-register-page {
          width: 100%;
          min-height: 100vh;
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

        /* ================= NAVBAR ================= */

        .student-register-navbar {
          width: 100%;
          min-height: 70px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 7%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .student-register-brand {
          text-decoration: none;
          color: #173b72;
          font-size: 22px;
          font-weight: 800;
          white-space: nowrap;
        }

        .student-register-home {
          text-decoration: none;
          color: #555;
          font-weight: 600;
          white-space: nowrap;
        }

        /* ================= MAIN ================= */

        .student-register-main {
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 20px;
        }

        .student-register-card {
          width: 100%;
          max-width: 1050px;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 15px 45px rgba(0,0,0,0.10);
        }

        /* ================= LEFT ================= */

        .student-register-left {
          min-width: 0;
          background:
            linear-gradient(
              145deg,
              #173b72,
              #2563a8
            );
          color: #ffffff;
          padding: 50px 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .student-register-icon {
          font-size: 52px;
          margin-bottom: 18px;
        }

        .student-register-left h1 {
          margin: 0 0 18px;
          font-size: 36px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .student-register-description {
          margin: 0 0 30px;
          color: #e6f0ff;
          font-size: 17px;
          line-height: 1.7;
        }

        .student-register-points {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .student-register-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .student-register-point-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 9px;
          background:
            rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .student-register-point strong {
          display: block;
          font-size: 14px;
        }

        .student-register-point p {
          margin: 5px 0 0;
          color: #dbeafe;
          font-size: 13px;
          line-height: 1.5;
        }

        /* ================= RIGHT ================= */

        .student-register-right {
          min-width: 0;
          background: #ffffff;
          padding: 45px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .student-register-form-wrapper {
          width: 100%;
          max-width: 440px;
          min-width: 0;
          margin: 0 auto;
        }

        .student-register-heading {
          margin-bottom: 25px;
        }

        .student-register-label {
          margin: 0 0 8px;
          color: #2563a8;
          font-weight: 700;
          letter-spacing: 0.5px;
          font-size: 13px;
        }

        .student-register-heading h2 {
          margin: 0 0 10px;
          color: #172033;
          font-size: 31px;
          line-height: 1.15;
          overflow-wrap: anywhere;
        }

        .student-register-heading > p:last-child {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }

        /* ================= FORM ================= */

        .student-register-field {
          width: 100%;
          margin-bottom: 16px;
        }

        .student-register-field label {
          display: block;
          margin-bottom: 7px;
          color: #374151;
          font-weight: 600;
          font-size: 14px;
        }

        .student-register-field input {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 13px 15px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          background: #ffffff;
        }

        .student-register-field input:focus {
          border-color: #2563a8;
          box-shadow:
            0 0 0 3px
            rgba(37,99,168,0.10);
        }

        .student-register-field small {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .student-register-error {
          width: 100%;
          margin-bottom: 17px;
          padding: 11px 14px;
          border-radius: 8px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .student-register-submit {
          display: block;
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: #2563a8;
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 5px 15px
            rgba(37,99,168,0.25);
        }

        .student-register-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        /* ================= LINKS ================= */

        .student-register-login {
          text-align: center;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .student-register-login p {
          margin: 0 0 9px;
          color: #6b7280;
          font-size: 14px;
        }

        .student-register-login a {
          color: #2563a8;
          font-weight: 700;
          text-decoration: none;
        }

        .student-register-back {
          text-align: center;
          margin-top: 18px;
        }

        .student-register-back a {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
        }

        /* ================= FOOTER ================= */

        .student-register-footer {
          width: 100%;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        /* ================= TABLET ================= */

        @media (max-width: 850px) {

          .student-register-navbar {
            padding: 0 5%;
          }

          .student-register-main {
            padding: 30px 16px;
          }

          .student-register-left {
            padding: 40px 30px;
          }

          .student-register-right {
            padding: 40px 30px;
          }

          .student-register-left h1 {
            font-size: 30px;
          }

          .student-register-heading h2 {
            font-size: 28px;
          }

        }

        /* ================= MOBILE ================= */

        @media (max-width: 650px) {

          .student-register-navbar {
            min-height: 64px;
            padding: 0 16px;
          }

          .student-register-brand {
            font-size: 17px;
          }

          .student-register-home {
            font-size: 13px;
          }

          .student-register-main {
            width: 100%;
            display: block;
            padding: 20px 12px 30px;
          }

          .student-register-card {
            width: 100%;
            max-width: 100%;
            display: block;
            border-radius: 16px;
            overflow: hidden;
          }

          .student-register-left {
            width: 100%;
            padding: 30px 24px;
            display: block;
          }

          .student-register-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .student-register-left h1 {
            font-size: 30px;
            line-height: 1.12;
            margin-bottom: 14px;
          }

          .student-register-description {
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 22px;
          }

          .student-register-points {
            gap: 14px;
          }

          .student-register-point {
            gap: 10px;
          }

          .student-register-point-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;
            font-size: 14px;
          }

          .student-register-point strong {
            font-size: 13px;
          }

          .student-register-point p {
            font-size: 12px;
          }

          .student-register-right {
            width: 100%;
            padding: 32px 24px;
            display: block;
          }

          .student-register-form-wrapper {
            width: 100%;
            max-width: 100%;
          }

          .student-register-heading {
            margin-bottom: 24px;
          }

          .student-register-label {
            font-size: 11px;
          }

          .student-register-heading h2 {
            font-size: 28px;
            line-height: 1.15;
          }

          .student-register-heading > p:last-child {
            font-size: 13px;
          }

          .student-register-field {
            margin-bottom: 17px;
          }

          .student-register-field input {
            width: 100%;
            padding: 13px;
            font-size: 14px;
          }

          .student-register-submit {
            width: 100%;
            padding: 13px;
            font-size: 15px;
          }

          .student-register-login {
            margin-top: 20px;
            padding-top: 18px;
          }

          .student-register-login p,
          .student-register-login a {
            font-size: 13px;
          }

          .student-register-back {
            margin-top: 18px;
          }

          .student-register-footer {
            padding: 16px 12px;
            font-size: 12px;
          }

        }

        /* ================= SMALL PHONE ================= */

        @media (max-width: 400px) {

          .student-register-navbar {
            padding: 0 12px;
          }

          .student-register-brand {
            font-size: 15px;
          }

          .student-register-home {
            font-size: 12px;
          }

          .student-register-main {
            padding: 14px 8px 24px;
          }

          .student-register-left {
            padding: 25px 18px;
          }

          .student-register-right {
            padding: 26px 18px;
          }

          .student-register-left h1 {
            font-size: 27px;
          }

          .student-register-heading h2 {
            font-size: 25px;
          }

        }

      `}</style>
    </div>
  );
}

export default StudentRegister;