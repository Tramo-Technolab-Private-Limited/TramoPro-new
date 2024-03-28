import { useEffect, useState } from "react";
import {
  Stack,
  MenuItem,
  Grid,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
  Card,
  Button,
} from "@mui/material";
import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import ConfirmDialog from "src/components/confirm-dialog/ConfirmDialog";
import TransactionModal from "src/components/customFunctions/TrasactionModal";
import { CustomAvatar } from "src/components/custom-avatar";
import RoleBasedGuard from "src/auth/RoleBasedGuard";
import { TableHeadCustom, TableNoData } from "src/components/table";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { fDateTime } from "src/utils/formatTime";
import Iconify from "src/components/iconify";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { useNavigate } from "react-router";
import FundFlow from "./FundFlow";
type FormValuesProps = {
  transactionType: string;
  User: string;
  from: {
    firstName: string;
    lastName: string;
    userCode: string;
    contact_no: string;
    _id: string;
  };
  to: {
    firstName: string;
    lastName: string;
    userCode: string;
    contact_no: string;
    _id: string;
  };
  reason: string;
  transactionid: string;
  amount: string;
  remarks: string;
};

export default function ManageFundFlow() {
  const { enqueueSnackbar } = useSnackbar();

  const [sdata, setSdata] = useState([]);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentPage, setCurrentPage] = useState<any>(1);

  //confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleOpenDetails = () => setOpenConfirm(true);
  const handleCloseDetails = () => {
    setOpenConfirm(false);
  };

  const navigate = useNavigate();
  const tableLabels = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "TransactionType", label: "Transaction Type" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "From", label: "From" },
    { id: "to", label: "To" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
  ];

  useEffect(() => {
    getTransaction();
  }, []);

  const getTransaction = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);

            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
        }
      }
    );
  };

  return (
    <>
      <Grid
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 2,
        }}
      >
        <Stack>
          <Card>
            <FundFlow />
          </Card>
        </Stack>

        <Stack
          sx={{
            bgcolor: "#00000",
            boxShadow: "5",
            borderRadius: "10px",
            textAlign: "left",
            gap: 2,
          }}
        >
          <Stack
            justifyContent="space-between"
            alignItems="center"
            flexDirection="row"
            p={1}
          >
            <Typography variant="h6">Last 5 Transactions</Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/auth/transaction/fundflow")}
            >
              All Transactions
            </Button>
          </Stack>

          {/* Transaction table */}
          <Scrollbar>
            <Table stickyHeader aria-label="sticky table">
              <TableHeadCustom headLabel={tableLabels} />
              <TableBody>
                {sdata.slice(0, 5).map((row: any) => (
                  <TransactionRow key={row._id} row={row} />
                ))}
              </TableBody>
              <TableNoData isNotFound={!sdata.length} />
            </Table>
          </Scrollbar>
        </Stack>
      </Grid>
    </>
  );
}

type childProps = {
  row: any;
};

