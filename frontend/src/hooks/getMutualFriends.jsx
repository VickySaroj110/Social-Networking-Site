import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";

function useMutualFriends() {
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchMutualFriends = async () => {
      if (!userData) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${serverUrl}/api/user/mutualfriends`,
          {
            withCredentials: true,
          }
        );
        setMutualFriends(response.data || []);
        console.log("Mutual friends fetched:", response.data);
      } catch (error) {
        console.error("Error fetching mutual friends:", error);
        setMutualFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMutualFriends();
  }, [userData]);

  return { mutualFriends, loading };
}

export default useMutualFriends;
