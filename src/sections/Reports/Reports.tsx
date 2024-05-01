import {
  Stack,
  Tabs,
  Tab,
  Paper,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  Button,
  Box,
  Tooltip,
  IconButton,
  Typography,
  MenuItem,
  TextField,
  Avatar,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import React, { useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import { DatePicker } from "@mui/x-date-pickers";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Scrollbar from "src/components/scrollbar/Scrollbar";
// import ApiDataLoading from "src/components/CustomFunction/ApiDataLoading";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import FileFilterButton from "./FileFilterButton";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
// import { FileFilterButton } from "./file";
import Iconify from "src/components/iconify";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
// import CustomPagination from "src/components/CustomFunction/CustomPagination";
import AWS from "aws-sdk";
import { CustomAvatar } from "src/components/custom-avatar";
import { sentenceCase } from "change-case";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import dayjs from "dayjs";
import CustomPagination from "src/components/customFunctions/CustomPagination";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import { TableNoData } from "src/components/table";
import DownloadIcon from "@mui/icons-material/Download";

import CheckStatusIcon from "./CheckStatusIcon";
//aws
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

function HistoricalDataExport() {
  const { copy } = useCopyToClipboard();
  const [sdata, setSdata] = React.useState("transactionRecords");
  const [verifyLoding, setVerifyLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState<any>(1);
  const [Loading, setLoading] = React.useState(false);
  const [tableData, setTableData] = React.useState<any>([]);
  const [pageCount, setPageCount] = React.useState<any>(0);
  const [pageSize, setPageSize] = React.useState(25);
  const { user } = useAuthContext();
  const [UserSearchBy, setUserSearchBy] = React.useState("");
  const [fromusers, setFromUsers] = React.useState([]);
  const [dateSelect, setSelectDate] = React.useState<any>(new Date());
  const [GSTTDSDate, setGSTTDSDate] = React.useState<any>(
    fDateFormatForApi(new Date())
  );
  const [GSTTDSDateEnd, setGSTTDSDateEnd] = React.useState<any>(
    fDateFormatForApi(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    )
  );
  const [approveLoading, setApproveLoading] = React.useState(false);
  const [selectFromUser, setSelectFromUser] = React.useState({
    userName: "",
    _id: "",
  });

  const [userDeatils, setUserDetails] = React.useState({
    name: "",
    useCode: "",
    profileuser: "",
    email: "",
    contact_no: "",
  });

  const { enqueueSnackbar } = useSnackbar();

  const tableLabels = [
    { id: "date", label: "Date" },

    { id: "IPAddress ", label: " Req. IP " },
    { id: "Latitude ", label: "Lat, Long" },
    { id: "From", label: "From Date" },
    { id: "To", label: "To Date" },

    { id: "Link Status ", label: "Link Status " },
    { id: "Download link ", label: "Download link " },
  ];

  //modal
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "920", sm: "920" },
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  const accountValidate = Yup.object().shape({});

  type FormValuesProps = {
    reportType: string;
    userRole: string;
    email: string;
    from: string;
    fromsearchby: string;
  };

  const defaultValues = {
    reportType: sdata,
    userRole: "",
    email: "",
    fromsearchby: " ",
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectFromUser((prevState) => ({
      ...prevState,
      userName: "",
      _id: "",
    }));
    reset();
    setFromUsers([]);
    setUserDetails((prevState) => ({
      ...prevState,
      name: "",
      useCode: "",
      profileuser: "",
      email: "",
      contact_no: "",
    }));
    setUserSearchBy(" ");

    setOpen(false);
  };

  const getStartOfMonth = (date: any) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndOfMonth = (date: any) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const HandleChangeDate = (newValue: any) => {
    setSelectDate(newValue);
    const startOfMonth = getStartOfMonth(newValue);
    const formattedDate = startOfMonth.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const endOfMonth = getEndOfMonth(newValue);

    const formattedDateEnd = endOfMonth.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    setGSTTDSDateEnd(formattedDateEnd);

    setGSTTDSDate(formattedDate);
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });

  useEffect(() => {
    getTransaction();
  }, [sdata, currentPage, pageSize]);

  const {
    reset,
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  //date
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

  const formattedStart = startDate
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(startDate)
    : "";
  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(endDate)
    : "";

  const submitReport = (data: FormValuesProps) => {
    setApproveLoading(true);

    let body = {
      from_date:
        sdata !== "GST & TDS Report" ? formattedStart : `${GSTTDSDate}`,
      to_date:
        sdata !== "GST & TDS Report" ? formattedEndDate : `${GSTTDSDateEnd}`,
      type_of_report: sdata,
      email: user?.email,
    };
    let token = localStorage.getItem("token");
    Api(`transaction/download_transaction_report`, "POST", body, token).then(
      (Response: any) => {
        console.log("======sumit==response=====>", Response);
        if (Response.status == 200) {
          enqueueSnackbar(Response.data.message);
          setVerifyLoading(false);
          handleClose();
          reset();
          getTransaction();

          setUserDetails((prevState) => ({
            ...prevState,
            name: "",
            useCode: "",
            profileuser: "",
            email: "",
            contact_no: "",
          }));

          setSelectFromUser((prevState) => ({
            ...prevState,
            userName: "",
            _id: "",
          }));
          setApproveLoading(false);

          console.log("=========error ====>", Response.data.data);
        } else {
          console.log("=========error ====>", Response.data.data);
          setVerifyLoading(false);
          handleClose();
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    );
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSdata(newValue);
  };

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  // All Transactions
  const getTransaction = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };

    Api(
      `transaction//transaction_record_history/${sdata}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======Transaction==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setTableData(Response.data.data.data);
          setPageCount(Response?.data?.data?.totalNumberOfRecords);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
        setLoading(false);
      }
    });
  };

  function setFromValue(val: any) {
    setSelectFromUser({
      userName: val.firstName + " " + val.lastName,
      _id: val._id,
    });

    setUserDetails({
      name: val?.firstName + " " + val?.lastName,
      useCode: val?.userCode,
      profileuser: val?.selfie[0],
      email: val?.email,
      contact_no: val?.contact_no,
    });
    setFromUsers([]);
  }

  // Download Report
  const download = (val: string) => {
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: val !== "" && val?.split("/").splice(3, 3).join("/"),
      Expires: 600,
    };

    s3.getSignedUrl("getObject", params, (err, url) => {
      window.open(url, "_blanck");
    });
  };

  return (
    <>
      <Stack flexDirection={"row"} justifyContent={"space-between"} m={2}>
        <Tabs
          value={sdata}
          onChange={handleChange}
          aria-label="wrapped label tabs example"
        >
          <Tab
            value="transactionRecords"
            label=" Transaction Report"
            sx={{ fontSize: 18 }}
          />
          <Tab value="fundRequest" label="Fund Request" sx={{ fontSize: 18 }} />
          <Tab value="fundFlow" label="Fund Flow" sx={{ fontSize: 18 }} />
          {/* <Tab value="AdminP&L" label="Admin P&L " sx={{ fontSize: 18 }} /> */}
          <Tab
            value="walletLedger"
            label=" Wallet Ledger"
            sx={{ fontSize: 18 }}
          />
          <Tab
            value="GST & TDS Report"
            label=" GST/TDS"
            sx={{ fontSize: 18 }}
            disabled
          />
          <Tab
            value="Admin Main Wallet Summary Report "
            label=" Main Wallet Summary"
            sx={{ fontSize: 18 }}
            disabled
          />
          <Tab
            value="Admin AEPS Wallet Summary Report "
            label=" AEPS Wallet Summary"
            sx={{ fontSize: 18 }}
            disabled
          />
          <Tab
            value="memberExport"
            label=" Member Export"
            sx={{ fontSize: 18 }}
            disabled
          />
          <Tab
            value="closingBalance"
            label=" Closing Balance Report"
            sx={{ fontSize: 18 }}
            disabled
          />{" "}
        </Tabs>
      </Stack>
      <Stack direction="row" spacing={2} m={1} justifyContent="flex-end">
        {tableData?.find((row: any) => row?.status == "Pending") && (
          <>
            <Tooltip title="Refresh" placement="top">
              <IconButton
                onClick={getTransaction}
                color="primary"
                aria-label="check transaction status"
              >
                <CheckStatusIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        <LoadingButton variant="contained" size="medium" onClick={handleOpen}>
          New Request
        </LoadingButton>
      </Stack>
      <Grid item xs={12} md={6} lg={8} sx={{ width: "100%" }}>
        <TableContainer component={Paper}>
          <Scrollbar sx={{ height: "fit-content" }}>
            <Table
              stickyHeader
              aria-label="sticky table"
              sx={{ minWidth: 720 }}
            >
              <TableHead>
                <TableRow>
                  {tableLabels.map((column: any) => (
                    <TableCell key={column.id}>{column.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {verifyLoding ? (
                <>
                  <Stack>
                    <ApiDataLoading />
                  </Stack>
                </>
              ) : (
                <TableBody>
                  {tableData?.map((row: any) => (
                    <TableRow sx={{ display: "table-row" }} key={row?.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Typography>{fDateTime(row.created_at)} </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          whiteSpace={"nowrap"}
                        >
                          <Typography>
                            {row?.IP_address}
                            <Tooltip title="Copy" placement="top">
                              <IconButton
                                onClick={() => onCopy(row?.IP_address)}
                              >
                                <Iconify icon="eva:copy-fill" width={20} />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Typography> Lat : {row?.latitude} </Typography>
                          <Typography> Long :{row?.longitude} </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Typography>{fDate(row?.from_date)} </Typography>
                        </Stack>
                      </TableCell>{" "}
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Typography>{fDate(row?.to_date)} </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Typography>{row?.status} </Typography>
                        </Stack>
                      </TableCell>{" "}
                      <TableCell>
                        <Button
                          variant="contained"
                          disabled={row?.status.toLowerCase() !== "generated"}
                          onClick={() => download(row?.url)}
                          startIcon={<DownloadIcon />}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
              <TableNoData isNotFound={!tableData.length} />
            </Table>
          </Scrollbar>

          <CustomPagination
            page={currentPage - 1}
            count={pageCount}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              setCurrentPage(newPage + 1);
            }}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setPageSize(parseInt(event.target.value));
              setCurrentPage(1);
            }}
          />
        </TableContainer>
      </Grid>

      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="transition-modal-title"
            variant="h6"
            component="h2"
            sx={{ marginBottom: 2 }}
          >
            Report Download
          </Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(submitReport)}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
            >
              <RHFTextField
                name={sdata}
                label={
                  sdata == "transactionRecords"
                    ? "Transaction Records"
                    : sdata == "fundRequest"
                    ? "Fund Request"
                    : sdata == "fundFlow"
                    ? "Fund Flow"
                    : sdata == "walletLedger"
                    ? "Wallet Ledger"
                    : sdata == "GST & TDS Report"
                    ? "GST & TDS"
                    : sdata == "Admin Main Wallet Summary Report "
                    ? " Main Wallet Summary"
                    : sdata == "Admin AEPS Wallet Summary Report"
                    ? "AEPS Wallet Summary"
                    : sdata == "memberExport"
                    ? "Member Export"
                    : ""
                }
                size="small"
                disabled
                variant="filled"
              />
              <TextField
                name={user?.email}
                label={user?.email}
                disabled
                variant="filled"
                size="small"
              />

              <Stack>
                <>
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
                </>
              </Stack>
            </Box>
            <Stack mt={2} direction="row" gap={1}>
              <LoadingButton
                onClick={handleOpen}
                variant="contained"
                type="submit"
                size="medium"
                loading={approveLoading}
              >
                Submit
              </LoadingButton>

              <LoadingButton onClick={handleClose} variant="contained">
                Close
              </LoadingButton>
            </Stack>
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
}

export default HistoricalDataExport;
