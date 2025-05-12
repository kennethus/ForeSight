import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiPencil, HiTrash } from "react-icons/hi";
import AuthContext from "../context/authProvider";
import axios from "axios";
import AddTransactionModal from "../components/AddTransactionModal";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";

const TransactionDetails = () => {
  const { showToast } = useToast();

  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [budgets, setBudgets] = useState([]); // Store budgets
  const [hasClosedBudget, setHasClosedBudget] = useState(false);
  const [loading, setLoading] = useState(true);
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
          showToast("Transaction not found", "warning");
        }
      } catch (err) {
        showToast(
          "Error fetching transaction details:" + err.response?.message,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const updateBudget = async (updatedTransaction) => {
    const budgetsResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/transaction-budget/get-budgets`,
      {
        params: { transactionId: transaction._id },
        withCredentials: true,
      }
    );

    if (budgetsResponse.data.success) {
      setTransaction(updatedTransaction);
      setBudgets(budgetsResponse.data.data); // Store budgets

      // Check if any related budget is closed
      const hasClosed = budgetsResponse.data.data.some(
        (budgetRel) => budgetRel.budgetId.closed
      );
      setHasClosedBudget(hasClosed);
    } else {
      showToast("Transaction not found", "warning");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/transactions/${id}`,
        {
          withCredentials: true,
        }
      );
      showToast("Transaction deleted successfully!", "success");
      navigate(-1);
    } catch (err) {
      showToast(
        "Failed to delete transaction:",
        err.response?.message,
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner size={100} color="blue" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Card Container */}
      <div className="bg-white shadow-md rounded-lg w-full p-6 mt-10 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 hover:cursor-pointer bg-transparent"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800">
            Transaction Details
          </h2>

          {/* Icons for Edit & Delete */}
          <div className="flex space-x-3">
            {/* Edit */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-blue-500 hover:text-blue-700 hover:cursor-pointer bg-transparent"
            >
              <HiPencil className="w-6 h-6" />
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={hasClosedBudget}
              className={`text-red-500 bg-transparent ${hasClosedBudget ? "opacity-50 cursor-not-allowed" : "hover:text-red-700 hover:cursor-pointer"}`}
            >
              <HiTrash className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center mt-4">
          <p className="text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-800">
            ₱{transaction.totalAmount}
          </p>
        </div>

        {/* Details Grid */}
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
            <p className="text-gray-800">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <p className="text-gray-800">{transaction.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Description</p>
            <p className="text-gray-800">
              {transaction.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Related Budgets */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Related Budgets
          </h3>
          {budgets.length > 0 ?
            <ul className="mt-3 space-y-3">
              {budgets.map((budget) => (
                <li
                  key={budget.budgetId._id}
                  className="border rounded p-3 cursor-pointer hover:shadow-lg"
                  onClick={() => navigate(`/budgets/${budget.budgetId._id}`)}
                >
                  <p className="text-gray-700 font-medium">
                    {budget.budgetId.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Amount: ₱{budget.amount} | Status:{" "}
                    {budget.budgetId.closed ?
                      <span className="text-red-500">Closed</span>
                    : <span className="text-green-500">Open</span>}
                  </p>
                </li>
              ))}
            </ul>
          : <p className="text-gray-500 mt-3">
              No budgets associated with this transaction.
            </p>
          }
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <AddTransactionModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onTransactionAdded={updateBudget}
            existingTransaction={transaction}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
