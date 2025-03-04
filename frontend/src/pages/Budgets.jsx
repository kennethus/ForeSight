import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddBudgetModal from "../components/AddBudgetModal";

const Budgets = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    const userId = auth._id;

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

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

    const handleBudgetAdded = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    };

    if (loading) return <p>Loading budgets...</p>;
    if (error) return <p>{error}</p>;

    // Separate budgets into open and closed
    const openBudgets = budgets.filter(budget => !budget.closed);
    const closedBudgets = budgets.filter(budget => budget.closed);

    return (
        <div>
            <h2>Budgets</h2>  

            {/* Open Budgets Section */}
            <h3>Open Budgets</h3>
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
                {openBudgets.length > 0 ? (
                    openBudgets.map((budget) => (
                        <tr
                            key={budget._id}
                            onClick={() => navigate(`/budgets/${budget._id}`)}
                            style={{ 
                                cursor: "pointer", 
                                backgroundColor: "#1E3A8A", 
                                color: "white" 
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3B5998")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
                        >
                            <td>{budget.name}</td>
                            <td>{budget.amount}</td>
                            <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                            <td>{new Date(budget.endDate).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No open budgets</td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* Closed Budgets Section */}
            <h3>Closed Budgets</h3>
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
                {closedBudgets.length > 0 ? (
                    closedBudgets.map((budget) => (
                        <tr
                            key={budget._id}
                            onClick={() => navigate(`/budgets/${budget._id}`)}
                            style={{ 
                                cursor: "pointer", 
                                backgroundColor: "#6B7280",  // Grayish for closed budgets
                                color: "white" 
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B5563")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6B7280")}
                        >
                            <td>{budget.name}</td>
                            <td>{budget.amount}</td>
                            <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                            <td>{new Date(budget.endDate).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No closed budgets</td>
                    </tr>
                )}
                </tbody>
            </table>

            <button onClick={() => setIsModalOpen(true)}>+ Add Budget</button>

            {/* Add Budget Modal */}
            <AddBudgetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onBudgetAdded={handleBudgetAdded} 
            />
        </div>
    );
};

export default Budgets;
