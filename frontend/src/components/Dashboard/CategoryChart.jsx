import { Doughnut } from "react-chartjs-2";
import PropTypes from "prop-types";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ categoryBreakdown }) => {
  const chartData = {
    labels: Object.keys(categoryBreakdown),
    datasets: [
      {
        label: "Spent",
        data: Object.values(categoryBreakdown),
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
    <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-3/4 mx-auto">
      <h3 className="text-md font-semibold mb-3">Spending Breakdown</h3>
      <div className="w-full h-64">
        <Doughnut
          data={chartData}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
};

CategoryChart.propTypes = {
  categoryBreakdown: PropTypes.object.isRequired,
};

export default CategoryChart;
