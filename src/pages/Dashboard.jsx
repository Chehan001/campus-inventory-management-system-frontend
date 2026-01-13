import React, { useContext } from 'react';
import { Routes, Route, Link, useParams, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InventoryForm from '../components/InventoryForm';
import axios from 'axios';

// Sub Components
const DashboardHome = () => (
    <div className="dash-section">
        <h2>Dashboard</h2>
        <div className="grid-buttons">
            <Link to="lecturer-hall" className="btn-lg">Lecturer Hall Item</Link>
            <Link to="lab" className="btn-lg">Laboratory Item</Link>
            <Link to="common" className="btn-lg">Common Item</Link>
        </div>
        <div style={{ marginTop: '20px' }}>
            <Link to="view-all" className="btn-secondary">View All Inventory</Link>
        </div>
    </div>
);

const LabHub = () => (
    <div className="dash-section">
        <h3>Select Laboratory Department</h3>
        <div className="grid-buttons">
            <Link to="pst" className="btn-md">PST</Link>
            <Link to="fst" className="btn-md">FST</Link>
            <Link to="nr" className="btn-md">NR</Link>
            <Link to="sport" className="btn-md">Sport</Link>
        </div>
    </div>
);

const DeptHub = () => {
    const { dept } = useParams();
    return (
        <div className="dash-section">
            <h3>Department: {dept.toUpperCase()}</h3>
            <div className="nav-bar-items">
                <Link to="Equipment">Equipment</Link>
                <Link to="Chemical">Chemical</Link>
                <Link to="Furniture">Furniture</Link>
                <Link to="Computer">Computers</Link>
                <Link to="Other">Other Component</Link>
            </div>
            <Outlet />
        </div>
    );
};

const FormContainer = () => {
    const { dept, category } = useParams();
    return <InventoryForm category="Laboratory" subCategory={category} department={dept} />;
};

const LecturerHallHub = () => (
    <div className="dash-section">
        <h3>Lecturer Hall Items</h3>
        <div className="nav-bar-items">
            <Link to="Desk">Desk</Link>
            <Link to="Chair">Chair</Link>
            <Link to="SmartBoard">Smart Board</Link>
            <Link to="Projector">Projectors</Link>
        </div>
        <Outlet />
    </div>
);

const CommonHub = () => (
    <div className="dash-section">
        <h3>Common Items</h3>
        <InventoryForm category="Common" subCategory="General" />
    </div>
);

const LecturerFormContainer = () => {
    const { type } = useParams();
    return <InventoryForm category="LecturerHall" subCategory={type} />; // type = Desk, Chair...
};

const ViewInventory = () => {
    const [items, setItems] = React.useState([]);
    const { user } = useContext(AuthContext);

    React.useEffect(() => {
        const fetchItems = async () => {
            const res = await axios.get('/api/inventory');
            setItems(res.data);
        };
        fetchItems();
    }, []);

    return (
        <div className="dash-section">
            <h3>Inventory List</h3>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Sub</th>
                        <th>Location</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item._id}>
                            <td>{item.serialNumber}</td>
                            <td>{item.category}</td>
                            <td>{item.subCategory}</td>
                            <td>{item.location.faculty} - {item.location.room}</td>
                            <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Dashboard = () => {
    const { logout, user } = useContext(AuthContext);
    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <h1>CIMS Dashboard ({user?.role})</h1>
                <button onClick={logout}>Logout</button>
            </header>
            <div className="dash-content">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />

                    {/* Laboratory Routes */}
                    <Route path="lab" element={<LabHub />} />
                    <Route path="lab/:dept" element={<DeptHub />}>
                        <Route path=":category" element={<FormContainer />} />
                    </Route>

                    {/* Lecturer Hall Routes */}
                    <Route path="lecturer-hall" element={<LecturerHallHub />}>
                        <Route path=":type" element={<LecturerFormContainer />} />
                    </Route>

                    {/* Common Route */}
                    <Route path="common" element={<CommonHub />} />

                    {/* View Route */}
                    <Route path="view-all" element={<ViewInventory />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