const TransactionRow = React.memo(({ row }: childProps) => {
  const { user } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  return (
    <>
      <TableRow hover key={newRow._id}>
        {/* Date & Time */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {fDateTime(newRow?.createdAt)}
        </TableCell>
        {/* transaction Type */}
        <TableCell>
          <Typography variant="body2">{newRow?.transactionType} </Typography>
        </TableCell>
        {/* client ref id */}
        <TableCell>
          <Typography variant="body2">
            {newRow?.clientRefId}{" "}
            <Tooltip title="Copy" placement="top">
              <IconButton onClick={() => onCopy(newRow?.clientRefId)}>
                <Iconify icon="eva:copy-fill" width={20} />
              </IconButton>
            </Tooltip>
          </Typography>
        </TableCell>
        {/* From */}
        <TableCell>
          {newRow?.walletLedgerData?.from?.id ==
          newRow?.adminDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.adminDetails?.id?.email}
                alt={newRow?.adminDetails?.id?.email}
                src={
                  newRow?.adminDetails?.id?.selfie &&
                  newRow?.adminDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  Admin
                </Typography>
                <Typography variant="body2" noWrap>
                  {newRow?.adminDetails?.id?.email}
                </Typography>
              </Stack>
            </Stack>
          ) : newRow?.walletLedgerData?.from?.id ==
            newRow.agentDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.agentDetails?.id?.firstName}
                alt={newRow?.agentDetails?.id?.firstName}
                src={
                  newRow?.agentDetails?.id?.selfie &&
                  newRow?.agentDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.agentDetails?.id?.firstName}{" "}
                  {newRow?.agentDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          ) : newRow?.walletLedgerData?.from?.id ==
            newRow.distributorDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.distributorDetails?.id?.firstName}
                alt={newRow?.distributorDetails?.id?.firstName}
                src={
                  newRow?.distributorDetails?.id?.selfie &&
                  newRow?.distributorDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.distributorDetails?.id?.firstName}{" "}
                  {newRow?.distributorDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.distributorDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          ) : newRow?.walletLedgerData?.from?.id ==
            newRow.masterDistributorDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.masterDistributorDetails?.id?.firstName}
                alt={newRow?.masterDistributorDetails?.id?.firstName}
                src={
                  newRow?.masterDistributorDetails?.id?.selfie &&
                  newRow?.masterDistributorDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                  {newRow?.masterDistributorDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.masterDistributorDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.agentDetails?.id?.firstName}
                alt={newRow?.agentDetails?.id?.firstName}
                src={
                  newRow?.agentDetails?.id?.selfie &&
                  newRow?.agentDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.agentDetails?.id?.firstName}{" "}
                  {newRow?.agentDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          )}
        </TableCell>
        {/* To */}
        <TableCell>
          {newRow?.walletLedgerData?.to?.id == newRow.adminDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.adminDetails?.id?.email}
                alt={newRow?.adminDetails?.id?.email}
                src={
                  newRow?.adminDetails?.id?.selfie &&
                  newRow?.adminDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  Admin
                </Typography>
                <Typography variant="body2" noWrap>
                  {newRow?.adminDetails?.id?.email}
                </Typography>
              </Stack>
            </Stack>
          ) : newRow?.walletLedgerData?.to?.id ==
            newRow.agentDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.agentDetails?.id?.firstName}
                alt={newRow?.agentDetails?.id?.firstName}
                src={
                  newRow?.agentDetails?.id?.selfie &&
                  newRow?.agentDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.agentDetails?.id?.firstName}{" "}
                  {newRow?.agentDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          ) : newRow?.walletLedgerData?.to?.id ==
            newRow.distributorDetails.id?._id ? (
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.distributorDetails?.id?.firstName}
                alt={newRow?.distributorDetails?.id?.firstName}
                src={
                  newRow?.distributorDetails?.id?.selfie &&
                  newRow?.distributorDetails?.id?.selfie[0]
                }
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.distributorDetails?.id?.firstName}{" "}
                  {newRow?.distributorDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.distributorDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            newRow?.walletLedgerData?.to?.id ==
              newRow.masterDistributorDetails.id?._id && (
              <Stack flexDirection={"row"} gap={1}>
                <CustomAvatar
                  name={newRow?.masterDistributorDetails?.id?.firstName}
                  alt={newRow?.masterDistributorDetails?.id?.firstName}
                  src={
                    newRow?.masterDistributorDetails?.id?.selfie &&
                    newRow?.masterDistributorDetails?.id?.selfie[0]
                  }
                />
                <Stack>
                  <Typography variant="body2" noWrap>
                    {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                    {newRow?.masterDistributorDetails?.id?.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {newRow?.masterDistributorDetails?.id?.userCode}
                  </Typography>
                </Stack>
              </Stack>
            )
          )}
        </TableCell>

        {/* Transaction */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {user?._id == newRow?.walletLedgerData?.from?.id ? (
            <Typography variant="body2" color={"error.main"}>
              - {newRow.amount}
            </Typography>
          ) : (
            <Typography variant="body2" color={"success.main"}>
              + {newRow.amount}
            </Typography>
          )}
        </TableCell>

        <TableCell
          sx={{
            textTransform: "lowercase",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <Typography>
            <Label
              variant="soft"
              color={
                (newRow.status === "failed" && "error") ||
                ((newRow.status === "pending" ||
                  newRow.status === "in_process") &&
                  "warning") ||
                "success"
              }
              sx={{ textTransform: "capitalize" }}
            >
              {newRow.status ? sentenceCase(newRow.status) : ""}
            </Label>
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
});
