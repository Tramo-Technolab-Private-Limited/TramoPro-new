// @mui
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Typography,
  Stack,
} from "@mui/material";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  minSlab: string;
  maxSlab: string;
  TransactionType: string;
  chargetype: string;
  masterDistributorCommission: string;
  distributorCommission: string;
  agentCommission: string;
};

interface Props extends CardProps {
  comData: any;
}
export default function ViewMatmTable({ comData, ...other }: Props) {
  const { user } = useAuthContext();

  const tableLabels1 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "Agent", label: "Agent Commission" },
    { id: "Distributor", label: "Distributor Commission" },
    { id: "MDistributor", label: "Master Distributor Commission" },
  ];
  const tableLabels2 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "Agent", label: "Agent Commission" },
    { id: "Distributor", label: "Distributor Commission" },
  ];
  const tableLabels3 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "Agent", label: "Agent Commission" },
  ];
  let role = user?.role;

  return (
    <Card {...other}>
      {comData.length ? (
        <TableContainer sx={{ overflow: "unset" }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom
                headLabel={
                  role == "m_distributor"
                    ? tableLabels1
                    : role == "distributor"
                    ? tableLabels2
                    : tableLabels3
                }
              />
              <TableBody>
                {comData.map((row: any, index: any) => (
                  <VendorRow key={row.id} row={row} agentRole={role} />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      ) : (
        <NoData />
      )}
    </Card>
  );
}

type vendorRowProps = {
  row: RowProps;
  agentRole: string | null;
};
// sd
function VendorRow({ row, agentRole }: vendorRowProps) {
  return (
    <>
      <TableRow>
        <TableCell>{row.minSlab ? "Rs. " + row.minSlab : "-"}</TableCell>
        <TableCell>{row.maxSlab ? "Rs. " + row.maxSlab : "-"}</TableCell>
        <TableCell>{row.agentCommission || "-"}</TableCell>

        {agentRole == "m_distributor" && (
          <>
            <TableCell>{row.distributorCommission || "-"}</TableCell>
            <TableCell>{row.masterDistributorCommission || "-"}</TableCell>
          </>
        )}
        {agentRole == "distributor" && (
          <TableCell>{row.distributorCommission || "-"}</TableCell>
        )}
      </TableRow>
    </>
  );
}

function NoData() {
  return (
    <Stack justifyContent={"center"} p={2}>
      <Typography textAlign={"center"} fontSize={25}>
        {" "}
        Scheme Not Created for AEPS. Please Contact to Admin.
      </Typography>
    </Stack>
  );
}
