import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const Transactions = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    const userId = auth._id;
    console.log("Sending User ID: ", userId);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/`, {
                    params: { userId },
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                console.log("Response:", response.data);

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
    }, [userId]);

    if (loading) return <p>Loading transactions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Total Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                        <tr
                            key={transaction._id}
                            onClick={() => navigate(`/transactions/${transaction._id}`)}
                            style={{ 
                                cursor: "pointer", 
                                backgroundColor: "#1E3A8A", // Dark Blue
                                color: "white" // Ensures text remains readable
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3B5998")} // Lighter blue on hover
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")} // Reset to dark blue
                        >
                            <td>{transaction.category}</td><td>{transaction.description}</td>
                            <td>{transaction.totalAmount}</td><td>{new Date(transaction.date).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">No transactions found</td>
                    </tr>
                )}


                </tbody>
            </table>
        </div>
    );
};

export default Transactions;
