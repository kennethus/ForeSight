import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from "../context/authProvider"; 
import { useNavigate } from "react-router-dom";


import axios from '../api/axios';

const Login = () => {
    const { setAuth, auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    useEffect(() => {
        if (auth) {
            navigate("/dashboard", { replace: true });
        }
    }, [auth, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                JSON.stringify({ email: user, password: pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,  // Ensure cookies are sent
                }
            );
    
            console.log("Login response:", response.data);
    
            if (response.data.success) {
                setAuth(response.data.data); // Store user data
                navigate("/dashboard");
            }
        } catch (err) {
            setErrMsg(err.response?.data?.message || "Login failed");
            errRef.current.focus();
        }
    };
    

    return (

            
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                        />
                        <button>Sign In</button>
                    </form>
                    <p>
                        Need an Account?<br />
                        <span className="line">
                            {/*put router link here*/}
                            <a href="#">Sign Up</a>
                        </span>
                    </p>
                </section>
   
    )
}

export default Login