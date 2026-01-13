import React, { useState, useContext } from 'react';
import axios from 'axios';
import { generateBarcodePDF } from '../utils/pdfGenerator';
import { AuthContext } from '../context/AuthContext';

const InventoryForm = ({ category, subCategory, department, facultyProp }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        count: 1,
        // Specific fields
        code: '', // Chemical
        containerType: 'Bottle', // Chemical
        contentAmount: '', // Chemical

        compType: 'Monitor', // Computer
        locationRoom: ''
    });

    const [loading, setLoading] = useState(false);

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

        // Prepare Payload
        const payload = {
            count: parseInt(formData.count),
            category,
            subCategory: subCategory === 'Computer' ? formData.compType : subCategory, // Computer subcategory is specific? 
  
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
            alert(`Created ${res.data.length} items. Downloading PDF...`);
            generateBarcodePDF(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert('Error creating items');
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', marginTop: '20px' }}>
            <h3>Add Items: {subCategory}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Lab/Room Name:</label>
                    <input type="text" name="locationRoom" value={formData.locationRoom} onChange={onChange} required />
                </div>

                <div className="form-group">
                    <label>Count:</label>
                    <input type="number" name="count" value={formData.count} onChange={onChange} min="1" required />
                </div>

                {/* Conditional Fields */}
                {subCategory === 'Chemical' && (
                    <>
                        <div className="form-group">
                            <label>Chemical Name:</label>
                            <input type="text" name="name" value={formData.name} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Chemical Code:</label>
                            <input type="text" name="code" value={formData.code} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Container Type:</label>
                            <select name="containerType" value={formData.containerType} onChange={onChange}>
                                <option value="Bottle">Bottle</option>
                                <option value="Packet">Packet</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Content Amount (e.g. 500ml):</label>
                            <input type="text" name="contentAmount" value={formData.contentAmount} onChange={onChange} required />
                        </div>
                    </>
                )}

                {subCategory === 'Computer' && (
                    <div className="form-group">
                        {/* Handled by parent selector usually, but if we are here via route, expected to select type */}
                        <label>Component Type:</label>
                        <select name="compType" value={formData.compType} onChange={onChange}>
                            <option value="Monitor">Monitor</option>
                            <option value="CPU">CPU</option>
                            <option value="PowerUnit">Power Unit</option>
                            <option value="Keyboard">Keyboard</option>
                            <option value="Mouse">Mouse</option>
                        </select>
                    </div>
                )}

                {/* Generic Name for others */}
                {subCategory !== 'Chemical' && subCategory !== 'Computer' && (
                    <div className="form-group">
                        <label>Item Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={onChange} required />
                    </div>
                )}

                <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
                    {loading ? 'Processing...' : 'Submit & Generate Barcodes'}
                </button>
            </form>
        </div>
    );
};

export default InventoryForm;
