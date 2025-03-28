import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/authProvider";

const Dashboard = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    useEffect(() => {
        if (!auth) {
            navigate("/");
        } else {
            const fetchUser = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${auth._id}`, {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    })
                    if (response){
                        setUser(response.data.data)
                    }
                } catch (err) {
                    setError(err.response?.data?.message)
                } finally {
                    setLoading(false);
                }
            }

            fetchUser()
        }
    }, [auth, navigate]);

    if (loading) return <p>Loading budgets...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div>
            <h1>Welcome to the Dashboard</h1>
            {auth?.name ? 
                <div>
                    <p>Logged in as: {user.name}</p>
                    <p>Current balance: {user.balance}</p>
                </div>
                 
                : <p>You are not logged in.</p>
            }

        </div>
    );
};

export default Dashboard;
