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
  const { enqueueSnackbar } = useSnackbar();
  const { user, initialize } = useAuthContext();
  const theme = useTheme();
  const componentRef = useRef<any>();
  const [CurrentTab, setCurrentTab] = useState("");
  const [paymentType, setPymentType] = useState([]);
  const [scanning, setscanning] = useState(false);
  const [productId, setProductId] = useState("");
  const [remark, setRemark] = useState("");
  const [resAmount, setResAmount] = useState<any>("");
  const [arrofObj, setarrofObj] = useState<any>([]);
  const [bankList, setBankList] = useState([]);
  const [statement, setStatement] = useState([]);
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

  //confirm Detail forr transaction
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
  const handleCloseResponse = () => setOpenResponse(false);

  //error Screen
  const [openError, setOpenError] = React.useState(false);
  const handleOpenError = () => setOpenError(true);
  const handleCloseError = () => setOpenError(false);

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
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getBankList();
    getAepsProduct();
    getCategory();
    getUserBankList();
  }, []);

  useEffect(() => {
    if (arrofObj[0]?.errcode === "0") {
      if (CurrentTab.match(/with/i)) {
        cashWidthraw();
      } else if (CurrentTab.match(/bal/i)) {
        balanceInq();
      } else {
        miniStatement();
      }
    }
  }, [arrofObj[0]?.errcode === "0"]);

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
          if (Response.data.data.length) {
            if (Response?.data?.data[0]?.bankAccounts?.length)
              setIsUserHaveBankAccount(true);
            else setIsUserHaveBankAccount(false);
          }
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
    handleCloseConfirmDetail();
    handleOpenLoading();
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
      captureResponse: {
        errCode: arrofObj[0].errcode || "",
        errInfo: arrofObj[0].errinfo || "",
        fCount: arrofObj[0].fcount || "",
        fType: arrofObj[0].ftype || "",
        iCount: arrofObj[0].icount || "",
        iType: null || "",
        pCount: arrofObj[0].pcount || "",
        pType: "0" || "",
        nmPoints: arrofObj[0].nmpoint || "",
        qScore: arrofObj[0].qscore || "",
        dpID: arrofObj[0].dpid || "",
        rdsID: arrofObj[0].rdsid || "",
        rdsVer: arrofObj[0].rdsver || "",
        dc: arrofObj[0].dc || "",
        mi: arrofObj[0].mi || "",
        mc: arrofObj[0].mc || "",
        ci: arrofObj[0].ci || "",
        sessionKey: arrofObj[0].skey.textContent || "",
        hmac: arrofObj[0].hmac.textContent || "",
        PidDatatype: arrofObj[0].piddatatype || "",
        Piddata: arrofObj[0].piddata.textContent || "",
      },
    };
    await fetchLocation();
    await Api("aeps/get_balance", "POST", body, token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.data.message);
          setResAmount(Response.data.data.data.balanceAmount);
          handleOpenResponse();
        } else {
          setFailedMessage(Response.data.message);
          handleOpenError();
        }
        handleCloseLoading();
      } else {
        handleCloseLoading();
        handleOpenError();
      }
    });
  };

  const cashWidthraw = async () => {
    handleCloseConfirmDetail();
    handleOpenLoading();
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
      captureResponse: {
        errCode: arrofObj[0].errcode,
        errInfo: arrofObj[0].errinfo,
        fCount: arrofObj[0].fcount,
        fType: arrofObj[0].ftype,
        iCount: arrofObj[0].icount,
        iType: null,
        pCount: arrofObj[0].pcount,
        pType: "0",
        nmPoints: arrofObj[0].nmpoint,
        qScore: arrofObj[0].qscore,
        dpID: arrofObj[0].dpid,
        rdsID: arrofObj[0].rdsid,
        rdsVer: arrofObj[0].rdsver,
        dc: arrofObj[0].dc,
        mi: arrofObj[0].mi,
        mc: arrofObj[0].mc,
        ci: arrofObj[0].ci,
        srno: arrofObj[0].value,
        sessionKey: arrofObj[0].skey.textContent,
        hmac: arrofObj[0].hmac.textContent,
        PidDatatype: arrofObj[0].piddatatype,
        Piddata: arrofObj[0].piddata.textContent,
      },
    };
    await fetchLocation();
    await Api("aeps/cash_withdrawal_LTS", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>>fatch beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(
              Response.data.txnId.amount + " Successfully Transfered"
            );
            initialize();

            handleOpenResponse();
            setResponse(Response.data.txnId);
          } else {
            setFailedMessage(Response.data.message);
            handleOpenError();
          }
          setLocalAttendance(0);
          initialize();
          handleCloseLoading();
        } else {
          handleCloseLoading();
          handleOpenError();
          setFailedMessage("Internal Server Error");
        }
      }
    );
  };

  const miniStatement = async () => {
    handleCloseConfirmDetail();
    handleOpenLoading();
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
      captureResponse: {
        errCode: arrofObj[0].errcode,
        errInfo: arrofObj[0].errinfo,
        fCount: arrofObj[0].fcount,
        fType: arrofObj[0].ftype,
        iCount: arrofObj[0].icount,
        iType: null,
        pCount: arrofObj[0].pcount,
        pType: "0",
        nmPoints: arrofObj[0].nmpoint,
        qScore: arrofObj[0].qscore,
        dpID: arrofObj[0].dpid,
        rdsID: arrofObj[0].rdsid,
        rdsVer: arrofObj[0].rdsver,
        dc: arrofObj[0].dc,
        mi: arrofObj[0].mi,
        mc: arrofObj[0].mc,
        ci: arrofObj[0].ci,
        srno: arrofObj[0].value,
        sessionKey: arrofObj[0].skey.textContent,
        hmac: arrofObj[0].hmac.textContent,
        PidDatatype: arrofObj[0].piddatatype,
        Piddata: arrofObj[0].piddata.textContent,
      },
    };
    await fetchLocation();
    await Api("aeps/get_mini_statement", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>>fatch beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            if (Response.data.data.status == false) {
              handleOpenError();
              setFailedMessage(Response.data.data.message);
            }
            handleOpenResponse();
            initialize();
            setStatement(Response.data.data.data.miniStatementStructureModel);
            setResAmount(Response.data.data.data.balanceAmount);
            enqueueSnackbar(Response.data.data.message, { variant: "warning" });
          } else {
            setFailedMessage(Response.data.message);
            handleOpenError();
          }
          handleCloseLoading();
        } else {
          handleCloseLoading();
          handleOpenError();
          setFailedMessage("Failed");
        }
      }
    );
  };

  const onSubmit = (data: FormValuesProps) => {
    setAutoClose(30);
    handleOpenConfirmDetail();
  };

  //   ********************************React start here for capture device ***************************

  const capture = () => {
    setscanning(true);
    clearTimeout(timer);
    var rdUrl = "";
    if (getValues("deviceName") == "MANTRA") {
      rdUrl = "https://127.0.0.1:8005/rd/capture";
    } else if (getValues("deviceName") == "MORPHO") {
      rdUrl = "http://127.0.0.1:11100/capture";
    } else if (getValues("deviceName") == "STARTEK") {
      rdUrl = "http://127.0.0.1:11101/rd/capture";
    } else if (getValues("deviceName") == "SECUGEN") {
      rdUrl = "http://127.0.0.1:11100/rd/capture";
    }
    if (!rdUrl) {
      enqueueSnackbar("Device Not Set!!");
      return;
    }
    var xhr: any;
    var ActiveXObject: any;
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
      xhr = new XMLHttpRequest();
    }
    xhr.open("CAPTURE", rdUrl, true);
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.setRequestHeader("Accept", "text/xml");
    if (!xhr) {
      enqueueSnackbar("CORS not supported");
      handleCloseConfirmDetail();
      return;
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status == 200) {
          console.log("xhr", xhr);
          let xhrR = xhr.response;
          let parser = new DOMParser();
          let xml = parser.parseFromString(xhrR, "application/xml");
          var pidContent = xml.getElementsByTagName("PidData")[0];
          var responseCode: any = pidContent
            .getElementsByTagName("Resp")[0]
            .getAttribute("errCode");
          var errInfo: any = pidContent
            ?.getElementsByTagName("Resp")[0]
            ?.getAttribute("errInfo");
          let device: any = pidContent
            ?.getElementsByTagName("DeviceInfo")[0]
            ?.getAttribute("dpId");

          if (responseCode == 0) {
            var errorCode: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("errCode");
            var errInfo: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("errInfo");
            var fCount: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("fCount");
            var fType: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("fType");
            var iCount: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("iCount");
            var pCount: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("pCount");
            var nmPoints: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("nmPoints");
            var qScore: any = pidContent
              ?.getElementsByTagName("Resp")[0]
              ?.getAttribute("qScore");
            let dpId: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("dpId");
            let rdsId: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("rdsId");
            let rdsVer: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("rdsVer");
            let dc: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("dc");
            let mi: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("mi");
            let mc: any = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getAttribute("mc");
            let value = pidContent
              ?.getElementsByTagName("DeviceInfo")[0]
              ?.getElementsByTagName("additional_info")[0]
              ?.getElementsByTagName("Param")[0]
              ?.getAttribute("value");
            let ci: any = pidContent
              ?.getElementsByTagName("Skey")[0]
              ?.getAttribute("ci");
            let sessionkey: any = pidContent?.getElementsByTagName("Skey")[0];
            let hmac: any = pidContent?.getElementsByTagName("Hmac")[0];
            let pidData: any = pidContent?.getElementsByTagName("Data")[0];
            let pidDataType: any = pidContent
              ?.getElementsByTagName("Data")[0]
              ?.getAttribute("type");
            let deviceArr: any = [];
            deviceArr.push({
              errcode: errorCode,
              errinfo: errInfo,
              fcount: fCount,
              ftype: fType,
              icount: iCount,
              value: value,
              pcount: pCount,
              nmpoint: nmPoints.trim() + "," + nmPoints.trim(),
              qscore: qScore.trim() + "," + qScore.trim(),
              dpid: dpId,
              rdsid: rdsId,
              rdsver: rdsVer,
              dc: dc,
              mi: mi,
              mc: mc,
              ci: ci,
              skey: sessionkey,
              hmac: hmac,
              piddata: pidData,
              piddatatype: pidDataType,
            });
            setarrofObj(deviceArr);
            setscanning(false);
          } else {
            enqueueSnackbar(errInfo);
            setscanning(false);
            reset(defaultValues);
            handleCloseConfirmDetail();
          }
        } else {
          enqueueSnackbar(xhr.response);
        }
      }
    };
    xhr.onerror = function () {
      enqueueSnackbar("Check If Morpho Service/Utility is Running");
    };
    xhr.send(
      '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>'
    );
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
        ) : new Date(user?.presenceAt).toLocaleDateString() !==
          new Date().toLocaleDateString() ? (
          <AttendenceAeps attendance={"AEPS"} />
        ) : (
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <>
                <Stack>
                  <Box
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                    }}
                  >
                    <Box maxWidth={"fit-content"}>
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
                            <strong>Note :</strong> It is mandatory to mark
                            agent attendance before any AEPS withdrawal.
                          </Typography>
                          <Typography variant="body2">
                            Please mark the attendance before customer
                            withdrawal.
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
                        <>
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
                          </Grid>
                        </>
                      )}
                    </Box>
                  </Box>
                </Stack>
                {CurrentTab.match(/with/i) && attend && (
                  <Stack flexDirection={"row"} gap={1} my={2}>
                    <LoadingButton variant="contained" type="submit">
                      Continue to Finger print
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      component="span"
                      onClick={() => reset(defaultValues)}
                    >
                      Reset
                    </LoadingButton>
                  </Stack>
                )}
                {!CurrentTab.match(/with/i) && (
                  <Stack flexDirection={"row"} gap={1} my={2}>
                    <LoadingButton variant="contained" type="submit">
                      Continue to Finger print
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      component="span"
                      onClick={() => reset(defaultValues)}
                    >
                      Reset
                    </LoadingButton>
                  </Stack>
                )}
              </>
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
        <Modal
          open={openConfirmDetail}
          // onClose={handleCloseConfirmDetail}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          {scanning ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={"fit-content"}
            >
              <Lottie animationData={fingerScan} />
            </Box>
          ) : (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ xm: "100%", md: 400 }}
            >
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
                  <Typography variant="body1">
                    ₹{getValues("amount")}
                  </Typography>
                </Stack>
              )}
              <Stack flexDirection={"row"} gap={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={!autoClose}
                  onClick={capture}
                >
                  {!autoClose
                    ? "Session expired"
                    : CurrentTab.match(/bal/i)
                    ? "Check Balance"
                    : CurrentTab.match(/with/i)
                    ? "Withdraw"
                    : "Get Statement"}
                </Button>

                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => (
                    handleCloseConfirmDetail(), clearTimeout(timer)
                  )}
                >
                  Close({autoClose})
                </Button>
              </Stack>
            </Box>
          )}
        </Modal>
        {/* Loading Modal */}
        <Modal
          open={openLoading}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            width={"fit-content"}
          >
            <Stack justifyContent={"center"} flexDirection={"row"}>
              <Icon
                icon="eos-icons:three-dots-loading"
                fontSize={100}
                color={theme.palette.primary.main}
              />
            </Stack>
          </Box>
        </Modal>
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
                <Typography variant="h3">Transaction Success</Typography>
                <Icon
                  icon="icon-park-outline:success"
                  color="#4BB543"
                  fontSize={70}
                />
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Amount</Typography>
                <Typography variant="body1">₹{response.amount}</Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Transaction Id</Typography>
                <Typography variant="body1">
                  {response.transactionId}
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Date</Typography>
                <Typography variant="body1">
                  {fDateTime(response.createdAt)}
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography variant="subtitle1">Client Ref Id</Typography>
                <Typography variant="body1">{response.clientRefId}</Typography>
              </Stack>{" "}
              <Button
                variant="contained"
                onClick={handleCloseResponse}
                sx={{ my: 3 }}
              >
                Close
              </Button>
            </Box>
          )}
        </Modal>

        {/* Error Modal */}
        <Modal
          open={openError}
          onClose={handleCloseError}
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
          </Box>
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
                <Button
                  variant="contained"
                  onClick={handleCloseT}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </FormProvider>
            ) : null}
          </Box>
        </Modal>

        {/* confirm payment detail modal */}
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
    </>
  );
}

// ----------------------------------------------------------------------
