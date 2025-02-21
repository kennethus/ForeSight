import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const BudgetDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams(); // Get budget ID from URL
    const navigate = useNavigate();

    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchBudgetDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/${id}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                console.log("Budget Details Response:", response.data);

                if (response.data.success) {
                    setBudget(response.data.data);
                } else {
                    setError("Failed to fetch budget details");
                }
            } catch (err) {
                console.error("Error fetching budget details:", err.response?.data);
                setError(err.response?.data?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetDetails();
    }, [id]);

    if (loading) return <p>Loading budget details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Budget Details</h2>
            {budget ? (
                <div style={{ backgroundColor: "#1E3A8A", color: "white", padding: "20px", borderRadius: "8px" }}>
                    <p><strong>Name:</strong> {budget.name}</p>
                    <p><strong>Amount:</strong> {budget.amount}</p>
                    <p><strong>Spent:</strong> {budget.spent}</p>
                    <p><strong>Start Date:</strong> {new Date(budget.startDate).toLocaleString()}</p>
                    <p><strong>End Date:</strong> {new Date(budget.endDate).toLocaleString()}</p>
                    <p><strong>Status:</strong> {budget.closed ? "Closed" : "Open"}</p>
                </div>
            ) : (
                <p>Budget not found.</p>
            )}

            <button 
                onClick={() => navigate(-1)} 
                style={{ marginTop: "20px", padding: "10px 15px", backgroundColor: "#3B5998", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
                Back to Budgets
            </button>
        </div>
    );
};

export default BudgetDetails;
