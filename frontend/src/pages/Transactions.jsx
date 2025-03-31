import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionRow from "../components/Transactions/TransactionRow";

const Transactions = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Update Transaction without refreshing page
  const addTransaction = async (newTransaction) => {
    setTransactions((prevTransactions) => [
      newTransaction,
      ...prevTransactions,
    ]);
  };

  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/transactions/`,
          {
            params: { userId: auth._id },
            withCredentials: true,
          }
        );

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
      {transactions.length > 0 ?
        <table>
          <tbody className="space-y-4">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                onClick={() => navigate(`/transactions/${transaction._id}`)}
              />
            ))}
          </tbody>
        </table>
      : <h3>You have no transactions now. Add one!</h3>}
      <div className="fixed items-center justify-center">
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransactionAdded={addTransaction}
        />
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full hover:bg-blue-700"
      >
        + Add Transaction
      </button>
    </div>
  );
};

export default Transactions;
