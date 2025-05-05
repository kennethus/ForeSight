import PropTypes from "prop-types";

const BudgetRow = ({ budget, onClick }) => {
  const spent = budget.spent;
  const total = budget.amount + budget.earned;
  const remaining = total - spent;
  const spentPercentage = total > 0 ? Math.round((spent / total) * 100) : 0;

  // Styling based on budget status
  const isClosed = budget.closed;
  const borderColor =
    isClosed ?
      "border-gray-400" // Closed budgets = gray border
    : spentPercentage <= 50 ?
      "border-green-500" // Low spending = green
    : spentPercentage <= 80 ?
      "border-orange-500" // Medium spending = orange
    : "border-red-500"; // High spending = red

  const progressBarColor =
    isClosed ?
      "bg-gray-400" // Closed budgets = gray progress bar
    : spentPercentage <= 50 ? "bg-green-500"
    : spentPercentage <= 80 ? "bg-orange-500"
    : "bg-red-500";

  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50 ${borderColor}`}
    >
      {/* Budget Name & Amount */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <h3
          className={`text-lg font-semibold text-black truncate w-full sm:w-auto sm:max-w-xs ${isClosed ? "text-gray-500" : "text-black"}`}
          title={budget.name} // Optional: show full name on hover
        >
          {budget.name}
        </h3>
        <div className="text-right">
          <p
            className={`font-bold ${isClosed ? "text-gray-500" : "text-gray-900"}`}
          >
            ₱{total.toFixed(2).toLocaleString()}
          </p>
          {!isClosed && (
            <p
              className={`text-sm ${spentPercentage > 80 ? "text-red-600" : "text-gray-500"}`}
            >
              -{spentPercentage}%
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="flex justify-between items-center text-gray-600 font-semibold mb-1 text-sm">
        <span className="truncate max-w-[45%]">
          ₱{spent.toFixed(2).toLocaleString()}
        </span>
        <span className="truncate max-w-[45%] text-right">
          ₱{remaining.toFixed(2).toLocaleString()}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${progressBarColor}`}
          style={{ width: isClosed ? "100%" : `${spentPercentage}%` }}
        />
      </div>
    </div>
  );
};

// Props validation
BudgetRow.propTypes = {
  budget: PropTypes.shape({
    name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    earned: PropTypes.number.isRequired,
    spent: PropTypes.number.isRequired,
    closed: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default BudgetRow;
