import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedUser } from "../redux/messageSlice";
import dp1 from "../assets/dp1.jpeg";

function OnlineUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { onlineUsers, connected } = useSelector((state) => state.socket);
  const { userData } = useSelector((state) => state.user);

  const handleUserClick = (user) => {
    dispatch(setSelectedUser(user));
    navigate("/messageArea");
  };

  return (
    <div className="w-full h-full bg-black">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-3 h-3 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <h3 className="text-lg font-semibold text-gray-400">
            Online Users ({onlineUsers.length-1})
          </h3>
        </div>

        {!connected && <p className="text-sm text-gray-500">Connecting...</p>}
      </div>

      <div className="overflow-y-auto h-full">
        {onlineUsers.map((user) => {
          // Don't show current user in the list
          if (user._id === userData?._id) return null;

          return (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={user.profileImg || dp1}
                    alt={user.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full absolute -bottom-1 -right-1 border-2 border-white"></div>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {user.userName}
                </p>
                <p className="text-xs text-gray-500">{user.fullName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-green-600">Online</span>
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
        })}

        {connected && onlineUsers.length <= 1 && (
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
            <p className="text-gray-500 text-sm">No other users online</p>
            <p className="text-gray-400 text-xs mt-1">
              Users will appear here when they come online
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnlineUsers;
