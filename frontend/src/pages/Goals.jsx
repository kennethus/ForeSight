import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import GoalModal from "../components/GoalModal"; // Assuming you have a modal component

const Goals = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/goals`, {
                    params: { userId: auth._id },
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGoals(response.data.data);
                } else {
                    setError("Failed to fetch financial goals");
                }
            } catch (err) {
                console.error("Error fetching goals:", err.response?.data);
                setError(err.response?.data?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [auth._id]);

    const handleGoalAdded = (newGoal) => {
        setGoals([...goals, newGoal]);
    };

    const handleAddGoal = () => {
        setSelectedGoal(null); // Reset selected goal for new entry
        setIsModalOpen(true);
    };

    if (loading) return <p>Loading financial goals...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Financial Goals</h2>
            {goals.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Goal Name</th>
                            <th>Target Amount</th>
                            <th>Current Savings</th>
                            <th>Target Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {goals.map((goal) => (
                            <tr
                                key={goal._id}
                                onClick={() => navigate(`/financial-goals/${goal._id}`)}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor: "#1E3A8A",
                                    color: "white",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3B5998")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
                            >
                                <td>{goal.name}</td>
                                <td>{goal.targetAmount}</td>
                                <td>{goal.currentAmount}</td>
                                <td>{new Date(goal.endDate).toLocaleDateString()}</td>
                                <td>{goal.completed ? "Completed" : "In Progress"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <h3>You have no financial goals now. Add one!</h3>
            )}
            <button onClick={handleAddGoal} className="mb-4">Add Goal</button>

            
            {isModalOpen && (
                <GoalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    goal={selectedGoal}
                    onGoalUpdated={handleGoalAdded} // Change `onGoalUpdate` to `onGoalUpdated`
                />
            
            )}
        </div>
    );
};

export default Goals;
