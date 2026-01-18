import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InventoryForm from '../components/InventoryForm';
import axios from 'axios';
import '../styles/Dashboard.css';

// Home Component
const DashboardHome = () => (
  <div className="section-container">
    <h2 className="page-title">Welcome to Your Dashboard</h2>
    
    <div className="card-grid">
      <Link to="lecturer-hall" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-blue" style={{ animationDelay: '0.1s' }}>
          <div className="feature-card-icon">🎓</div>
          <h3 className="feature-card-title">Lecturer Hall</h3>
          <p className="feature-card-description">
            Manage desks, chairs, smart boards, and projectors
          </p>
          <div className="feature-card-arrow">
            <span>Explore</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      <Link to="lab" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-purple" style={{ animationDelay: '0.2s' }}>
          <div className="feature-card-icon">🔬</div>
          <h3 className="feature-card-title">Laboratory</h3>
          <p className="feature-card-description">
            Manage equipment, chemicals, and lab resources
          </p>
          <div className="feature-card-arrow">
            <span>Explore</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      <Link to="common" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-green" style={{ animationDelay: '0.3s' }}>
          <div className="feature-card-icon">📦</div>
          <h3 className="feature-card-title">Common Items</h3>
          <p className="feature-card-description">
            Manage general inventory and shared resources
          </p>
          <div className="feature-card-arrow">
            <span>Explore</span>
            <span>→</span>
          </div>
        </div>
      </Link>
    </div>

    <div className="view-all-container">
      <Link to="view-all" style={{ textDecoration: 'none' }}>
        <button className="view-all-btn">
          📊 View All Inventory
        </button>
      </Link>
    </div>
  </div>
);

// Laboratory Hub Component
const LabHub = () => (
  <div className="section-container">
    <h3 className="section-title">Select Laboratory Department</h3>
    
    <div className="dept-card-grid">
      {[
        { name: 'pst', label: 'PST', className: 'dept-card-red', icon: '⚗️' },
        { name: 'fst', label: 'FST', className: 'dept-card-yellow', icon: '🧪' },
        { name: 'nr', label: 'NR', className: 'dept-card-teal', icon: '🌿' },
        { name: 'sport', label: 'Sport', className: 'dept-card-orange', icon: '⚽' }
      ].map((dept, idx) => (
        <Link key={dept.name} to={dept.name} style={{ textDecoration: 'none' }}>
          <div 
            className={`dept-card ${dept.className}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="dept-card-icon">{dept.icon}</div>
            <div className="dept-card-label">{dept.label}</div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// Department Hub Component
const DeptHub = () => {
  const { dept } = useParams();
  const categories = [
    { name: 'Equipment', icon: '🔧' },
    { name: 'Chemical', icon: '🧪' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Computer', icon: '💻' },
    { name: 'Other', icon: '📌' }
  ];

  return (
    <div className="section-container">
      <h3 className="section-title">
        Department: <span className="section-title-highlight">{dept.toUpperCase()}</span>
      </h3>
      
      <div className="category-nav">
        {categories.map((cat, idx) => (
          <Link key={cat.name} to={cat.name} style={{ textDecoration: 'none' }}>
            <button
              className="category-btn category-btn-purple"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="category-btn-icon">{cat.icon}</span>
              {cat.name}
            </button>
          </Link>
        ))}
      </div>
      
      <div className="section-container">
        <Outlet />
      </div>
    </div>
  );
};

// Form Container Component
const FormContainer = () => {
  const { dept, category } = useParams();
  return (
    <div className="section-container">
      <InventoryForm category="Laboratory" subCategory={category} department={dept} />
    </div>
  );
};

// Lecturer Hall Hub Component
const LecturerHallHub = () => {
  const items = [
    { name: 'Desk', icon: '🪑' },
    { name: 'Chair', icon: '💺' },
    { name: 'SmartBoard', icon: '📺' },
    { name: 'Projector', icon: '📽️' }
  ];

  return (
    <div className="section-container">
      <h3 className="section-title">Lecturer Hall Items</h3>
      
      <div className="category-nav">
        {items.map((item, idx) => (
          <Link key={item.name} to={item.name} style={{ textDecoration: 'none' }}>
            <button
              className="category-btn category-btn-blue"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="category-btn-icon">{item.icon}</span>
              {item.name}
            </button>
          </Link>
        ))}
      </div>
      
      <div className="section-container">
        <Outlet />
      </div>
    </div>
  );
};

// Common Hub Component
const CommonHub = () => (
  <div className="section-container">
    <h3 className="section-title">Common Items</h3>
    <InventoryForm category="Common" subCategory="General" />
  </div>
);

// Lecturer Form Container Component
const LecturerFormContainer = () => {
  const { type } = useParams();
  return (
    <div className="section-container">
      <InventoryForm category="LecturerHall" subCategory={type} />
    </div>
  );
};

// View Inventory Component
const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/inventory');
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="section-container">
      <h3 className="section-title">📋 Complete Inventory List</h3>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="inventory-table-container">
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Serial ID</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr 
                    key={item._id}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td>{item.serialNumber}</td>
                    <td>{item.category}</td>
                    <td>{item.subCategory}</td>
                    <td>
                      {item.location.faculty} - {item.location.room}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        item.status === 'Active' 
                          ? 'status-badge-active' 
                          : 'status-badge-inactive'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);
  
  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">
            <span className="dashboard-title-icon">🎯</span>
            CIMS Dashboard
            {user?.role && (
              <span className="user-role-badge">{user.role}</span>
            )}
          </h1>
          
          <button onClick={logout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="lab" element={<LabHub />} />
          <Route path="lab/:dept" element={<DeptHub />}>
            <Route path=":category" element={<FormContainer />} />
          </Route>
          <Route path="lecturer-hall" element={<LecturerHallHub />}>
            <Route path=":type" element={<LecturerFormContainer />} />
          </Route>
          <Route path="common" element={<CommonHub />} />
          <Route path="view-all" element={<ViewInventory />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;