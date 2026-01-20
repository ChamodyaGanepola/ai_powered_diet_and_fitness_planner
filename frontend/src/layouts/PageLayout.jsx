import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import { useAlert } from "../context/alertContext";
import Alert from "../component/Alert";
const PageLayout = ({ children, hideNavLinks }) => {
  const { alert, closeAlert } = useAlert();
  return (
    <div className="page-layout">
      <Header disableLinks={hideNavLinks} />
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          autoClose={alert.autoClose}
          duration={alert.duration}
          onClose={closeAlert}
        />
      )}

      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
