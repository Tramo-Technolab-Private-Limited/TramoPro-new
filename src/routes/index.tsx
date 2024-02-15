import { Navigate, useRoutes } from "react-router-dom";
// auth
import AuthGuard from "../auth/AuthGuard";
import GuestGuard from "../auth/GuestGuard";
// layouts
import CompactLayout from "../layouts/compact";
import DashboardLayout from "../layouts/dashboard";
import StepsLayout from "../layouts/steps";
import ResetPassLayout from "../layouts/steps";
// config
import { PATH_AFTER_LOGIN, PATH_BEFORE_LOGIN, PATH_STEP_PAGE } from "../config";
//
import {
  Page404,
  LoginPage,
  RegisterPage,
  RegisterStepPage,
  ResetPage,
  ResetPassVerifyOtp,
  Esignature,
  NpinOtp,
  CreateNpin,
  MyStats,
  Services,
  MyTransaction,
  FundFlow,
  WalletLadger,
  Scheme,
  BBPSScheme,
  MyFundDeposits,
  MyBankAccount,
  AEPSsettlement,
  MyFundRequest,
  Setting,
  HelpAndSupport,
  Network,
  ManageFundFlow,
  MyNetwrokFunds,
  UserProfilePage,
  MyFundDeposit,
} from "./elements";

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: "/",
      children: [
        { element: <Navigate to={PATH_BEFORE_LOGIN} replace />, index: true },
        {
          path: "login",
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: "register",
          element: (
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          ),
        },
      ],
    },

    //reset password
    {
      path: "reset",
      element: (
        <GuestGuard>
          <ResetPage />
        </GuestGuard>
      ),
    },
    {
      path: "verifyotp",
      element: (
        <GuestGuard>
          <ResetPassVerifyOtp />
        </GuestGuard>
      ),
    },

    //registration Steps && Npin creation
    {
      path: "/new",
      element: (
        <AuthGuard>
          <StepsLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_STEP_PAGE} replace />, index: true },
        { path: "user/registrationsteps", element: <RegisterStepPage /> },
        { path: "user/esignature", element: <Esignature /> },
        { path: "user/verifyuserotp", element: <NpinOtp /> },
        { path: "user/createnpin", element: <CreateNpin /> },
      ],
    },

    //dashboard after login
    {
      path: "/auth",
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: "mystats", element: <MyStats /> },
        { path: "services", element: <Services /> },
        { path: "network", element: <Network /> },
        {
          path: "transaction",
          children: [
            {
              element: (
                <Navigate to="/auth/transaction/mytransaction" replace />
              ),
              index: true,
            },
            { path: "mytransaction", element: <MyTransaction /> },
            { path: "fundflow", element: <FundFlow /> },
            { path: "walletladger", element: <WalletLadger /> },
          ],
        },
        {
          path: "scheme",
          children: [
            {
              element: <Navigate to="/auth/scheme/allscheme" replace />,
              index: true,
            },
            { path: "allscheme", element: <Scheme /> },
            { path: "bbpsscheme", element: <BBPSScheme /> },
          ],
        },
        {
          path: "fundmanagement",
          children: [
            {
              element: (
                <Navigate to="/auth/fundmanagement/myfunddeposits" replace />
              ),
              index: true,
            },
            { path: "myfunddeposit", element: <MyFundDeposit /> },
            { path: "myfunddeposits", element: <MyFundDeposits /> },
            { path: "mybankaccount", element: <MyBankAccount /> },
            { path: "aepssettlement", element: <AEPSsettlement /> },
            { path: "myfundrequest", element: <MyFundRequest /> },
            { path: "managefundflow", element: <ManageFundFlow /> },
            { path: "mynetworkfunds", element: <MyNetwrokFunds /> },
          ],
        },
        { path: "setting", element: <Setting /> },
        { path: "helpsupport", element: <HelpAndSupport /> },
        { path: "userprofilepage", element: <UserProfilePage /> },
      ],
    },

    {
      element: <CompactLayout />,
      children: [{ path: "404", element: <Page404 /> }],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
