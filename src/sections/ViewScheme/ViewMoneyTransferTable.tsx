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
import NoSchemeFound from "src/assets/illustrations/NoSchemeFound";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  minSlab: string;
  maxSlab: string;
  commissionType: string;
  chargeType: string;
  agentCharge: string;
  masterDistributorCommission: string;
  distributorCommission: string;
  agentCommission: string;
};

interface Props extends CardProps {
  comData: any;
}

export default function ViewMoneyTransferTable({ comData, ...other }: Props) {
  const { user, Api, UploadFileApi } = useAuthContext();

  const tableLabels1 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "chargeType", label: "Charge Type" },
    { id: "charge", label: "Agent Charge" },
    { id: "commissionType", label: "commission Type" },
    { id: "Distributor", label: "Distributor Commission" },
    { id: "MDistributor", label: "Master Distributor Commission" },
  ];
  const tableLabels2 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "chargeType", label: "Charge Type" },
    { id: "charge", label: "Agent Charge" },
    { id: "commissionType", label: "commission Type" },
    { id: "Distributor", label: "Distributor Commission" },
  ];
  const tableLabels3 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "chargeType", label: "Charge Type" },
    { id: "charge", label: "Agent Charge" },
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
        <TableCell>{row.minSlab}</TableCell>
        <TableCell>{row.maxSlab}</TableCell>
        <TableCell>
          {row.chargeType == "flat"
            ? "Rs."
            : row.chargeType == "percentage"
            ? "%"
            : "-"}
        </TableCell>
        <TableCell>{row.agentCharge || "-"}</TableCell>
        {agentRole == "distributor" && (
          <>
            <TableCell>{row.commissionType || "-"}</TableCell>
            <TableCell>{row.distributorCommission || "-"}</TableCell>
          </>
        )}
        {agentRole == "m_distributor" && (
          <>
            <TableCell>
              {row.commissionType == "flat"
                ? "Rs."
                : row.commissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{row.distributorCommission || "-"}</TableCell>
            <TableCell>{row.masterDistributorCommission || "-"}</TableCell>
          </>
        )}
      </TableRow>
    </>
  );
}

function NoData() {
  return (
    <Stack justifyContent={"center"} p={2}>
      <Typography textAlign={"center"} fontSize={25}>
        <NoSchemeFound />
        Scheme Not Created. Please Contact to Admin.
      </Typography>
    </Stack>
  );
}
