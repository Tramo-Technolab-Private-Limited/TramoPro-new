import { useEffect, useRef, useState } from "react";

// @mui
import {
  Stack,
  Grid,
  TextField,
  Tabs,
  Tab,
  Button,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableHead,
  useTheme,
  Tooltip,
  Modal,
  TableContainer,
  Avatar,
  Card,
  Divider,
  MenuItem,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import React from "react";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar";
import { TableHeadCustom } from "src/components/table";
import receipt_long from "../assets/icons/receipt_long.svg";
import Group from "../assets/icons/Group.svg";
import autorenew from "../assets/icons/autorenew.svg";
import LogoMain from "../assets/icons/tramoTrmao-Final-Logo.svg";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import FileFilterButton from "../sections/MyTransaction/FileFilterButton";
import Iconify from "src/components/iconify/Iconify";
import ReactToPrint from "react-to-print";
import * as XLSX from "xlsx";
import { fDate, fDateTime } from "../utils/formatTime";
import Image from "../components/image";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { useAuthContext } from "src/auth/useAuthContext";
import CustomPagination from "src/components/customFunctions/CustomPagination";
import FormProvider, { RHFSelect, RHFTextField } from "../components/hook-form";
import { LoadingButton } from "@mui/lab";
import Logo from "src/components/logo/Logo";
import { fCurrency } from "src/utils/formatNumber";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { Icon } from "@iconify/react";

// ----------------------------------------------------------------------

type FormValuesProps = {
  status: string;
  clientRefId: string;
  category: string;
};

export default function MyTransactions() {
  const { user } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const [Loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>(0);
  const [categoryList, setCategoryList] = useState([]);
  const [sdata, setSdata] = useState([]);
  const [pageSize, setPageSize] = useState<any>(20);

  const txnSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
  });

  const defaultValues = {
    category: "",
    status: "",
    clientRefId: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(txnSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    getCategoryList();
    getTransaction();
  }, [currentPage]);

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

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(Response.data.data);
        }
      }
    });
  };

  const getTransaction = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId"),
      status: getValues("status"),
      transactionType: "",
      categoryId: getValues("category"),
    };

    Api(`transaction/transactionByUser`, "POST", body, token).then(
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

  const filterTransaction = async (data: FormValuesProps) => {
    try {
      setSdata([]);
      setCurrentPage(1);
      setLoading(true);
      let token = localStorage.getItem("token");
      let body = {
        pageInitData: {
          pageSize: pageSize,
          currentPage: currentPage,
        },
        clientRefId: data.clientRefId,
        status: data.status,
        transactionType: "",
        categoryId: data.category,
      };
      await Api(`transaction/transactionByUser`, "POST", body, token).then(
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
    } catch (err) {
      console.log(err);
    }
  };

  const tableLabels = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "agent", label: "Agent" },
    { id: "dist", label: "Distributor" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/Reference Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];
  const tableLabels1 = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "agent", label: "Agent" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/Reference Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];
  const tableLabels2 = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/Reference Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];

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

    Api(`transaction/transactionByUser`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            if (Response.data.data.data.length) {
              const Dataapi = Response.data.data.data;
              console.log("Dataapi", Dataapi);

              const formattedData = Response.data.data.data.map(
                (item: any) => ({
                  createdAt: new Date(item?.createdAt).toLocaleString(),
                  client_ref_Id: item?.client_ref_Id,
                  transactionType: item?.transactionType,
                  productName: item?.productName,
                  categoryName: item?.categoryName,
                  "User Name":
                    user?._id === item?.agentDetails?.id?._id
                      ? item?.agentDetails?.id?.firstName
                      : user?._id === item?.distributorDetails?.id?._id
                      ? item?.distributorDetails?.id?.firstName
                      : user?._id === item?.masterDistributorDetails?.id?._id
                      ? item?.masterDistributorDetails?.id?.firstName
                      : "",

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
                  amount: item?.amount,
                  credit: item?.credit,
                  debit: item?.debit,
                  TDS: item?.TDS,
                  GST: item?.GST,
                  ipAddress: item?.metaData?.ipAddress,
                  deviceType: item?.checkStatus?.deviceType,
                  three_way_recoon: item?.three_way_recoon,
                  status: item?.status,
                  bankName: item?.moneyTransferBeneficiaryDetails?.bankName,
                  accountNumber:
                    item?.moneyTransferBeneficiaryDetails?.accountNumber,
                  vendorUtrNumber: item?.vendorUtrNumber,
                  providerBank: item?.providerBank,
                  ifsc: item?.ifsc,
                  operator: item?.key1,
                  number: item?.key2,
                  mobileNumber: item?.mobileNumber,
                })
              );

              const ws = XLSX.utils.json_to_sheet(formattedData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

              const currentDate = fDateTime(new Date());
              XLSX.writeFile(wb, `Transaction${currentDate}.xlsx`);

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
      }
    );
  };

  return (
    <>
      <Helmet>
        <title> Transactions | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(filterTransaction)}
      >
        <Stack
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent={"space-between"}
          m={1}
          gap={1}
        >
          <Stack
            flexDirection={{ xs: "column", sm: "row" }}
            flexBasis={{ xs: "100%", sm: "50%" }}
            gap={1}
          >
            <RHFSelect
              name="category"
              label="Category"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="">None</MenuItem>
              {categoryList.map((item: any) => {
                return (
                  <MenuItem value={item._id}>{item?.category_name}</MenuItem>
                );
              })}
            </RHFSelect>
            <RHFSelect
              name="status"
              label="Status"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_process">In process</MenuItem>
              <MenuItem value="hold">Hold</MenuItem>
              <MenuItem value="initiated">Initiated</MenuItem>
            </RHFSelect>
            <RHFTextField name="clientRefId" label="Client Ref Id" />
            <Stack
              flexDirection={"row"}
              flexBasis={{ xs: "100%", sm: "50%" }}
              gap={1}
            >
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
              >
                Search
              </LoadingButton>
              <LoadingButton
                variant="contained"
                onClick={() => {
                  reset(defaultValues);
                  getTransaction();
                }}
              >
                Clear
              </LoadingButton>
            </Stack>
          </Stack>
          <Stack direction={"row"} gap={1}>
            <FileFilterButton
              isSelected={!!isSelectedValuePicker}
              startIcon={<Iconify icon="eva:calendar-fill" />}
              onClick={onOpenPicker}
            >
              {`${fDate(startDate)} - ${fDate(endDate)}`}
            </FileFilterButton>
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
            <Button variant="contained" onClick={ExportData}>
              Export
            </Button>
          </Stack>
        </Stack>
      </FormProvider>
      <Grid item xs={12} md={6} lg={8}>
        <>
          {Loading ? (
            <ApiDataLoading />
          ) : (
            <Scrollbar>
              <Table
                sx={{ minWidth: 720 }}
                stickyHeader
                size="small"
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
          )}
          {!Loading && (
            <CustomPagination
              pageSize={pageSize}
              onChange={(event: React.ChangeEvent<unknown>, value: number) => {
                setCurrentPage(value);
              }}
              page={currentPage}
              Count={pageCount}
            />
          )}
        </>
      </Grid>
    </>
  );
}

