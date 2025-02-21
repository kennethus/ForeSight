import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/authProvider";
import axios from "axios";

const TransactionDetails = () => {
    const { auth } = useContext(AuthContext);
    const { id } = useParams(); // Get transaction ID from URL
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });
                console.log("Transaction Details Response:", response.data);

                if (response.data.success) {
                    setTransaction(response.data.data);
                } else {
                    setError("Transaction not found");
                }
            } catch (err) {
                console.error("Error fetching transaction:", err.response?.data);
                setError("Error fetching transaction details");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [id]);

    if (loading) return <p>Loading transaction details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Transaction Details</h2>
            <p><strong>Name:</strong> {transaction.name}</p>
            <p><strong>Total Amount:</strong> {transaction.totalAmount}</p>
            <p><strong>Category Amount:</strong> {transaction.category}</p>
            <p><strong>Date:</strong> {new Date(transaction.date).toLocaleString()}</p>
            <p><strong>Type:</strong> {transaction.type}</p>
            <p><strong>Description:</strong> {transaction.description}</p>

            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default TransactionDetails;
