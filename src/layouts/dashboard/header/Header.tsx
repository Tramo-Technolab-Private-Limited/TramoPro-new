// @mui
import { useTheme } from "@mui/material/styles";
import { Stack, AppBar, Toolbar, IconButton } from "@mui/material";
// utils
import { bgBlur } from "../../../utils/cssStyles";
// hooks
import useOffSetTop from "../../../hooks/useOffSetTop";
import useResponsive from "../../../hooks/useResponsive";
// config
import { HEADER, NAV } from "../../../config";
// components
import Logo from "../../../components/logo";
import Iconify from "../../../components/iconify";
import { useSettingsContext } from "../../../components/settings";
//
import Searchbar from "./Searchbar";
import AccountPopover from "./AccountPopover";
import LanguagePopover from "./LanguagePopover";
import ContactsPopover from "./ContactsPopover";
import NotificationsPopover from "./NotificationsPopover";
import Label from "src/components/label/Label";
import { useAuthContext } from "src/auth/useAuthContext";
import { fCurrency } from "src/utils/formatNumber";

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const { user } = useAuthContext();

  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === "horizontal";

  const isNavMini = themeLayout === "mini";

  const isDesktop = useResponsive("up", "lg");
  const isTablet = useResponsive("up", "sm");

  const isOffset = useOffSetTop(HEADER.H_DASHBOARD_DESKTOP) && !isNavHorizontal;

  const walletStyle = {
    textTransform: "capitalize",
    borderColor: "primary",
    borderRadius: 8,
    borderWidth: "2px",
    borderStyle: "solid",
  };

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!isDesktop && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1, color: "text.primary" }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )}

      {/* <Searchbar /> */}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1.5 }}
      >
        {isTablet ? (
          <>
            <Label variant="soft" color={"primary"} sx={walletStyle}>
              {`main wallet = ${fCurrency(user?.main_wallet_amount) || 0}`}
            </Label>
            <Label variant="soft" color={"warning"} sx={walletStyle}>
              {`AEPS wallet = ${fCurrency(user?.AEPS_wallet_amount) || 0}`}
            </Label>
            <NotificationsPopover />

            <AccountPopover />
          </>
        ) : (
          <NotificationsPopover />
        )}
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
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
