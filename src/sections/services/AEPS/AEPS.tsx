import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import React from "react";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
// @mui
import {
  Grid,
  Tabs,
  InputAdornment,
  Box,
  Button,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Tab,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableContainer,
  useTheme,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import { TableHeadCustom } from "../../../components/table";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFAutocomplete,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import RegistrationAeps from "./RegistrationAeps";
import AttendenceAeps from "./AttendenceAeps";
import Lottie from "lottie-react";
import fingerScan from "../../../components/JsonAnimations/fingerprint-scan.json";
import { useAuthContext } from "src/auth/useAuthContext";
import { Link, useNavigate } from "react-router-dom";
import WithdrawAttendance from "./WithdrawAttendance";
import MenuPopover from "src/components/menu-popover/MenuPopover";
import Iconify from "src/components/iconify/Iconify";
import DownloadIcon from "src/assets/icons/DownloadIcon";
import RoleBasedGuard from "src/auth/RoleBasedGuard";
import { fDateTime } from "src/utils/formatTime";
import ReactToPrint from "react-to-print";
import { PATH_DASHBOARD } from "src/routes/paths";
import LoadingScreen from "src/components/loading-screen/LoadingScreen";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import { fetchLocation } from "src/utils/fetchLocation";
import TransactionModal from "src/components/customFunctions/TrasactionModal";
import MotionModal from "src/components/animate/MotionModal";
import { CaptureDevice } from "src/utils/CaptureDevice";
import CustomTransactionSlip from "src/components/customFunctions/CustomTransactionSlip";
import { sentenceCase } from "change-case";

// ----------------------------------------------------------------------

type FormValuesProps = {
  amount: string;
  mobileNumber: string;
  aadharNumber: string;
  deviceName: string;
  bank: {
    id: number;
    activeFlag: number;
    bankName: string;
    details: string;
    remarks: string | null;
    timestamp: string;
    iinno: string;
  };
};

var timer: any;
var localTime: any;

export default function AEPS(props: any) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user, initialize } = useAuthContext();
  const componentRef = useRef<any>();
  const [isDeviceScan, setIsDeviceScan] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [CurrentTab, setCurrentTab] = useState("");
  const [paymentType, setPymentType] = useState([]);
  const [scanning, setscanning] = useState(false);
  const [productId, setProductId] = useState("");
  const [remark, setRemark] = useState("");
  const [resAmount, setResAmount] = useState<any>("");
  const [arrofObj, setarrofObj] = useState<any>([]);
  const [bankList, setBankList] = useState([]);
  const [transactionDetail, setTransactionDetail] = useState<any>([]);
  const [statement, setStatement] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [trobleshootActive, setTrobleshootActive] = useState("Device Drivers");
  const [response, setResponse] = useState({
    amount: "",
    transactionId: "",
    createdAt: "",
    clientRefId: "",
  });

  const [isUserHaveBankAccount, setIsUserHaveBankAccount] = useState<
    boolean | null
  >(null);

  const [autoClose, setAutoClose] = useState(0);
  const [failedMessage, setFailedMessage] = useState("");

  //confirm Detail for transaction
  const [openConfirmDetail, setOpenConfirmDetail] = React.useState(false);
  const handleOpenConfirmDetail = () => setOpenConfirmDetail(true);
  const handleCloseConfirmDetail = () => setOpenConfirmDetail(false);

  //Loading Screen
  const [openLoading, setOpenLoading] = React.useState(false);
  const handleOpenLoading = () => setOpenLoading(true);
  const handleCloseLoading = () => {
    setOpenLoading(false);
    setarrofObj([]);
    reset(defaultValues);
  };

  //Loading Screen
  const [openResponse, setOpenResponse] = React.useState(false);
  const handleOpenResponse = () => setOpenResponse(true);
  const handleCloseResponse = () => {
    setOpenResponse(false);
    reset(defaultValues);
  };

  //error Screen
  const [openError, setOpenError] = React.useState(false);
  const handleOpenError = () => setOpenError(true);
  const handleCloseError = () => {
    setOpenError(false);
    handleCloseConfirmDetail();
    reset(defaultValues);
  };

  // modal for Troubleshoot
  const [openT, setOpenT] = React.useState(false);
  const handleOpenT = () => setOpenT(true);
  const handleCloseT = () => setOpenT(false);
  const [categoryId, setCategoryId] = useState("");

  // modal for withdrawal attendence
  const [attend, setAttend] = React.useState(true);
  const [localAttendance, setLocalAttendance] = React.useState(0);
  const [openAttendance, setOpenAttendance] = React.useState(false);
  const handleOpenAttendance = () => setOpenAttendance(true);
  const handleCloseAttendance = () => {
    setOpenAttendance(false);
    initialize();
  };

  const [isReceipt, setIsReceipt] = useState(false);
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const AEPSSchema = Yup.object().shape({
    bank: Yup.object().shape({
      bankName: Yup.string().required("Bank Name is required"),
    }),
    deviceName: Yup.string().required("Please select device"),
    aadharNumber: Yup.string().required("Aadhar Number is required"),
    mobileNumber:
      CurrentTab.toLowerCase() == "withdraw"
        ? Yup.string().required("Mobile Number is required")
        : Yup.string(),
    amount:
      CurrentTab.toLowerCase() === "withdraw"
        ? Yup.string()
            .required("Amount is required")
            .test(
              "is-multiple-of-50",
              "Amount must be a multiple of 50",
              (value: any) => Number(value) % 50 === 0
            )
            .test(
              "minimum_100",
              "Please enter minimum Rs. 100",
              (value: any) => Number(value) > 99
            )
        : Yup.string(),
  });

  const defaultValues = {
    amount: "",
    mobileNumber: "",
    aadharNumber: "",
    deviceName: "",
    bank: {
      id: 0,
      activeFlag: 0,
      bankName: "",
      details: "",
      remarks: "",
      timestamp: "",
      iinno: "",
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(AEPSSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    watch,
    getValues,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getBankList();
    getAepsProduct();
    getCategory();
    getUserBankList();
  }, []);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    maxHeight: "90%",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const tableHead = [
    { id: "min", label: "Date" },
    { id: "max", label: "Transaction Type" },
    { id: "TransactionType", label: "Narration" },
    { id: "chargeType", label: "Amount" },
  ];

  const deviceType = [
    { _id: 1, category_name: "MORPHO" },
    { _id: 2, category_name: "MANTRA" },
    { _id: 3, category_name: "STARTEK" },
    { _id: 4, category_name: "SECUGEN" },
  ];

  const TrobleshootTab = [
    { _id: 1, name: "Device Drivers" },
    { _id: 2, name: "Aeps FAQs" },
  ];

  const getUserBankList = () => {
    let token = localStorage.getItem("token");
    Api(`user/user_bank_list`, "GET", "", token).then((Response: any) => {
      console.log("======BankList==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data.length) setIsUserHaveBankAccount(true);
          else setIsUserHaveBankAccount(false);
        } else {
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
      }
    });
  };

  const getCategory = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      console.log("======getcategory_list====>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          Response?.data?.data.map((item: any) => {
            if (item?.category_name == "AEPS") {
              setCategoryId(item?._id);
            }
          });
        }
      }
    });
  };

  const getBankList = () => {
    let token = localStorage.getItem("token");
    Api("indoNepal/getAEPSbankData", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setBankList(Response.data.data.data);
        } else {
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
      }
    });
  };

  const getAepsProduct = () => {
    let token = localStorage.getItem("token");
    Api("agent/get_AEPS_Products", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setPymentType(Response.data.data);
          setCurrentTab(Response.data.data[0]?.productName);
          setProductId(Response.data.data[0]?._id);
        } else {
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
      }
    });
  };

  const balanceInq = async () => {
    setIsApiLoading(true);
    setIsDeviceScan(true);
    let { error, success }: any = await CaptureDevice(getValues("deviceName"));
    setIsDeviceScan(false);
    if (!success) {
      enqueueSnackbar(error);
      setIsApiLoading(false);
    } else {
      let token = localStorage.getItem("token");
      let body = {
        latitude: localStorage.getItem("lat"),
        longitude: localStorage.getItem("long"),
        requestRemarks: remark,
        nationalBankIdentificationNumber: getValues("bank.iinno"),
        bankName: getValues("bank.bankName"),
        adhaarNumber: getValues("aadharNumber"),
        productId: productId,
        categoryId: categoryId,
        captureResponse: success,
      };
      await fetchLocation();
      await Api("aeps/get_balance", "POST", body, token).then(
        (Response: any) => {
          console.log("==============>>>fatch beneficiary Response", Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.data.message);
              setResAmount(Response.data.data.data.balanceAmount);
              handleCloseConfirmDetail();
              handleOpenResponse();
            } else {
              setFailedMessage(Response.data.message);
              handleCloseConfirmDetail();
              handleOpenError();
            }
          } else {
            setFailedMessage("failed");
            handleOpenError();
          }
          setIsApiLoading(false);
        }
      );
    }
  };

  const cashWidthraw = async () => {
    setIsApiLoading(true);
    setIsDeviceScan(true);
    let { error, success }: any = await CaptureDevice(getValues("deviceName"));
    setIsDeviceScan(false);
    if (!success) {
      enqueueSnackbar(error);
      setIsApiLoading(false);
    } else {
      let token = localStorage.getItem("token");
      let id = user?._id;
      let body = {
        merchantLoginId: id,
        latitude: localStorage.getItem("lat"),
        longitude: localStorage.getItem("long"),
        requestRemarks: remark,
        contact_no: getValues("mobileNumber"),
        nationalBankIdentificationNumber: getValues("bank.iinno"),
        bankName: getValues("bank.bankName"),
        adhaarNumber: getValues("aadharNumber"),
        amount: Number(getValues("amount")),
        productId: productId,
        categoryId: categoryId,
        captureResponse: success,
      };
      await fetchLocation();
      await Api("aeps/cash_withdrawal_LTS", "POST", body, token).then(
        (Response: any) => {
          console.log("==============>>>fatch beneficiary Response", Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              if (Response.data.data.status == false) {
                setFailedMessage(Response.data.message);
              }
              enqueueSnackbar(Response.data.message);
              initialize();
              setTransactionDetail([Response?.data?.txnId]);
              handleOpenResponse();
              handleCloseConfirmDetail();
            } else {
              setFailedMessage(Response.data.message);
              handleCloseConfirmDetail();
              handleOpenError();
            }
            setLocalAttendance(0);
          } else {
            setFailedMessage("Failed");
            handleOpenError();
          }
          setIsApiLoading(false);
        }
      );
    }
  };

  const miniStatement = async () => {
    setIsApiLoading(true);
    setIsDeviceScan(true);
    let { error, success }: any = await CaptureDevice(getValues("deviceName"));
    setIsDeviceScan(false);
    if (!success) {
      enqueueSnackbar(error);
      setIsApiLoading(false);
    } else {
      await fetchLocation();
      let token = localStorage.getItem("token");
      let body = {
        latitude: localStorage.getItem("lat"),
        longitude: localStorage.getItem("long"),
        requestRemarks: remark,
        nationalBankIdentificationNumber: getValues("bank.iinno"),
        bankName: getValues("bank.bankName"),
        adhaarNumber: getValues("aadharNumber"),
        productId: productId,
        categoryId: categoryId,
        captureResponse: success,
      };
      await Api("aeps/get_mini_statement", "POST", body, token).then(
        (Response: any) => {
          console.log("==============>>>fatch beneficiary Response", Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              if (Response.data.data.status == false) {
                setFailedMessage(Response.data.Message);
                handleCloseConfirmDetail();
                handleOpenError();
                return;
              }
              handleOpenResponse();
              setStatement(
                Response.data.data?.data?.miniStatementStructureModel
              );
              setResAmount(Response.data.data?.data?.balanceAmount);
            } else {
              setFailedMessage(Response.data.data.data.errorMessage);
              handleCloseConfirmDetail();
              handleOpenError();
            }
          } else {
            setFailedMessage("Failed");
            handleOpenError();
          }
          setIsApiLoading(false);
        }
      );
    }
  };

  const onSubmit = (data: FormValuesProps) => {
    setAutoClose(30);
    handleOpenConfirmDetail();
  };

  useEffect(() => {
    timer = setTimeout(() => {
      setAutoClose(autoClose - 1);
    }, 1000);
    if (autoClose == 0) {
      clearTimeout(timer);
      setarrofObj([]);
    }
  }, [autoClose]);

  useEffect(() => {
    setTimeout(() => {
      setLocalAttendance(
        Math.floor((user?.presenceAt + 150000 - Date.now()) / 1000)
      );
      setAttend(true);
    }, 0);
  }, [user?.presenceAt]);

  useEffect(() => {
    localTime = setTimeout(() => {
      setLocalAttendance(localAttendance - 1);
    }, 1000);
    if (localAttendance <= 0) {
      clearTimeout(localTime);
      setAttend(false);
    }
  }, [localAttendance]);

  useEffect(() => {
    setValue("mobileNumber", getValues("mobileNumber")?.slice(0, 10));
    getValues("mobileNumber")?.length > 0 && trigger("mobileNumber");
  }, [watch("mobileNumber")]);

  if (isUserHaveBankAccount == null) {
    return <ApiDataLoading />;
  }

  if (!isUserHaveBankAccount) {
    return (
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          mt: 20,
        }}
      >
        <Stack gap={1}>
          <LoadingButton
            variant="contained"
            onClick={() =>
              navigate(PATH_DASHBOARD.fundmanagement.mybankaccount)
            }
            sx={{ alignSelf: "center" }}
          >
            Add New Bank Account
          </LoadingButton>
          <Alert severity="warning">
            Note: if you already add a bank. Please choose a default bank
            account from your existing banks.
          </Alert>
        </Stack>
      </Stack>
    );
  }

  return (
    <>
      <Helmet>
        <title>AEPS | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <RoleBasedGuard hasContent roles={["agent"]}>
        <Stack flexDirection="row" alignItems={"center"} gap={1}>
          <ArrowBackIosNewOutlinedIcon
            onClick={() => navigate(-1)}
            sx={{
              height: "25px",
              width: "25px",
              cursor: "pointer",
            }}
          />
          <Typography variant="h4">AEPS</Typography>
        </Stack>
        {!user?.fingPayAPESRegistrationStatus || !user?.fingPayAEPSKycStatus ? (
          <RegistrationAeps />
        ) : !user?.isDailyAttendance ? (
          <AttendenceAeps attendance={"AEPS"} />
        ) : (
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <Box
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: "repeat(1, 1fr)",
                  }}
                >
                  <Tabs
                    value={CurrentTab}
                    sx={{ background: "#F4F6F8", mb: 2 }}
                    onChange={(event, newValue) => {
                      setCurrentTab(newValue);
                      reset(defaultValues);
                    }}
                  >
                    {paymentType.map((tab: any) => (
                      <Tab
                        key={tab._id}
                        sx={{ mx: 3 }}
                        label={tab.productName}
                        value={tab.productName}
                        onClick={() => setProductId(tab._id)}
                      />
                    ))}
                  </Tabs>
                  {CurrentTab.match(/with/i) && !attend ? (
                    <Stack my={1}>
                      <Typography variant="body2">
                        <strong>Note :</strong> It is mandatory to mark agent
                        attendance before any AEPS withdrawal.
                      </Typography>
                      <Typography variant="body2">
                        Please mark the attendance before customer withdrawal.
                      </Typography>
                      <Stack alignItems={"flex-end"} my={1}>
                        <Button
                          onClick={handleOpenAttendance}
                          variant="contained"
                        >
                          Mark your attendance
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <React.Fragment>
                      {attend && (
                        <Typography variant="subtitle2" textAlign={"end"}>
                          Withdrawal Attendance Timeout:{" "}
                          <span
                            style={{
                              color:
                                Math.floor(localAttendance) < 60
                                  ? "red"
                                  : "green",
                            }}
                          >
                            {Math.floor(localAttendance / 60)} Minutes{" "}
                            {Math.floor(localAttendance % 60)} Seconds
                          </span>
                        </Typography>
                      )}
                      <Grid rowGap={2} display="grid">
                        <RHFSelect
                          name="deviceName"
                          label="Select Device"
                          placeholder="Select Device"
                          SelectProps={{
                            native: false,
                            sx: { textTransform: "capitalize" },
                          }}
                          fullWidth
                        >
                          <MenuItem value={"MORPHO"}>MORPHO</MenuItem>
                          <MenuItem value={"STARTEK"}>STARTEK</MenuItem>
                          <MenuItem value={"MANTRA"}>MANTRA</MenuItem>
                          <MenuItem value={"SECUGEN"}>SECUGEN</MenuItem>
                        </RHFSelect>
                        <RHFAutocomplete
                          name="bank"
                          value={watch("bank")}
                          onChange={(event, newValue) => {
                            setValue("bank", newValue);
                          }}
                          options={bankList.map((option: any) => option)}
                          getOptionLabel={(option: any) => option.bankName}
                          renderOption={(categoryList, option) => (
                            <Box
                              component="li"
                              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                              {...categoryList}
                            >
                              {option.bankName}
                            </Box>
                          )}
                          renderInput={(params) => (
                            <RHFTextField
                              name="bank.bankName"
                              label="Bank Name"
                              {...params}
                            />
                          )}
                        />
                        <RHFTextField
                          name="aadharNumber"
                          label="Customer AadharCard No."
                          type="text"
                        />
                        {CurrentTab.toLowerCase() == "withdraw" && (
                          <>
                            <RHFTextField
                              name="mobileNumber"
                              type="number"
                              label="Mobile Number"
                            />
                            <RHFTextField
                              type="number"
                              name="amount"
                              label="Amount"
                              placeholder="Amount"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ₹
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </>
                        )}
                        <Stack flexDirection={"row"} gap={1} my={2}>
                          <LoadingButton
                            variant="contained"
                            type="submit"
                            loading={isApiLoading}
                          >
                            Continue to Finger print
                          </LoadingButton>
                          <LoadingButton
                            variant="outlined"
                            component="span"
                            onClick={() => reset(defaultValues)}
                          >
                            Reset
                          </LoadingButton>
                        </Stack>
                      </Grid>
                    </React.Fragment>
                  )}
                </Box>
              </Stack>
            </FormProvider>
            <Stack>
              <Tooltip title="Download Driver" placement="top">
                <IconButton onClick={handleOpenPopover}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <MenuPopover
              open={openPopover}
              onClose={handleClosePopover}
              arrow="right-top"
              sx={{ width: 140 }}
            >
              <MenuItem onClick={handleClosePopover}>
                <Iconify icon="line-md:download-loop" />
                MORPHO
              </MenuItem>

              <MenuItem onClick={handleClosePopover}>
                <Iconify icon="line-md:download-loop" />
                MANTRA
              </MenuItem>
              <MenuItem onClick={handleClosePopover}>
                <Iconify icon="line-md:download-loop" />
                STARTEK
              </MenuItem>
              <MenuItem onClick={handleClosePopover}>
                <Iconify icon="line-md:download-loop" />
                SECUGEN
              </MenuItem>
            </MenuPopover>
          </Stack>
        )}
        {/* confirm payment detail modal */}
        <MotionModal open={openConfirmDetail} width={{ xs: "95%", md: 400 }}>
          <Box>
            <Stack flexDirection={"column"} alignItems={"center"}>
              <Typography variant="h3">Confirm Details</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Bank Name</Typography>
              <Typography variant="body1">
                {getValues("bank.bankName")}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Aadhar Number</Typography>
              <Typography variant="body1">
                {getValues("aadharNumber")}
              </Typography>
            </Stack>
            {getValues("mobileNumber") && (
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Mobile Number</Typography>
                <Typography variant="body1">
                  {getValues("mobileNumber")}
                </Typography>
              </Stack>
            )}
            {getValues("amount") && (
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Amount</Typography>
                <Typography variant="body1">₹{getValues("amount")}</Typography>
              </Stack>
            )}
            <Stack flexDirection={"row"} gap={1} sx={{ mt: 2 }}>
              <LoadingButton
                loading={isApiLoading}
                variant="contained"
                disabled={!autoClose}
                onClick={() => {
                  CurrentTab.match(/bal/i)
                    ? balanceInq()
                    : CurrentTab.match(/with/i)
                    ? cashWidthraw()
                    : miniStatement();
                }}
              >
                {!autoClose
                  ? "Session expired"
                  : CurrentTab.match(/bal/i)
                  ? "Check Balance"
                  : CurrentTab.match(/with/i)
                  ? "Withdraw"
                  : "Get Statement"}
              </LoadingButton>

              <Button
                variant="outlined"
                onClick={() => (
                  handleCloseConfirmDetail(), clearTimeout(timer)
                )}
              >
                Close({autoClose})
              </Button>
            </Stack>
          </Box>
        </MotionModal>

        {/* device scaning loading */}
        <MotionModal open={isDeviceScan} width={{ xs: "95%", md: 400 }}>
          <Lottie animationData={fingerScan} />
        </MotionModal>

        {/*API Response Detail */}
        <Modal
          open={openResponse}
          onClose={handleCloseResponse}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {CurrentTab.match(/bal/i) ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={"fit-content"}
            >
              <Stack justifyContent={"center"}>
                <Typography variant="h4" textAlign={"center"}>
                  Balance detail
                </Typography>
                <Typography variant="h2">Rs. {resAmount}</Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={handleCloseResponse}
                sx={{ my: 3 }}
              >
                Close
              </Button>
            </Box>
          ) : CurrentTab.match(/mini/i) ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ sm: "100%", md: "60%" }}
            >
              <Stack flexDirection={"row"} justifyContent={"flex-end"} mx={1}>
                <Tooltip title="Close" onClick={handleCloseResponse}>
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
                  onAfterPrint={handleCloseResponse}
                />
              </Stack>
              <Scrollbar sx={{ maxHeight: 500 }}>
                <Grid
                  ref={componentRef}
                  sx={{ p: 3, width: { xs: 800, md: "100%" } }}
                >
                  {statement.length ? (
                    <TableContainer sx={{ overflow: "unset" }}>
                      {resAmount && (
                        <Typography variant="h2" textAlign={"center"}>
                          Balance: {resAmount}
                        </Typography>
                      )}
                      <Table>
                        <TableHeadCustom headLabel={tableHead} />
                        <TableBody>
                          {statement.map((row: any, index: number) =>
                            row.date ? (
                              <TableRow key={row._id}>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.narration}</TableCell>
                                <TableCell>{row.txnType}</TableCell>
                                <TableCell
                                  style={
                                    row.txnType == "Cr"
                                      ? { color: "green" }
                                      : { color: "red" }
                                  }
                                >
                                  {row.txnType == "Cr" ? "+" : "-"} {row.amount}
                                </TableCell>
                              </TableRow>
                            ) : (
                              <TableRow key={index}>{row}</TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="h3" noWrap>
                      Statement Not Available
                    </Typography>
                  )}
                </Grid>
                <Button
                  variant="contained"
                  onClick={handleCloseResponse}
                  sx={{ my: 3 }}
                >
                  Close
                </Button>
              </Scrollbar>
            </Box>
          ) : (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ sm: "100%", md: "60%" }}
            >
              <Stack flexDirection={"column"} alignItems={"center"}>
                <Typography variant="h3">
                  Transaction {sentenceCase(transactionDetail[0]?.status || "")}
                </Typography>
                {failedMessage && (
                  <Typography variant={"subtitle1"} textAlign={"center"}>
                    Reason : {failedMessage}
                  </Typography>
                )}
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Amount</Typography>
                <Typography variant="body1">
                  ₹{transactionDetail[0]?.amount}
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Transaction Id</Typography>
                <Typography variant="body1">
                  {transactionDetail[0]?.transactionId}
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Date</Typography>
                <Typography variant="body1">
                  {fDateTime(transactionDetail[0]?.createdAt)}
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Client Ref Id</Typography>
                <Typography variant="body1">
                  {transactionDetail[0]?.clientRefId}
                </Typography>
              </Stack>{" "}
              <Stack flexDirection="row" gap={1}>
                <Button
                  variant="contained"
                  onClick={handleCloseResponse}
                  sx={{ my: 3 }}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  sx={{ my: 3 }}
                  onClick={() => setIsReceipt(true)}
                >
                  View Receipt
                </Button>
              </Stack>
            </Box>
          )}
        </Modal>

        {/* Error Modal */}
        <Modal
          open={openError}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            width={"fit-content"}
          >
            <Stack flexDirection={"column"} alignItems={"center"}>
              <Typography variant="h3">Failed</Typography>
              <Icon
                icon="heroicons:exclaimation-circle"
                color="red"
                fontSize={50}
              />
            </Stack>
            <Stack justifyContent={"center"}>
              <Typography variant="h3" textAlign={"center"} color={"#9e9e9ef0"}>
                {failedMessage}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={handleCloseError}
              sx={{ my: 3 }}
            >
              Close
            </Button>
          </Box>
        </Modal>

        {/* withdrawal attendance modal */}
        <Modal
          open={openAttendance}
          onClose={handleCloseAttendance}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            width={"fit-content"}
          >
            <WithdrawAttendance
              attendance={"AEPS"}
              handleCloseAttendance={handleCloseAttendance}
            />
          </Box>
        </Modal>
      </RoleBasedGuard>

      <Modal
        open={isReceipt}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <Grid
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#ffffff",
              boxShadow: 4,
              p: 2,
              borderRadius: "20px",
              minWidth: { xs: "95%", md: 720 },
            }}
          >
            <Stack>
              <CustomTransactionSlip
                newRow={transactionDetail}
                handleCloseRecipt={() => setIsReceipt(false)}
              />
            </Stack>
          </Grid>
        </>
      </Modal>

      <Modal
        open={openT}
        onClose={handleCloseT}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          style={{ borderRadius: "20px" }}
          width={{ sm: "100%", md: "60%" }}
        >
          <Tabs
            value={trobleshootActive}
            aria-label="basic tabs example"
            sx={{ mb: 2 }}
            onChange={(event, newValue) => setTrobleshootActive(newValue)}
          >
            {TrobleshootTab.map((tab: any) => (
              <Tab
                key={tab._id}
                sx={{ mx: 3 }}
                label={tab.name}
                value={tab.name}
              />
            ))}
          </Tabs>
          {trobleshootActive == "Device Drivers" ? (
            <FormProvider methods={methods}>
              <RHFSelect
                name="deviceName"
                label="Select Device"
                placeholder="Select Device"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {deviceType.map((item: any) => {
                  return (
                    <MenuItem key={item._id} value={item._id}>
                      {item.category_name}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              <Button variant="contained" onClick={handleCloseT} sx={{ mt: 2 }}>
                Close
              </Button>
            </FormProvider>
          ) : null}
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
