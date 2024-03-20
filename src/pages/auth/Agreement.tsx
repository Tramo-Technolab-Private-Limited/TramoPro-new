import { Icon } from "@iconify/react";
import { Stack, Typography } from "@mui/material";
import React from "react";

function Agreement() {
  return (
    <Stack>
      <Stack flexDirection={"row"} alignItems={"end"} justifyContent={"center"}>
        <Typography variant="h3" textAlign={"center"}>
          Checking
        </Typography>
        <Icon icon="svg-spinners:3-dots-bounce" fontSize={40} />
      </Stack>
      <Typography variant="h5" textAlign={"center"} color={"error.main"} mt={5}>
        Please do not refresh the page
      </Typography>
    </Stack>
  );
}

export default Agreement;
