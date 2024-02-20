// @mui
import { Typography, Stack, Box, Container, useTheme } from "@mui/material";
// components
import Logo from "../../components/logo";

//
import {
  StyledRoot,
  StyledSectionBg,
  StyledSection,
  StyledContent,
} from "./styles";
import Marquee from "react-fast-marquee";
import SvgColor from "src/components/svg-color";
import DashboardIcon from "src/assets/icons/DashboardIcon";

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function ResetPassLayout({
  children,
  illustration,
  title,
}: Props) {
  const theme = useTheme();
  return (
    <StyledRoot>
      <Logo
        sx={{
          zIndex: 9,
          position: "absolute",
          mt: { xs: 1, md: 1 },
          ml: { xs: 1, md: 5 },
        }}
      />

      <StyledSection>
        <Typography
          variant="h5"
          sx={{ mb: 5, maxWidth: 580, textAlign: "center" }}
        >
          Join Tramo to drive the Financial Inclusion in the country!
        </Typography>

        <DashboardIcon />

        <Typography
          variant="subtitle1"
          sx={{ mt: 5, maxWidth: 580, textAlign: "center" }}
        >
          Be part of India’s largest retail digital solution providers, offer
          solutions available on your finger tips and earn commissions on every
          transactions.
        </Typography>

        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
      <Box
        component="footer"
        sx={{
          position: "fixed",
          width: "100%",
          bottom: 0,
          backgroundColor: "#375168",
        }}
      >
        {/* <Divider /> */}
        <Marquee style={{ background: "white" }} pauseOnHover>
          <SvgColor
            src={"/assets/icons/marqueeimages/recharge.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/dmt.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/dmt1.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/dmt2.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/billpayment.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/indonepal.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/matm.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/aeps.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
          <SvgColor
            src={"/assets/icons/marqueeimages/aadhaarpay.svg"}
            sx={{ width: 120, height: 70, bgcolor: theme.palette.primary.main }}
          />
        </Marquee>
        <Container>
          <Stack
            flexDirection={{ xs: "column", sm: "row" }}
            sx={{ color: "white", pt: 1, pb: 1 }}
            justifyContent="space-between"
          >
            <Typography variant="subtitle2">
              Helpline Numbers +{process.env.REACT_APP_COMPANY_MOBILE} ,{" "}
              {process.env.REACT_APP_COMPANY_MOBILEOTHER}
            </Typography>
            <Typography variant="subtitle2">
              Timings : 08:00AM to 10:00 PM (Mon-Sun)
            </Typography>
            <Typography variant="subtitle2">
              Email : {process.env.REACT_APP_COMPANY_EMAIL}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </StyledRoot>
  );
}
