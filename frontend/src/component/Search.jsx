import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { MdClose, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setProfileData } from "../redux/userSlice";
import dp1 from "../assets/dp1.jpeg";

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch all users once on mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/suggested`, {
          withCredentials: true,
        });
        setAllUsers(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllUsers();
  }, []);

  // Filter users on search term change (real-time search)
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          user.userName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allUsers]);

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleUserClick = async (userName) => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/user/getProfile/${userName}`,
        { withCredentials: true }
      );
      dispatch(setProfileData(res.data));
      navigate(`/profile/${userName}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white p-4 pt-4 overflow-y-auto">
      {/* Top Left Back Arrow */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full bg-gray-900/50 hover:bg-gray-800 transition-all duration-200"
        >
          <MdArrowBack size={24} className="text-white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto mt-20 mb-6">
        <div className="relative bg-gray-900 border border-gray-700 rounded-3xl p-1 shadow-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or username..."
            className="w-full px-6 py-4 bg-black text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
            {searchTerm && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-white p-1 transition-colors"
              >
                <MdClose size={22} />
              </button>
            )}
            <button
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <FaSearch size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="w-full max-w-2xl mx-auto">
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-4 bg-gray-900 hover:bg-gray-800 rounded-2xl cursor-pointer transition-all duration-200 border border-gray-700 hover:border-gray-500"
                onClick={() => handleUserClick(user.userName)}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-600">
                  <img
                    src={user.profileImage || dp1}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">{user.name}</div>
                  <div className="text-gray-400 text-sm font-medium truncate">@{user.userName}</div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12 text-gray-400">
            <FaSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No users found</p>
            <p className="text-sm mt-1">Try searching with a different name or username</p>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <FaSearch className="w-20 h-20 mx-auto mb-6 opacity-50" />
            <p className="text-xl font-semibold">Start searching</p>
            <p className="text-sm mt-2">Search for users by name or username</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
