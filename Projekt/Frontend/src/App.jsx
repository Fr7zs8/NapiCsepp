import "bootstrap/dist/css/bootstrap.css"
import './App.css'

import { HabitView } from './components/activityPage/habitView/habit'
import { TaskView } from './components/activityPage/taskView/task'
// import { CombinedView } from './components/calendarPage/combinedView/combined'
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
    element: <LoginView />
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




      
      {/* <div class="container">
        <div class="switch4">
          <input type="radio" id="switch4-radio1" name="radio"/>
          <label for="switch4-radio1">FrontEnd</label>
          
          <input type="radio" id="switch4-radio2" name="radio"/>
          <label for="switch4-radio2">BackEnd</label>
          
          <input type="radio" id="switch4-radio3" name="radio"/>
          <label for="switch4-radio3">FullStack</label>
          
          <span id="active-label"></span>
        </div>
      </div> */}
    </>
  )
}

export default App
