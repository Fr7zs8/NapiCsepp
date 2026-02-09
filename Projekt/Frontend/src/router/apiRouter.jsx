import { HabitView } from '../components/activityPage/habitView/habit'
import { TaskView } from '../components/activityPage/taskView/task'
import { DailyView } from '../components/calendarPage/dayView/daily'
import { MonthlyView } from '../components/calendarPage/monthView/monthly'
import { WeeklyView } from '../components/calendarPage/weekView/weekly'
import { HomepageView } from '../components/homePage/homepage'
import { LoginView } from '../components/loginPage/loginView/login'
import { RegisterView } from '../components/loginPage/registerView/register'
import { ProfileView } from '../components/profileView/profile'
import { StatisticsView } from '../components/statisticsView/statisticsView'
import { Layout } from '../components/layout/layout'

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