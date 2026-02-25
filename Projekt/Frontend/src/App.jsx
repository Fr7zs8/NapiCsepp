import "bootstrap/dist/css/bootstrap.css"
import './App.css'
import { RouterProvider } from "react-router-dom"
import { appRouter } from "./router/apiRouter"
import { Toast } from "./components/Toast/Toast"

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
      <Toast />
    </>
  )
}

export default App
