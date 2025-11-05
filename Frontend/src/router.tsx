import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import FeedPage from "./views/FeedPage";
import PostPage from "./views/PostPage";
import CategoriesPage from "./views/CategoriesPage";
import ProfilePage from "./views/ProfilePage";
import FriendsPage from "./views/FriendsPage";
import UsersPage from "./views/UsersPage";
import LoginPage from "./views/auth/LoginPage";
import RegisterPage from "./views/auth/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: "post/:id", element: <PostPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "profile/:id?", element: <ProfilePage /> },
      { path: "friends", element: <FriendsPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);
