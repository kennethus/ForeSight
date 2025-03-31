import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi"; // Import arrow icon
import AuthContext from "../context/authProvider";
import axios from "axios";
import AddTransactionModal from "../components/AddTransactionModal";

const TransactionDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [budgets, setBudgets] = useState([]); // Store budgets
    const [hasClosedBudget, setHasClosedBudget] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/transactions/${id}`,
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );

                const budgetsResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/transaction-budget/get-budgets`,
                    {
                        params: { transactionId: id },
                        withCredentials: true,
                    }
                );

                if (response.data.success && budgetsResponse.data.success) {
                    setTransaction(response.data.data);
                    setBudgets(budgetsResponse.data.data); // Store budgets
                    
                    // Check if any related budget is closed
                    const hasClosed = budgetsResponse.data.data.some(
                        (budgetRel) => budgetRel.budgetId.closed
                    );
                    setHasClosedBudget(hasClosed);
                } else {
                    setError("Transaction not found");
                }
            } catch (err) {
                setError("Error fetching transaction details:", err.response?.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
                withCredentials: true,
            });
            alert("Transaction deleted successfully!");
            navigate(-1);
        } catch (err) {
            alert("Failed to delete transaction:", err.response?.message);
        }
    };

    if (loading) return <p className="text-center text-gray-500 mt-10">Loading transaction details...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    return (
        <div className="flex flex-col items-center">
            {/* Card Container */}
            <div className="bg-white shadow-md rounded-lg w-full p-6 mt-10">
                {/* Header */}
                <div className="flex items-center space-x-3 border-b pb-3">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-transparent text-gray-600 hover:text-gray-900"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-800 ">
                        Transaction Details
                    </h2>
                </div>

                {/* Amount */}
                <div className="text-center mt-4">
                    <p className="text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800">₱{transaction.totalAmount}</p>
                </div>

                {/* Responsive Grid Layout for Details Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                    <div>
                        <p className="text-gray-500">Name</p>
                        <p className="text-gray-800 font-medium">{transaction.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-gray-800">{transaction.category}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Date</p>
                        <p className="text-gray-800">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Type</p>
                        <p className="text-gray-800">{transaction.type}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Description</p>
                        <p className="text-gray-800">{transaction.description || "No description provided"}</p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={hasClosedBudget}
                        className={`px-4 py-2 rounded-md ${
                            hasClosedBudget
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                    >
                        Delete
                    </button>
                </div>

                {/* Budget Section */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Related Budgets</h3>
                    {budgets.length > 0 ? (
                        <ul className="mt-3 space-y-3">
                            {budgets.map((budget) => (
                                <li 
                                    key={budget.budgetId._id} 
                                    className="border rounded p-3 cursor-pointer hover:shadow-lg"
                                    onClick={() => navigate(`/budgets/${budget.budgetId._id}`)}
                                >
                                    <p className="text-gray-700 font-medium">{budget.budgetId.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Amount: ₱{budget.amount} | Status:{" "}
                                        {budget.budgetId.closed ? (
                                            <span className="text-red-500">Closed</span>
                                        ) : (
                                            <span className="text-green-500">Open</span>
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mt-3">No budgets associated with this transaction.</p>
                    )}
                </div>

                

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <AddTransactionModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onTransactionAdded={setTransaction}
                        existingTransaction={transaction}
                    />
                )}
            </div>
        </div>
    );
};

export default TransactionDetails;