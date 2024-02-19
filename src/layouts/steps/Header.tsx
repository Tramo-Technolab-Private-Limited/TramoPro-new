// @mui
import { useTheme } from "@mui/material/styles";
import { Stack, AppBar, Toolbar, IconButton, Button } from "@mui/material";
// utils
import { bgBlur } from "../../utils/cssStyles";
// hooks
import useOffSetTop from "../../hooks/useOffSetTop";
import useResponsive from "../../hooks/useResponsive";
// config
import { HEADER, NAV } from "../../config";
// components
import Logo from "../../components/logo";
import Iconify from "../../components/iconify";
import { useSettingsContext } from "../../components/settings";
import AccountPopover from "../dashboard/header/AccountPopover";
import { useAuthContext } from "src/auth/useAuthContext";
import { useNavigate } from "react-router";
import { PATH_AUTH } from "src/routes/paths";

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { logout } = useAuthContext();

  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === "horizontal";

  const isNavMini = themeLayout === "mini";

  const isDesktop = useResponsive("up", "lg");

  const isOffset = useOffSetTop(HEADER.H_DASHBOARD_DESKTOP) && !isNavHorizontal;

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        <Button variant="contained" onClick={logout}>
          Logout
        </Button>
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: "none",
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(["height"], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD + 1}px)`,
          height: HEADER.H_DASHBOARD_DESKTOP,
          ...(isOffset && {
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: "background.default",
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
        variant="dense"
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
