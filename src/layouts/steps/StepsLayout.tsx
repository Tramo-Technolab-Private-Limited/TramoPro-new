import { Box, Container, Stack, Typography } from "@mui/material";
import Header from "./Header";
import Main from "./Main";
import { Outlet } from "react-router";

// ----------------------------------------------------------------------

export default function StepsLayout() {
  return (
    <>
      <Header />

      <Main>
        <Outlet />
      </Main>
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
    </>
  );
}
