import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddTransactionModal from "../components/AddTransactionModal";

const Transactions = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    //Update Transaction without refreshing page
    const addTransaction = async (newTransaction) => {
        setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
    }

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/`, {
                    params: { userId: auth._id },
                    withCredentials: true,
                });
    
                if (response.data.success) {
                    setTransactions(response.data.data);
                } else {
                    setError("Failed to fetch transactions");
                }
            } catch (err) {
                console.error("Error fetching transactions:", err.response?.data);
                setError(err.response?.data?.message || "Login failed");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [auth._id]);

    if (loading) return <p>Loading transactions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Transactions</h2>
            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onTransactionAdded={addTransaction} 
            />

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <tr key={transaction._id} onClick={() => navigate(`/transactions/${transaction._id}`)}>
                                <td>{transaction.name}</td>
                                <td>{transaction.category}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.totalAmount}</td>
                                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No transactions found</td></tr>
                    )}
                </tbody>
            </table>

            <button onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>

        </div>
    );
};

export default Transactions;
