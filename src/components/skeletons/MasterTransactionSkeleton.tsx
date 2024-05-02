import { Skeleton, Stack, TableCell, TableRow } from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";

export const MasterTransactionSkeleton = () => {
  const { user } = useAuthContext();
  return (
    <TableRow>
      {/* Date & Time */}
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      {user?.role !== "agent" && (
        <TableCell>
          <Stack flexDirection={"row"} gap={1}>
            <Skeleton variant="circular" width={40} height={40} />
            <Stack>
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
            </Stack>
          </Stack>
        </TableCell>
      )}

      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="circular" width={10} height={10} />
      </TableCell>
    </TableRow>
  );
};
