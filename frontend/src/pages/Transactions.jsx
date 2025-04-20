import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddTransactionModal from "../components/AddTransactionModal";
import AddMultipleTransactionsModal from "../components/Transactions/AddMultipleTransactionsModal";
import TransactionRow from "../components/Transactions/TransactionRow";

const Transactions = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10); // items per page
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [mode, setMode] = useState("single");

  const fetchTransactions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions`,
        {
          params: {
            userId: auth._id,
            page: pageNumber,
            limit,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setTotalPages(response.data.data.totalPages);
        setPage(response.data.data.currentPage);
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

  const addTransaction = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const addBulkTransactions = (newTransactions) => {
    setTransactions((prev) => [...prev, ...newTransactions]);
  };

  useEffect(() => {
    if (!auth) navigate("/");
  }, [auth, navigate]);

  useEffect(() => {
    if (auth) {
      fetchTransactions(page);
    }
  }, [auth, page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {transactions.length > 0 ?
        <>
          <table className="w-full">
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

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-500 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      : <h3>You have no transactions now. Add one!</h3>}

      {/* Modals */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={addTransaction}
        mode={mode}
      />
      <AddMultipleTransactionsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkAdded={addBulkTransactions}
      />

      {/* FAB menu */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2">
        {isFabOpen && (
          <>
            <button
              onClick={() => {
                setMode("single");
                setIsModalOpen(true);
                setIsFabOpen(false);
              }}
              className="bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600"
            >
              + Single Transaction
            </button>
            <button
              onClick={() => {
                setIsBulkModalOpen(true);
                setIsFabOpen(false);
              }}
              className="bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600"
            >
              + Multiple Transactions
            </button>
          </>
        )}
        <button
          onClick={() => setIsFabOpen((prev) => !prev)}
          className="bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          {isFabOpen ?
            <FaAngleDown />
          : "+ Add Transaction"}
        </button>
      </div>
    </div>
  );
};

export default Transactions;
