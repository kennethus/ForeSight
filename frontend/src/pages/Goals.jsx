import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import GoalModal from "../components/GoalModal";
import GoalRow from "../components/Goals/GoalRow";
import Spinner from "../components/Spinner";

const Goals = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/goals`,
          {
            params: { userId: auth._id },
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

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

  const handleGoalAdded = (newGoal) => {
    setGoals([newGoal, ...goals]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner size={100} color="blue" />
      </div>
    );
  }
  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* Display Goals */}
      {goals.length > 0 ?
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalRow
              key={goal._id}
              goal={goal}
              onClick={() => navigate(`/financial-goals/${goal._id}`)}
            />
          ))}
        </div>
      : <div className="text-center mt-40 flex flex-col items-center">
          <div className="text-5xl mb-2">💤</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No financial goals yet...
          </h3>
          <p className="text-gray-500 mb-4">
            Start planning your future by adding one!
          </p>
          <div className="animate-bounce fixed bottom-25 right-20 text-blue-500 text-3xl mb-2">
            ↓
          </div>
          <p className="fixed bottom-22 right-5 text-sm text-gray-500">
            Add saving goals here!
          </p>
        </div>
      }

      {/* Add Goal Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full px-4 py-3 shadow-lg hover:bg-blue-700 transition"
      >
        + Add Goal
      </button>

      {/* Goal Modal */}
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGoalUpdated={handleGoalAdded}
        />
      )}
    </div>
  );
};

export default Goals;
