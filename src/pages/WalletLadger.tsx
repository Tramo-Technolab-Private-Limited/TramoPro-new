import { useEffect, useState } from "react";
import { Card, Stack, Grid, TableHead, Modal, Button } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "notistack";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Typography,
  TableContainer,
} from "@mui/material";
import Label from "src/components/label/Label";
import { TableHeadCustom } from "src/components/table";
import React from "react";
import Iconify from "src/components/iconify/Iconify";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "../components/customFunctions/CustomPagination";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import * as XLSX from "xlsx";
import FileFilterButton from "../sections/MyTransaction/FileFilterButton";
import { fDate, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ----------------------------------------------------------------------

type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function WalletLadger() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [ladgerData, setLadgerData] = useState([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sendLoding, setSendLoading] = useState(false);
  const [WalletCount, setWalletCount] = useState(0);

  const agenttableLabels = [
    { id: "date/LadgerID", label: "Date/LadgerID" },
    { id: "fromName", label: "From / To" },
    { id: "amount", label: "Amount" },
    { id: "opeing", label: "Opening/Closing " },
    { id: "productName", label: "Product/TransactionType " },
    { id: "walletType", label: "WalletType " },
    { id: "reason", label: "reason " },

    { id: "walletId", label: "Wallet Id" },
  ];
  const distributortableLabels = [
    { id: "date/LadgerID", label: "Date/LadgerID" },
    { id: "fromName", label: "From / To" },
    { id: "amount", label: "Amount" },
    { id: "opeing", label: "Opening/Closing " },
    { id: "productName", label: "Product/TransactionType " },
    { id: "walletType", label: "WalletType " },
    { id: "reason", label: "reason " },

    { id: "walletId", label: "Wallet Id" },
  ];
  const MDtableLabels = [
    { id: "date/LadgerID", label: "Date/LadgerID" },
    { id: "fromName", label: "From / To" },
    { id: "amount", label: "Amount" },
    { id: "opeing", label: "Opening/Closing " },
    { id: "productName", label: "Product/TransactionType " },
    { id: "walletType", label: "WalletType " },
    { id: "reason", label: "reason " },
    // { id: "remarks", label: "remarks" },
    { id: "walletId", label: "Wallet Id" },
  ];

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(new Date(), new Date());

  useEffect(() => {
    getTransactional();
  }, [currentPage]);

  const getTransactional = () => {
    let token = localStorage.getItem("token");
    setSendLoading(true);

    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`agent/walletLedger`, "POST", body, token).then((Response: any) => {
      console.log("======Transaction==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setLadgerData(Response.data?.data?.data);
          setWalletCount(Response.data.data.totalNumberOfRecords);
          enqueueSnackbar(Response.data.message);
          setSendLoading(false);
        } else {
          enqueueSnackbar(Response.data.message);
          setSendLoading(false);
        }
      }
    });
  };

  const ExportData = () => {
    let token = localStorage.getItem("token");

    let body = {
      pageInitData: {
        pageSize: "",
        currentPage: "",
      },
      clientRefId: "",
      status: "",
      transactionType: "",
      startDate: startDate,
      endDate: endDate,
    };

    Api(`agent/walletLedger`, "POST", body, token).then((Response: any) => {
      console.log("======walletLedger==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data.data.length) {
            const Dataapi = Response.data.data.data;

            console.log(
              "Response of the ==============walletLedger===========>",
              Response.data?.data?.data
            );
            const formattedData = Response.data.data.data.map((item: any) => ({
              createdAt: new Date(item?.createdAt).toLocaleString(),
              client_ref_Id: item?.client_ref_Id,
              walletId: item?.walletId,
              "Opening Balance":
                user?._id === item?.agentDetails?.id?._id
                  ? item?.agentDetails?.oldMainWalletBalance
                  : user?._id === item?.distributorDetails?.id?._id
                  ? item?.distributorDetails?.oldMainWalletBalance
                  : user?._id === item?.masterDistributorDetails?.id?._id
                  ? item?.masterDistributorDetails?.oldMainWalletBalance
                  : "",

              "Closing Balance":
                user?._id === item?.agentDetails?.id?._id
                  ? item?.agentDetails?.newMainWalletBalance
                  : user?._id === item?.distributorDetails?.id?._id
                  ? item?.distributorDetails?.newMainWalletBalance
                  : user?._id === item?.masterDistributorDetails?.id?._id
                  ? item?.masterDistributorDetails?.newMainWalletBalance
                  : "",
              " Commission Amount":
                user?._id === item?.agentDetails?.id?._id
                  ? item?.agentDetails?.commissionAmount
                  : user?._id === item?.distributorDetails?.id?._id
                  ? item?.distributorDetails?.commissionAmount
                  : user?._id === item?.masterDistributorDetails?.id?._id
                  ? item?.masterDistributorDetails?.commissionAmount
                  : "",
              GST: item?.transaction?.GST,
              TDS: item?.transaction?.TDS,

              amount: item?.transaction?.amount,
              categoryName: item?.transaction?.categoryName,
              clientRefId: item?.transaction?.clientRefId,
              credit: item?.transaction?.credit,
              debit: item?.transaction?.credit,

              productName: item?.transaction?.productName,
              status: item?.transaction?.status,
              transactionType: item?.transaction?.transactionType,
              vendorUtrNumber: item?.transaction?.vendorUtrNumber,
            }));

            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            const currentDate = fDateTime(new Date());
            XLSX.writeFile(wb, `WalletLadger${currentDate}.xlsx`);

            console.log(
              "======getUser===data.data ===Transaction====>",
              Response
            );
          } else {
            enqueueSnackbar("Data Not Found ");
          }
        } else {
          console.log("======Transaction=======>" + Response);
        }
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Wallet Ladger | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <>
        <Stack flexDirection={"row"} justifyContent={"end"}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            style={{ padding: "0 25px", marginBottom: "10px" }}
          >
            <FileFilterButton
              isSelected={!!isSelectedValuePicker}
              startIcon={<Iconify icon="eva:calendar-fill" />}
              onClick={onOpenPicker}
            >
              {`${fDate(startDate)} - ${fDate(endDate)}`}
            </FileFilterButton>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                variant="input"
                title="Select Date Range"
                startDate={startDate}
                endDate={endDate}
                onChangeStartDate={onChangeStartDate}
                onChangeEndDate={onChangeEndDate}
                open={openPicker}
                onClose={onClosePicker}
                isSelected={isSelectedValuePicker}
                isError={isError}
              />
            </LocalizationProvider>
            <Button variant="contained" onClick={ExportData}>
              Export
            </Button>
          </Stack>
        </Stack>
        {sendLoding ? (
          <ApiDataLoading />
        ) : (
          <Grid item xs={12} md={6} lg={8}>
            <Scrollbar>
              <TableContainer>
                <Table
                  sx={{ minWidth: 720 }}
                  stickyHeader
                  aria-label="sticky table"
                >
                  <TableHeadCustom
                    headLabel={
                      user?.role == "m_distributor"
                        ? MDtableLabels
                        : user?.role == "distributor"
                        ? distributortableLabels
                        : agenttableLabels
                    }
                  />

                  <TableBody>
                    {Array.isArray(ladgerData) &&
                      ladgerData.map((row: any) => (
                        <LadgerRow key={row._id} row={row} />
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          </Grid>
        )}
      </>

      <CustomPagination
        pageSize={pageSize}
        onChange={(event: React.ChangeEvent<unknown>, value: number) => {
          setCurrentPage(value);
        }}
        page={currentPage}
        Count={WalletCount}
      />
    </>
  );
}

const LadgerRow = ({ row }: any) => {
  const { user } = useAuthContext();

  const tableLabelsTO = [
    { id: "productName", label: "Product/TransactionType " },
    { id: "oldMainWalletBalance", label: " Opening/Closing" },
    { id: "commissionAmount", label: " Amount" },
    { id: "credit", label: "Credit/Debit " },
    { id: "GST/TDS", label: "GST/TDS " },
    { id: "Status", label: "Status " },
    { id: "BeneficiaryDetails", label: "BeneficiaryDetails" },
    { id: "operator", label: "Operator " },
    { id: "mobileNumber", label: "MobileNumber " },
  ];

  const [ToFromData, setToFromData] = useState<any>([]);
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
    getTransactionbyId(val.txnId);
    setToFromData(val);
  };
  const handleClose = () => {
    setModalEdit(false);
  };

  const [txnData, setTxnData] = useState([]);
  const getTransactionbyId = (val: string) => {
    let token = localStorage.getItem("token");

    Api(`transaction/transactionById/` + val, "GET", "", token).then(
      (Response: any) => {
        console.log("======transactionById==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            let iterateObj: any = Object.keys(Response.data.data).map(function (
              key
            ) {
              return (
                <option key={key} value={key}>
                  {Response.data.data[key]}
                </option>
              );
            });
            setTxnData(iterateObj);
            console.log(
              "======transactionById===data.data iterateObj====>",
              iterateObj
            );
          } else {
            console.log("======transactionById=======>" + Response);
          }
        }
      }
    );
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <TableRow
        key={row._id}
        hover
        role="checkbox"
        tabIndex={-1}
        sx={{ borderBottom: "1px solid #dadada" }}
      >
        <TableCell>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", cursor: "pointer" }}
          >
            {row?.createdAt
              ? fDateTime(row?.createdAt)
              : fDateTime(row?.transaction?.createdAt)}
          </Typography>
          <Typography variant="body2">{row?.walletId}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {user?._id === row?.to?.id?._id ? (
              <>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Name :</Typography>
                  <Typography variant="body2">
                    {row?.to?.id?.firstName}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Role :</Typography>
                  <Typography variant="body2">{row?.to?.id?.role}</Typography>
                </Stack>
              </>
            ) : (
              <>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Name :</Typography>
                  <Typography variant="body2">
                    {row?.from?.id?.firstName}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Role :</Typography>
                  <Typography variant="body2">{row?.from?.id?.role}</Typography>
                </Stack>
              </>
            )}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {user?._id === row?.to?.id?._id ? (
              <>
                <Typography variant="body1" sx={{ color: "Green" }}>
                  +{row?.to?.amount}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: "Red" }}>
                  -{row?.from?.amount.toFixed(2)}
                </Typography>
              </>
            )}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {user?._id === row?.to?.id?._id ? (
              <>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Opening :</Typography>
                  <Typography variant="body2">
                    {row?.to?.oldMainWalletBalance?.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Closing :</Typography>
                  <Typography variant="body2">
                    {row?.to?.newMainWalletBalance?.toFixed(2)}
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Opening :</Typography>
                  <Typography variant="body2">
                    {row?.from?.oldMainWalletBalance?.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" gap={0.5}>
                  <Typography variant="subtitle2">Closing :</Typography>
                  <Typography variant="body2">
                    {" "}
                    {row?.from?.newMainWalletBalance?.toFixed(2)}
                  </Typography>
                </Stack>
              </>
            )}
          </Typography>
        </TableCell>

        <TableCell>
          {row?.transaction?.productName && (
            <Stack direction="row" gap={0.5}>
              <Typography variant="subtitle2">Product :</Typography>
              <Typography variant="body2">
                {row?.transaction?.productName || "-"}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2">Transaction Type : </Typography>
            <Typography variant="body2">
              {row?.transaction?.transactionType}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {user?._id === row?.to?.id?._id ? (
              <>
                <Typography color={"error"}>
                  <Label
                    variant="soft"
                    color={
                      (row?.to?.walletType === "MAIN" && "error") ||
                      (row?.to?.walletType === "AEPS" && "warning") ||
                      "success"
                    }
                    sx={{ textTransform: "capitalize" }}
                  >
                    {row?.to?.walletType}
                  </Label>
                </Typography>
              </>
            ) : (
              <>
                <Label
                  variant="soft"
                  color={
                    (row?.from?.walletType === "MAIN" && "error") ||
                    (row?.from?.walletType === "AEPS" && "warning") ||
                    "success"
                  }
                  sx={{ textTransform: "capitalize" }}
                >
                  {row?.from?.walletType}
                </Label>
              </>
            )}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {parseFloat(row?.reason) || "-"}
          </Typography>
        </TableCell>

        {row?.transaction?.clientRefId ? (
          <TableCell onClick={() => openEditModal(row)}>
            <Typography
              variant="body1"
              sx={{ color: "blue", textDecoration: "underline" }}
            >
              {row?.transaction?.clientRefId || "-"}
            </Typography>
          </TableCell>
        ) : (
          "No Trasaction"
        )}
      </TableRow>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          item
          xs={6}
          md={6}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Card sx={{ p: 3 }}>
            <TableContainer style={{ margin: "0 auto", maxHeight: "300px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {tableLabelsTO.map((column: any) => (
                      <TableCell key={column.id}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow
                    key={ToFromData._id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    sx={{ borderBottom: "1px solid #dadada" }}
                  >
                    <TableCell>
                      {row?.transaction?.productName && (
                        <Stack direction="row" gap={0.5}>
                          <Typography variant="subtitle2">Product:</Typography>
                          <Typography variant="body2">
                            {row?.transaction?.productName || "-"}
                          </Typography>
                        </Stack>
                      )}

                      <Stack gap={0.5}>
                        <Typography variant="subtitle2">
                          Transaction Type:
                        </Typography>
                        <Typography variant="body2">
                          {row?.transaction?.transactionType}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {user?.role == "agent" ? (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails?.newMainWalletBalance?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails
                                ?.commissionAmount || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.agentDetails
                                  ?.creditedAmount
                              }
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails?.TDSAmount?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    ) : user?.role == "distributor" ? (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.distributorDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.distributorDetails?.newMainWalletBalance?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.distributorDetails
                                ?.commissionAmount || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.distributorDetails
                                  ?.creditedAmount
                              }
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.distributorDetails
                                  ?.TDSAmount
                              }
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.newMainWalletBalance?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.commissionAmount?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.creditedAmount?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.TDSAmount?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    )}

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Credit:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.credit?.toFixed(2)}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Debit:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.debit?.toFixed(2)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">TDS:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.TDS.toFixed(2)}
                        </Typography>
                      </Stack>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">GST:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.GST?.toFixed(2)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Status:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.status}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Bank:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.bankName
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">AccNumber:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.accountNumber
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">beneName:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.beneName
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">ifsc:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.ifsc
                          }
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Bank:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key1}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">IFSC:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key2}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">AccNumber:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key3}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {ToFromData?.transaction?.mobileNumber}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                mt: 5,
                ml: 1,
              }}
            >
              Close
            </Button>
          </Card>
        </Grid>
      </Modal>
    </>
  );
};
