import { HabitView } from '../pages/activityPage/habitView/habit'
import { TaskView } from '../pages/activityPage/taskView/task'
import { DailyView } from '../pages/calendarPage/dayView/daily'
import { MonthlyView } from '../pages/calendarPage/monthView/monthly'
import { WeeklyView } from '../pages/calendarPage/weekView/weekly'
import { CombinedView } from '../pages/calendarPage/combinedView/combined'
import { HomepageView } from '../pages/homePage/homepage'
import { LoginView } from '../pages/loginPage/loginView/login'
import { RegisterView } from '../pages/loginPage/registerView/register'
import { ProfileView } from '../pages/profileView/profile'
import { StatisticsView } from '../pages/statisticsView/statisticsView'
import { Layout } from '../components/Layout/layout'

import {createBrowserRouter} from "react-router-dom"

import ApiService from "../classes/Services/apiService"
import UserService from "../classes/Services/userService"
import ActivityService from '../classes/Services/activityService'
import { ProtectedRouter } from './protectedRouter';

const api = new ApiService("http://localhost:3000");
export const activityService = new ActivityService(api);
export const clientService = new UserService(api);

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout><HomepageView /></Layout>
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
    element: (
      <ProtectedRouter>
        <Layout><ProfileView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/statistics",
    element: (
      <ProtectedRouter>
        <Layout><StatisticsView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/calendar/monthly",
    element: (
      <ProtectedRouter>
        <Layout><MonthlyView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/calendar/weekly",
    element: (
      <ProtectedRouter>
        <Layout><WeeklyView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/calendar/combined",
    element: (
      <ProtectedRouter>
        <Layout><CombinedView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/calendar/daily",
    element: (
      <ProtectedRouter>
        <Layout><DailyView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRouter>
        <Layout><TaskView /></Layout>
      </ProtectedRouter>
    )
  },
  {
    path: "/habits",
    element: (
      <ProtectedRouter>
        <Layout><HabitView /></Layout>
      </ProtectedRouter>
    )
  }
])