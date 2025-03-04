import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddBudgetModal from "../components/AddBudgetModal"; // Import the modal component

const BudgetDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams(); // Get budget ID from URL
    const navigate = useNavigate();
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const updateBudget = (editedBudget) => {
        console.log("Updated budget received:", editedBudget);
        setBudget(editedBudget); // Ensure React sees it as a new object
    };

    const handleCloseBudget = async () => {
        if (!budget || budget.closed) return; // Prevent closing if already closed

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/budgets/close/${id}`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                alert("Budget closed successfully!");
                setBudget({ ...budget, closed: true }); // Update UI immediately
            } else {
                alert("Failed to close budget.");
            }
        } catch (err) {
            console.error("Error closing budget:", err.response?.data);
            alert("Error closing budget. Please try again.");
        }
    };

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
                    <p><strong>Earned:</strong> {budget.earned}</p>
                    <p><strong>Start Date:</strong> {new Date(budget.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(budget.endDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {budget.closed ? "Closed" : "Open"}</p>
                </div>
            ) : (
                <p>Budget not found.</p>
            )}

            {/* Edit Budget Button */}
            <button 
                onClick={() => setIsModalOpen(true)} 
                style={{ marginTop: "20px", padding: "10px 15px", backgroundColor: "#FFA500", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
                Edit Budget
            </button>

            {/* Close Budget Button */}
            <button
                onClick={handleCloseBudget}
                disabled={budget?.closed}
                style={{
                    marginTop: "20px",
                    marginLeft: "10px",
                    padding: "10px 15px",
                    backgroundColor: budget?.closed ? "gray" : "#DC3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: budget?.closed ? "not-allowed" : "pointer",
                }}
            >
                {budget?.closed ? "Budget Closed" : "Close Budget"}
            </button>

            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                style={{ marginTop: "20px", marginLeft: "10px", padding: "10px 15px", backgroundColor: "#3B5998", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
                Back to Budgets
            </button>

            {/* Budget Modal */}
            {isModalOpen && (
                <AddBudgetModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onBudgetAdded={updateBudget} 
                    existingBudget={budget}
                />
            )}
        </div>
    );
};

export default BudgetDetails;
