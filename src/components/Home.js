import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <h1 className="title">Welcome to Chat App</h1>
      <p className="subtitle">Connect with your friends and colleagues with ease.</p>
      <div className="button-container">
        <Link to="/login" className="styled-link">Login</Link>
        <Link to="/register" className="styled-link">Register</Link>
      </div>
    </div>
  );
}

export default Home;
