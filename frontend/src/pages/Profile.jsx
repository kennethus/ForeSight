import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/authProvider";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${auth._id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setUser(response.data.data);
          setEditedUser(response.data.data);
        } else {
          setError("Failed to fetch budget details");
        }
      } catch (err) {
        console.error("Error fetching user details:", err.response?.data);
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [auth._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${auth._id}`,
        {
          userId: auth._id,
          name: editedUser.name,
          username: editedUser.username,
          email: editedUser.email,
          age: editedUser.age,
          sex: editedUser.sex,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        console.log(response.data.data);
        setUser(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating user details:", error.response?.data);
      alert("Failed to update user details.");
    }
  };

  if (loading) return <p>Loading budget details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <img
        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
        alt="Profile"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          marginBottom: "10px",
        }}
      />
      <h2>{user.name}</h2>
      <p style={{ fontWeight: "bold", color: "gray" }}>USER</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          name="username"
          value={editedUser.username}
          onChange={handleChange}
          disabled={!isEditing}
          style={{ padding: "8px", width: "80%" }}
        />
        <input
          type="text"
          name="email"
          value={editedUser.email}
          onChange={handleChange}
          disabled={!isEditing}
          style={{ padding: "8px", width: "80%" }}
        />
        <input
          type="text"
          name="age"
          value={editedUser.age}
          onChange={handleChange}
          disabled={!isEditing}
          style={{ padding: "8px", width: "80%" }}
        />
        <input
          type="text"
          name="gender"
          value={editedUser.sex}
          onChange={handleChange}
          disabled={!isEditing}
          style={{ padding: "8px", width: "80%" }}
        />
      </div>

      {isEditing ?
        <button
          onClick={handleSubmit}
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
        >
          Save
        </button>
      : <button
          onClick={() => setIsEditing(true)}
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
        >
          Edit
        </button>
      }
    </div>
  );
};

export default UserProfile;
