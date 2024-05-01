import { Stack } from "@mui/material";
import React from "react";
import AgentDashboard from "src/layouts/newDashboard/agentDashbord/AgentDashboard";

import { useAuthContext } from "src/auth/useAuthContext";
import DistributorDashboard from "src/layouts/newDashboard/DistribitorDashboard/DistributorDashboard";
function MyStats() {
  const { user } = useAuthContext();
  return (
    <>
      <Stack>
        {user?.role == "agent" ? <AgentDashboard /> : <DistributorDashboard />}
      </Stack>
    </>
  );
}

export default MyStats;
