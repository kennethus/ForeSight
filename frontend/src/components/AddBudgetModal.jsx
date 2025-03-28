import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const AddBudgetModal = ({ isOpen, onClose, onBudgetAdded, existingBudget }) => {
    const { auth } = useContext(AuthContext);
    const modalRef = useRef(null);

    const [othersBudget, setOthersBudget] = useState(null)
    const [name, setName] = useState(existingBudget?.name || "");
    const [amount, setAmount] = useState(existingBudget?.amount || "");
    const [startDate, setStartDate] = useState(existingBudget ? new Date(existingBudget.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(existingBudget ? new Date(existingBudget.endDate).toISOString().split("T")[0] : "");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchOthersBudget = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/budgets/getByName/Others`,
                    { withCredentials: true }
                );
    
                if (response.data.success) {
                    setOthersBudget(response.data.data);
                }
            } catch (err) {
                console.error("Error fetching budget:", err.response?.data || err.message);
                setErrorMessage(err.response?.data?.message || "Failed to fetch budget");
            } finally {
                setIsLoading(false)
            }
        };
    
        fetchOthersBudget();
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            if (existingBudget) {
                if (amount < existingBudget.spent){
                    setErrorMessage("Cannot set budget amount less than spent")
                    return
                }
                console.log((othersBudget.amount + othersBudget.earned - othersBudget.spent) + (existingBudget.amount + existingBudget.earned - existingBudget.spent))
                if (amount > (othersBudget.amount + othersBudget.earned - othersBudget.spent) + (existingBudget.amount + existingBudget.earned - existingBudget.spent)){
                    setErrorMessage("Not enough balance!")
                    return
                }
                const updatedBudget = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/budgets/${existingBudget._id}`,
                    { userId: auth._id, name, amount, startDate, endDate },
                    { withCredentials: true }
                );

                if (updatedBudget.data.success){
                    const changedAmount = existingBudget.amount - amount
                    const updateOthersResponse = await axios.patch(
                        `${import.meta.env.VITE_API_URL}/api/budgets/updateAmount/${othersBudget._id}`,
                        { amount: changedAmount },
                        { withCredentials: true }
                    );
                    if (updateOthersResponse.data.success) {
                        alert("Budget updated successfully!");
                        console.log("SENDING UPDATED BUDGET: ", updatedBudget)
                        onBudgetAdded(updatedBudget.data.data);
                    } else {
                        alert("Failed to update 'Others' budget.");
                    }
        
                } else {
                    alert("Failed to update budget.");
                }

            } else {
                if (amount > (othersBudget.amount + othersBudget.earned - othersBudget.spent)){
                    setErrorMessage("Not enough balance!")
                    return
                }
                const newBudget = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/budgets`,
                    { userId: auth._id, name, amount, spent: 0, earned: 0, startDate, endDate, closed: false },
                    { withCredentials: true }
                );
                if (newBudget.data.success){
                    alert("Budget added successfully!");
                    onBudgetAdded(newBudget.data.data);
                } else {
                    alert("Failed to create Budget")
                }
                
            }

            setErrorMessage("");
            onClose();
        } catch (err) {
            console.error("Error saving budget:", err.response?.data.message);
            setErrorMessage(err.response.data.message)
            // alert("Failed to save budget.");
        }
    };

    

    return (
        <dialog ref={modalRef} className="modal">
           {isLoading ? (<p> Loading...</p>) : 
           (
            <div className="modal-content">
                <h2>{existingBudget ? "Edit" : "Add"} Budget</h2>
                {!existingBudget && <h4>You can allocate at most {othersBudget.amount + othersBudget.earned - othersBudget.spent} for this budget</h4>
            }
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

           )} 
            
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
