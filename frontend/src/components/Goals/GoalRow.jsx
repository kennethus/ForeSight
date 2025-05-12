import PropTypes from "prop-types";

const GoalRow = ({ goal, onClick }) => {
  const saved = goal.currentAmount;
  const target = goal.targetAmount;
  const savedPercentage = target > 0 ? Math.round((saved / target) * 100) : 0;
  const remaining = target - saved;

  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50 ${
        savedPercentage >= 100 ? "border-green-500" : "border-blue-500"
      }`}
    >
      {/* Goal Name & Target Amount */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-black">{goal.name}</h3>
        <div className="text-right">
          <p className="font-bold text-gray-900">₱{target.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{savedPercentage}%</p>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="flex justify-between items-center text-gray-600 font-semibold mb-1">
        <span>₱{saved.toLocaleString()}</span>
        <span>₱{remaining.toLocaleString()}</span>
      </div>
      <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${savedPercentage >= 100 ? "bg-green-500" : "bg-blue-500"} transition-all`}
          style={{ width: `${savedPercentage}%` }}
        />
      </div>
    </div>
  );
};

GoalRow.propTypes = {
  goal: PropTypes.shape({
    name: PropTypes.string.isRequired,
    targetAmount: PropTypes.number.isRequired,
    currentAmount: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default GoalRow;
