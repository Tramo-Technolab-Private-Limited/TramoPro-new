import { useState } from "react";
// @mui
import { Grid } from "@mui/material";
import { Helmet } from "react-helmet-async";
import ResetPassword from "./ResetPassword";
import VerifyCode from "./VerifyCode";
// ----------------------------------------------------------------------

export default function Security(props: any) {
  const [verify, setVerify] = useState(true);
  return (
    <>
      <Helmet>
        <title>Security | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <Grid
        display={"grid"}
        gridTemplateColumns={{
          sm: "repeat(1, 0.5fr)",
          xs: "repeat(1, 1fr) ",
        }}
      >
        {verify ? (
          <ResetPassword callback={setVerify} />
        ) : (
          <VerifyCode callback={setVerify} />
        )}
      </Grid>
    </>
  );
}
