import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddBudgetModal from "../components/AddBudgetModal";
import { HiArrowLeft, HiPencil, HiTrash, HiLockClosed } from "react-icons/hi";

const BudgetDetails = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams(); // Get budget ID from URL
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [othersBudget, setOthersBudget] = useState(null);
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
        const budgetRequest = axios.get(
          `${import.meta.env.VITE_API_URL}/api/budgets/${id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const transactionsRequest = axios.get(
          `${import.meta.env.VITE_API_URL}/api/transaction-budget/get-transactions`,
          {
            params: { budgetId: id },
            withCredentials: true,
          }
        );

        const othersBudgetRequest = axios.get(
          `${import.meta.env.VITE_API_URL}/api/budgets/getByName/Others`,
          { withCredentials: true }
        );

        // Run all requests in parallel
        const [budgetResponse, transactionsResponse, othersBudgetResponse] =
          await Promise.all([
            budgetRequest,
            transactionsRequest,
            othersBudgetRequest,
          ]);

        // ✅ Process responses
        if (budgetResponse.data.success) setBudget(budgetResponse.data.data);
        else setError("Failed to fetch budget details");

        if (transactionsResponse.data.success)
          setbudgetTransactionObjects(transactionsResponse.data.data);
        else setError("Failed to fetch budget transactions");

        if (othersBudgetResponse.data.success)
          setOthersBudget(othersBudgetResponse.data.data);
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
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

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this budget?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/budgets/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log("Reverting back: ", response.data.data.amount);
        const updateOthersResponse = await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/budgets/updateAmount/${othersBudget._id}`,
          { amount: response.data.data.amount },
          { withCredentials: true }
        );
        if (updateOthersResponse.data.success) {
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
          alert(
            "Budget closed successfully! Remaining balance added back to 'Others'."
          );
          setBudget({ ...budget, closed: true }); // Update state to reflect closure
          setOthersBudget({
            ...othersBudget,
            amount: othersBudget.amount + remainingBalance,
          }); // Update "Others" budget in state
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

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Loading budget details...
      </p>
    );
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white shadow-md rounded-lg w-full p-6 mt-10 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 bg-transparent hover:text-gray-900"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            Budget Details
          </h2>

          {/* Icons for actions */}
          {budget?.name !== "Others" && (
            <div className="flex space-x-3">
              {/* Edit */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-500 hover:text-blue-700 bg-transparent"
              >
                <HiPencil className="w-6 h-6" />
              </button>

              {/* Close or Delete */}
              {budgetTransactionObjects.length > 0 ?
                <button
                  onClick={handleCloseBudget}
                  disabled={budget?.closed}
                  className={`text-yellow-500 bg-transparent hover:cursor-pointer ${budget?.closed ? "opacity-50 cursor-not-allowed" : "hover:text-yellow-700"}`}
                >
                  <HiLockClosed className="w-6 h-6" />
                </button>
              : <button
                  onClick={handleDeleteBudget}
                  className="bg-transparent text-red-500 hover:text-red-700"
                >
                  <HiTrash className="w-6 h-6" />
                </button>
              }
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-center mt-4">
          <p className="text-gray-500">Amount</p>
          <p className="text-2xl font-bold text-gray-800">
            ₱{(budget.amount + budget.earned).toFixed(2)}
          </p>
        </div>

        {/* Budget Details Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-gray-600">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="text-gray-800 font-medium">{budget.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p
              className={`font-semibold ${budget.closed ? "text-red-500" : "text-green-500"}`}
            >
              {budget.closed ? "Closed" : "Open"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Spent</p>
            <p className="text-gray-800">₱{budget.spent}</p>
          </div>
          <div>
            <p className="text-gray-500">Earned</p>
            <p className="text-gray-800">₱{budget.earned}</p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Transactions
          </h3>
          {budgetTransactionObjects.length > 0 ?
            <ul className="mt-3 space-y-3">
              {budgetTransactionObjects.map((transaction) => (
                <li
                  key={transaction.transactionId._id}
                  className="border rounded p-3 cursor-pointer hover:shadow-lg"
                  onClick={() =>
                    navigate(`/transactions/${transaction.transactionId._id}`)
                  }
                >
                  <p className="text-gray-700 font-medium">
                    {transaction.transactionId.name}
                  </p>
                  <p className="text-gray-600">Amount: ₱{transaction.amount}</p>
                </li>
              ))}
            </ul>
          : <p className="text-gray-500 mt-3">
              No transactions found for this budget.
            </p>
          }
        </div>
      </div>

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
