import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const GoalModal = ({ isOpen, onClose, goal, onGoalUpdated }) => {
  const modalRef = useRef(null);
  const { auth } = useContext(AuthContext);

  // Controlled input state
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || "");
  const [endDate, setEndDate] = useState(
    goal ? new Date(goal.endDate).toISOString().split("T")[0] : ""
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (goal) {
      setName(goal.name || "");
      setTargetAmount(goal.targetAmount || "");
      setEndDate(
        goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : ""
      );
    } else {
      setName("");
      setTargetAmount("");
      setEndDate("");
    }
  }, [goal, isOpen]);

  // Open/close modal
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      let response;
      if (goal) {
        // Update existing goal
        response = await axios.patch(
          `${import.meta.env.VITE_API_URL}/api/goals/${goal._id}`,
          { name, targetAmount: Number(targetAmount), endDate },
          { withCredentials: true }
        );
      } else {
        // Create new goal
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/goals/`,
          {
            userId: auth._id,
            name,
            targetAmount: Number(targetAmount),
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
        onGoalUpdated(response.data.data); // Update the parent state
        setSubmitLoading(false);
        onClose();
      } else {
        alert(goal ? "Failed to update goal." : "Failed to create goal.");
        setSubmitLoading(false);
      }
    } catch (err) {
      console.error("Error submitting goal:", err.response?.data);
      alert("Error submitting goal.");
      setSubmitLoading(false);
    }
  };

  return (
    <dialog
      ref={modalRef}
      className="fixed w-md md:w-l lg:w-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black bg-opacity-50"
    >
      <div className="bg-white w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-sm p-5 items-center justify-center rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-center mb-4">
          {goal ? "Edit Goal" : "Add Goal"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Goal Name */}
          <div>
            <label
              htmlFor="goalName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Goal Name
            </label>
            <input
              id="goalName"
              className="input-field"
              type="text"
              placeholder="Ex: New Phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="targetAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target Amount
            </label>
            <input
              id="targetAmount"
              className="input-field"
              type="number"
              min="1"
              placeholder="Ex: 5000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              id="endDate"
              className="input-field"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button type="submit" className="btn-primary rounded-full">
              {submitLoading ?
                "Loading..."
              : goal ?
                "Update Goal"
              : "Save Goal"}
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
