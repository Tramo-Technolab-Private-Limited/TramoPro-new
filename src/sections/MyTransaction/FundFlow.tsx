import { useEffect, useRef, useState } from "react";

// @mui
import {
  Stack,
  Grid,
  Pagination,
  TextField,
  Tabs,
  Tab,
  Button,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CircularProgress,
  Typography,
  IconButton,
  Icon,
  TableHead,
  useTheme,
  Tooltip,
  Modal,
  TableContainer,
  Avatar,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "notistack";
import React from "react";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar";
import { TableHeadCustom } from "src/components/table";
import receipt_long from "../../assets/icons/receipt_long.svg";
import Group from "../../assets/icons/Group.svg";
import autorenew from "../../assets/icons/autorenew.svg";
import LogoMain from "../../assets/icons/tramoTrmao-Final-Logo.svg";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import FileFilterButton from "./FileFilterButton";
import Iconify from "src/components/iconify/Iconify";
import ReactToPrint from "react-to-print";
import ApiDataLoading from "../../components/customFunctions/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDate, fDateTime } from "src/utils/formatTime";
// ----------------------------------------------------------------------

export default function FundFlow() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [Loading, setLoading] = useState(false);
  const [superCurrentTab, setSuperCurrentTab] = useState(1);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>(0);

  const [refId, setRefId] = useState("");
  const [sdata, setSdata] = useState([]);
  const [pageSize, setPageSize] = useState<any>(20);

  const handlePageChange = (event: any, value: any) => {
    setCurrentPage(value);
    getTransaction(value);
  };

  useEffect(() => {
    getTransaction();
  }, []);

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

  const getTransaction = (page: number = 1) => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: page,
      },
      clientRefId: "",
      status: "",
      transactionType: "",
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
          setLoading(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setLoading(false);
        }
      }
    );
  };

  const filterTransaction = (status: string, refId: string) => {
    setLoading(true);
    setSdata([]);
    if (refId) setSuperCurrentTab(0);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: refId,
      status: status == "all" ? "" : status,
      transactionType: "",
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
          setLoading(false);
        } else {
          setLoading(false);
          enqueueSnackbar("Failed", { variant: "error" });
        }
      }
    );
  };

  const tableLabels = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "Operator Txn ID" },
    { id: "Transaction Type", label: "Transaction" },
    { id: "Commission", label: "Commission" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
  ];
  const tableLabels1 = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "Operator Txn ID" },
    { id: "Transaction Type", label: "Transaction" },
    { id: "Commission", label: "Commission" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
  ];
  const tableLabels2 = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "Operator Txn ID" },
    { id: "Transaction Type", label: "Transaction" },
    { id: "Commission", label: "Commission" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
  ];

  const TabLabel = [{ id: 1, label: "all" }];

  const ExportData = () => {
    let token = localStorage.getItem("token");
    let body = {
      startDate: startDate,
      endDate: endDate,
    };
    Api(`transaction/transactionByUser`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            enqueueSnackbar(Response.data.message);
            console.log(
              "======getUser===data.data ===Transaction====>",
              Response
            );
          } else {
            console.log("======Transaction=======>" + Response);
          }
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title> Transactions | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            marginBottom: "20px",
            fontSize: "20px",
          }}
        >
          <Tabs
            value={superCurrentTab}
            variant="scrollable"
            scrollButtons={false}
            sx={{ background: "#F4F6F8" }}
            onChange={(event, newValue) => setSuperCurrentTab(newValue)}
          >
            {TabLabel.map((tab: any) => (
              <Tab
                key={tab.id}
                sx={{ mx: 2, fontSize: { xs: 12, sm: 16 } }}
                label={tab.label}
                iconPosition="top"
                value={tab.id}
                onClick={() => {
                  filterTransaction(tab.label, "");
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Stack flexDirection={"row"} justifyContent={"end"}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          style={{ padding: "0 25px", marginBottom: "10px" }}
        >
          <TextField
            id="outlined-password-input"
            label="Search By Ref Id"
            size="small"
            type="text"
            onChange={(e) => setRefId(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => filterTransaction("", refId)}
          >
            Search
          </Button>
          <FileFilterButton
            isSelected={!!isSelectedValuePicker}
            startIcon={<Iconify icon="eva:calendar-fill" />}
            onClick={onOpenPicker}
          >
            {`${fDate(startDate)} - ${fDate(endDate)}`}
          </FileFilterButton>

          <DateRangePicker
            variant="calendar"
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
          <Button variant="contained" onClick={ExportData}>
            Export
          </Button>
        </Stack>
      </Stack>
      <Grid item xs={12} md={6} lg={8}>
        {Loading ? (
          <ApiDataLoading />
        ) : (
          <>
            <Scrollbar>
              <Table
                sx={{ minWidth: 720 }}
                stickyHeader
                aria-label="sticky table"
              >
                <TableHeadCustom
                  headLabel={
                    user?.role == "m_distributor"
                      ? tableLabels
                      : user?.role == "distributor"
                      ? tableLabels1
                      : tableLabels2
                  }
                />

                <TableBody>
                  {sdata.map((row: any) => (
                    <TransactionRow key={row._id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
            <Stack
              sx={{
                position: "fixed",
                bottom: 25,
                left: "50%",
                transform: "translate(-50%)",
                bgcolor: "white",
              }}
            >
              <Pagination
                count={
                  Math.floor(pageCount / pageSize) +
                  (pageCount % pageSize === 0 ? 0 : 1)
                }
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Stack>
          </>
        )}
      </Grid>
    </>
  );
}

type childProps = {
  row: any;
};

function TransactionRow({ row }: childProps) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const componentRef = useRef<any>();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const CheckTransactionStatus = (row: any) => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let rowFor = row.categoryName.toLowerCase();
    Api(
      rowFor.toLowerCase() == "money transfer"
        ? `moneyTransfer/checkStatus/` + row._id
        : rowFor.toLowerCase() == "recharge"
        ? `agents/v1/checkStatus/` + row._id
        : rowFor.toLowerCase() == "dmt2" &&
          `dmt2/transaction/status/` + row._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setNewRow({ ...newRow, status: Response.data.data.status });
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
        setLoading(false);
      }
    });
  };

  return (
    <>
      <TableRow hover key={newRow._id}>
        {/* Date & Time */}
        <TableCell>
          <Typography variant="body2">
            {fDateTime(newRow?.createdAt)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{newRow?.transactionType}</Typography>
          <Typography variant="body2">{newRow?.clientRefId}</Typography>
        </TableCell>

        {/* Agent Detail */}
        {user?.role === "distributor" && (
          <TableCell>
            <Stack flexDirection={"row"} gap={1}>
              <Avatar
                alt={newRow?.agentDetails?.id?.firstName}
                src={newRow?.agentDetails?.id?.selfie}
              />
              <Stack>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.firstName}{" "}
                  {newRow?.agentDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.userCode}
                </Typography>
              </Stack>
            </Stack>
          </TableCell>
        )}

        {/* Distributor Detail */}
        {user?.role === "m_distributor" && (
          <>
            <TableCell>
              <Stack flexDirection={"row"} gap={1}>
                <Avatar
                  alt={newRow?.agentDetails?.id?.firstName}
                  src={newRow?.agentDetails?.id?.selfie}
                />
                <Stack>
                  <Typography variant="body2">
                    {newRow?.agentDetails?.id?.firstName}{" "}
                    {newRow?.agentDetails?.id?.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {newRow?.agentDetails?.id?.userCode}
                  </Typography>
                </Stack>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack flexDirection={"row"} gap={1}>
                <Avatar
                  alt={newRow?.distributorDetails?.id?.firstName}
                  src={newRow?.distributorDetails?.id?.selfie}
                />
                <Stack>
                  <Typography variant="body2">
                    {newRow?.distributorDetails?.id?.firstName}{" "}
                    {newRow?.distributorDetails?.id?.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {newRow?.distributorDetails?.id?.userCode}
                  </Typography>
                </Stack>
              </Stack>
            </TableCell>
          </>
        )}

        {/* Product  */}
        <TableCell>
          <Typography variant="body2">{newRow?.productName || "-"}</Typography>
        </TableCell>

        {/* Operator */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">{newRow?.operator?.key1}</Typography>
          <Typography variant="body2">{newRow?.operator?.key2}</Typography>
          <Typography variant="body2">{newRow?.operator?.key3}</Typography>
        </TableCell>

        {/* Mobile Number */}
        <TableCell>
          <Typography variant="body2">{newRow.mobileNumber}</Typography>
        </TableCell>

        {/* Operator Txn Id */}
        <TableCell>
          <Typography variant="body2">{newRow.vendorUtrNumber}</Typography>
        </TableCell>

        {/* Transaction */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">Txn Amount : {newRow.amount}</Typography>
          <Typography color={theme.palette.success.main} variant="body2">
            Credit : {newRow?.credit}
          </Typography>
          <Typography color={theme.palette.error.main} variant="body2">
            Debit : {newRow?.debit}
          </Typography>
        </TableCell>

        {/* Commission */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">
            Commission :{" "}
            {parseFloat(
              user?.role === "agent"
                ? newRow?.agentDetails?.creditedAmount
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.creditedAmount
                : newRow?.masterDistributorDetails?.creditedAmount
            )?.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Opening Balance :{" "}
            {parseFloat(
              user?.role === "agent"
                ? newRow?.agentDetails?.oldMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.oldMainWalletBalance
                : newRow?.masterDistributorDetails?.oldMainWalletBalance
            )?.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Closing Balance :{" "}
            {parseFloat(
              user?.role === "agent"
                ? newRow?.agentDetails?.newMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.newMainWalletBalance
                : newRow?.masterDistributorDetails?.newMainWalletBalance
            )?.toFixed(2)}
          </Typography>
        </TableCell>

        {/* GST/TDS */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">
            GST : {parseFloat(newRow?.GST)?.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            TDS : {parseFloat(newRow?.TDS)?.toFixed(3)}
          </Typography>
        </TableCell>

        <TableCell
          sx={{
            textTransform: "lowercase",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <Typography
            sx={
              newRow.status.toLowerCase() == "pending" ||
              newRow.status.toLowerCase() == "hold"
                ? { color: "#ffc107" }
                : newRow.status.toLowerCase() == "failed"
                ? { color: "#dc3545" }
                : { color: "#198754" }
            }
          >
            {newRow.status}
          </Typography>
        </TableCell>

        {/* <TableCell>
          <Stack flexDirection={'row'} flexWrap={'nowrap'} width={100}>
            <IconButton>
              <img src={Group} alt="Receipt Icon" />
            </IconButton>
            {newRow.status !== 'success' && (
              <Tooltip title="Check Status" placement="top">
                <IconButton
                  onClick={() => !loading && CheckTransactionStatus(newRow)}
                  color="primary"
                  aria-label="check transaction status"
                >
                  <img src={autorenew} alt="Receipt Icon" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton>
              <img src={receipt_long} alt="Receipt Icon" onClick={openModal} />
            </IconButton>
          </Stack>
        </TableCell> */}
      </TableRow>
      <Modal
        open={modalOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            p: 4,
            borderRadius: "20px",
          }}
        >
          <TableContainer ref={componentRef}>
            <TableRow sx={{ display: "flex" }}>
              <Typography fontSize={10} marginLeft={2}>
                {" "}
                <Typography fontSize={15}>{user?.shopAddress}</Typography>
                <Typography fontSize={10} sx={{ marginTop: "10px" }}>
                  <Typography fontSize={10}>
                    {" "}
                    Sender Details :{newRow?.agentDetails?.id?.firstName}
                    {newRow?.agentDetails?.id?.lastName}{" "}
                  </Typography>
                  <Typography fontSize={10}>
                    {" "}
                    Mobile Number :{newRow?.contact_no}
                  </Typography>
                  <Typography fontSize={10}>
                    {" "}
                    Service Type : {newRow?.categoryName}
                  </Typography>
                </Typography>
              </Typography>
              <Typography variant="h6" marginLeft={15}>
                PAYMENT RECEIPT
              </Typography>
              <TableCell>
                <Typography marginLeft={3}>
                  <img src={LogoMain} alt="LOGO" width={"50%"} height={"50%"} />{" "}
                  <Typography variant="h6">
                    {" "}
                    Benificary Details
                    <br />
                  </Typography>
                  <Typography fontSize={10}>
                    {" "}
                    Account Holder Name :{" "}
                    {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                  </Typography>
                  <Typography fontSize={10}>
                    {" "}
                    Bank Name :{" "}
                    {newRow?.moneyTransferBeneficiaryDetails?.bankName}{" "}
                  </Typography>
                  <Typography fontSize={10}>
                    Account Number :
                    {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                  </Typography>
                  <Typography fontSize={10}>
                    {" "}
                    IFSC :{newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                  </Typography>
                </Typography>
              </TableCell>
            </TableRow>
            <Table sx={{ border: "1px solid black" }}>
              <TableHead>
                <TableRow sx={{ border: "1px solid black" }}>
                  <TableCell sx={{ border: "1px solid black" }}>
                    Client Ref Id
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    Mode
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    UTR
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    Amount
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableCell
                  sx={{ whiteSpace: "nowrap", border: "1px solid black" }}
                >
                  <Typography variant="subtitle2">
                    {newRow?.clientRefId}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: "1px solid black" }}>
                  <Typography>{newRow?.productName}</Typography>
                </TableCell>
                <TableCell
                  sx={{ placeItems: "center", border: "1px solid black" }}
                >
                  <Typography>{newRow?.vendorUtrNumber}</Typography>
                </TableCell>
                <TableCell
                  sx={{ placeItems: "center", border: "1px solid black" }}
                >
                  <Typography>{newRow?.amount}</Typography>
                </TableCell>
                <TableCell
                  sx={{
                    textTransform: "lowercase",
                    fontWeight: 600,
                    textAlign: "left",
                    border: "1px solid black",
                  }}
                >
                  <Typography>{newRow.status}</Typography>
                </TableCell>
              </TableBody>
              <TableCell sx={{ columnSpan: "5" }}>
                <Typography fontSize={9}>
                  Transaction Amount:{newRow.amount}
                  <Typography fontSize={9}>
                    Convienience Fee:{newRow.amount}
                  </Typography>
                  <Typography fontSize={9}>
                    Total Amount:{newRow.newMainWalletBalance}
                  </Typography>
                </Typography>
              </TableCell>
            </Table>
            <Typography variant="body2" paddingBottom={1}>
              Note: This transaction receipt is generated automatically and dose
              not require a physical signature. It is not a tax invoice but
              serves as a record of your transaction with Tramo. Please retain
              it for your refrence, and if you have any queries, fell free to
              contact our Customer Support team.
            </Typography>
          </TableContainer>
          <Stack flexDirection={"row"}>
            <Button onClick={closeModal}>close</Button>
            <ReactToPrint
              trigger={() => <Button>Print this out!</Button>}
              content={() => componentRef.current}
              onAfterPrint={closeModal}
            />
          </Stack>
        </Grid>
      </Modal>
    </>
  );
}
