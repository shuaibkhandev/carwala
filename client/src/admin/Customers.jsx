import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";


export default function Customers() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Status updated successfully.");
        fetchBookings(); // refresh
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const generatePDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("RepairHub - Service Booking Summary", 105, 20, null, null, "center");
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    doc.setFontSize(14);
    doc.text("Customer Booking Details", 20, 35);
    doc.setFontSize(12);

    let y = 45;
    const lines = [
      [`Name`, booking.name],
      [`Email`, booking.email],
      [`Phone`, booking.phone || "N/A"],
      [`Service Name`, booking.serviceName],
      [`Service Price`, `Rs. ${booking.servicePrice}`],
      [`Address`, `${booking.address?.line1 || ""}, ${booking.address?.line2 || ""}, ${booking.address?.city || ""}, ${booking.address?.postal_code || ""}`],
      [`Status`, booking.status],
    ];

    lines.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, y);
      doc.text(String(value), 70, y);
      y += 10;
    });

    doc.save(`${booking.name.replace(/\s+/g, "_")}_Service_Booking.pdf`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Add Header and Sidebar components here */}
      <div className="main">
        <div className="report-container">
          <div className="report-header">
            <h1 className="recent-requests">Total Repairing Requests</h1>
          </div>
          <div className="report-body">
            <table className="repair-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Service Name</th>
                  <th>Service Price</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.name}</td>
                    <td>{booking.email || "N/A"}</td>
                    <td>{booking.serviceName || "N/A"}</td>
                    <td>{booking.servicePrice ? `Rs. ${booking.servicePrice}` : "N/A"}</td>
                    <td>
                      {[booking.address?.line1, booking.address?.line2, booking.address?.city, booking.address?.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="success">Success</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => generatePDF(booking)}>Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
