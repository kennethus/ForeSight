import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const Budgets = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    const userId = auth._id;
    console.log("Sending User ID: ", userId);

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/`, {
                    params: { userId },
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                console.log("Response:", response.data);

                if (response.data.success) {
                    setBudgets(response.data.data);
                } else {
                    setError("Failed to fetch budgets");
                }
            } catch (err) {
                console.error("Error fetching budgets:", err.response?.data);
                setError(err.response?.data?.message || "Login failed");
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, [userId]);

    if (loading) return <p>Loading budgets...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Budgets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                    </tr>
                </thead>
                <tbody>
                {budgets.length > 0 ? (
                    budgets.map((budget) => (
                        <tr
                            key={budget._id}
                            onClick={() => navigate(`/budgets/${budget._id}`)}
                            style={{ 
                                cursor: "pointer", 
                                backgroundColor: "#1E3A8A", // Dark Blue
                                color: "white" // Ensures text remains readable
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3B5998")} // Lighter blue on hover
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")} // Reset to dark blue
                        >
                            <td>{budget.name}</td><td>{budget.amount}</td>
                            <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                            <td>{new Date(budget.endDate).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No budgets found</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default Budgets;
