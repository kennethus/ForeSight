import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const Goals = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                    backgroundColor: "#1E3A8A", // Dark Blue
                                    color: "white",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3B5998")} // Lighter blue on hover
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")} // Reset to dark blue
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
            ):(
                <h3>You have no financial goals now. Add one!</h3>
            )}
            
        </div>
    );
};

export default Goals;
