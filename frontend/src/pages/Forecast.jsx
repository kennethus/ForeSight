import { useState, useEffect, useContext } from "react";
import axios from "axios";
import FeatureModal from "../components/FeatureModal";
import AuthContext from "../context/authProvider";
import Spinner from "../components/Spinner";

function classifyAgeGroup(age) {
  if (age < 18) {
    return "Under 18";
  } else if (age >= 18 && age <= 20) {
    return "18-20";
  } else if (age >= 21 && age <= 23) {
    return "21-23";
  } else if (age >= 24 && age <= 26) {
    return "24-26";
  } else {
    return "27 and above";
  }
}

function transformJSON(obj) {
  if (Array.isArray(obj)) {
    return obj.map(transformJSON);
  }

  if (obj !== null && typeof obj === "object") {
    const transformed = {};
    for (const key in obj) {
      transformed[key] = transformJSON(obj[key]);
    }
    return transformed;
  }

  if (typeof obj === "boolean") {
    return obj ? "Yes" : "No";
  }

  if (typeof obj === "number") {
    return obj.toString();
  }

  return obj; // Leave other types (like strings) as is
}

function mapUserJsonToModelInput(userJson) {
  return {
    Age_Group: userJson.Age_Group,
    Sex: userJson.Sex,
    Year_Level: userJson.yearLevel,
    In_relationship: userJson.inRelationship,
    Personality: userJson.personality,
    Home_Region: userJson.homeRegion,
    Living_Situation: userJson.livingSituation,
    Dorm_Area: userJson.dormArea,
    Roommates: userJson.numberOfRoommates,
    Degree_Program: userJson.degreeProgram,
    In_Organization: userJson.haveOrganization,
    Hours_of_Study_per_Week: userJson.studyHoursPerWeek,
    Monthly_Allowance: userJson.monthlyAllowance,
    Family_Monthly_Income: userJson.familyMonthlyIncome,
    Have_Scholarship: userJson.hasScholarship,
    Have_Job: userJson.hasJobOrBusiness,
    Meal_Preferences: userJson.mealPreferences,
    Frequency_of_Going_Home: userJson.frequencyGoingHomePerSemester,
    Have_Health_Concern: userJson.hasHealthConcerns,
    Preferred_Payment_Method: userJson.preferredPaymentMethod,
  };
}

