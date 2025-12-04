import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUnreadCount } from "../redux/notificationSlice";

const useNotifications = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData) {
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get(
            `${serverUrl}/api/notification/unread-count`,
            {
              withCredentials: true,
            }
          );
          dispatch(setUnreadCount(response.data.unreadCount));
        } catch (error) {
          console.log("Error fetching unread count:", error);
        }
      };

      fetchUnreadCount();

      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [userData, dispatch]);
};

export default useNotifications;
