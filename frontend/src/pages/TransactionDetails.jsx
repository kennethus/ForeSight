import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/authProvider";
import axios from "axios";
import AddTransactionModal from "../components/AddTransactionModal"; // Import modal

const TransactionDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams(); // Get transaction ID from URL
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [hasClosedBudget, setHasClosedBudget] = useState(false)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Controls modal

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                const budgets = await axios.get(`${import.meta.env.VITE_API_URL}/api/transaction-budget/get-budgets`, {
                    params: { transactionId: id },
                    withCredentials: true
                });

                if (response.data.success && budgets.data.success) {
                    console.log("Transaction Details: ", response.data.data)
                    setTransaction(response.data.data);
                    console.log(budgets.data.data)
                    
                    const hasClosed = budgets.data.data.some(budgetRel => budgetRel.budgetId.closed);
                    console.log("Has Closed:", hasClosed)
                    setHasClosedBudget(hasClosed);


                } else {
                    setError("Transaction not found");
                }
            } catch (err) {
                console.error("Error fetching transaction:", err.response?.data);
                setError("Error fetching transaction details");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [id]);

    const updateTransaction = async (editedTransaction) => {
        setTransaction(editedTransaction)
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
                withCredentials: true,
            });
            alert("Transaction deleted successfully!");
            navigate(-1); // Go back after deletion
        } catch (err) {
            console.error("Error deleting transaction:", err.response?.data);
            alert("Failed to delete transaction.");
        }
    };

    if (loading) return <p>Loading transaction details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Transaction Details</h2>
            <p><strong>Name:</strong> {transaction.name}</p>
            <p><strong>Total Amount:</strong> {transaction.totalAmount}</p>
            <p><strong>Category:</strong> {transaction.category}</p>
            <p><strong>Date:</strong> {new Date(transaction.date).toLocaleString()}</p>
            <p><strong>Type:</strong> {transaction.type}</p>
            <p><strong>Description:</strong> {transaction.description}</p>

            <button onClick={() => navigate(-1)}>Go Back</button>
            <button onClick={() => setIsEditModalOpen(true)}>Edit</button>
            <button 
                onClick={handleDelete} 
                disabled={hasClosedBudget} 
                style={{ 
                    color: hasClosedBudget ? "gray" : "red", 
                    cursor: hasClosedBudget ? "not-allowed" : "pointer", 
                    opacity: hasClosedBudget ? 0.5 : 1 
                }}
            >
                Delete
            </button>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <AddTransactionModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onTransactionAdded={updateTransaction}
                    existingTransaction={transaction} // Pass transaction to modal
                />
            )}
        </div>
    );
};

export default TransactionDetails;
