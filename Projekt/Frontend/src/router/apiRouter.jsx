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

const api = new ApiService("http://localhost:3000");
export const activityService = new ActivityService(api);
export const userService = new UserService(api);

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
    element: <Layout><ProfileView /></Layout>
  },
  {
    path: "/statistics",
    element: <Layout><StatisticsView /></Layout>
  },
  {
    path: "/calendar/monthly",
    element: <Layout><MonthlyView /></Layout>
  },
  {
    path: "/calendar/weekly",
    element: <Layout><WeeklyView /></Layout>
  },
  {
    path: "/calendar/daily",
    element: <Layout><DailyView /></Layout>
  },
  {
    path: "/tasks",
    element: <Layout><TaskView /></Layout>
  },
  {
    path: "/habits",
    element: <Layout><HabitView /></Layout>
  }
])