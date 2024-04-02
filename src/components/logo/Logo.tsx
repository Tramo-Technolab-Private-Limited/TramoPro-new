import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";
// @mui
import { useTheme } from "@mui/material/styles";
import { Box, Link, BoxProps, Typography, Stack } from "@mui/material";
import Tramo from "../../assets/logo/tramoTrmao-Final-Logo.svg";
import Neo from "../../assets/logo/neo-Neosprint_logo_black.svg";
import Image from "../image/Image";
import packageFile from "../../../package.json";

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const theme = useTheme();

    const PRIMARY_LIGHT = theme.palette.primary.light;

    const PRIMARY_MAIN = theme.palette.primary.main;

    const PRIMARY_DARK = theme.palette.primary.dark;

    // OR using local (public folder)
    // -------------------------------------------------------
    // const logo = (
    //   <Box
    //     component="img"
    //     src="/logo/logo_single.svg" => your path
    //     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
    //   />
    // );

    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          width: 120,
          // height: 50,
          // margin: "auto",
          display: "inline-flex",
          ...sx,
        }}
        {...other}
      >
        <img
          src={process.env.REACT_APP_LOGO == "Tramo" ? Tramo : Neo}
          alt="LOGO"
          width={"100%"}
          height={"100%"}
        />
      </Box>
    );

    if (disabledLink) {
      return <>{logo}</>;
    }

    return (
      <Link to="/" component={RouterLink} sx={{ display: "contents" }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
