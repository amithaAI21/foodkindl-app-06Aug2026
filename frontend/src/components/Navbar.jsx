import {
  Menu,
  Sparkles,
  X,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    close();
  }

  return (
    <header className="navbar">

      {/* FoodKindl Logo */}
      <Link
        to="/"
        className="brand brand-logo"
        onClick={close}
        aria-label="FoodKindl Home"
      >
        <img
          src="/images/icon.png"
          alt="FoodKindl"
          className="navbar-logo"
        />
      </Link>

      {/* Mobile menu */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        {open ? (
          <X size={24} />
        ) : (
          <Menu size={24} />
        )}
      </button>

      {/* Navigation */}
      <nav
        className={
          open
            ? "nav open"
            : "nav"
        }
      >
        {!user && (
          <a
            href="/#connect"
            onClick={close}
          >
            Connect
          </a>
        )}

        {user ? (
          <>
            <Link
              to="/ai-kitchen"
              onClick={close}
              className="ai-kitchen-nav-link"
            >
              <Sparkles size={17} />
              AI Kitchen
            </Link>

            <Link
              to="/dashboard"
              onClick={close}
            >
              Dashboard
            </Link>

            <button
              type="button"
              className="nav-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            className="launch-button"
            to="/login"
            onClick={close}
          >
            Launch App
          </Link>
        )}
      </nav>

    </header>
  );
}