type childProps = {
  row: any;
};

function TransactionRow({ row }: childProps) {
  const theme = useTheme();
  const { copy } = useCopyToClipboard();
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
        : rowFor.toLowerCase() == "recharges"
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

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 720 },
    bgcolor: "#ffffff",
    borderRadius: 2,
  };

  return (
    <>
      <TableRow hover key={newRow._id}>
        {/* Date & Time */}
        <TableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fDateTime(newRow?.createdAt)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2">{newRow?.transactionType}</Typography>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {newRow?.clientRefId}{" "}
            <Tooltip title="Copy" placement="top">
              <IconButton onClick={() => onCopy(newRow?.clientRefId)}>
                <Iconify icon="eva:copy-fill" width={20} />
              </IconButton>
            </Tooltip>
          </Typography>
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
          <Typography variant="body2" textAlign={"center"}>
            {newRow?.productName || "-"}
          </Typography>
        </TableCell>

        {/* Operator */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">{newRow?.operator?.key1}</Typography>
          <Typography variant="body2">{newRow?.operator?.key2}</Typography>
          <Typography variant="body2">{newRow?.operator?.key3}</Typography>
        </TableCell>

        {/* Mobile Number */}
        <TableCell>
          <Typography variant="body2">{newRow?.mobileNumber}</Typography>
        </TableCell>

        {/* Operator Txn Id */}
        <TableCell>
          <Typography variant="body2" textAlign={"center"}>
            {newRow?.vendorUtrNumber || "-"}
          </Typography>
        </TableCell>

        {/* Opening Balance */}
        <TableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fCurrency(
              user?.role === "agent"
                ? newRow?.agentDetails?.oldMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.oldMainWalletBalance
                : newRow?.masterDistributorDetails?.oldMainWalletBalance
            )}
          </Typography>
        </TableCell>

        {/* Transaction Amount */}
        <TableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fCurrency(newRow.amount) || 0}
          </Typography>
        </TableCell>

        {/* Charge/Commission */}
        <TableCell>
          <Stack flexDirection={"row"} justifyContent={"center"}>
            <Typography variant="body2" whiteSpace={"nowrap"} color={"error"}>
              - {fCurrency(newRow.debit) || 0}
            </Typography>{" "}
            /
            <Typography variant="body2" whiteSpace={"nowrap"} color={"green"}>
              +{" "}
              {fCurrency(
                user?.role === "agent"
                  ? newRow?.agentDetails?.creditedAmount
                  : user?.role === "distributor"
                  ? newRow?.distributorDetails?.creditedAmount
                  : newRow?.masterDistributorDetails?.creditedAmount
              ) || 0}
            </Typography>
          </Stack>
        </TableCell>

        {/* Closing Balance */}
        <TableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fCurrency(
              user?.role === "agent"
                ? newRow?.agentDetails?.newMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.newMainWalletBalance
                : newRow?.masterDistributorDetails?.newMainWalletBalance
            )}
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
            textAlign: "center",
          }}
        >
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
        </TableCell>

        <TableCell>
          <Stack flexDirection={"row"} flexWrap={"nowrap"} width={100}>
            <IconButton>
              <img src={Group} alt="Receipt Icon" />
            </IconButton>
            {newRow.status !== "success" && newRow.status !== "failed" && (
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
            {user?.role === "agent" &&
              (newRow?.categoryName == "MONEY TRANSFER" ||
                newRow?.categoryName == "DMT2") && (
                <Tooltip title="View Receipt" placement="top">
                  <IconButton>
                    <img
                      src={receipt_long}
                      alt="Receipt Icon"
                      onClick={openModal}
                    />
                  </IconButton>
                </Tooltip>
              )}
          </Stack>
        </TableCell>
      </TableRow>
      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid sx={style}>
          <Stack
            flexDirection={"row"}
            justifyContent={"flex-end"}
            mt={1}
            mx={1}
          >
            <Tooltip title="Close" onClick={closeModal}>
              <IconButton>
                <Iconify icon="carbon:close-outline" />
              </IconButton>
            </Tooltip>
            <ReactToPrint
              trigger={() => (
                <Tooltip title="Print">
                  <IconButton>
                    <Iconify icon="eva:printer-fill" />
                  </IconButton>
                </Tooltip>
              )}
              content={() => componentRef.current}
              onAfterPrint={closeModal}
            />
          </Stack>
          <Card ref={componentRef} sx={{ p: 3 }}>
            <Scrollbar sx={{ maxHeight: 600 }}>
              <Stack sx={{ pr: 2 }}>
                <Stack>
                  {/* shop detail */}
                  <Stack
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent={"space-between"}
                    mb={1}
                  >
                    <Stack>
                      <Logo />
                    </Stack>
                    <Grid sx={{ mt: 1 }}>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          Agent Name:{" "}
                        </Typography>
                        <Typography variant="subtitle2">
                          {`${user?.firstName} ${user?.lastName}`}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">User code: </Typography>
                        <Typography variant="subtitle2">
                          {`${user?.userCode}`}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Mobile Number:{" "}
                        </Typography>
                        <Typography variant="subtitle2">
                          {user?.contact_no}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Shop Name:{" "}
                        </Typography>
                        <Typography variant="subtitle2">
                          {user?.shopAddress}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Divider />
                  {/* sender & beneficiary  detail */}
                  <Stack
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent={"space-between"}
                    mt={3}
                  >
                    <Grid sx={{ mt: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Sender Details
                      </Typography>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          Sender Name :{" "}
                        </Typography>
                        <Typography variant="body2">
                          {newRow?.moneyTransferSenderId?.remitterFN}
                          {newRow?.moneyTransferSenderId?.remitterLN}{" "}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Mobile Number:{" "}
                        </Typography>
                        <Typography variant="body2">
                          {newRow?.moneyTransferSenderId?.remitterMobile}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Service Type:{" "}
                        </Typography>
                        <Typography variant="body2">
                          {newRow?.productName}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid sx={{ mt: 1 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Benificary Details
                      </Typography>

                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Account Holder Name:{" "}
                        </Typography>
                        <Typography variant="body2">
                          {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Bank Name:{" "}
                        </Typography>
                        <Typography variant="body2">
                          {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2">
                          {" "}
                          Account Number:{" "}
                        </Typography>
                        <Typography variant="body2">
                          {
                            newRow?.moneyTransferBeneficiaryDetails
                              ?.accountNumber
                          }
                        </Typography>
                      </Stack>
                      <Stack flexDirection={"row"} gap={1}>
                        <Typography variant="subtitle2"> IFSC : </Typography>
                        <Typography variant="body2">
                          {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Stack>
                  {/* careated at dat */}
                  <Stack my={3}>
                    <Typography variant="subtitle2">
                      Transaction Date
                    </Typography>
                    <Typography variant="body2">
                      {fDateTime(newRow?.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography variant="subtitle1" my={1}>
                  #Transaction Detail
                </Typography>

                <TableContainer sx={{ overflow: "unset" }}>
                  <Table>
                    <TableRow
                      sx={{
                        borderBottom: (theme) =>
                          `solid 1.5px ${theme.palette.divider}`,
                      }}
                    >
                      <TableCell align="center">
                        <Typography variant="subtitle1">
                          Transaction Id
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">Service</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">UTR</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">Status</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">Amount</Typography>
                      </TableCell>
                    </TableRow>

                    <TableBody>
                      <TableRow
                        sx={{
                          borderBottom: (theme) =>
                            `solid 1.5px ${theme.palette.divider}`,
                        }}
                      >
                        <TableCell align="left">
                          <Typography variant="body2" noWrap>
                            {newRow?.clientRefId}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" noWrap>
                            {newRow?.productName}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" noWrap>
                            {newRow?.vendorUtrNumber || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
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
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" noWrap>
                            Rs.{fCurrency(newRow?.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack my={2}>
                  <Typography align="right" variant="h6" whiteSpace={"nowrap"}>
                    Total Amount : {" " + fCurrency(newRow.amount)}
                  </Typography>
                </Stack>

                <Divider sx={{ mt: 5 }} />

                <Grid container>
                  <Grid item xs={12} md={9} sx={{ py: 3 }}>
                    <Typography variant="subtitle2">NOTES</Typography>

                    <Typography variant="body2">
                      This transaction receipt is generated automatically and
                      dose not require a physical signature. It is not a tax
                      invoice but serves as a record of your transaction with
                      Tramo. Please retain it for your refrence, and if you have
                      any queries, fell free to contact our Customer Support
                      team.
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ py: 3, textAlign: "right" }}>
                    <Typography variant="subtitle2">
                      Have a Question?
                    </Typography>

                    <Typography variant="body2">
                      {process.env.REACT_APP_COMPANY_EMAIL}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Scrollbar>
          </Card>
        </Grid>
      </Modal>
    </>
  );
}
