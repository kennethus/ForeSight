import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddBudgetModal from "../components/AddBudgetModal";
import BudgetRow from "../components/Budgets/BudgetRow";

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

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/budgets/`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

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
  }, [auth?._id]);

  const handleBudgetAdded = (newBudget) => {
    setBudgets((prevBudgets) => [newBudget, ...prevBudgets]);
  };

  if (loading) return <p>Loading budgets...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="p-6">
      {budgets.length === 0 ?
        <div className="text-center p-6 border border-gray-300 rounded-lg">
          <p className="text-gray-600">
            You have no budgets yet. Start by creating one!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            + Create a Budget
          </button>
        </div>
      : <div className="space-y-8">
          {/* Open Budgets */}
          <h3 className="text-xl font-medium">Open Budgets</h3>
          <div className="space-y-4">
            {budgets
              .filter((budget) => !budget.closed)
              .map((budget) => (
                <BudgetRow
                  key={budget._id}
                  budget={budget}
                  onClick={() => navigate(`/budgets/${budget._id}`)}
                />
              ))}
          </div>

          {/* Closed Budgets */}
          <h3 className="text-xl font-medium">Closed Budgets</h3>
          <div className="space-y-4">
            {budgets
              .filter((budget) => budget.closed)
              .map((budget) => (
                <BudgetRow
                  key={budget._id}
                  budget={budget}
                  onClick={() => navigate(`/budgets/${budget._id}`)}
                />
              ))}
          </div>
        </div>
      }

      {/* Floating Add Budget Button */}
      {budgets.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
        >
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
