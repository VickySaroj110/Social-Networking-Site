import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SignUp from "./pages/signup";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import { useSelector } from "react-redux";
import getCurrentUser from "./hooks/getCurrentUser";
import getSuggestedUser from "./hooks/getSuggestedUser";
import useGetOnlineUser from "./hooks/getAllOnlineUsers";
import useNotifications from "./hooks/useNotifications";
import Profile from "./pages/Profile";
import { useTransition, animated } from "@react-spring/web";
import { setUserData } from "./redux/userSlice";
import { useDispatch } from "react-redux";
import EditProfile from "./pages/EditProfile";
import Upload from "./pages/Upload";
import getAllpost from "./hooks/getAllpost";
import getAllLoops from "./hooks/getAllLoops";
import axios from "axios";
import Loops from "./pages/Loops";
import Story from "./pages/Story";
import getAllStories from "./hooks/getAllStories";
import Messages from "./pages/Messages";
import MessageArea from "./pages/MessageArea";
import Search from "./component/Search";
import Tweets from "./pages/Tweets"; // ✅ ADD
import TweetDetail from "./pages/TweetDetail"; // ✅ ADD

export const serverUrl = "http://localhost:8000";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/auth/me`, {
          withCredentials: true,
        });
        dispatch(setUserData(res.data));
      } catch (error) {
        dispatch(setUserData(null));
      }
    };
    fetchUser();
  }, [dispatch]);

  const location = useLocation();
  const transitions = useTransition(location, {
    from: { opacity: 0, transform: "translateX(100%)" },
    enter: { opacity: 1, transform: "translateX(0%)" },
    leave: { opacity: 0, transform: "translateX(-50%)" },
    config: { duration: 400 },
  });

  getCurrentUser();
  getSuggestedUser();
  getAllpost();
  getAllLoops();
  getAllStories();
  const { onlineUsers } = useGetOnlineUser();
  useNotifications();
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Routes location={location}>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        />
        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/tweets"
          element={userData ? <Tweets /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/tweet/:tweetId"
          element={userData ? <TweetDetail /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/profile/:userName"
          element={userData ? <Profile /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/story/:userName"
          element={userData ? <Story /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/editprofile"
          element={userData ? <EditProfile /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/upload"
          element={userData ? <Upload /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/loops"
          element={userData ? <Loops /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/messages"
          element={userData ? <Messages /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/messageArea"
          element={userData ? <MessageArea /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/search"
          element={userData ? <Search /> : <Navigate to={"/signin"} />}
        />
      </Routes>
    </div>
  );
}

export default App;
