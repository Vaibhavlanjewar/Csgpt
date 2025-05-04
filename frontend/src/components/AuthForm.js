import React, { useState } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "../firebase/firebase";
import "../styles/AuthForm.css";

const AuthForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmail(email, password); // ✅ login
      } else {
        await signUpWithEmail(email, password); // ✅ signup
      }
      onLogin(); // ✅ notify parent on success
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onLogin();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <form onSubmit={handleEmailPasswordAuth} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn" onClick={handleGoogleSignIn}>
          <img
            src="https://img.icons8.com/?size=100&id=26218&format=png&color=000000"
            alt="Google logo"
            className="google-icon"
          />
          Continue with Google
        </button>

        <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New here? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
