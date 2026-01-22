import React, { useState, useContext } from 'react';
import axios from 'axios';
import { generateBarcodePDF } from '../utils/pdfGenerator';
import { AuthContext } from '../context/AuthContext';
import '../styles/InventoryForm.css';

const InventoryForm = ({ category, subCategory, department, facultyProp }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        count: 1,
        code: '',
        containerType: 'Bottle',
        contentAmount: '',
        compType: 'Monitor',
        locationRoom: ''
    });

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const typeDetails = {};
        if (subCategory === 'Chemical') {
            typeDetails.name = formData.name;
            typeDetails.code = formData.code;
            typeDetails.containerType = formData.containerType;
            typeDetails.contentAmount = formData.contentAmount;
        } else if (subCategory === 'Computer') {
            typeDetails.type = formData.compType;
        } else {
            typeDetails.name = formData.name;
        }

        const payload = {
            count: parseInt(formData.count),
            category,
            subCategory: subCategory === 'Computer' ? formData.compType : subCategory,
            faculty: user.faculty || facultyProp || 'General',
            room: formData.locationRoom,
            department: department,
            typeDetails
        };

        let finalSub = subCategory;
        if (subCategory === 'Computer') finalSub = formData.compType;
        payload.subCategory = finalSub;

        try {
            const res = await axios.post('/api/inventory/batch', payload);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            generateBarcodePDF(res.data);
            setLoading(false);
            // Reset form
            setFormData({
                name: '',
                count: 1,
                code: '',
                containerType: 'Bottle',
                contentAmount: '',
                compType: 'Monitor',
                locationRoom: ''
            });
        } catch (err) {
            console.error(err);
            alert('Error creating items');
            setLoading(false);
        }
    };

    return (
        <div className="inventory-form-container">
            {showSuccess && (
                <div className="success-banner">
                    <span className="icon-check"></span>
                    <span>Items created successfully!</span>
                </div>
            )}

            <div className="form-card">
                <div className="form-header">
                    <div className="form-icon">
                        <span className={
                            subCategory === 'Chemical' ? 'icon-beaker' :
                            subCategory === 'Computer' ? 'icon-monitor' :
                            'icon-package'
                        }></span>
                    </div>
                    <div>
                        <h3 className="form-title">Add New Items</h3>
                        <p className="form-subtitle">{subCategory}</p>
                    </div>
                </div>

                <div className="form-body">
                    <form onSubmit={onSubmit}>
                        <div className="form-field">
                            <label className="form-label">
                                <span className="label-icon icon-location"></span>
                                Lab/Room Name
                            </label>
                            <input 
                                type="text" 
                                name="locationRoom" 
                                value={formData.locationRoom} 
                                onChange={onChange} 
                                required
                                className="form-input"
                                placeholder="Enter lab or room name"
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">
                                <span className="label-icon icon-hash"></span>
                                Quantity
                            </label>
                            <input 
                                type="number" 
                                name="count" 
                                value={formData.count} 
                                onChange={onChange} 
                                min="1" 
                                required
                                className="form-input"
                            />
                        </div>

                        {subCategory === 'Chemical' && (
                            <>
                                <div className="form-field">
                                    <label className="form-label">Chemical Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={onChange} 
                                        required
                                        className="form-input"
                                        placeholder="e.g., Sodium Chloride"
                                    />
                                </div>
                                <div className="form-field grid-2">
                                    <div>
                                        <label className="form-label">Chemical Code</label>
                                        <input 
                                            type="text" 
                                            name="code" 
                                            value={formData.code} 
                                            onChange={onChange} 
                                            required
                                            className="form-input"
                                            placeholder="e.g., NaCl"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Container Type</label>
                                        <select 
                                            name="containerType" 
                                            value={formData.containerType} 
                                            onChange={onChange}
                                            className="form-select"
                                        >
                                            <option value="Bottle">Bottle</option>
                                            <option value="Packet">Packet</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Content Amount</label>
                                    <input 
                                        type="text" 
                                        name="contentAmount" 
                                        value={formData.contentAmount} 
                                        onChange={onChange} 
                                        required
                                        className="form-input"
                                        placeholder="e.g., 500ml"
                                    />
                                </div>
                            </>
                        )}

                        {subCategory === 'Computer' && (
                            <div className="form-field">
                                <label className="form-label">Component Type</label>
                                <select 
                                    name="compType" 
                                    value={formData.compType} 
                                    onChange={onChange}
                                    className="form-select"
                                >
                                    <option value="Monitor">Monitor</option>
                                    <option value="CPU">CPU</option>
                                    <option value="PowerUnit">Power Unit</option>
                                    <option value="Keyboard">Keyboard</option>
                                    <option value="Mouse">Mouse</option>
                                </select>
                            </div>
                        )}

                        {subCategory !== 'Chemical' && subCategory !== 'Computer' && (
                            <div className="form-field">
                                <label className="form-label">Item Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={onChange} 
                                    required
                                    className="form-input"
                                    placeholder="Enter item name"
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="submit-btn"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span></span>
                                    Submit & Generate Barcodes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InventoryForm;