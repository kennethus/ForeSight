import { useRef, useState, useEffect, useContext } from "react";
import AuthContext from "../context/authProvider";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Login = () => {
  const { setAuth, auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  useEffect(() => {
    if (auth) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        JSON.stringify({ email: user, password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAuth(response.data.user);
        setSubmitLoading(false);

        navigate("/dashboard");
      }
    } catch (err) {
      setSubmitLoading(false);

      setErrMsg(err.response?.data?.message || "Login failed");
      errRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Top Section on Mobile | Left Section on Larger Screens */}
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
          />{" "}
          <h1 className="text-white text-3xl font-bold mb-4 mx-auto md:text-4xl lg:text-5xl">
            ForeSight
          </h1>{" "}
        </div>
      </div>

      {/* Bottom Section on Mobile | Right Section on Larger Screens */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12">
        <div className="w-full max-w-md bg-white p-8 rounded-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Sign In
          </h2>

          {errMsg && (
            <p ref={errRef} className="text-red-600 text-sm text-center mb-4">
              {errMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium"
            >
              Email
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />

            <label
              htmlFor="password"
              className="block text-gray-700 font-medium"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              className="w-full px-4 py-3 border  border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />

            <button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-md transition">
              {submitLoading ? "Loading..." : "Log In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">Need an account?</p>
            <Link
              to="/sign-up"
              className="text-blue-800 font-bold hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
