import "bootstrap/dist/css/bootstrap.css"
import './App.css'

import { HabitView } from './components/activityPage/habitView/habit'
import { TaskView } from './components/activityPage/taskView/task'
import { DailyView } from './components/calendarPage/dayView/daily'
import { MonthlyView } from './components/calendarPage/monthView/monthly'
import { WeeklyView } from './components/calendarPage/weekView/weekly'
import { HomepageView } from './components/homePage/homepage'
import { LoginView } from './components/loginPage/loginView/login'
import { RegisterView } from './components/loginPage/registerView/register'
import { ProfileView } from './components/profileView/profile'
import { StatisticsView } from './components/statisticsView/statisticsView'

import {RouterProvider, createBrowserRouter} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomepageView />
  },
  {
    path: "/login",
    element: <LoginView/>
  },
  {
    path: "/register",
    element: <RegisterView />
  },
  {
    path: "/profile",
    element: <ProfileView />
  },
  {
    path: "/statistics",
    element: <StatisticsView />
  },
  {
    path: "/calendar/monthly",
    element: <MonthlyView />
  },
  {
    path: "/calendar/weekly",
    element: <WeeklyView />
  },
  {
    path: "/calendar/daily",
    element: <DailyView />
  },
  {
    path: "/tasks",
    element: <TaskView />
  },
  {
    path: "/habits",
    element: <HabitView />
  }
])

function App() {
  return (
    <>

      <RouterProvider router={router} />
      {/* <CombinedView/> telefonra később*/}
    </>
  )
}

export default App
