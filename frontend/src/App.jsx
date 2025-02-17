import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login"

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Login />} />
    )
  )

  return (

      <RouterProvider router={router} />
 
  );  
}

export default App;
