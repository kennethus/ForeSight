import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const GoalModal = ({ isOpen, onClose, goal, onGoalUpdated }) => {
    const modalRef = useRef(null);
    const [name, setName] = useState(goal?.name || "");
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || "");
    const [endDate, setEndDate] = useState(goal ? new Date(goal.endDate).toISOString().split("T")[0] : "");
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
                    { userId: auth._id, name, targetAmount, currentAmount: 0, endDate, completed: false },
                    { withCredentials: true }
                );
            }
    
            if (response.data.success) {
                alert(goal ? "Goal updated successfully!" : "Goal created successfully!");
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
        <dialog ref={modalRef} className="modal">
            <div className="modal-content">
                <h2>Edit Goal</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="goalName">Goal Name</label>
                        <input 
                            id="goalName" 
                            type="text" 
                            placeholder="Enter goal name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="targetAmount">Target Amount</label>
                        <input 
                            id="targetAmount" 
                            type="number" 
                            min="1"
                            placeholder="Enter target amount" 
                            value={targetAmount} 
                            onChange={(e) => setTargetAmount(e.target.value)} 
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="endDate">Target Date</label>
                        <input 
                            id="endDate" 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={onClose}>Cancel</button>
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
