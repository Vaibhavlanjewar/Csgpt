import React from "react";
import { Link } from "react-router-dom";
import { signOutUser } from "../firebase/firebase";
import SearchBar from "./SearchBar"; // ✅ Import SearchBar
import "../styles/Navbar.css";
// import Logo from "./_CsGpt.png"; ❌ Removed logo image import

const Navbar = ({ onLogout, onSearch }) => {
  const handleLogout = async () => {
    await signOutUser();
    onLogout();
  };

  return (
    <nav className="navbar">
      <h1 className="logo">
        <Link to="/" className="logo-link">
          <span className="text-logo">CsGpt</span> {/* ✅ Text-based logo */}
        </Link>
      </h1>

      <div className="nav-actions">
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/faqs" className="nav-link">FAQs</Link>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
