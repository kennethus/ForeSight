import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
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

const BalanceTrendChart = ({ transactions }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const dailyBalances = {};
  filteredTransactions.forEach(({ date, balance }) => {
    const day = new Date(date).getDate();
    dailyBalances[day] = balance;
  });

  const sortedDays = Object.keys(dailyBalances)
    .map(Number)
    .sort((a, b) => a - b);
  const labels = sortedDays.map((day) => `Day ${day}`);
  const dataPoints = sortedDays.map((day) => dailyBalances[day]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Balance Trend",
        data: dataPoints,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-3/4 mx-auto">
      <h3 className="text-md font-semibold mb-3">
        Balance Trend (Current Month)
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

BalanceTrendChart.propTypes = {
  transactions: PropTypes.array.isRequired,
};

export default BalanceTrendChart;
