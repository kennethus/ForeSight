import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { format, subMonths, addMonths } from "date-fns";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

Chart.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ categoryBreakdown, onMonthChange, loading }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    onMonthChange(selectedDate);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const labels = Object.keys(categoryBreakdown || {});
  const dataValues = Object.values(categoryBreakdown || {});

  // const total = dataValues.reduce((acc, val) => acc + val, 0); // Optional: can be shown elsewhere too

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spent",
        data: dataValues,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
          "#FF9800",
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full mx-auto">
      <div className="flex items-center justify-between mb-3">
        <button
          className={`p-2 rounded-full bg-transparent text-gray-800 hover:bg-gray-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handlePrevMonth}
          disabled={loading}
        >
          <FaArrowLeft size={20} />
        </button>
        <h3 className="text-md font-semibold">
          Spending Breakdown – {format(selectedDate, "MMMM yyyy")}
        </h3>
        <button
          onClick={handleNextMonth}
          className={`p-2 rounded-full bg-transparent ${
            loading ?
              "text-gray-400 cursor-not-allowed"
            : "hover:bg-gray-200 text-gray-800"
          }`}
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      <div className="w-full h-64 flex items-center justify-center">
        {loading ?
          <p className="text-gray-500">Loading chart data...</p>
        : dataValues.length === 0 || dataValues.every((v) => v === 0) ?
          <p className="text-gray-500">No spending data for this month.</p>
        : <Doughnut
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        }
      </div>
    </div>
  );
};

CategoryChart.propTypes = {
  categoryBreakdown: PropTypes.object.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CategoryChart;
