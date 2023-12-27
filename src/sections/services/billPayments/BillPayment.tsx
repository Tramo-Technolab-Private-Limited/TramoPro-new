import React from "react";
import { Typography } from "@mui/material";
import Bbps_One from "./Bbps_One";
import Bbps_Two from "./Bbps_Two";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

//--------------------------------------------------------------------

export default function BillPayment() {
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = React.useState("bbps1");

  return (
    <>
      {/* <Box sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={(event: React.SyntheticEvent, newValue: string) => setCurrentTab(newValue)}
          aria-label="basic tabs example"
        >
          <Tab value={'bbps1'} label={<Typography>BBPS 1</Typography>} />
          <Tab value={'bbps2'} label={<Typography>BBPS 2</Typography>} />
        </Tabs>
      </Box> */}
      <Typography variant="h3" my={1}>
        Bill Payment
      </Typography>
      <Bbps_One />
      {/* {currentTab == 'bbps1' ?  : null} */}
    </>
  );
}

// ----------------------------------------------------------------------
