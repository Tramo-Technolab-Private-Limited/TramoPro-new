import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
// components
import LoadingScreen from "../components/loading-screen";
//
import { useAuthContext } from "./useAuthContext";
import LocationInstruction from "src/components/customFunctions/LocationInstruction";

// ----------------------------------------------------------------------

type GuestGuardProps = {
  children: ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isInitialized, user, location } = useAuthContext();

  if (!location) {
    return <LocationInstruction />;
  }

  if (isAuthenticated) {
    return user?.finalStatus !== "approved" && !user?.isNPIN ? (
      <Navigate to={"/new/user/registrationsteps"} />
    ) : user?.finalStatus == "approved" &&
      !user?.is_eAgreement_signed &&
      !user?.isNPIN ? (
      <Navigate to={"/new/user/esignature"} />
    ) : user?.finalStatus == "approved" &&
      !user?.is_eAgreement_signed &&
      !user?.isNPIN ? (
      <Navigate to={"/new/user/verifyuserotp"} />
    ) : user?.finalStatus == "approved" &&
      user?.is_eAgreement_signed &&
      !user?.isNPIN ? (
      <Navigate to={"/new/user/verifyuserotp"} />
    ) : (
      <Navigate to={"/auth/mystats"} />
    );
  } else {
    <Navigate to={"/login"} />;
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