export const Forecast = () => {
  const [feature, setFeature] = useState(null);
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [dateOfForecast, setDateOfForecast] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [budgetCreateLoading, setBudgetCreateLoading] = useState(false);

  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/features/`,
          {
            withCredentials: true,
          }
        );

        const previousForecastRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/forecast/getPreviousForecast`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setFeature(response.data.data);
        }
        if (previousForecastRes.data.success) {
          setPredictionResult(previousForecastRes.data.data);

          const esPrediction = previousForecastRes.data.data?.es_prediction;
          if (esPrediction?.dates?.length > 0) {
            const date = new Date(esPrediction.dates[0]);
            setDateOfForecast(date);
          } else {
            console.warn("es_prediction or dates is missing in the response");
          }
        }
      } catch (err) {
        console.error("Error fetching feature:", err.response?.data);
        setError("Error fetching feature:", err.response?.data);
        setFeature(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, []);

  const predict = async () => {
    setError("");
    setPredictLoading(true);
    try {
      const userRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${auth._id}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const transactionsRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/transactions/previous`,
        {
          params: { userId: auth._id },
          withCredentials: true,
        }
      );

      if (userRes.data.success) {
        const userDetails = {
          Age_Group: classifyAgeGroup(userRes.data.data.age),
          Sex: userRes.data.data.sex,
        };

        const combinedFeature = { ...userDetails, ...feature };

        const finalUserFeature = mapUserJsonToModelInput(
          transformJSON(combinedFeature)
        );
        let finalFeature = {
          user_data: finalUserFeature,
        };

        // ✅ Optionally add transactions if they exist
        if (
          transactionsRes.data?.success &&
          Array.isArray(transactionsRes.data.data) &&
          transactionsRes.data.data.length > 0
        ) {
          finalFeature.transactions = transactionsRes.data.data;
        }

        // ✅ Optionally add previous forecast if it exists
        if (predictionResult) {
          finalFeature.previous_forecast = {
            userId: predictionResult.userId,
            forecasted: predictionResult.es_prediction.forecast,
            dates: predictionResult.es_prediction.dates,
            category: {
              living_expenses: predictionResult.categories.Living_Expenses,
              food_and_dining_expenses:
                predictionResult.categories.Food_and_Dining_Expenses,
              transportation_expenses:
                predictionResult.categories.Transportation_Expenses,
              academic_expenses: predictionResult.categories.Academic_Expenses,
              leisure_and_entertainment_expenses:
                predictionResult.categories.Leisure_and_Entertainment_Expenses,
            },
          };
        }

        console.log("FINAL FEATURE: ", finalFeature);

        const prediction = await axios.post(
          `${import.meta.env.VITE_RF_URL}/predict`,
          finalFeature,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        console.log(prediction);

        const savePrediction = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/forecast/saveForest`,
          prediction.data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setPredictionResult(savePrediction.data.data);

        const date = new Date(savePrediction.data.data.es_prediction.dates[0]);
        setDateOfForecast(date);
        console.log(savePrediction.data.data);
        setPredictLoading(false);
      } else {
        setError("Failed to fetch user and transactions");
        setPredictLoading(false);
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setError("Something went wrong during prediction.");
      setPredictLoading(false);
    }
  };

  const createBudgets = async () => {
    setBudgetCreateLoading(true);
    setError("");
    try {
      const predictedBudgets = predictionResult.categories;
      const startDate = new Date(dateOfForecast);

      // Move to the next month, then subtract one day
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );

      const budgets = Object.entries(predictedBudgets).map(
        ([name, amount]) => ({
          userId: predictionResult.userId,
          name,
          amount,
          spent: 0,
          earned: 0,
          startDate,
          endDate,
          closed: false,
        })
      );

      console.log("SENDING BUDGET:", budgets);

      const createdBudgets = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/budgets/createMultiple`,
        { budgets },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (createdBudgets.data.success) {
        alert("Successfully created budgets!");
        console.log(createdBudgets.data.data);
      }
      setBudgetCreateLoading(false);
    } catch (error) {
      console.error("Budget creation error:", error);
      setError("Something went wrong during creation of budget.");
      setBudgetCreateLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Loading/Error States */}
      {loading && (
        <div className="flex items-center justify-center h-screen w-full">
          <Spinner size={100} color="blue" />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      )}

      {/* Prediction Result */}
      {predictionResult ?
        <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2a4 4 0 014-4h6m0 0l-2.293-2.293a1 1 0 011.414-1.414L21 10l-2.879 2.879a1 1 0 01-1.414-1.414L19 11h-6a2 2 0 00-2 2v2"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-800">
              Prediction Summary for{" "}
              {dateOfForecast?.toLocaleString("en-US", { month: "long" })}
            </h3>
          </div>

          {/* Predicted Total */}
          <div className="text-center mt-4">
            <p className="text-xl font-medium text-gray-700">
              Predicted Total Expense
            </p>
            <p className="text-2xl text-blue-600 font-bold mt-1">
              ₱
              {predictionResult.prediction_exceed ?
                Object.values(predictionResult.categories)
                  .reduce((sum, value) => sum + value, 0)
                  .toFixed(2)
              : (
                  predictionResult.combined_total ?? predictionResult.rf_total
                ).toFixed(2)
              }
            </p>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">
              Breakdown by Category
            </h4>
            <ul className="flex flex-col gap-2 text-gray-800">
              {Object.entries(predictionResult.categories).map(
                ([category, amount]) => (
                  <li
                    key={category}
                    className="bg-gray-50 rounded-md px-4 py-2 border border-gray-200"
                  >
                    <span className="font-semibold">
                      {category
                        .replace(/_/g, " ")
                        .replace(/Expenses/i, " Expenses")}
                      :
                    </span>{" "}
                    ₱{amount.toFixed(2)}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Budget Warning */}
          {predictionResult.prediction_exceed && (
            <div className="text-red-700 bg-red-50 px-4 py-2 rounded-md border border-red-200 text-sm">
              ⚠️ Your predicted expenses for this month exceeded your suggested
              budget (
              {predictionResult.combined_total ?
                <span className="font-semibold">
                  ₱{predictionResult.combined_total.toFixed(2)}
                </span>
              : <span className="font-semibold">
                  ₱{predictionResult.rf_total.toFixed(2)}
                </span>
              }
              ). We’ve adjusted it to help you stay on track.
            </div>
          )}

          {/* Budget Creation Prompt */}
          <div className="flex justify-center mt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Would you like to create budgets from these predictions?
              </p>
              <button
                onClick={createBudgets}
                disabled={budgetCreateLoading}
                className="bg-green-500 text-white px-6 py-2 rounded-md shadow hover:bg-green-600 transition items-center justify-center gap-2 min-w-[160px]"
              >
                {budgetCreateLoading ? "Loading..." : "Create Budgets"}
              </button>
            </div>
          </div>

          {/* Explanation + Adjustment */}
          {predictionResult?.es_success ?
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm space-y-4">
              <h4 className="text-xl font-semibold text-gray-800">
                How We Predicted Your Budget
              </h4>
              <p className="text-gray-700">
                This budget suggestion is based on your socio-demographic
                information and your spending habits over the past 3 months.
              </p>

              {/* R²-based Insight */}
              {predictionResult.es_prediction.metrics.r2 > 0.5 ?
                <div className="text-green-700 bg-green-50 px-4 py-2 rounded-md border border-green-200 text-sm">
                  ✅ Your actual spending last month was close to what we
                  predicted, so we trusted your past transactions more when
                  creating this month’s budget.
                  <span className="ml-2 inline-block relative group align-middle">
                    <svg
                      className="w-4 h-4 text-gray-500 cursor-pointer inline"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                      />
                    </svg>
                    <div className="absolute hidden group-hover:block w-64 text-xs text-white bg-gray-800 p-2 rounded shadow-lg top-6 left-1/2 -translate-x-1/2 z-10">
                      Your spending was close to our prediction by{" "}
                      <span className="font-semibold">
                        {(
                          predictionResult.es_prediction.metrics.r2 * 100
                        ).toFixed(0)}
                        %
                      </span>
                      <br />A higher percentage means your actual spending
                      closely matched our forecast.
                    </div>
                  </span>
                </div>
              : <div className="text-yellow-700 bg-yellow-50 px-4 py-2 rounded-md border border-yellow-200 text-sm">
                  ⚠️ Your actual spending last month was quite different from
                  what we predicted, so we relied more on your profile details
                  to estimate this month’s budget.
                  <span className="ml-2 inline-block relative group align-middle">
                    <svg
                      className="w-4 h-4 text-gray-500 cursor-pointer inline"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                      />
                    </svg>
                    <div className="absolute hidden group-hover:block w-64 text-xs text-white bg-gray-800 p-2 rounded shadow-lg top-6 left-1/2 -translate-x-1/2 z-10">
                      Your spending was close to our prediction by{" "}
                      <span className="font-semibold">
                        {(
                          predictionResult.es_prediction.metrics.r2 * 100
                        ).toFixed(0)}
                        %
                      </span>
                      <br />A lower percentage means your actual expenses were
                      far from what we forecasted.
                    </div>
                  </span>
                </div>
              }

              {/* Adjustment Info */}
              {predictionResult.adjustment_info &&
                Object.keys(predictionResult.adjustment_info).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                      Why Your Budget Changed
                    </h4>
                    <div className="flex flex-col gap-4">
                      {Object.entries(predictionResult.adjustment_info).map(
                        ([category, message]) => (
                          <div
                            key={category}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                          >
                            <h5 className="text-lg font-semibold text-blue-700 mb-1">
                              {category
                                .replace(/_/g, " ")
                                .replace(/Expenses/i, " Expenses")}
                            </h5>
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                              {message}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          : <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <p className="text-gray-700">
                Your budget suggestion is based on your demographic information
                for now. To make it more accurate, please add at least 3 months
                of transaction data to include your spending habits in the
                prediction.
              </p>
            </div>
          }
        </div>
      : <div className="text-center text-gray-500">
          {!feature ?
            <p>
              Add your socio-demographic information so I can suggest a budget
              for you!
            </p>
          : <p>No budget suggestion yet.</p>}
        </div>
      }

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {feature && (
          <button
            onClick={predict}
            disabled={predictLoading}
            className="bg-green-500 text-white px-6 py-2 rounded-md shadow hover:bg-green-600 transition flex items-center justify-center gap-2 min-w-[160px]"
          >
            {predictLoading && <Spinner />}
            {predictLoading ? "Loading..." : "Suggest Budget"}
          </button>
        )}

        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsAdding(!feature);
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-blue-600 transition"
        >
          {feature ? "View My Information" : "Add My Information"}
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FeatureModal
          isOpen={isModalOpen}
          onClose={(updatedFeature) => {
            if (updatedFeature) setFeature(updatedFeature);
            setIsModalOpen(false);
          }}
          feature={isAdding ? null : feature}
        />
      )}
    </div>
  );
};
