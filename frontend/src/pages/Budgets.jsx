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

    const userId = auth?._id;

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
                setError(err.response?.data?.message || "Failed to load budgets");
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, [userId]);

    const handleBudgetAdded = (newBudget) => {
        setBudgets((prevBudgets) => {
            const updatedBudgets = prevBudgets.map(budget => 
                budget.name === "Others"
                    ? { ...budget, amount: budget.amount - newBudget.amount }
                    : budget
            );
    
            return [newBudget, ...updatedBudgets]; // Add new budget at the front
        });
    };
    
    

    if (loading) return <p>Loading budgets...</p>;
    if (error) return <p className="error">{error}</p>;

    // Separate open and closed budgets
    const openBudgets = budgets.filter(budget => !budget.closed);
    const closedBudgets = budgets.filter(budget => budget.closed);

    return (
        <div className="budgets-container">
            <h2>Budgets</h2>

            {/* ✅ Show message if no budgets exist */}
            {budgets.length === 0 ? (
                <div className="no-budgets">
                    <p>You have no budgets yet. Start by creating one!</p>
                    <button onClick={() => setIsModalOpen(true)} className="add-budget-btn">
                        + Create a Budget
                    </button>
                </div>
            ) : (
                <>
                    {/* Open Budgets Section */}
                    <h3>Open Budgets</h3>
                    <table className="budgets-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Remaining Amount</th>
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
                                        className="budget-row open"
                                    >
                                        <td>{budget.name}</td>
                                        <td>{budget.amount + budget.earned - budget.spent}</td>
                                        <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                                        <td>{budget.name === "Others" ? "--" : new Date(budget.endDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-message">No open budgets</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Closed Budgets Section */}
                    <h3>Closed Budgets</h3>
                    <table className="budgets-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Remaining Amount</th>
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
                                        className="budget-row closed"
                                    >
                                        <td>{budget.name}</td>
                                        <td>{budget.amount + budget.earned - budget.spent}</td>
                                        <td>{new Date(budget.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(budget.endDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-message">No closed budgets</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}

            {/* Add Budget Button */}
            {budgets.length > 0 && (
                <button onClick={() => setIsModalOpen(true)} className="add-budget-btn">
                    + Add Budget
                </button>
            )}

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
