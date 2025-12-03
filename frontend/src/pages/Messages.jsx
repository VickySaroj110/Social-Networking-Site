import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetOnlineUser from "../hooks/getAllOnlineUsers";

function Messages() {
  const navigate = useNavigate();
  const { onlineUsers, connected } = useGetOnlineUser();
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-[100vh] flex flex-col bg-black gap-[20px] p-[10px]">
      <div className="w-full h-[80px] flex fixed items-center gap-[20px] px-[20px] bg-black z-10">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(`/`)}
          className="text-white cursor-pointer lg:hidden w-[25px] h-[25px]"
        />
        <h1 className="text-white text-[20px] font-semibold">Messages</h1>
      </div>

      {/* Online Users Section */}
      <div className="mt-[100px] w-full">
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <h2 className="text-white text-lg font-semibold">
              Online Users ({onlineUsers.length})
            </h2>
          </div>

          {!connected && (
            <p className="text-gray-400 text-sm">Connecting to chat...</p>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {connected &&
              onlineUsers.map((userId) => {
                // Don't show current user in the list
                if (userId === userData?._id) return null;

                return (
                  <div
                    key={userId}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {userId.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        User {userId.slice(-6)}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-sm">
                          Online now
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">Click to chat</div>
                  </div>
                );
              })}

            {connected && onlineUsers.length <= 1 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No other users online</p>
                <p className="text-gray-500 text-sm mt-1">
                  Users will appear here when they come online
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message History Section */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-white text-lg font-semibold mb-4">
            Recent Conversations
          </h3>
          <p className="text-gray-400 text-center py-8">No recent messages</p>
        </div>
      </div>
    </div>
  );
}

export default Messages;
