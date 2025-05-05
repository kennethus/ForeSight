import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";
import CategoryChart from "../components/Dashboard/CategoryChart";
import ExpenseTrendChart from "../components/Dashboard/ExpenseTrendChart";
import TransactionRow from "../components/Transactions/TransactionRow";
import BudgetRow from "../components/Budgets/BudgetRow";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
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
          `${import.meta.env.VITE_API_URL}/api/transactions`,
          {
            params: {
              userId: auth._id,
              page: 1,
              limit: 10,
            },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          console.log(response.data.data);
          setTransactions(response.data.data.transactions);
        } else {
          setError("Failed to fetch transactions");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching transactions");
      } finally {
        setTransactionsLoading(false);
      }
    };

    const fetchBudgets = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/budgets/`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setBudgets(response.data.data);
        } else {
          setError("Failed to fetch budgets");
        }
      } catch (err) {
        console.error("Error fetching budgets:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load budgets");
      } finally {
        setBudgetLoading(false);
      }
    };

    fetchTransactions();
    fetchBudgets();
  }, [auth]);

  if (userLoading || transactionsLoading || budgetLoading)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spinner size={100} color="blue" />
      </div>
    );

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-900 mb-4">
        Hello, {user.name}!
      </h1>

      {auth?.name ?
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold text-gray-700 mb-2">
            Current Balance
          </p>
          <p className="text-4xl font-bold text-blue-900">₱{user.balance}</p>
        </div>
      : <p className="text-red-600">You are not logged in.</p>}

      {transactions.length > 0 ?
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
            <CategoryChart
              categoryBreakdown={breakdownData}
              onMonthChange={fetchBreakdown}
              loading={breakdownLoading}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg shadow-inner">
            <ExpenseTrendChart
              monthlyTransactions={expenseData}
              onMonthChange={fetchMonthlyExpenses}
              loading={expenseLoading}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto">
            <div className="bg-white shadow-md rounded-lg p-6 w-full mx-auto">
              <h3 className="text-md font-semibold">Recent Transactions</h3>
              <div className="w-full">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction._id}
                      transaction={transaction}
                      onClick={() =>
                        navigate(`/transactions/${transaction._id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg shadow-inner max-h-96 overflow-y-auto">
            <div className="bg-white shadow-md rounded-lg p-6 w-full mx-auto space-y-4">
              <h3 className="text-md font-semibold">Budgets</h3>
              {budgets
                .filter((budget) => !budget.closed)
                .map((budget) => (
                  <BudgetRow
                    key={budget._id}
                    budget={budget}
                    onClick={() => navigate(`/budgets/${budget._id}`)}
                  />
                ))}
            </div>
          </div>
        </div>
      : <div className="text-center mt-20 flex flex-col items-center">
          <div className="text-5xl mb-3">😪</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            It’s quiet in here...
          </p>
          <p className="text-gray-500 mb-4">
            Start by adding a transaction to see your dashboard in action!
          </p>
        </div>
      }
    </div>
  );
};

export default Dashboard;
