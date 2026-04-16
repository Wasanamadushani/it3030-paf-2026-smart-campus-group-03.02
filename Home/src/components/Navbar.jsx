import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const AUTH_STORAGE_KEY = "sch.currentUser";

const menuItems = [
  { label: "Home", to: "/" },
  { label: "Resources" }, // remove "to"
  { label: "Bookings", href: "#" },
  { label: "Tickets", href: "#" },
  { label: "Notifications", href: "#" },
];

export default function Navbar({ userName = "Alex Silva", role = "USER" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const displayName = currentUser?.fullName || userName;
  const displayRole = currentUser?.role || role;
  const avatar = (displayName || "MY")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
  const oauthBaseUrl = import.meta.env.VITE_OAUTH_BASE_URL || "http://localhost:5000";
  const passwordChecks = [
    {
      id: "length",
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      id: "upper",
      label: "One uppercase letter",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: "One number",
      passed: /\d/.test(password),
    },
    {
      id: "special",
      label: "One special character",
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];
  const passedPasswordChecks = passwordChecks.filter((item) => item.passed).length;
  const passwordStrengthLabel =
    passedPasswordChecks <= 1 ? "Weak" : passedPasswordChecks <= 3 ? "Medium" : "Strong";

  function persistCurrentUser(user) {
    setCurrentUser(user);

    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      // Ignore storage errors and keep in-memory auth state.
    }
  }

  function clearFieldError(fieldName) {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) {
        return prev;
      }

      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }

  function validateRegisterForm() {
    const nextErrors = {};

    if (fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (passwordChecks.some((item) => !item.passed)) {
      nextErrors.password = "Password does not meet all requirements";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      nextErrors.agreeTerms = "You need to accept the terms and privacy policy";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed");
        return;
      }

      persistCurrentUser(data);
      setIsLoginOpen(false);
      setEmail("");
      setPassword("");
      setIsProfileOpen(false);
      goToCustomerDashboard();
    } catch (error) {
      setErrorMessage("Unable to reach backend server");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (!validateRegisterForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Registration failed");
        return;
      }

      persistCurrentUser(data);
      setSuccessMessage("Registration successful");
      setIsLoginOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeTerms(false);
      setFieldErrors({});
      setIsProfileOpen(false);
      setAuthMode("login");
      goToCustomerDashboard();
    } catch (error) {
      setErrorMessage("Unable to reach backend server");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openAuthModal(mode) {
    setAuthMode(mode);
    setIsLoginOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    if (mode === "login") {
      setConfirmPassword("");
      setAgreeTerms(false);
    }
  }

  function handleSignOut() {
    persistCurrentUser(null);
    setIsProfileOpen(false);
  }

  function goToCustomerDashboard() {
    const dashboard = document.getElementById("customer-dashboard");
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsProfileOpen(false);
  }

  function handleGoogleLogin() {
    window.location.href = `${oauthBaseUrl}/auth/google`;
  }

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // Ignore parsing/storage errors and continue without persisted auth.
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");

    if (authStatus !== "success") {
      return;
    }

    const fullNameFromGoogle = params.get("fullName") || "Customer";
    const emailFromGoogle = params.get("email") || "";
    const roleFromGoogle = params.get("role") || "CUSTOMER";
    const profilePicFromGoogle = params.get("profilePic") || "";

    const googleUser = {
      fullName: fullNameFromGoogle,
      email: emailFromGoogle,
      role: roleFromGoogle,
      profilePic: profilePicFromGoogle,
    };

    persistCurrentUser(googleUser);
    setIsLoginOpen(false);
    setIsProfileOpen(false);
    setErrorMessage("");
    setSuccessMessage("Google login successful");

    window.history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
      goToCustomerDashboard();
    }, 0);
  }, []);

  return (
    <header className="top-nav">
      <div className="brand-wrap">
        <div className="brand-logo">SC</div>
        <div>
          <p className="brand-title">Smart Campus Hub</p>
          <p className="brand-subtitle">Operations Hub</p>
        </div>
      </div>

      <button
        className="mobile-toggle"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        {menuItems.map((item) => {
          if (item.label === "Resources" && !currentUser) {
            return (
              <button
                key={item.label}
                type="button"
                className="nav-link nav-link-lock"
                onClick={() => {
                  setIsMenuOpen(false);
                  openAuthModal("login");
                  setErrorMessage("Please login to access Facilities.");
                }}
              >
                {item.label}
              </button>
            );
          }



          if (item.label === "Resources") {
            const targetPath =
              currentUser?.role === "ADMIN" ? "/admin/facilities" : "/facilities";

            return (
              <NavLink
                key={item.label}
                to={targetPath}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            );
          }





          if (item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            );
          }

          return (
            <a key={item.label} href={item.href} className="nav-link">
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="profile-wrap">
        {currentUser ? (
          <>
            <button
              className="profile-btn"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="User profile"
            >
              <span className="profile-avatar">{avatar}</span>
              <span className="profile-meta">
                <strong>{displayName}</strong>
                <small>{displayRole}</small>
              </span>
              <span className="chevron">v</span>
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown" role="menu">
                <a
                  href="#customer-dashboard"
                  onClick={(event) => {
                    event.preventDefault();
                    goToCustomerDashboard();
                  }}
                >
                  Customer Dashboard
                </a>
                <a href="#">Settings</a>
                <button type="button" className="dropdown-action" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            className="auth-btn"
            onClick={() => {
              openAuthModal("login");
            }}
          >
            My Account Login
          </button>
        )}
      </div>

      {isLoginOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="login-modal">
            <div className="modal-head">
              <h3>{authMode === "login" ? "Login to My Account" : "Create My Account"}</h3>
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsLoginOpen(false)}
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => openAuthModal("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => openAuthModal("register")}
              >
                Register
              </button>
            </div>

            <form
              className="login-form"
              onSubmit={authMode === "login" ? handleLogin : handleRegister}
            >
              {authMode === "register" && (
                <>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      clearFieldError("fullName");
                    }}
                    placeholder="Your full name"
                    required
                  />
                  {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
                </>
              )}

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                placeholder="you@example.com"
                required
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                  clearFieldError("confirmPassword");
                }}
                placeholder="Enter your password"
                required
              />

              {authMode === "register" && (
                <>
                  <div className="password-strength-head">
                    <span>Password strength</span>
                    <strong>{passwordStrengthLabel}</strong>
                  </div>
                  <div className="password-meter" aria-hidden="true">
                    <span style={{ width: `${(passedPasswordChecks / passwordChecks.length) * 100}%` }} />
                  </div>
                  <ul className="password-rules">
                    {passwordChecks.map((rule) => (
                      <li key={rule.id} className={rule.passed ? "passed" : ""}>
                        {rule.label}
                      </li>
                    ))}
                  </ul>

                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    placeholder="Re-enter your password"
                    required
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="field-error">{fieldErrors.confirmPassword}</p>
                  )}

                  <label className="terms-check">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(event) => {
                        setAgreeTerms(event.target.checked);
                        clearFieldError("agreeTerms");
                      }}
                    />
                    <span>I agree to the Terms and Privacy Policy</span>
                  </label>
                  {fieldErrors.agreeTerms && <p className="field-error">{fieldErrors.agreeTerms}</p>}
                </>
              )}

              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

              {successMessage && <p className="login-success">{successMessage}</p>}
              {errorMessage && <p className="login-error">{errorMessage}</p>}

              <button className="btn btn-primary auth-primary-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? authMode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>

              {authMode === "login" && (
                <>
                  <div className="oauth-divider" aria-hidden="true">
                    <span>or</span>
                  </div>
                  <button className="btn btn-google auth-google-btn" type="button" onClick={handleGoogleLogin}>
                    <span className="google-mark" aria-hidden="true">
                      <svg className="google-mark-svg" viewBox="0 0 18 18" role="img" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7968 2.715v2.2582h2.9086c1.7023-1.5668 2.6846-3.8741 2.6846-6.6141z"
                        />
                        <path
                          fill="#34A853"
                          d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0478.8591-2.3441 0-4.3282-1.5827-5.0364-3.7091H.9573v2.3327C2.4382 15.9832 5.4818 18 9 18z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.9636 10.7091c-.18-.54-.2836-1.1168-.2836-1.7091s.1036-1.1691.2836-1.7091V4.9582H.9573C.3477 6.1732 0 7.5482 0 9s.3477 2.8268.9573 4.0418l3.0063-2.3327z"
                        />
                        <path
                          fill="#EA4335"
                          d="M9 3.5809c1.3214 0 2.5078.4541 3.4405 1.345L15.0218 2.344C13.4636.8923 11.4264 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582l3.0063 2.3327C4.6718 5.1636 6.6559 3.5809 9 3.5809z"
                        />
                      </svg>
                    </span>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              <button
                className="btn btn-ghost auth-switch-btn"
                type="button"
                onClick={() => openAuthModal(authMode === "login" ? "register" : "login")}
              >
                {authMode === "login" ? "Need an account? Register" : "Already have an account? Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
