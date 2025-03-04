import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import GoalModal from "../components/GoalModal"; // Import the modal

const GoalDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [goal, setGoal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchGoal = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/goals/${id}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGoal(response.data.data);
                } else {
                    setError("Failed to fetch goal details");
                }
            } catch (err) {
                console.error("Error fetching goal:", err.response?.data);
                setError(err.response?.data?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchGoal();
    }, [id]);

    const handleAddSavings = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("Enter a valid amount");
            return;
        }

        try {
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/goals/${id}/updateAmount`, {
                currentAmount: parseFloat(amount),
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (response.data.success) {
                setGoal(response.data.data);
                setAmount("");
            } else {
                alert("Failed to update goal");
            }
        } catch (err) {
            console.error("Error updating goal:", err.response?.data);
            alert("Error updating goal");
        }
    };

    const handleDeleteGoal = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/goals/${id}`, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (response.data.success) {
                alert("Goal deleted successfully");
                navigate(-1); // Redirect to goals list
            } else {
                alert("Failed to delete goal");
            }
        } catch (err) {
            console.error("Error deleting goal:", err.response?.data);
            alert("Error deleting goal");
        }
    };

    if (loading) return <p>Loading goal details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Goal Details</h2>
            <div style={{ backgroundColor: "#1E3A8A", color: "white", padding: "15px", borderRadius: "8px" }}>
                <h3>{goal.name}</h3>
                <p><strong>Target Amount:</strong> {goal.targetAmount}</p>
                <p><strong>Current Savings:</strong> {goal.currentAmount}</p>
                <p><strong>Target Date:</strong> {new Date(goal.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {goal.completed ? "Completed 🎉" : "In Progress 🔄"}</p>

                {!goal.completed && (
                    <div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Add Savings"
                        />
                        <button onClick={handleAddSavings}>Update Savings</button>
                    </div>
                )}
            </div>

            <button onClick={() => setIsEditModalOpen(true)}>Edit Goal</button>
            <button onClick={handleDeleteGoal} style={{ backgroundColor: "red", color: "white", marginLeft: "10px" }}>
                Delete Goal
            </button>
            <button onClick={() => navigate(-1)}>Go Back</button>

            {isEditModalOpen && 
                <GoalModal
                    isOpen={isEditModalOpen}
                    goal={goal} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onGoalUpdated={(updatedGoal) => setGoal(updatedGoal)}
                />
            }
        </div>
    );
};

export default GoalDetails;
