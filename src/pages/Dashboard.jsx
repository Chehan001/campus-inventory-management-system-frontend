import React, { useContext } from 'react';
import { Routes, Route, Link, useParams, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InventoryForm from '../components/InventoryForm';
import ViewInventory from '../pages/ViewInventory';
import '../styles/Dashboard.css';

// Home Component 
const DashboardHome = () => (
  <div className="section-container">
    <h2 className="page-title">Welcome to Campus Inventory Management System Dashboard</h2>
    
    <div className="card-grid">
      <Link to="lecturer-hall" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-blue" style={{ animationDelay: '0.1s' }}>
          <h3 className="feature-card-title" data-text="Lecturer Hall">Lecturer Hall</h3>
          <p className="feature-card-description">
            Manage desks, chairs, smart boards, and projectors for educational spaces
          </p>
          <div className="feature-card-arrow">
            <span>Explore</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      <Link to="lab" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-purple" style={{ animationDelay: '0.2s' }}>
          <h3 className="feature-card-title" data-text="Laboratory">Laboratory</h3>
          <p className="feature-card-description">
            Manage equipment, chemicals, and lab resources across departments
          </p>
          <div className="feature-card-arrow">
            <span>Explore</span>
            <span>→</span>
          </div>
        </div>
      </Link>

      <Link to="common" style={{ textDecoration: 'none' }}>
        <div className="feature-card feature-card-green" style={{ animationDelay: '0.3s' }}>
          <h3 className="feature-card-title" data-text="Common Items">Common Items</h3>
          <p className="feature-card-description">
            Manage general inventory and shared resources organization-wide
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
          View All Inventory
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
        { name: 'pst', label: 'PST' },
        { name: 'fst', label: 'FST' },
        { name: 'nr', label: 'NR' },
        { name: 'sport', label: 'Sport' }
      ].map((dept, idx) => (
        <Link key={dept.name} to={dept.name} style={{ textDecoration: 'none' }}>
          <div 
            className="dept-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
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
    { name: 'Equipment' },
    { name: 'Chemical' },
    { name: 'Furniture' },
    { name: 'Computer' },
    { name: 'Other' }
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
    { name: 'Desk' },
    { name: 'Chair' },
    { name: 'SmartBoard' },
    { name: 'Projector' }
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

// Main Dashboard Component
const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="dashboard-header-content">     
          <h1 className="dashboard-title">
            CIMS Dashboard
          </h1>
          
          <button onClick={logout} className="logout-btn">
            Logout
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