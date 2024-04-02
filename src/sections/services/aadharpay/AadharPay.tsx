import { Helmet } from "react-helmet-async";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
// @mui
import {
  Grid,
  Box,
  Button,
  Typography,
  Stack,
  Modal,
  MenuItem,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { StyledSection } from "src/layouts/login/styles";
import Image from "src/components/image/Image";
import { Icon } from "@iconify/react";
import fingerScan from "../../../components/JsonAnimations/fingerprint-scan.json";
import Lottie from "lottie-react";
import aadharPayImg from "../../../assets/images/aadharpay.png";
import RegistrationAeps from "../AEPS/RegistrationAeps";
import AttendenceAeps from "../AEPS/AttendenceAeps";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";
// ----------------------------------------------------------------------

type FormValuesProps = {
  device: string;
  bankName: string;
  aadharnumber: string;
  mobilenumber: string;
  amount: string;
  selectbank: string;
  productId: string;
};

var localTime: any;

export default function AadharPay(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail } = useAuthContext();
  const [postData, setPostData] = useState<any>({
    nationalBankIdentificationNumber: "",
    adhaarNumber: "",
    productId: "",
    categoryId: "",
    amount: "",
    mobileNo: "",
  });
  const [arrofObj, setarrofObj] = useState<any>([]);
  const [bankList, setBankList] = useState([]);
  const [iinno, setIinno] = useState("");
  const [bName, setBName] = useState("");
  const [responseAmount, setResponseAmount] = useState({
    amount: "",
    transactionId: "",
    createdAt: "",
    clientRefId: "",
  });
  const [failedMessage, setFailedMessage] = useState("");
  const [txn, setTxn] = useState(false);
  const [checkNPIN, setCheckNPIN] = useState(false);
  const [caption, setCaption] = useState(false);
  const [blink, setBlink] = useState(true);
  const [autoClose, setAutoClose] = useState(0);
  const [open1, setOpen1] = React.useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
  };

  const [attend, setAttend] = React.useState(true);
  const [localAttendance, setLocalAttendance] = React.useState(0);

  const DMTSchema = Yup.object().shape({
    device: Yup.string().required("device is a required field"),
    mobilenumber: Yup.string().required("Mobile number is a required field"),
    aadharnumber: Yup.number()
      .required("Aadhar Number is a required field")
      .test(
        "len",
        "Enter valid 12-digit aadhar number",
        (val: any) => val.toString().length == 12
      ),
    amount: Yup.string().required(),
  });

  const defaultValues = {
    device: "",
    bankName: "",
    aadharnumber: "",
    mobilenumber: "",
    amount: "",
    selectbank: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const deviceType = [
    { _id: 1, category_name: "MORPHO" },
    { _id: 2, category_name: "MANTRA" },
    { _id: 3, category_name: "STARTEK" },
    { _id: 4, category_name: "SECUGEN" },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    getBankList();
  }, []);

  const getBankList = () => {
    let token = localStorage.getItem("token");
    Api("bankManagement/get_bank", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        setBankList(
          Response.data.data.filter(
            (record: any) => record.AadhaarPayFingpayStatus !== ""
          )
        );
      }
    });
  };

  function Transaction() {
    setTxn(true);
    let token = localStorage.getItem("token");
    let body = {
      latitude: localStorage.getItem("lat"),
      longitude: localStorage.getItem("long"),
      contact_no: postData.mobileNo,
      nationalBankIdentificationNumber: iinno,
      adhaarNumber: postData.adhaarNumber,
      productId: postData.productId,
      categoryId: postData.categoryId,
      amount: postData.amount,
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
        sessionKey: arrofObj[0].skey.textContent,
        hmac: arrofObj[0].hmac.textContent,
        PidDatatype: arrofObj[0].piddatatype,
        Piddata: arrofObj[0].piddata.textContent,
      },
    };
    Api("aeps/aadhaar_pay_LTS", "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          if (Response.data.data.status == true) {
            reset(defaultValues);
          }
          setResponseAmount(Response.data.txnId);
          setCheckNPIN(false);
        } else if (Response.data.code == 400) {
          setCheckNPIN(false);
          enqueueSnackbar(Response.data.message, { variant: "error" });
          setFailedMessage(Response.data.message);
        } else {
          setCheckNPIN(false);
          enqueueSnackbar(Response.data.err.message, { variant: "error" });
          setFailedMessage(Response.data.err.message);
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.err.message
          );
        }
      }
    });
  }

  const onSubmit = (data: FormValuesProps) => {
    if (bName !== "") {
      capture("MORPHO", "");
      handleOpen1();
      setCheckNPIN(true);
      setTxn(true);
      setPostData({
        nationalBankIdentificationNumber: iinno,
        adhaarNumber: data.aadharnumber,
        productId: data.productId,
        categoryId: props.supCategory._id,
        amount: data.amount,
        mobileNo: data.mobilenumber,
      });
    } else {
      enqueueSnackbar("Please Select Bank Name");
    }
  };

  function catchDeviceName(val: any) {
    let indexnumber = val.indexOf(".");
  }

  function getRDServiceUrl(deviceName: any) {
    var rdUrl = "";
    if (deviceName == "MANTRA") {
      rdUrl = "http://127.0.0.1:11100/rd/capture";
    } else if (deviceName == "MORPHO") {
      rdUrl = "http://127.0.0.1:11100/capture";
    } else if (deviceName == "STARTEK") {
      rdUrl = "http://127.0.0.1:11100/rd/capture";
    } else if (deviceName == "SECUGEN") {
      rdUrl = "http://127.0.0.1:11100/rd/capture";
    }
    console.log("rd", rdUrl);
    return rdUrl;
  }

  function errViewState(value: boolean, text: string) {
    if (value == true) {
      enqueueSnackbar(text);
    } else {
      enqueueSnackbar(text);
    }
  }

  const capture = (val: any, state: any) => {
    setCaption(true);
    const rdUrl = getRDServiceUrl(val);
    if (rdUrl == "") {
      errViewState(true, "Device Not Set!!");
      setCheckNPIN(false);
      setTxn(false);
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
      errViewState(true, "CORS not supported!!");
      setCheckNPIN(false);
      setTxn(false);
      return;
    }
    xhr.open("CAPTURE", rdUrl, true);
    xhr.setRequestHeader("Content-Type", "text/xml");
    // xhr.setRequestHeader('Accept', 'text/xml');
    if (!xhr) {
      errViewState(true, "CORS not supported!!");
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status == 200) {
          let xhrR = xhr.response;
          let parser = new DOMParser();
          let xml = parser.parseFromString(xhrR, "application/xml");
          var pidContent = xml.getElementsByTagName("PidData")[0];
          var responseCode: any = pidContent
            .getElementsByTagName("Resp")[0]
            .getAttribute("errCode");
          var errInfo: any = pidContent
            .getElementsByTagName("Resp")[0]
            .getAttribute("errInfo");
          let device: any = pidContent
            .getElementsByTagName("DeviceInfo")[0]
            .getAttribute("dpId");
          catchDeviceName(device);

          if (responseCode == 0) {
            var errorCode: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("errCode");
            var errInfo: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("errInfo");
            var fCount: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("fCount");
            var fType: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("fType");
            var iCount: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("iCount");
            var pCount: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("pCount");
            var nmPoints: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("nmPoints");
            var qScore: any = pidContent
              .getElementsByTagName("Resp")[0]
              .getAttribute("qScore");
            let dpId: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("dpId");
            let rdsId: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("rdsId");
            let rdsVer: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("rdsVer");
            let dc: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("dc");
            let mi: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("mi");
            let mc: any = pidContent
              .getElementsByTagName("DeviceInfo")[0]
              .getAttribute("mc");
            let ci: any = pidContent
              .getElementsByTagName("Skey")[0]
              .getAttribute("ci");
            let sessionkey: any = pidContent.getElementsByTagName("Skey")[0];
            let hmac: any = pidContent.getElementsByTagName("Hmac")[0];
            let pidData: any = pidContent.getElementsByTagName("Data")[0];
            let pidDataType: any = pidContent
              .getElementsByTagName("Data")[0]
              .getAttribute("type");
            let value: any = pidContent
              .getElementsByTagName("Param")[0]
              .getAttribute("value");
            let deviceArr: any = [];
            deviceArr.push({
              errcode: errorCode,
              errinfo: errInfo,
              fcount: fCount,
              ftype: fType,
              icount: iCount,
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
            enqueueSnackbar(value);
            setCheckNPIN(true);
            setTxn(false);
            setCaption(false);
            setAutoClose(30);
          } else {
            errViewState(true, errInfo);
            setCaption(false);
          }
        } else {
          enqueueSnackbar(xhr.response);
          setCheckNPIN(false);
          setTxn(false);
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

  function setBankValues(val: any) {
    setBName(val.bankName);
    setIinno(val.FingpayAPIIN);
  }

  setTimeout(() => {
    setBlink(!blink);
  }, 1000);

  useEffect(() => {
    const timer = setTimeout(() => {
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
        Math.floor((user?.presenceAtForAP + 150000 - Date.now()) / 1000)
      );
      setAttend(true);
    }, 0);
  }, [user?.presenceAtForAP]);

  useEffect(() => {
    localTime = setTimeout(() => {
      setLocalAttendance(localAttendance - 1);
    }, 1000);
    if (localAttendance <= 0) {
      clearTimeout(localTime);
      setAttend(false);
    }
  }, [localAttendance]);

  return (
    <>
      <Helmet>
        <title>Aadhar Pay | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <Typography variant="h4"></Typography>
      {!user?.fingPayAPESRegistrationStatus || !user?.fingPayAEPSKycStatus ? (
        <RegistrationAeps />
      ) : !user?.presenceAtForAP ||
        user?.presenceAtForAP + 150000 < Date.now() ? (
        <AttendenceAeps attendance={"AP"} />
      ) : (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {attend && (
            <Typography variant="subtitle2" textAlign={"end"}>
              Aadhaar Withdrawal Attendance Timeout:{" "}
              <span
                style={{
                  color: Math.floor(localAttendance) < 60 ? "red" : "green",
                }}
              >
                {Math.floor(localAttendance / 60)} Minutes{" "}
                {Math.floor(localAttendance % 60)} Seconds
              </span>
            </Typography>
          )}
          <Stack my={4}>
            <Grid container spacing={1}>
              <Grid item sm={6} md={4} display={"grid"}>
                <RHFSelect
                  name="device"
                  label="Biometric Device"
                  placeholder="Biometric Device"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {deviceType.map((item: any) => {
                    return (
                      <MenuItem key={item._id} value={item.category_name}>
                        {item.category_name}
                      </MenuItem>
                    );
                  })}
                </RHFSelect>
                <Autocomplete
                  id="bank-select-demo"
                  options={bankList}
                  autoHighlight
                  getOptionLabel={(option: any) => option.bankName}
                  onChange={(event, value) => setBankValues(value)}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      {option.bankName}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Bank Name"
                      inputProps={{
                        ...params.inputProps,
                        "aria-autocomplete": "none",
                      }}
                      size="small"
                    />
                  )}
                />
                <RHFTextField
                  name="aadharnumber"
                  label="Customer AadharCard No."
                  type="text"
                />
                <RHFTextField
                  name="mobilenumber"
                  label="Customer Number"
                  type="number"
                />
                <RHFTextField name="amount" label="Amount" type="text" />
                <Stack flexDirection={"row"} gap={2}>
                  <Button variant="contained" size="small" type="submit">
                    Continue to Finger print
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => reset(defaultValues)}
                  >
                    Reset
                  </Button>
                </Stack>
              </Grid>
              <Grid item sm={4} md={6}>
                <StyledSection>
                  <Image
                    disabledEffect
                    visibleByDefault
                    sx={{ width: "50%", marginRight: "-130px" }}
                    src={aadharPayImg}
                    alt=""
                  />
                </StyledSection>
              </Grid>
            </Grid>
          </Stack>
          <Modal
            open={open1}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            {checkNPIN ? (
              txn ? (
                <Box
                  sx={style}
                  style={{ borderRadius: "20px" }}
                  width={"fit-content"}
                >
                  {caption && (
                    <Typography variant="body2">
                      Dear Agent, please request customer to get their
                      fingerprints scanned for AEPS/Aadhar Pay transactions.
                    </Typography>
                  )}

                  {caption ? (
                    <Stack>
                      <Lottie animationData={fingerScan} />
                    </Stack>
                  ) : (
                    <Icon
                      icon="eos-icons:bubble-loading"
                      color="red"
                      fontSize={300}
                      style={{ padding: 25 }}
                    />
                  )}
                </Box>
              ) : (
                <Box
                  sx={style}
                  style={{ borderRadius: "20px" }}
                  width={{ sm: "100%", md: 400 }}
                >
                  <Stack flexDirection={"column"} alignItems={"center"}>
                    <Typography variant="h3">Confirm Details</Typography>
                    <Icon
                      icon="iconoir:fingerprint-check-circle"
                      color="green"
                      fontSize={70}
                    />
                    {/* <Icon icon="icon-park-outline:success" /> */}
                  </Stack>
                  <Stack
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    mt={2}
                  >
                    <Typography variant="subtitle1">Amount</Typography>
                    <Typography variant="body1">₹{watch("amount")}</Typography>
                  </Stack>
                  <Stack
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    mt={2}
                  >
                    <Typography variant="subtitle1">Aadhar Number</Typography>
                    <Typography variant="body1">
                      {watch("aadharnumber")}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={"row"}
                    justifyContent={"space-between"}
                    mt={2}
                  >
                    <Typography variant="subtitle1">Bank Name</Typography>
                    <Typography variant="body1">{watch("bankName")}</Typography>
                  </Stack>

                  <Stack flexDirection={"row"} gap={1}>
                    <Button
                      variant="contained"
                      disabled={!autoClose}
                      onClick={Transaction}
                      sx={{ mt: 2 }}
                    >
                      {!autoClose ? "Session expired" : "Confirm"}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleClose1}
                      sx={{ mt: 2 }}
                    >
                      Close({autoClose})
                    </Button>
                  </Stack>
                </Box>
              )
            ) : failedMessage ? (
              <Box
                sx={style}
                style={{ borderRadius: "20px" }}
                width={{ sm: "100%", md: 400 }}
              >
                <Stack flexDirection={"column"} alignItems={"center"}>
                  <Typography variant="h3">Transaction Failed</Typography>
                  <Icon
                    icon="heroicons:exclaimation-circle"
                    color="red"
                    fontSize={70}
                  />
                </Stack>
                <Typography
                  variant="h4"
                  textAlign={"center"}
                  color={"#9e9e9ef0"}
                >
                  {failedMessage}
                </Typography>
                <Stack flexDirection={"row"} justifyContent={"center"}>
                  <Button
                    variant="contained"
                    onClick={handleClose1}
                    sx={{ mt: 2 }}
                  >
                    Close
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                sx={style}
                style={{ borderRadius: "20px" }}
                width={{ sm: "100%", md: 400 }}
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
                  <Typography variant="body1">
                    ₹{responseAmount.amount}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Transaction Id</Typography>
                  <Typography variant="body1">
                    {responseAmount.transactionId}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Date</Typography>
                  <Typography variant="body1">
                    {fDateTime(responseAmount.createdAt)}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Client Ref Id</Typography>
                  <Typography variant="body1">
                    {responseAmount.clientRefId}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleClose1}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Box>
            )}
          </Modal>
        </FormProvider>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
