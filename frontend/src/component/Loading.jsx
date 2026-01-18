import React from "react";
import "./Loading.css";

export default function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-wrap">
      <div className="loading-spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}
