import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/authProvider";

const Dashboard = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth) {
            navigate("/");
        }
    }, [auth, navigate]);

    return (
        <div>
            <h1>Welcome to the Dashboard</h1>
            {auth?.name ? <p>Logged in as: {auth.name}</p> : <p>You are not logged in.</p>}
        </div>
    );
};

export default Dashboard;
