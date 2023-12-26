import { Pagination, Stack } from "@mui/material";
import { useEffect, useState } from "react";

export default function CustomPagination({ Count, pageSize, ...other }: any) {
  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: 25,
        left: "50%",
        transform: "translate(-50%)",
        bgcolor: "white",
      }}
    >
      <Pagination
        count={Math.floor(Count / pageSize) + (Count % pageSize === 0 ? 0 : 1)}
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
        {...other}
      />
    </Stack>
  );
}
