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
import { useEffect } from "react";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";
import { useAuthContext } from "src/auth/useAuthContext";
import NoSchemeFound from "src/assets/illustrations/NoSchemeFound";

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  minSlab: string;
  maxSlab: string;
  commissionType: string;
  masterDistributorCommissionType: string;
  masterDistributorCommission: string;
  distributorCommissionType: string;
  distributorCommission: string;
  agentCommissionType: string;
  agentCommission: string;
};

interface Props extends CardProps {
  comData: any;
}

export default function ViewDmt1able({ comData, ...other }: Props) {
  const { user, Api, UploadFileApi } = useAuthContext();

  const tableLabels1 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "AgentCommissionType", label: "Agent Commission Type" },
    { id: "AgentCommission", label: "Agent Commission" },
    { id: "DistributorComType", label: "Distributor Commission type" },
    { id: "Distributor", label: "Distributor Commission" },
    { id: "MDistributorType", label: "MasterDistributor Commission Type" },
    { id: "MDistributor", label: "Master Distributor Commission" },
  ];
  const tableLabels2 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "AgentCommissionType", label: "Agent Commission Type" },
    { id: "AgentCommission", label: "Agent Commission" },
    { id: "DistributorComType", label: "Distributor Commission type" },
    { id: "Distributor", label: "Distributor Commission" },
  ];
  const tableLabels3 = [
    { id: "min", label: "Min. Slab" },
    { id: "max", label: "Max. Slab" },
    { id: "AgentCommissionType", label: "Agent Commission Type" },
    { id: "AgentCommission", label: "Agent Commission" },
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
          {row.agentCommissionType == "flat"
            ? "Rs."
            : row.agentCommissionType == "percentage"
            ? "%"
            : "-"}
        </TableCell>
        <TableCell>{row.agentCommission}</TableCell>

        {agentRole == "distributor" && (
          <>
            <TableCell>
              {" "}
              {row.distributorCommissionType == "flat"
                ? "Rs."
                : row.distributorCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{row.distributorCommission || "-"}</TableCell>
          </>
        )}
        {agentRole == "m_distributor" && (
          <>
            <TableCell>
              {" "}
              {row.distributorCommissionType == "flat"
                ? "Rs."
                : row.distributorCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
            <TableCell>{row.distributorCommission || "-"}</TableCell>
            <TableCell>
              {" "}
              {row.masterDistributorCommissionType == "flat"
                ? "Rs."
                : row.masterDistributorCommissionType == "percentage"
                ? "%"
                : "-"}
            </TableCell>
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
        Scheme Not Created for DMT1. Please Contact to Admin.
      </Typography>
    </Stack>
  );
}
