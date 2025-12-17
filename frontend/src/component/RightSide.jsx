import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedUser } from "../redux/messageSlice";
import useMutualFriends from "../hooks/getMutualFriends";
import useGetOnlineUser from "../hooks/getAllOnlineUsers";
import dp1 from "../assets/dp1.jpeg";

function RightSide() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutualFriends, loading } = useMutualFriends();
  const { onlineUsers, connected } = useGetOnlineUser();

  const handleUserClick = (user) => {
    dispatch(setSelectedUser(user));
    navigate("/messageArea");
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some((onlineUser) => onlineUser._id === userId);
  };

  return (
    <div className="w-[25%] hidden lg:block h-screen bg-black border-l-2 border-gray-900 overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* Header - fixed height */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-3 h-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <h3 className="text-lg font-semibold text-white">
              Friends ({mutualFriends.length})
            </h3>
          </div>
          {!connected && (
            <p className="text-sm text-gray-400">Connecting...</p>
          )}
        </div>

        {/* Friends List - only this scrolls */}
        <div className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              Loading friends...
            </div>
          ) : mutualFriends.length > 0 ? (
            [...mutualFriends].sort((a, b) => {
              const aOnline = isUserOnline(a._id);
              const bOnline = isUserOnline(b._id);
              return bOnline - aOnline; // Online users first
            }).map((friend) => {
              const isOnline = isUserOnline(friend._id);

              return (
                <div
                  key={friend._id}
                  onClick={() => handleUserClick(friend)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-800 border-b border-gray-700 cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                      <img
                        src={friend.profileImage || dp1}
                        alt={friend.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {isOnline && (
                      <div className="w-4 h-4 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-black"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {friend.userName}
                    </p>
                    <p className="text-xs text-gray-400">{friend.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-xs ${
                          isOnline ? "text-green-400" : "text-gray-500"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No mutual friends yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Follow people and get followed back to see them here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightSide;
