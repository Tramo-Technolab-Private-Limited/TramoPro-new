import { Pagination, Stack } from "@mui/material";
import useResponsive from "src/hooks/useResponsive";

export default function CustomPagination({ Count, pageSize, ...other }: any) {
  const isMobile = useResponsive("up", "sm");
  return (
    <Stack
      sx={{
        position: "fixed",
        margin: "auto",
        left: "50%",
        transform: "translate(-50%)",
        bottom: !isMobile ? 15 : 25,
        bgcolor: "white",
      }}
    >
      <Pagination
        count={Math.floor(Count / pageSize) + (Count % pageSize === 0 ? 0 : 1)}
        color="primary"
        variant="outlined"
        shape="rounded"
        size={!isMobile ? "small" : "medium"}
        // showFirstButton
        // showLastButton
        sx={{ whiteSpace: "nowrap" }}
        {...other}
      />
    </Stack>
  );
}
