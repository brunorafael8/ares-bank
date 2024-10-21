import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthenticationPage from "./pages/Authentication";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthenticationPage />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
