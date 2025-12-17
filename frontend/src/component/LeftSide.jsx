import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import psync from "../assets/psync.png";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { setUnreadCount } from "../redux/notificationSlice";
import OtherUsers from "./OtherUsers";
import Notifications from "./Notifications";
import dp1 from "../assets/dp1.jpeg";

function LeftSide() {
  const { userData, suggestedUser, following } = useSelector((state) => state.user);
  const { unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const [shuffledUsers, setShuffledUsers] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log("📡 Fetching unread count...");
      const response = await axios.get(
        `${serverUrl}/api/notification/unread-count`,
        { withCredentials: true }
      );
      console.log("✅ Unread count response:", response.data);
      dispatch(setUnreadCount(response.data.unreadCount));
    } catch (error) {
      console.log("❌ Error fetching unread count:", error);
    }
  };

  const handleHeartClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Shuffle once when suggestedUser or following changes - Filter out already followed users and yourself
  useEffect(() => {
    if (suggestedUser?.length) {
      const unfollowedUsers = suggestedUser.filter(user => 
        !following?.includes(user._id) && user._id !== userData?._id
      );
      const shuffled = [...unfollowedUsers]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      setShuffledUsers(shuffled);
    }
  }, [suggestedUser, following, userData?._id]);

  // Fetch unread count on component mount
  useEffect(() => {
    if (userData) {
      fetchUnreadCount();

      // Set up interval to refresh unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [userData]);

  // Debug: Log unread count changes
  useEffect(() => {
    console.log("Unread count updated:", unreadCount);
  }, [unreadCount]);

  return (
    <div className="w-[25%] hidden lg:block min-h-[100vh] bg-black border-r-2 border-gray-900">
      {/* Top Logo and Heart */}
      <div className="w-full h-[100px] flex items-center justify-between p-[20px]">
        <img src={psync} alt="logo" className="w-[100px]" />
        <div className="relative cursor-pointer" onClick={handleHeartClick}>
          {showNotifications ? (
            <FaHeart className="text-red-500 w-[25px] h-[25px]" />
          ) : (
            <FaRegHeart className="text-white w-[25px] h-[25px]" />
          )}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center w-full justify-between gap-[10px] px-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[50px] h-[50px] border-2 border-black rounded-full cursor-pointer overflow-hidden">
            <img
              src={userData.profileImage || dp1}
              alt="user dp"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-[18px] text-white font-semibold">
              {userData.user?.name || userData.name}
            </div>
            <div className="text-[15px] text-gray-400 font-semibold">
              {userData.user?.userName || userData.userName}
            </div>
          </div>
        </div>
        <div
          className="text-blue-500 font-semibold cursor-pointer"
          onClick={handleLogOut}
        >
          Log Out
        </div>
      </div>

      {/* Notifications or Suggested Users */}
      <div
        className="w-full flex flex-col gap-[20px] p-[20px] pr-3
                h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700"
      >
        {showNotifications ? (
          <Notifications />
        ) : (
          <>
            <h1 className="text-white text-[19px] mt-[10px] mb-[10px]">
              Suggested Users
            </h1>
            {shuffledUsers.map((user, index) => (
              <OtherUsers key={index} user={user} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default LeftSide;
