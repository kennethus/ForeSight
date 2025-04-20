import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import CategoryChart from "../components/Dashboard/CategoryChart";
import ExpenseTrendChart from "../components/Dashboard/ExpenseTrendChart";

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdownData, setBreakdownData] = useState({});
  const [expenseData, setExpenseData] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(true);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const fetchBreakdown = async (monthDate) => {
    setBreakdownLoading(true);
    try {
      const month = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions/breakdown?month=${month}&year=${year}`,
        { withCredentials: true }
      );

      setBreakdownData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch breakdown:", err);
      setBreakdownData({});
    } finally {
      setBreakdownLoading(false);
    }
  };

  const fetchMonthlyExpenses = async (monthDate) => {
    setExpenseLoading(true); // ✅ Set loading true
    try {
      const month = monthDate.getMonth() + 1;
      const year = monthDate.getFullYear();

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions/monthlyExpenses?month=${month}&year=${year}`,
        { withCredentials: true }
      );

      setExpenseData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch monthly expenses:", err);
      setExpenseData([]); // fallback to empty data
    } finally {
      setExpenseLoading(false); // ✅ Done loading
    }
  };

  useEffect(() => {
    if (!auth) navigate("/");
  }, [auth, navigate]);

  useEffect(() => {
    fetchBreakdown(new Date());
    fetchMonthlyExpenses(new Date());
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth) return navigate("/");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${auth._id}`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [auth, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/transactions/expense`,
          { params: { userId: auth._id }, withCredentials: true }
        );
        if (response.data.success) {
          setTransactions(response.data.data);
        } else {
          setError("Failed to fetch transactions");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching transactions");
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, [auth]);

  if (userLoading || transactionsLoading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Hello {user.name}!</h1>
      {auth?.name ?
        <div className="mb-6">
          <p className="text-lg">
            Current balance:{" "}
            <span className="font-semibold">₱{user.balance}</span>
          </p>
        </div>
      : <p>You are not logged in.</p>}

      {transactions.length > 0 ?
        <div className="flex flex-col items-center gap-6">
          <CategoryChart
            categoryBreakdown={breakdownData}
            onMonthChange={fetchBreakdown}
            loading={breakdownLoading}
          />
          <ExpenseTrendChart
            monthlyTransactions={expenseData}
            onMonthChange={fetchMonthlyExpenses}
            loading={expenseLoading}
          />
        </div>
      : <p className="text-gray-500 mt-4">
          No transactions available to display.
        </p>
      }
    </div>
  );
};

export default Dashboard;
