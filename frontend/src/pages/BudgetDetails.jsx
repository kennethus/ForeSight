import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddBudgetModal from "../components/AddBudgetModal";

const BudgetDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams(); // Get budget ID from URL
    const navigate = useNavigate();
    const [budget, setBudget] = useState(null);
    const [othersBudget, setOthersBudget] = useState(null)
    const [budgetTransactionObjects, setbudgetTransactionObjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true); // ✅ Set loading before starting
    
            try {
                const budgetRequest = axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/${id}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });
    
                const transactionsRequest = axios.get(`${import.meta.env.VITE_API_URL}/api/transaction-budget/get-transactions`, {
                    params: { budgetId: id },
                    withCredentials: true
                });
    
                const othersBudgetRequest = axios.get(
                    `${import.meta.env.VITE_API_URL}/api/budgets/getByName/Others`,
                    { withCredentials: true }
                );
    
                // Run all requests in parallel
                const [budgetResponse, transactionsResponse, othersBudgetResponse] = await Promise.all([
                    budgetRequest,
                    transactionsRequest,
                    othersBudgetRequest
                ]);
    
                // ✅ Process responses
                if (budgetResponse.data.success) setBudget(budgetResponse.data.data);
                else setError("Failed to fetch budget details");
    
                if (transactionsResponse.data.success) setbudgetTransactionObjects(transactionsResponse.data.data);
                else setError("Failed to fetch budget transactions");
    
                if (othersBudgetResponse.data.success) setOthersBudget(othersBudgetResponse.data.data);
                
            } catch (err) {
                console.error("Error fetching data:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to fetch data");
            } finally {
                setLoading(false); // ✅ Only set loading to false AFTER all requests finish
            }
        };
    
        fetchAllData();
    }, [id]);
    

    const updateBudget = (editedBudget) => {
        setBudget(editedBudget);
    };

    const handleDeleteBudget = async () => {
        if (!budget) return;
    
        const confirmDelete = window.confirm("Are you sure you want to delete this budget?");
        if (!confirmDelete) return;
    
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/budgets/${id}`,
                { withCredentials: true }
            );
    
            if (response.data.success) {
                console.log("Reverting back: ", response.data.data.amount)
                const updateOthersResponse = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/budgets/updateAmount/${othersBudget._id}`,
                    {amount: response.data.data.amount},
                    { withCredentials: true }
                );
                if (updateOthersResponse.data.success){
                    alert("Budget deleted successfully!");
                    navigate(-1); // Redirect after deletion
                } else {
                    alert("Failed to delete budget.");
                }
            } else {
                alert("Failed to delete budget.");
            }
        } catch (err) {
            console.error("Error deleting budget:", err.response?.data);
            alert("Error deleting budget. Please try again.");
        }
    };
    

    const handleCloseBudget = async () => {
        if (!budget || budget.closed || !othersBudget) return;
    
        // Calculate the remaining balance to transfer back to "Others"
        const remainingBalance = budget.amount + budget.earned - budget.spent;
    
        try {
            // Close the budget
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/budgets/close/${id}`,
                {},
                { withCredentials: true }
            );
    
            if (response.data.success) {
                // Update the "Others" budget amount
                const updateOthersResponse = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/budgets/updateAmount/${othersBudget._id}`,
                    { amount: remainingBalance },
                    { withCredentials: true }
                );
    
                if (updateOthersResponse.data.success) {
                    alert("Budget closed successfully! Remaining balance added back to 'Others'.");
                    setBudget({ ...budget, closed: true }); // Update state to reflect closure
                    setOthersBudget({ ...othersBudget, amount: othersBudget.amount + remainingBalance }); // Update "Others" budget in state
                } else {
                    alert("Failed to update 'Others' budget.");
                }
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
                    <p><strong>Initial mount:</strong> {budget.amount}</p>
                    <p><strong>Spent:</strong> {budget.spent}</p>
                    <p><strong>Earned:</strong> {budget.earned}</p>
                    <p><strong>Start Date:</strong> {new Date(budget.startDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {budget.name === "Others" ? "--" : new Date(budget.endDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {budget.closed ? "Closed" : "Open"}</p>
                </div>
            ) : (
                <p>Budget not found.</p>
            )}

            {/* Edit Budget Button */}
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="edit-budget-btn"
                disabled={budget?.name === "Others"}  // Disable if budget name is "Balance"
            >
                Edit Budget
            </button>

            {/* Conditionally Render Close or Delete Button */}
            {budgetTransactionObjects.length > 0 ? (
                <button
                    onClick={handleCloseBudget}
                    disabled={budget?.closed || budget?.name === "Others"} // Disable if budget is closed or name is "Balance"
                    className={`close-budget-btn ${(budget?.closed || budget?.name === "Balance") ? "disabled" : ""}`}
                >
                    {budget?.closed ? "Budget Closed" : "Close Budget"}
                </button>
            ) : (
                <button
                    onClick={handleDeleteBudget} 
                    className="delete-budget-btn"
                    disabled={budget?.name === "Others"} // Prevent deletion of Balance budget
                >
                    Delete Budget
                </button>
            )}

            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="back-btn"
            >
                Back to Budgets
            </button>


            {/* ✅ budgetTransactionObjects Table */}
            <h3>Transactions</h3>
            {budgetTransactionObjects.length > 0 ? (
                <table className="budgetTransactionObjects-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgetTransactionObjects.map((budgetTransactionObject) => (
                            <tr key={budgetTransactionObject.transactionId._id} onClick={() => navigate(`/transactions/${budgetTransactionObject.transactionId._id}`)}>
                                <td>{budgetTransactionObject.transactionId.name}</td>
                                <td>{budgetTransactionObject.transactionId.category}</td>
                                <td>{budgetTransactionObject.transactionId.description}</td>
                                <td>{budgetTransactionObject.amount}</td>
                                <td>{new Date(budgetTransactionObject.transactionId.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-budgetTransactionObjects">No transactions found for this budget.</p>
            )}

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
