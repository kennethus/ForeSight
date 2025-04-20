import { useEffect, useState } from "react";
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
import { format, subMonths, addMonths } from "date-fns";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

const ExpenseTrendChart = ({ monthlyTransactions, onMonthChange, loading }) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(currentDate);

  useEffect(() => {
    onMonthChange(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    if (
      selectedDate.getMonth() < currentDate.getMonth() ||
      selectedDate.getFullYear() < currentDate.getFullYear()
    ) {
      setSelectedDate((prev) => addMonths(prev, 1));
    }
  };

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dailyExpenses = {};
  monthlyTransactions?.forEach(({ date, totalAmount }) => {
    const day = new Date(date).getDate();
    dailyExpenses[day] = (dailyExpenses[day] || 0) + totalAmount;
  });

  const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
  const dataPoints = labels.map((_, i) => dailyExpenses[i + 1] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Daily Expenses – ${format(selectedDate, "MMMM yyyy")}`,
        data: dataPoints,
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const isCurrentMonth =
    selectedDate.getMonth() === currentDate.getMonth() &&
    selectedDate.getFullYear() === currentDate.getFullYear();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-3/4 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className={`p-2 rounded-full bg-transparent text-gray-800 hover:bg-gray-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <FaArrowLeft size={20} />
        </button>

        <h3 className="text-md font-semibold">
          {format(selectedDate, "MMMM yyyy")} Expense Trend
        </h3>

        <button
          onClick={handleNextMonth}
          className={`p-2 rounded-full bg-transparent ${
            isCurrentMonth ?
              "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-200 text-gray-800"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isCurrentMonth}
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      <div className="w-full h-64 flex items-center justify-center">
        {loading ?
          <p className="text-gray-500">Loading chart data...</p>
        : dataPoints.every((point) => point === 0) ?
          <p className="text-gray-500">No expenses recorded this month.</p>
        : <Line
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        }
      </div>
    </div>
  );
};

ExpenseTrendChart.propTypes = {
  monthlyTransactions: PropTypes.array.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ExpenseTrendChart;
