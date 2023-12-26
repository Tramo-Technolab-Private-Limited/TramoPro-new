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
  const { isAuthenticated, isInitialized, user, location } = useAuthContext();

  const { pathname } = useLocation();

  const [requestedLocation, setRequestedLocation] = useState<string | null>(
    null
  );

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={"/login"} />;
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
    } else {
      <Navigate to={pathname} />;
    }
  }

  // if (requestedLocation && pathname !== requestedLocation) {
  //   setRequestedLocation(null);
  //   return user?.finalStatus !== "approved" && !user?.isNPIN ? (
  //     <Navigate to={"/new/user/registrationsteps"} />
  //   ) : user?.finalStatus == "approved" &&
  //     !user?.is_eAgreement_signed &&
  //     !user?.isNPIN ? (
  //     <Navigate to={"/new/user/esignature"} />
  //   ) : user?.finalStatus == "approved" &&
  //     user?.is_eAgreement_signed &&
  //     !user?.isNPIN ? (
  //     <Navigate to={"/new/user/verifyusernpin"} />
  //   ) : (
  //     <Navigate to={requestedLocation} />
  //   );
  // }
  // }

  return <>{children}</>;
}
