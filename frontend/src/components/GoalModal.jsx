import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const GoalModal = ({ isOpen, onClose, goal, onGoalUpdated }) => {
  const modalRef = useRef(null);
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || "");
  const [endDate, setEndDate] = useState(
    goal ? new Date(goal.endDate).toISOString().split("T")[0] : ""
  );
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (goal) {
        response = await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/goals/${goal._id}`,
          { name, targetAmount, endDate },
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/goals/`,
          {
            userId: auth._id,
            name,
            targetAmount,
            currentAmount: 0,
            endDate,
            completed: false,
          },
          { withCredentials: true }
        );
      }

      if (response.data.success) {
        alert(
          goal ? "Goal updated successfully!" : "Goal created successfully!"
        );
        try {
          onGoalUpdated(response.data.data); // Safely update the UI state
        } catch (updateError) {
          console.error("Error updating state:", updateError);
        }
        onClose();
      } else {
        alert(goal ? "Failed to update goal." : "Failed to create goal.");
      }
    } catch (err) {
      console.error("Error submitting goal:", err.response?.data);
      alert("Error submitting goal.");
    }
  };

  return (
    <dialog
      ref={modalRef}
      className="fixed w-md md:w-l lg:w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-sm p-5 items-center justify-center rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-center mb-4">Add Goal</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            className="input-field"
            type="text"
            placeholder="Goal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="input-field"
            type="number"
            min="1"
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />

          <input
            className="input-field"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          {/* Submit & Cancel Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button type="submit" className="btn-primary rounded-full">
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary rounded-full"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

GoalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  goal: PropTypes.object,
  onGoalUpdated: PropTypes.func.isRequired,
};

export default GoalModal;
