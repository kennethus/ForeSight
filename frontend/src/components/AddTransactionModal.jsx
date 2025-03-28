import { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../context/authProvider";

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded, existingTransaction }) => {
    const { auth } = useContext(AuthContext);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(existingTransaction?.name || "");
    const [description, setDescription] = useState(existingTransaction?.description || "");
    const [totalAmount, setTotalAmount] = useState(existingTransaction?.totalAmount || "");
    const [category, setCategory] = useState(existingTransaction?.category || "");
    const [type, setType] = useState(existingTransaction?.type || "Expense");
    const [date, setDate] = useState(existingTransaction ? new Date(existingTransaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    const [budgetAllocations, setBudgetAllocations] = useState([{ budgetId: "", amount: "" }]);
    const [errorMessage, setErrorMessage] = useState("");
    const modalRef = useRef(null);

    useEffect(() => {
        if (existingTransaction) {
            const fetchTransactionBudget = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transaction-budget/get-budgets`, {
                        params: { transactionId: existingTransaction._id },
                        withCredentials: true
                    });
    
                    if (response.data.success) {
                        console.log('RECEIVED LINKED BUDGETS: ', response.data.data)
                        setBudgetAllocations(response.data.data.length > 0
                            ? response.data.data.map((alloc) => ({
                                budgetId: alloc.budgetId._id,
                                amount: alloc.amount,
                                closed: alloc.budgetId.closed,
                            }))
                            : [{ budgetId: "", amount: "" }]
                        );
                    }

                    const budgets = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/`, {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    });

                    if (budgets.data.success) {
                        setBudgets(budgets.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching budgets:", err.response?.data);
                } finally {
                    setLoading(false);
                }
            };
    
            fetchTransactionBudget();
        } else {
            const fetchBudgets = async () => {
                try {
                    setLoading(true);    
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/budgets/openBudgets`, {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    });
    
                    if (response.data.success) {
                        setBudgets(response.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching budgets:", err.response?.data);
                } finally {
                    setLoading(false);
                }
            };
            fetchBudgets();
        }
        if (isOpen) {
            modalRef.current?.showModal();
        } else {
            modalRef.current?.close();
        }
    }, [existingTransaction, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const totalAllocated = budgetAllocations.reduce((sum, alloc) => sum + Number(alloc.amount || 0), 0);
        if (totalAllocated !== Number(totalAmount)) {
            setErrorMessage("Total allocated budget must match the transaction amount.");
            return;
        }

        try {
            if (existingTransaction) {
                const editedTransaction = await axios.patch(
                    `${import.meta.env.VITE_API_URL}/api/transactions/${existingTransaction._id}`,
                    { userId: auth._id, name, description, totalAmount, category, type, date, budgetAllocations },
                    { withCredentials: true }
                );
                alert("Transaction updated successfully!");
                onTransactionAdded(editedTransaction.data.data);
            } else {
                const newTransaction = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/transactions`,
                    { userId: auth._id, name, description, totalAmount, category, type, date, budgetAllocations },
                    { withCredentials: true }
                );
                alert("Transaction added successfully!");
                onTransactionAdded(newTransaction.data.data);
            }

            setErrorMessage("");
            onClose();
        } catch (err) {
            console.error("Error saving transaction:", err.response?.data);
            alert("Failed to save transaction.");
        }
    };

    const handleAddBudgetAllocation = () => {
        if (budgetAllocations.length < budgets.length) {
            setBudgetAllocations([...budgetAllocations, { budgetId: "", amount: "" }]);
        }
    };
    
    // Get selected budget IDs
    const selectedBudgets = budgetAllocations.map((alloc) => alloc.budgetId);
    const remainingOpenBudgets = budgets.filter(
        (budget) => !budget.closed && !selectedBudgets.includes(budget._id)
    );
    
    // Determine if the "Add Budget" button should be disabled
    const disableAddBudgetButton = existingTransaction
        ? (
            (budgetAllocations.length === 1 && budgetAllocations[0].closed && budgetAllocations[0].amount === totalAmount) || 
            (budgetAllocations.length === 2 && budgetAllocations.some(alloc => alloc.closed)) ||
            remainingOpenBudgets.length === 0
        )
        : budgetAllocations.length >= budgets.length;

    const handleBudgetChange = (index, key, value) => {
        const updatedAllocations = [...budgetAllocations];
        updatedAllocations[index][key] = value;
        setBudgetAllocations(updatedAllocations);
    };

    const handleDeleteBudgetAllocation = (index) => {
        if (budgetAllocations.length > 1) {
            setBudgetAllocations(budgetAllocations.filter((_, i) => i !== index));
        }
    };
    

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-content">
                <h2>{existingTransaction ? "Edit" : "Add"} Transaction</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    
                    <form onSubmit={handleSubmit}>
                        {errorMessage && <p className="error">{errorMessage}</p>}

                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <input type="number" placeholder="Total Amount" value={totalAmount} min="1" onChange={(e) => setTotalAmount(e.target.value)} required />
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            required 
                        />
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            <option value="Living">Living</option>
                            <option value="Food and Dining">Food and Dining</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Academic">Academic</option>
                            <option value="Leisure and Entertainment">Leisure and Entertainment</option>
                        </select>

                        <div>
                            <label>
                                <input type="radio" value="Expense" checked={type === "Expense"} onChange={() => setType("Expense")} /> Expense
                            </label>
                            <label>
                                <input type="radio" value="Income" checked={type === "Income"} onChange={() => setType("Income")} /> Income
                            </label>
                        </div>

                        <h3>Budget Allocations</h3>
                        {budgetAllocations.map((alloc, index) => (
                            <div key={alloc.budgetId+index} style={{ gap: "10px", alignItems: "center" }}>
                                {console.log(alloc)}
                                <select 
                                    value={alloc.budgetId} 
                                    onChange={(e) => handleBudgetChange(index, "budgetId", e.target.value)} 
                                    disabled={alloc.closed} 
                                    required
                                >
                                    <option value="">Select Budget</option>
                                    {budgets.map((budget) => (
                                        <option 
                                            key={budget._id} 
                                            value={budget._id} 
                                            disabled={budget.closed || selectedBudgets.includes(budget._id)}
                                        >
                                            {budget.name}
                                        </option>
                                    ))}
                                </select>

                                <input type="number" placeholder="Amount" value={alloc.amount} onChange={(e) => handleBudgetChange(index, "amount", e.target.value)} disabled={alloc.closed} required />
                                {budgetAllocations.length > 1 && (
                                    <button type="button" disabled={alloc.closed} onClick={() => handleDeleteBudgetAllocation(index)}>🗑️</button>
                                )}
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleAddBudgetAllocation} 
                            disabled={disableAddBudgetButton}
                        >
                            + Add Budget
                        </button>
                        <button type="submit">Save Transaction</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </form>
                )}
            </div>
        </dialog>
    );
};

AddTransactionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onTransactionAdded: PropTypes.func.isRequired,
    existingTransaction: PropTypes.object
};

export default AddTransactionModal;