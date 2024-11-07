// src/pages/ShipmentDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ShipmentDetails = () => {
    const { trackingNumber } = useParams(); // Get tracking number from URL params
    const [shipment, setShipment] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShipmentDetails = async () => {
            try {
                const response = await axios.get(`/api/shipments/${trackingNumber}`);
                setShipment(response.data);
            } catch (err) {
                setError('Shipment not found or error fetching data');
            }
        };

        fetchShipmentDetails();
    }, [trackingNumber]);

    if (error) return <p>{error}</p>;

    return (
        <div className="shipment-details">
            <h2>Shipment Details for {trackingNumber}</h2>
            {shipment ? (
                <div>
                    <h3>Basic Information</h3>
                    <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
                    <p><strong>Status:</strong> {shipment.status}</p>
                    <p><strong>Sender:</strong> {shipment.sender}</p>
                    <p><strong>Receiver:</strong> {shipment.receiver}</p>
                    
                    <h3>Updates</h3>
                    <ul>
                        {shipment.updates.map((update, index) => (
                            <li key={index}>
                                <p><strong>Date:</strong> {update.date}</p>
                                <p><strong>Time:</strong> {update.time}</p>
                                <p><strong>Location:</strong> {update.location}</p>
                                <p><strong>Activity:</strong> {update.activity}</p>
                                <p><strong>Remarks:</strong> {update.remarks}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Loading shipment details...</p>
            )}
            <Link to="/">Go back to tracking</Link>
        </div>
    );
};

export default ShipmentDetails;
