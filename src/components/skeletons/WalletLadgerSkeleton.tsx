import { Skeleton, Stack, TableCell, TableRow } from "@mui/material";

export const WalletLadgerSkeleton = () => {
  return (
    <TableRow>
      {/* Date & Time */}
      <TableCell>
        <Skeleton variant="text" width={200} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={200} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={300} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} sx={{ fontSize: "1.5rem" }} />
      </TableCell>
    </TableRow>
  );
};
