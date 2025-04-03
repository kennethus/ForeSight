import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiArrowLeft, HiPencil } from "react-icons/hi";
import GoalModal from "../components/GoalModal"; // Ensure correct path

const GoalDetails = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!auth) navigate("/");
  }, [auth, navigate]);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/goals/${id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setGoal(response.data.data);
        } else {
          setError("Failed to fetch goal details");
        }
      } catch (err) {
        setError(
          "Failed to fetch goal details: " + (err.response?.message || "")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  const handleAddSavings = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/goals/${id}/updateAmount`,
        { currentAmount: parseFloat(amount) },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setGoal(response.data.data); // Update goal state directly
        setAmount("");
      } else {
        alert("Failed to update goal");
      }
    } catch (err) {
      alert("Error updating goal: " + (err.response?.message || ""));
    }
  };

  // Function to update goal details after editing
  const handleGoalUpdate = (updatedGoal) => {
    setGoal(updatedGoal); // Directly update goal state
    setIsEditModalOpen(false); // Close modal
  };

  if (loading) return <p>Loading goal details...</p>;
  if (error) return <p>{error}</p>;

  const saved = goal.currentAmount;
  const target = goal.targetAmount;
  const savedPercentage = target > 0 ? Math.round((saved / target) * 100) : 0;
  const remaining = target - saved;

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        {/* Header: Goal Name & Target Amount */}
        <div className="flex items-center justify-between pb-3">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="bg-transparent text-gray-600 hover:text-gray-900"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>

          {/* Goal Information */}
          <div className="flex-grow text-center">
            <p className="text-sm font-semibold text-gray-600">
              UNTIL{" "}
              {new Date(goal.endDate)
                .toLocaleString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
                .toUpperCase()}
            </p>
            <h2 className="text-lg font-bold">{goal.name}</h2>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-transparent text-gray-700 hover:bg-gray-300 p-2 rounded-full"
          >
            <HiPencil className="w-5 h-5" />
          </button>
        </div>

        {/* Target Amount */}
        <p className="text-green-600 font-bold text-lg text-center">
          ₱{target.toLocaleString()}
        </p>

        {/* Progress Circle */}
        <div className="flex flex-col items-center mt-4">
          <div className="w-40">
            <CircularProgressbar
              value={savedPercentage}
              text={`${savedPercentage}%`}
              styles={buildStyles({
                textColor: "#333",
                pathColor: "#2DB6F5",
                trailColor: "#E0F2FE",
              })}
            />
          </div>

          {/* Saved & Remaining Labels */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between sm:px-12 mt-4 text-center sm:text-left gap-4">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500">SAVED</p>
              <p className="text-sm font-bold text-gray-800">
                ₱{saved.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500">REMAINING</p>
              <p className="text-sm font-bold text-gray-800">
                ₱{remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Input Field & Button */}
        <div className="mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to save"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAddSavings}
            className="w-full bg-green-500 text-white py-2 rounded-lg mt-4 hover:bg-green-600"
          >
            ADD SAVED AMOUNT
          </button>
        </div>
      </div>

      {/* Goal Edit Modal */}
      {isEditModalOpen && (
        <GoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          goal={goal}
          onGoalUpdated={handleGoalUpdate} // Pass function to update goal
        />
      )}
    </div>
  );
};

export default GoalDetails;
