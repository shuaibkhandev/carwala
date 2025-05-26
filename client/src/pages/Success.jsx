import React, { useEffect } from 'react';

const Success = () => {
  useEffect(() => {
    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-light d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4 text-center" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <h1 className="card-title text-success mb-3">🔧 Thank You for Choosing Repair-Hub!</h1>
          <p className="card-text mb-3">
            Your repair request has been received successfully. Our expert technicians will review your order and contact you shortly with updates.
          </p>
          <p className="card-text">
            Have questions? Email us anytime at{" "}
            <a href="mailto:Repairhub46@gmail.com" className="text-decoration-none fw-semibold">
              Repairhub46@gmail.com
            </a>.
          </p>
          <p className="text-muted mt-3 small">
            You’ll be redirected to the homepage shortly...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
