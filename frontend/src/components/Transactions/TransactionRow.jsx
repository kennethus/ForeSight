import PropTypes from "prop-types";
import { FaUtensils, FaCar, FaHome, FaBook, FaGamepad } from "react-icons/fa";

// Single unified purple style for all categories
const purpleStyle = { iconClass: "text-purple-600 text-2xl", borderClass: "border-purple-600" };

const TransactionRow = ({ transaction, onClick }) => {
    const isExpense = transaction.type === "Expense";

    // Default to a purple icon and border for consistency
    const categoryIcons = {
        "Living": <FaHome className={purpleStyle.iconClass} />,
        "Food and Dining": <FaUtensils className={purpleStyle.iconClass} />,
        "Transportation": <FaCar className={purpleStyle.iconClass} />,
        "Academic": <FaBook className={purpleStyle.iconClass} />,
        "Leisure and Entertainment": <FaGamepad className={purpleStyle.iconClass} />,
    };

    const categoryIcon = categoryIcons[transaction.category] || <FaUtensils className={purpleStyle.iconClass} />;

    return (
        <tr
            onClick={onClick}
            className={`flex items-center justify-between bg-white rounded-xl shadow-md border-2 transition-all cursor-pointer 
                        hover:shadow-lg ${purpleStyle.borderClass}`}
                        
        >
            {/* Left Side: Icon & Name */}
            <td className="flex items-center space-x-4 p-4">
                {/* Category Icon */}
                <span className="p-2 bg-gray-100 rounded-full">
                    {categoryIcon}
                </span>

                {/* Name & Description */}
                <div>
                    <p className="font-semibold text-gray-800">{transaction.name.toUpperCase()}</p>
                    <p className="text-gray-500 text-sm">{transaction.description}</p>
                </div>
            </td>

            {/* Right Side: Amount & Date */}
            <td className="text-right p-4">
                <p className={`font-bold text-lg ${isExpense ? "text-red-500" : "text-green-500"}`}>
                    {isExpense ? `-₱${Math.abs(transaction.totalAmount)}` : `₱${transaction.totalAmount}`}
                </p>
                <p className="text-gray-500 text-sm">
                    {new Date(transaction.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
            </td>
        </tr>
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
        date: PropTypes.string.isRequired,  // Ensure date is passed as a string
    }).isRequired,
    onClick: PropTypes.func.isRequired,
};

export default TransactionRow;
