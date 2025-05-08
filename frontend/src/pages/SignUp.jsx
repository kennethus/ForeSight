import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import AuthContext from "../context/authProvider";
import axios from "../api/axios";

const SignUp = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    age: "",
    sex: "Male",
    balance: 0,
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" || name === "balance" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitLoading(true);

    try {
      console.log("Submitting Form Data:", formData);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData
      );

      console.log("API Response:", response.data);
      console.log(
        "Success Value Type:",
        typeof response.data.success,
        response.data.success
      );

      if (response?.data?.success === true) {
        console.log("Creating budget for user: ", response.data.user.name);
        setAuth(response.data.user);

        const date = new Date().toISOString().split("T")[0];
        const end_date = new Date(
          new Date().setFullYear(new Date().getFullYear() + 100)
        )
          .toISOString()
          .split("T")[0];

        const initialBudgetResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/budgets/`,
          {
            userId: response.data.user._id,
            name: "Others",
            amount: formData.balance,
            spent: 0,
            earned: 0,
            startDate: date,
            endDate: end_date,
            closed: false,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        console.log("Budget Creation Response:", initialBudgetResponse.data);

        if (initialBudgetResponse?.data?.success === true) {
          navigate("/dashboard");
          setSubmitLoading(false);
        }
      } else {
        console.log("Response success is false:", response.data);
        setSubmitLoading(false);
      }

      setMessage(response.data.message);
      setSubmitLoading(false);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError(err.response?.data?.message);
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Section (Logo & Branding) */}
      <div
        className="w-full lg:w-1/2 bg-blue-900 flex justify-center items-center p-8 
               rounded-b-[80%] md:rounded-b-[80%] lg:rounded-none lg:rounded-e-full 
               h-[40vh] md:h-[50vh] lg:h-auto"
      >
        <div className="text-center">
          <img
            src="/logo.png"
            alt="ForeSight Logo"
            className="w-40 mx-auto lg:w-80"
          />
          <h1 className="text-white text-3xl font-bold mb-4 mx-auto md:text-4xl lg:text-5xl">
            ForeSight
          </h1>
        </div>
      </div>

      {/* Right Section (Sign-Up Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md bg-white p-8 rounded-md">
          <h2 className="text-2xl font-bold text-center mt-55 lg:mt-20 xl:mt-0 text-gray-800 mb-6">
            Sign Up
          </h2>

          {message && (
            <p className="text-green-600 text-sm text-center mb-4">{message}</p>
          )}
          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g., John Dela Cruz"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="e.g., johndelacruz123"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Age & Sex */}
            <div className="flex flex-row gap-2">
              <div className="w-full">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="e.g., 20"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sex
                </label>
                <select
                  id="sex"
                  name="sex"
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="e.g., john@example.com"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter a strong password"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Initial Balance */}
            <div>
              <label
                htmlFor="balance"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Initial Balance
              </label>
              <input
                id="balance"
                type="number"
                name="balance"
                placeholder="₱ e.g., 3000"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is the starting amount in your budget.
              </p>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-md transition"
            >
              {submitLoading ? "Loading..." : "Register"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-md transition mt-2"
            >
              Back
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
