import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/ViewInventory.css';

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user, isAuthenticated, isSuperAdmin } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchItems();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Fetching inventory items...');
      
      const response = await axios.get('/api/inventory');
      
      console.log(' Fetched', response.data.length, 'items');
      setItems(response.data);
    } catch (error) {
      console.error(' Error fetching inventory:', error);
      
      let errorMessage = 'Failed to load inventory. Please try again later.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view inventory.';
        } else if (error.response.data?.msg) {
          errorMessage = error.response.data.msg;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.serialNumber.toLowerCase().includes(searchLower) ||
        item.subCategory.toLowerCase().includes(searchLower) ||
        item.location.faculty.toLowerCase().includes(searchLower) ||
        item.location.room.toLowerCase().includes(searchLower) ||
        (item.department && item.department.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'serialNumber':
          aVal = a.serialNumber;
          bVal = b.serialNumber;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredItems(filtered);
  };

  const handleDelete = async (id, serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete item ${serialNumber}?`)) {
      return;
    }

    try {
      console.log(' Deleting item:', id);
      
      await axios.delete(`/api/inventory/${id}`);
      
      setItems(items.filter(item => item._id !== id));
      console.log(' Item deleted successfully');
      
      // Optional: Show success message
      alert('Item deleted successfully');
    } catch (error) {
      console.error(' Error deleting item:', error);
      
      let errorMessage = 'Failed to delete item.';
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      alert(errorMessage);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(' Updating status for item:', id, 'to', newStatus);
      
      await axios.patch(`/api/inventory/${id}`, { status: newStatus });
      
      setItems(items.map(item =>
        item._id === id ? { ...item, status: newStatus } : item
      ));
      
      console.log(' Status updated successfully');
    } catch (error) {
      console.error(' Error updating status:', error);
      
      let errorMessage = 'Failed to update status.';
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      alert(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['Serial ID', 'Category', 'Sub Category', 'Department', 'Location', 'Status', 'Count', 'Created At'];
    const csvData = filteredItems.map(item => [
      item.serialNumber,
      item.category,
      item.subCategory,
      item.department || 'N/A',
      `${item.location.faculty} - ${item.location.room}`,
      item.status,
      item.count || 1,
      formatDate(item.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(' Exported', filteredItems.length, 'items to CSV');
  };

  if (loading) {
    return (
      <div className="view-inventory-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-inventory-container">
        <div className="error-container">
          <div className="error-icon"></div>
          <h3 className="error-title">Error Loading Inventory</h3>
          <p className="error-message">{error}</p>
          <button onClick={fetchItems} className="retry-btn">
             Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-inventory-container">
      <div className="inventory-header">
        <h2 className="inventory-title"> Complete Inventory List</h2>
        <div className="inventory-stats">
          <div className="stat-card">
            <span className="stat-value">{filteredItems.length}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-card stat-card-active">
            <span className="stat-value">
              {filteredItems.filter(i => i.status === 'Active').length}
            </span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card stat-card-broken">
            <span className="stat-value">
              {filteredItems.filter(i => i.status === 'Broken').length}
            </span>
            <span className="stat-label">Broken</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by serial, location, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="LecturerHall">Lecturer Hall</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Common">Common</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Broken">Broken</option>
            <option value="Disposed">Disposed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="serialNumber">Sort by Serial</option>
            <option value="category">Sort by Category</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <button onClick={exportToCSV} className="export-btn">
            📥 Export CSV
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3 className="empty-title">No Items Found</h3>
          <p className="empty-message">
            {searchTerm || filterCategory !== 'All' || filterStatus !== 'All'
              ? 'Try adjusting your filters'
              : 'Start by adding items to your inventory'}
          </p>
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
                  <th>Department</th>
                  <th>Location</th>
                  <th>Count</th>
                  <th>Status</th>
                  <th>Created</th>
                  {isSuperAdmin() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item._id}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="serial-cell">{item.serialNumber}</td>
                    <td>{item.category}</td>
                    <td>{item.subCategory}</td>
                    <td>{item.department || 'N/A'}</td>
                    <td>
                      <div className="location-cell">
                        <span className="faculty-badge">{item.location.faculty}</span>
                        <span className="room-text">{item.location.room}</span>
                      </div>
                    </td>
                    <td className="count-cell">{item.count || 1}</td>
                    <td>
                      {isSuperAdmin() ? (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`status-select status-${item.status.toLowerCase()}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Broken">Broken</option>
                          <option value="Disposed">Disposed</option>
                        </select>
                      ) : (
                        <span className={`status-badge status-badge-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="date-cell">{formatDate(item.createdAt)}</td>
                    {isSuperAdmin() && (
                      <td>
                        <button
                          onClick={() => handleDelete(item._id, item.serialNumber)}
                          className="delete-btn"
                          title="Delete item"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
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

export default ViewInventory;