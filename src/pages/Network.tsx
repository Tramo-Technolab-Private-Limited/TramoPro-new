import AllDistributors from "../sections/Network/AllDistributor";
import Agents from "../sections/Network/Agent";
import { useAuthContext } from "src/auth/useAuthContext";
import RoleBasedGuard from "src/auth/RoleBasedGuard";

// ----------------------------------------------------------------------

//--------------------------------------------------------------------

export default function Network() {
  const { user, Api, UploadFileApi } = useAuthContext();

  return (
    <RoleBasedGuard hasContent roles={["distributor", "m_distriutor"]}>
      <>{user?.role === "m_distributor" ? <AllDistributors /> : <Agents />}</>
    </RoleBasedGuard>
  );
}

// ----------------------------------------------------------------------
