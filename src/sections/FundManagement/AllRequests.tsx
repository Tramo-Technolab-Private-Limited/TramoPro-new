import { useEffect, useState, useCallback } from "react";
// @mui
import {
  Stack,
  Grid,
  Pagination,
  TextField,
  FormLabel,
  Tabs,
  Tab,
  Select,
  InputLabel,
  MenuItem,
  Modal,
  Button,
  tableCellClasses,
  styled,
  TableHead,
  FormControl,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CircularProgress,
  Typography,
} from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "../../components/hook-form";
import { Helmet } from "react-helmet-async";
import { _ecommerceBestSalesman } from "src/_mock/arrays";
import { useSnackbar } from "notistack";
import React from "react";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar";
import { LoadingButton } from "@mui/lab";
import { TableHeadCustom } from "src/components/table";
import { Upload } from "src/components/upload";
import * as Yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { UploadFile } from "src/webservices";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
// import { myCompany } from 'src/components/company-name/companyName';
import EditRequest from "./EditRequest";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import { FileUpload } from "@mui/icons-material";
// ----------------------------------------------------------------------

type FormValuesProps = {
  branch: string;
  trxID: string;
  amount: string;
  bank_name: string;
  modeName: string;
  mobile: string;
  trxId: string;
  date_of_deposit: Dayjs;
  transactionSlip: string;
};

