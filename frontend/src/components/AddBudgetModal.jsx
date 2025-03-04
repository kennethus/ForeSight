import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const AddBudgetModal = ({ isOpen, onClose, onBudgetAdded, existingBudget }) => {
    const { auth } = useContext(AuthContext);
    const modalRef = useRef(null);

    const [name, setName] = useState(existingBudget?.name || "");
    const [amount, setAmount] = useState(existingBudget?.amount || "");
    const [startDate, setStartDate] = useState(existingBudget ? new Date(existingBudget.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(existingBudget ? new Date(existingBudget.endDate).toISOString().split("T")[0] : "");
    const [errorMessage, setErrorMessage] = useState("");

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
            if (existingBudget) {
                const updatedBudget = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/budgets/${existingBudget._id}`,
                    { userId: auth._id, name, amount, startDate, endDate },
                    { withCredentials: true }
                );
                alert("Budget updated successfully!");
                console.log("SENDING UPDATED BUDGET: ", updatedBudget)
                onBudgetAdded(updatedBudget.data.data);

            } else {
                const newBudget = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/budgets`,
                    { userId: auth._id, name, amount, spent: 0, startDate, endDate, closed: false },
                    { withCredentials: true }
                );
                alert("Budget added successfully!");
                onBudgetAdded(newBudget.data.data);
            }

            setErrorMessage("");
            onClose();
        } catch (err) {
            console.error("Error saving budget:", err.response?.data);
            alert("Failed to save budget.");
        }
    };

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-content">
                <h2>{existingBudget ? "Edit" : "Add"} Budget</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="budgetName">Budget Name</label>
                        <input 
                            id="budgetName" 
                            type="text" 
                            placeholder="Enter budget name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="amount">Amount</label>
                        <input 
                            id="amount" 
                            type="number" 
                            min="1"
                            placeholder="Enter amount" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            disabled={existingBudget?.closed}
                            required 
                        />
                    </div>

                    <div>
                        <label htmlFor="startDate">Start Date</label>
                        <input 
                            id="startDate" 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            required 
                            disabled={existingBudget?.closed}
                        />
                    </div>

                    <div>
                        <label htmlFor="endDate">End Date</label>
                        <input 
                            id="endDate" 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            required 
                            disabled={existingBudget?.closed}
                        />
                    </div>

                    {errorMessage && <p className="error">{errorMessage}</p>}

                    <button type="submit">Save Budget</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </dialog>

    );
};

AddBudgetModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onBudgetAdded: PropTypes.func.isRequired,
    existingBudget: PropTypes.object
};

export default AddBudgetModal;
