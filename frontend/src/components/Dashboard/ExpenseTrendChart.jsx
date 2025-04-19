import { useState } from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
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
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const currentYear = currentDate.getFullYear();

  // Function to get month name
  const getMonthName = (month) =>
    new Date(currentYear, month).toLocaleString("default", { month: "long" });

  // Function to navigate months
  const changeMonth = (direction) => {
    setSelectedMonth((prevMonth) => {
      let newMonth = prevMonth + direction;
      return newMonth >= 0 && newMonth <= currentDate.getMonth() ?
          newMonth
        : prevMonth;
    });
  };

  // Get transactions for the selected month
  const filteredTransactions = transactions.filter(({ date }) => {
    const transactionDate = new Date(date);
    return (
      transactionDate.getMonth() === selectedMonth &&
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
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
  const dataPoints = labels.map((_, i) => dailyExpenses[i + 1] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Daily Expenses (${getMonthName(selectedMonth)})`,
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
      <div className="flex justify-between items-center mb-4">
        {/* Previous Month Button (Left Arrow) */}
        <button
          onClick={() => changeMonth(-1)}
          className={`p-2 rounded-full bg-transparent ${
            selectedMonth === 0 ?
              "text-gray-400 cursor-not-allowed"
            : "text-gray-800 hover:bg-gray-200"
          }`}
          disabled={selectedMonth === 0}
        >
          <FaArrowLeft size={20} />
        </button>

        {/* Month Label */}
        <h3 className="text-md font-semibold">
          {getMonthName(selectedMonth)} Expense Trend
        </h3>

        {/* Next Month Button (Right Arrow) */}
        <button
          onClick={() => changeMonth(1)}
          className={`p-2 rounded-full bg-transparent ${
            selectedMonth === currentDate.getMonth() ?
              "text-gray-400 cursor-not-allowed"
            : "text-gray-800 hover:bg-gray-200"
          }`}
          disabled={selectedMonth === currentDate.getMonth()}
        >
          <FaArrowRight size={20} />
        </button>
      </div>

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
