import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import OwnerLogin from "./pages/OwnerLogin";
import OwnerRegister from "./pages/OwnerRegister";
import OwnerDashboard from "./pages/OwnerDashboard";

import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import StudentDashboard from "./pages/StudentDashboard";

import PGDetails from "./pages/PGDetails";

import "./App.css";


/* =====================================================
   HOME PAGE
   ===================================================== */

function Home() {
  return (
    <div className="home-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="home-navbar">

        <div className="home-container navbar-inner">

          <Link to="/" className="brand">
            <span className="brand-icon">🏠</span>
            <span>Smart PG Finder</span>
          </Link>

          <nav className="nav-links">

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#features">
              Features
            </a>

            <Link
              to="/student-login"
              className="nav-login"
            >
              Student Login
            </Link>

            <Link
              to="/owner-login"
              className="nav-owner"
            >
              Owner Login
            </Link>

          </nav>

        </div>

      </header>


      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="hero-section">

        <div className="home-container hero-grid">

          {/* HERO TEXT */}

          <div className="hero-content">

            <div className="hero-badge">
              📍 Find PGs near your college
            </div>

            <h1>
              Find Your Perfect
              <span>PG Easily</span>
            </h1>

            <p className="hero-description">
              Smart PG Finder helps college students discover
              nearby PG accommodations, compare prices and
              facilities, check distance, and connect directly
              with PG owners.
            </p>

            <div className="hero-buttons">

              <Link
                to="/student-login"
                className="primary-btn"
              >
                🔍 Find a PG
              </Link>

              <Link
                to="/owner-register"
                className="secondary-btn"
              >
                🏠 List Your PG
              </Link>

            </div>

            <div className="hero-points">

              <span>✓ Location Based</span>

              <span>✓ Price Filters</span>

              <span>✓ Direct Contact</span>

            </div>

          </div>


          {/* =========================
              HERO PG CARD
          ========================= */}

          <div className="hero-card-wrapper">

            <div className="hero-main-card">

              <div className="hero-card-top">

                <div>

                  <span className="small-label">
                    Popular PG
                  </span>

                  <h3>
                    Comfortable Student Stay
                  </h3>

                </div>

                <span className="verified-badge">
                  ✓ Verified
                </span>

              </div>


              {/* PROPERTY IMAGE AREA */}

              <div className="hero-property-image">
                <span className="hero-house-icon">
                  🏠
                </span>
              </div>


              {/* PROPERTY DETAILS */}

              <div className="hero-property-details">

                <p>
                  📍 Near your college
                </p>

                <p>
                  📶 Wi-Fi &nbsp; • &nbsp;
                  🍱 Food &nbsp; • &nbsp;
                  🛏️ Rooms
                </p>

                <div className="hero-price">

                  <strong>
                    ₹7,500
                  </strong>

                  <span>
                    / month
                  </span>

                </div>

              </div>

            </div>


            {/* FLOATING CARD 1 */}

            <div className="floating-card floating-card-one">

              📍 Nearby PG

              <strong>
                2.4 km
              </strong>

            </div>


            {/* FLOATING CARD 2 */}

            <div className="floating-card floating-card-two">

              ⭐ Easy Search

              <strong>
                Compare PGs
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          STATS
      ========================= */}

      <section className="stats-section">

        <div className="home-container stats-grid">

          <div className="stat-item">

            <strong>
              Easy
            </strong>

            <span>
              PG Search
            </span>

          </div>


          <div className="stat-item">

            <strong>
              GPS
            </strong>

            <span>
              Distance
            </span>

          </div>


          <div className="stat-item">

            <strong>
              Direct
            </strong>

            <span>
              Owner Contact
            </span>

          </div>


          <div className="stat-item">

            <strong>
              24/7
            </strong>

            <span>
              Access
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}

      <section
        id="how-it-works"
        className="section-block"
      >

        <div className="home-container">

          <div className="section-heading">

            <span className="section-label">
              SIMPLE PROCESS
            </span>

            <h2>
              How It Works
            </h2>

            <p>
              Find suitable accommodation in just three
              simple steps.
            </p>

          </div>


          <div className="steps-grid">

            {/* STEP 1 */}

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                🔍
              </div>

              <h3>
                Search
              </h3>

              <p>
                Search PG accommodations based on your
                college and preferred location.
              </p>

            </div>


            {/* STEP 2 */}

            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                ⚖️
              </div>

              <h3>
                Compare
              </h3>

              <p>
                Compare rent, rooms, distance and
                available facilities.
              </p>

            </div>


            {/* STEP 3 */}

            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                🤝
              </div>

              <h3>
                Connect
              </h3>

              <p>
                Contact the PG owner and request a
                visit directly.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          FEATURES
      ========================= */}

      <section
        id="features"
        className="features-section"
      >

        <div className="home-container">

          <div className="section-heading">

            <span className="section-label">
              SMART FEATURES
            </span>

            <h2>
              Everything You Need
            </h2>

            <p>
              Simple tools to make your PG search faster
              and easier.
            </p>

          </div>


          <div className="features-grid">

            {/* FEATURE 1 */}

            <div className="feature-card">

              <div className="feature-icon">
                📍
              </div>

              <h3>
                Location Search
              </h3>

              <p>
                Find PGs based on location and see
                the distance from your current location.
              </p>

            </div>


            {/* FEATURE 2 */}

            <div className="feature-card">

              <div className="feature-icon">
                💰
              </div>

              <h3>
                Price Comparison
              </h3>

              <p>
                Filter PGs according to your monthly
                budget and compare available options.
              </p>

            </div>


            {/* FEATURE 3 */}

            <div className="feature-card">

              <div className="feature-icon">
                🛏️
              </div>

              <h3>
                Room Options
              </h3>

              <p>
                Choose from single, double and
                triple sharing rooms.
              </p>

            </div>


            {/* FEATURE 4 */}

            <div className="feature-card">

              <div className="feature-icon">
                ⭐
              </div>

              <h3>
                Favorites
              </h3>

              <p>
                Save your favorite PGs and check
                them again later.
              </p>

            </div>


            {/* FEATURE 5 */}

            <div className="feature-card">

              <div className="feature-icon">
                📅
              </div>

              <h3>
                Visit Requests
              </h3>

              <p>
                Send a visit request directly to
                the PG owner.
              </p>

            </div>


            {/* FEATURE 6 */}

            <div className="feature-card">

              <div className="feature-icon">
                🔔
              </div>

              <h3>
                Notifications
              </h3>

              <p>
                Get updates when your booking or
                visit request is accepted or rejected.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          CTA
      ========================= */}

      <section className="cta-section">

        <div className="home-container cta-content">

          <div>

            <span className="section-label light-label">
              GET STARTED
            </span>

            <h2>
              Ready to Find Your PG?
            </h2>

            <p>
              Start searching for a comfortable and
              convenient place near your college.
            </p>

          </div>


          <Link
            to="/student-login"
            className="cta-button"
          >
            Start Searching →
          </Link>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="home-footer">

        <div className="home-container footer-content">

          <div>

            <div className="footer-brand">
              🏠 Smart PG Finder
            </div>

            <p>
              Making student accommodation search
              simple, smart and convenient.
            </p>

          </div>


          <div className="footer-links">

            <Link to="/student-login">
              Student Login
            </Link>

            <Link to="/student-register">
              Student Register
            </Link>

            <Link to="/owner-login">
              Owner Login
            </Link>

            <Link to="/owner-register">
              Owner Register
            </Link>

          </div>

        </div>


        <div className="footer-bottom">
          © 2026 Smart PG Finder. All rights reserved.
        </div>

      </footer>

    </div>
  );
}


/* =====================================================
   MAIN APP / ROUTES
   ===================================================== */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* STUDENT */}

        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        <Route
          path="/student-register"
          element={<StudentRegister />}
        />

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />


        {/* OWNER */}

        <Route
          path="/owner-login"
          element={<OwnerLogin />}
        />

        <Route
          path="/owner-register"
          element={<OwnerRegister />}
        />

        <Route
          path="/owner-dashboard"
          element={<OwnerDashboard />}
        />


        {/* PG DETAILS */}

        <Route
          path="/pg-details/:id"
          element={<PGDetails />}
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;