export default function (props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [uploadFile, setUploadFile] = useState<any>();
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sdata, setSdata] = useState([]);
  const [pageCount, setPageCount] = useState<any>(0);
  const [ReqData, setReqData] = useState<any>([]);
  const [selectedMode, setSelectedMode] = useState<any>([]);
  const [selectedModes, setSelectedModes] = useState<any>([]);
  const [selectedModeId, setSelectedModeId] = useState(null);
  const [success, setSuccess] = useState("upload");
  const [selectedBankID, setSelectedBankID] = useState<any>();
  const [selectedItem, setSelectedItem] = useState("");
  let [updateBnakID, setupdatedBid] = useState("");

  // const [fundRequestCreatedAt, setFundRequestCreatedAt] = useState('');
  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const uploadFile = acceptedFiles[0];
    setSuccess("upload");
    if (uploadFile) {
      console.log("");

      setUploadFile(
        Object.assign(uploadFile, {
          preview: URL.createObjectURL(uploadFile),
        })
      );
    }
  }, []);

  const handleSelectChange = (event: any) => {
    setSelectedItem(event.target.value);

    setSelectedBankID(event.target.value._id);
    let token = localStorage.getItem("token");
    Api(
      `agent/fundManagement/getAdminBank/` + event.target.value._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log(
        "======>Modes List  Response====>",
        Response.data.data.modes_of_transfer
      );

      if (Response.status == 200) {
        if (Response.data.code == 200) {
          const ModesNames = Response.data.data.modes_of_transfer;
          setSelectedMode(ModesNames);
        } else {
          console.log("======BankList=======>" + Response);
        }
      }
    });
  };

  const [docUrl, setDocUrl] = useState("");
  // const [reqId, setReqId] = useState('');
  const [openRequestEdit, setOpenRequestEdit] = React.useState(false);
  const handleOpenEdit = (RequestId: any) => {
    let token = localStorage.getItem("token");
    Api(
      `agent/fundManagement/getRaisedRequest/` + RequestId,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setReqData(Response.data.data[0]);

          setOpenRequestEdit(true);

          setupdatedBid(Response.data.data[0].bankId._id);
          console.log(
            "===========Transaction Details ==========>",
            Response.data.data
          );
        } else {
          console.log("======Transaction=======>" + Response);
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const handleCloseEdit = () => setOpenRequestEdit(false);

  const tableLabels = [
    { id: "Date", label: "Date & Time" },
    { id: "bank_name", label: "Bank" },
    { id: "mode", label: "Mode" },
    { id: "amount", label: "Ammount" },
    { id: "Charge", label: "Charge" },
    { id: "Commission", label: "Commission" },
    { id: " deposit_type", label: " Deposit Type" },
    { id: "mobile", label: "Mobile" },
    { id: " branch", label: " Branch" },
    { id: " status", label: " Status" },
    { id: " ", label: " Action" },
  ];
  useEffect(() => {
    getFundReq();
  }, [props.requestRaise, currentPage]);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const handleChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const style = {
    position: "absolute" as "absolute",
    top: "10%",
    left: "30%",

    height: 500,
    width: 600,

    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
    dayjs(ReqData.date_of_deposit)
  );

  const dateObj = new Date(ReqData.date_of_deposit);
  const [page, setPage] = React.useState(1);
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth() + 1; // Month is 0-based, so add 1
  const year = dateObj.getUTCFullYear();
  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDateGet = `${formattedDay}/${formattedMonth}/${year}`;
  const FilterSchema = Yup.object().shape({});

  const defaultValues = {
    amount: ReqData.amount,
    modeName: ReqData.deposit_type,
    bank_name: ReqData.bankId?.bank_details?.bank_name,
    modeId: ReqData.modeId,
    fund_request_Id: ReqData.fund_request_Id,
    trxID: ReqData.deposit_type,
    mobile: ReqData?.transactional_details?.mobile,
    branch: ReqData?.transactional_details?.branch,
    trxId: ReqData?.transactional_details?.trxId,
    date_of_deposit: formattedDateGet,
    transactionSlip: ReqData.transactionSlip,
  };

  const handleSelectModes = (event: any) => {
    setSelectedModes(event.target.value);

    setSelectedModeId(event.target.value.modeId);
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });

  const formattedDate = selectedDate ? selectedDate.format("DD/MM/YYYY") : "";

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const getFundReq = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: 10,
        currentPage: currentPage,
      },
    };
    Api(`agent/fundManagement/getRaisedRequests`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setPageCount(Response.data.count);
            setSdata(Response.data.data);
            console.log(
              "===========getRaisedRequests Details =============>",
              Response.data.data
            );
          } else {
            console.log("======getRaisedRequests=======>" + Response);
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      }
    );
  };

  const disableRequestAfterThreeMin = (fundRequestCreatedAt: any) => {
    const timeStamp = moment().utc();
    const differenceInMinutes = timeStamp.diff(
      moment(fundRequestCreatedAt).utc(),
      "minutes"
    );

    if (differenceInMinutes >= 2) {
      return true;
    } else {
      return false;
    }
  };
  const uploadDoc = () => {
    setSuccess("wait");
    let doc = uploadFile;
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", doc);
    formData.append("directoryName", "others");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        console.log(
          "=====uploadAadharfrontResponse========>" + JSON.stringify(Response)
        );
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            setDocUrl(Response.data.filePath);
            console.log("===200=aadharFront====", Response.data.filePath);
            setSuccess("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            console.log("=====404=aadharFront===", Response.data.message);
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    let body = {
      bankId: selectedBankID ? selectedBankID : updateBnakID,
      modeId: selectedModeId ? selectedModeId : ReqData.modeId?._id,
      fund_request_Id: ReqData.fund_request_Id,
      request_to: "ADMIN",
      transactional_details: {
        branch: data.branch
          ? data.branch
          : ReqData?.transactional_details?.branch,
        trxId: data.trxId ? data.trxId : ReqData?.transactional_details?.trxId,
        mobile: data.mobile
          ? data.mobile
          : ReqData?.transactional_details?.mobile,
      },
      date_of_deposit: formattedDate,
      amount: data.amount ? data.amount : ReqData.amount,
      transactionSlip: data.transactionSlip ? data.transactionSlip : docUrl,
    };

    Api(
      `agent/fundManagement/updateRaisedRequests/` + ReqData._id,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("=========>Update request ==========>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          getFundReq();
          handleCloseEdit();
        } else {
          console.log("======BankList=======>" + Response);
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar(Response.data.message, { variant: "error" });
      }
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };
  const DateString = (value: any) => {
    return moment(value).format("DD/MM/YYYY HH:mm:ss");
  };

  return (
    <>
      <Helmet>
        <title> Transactions |</title>
      </Helmet>

      <Grid item xs={12} md={6} lg={8}>
        <Scrollbar sx={{ maxHeight: "60vh", zIndex: 99, pl: 2 }}>
          <Table
            sx={{ minWidth: 720 }}
            stickyHeader
            size="small"
            aria-label="customized table"
          >
            <TableHead>
              <TableRow>
                {tableLabels.map((column: any) => (
                  <TableCell key={column.id} align="center">
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sdata.map((row: any) => (
                <StyledTableRow key={row._id}>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {new Date(row?.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.bankId?.bank_details?.bank_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.modeId?.transfer_mode_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>

                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.amount}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {parseFloat(row?.Charge) || "-"}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {parseFloat(row?.Commission) || "-"}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.deposit_type}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.transactional_details?.mobile}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {row?.transactional_details?.branch}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Box sx={{ ml: 2 }}>
                        <Typography
                          variant="body2"
                          sx={
                            row.status.toLowerCase() == "pending" ||
                            row.status.toLowerCase() == "hold"
                              ? { color: "#ffc107" }
                              : row.status.toLowerCase() == "failed"
                              ? { color: "#dc3545" }
                              : { color: "#198754" }
                          }
                        >
                          {row?.status}
                        </Typography>
                      </Box>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    <Stack direction="row" alignItems="center">
                      <Button
                        variant="contained"
                        size="medium"
                        onClick={() => handleOpenEdit(row._id)}
                        disabled={disableRequestAfterThreeMin(row.createdAt)}
                      >
                        EDIT{" "}
                      </Button>
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
        <Stack flexDirection={"row"} justifyContent={"center"} mt={2}>
          <Pagination
            count={Math.floor(pageCount / 10) + (pageCount % 10 === 0 ? 0 : 1)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Grid>
      <Modal
        open={openRequestEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "20px", height: "150" }}>
          <Grid rowGap={3} columnGap={2} display="grid">
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <FormLabel id="demo-row-radio-buttons-group-label">
                <Typography variant="h4">Fund Request Update</Typography>
              </FormLabel>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel
                    id="demo-simple-select-label"
                    sx={{ color: "#1a1a1a" }}
                  >
                    {ReqData?.bankId?.bank_details?.bank_name}
                  </InputLabel>
                  <Select
                    labelId="data-select-label"
                    id="data-select"
                    value={selectedItem}
                    onChange={handleSelectChange}
                    sx={{ width: 250 }}
                    label={ReqData?.bankId?.bank_details?.bank_name}
                    size="small"
                    defaultValue={ReqData?.bankId?.bank_details?.bank_name}
                  >
                    <MenuItem value=""></MenuItem>
                    {props.banklist.map((item: any) => (
                      <MenuItem key={item._id} value={item}>
                        {item.bank_details.bank_name}{" "}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel
                    id="demo-simple-select-label"
                    sx={{ color: "#1a1a1a" }}
                  >
                    {ReqData?.modeId?.transfer_mode_name}
                  </InputLabel>
                  <Select
                    value={selectedModes}
                    onChange={handleSelectModes}
                    label="Select Mode"
                    size="small"
                    sx={{ width: 250 }}
                    defaultValue={ReqData?.modeId?.transfer_mode_name}
                  >
                    <MenuItem value=""></MenuItem>
                    {selectedMode.map((item: any) => (
                      <MenuItem key={item._id} value={item}>
                        {item.modeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Typography>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <RHFTextField
                  name="amount"
                  label="Amount"
                  size="small"
                  defaultValue={ReqData?.amount}
                  sx={{ width: 250 }}
                />
                <RHFTextField
                  name="mobile"
                  label="Mobile"
                  defaultValue={ReqData?.transactional_details?.mobile}
                  size="small"
                  sx={{ width: 250 }}
                />
              </Typography>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <RHFTextField
                  name="branch"
                  label="Branch"
                  defaultValue={ReqData?.transactional_details?.branch}
                  size="small"
                  sx={{ width: 250 }}
                />
                <RHFTextField
                  name="trxId"
                  label="TRXID"
                  value={ReqData?.transactional_details?.trxId}
                  size="small"
                  sx={{ width: 250 }}
                />
              </Typography>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <Stack>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      label="Date "
                      inputFormat="DD/MM/YYYY"
                      value={selectedDate}
                      // defaultValue={selectedDate}
                      onChange={handleChange}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ my: 1, width: 250 }} />
                      )}
                    />
                  </LocalizationProvider>
                </Stack>
                <Stack sx={{ width: 250, height: 20 }}>
                  <Typography variant="h5">Upload Receipt </Typography>
                  <Upload
                    sx={{ display: "flex", marginLeft: "", marginTop: "" }}
                    file={
                      uploadFile
                        ? uploadFile
                        : AwsDocSign(ReqData?.transactionSlip)
                    }
                    onDrop={handleDropSingleFile}
                    onDelete={() => setUploadFile(null)}
                  />

                  <Stack
                    flexDirection={"row"}
                    mt={2}
                    style={
                      uploadFile != null
                        ? { visibility: "visible" }
                        : { visibility: "hidden" }
                    }
                  >
                    {success == "upload" ? (
                      <LoadingButton
                        sx={{ display: "flex" }}
                        variant="contained"
                        component="span"
                        style={{ width: "fit-content" }}
                        onClick={() => uploadDoc()}
                      >
                        Upload File
                      </LoadingButton>
                    ) : (
                      ""
                    )}
                  </Stack>
                </Stack>
              </Typography>

              <Typography>
                <LoadingButton
                  size="medium"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Update Request
                </LoadingButton>
              </Typography>
            </FormProvider>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}
