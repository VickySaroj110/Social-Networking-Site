import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "../redux/socketClient";

function useGetOnlineUser() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { connected, onlineUsers } = useSelector((state) => state.socket);

  useEffect(() => {
    console.log("useGetOnlineUser effect - userData:", userData);
    console.log("useGetOnlineUser effect - connected:", connected);

    if (userData?._id && !connected) {
      console.log("Attempting to connect socket for user:", userData._id);
      connectSocket(userData._id, dispatch);
    }

    return () => {
      if (!userData) {
        console.log("User logged out, disconnecting socket");
        disconnectSocket(dispatch);
      }
    };
  }, [userData, dispatch, connected]);

  useEffect(() => {
    if (onlineUsers.length > 0) {
      console.log("Online users updated:", onlineUsers);
    }
  }, [onlineUsers]);

  return { onlineUsers, connected };
}

export default useGetOnlineUser;
