// @mui
import { Stack, Box } from "@mui/material";
// config
import { NAV } from "../../../config";
// utils
import { hideScrollbarX } from "../../../utils/cssStyles";
// components
import Logo from "../../../components/logo";
import { NavSectionMini } from "../../../components/nav-section";
//
import navConfig from "./agentconfig";
import agentNavConfig from "./agentconfig";
import distributorNavConfig from "./distributorconfig";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

export default function NavMini() {
  const { user } = useAuthContext();
  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD_MINI },
      }}
    >
      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: "fixed",
          width: NAV.W_DASHBOARD_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScrollbarX,
        }}
      >
        <Logo sx={{ mx: "auto", my: 2 }} />
        <NavSectionMini
          data={user?.role == "agent" ? agentNavConfig : distributorNavConfig}
        />
      </Stack>
    </Box>
  );
}
