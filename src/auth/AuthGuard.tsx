import { useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
// components
import LoadingScreen from "../components/loading-screen";
//
import { useAuthContext } from "./useAuthContext";
import Login from "src/sections/auth/Login";
import { STEP_DASHBOARD } from "src/routes/paths";
import LocationInstruction from "src/components/customFunctions/LocationInstruction";

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized, user, location, logOut } =
    useAuthContext();

  const { pathname } = useLocation();

  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  if (logOut) {
    return <Navigate to={"/login"} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  }

  if (isAuthenticated) {
    if (!location) {
      return <LocationInstruction />;
    }
    if (!!pathname.match(/auth/i)) {
      if (
        user?.finalStatus !== "approved" ||
        !user?.is_eAgreement_signed ||
        !user?.isNPIN
      ) {
        return <Navigate to={"/login"} />;
      }
    } else if (!!pathname.match(/new/i)) {
      if (
        user?.finalStatus == "approved" &&
        user?.is_eAgreement_signed &&
        user?.isNPIN
      ) {
        return <Navigate to={"/404"} />;
      }
    } else {
      if (requestedLocation && pathname !== requestedLocation) {
        setRequestedLocation(null);
        <Navigate to={requestedLocation} />;
      }
    }
  }

  return <>{children}</>;
}
