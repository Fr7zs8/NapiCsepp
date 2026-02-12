import "bootstrap/dist/css/bootstrap.css"
import './App.css'
import { RouterProvider } from "react-router-dom"
import { appRouter } from "./router/apiRouter"

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  )
}

export default App
