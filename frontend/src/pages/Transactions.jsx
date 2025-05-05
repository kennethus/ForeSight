import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";
import axios from "axios";
import AuthContext from "../context/authProvider";
import AddTransactionModal from "../components/AddTransactionModal";
import AddMultipleTransactionsModal from "../components/Transactions/AddMultipleTransactionsModal";
import TransactionRow from "../components/Transactions/TransactionRow";
import Spinner from "../components/Spinner";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner size={100} color="blue" />
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {transactions.length > 0 ?
        <>
          {/* Pagination Controls */}
          <div className="flex justify-between mt-6 px-4 mb-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-transparent disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="px-2 py-2 text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-transparent disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="w-full">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction._id}
                  transaction={transaction}
                  onClick={() => navigate(`/transactions/${transaction._id}`)}
                />
              ))}
            </div>
          </div>
        </>
      : <div className="text-center mt-40 flex flex-col items-center">
          <div className="text-5xl mb-2">😴</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            It looks a bit empty here...
          </h3>
          <p className="text-gray-500 mb-4">
            Start by adding your first transaction!
          </p>

          {!isFabOpen && (
            <div>
              <div className="animate-bounce fixed bottom-25 right-24 text-blue-500 text-3xl mb-2">
                ↓
              </div>
              <p className="fixed bottom-22 right-10 text-sm text-gray-500">
                Add transaction here!
              </p>
            </div>
          )}
        </div>
      }

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
          className={`bg-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all`}
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
