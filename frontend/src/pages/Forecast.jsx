import { useState, useEffect } from "react";
import axios from "axios";
import FeatureModal from "../components/FeatureModal";

export const Forecast = () => {
    const [feature, setFeature] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false); // Tracks if we're adding a new feature

    useEffect(() => {
        const fetchFeature = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/features/`, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setFeature(response.data.data);
                } else {
                    setFeature(null); // No feature exists
                }
            } catch (err) {
                console.error("Error fetching feature:", err.response?.data);
                setError("Error fetching feature:", err.response?.data)
                setFeature(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFeature();
    }, []);

    return (
        <div>
            <h2>Forecast</h2>

            {loading && <p>Loading features...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && (
                feature ? (
                    <button onClick={() => { setIsModalOpen(true); setIsAdding(false); }} className="view-features-btn">
                        View Features
                    </button>
                ) : (
                    <button onClick={() => { setIsModalOpen(true); setIsAdding(true); }} className="add-features-btn">
                        Add Feature
                    </button>
                )
            )}

            {/* Feature Modal (Editing or Adding) */}
            {isModalOpen && (
                <FeatureModal 
                    isOpen={isModalOpen} 
                    onClose={(updatedFeature) => { 
                        if (updatedFeature) setFeature(updatedFeature);
                        setIsModalOpen(false); 
                    }} 
                    feature={isAdding ? null : feature} 
                />
            )}
        </div>
    );
};
