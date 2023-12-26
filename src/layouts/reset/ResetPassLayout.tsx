// @mui
import { Typography, Stack, Box, Container } from "@mui/material";
// components
import Logo from "../../components/logo";
import Image from "../../components/image";
import DashBoardImage from "../../assets/images/dashboard.png";

//
import {
  StyledRoot,
  StyledSectionBg,
  StyledSection,
  StyledContent,
} from "./styles";
import Marquee from "react-fast-marquee";
import Recharge from "../../assets/images/recharge.svg";
import dmt from "../../assets/images/dmt.svg";
import dmt1 from "../../assets/images/dmt1.svg";
import dmt2 from "../../assets/images/dmt2.svg";
import aadhaarpay from "../../assets/images/aadhaarpay.svg";
import aeps from "../../assets/images/aeps.svg";
import billpayment from "../../assets/images/billpayment.svg";
import indonepal from "../../assets/images/indonepal.svg";
import matm from "../../assets/images/matm.svg";

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

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={DashBoardImage}
          sx={{ maxWidth: 720 }}
        />
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
          position: "absolute",
          width: "100%",
          bottom: 0,
          backgroundColor: "#375168",
        }}
      >
        {/* <Divider /> */}
        <Marquee style={{ background: "white", paddingBottom: 2 }} pauseOnHover>
          <img src={Recharge} />
          <img src={dmt} />
          <img src={dmt1} />
          <img src={dmt2} />
          <img src={billpayment} />
          <img src={aeps} />
          <img src={matm} />
          <img src={aadhaarpay} />
          <img src={indonepal} />
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
              {process.env.REACT_APP_COMPANY_EMAIL}
            </Typography>
          </Stack>
        </Container>
      </Box>
    </StyledRoot>
  );
}
