import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import GoalModal from "../components/GoalModal";
import GoalRow from "../components/Goals/GoalRow";

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
    setGoals([...goals, newGoal]);
  };

  if (loading) return <p>Loading financial goals...</p>;
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
      : <h3>You have no financial goals now. Add one!</h3>}

      {/* Add Goal Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full hover:bg-blue-700"
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
