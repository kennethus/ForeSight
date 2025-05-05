import PropTypes from "prop-types";
import { FaUtensils, FaCar, FaHome, FaBook, FaGamepad } from "react-icons/fa";

// Single unified purple style for all categories
const purpleStyle = {
  iconClass: "text-purple-600 text-2xl",
  borderClass: "border-purple-600",
};

const TransactionRow = ({ transaction, onClick }) => {
  const isExpense = transaction.type === "Expense";

  // Default to a purple icon and border for consistency
  const categoryIcons = {
    Living: <FaHome className={purpleStyle.iconClass} />,
    "Food and Dining": <FaUtensils className={purpleStyle.iconClass} />,
    Transportation: <FaCar className={purpleStyle.iconClass} />,
    Academic: <FaBook className={purpleStyle.iconClass} />,
    "Leisure and Entertainment": (
      <FaGamepad className={purpleStyle.iconClass} />
    ),
  };

  const categoryIcon = categoryIcons[transaction.category] || (
    <FaUtensils className={purpleStyle.iconClass} />
  );

  return (
    <div
      onClick={onClick}
      className={`flex flex-col sm:flex-row justify-between bg-white rounded-xl shadow-md border-2 transition-all cursor-pointer 
              hover:shadow-lg ${purpleStyle.borderClass} p-4 space-y-2 sm:space-y-0 sm:items-center`}
    >
      {/* Left Side */}
      <div className="flex items-start space-x-4 min-w-0">
        <span className="p-2 bg-gray-100 rounded-full shrink-0">
          {categoryIcon}
        </span>
        <div className="min-w-0">
          <p
            className="font-semibold text-gray-800 truncate"
            title={transaction.name}
          >
            {transaction.name.toUpperCase()}
          </p>
          <p className="text-gray-500 text-sm break-words line-clamp-2">
            {transaction.description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="text-right sm:ml-4">
        <p
          className={`font-bold text-lg ${isExpense ? "text-red-500" : "text-green-500"}`}
        >
          {isExpense ?
            `-₱${Math.abs(transaction.totalAmount)}`
          : `₱${transaction.totalAmount}`}
        </p>
        <p className="text-gray-500 text-sm">
          {new Date(transaction.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

// ✅ Add PropTypes validation
TransactionRow.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    totalAmount: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired, // Ensure date is passed as a string
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TransactionRow;
