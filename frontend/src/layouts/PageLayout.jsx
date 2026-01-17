import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";

const PageLayout = ({ children, hideNavLinks }) => {
  return (
    <div className="page-layout">
      <Header disableLinks={hideNavLinks} />
      <main className="page-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;


