import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  TableContainer,
  Stack,
  Typography,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";
// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  productName: string;
  chargeType: string;
  masterDistributorCommission: string;
  distributorCommission: string;
  agentCommission: string;
};

interface Props extends CardProps {
  comData: any;
}

export default function ViewRechargeTable({ comData, ...other }: Props) {
  const { user } = useAuthContext();

  const tableLabels1 = [
    { id: "ProductDetail", label: "Product Deatil" },
    { id: "Agent", label: "Agent Commission (in %)" },
    { id: "Distributor", label: "Distributor Commission(in %)" },
    { id: "MDistributor", label: "Master Distributor Commission (in %)" },
  ];
  const tableLabels2 = [
    { id: "ProductDetail", label: "Product Deatil" },
    { id: "Agent", label: "Agent Commission (in %)" },
    { id: "Distributor", label: "Distributor Commission (in %)" },
  ];
  const tableLabels3 = [
    { id: "ProductDetail", label: "Product Deatil (in %)" },
    { id: "Agent", label: "Agent Commission (in %)" },
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
        <TableCell>{row.productName}</TableCell>
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
        Scheme Not Created for Recharges. Please Contact to Admin.
      </Typography>
    </Stack>
  );
}
