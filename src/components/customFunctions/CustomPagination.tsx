import { Pagination, Stack, TablePagination } from "@mui/material";

export default function CustomPagination({ ...other }: any) {
  return (
    <Stack
      sx={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translate(-50%)",
        bgcolor: "white",
      }}
    >
      {/* <Pagination
        count={Math.floor(Count / pageSize) + (Count % pageSize == 0 ? 0 : 1)}
        color="primary"
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
        {...other}
      /> */}
      <TablePagination component="div" {...other} />
    </Stack>
  );
}
