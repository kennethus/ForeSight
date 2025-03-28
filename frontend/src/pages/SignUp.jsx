import { useNavigate } from "react-router-dom";
import { useState, useContext } from 'react';
import AuthContext from "../context/authProvider"; 
import axios from '../api/axios';

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
  
      try {
          console.log("Submitting Form Data:", formData);
          const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/auth/register`,
              formData
          );
  
          console.log("API Response:", response.data);
          console.log("Success Value Type:", typeof response.data.success, response.data.success);
  
          if (response?.data?.success === true) { 
              console.log("Creating budget for user: ", response.data.user.name);
              setAuth(response.data.user);
  
              const date = new Date().toISOString().split("T")[0];
              const end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString().split("T")[0];
  
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
                      closed: false 
                  },
                  {
                      headers: { "Content-Type": "application/json" },
                      withCredentials: true, 
                  }
              );
  
              console.log("Budget Creation Response:", initialBudgetResponse.data);
  
              if (initialBudgetResponse?.data?.success === true) {
                  navigate("/dashboard");
              }
          } else {
              console.log("Response success is false:", response.data);
          }
  
          setMessage(response.data.message);
      } catch (err) {
          console.error("API Error:", err.response?.data || err.message);
          setError(err.response?.data?.message);
      }
  };
  
  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
        <select name="sex" onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input type="number" name="balance" placeholder="Initial Balance" onChange={handleChange} required />

        <button type="submit">Register</button>
        <button onClick={() => navigate(-1)}>Back</button>
      </form>
    </div>
  );
};

export default SignUp;
