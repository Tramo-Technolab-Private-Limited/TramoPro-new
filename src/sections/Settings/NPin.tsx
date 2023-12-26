import { Grid } from "@mui/material";

import { Helmet } from "react-helmet-async";
import NPinReset from "./NPinReset";
// ----------------------------------------------------------------------

export default function Security(props: any) {
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
        <NPinReset />
      </Grid>
    </>
  );
}
