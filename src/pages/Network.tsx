import AllDistributors from "../sections/Network/AllDistributor";
import Agents from "../sections/Network/Agent";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

//--------------------------------------------------------------------

export default function Network() {
  const { user } = useAuthContext();

  return (
    <>{user?.role === "m_distributor" ? <AllDistributors /> : <Agents />}</>
  );
}

// ----------------------------------------------------------------------
