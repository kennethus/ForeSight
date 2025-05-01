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
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md text-center">
      <img
        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
        alt="Profile"
        className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-blue-900"
      />
      <h2 className="text-2xl font-bold text-blue-900">{user.name}</h2>
      <p className="font-semibold text-gray-500 mb-6">USER</p>

      <div className="flex flex-col gap-4 items-center">
        <input
          type="text"
          name="username"
          value={editedUser.username}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-4/5 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <input
          type="text"
          name="email"
          value={editedUser.email}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-4/5 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <input
          type="text"
          name="age"
          value={editedUser.age}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-4/5 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <input
          type="text"
          name="gender"
          value={editedUser.sex}
          onChange={handleChange}
          disabled={!isEditing}
          className="w-4/5 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      </div>

      <button
        onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
        className="mt-6 px-6 py-2 rounded text-white bg-blue-900 hover:bg-blue-800 transition-all"
      >
        {isEditing ? "Save" : "Edit"}
      </button>
    </div>
  );
};

export default UserProfile;
