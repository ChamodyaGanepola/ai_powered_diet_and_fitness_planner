import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      © {currentYear} HealthPilot. All Rights Reserved.
    </footer>
  );
};

export default Footer;
