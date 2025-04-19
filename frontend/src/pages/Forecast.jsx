import { useState, useEffect, useContext } from "react";
import axios from "axios";
import FeatureModal from "../components/FeatureModal";
import AuthContext from "../context/authProvider";

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
          finalFeature.previous_forecast = predictionResult;
        }

        console.log("FINAL FEATURE: ", finalFeature);

        const prediction = await axios.post(
          `https://foresightrfmodel.onrender.com/predict`,
          finalFeature,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        const savePrediction = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/forecast/saveForest`,
          prediction.data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setPredictionResult(prediction.data);
        console.log(savePrediction);
      } else {
        setError("Failed to fetch user and transactions");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setError("Something went wrong during prediction.");
    }
  };

  return (
    <div>
      {loading && <p>Loading features...</p>}
      {error && <p className="error">{error}</p>}

      {predictionResult && (
        <div className="mt-4 p-4 border rounded shadow bg-white">
          <h3 className="text-xl font-semibold mb-2">Prediction Result</h3>
          <p>
            <strong>Exponential Smoothing Success:</strong>{" "}
            {predictionResult.es_success ? "Yes" : "No"}
          </p>
          <p>
            <strong>Predicted Total Expense:</strong> ₱
            {predictionResult.rf_total.toFixed(2)}
          </p>

          <h4 className="text-lg font-medium mt-3">
            Predicted Expenses by Category:
          </h4>
          <ul className="list-disc list-inside">
            {Object.entries(predictionResult.categories).map(
              ([category, amount]) => (
                <li key={category}>
                  {category.replace(/_/g, " ")}: ₱{amount.toFixed(2)}
                </li>
              )
            )}
          </ul>

          {predictionResult.combined_total && (
            <p className="mt-2 font-bold">
              Combined Total Forecast: ₱
              {predictionResult.combined_total.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {!loading &&
        (feature ?
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsAdding(false);
            }}
            className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            View Features
          </button>
        : <button
            onClick={() => {
              setIsModalOpen(true);
              setIsAdding(true);
            }}
            className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
          >
            Add Feature
          </button>)}

      <button onClick={predict}>Predict</button>

      {/* Feature Modal (Editing or Adding) */}
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
