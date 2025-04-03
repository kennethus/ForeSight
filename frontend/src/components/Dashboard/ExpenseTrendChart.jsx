import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

// Register chart components
Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

const ExpenseTrendChart = ({ transactions }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter transactions for the current month
  const filteredTransactions = transactions.filter(({ date }) => {
    const transactionDate = new Date(date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  // Aggregate total expenses per day
  const dailyExpenses = {};
  filteredTransactions.forEach(({ date, totalAmount }) => {
    const day = new Date(date).getDate();
    dailyExpenses[day] = (dailyExpenses[day] || 0) + totalAmount;
  });

  // Generate labels and data for the entire month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
  const dataPoints = labels.map((_, i) => dailyExpenses[i + 1] || 0); // Default to 0 if no expense

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Expenses (₱)",
        data: dataPoints,
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-3/4 mx-auto">
      <h3 className="text-md font-semibold mb-3">
        Expense Trend (Current Month)
      </h3>
      <div className="w-full h-64">
        <Line
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

ExpenseTrendChart.propTypes = {
  transactions: PropTypes.array.isRequired,
};

export default ExpenseTrendChart;
