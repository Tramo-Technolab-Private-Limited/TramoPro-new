import { useEffect, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import React from "react";
import { Icon } from "@iconify/react";

// @mui
import {
  Box,
  Button,
  Stack,
  Typography,
  MenuItem,
  Modal,
  FormHelperText,
  useTheme,
} from "@mui/material";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFCodes,
  RHFSelect,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import Lottie from "lottie-react";
import fingerScan from "../../../components/JsonAnimations/fingerprint-scan.json";
import { useAuthContext } from "src/auth/useAuthContext";
import { CaptureDevice } from "../../../utils/CaptureDevice";

// ----------------------------------------------------------------------

type FormValuesProps = {
  otp: string;
  state: string;
  bankName: string;
  deviceName: string;
  remark: string;
};

export default function RegistrationAeps(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail } = useAuthContext();
  const theme = useTheme();
  const [otpVerify, setOtpVerify] = useState(true);
  const [encodeFPTxnId, setEncodeFPTxnId] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");
  const [indState, setIndState] = useState([]);
  const [arrofObj, setarrofObj] = useState<any>([]);

  //Modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //Loading Screen
  const [openLoading, setOpenLoading] = React.useState(false);
  const handleOpenLoading = () => setOpenLoading(true);
  const handleCloseLoading = () => {
    setOpenLoading(false);
    setarrofObj([]);
  };

  //registration Validation
  const registrationSchema = Yup.object().shape({});
  const defaultValues = {
    state: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(registrationSchema),
    defaultValues,
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  //sendotp Validation
  const sendOtpSchema = Yup.object().shape({
    deviceName: Yup.string().required("Please Select Device"),
  });
  const defaultValuesOtp = {
    deviceName: "",
  };
  const methodsOtp = useForm<FormValuesProps>({
    resolver: yupResolver(sendOtpSchema),
    defaultValues: defaultValuesOtp,
  });
  const {
    getValues: getValuesOtp,
    handleSubmit: handleSubmitOtp,
    formState: { isSubmitting: isSubmittingOtp },
  } = methodsOtp;

  //VerifyOtp Validation
  const VerifyOtpSchema = Yup.object().shape({
    otp: Yup.string().required("code is required"),
  });
  const VerifyOtpDefaultValues = {
    otp: "",
    remark: "",
  };
  const VerifyOtpmethods = useForm<FormValuesProps>({
    resolver: yupResolver(VerifyOtpSchema),
    defaultValues: VerifyOtpDefaultValues,
  });
  const {
    reset: resetOtpVerify,
    handleSubmit: VerifyOtpHandleSubmit,
    formState: { errors: VerifyOtpErrors, isSubmitting: VerifyOtpIsSubmitting },
  } = VerifyOtpmethods;

  useEffect(() => {
    getState();
  }, []);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const getState = () => {
    let token = localStorage.getItem("token");
    Api("indoNepal/get/Statelist", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          let sortState: any = Response.data.data.sort((a: any, b: any) => {
            if (a.state < b.state) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
          });
          setIndState(sortState);
          console.log(
            "==============>>> fatch beneficiary data 200",
            Response.data.data
          );
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.message
          );
        }
      }
    });
  };

  const registerMerchant = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        shopState: data.state,
        merchantState: data.state,
        Latitude: localStorage.getItem("lat"),
        Longitude: localStorage.getItem("long"),
      };
      await Api("aeps/aeps_acc", "POST", body, token).then((Response: any) => {
        console.log("==============>>>fatch beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            UpdateUserDetail({
              fingPayAPESRegistrationStatus: true,
              main_wallet_amount: user?.main_wallet_amount - 0,
            });
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const sendOtp = async () => {
    try {
      let token = localStorage.getItem("token");
      let location: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      let body = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      await Api("aeps/aeps_otp", "POST", body, token).then((Response: any) => {
        if (Response.data.code == 200) {
          if (Response.data.data.status == true) {
            enqueueSnackbar(Response.data.data.message);
            setPrimaryKey(Response.data.data.data.primaryKeyId);
            setEncodeFPTxnId(Response.data.data.data.encodeFPTxnId);
            handleOpen();
          }
        } else {
          enqueueSnackbar(Response.data.data.message, { variant: "error" });
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.message
          );
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    arrofObj.length && merchantKYC();
  }, [arrofObj]);

  const resendOtp = () => {
    let token = localStorage.getItem("token");
    let id = user?._id;
    let body = {
      merchantLoginId: id,
      primaryKeyId: primaryKey,
      encodeFPTxnId: encodeFPTxnId,
    };
    Api("aeps/aeps_resend_otp", "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const verifyOtpToMerchant = (data: FormValuesProps) => {
    setOtpVerify(false);
    let token = localStorage.getItem("token");
    let id = user?._id;
    let body = {
      merchantLoginId: id,
      otp: data.otp,
      primaryKeyId: primaryKey,
      encodeFPTxnId: encodeFPTxnId,
    };
    Api("aeps/aeps_otp_verify", "POST", body, token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.data.code == 200) {
        if (Response.data.data.status) {
          enqueueSnackbar(Response.data.message);
          reset(defaultValues);
          capture();
        }
      } else {
        enqueueSnackbar(Response.data.message, { variant: "error" });
        setOtpVerify(true);
      }
    });
  };

  const merchantKYC = () => {
    handleOpenLoading();
    let token = localStorage.getItem("token");
    let body = {
      merchantLoginId: user?._id,
      nationalBankIdentificationNumber: "",
      requestRemarks: getValues("remark"),
      primaryKeyId: primaryKey,
      encodeFPTxnId: encodeFPTxnId,
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
    Api("aeps/bio_ekyc", "POST", body, token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.data.message);
          if (Response.data.data.status == true) {
            UpdateUserDetail({ fingPayAEPSKycStatus: true });
          }
          handleClose();
          handleCloseLoading();
          setOtpVerify(true);
        } else {
          setOtpVerify(true);
          resetOtpVerify(VerifyOtpDefaultValues);
          handleClose();
          handleCloseLoading();
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.message
          );
        }
      }
    });
  };

  //   ********************************jquery start here for capture device ***************************

  const capture = () => {
    var rdUrl = "";
    if (getValuesOtp("deviceName") == "MANTRA") {
      rdUrl = "https://127.0.0.1:8005/rd/capture";
    } else if (getValuesOtp("deviceName") == "MORPHO") {
      rdUrl = "http://127.0.0.1:11100/capture";
    } else if (getValuesOtp("deviceName") == "STARTEK") {
      rdUrl = "http://127.0.0.1:11101/rd/capture";
    } else if (getValuesOtp("deviceName") == "SECUGEN") {
      rdUrl = "http://127.0.0.1:11100/rd/capture";
    }
    if (rdUrl == "") {
      setOtpVerify(true);
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
      setOtpVerify(true);
      enqueueSnackbar("CORS not supported");
      return;
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
          } else {
            setOtpVerify(true);
            enqueueSnackbar(errInfo);
          }
        }
      }
    };
    xhr.onerror = function () {
      setOtpVerify(true);
      enqueueSnackbar("Check If Morpho Service/Utility is Running");
    };
    xhr.send(
      user?.fingPayAEPSKycStatus
        ? '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>'
        : '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="P" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc="/> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>'
    );
  };

  return (
    <>
      {!user?.fingPayAPESRegistrationStatus && !user?.fingPayAEPSKycStatus ? (
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(registerMerchant)}
        >
          <Stack
            width={{ sm: "90%", md: "60%" }}
            margin={"auto"}
            border={"1px solid #dadada"}
            borderRadius={"10px"}
            textAlign={"center"}
            boxShadow={`0.1px 0.2px 22px ${theme.palette.primary.main}36`}
            py={5}
            gap={2}
            justifyContent={"center"}
          >
            <Typography variant="h4">
              Hi wait, Please register yourself first.
            </Typography>

            <RHFSelect
              name="state"
              label="Select State"
              placeholder="Select State"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              sx={{ width: "250px", margin: "auto" }}
            >
              {indState.map((item: any) => {
                return (
                  <MenuItem key={item._id} value={item.stateId}>
                    {item.state}
                  </MenuItem>
                );
              })}
            </RHFSelect>
            {watch("state") && (
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: "fit-content", margin: "auto" }}
                loading={isSubmitting}
              >
                Register Now
              </LoadingButton>
            )}
          </Stack>
        </FormProvider>
      ) : user?.fingPayAPESRegistrationStatus && !user?.fingPayAEPSKycStatus ? (
        <FormProvider methods={methodsOtp} onSubmit={handleSubmitOtp(sendOtp)}>
          <Stack
            width={{ sm: "90%", md: "60%" }}
            margin={"auto"}
            border={"1px solid #dadada"}
            borderRadius={"10px"}
            textAlign={"center"}
            boxShadow={`0.1px 0.2px 22px ${theme.palette.primary.main}36`}
            py={5}
            gap={2}
            justifyContent={"center"}
          >
            <Typography variant="h4">
              {" "}
              Plaese submit documents for KYC{" "}
            </Typography>
            <RHFSelect
              name="deviceName"
              label="Select Device"
              placeholder="Select Device"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
              sx={{ width: "90%", margin: "auto" }}
            >
              <MenuItem value={"MORPHO"}>MORPHO</MenuItem>
              <MenuItem value={"STARTEK"}>STARTEK</MenuItem>
              <MenuItem value={"MANTRA"}>MANTRA</MenuItem>
              <MenuItem value={"SECUGEN"}>SECUGEN</MenuItem>
            </RHFSelect>
            <RHFTextField
              name="remark"
              label="Remark"
              placeholder="Remark"
              sx={{ width: "90%", margin: "auto" }}
            />
            <Stack>
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: "fit-content", margin: "auto" }}
                loading={isSubmittingOtp}
              >
                Send OTP & Fetch Document
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      ) : null}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider
          methods={VerifyOtpmethods}
          onSubmit={VerifyOtpHandleSubmit(verifyOtpToMerchant)}
        >
          {otpVerify ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ xs: "100%", md: 370 }}
            >
              <Stack spacing={3}>
                <Typography variant="subtitle2" textAlign={"center"}>
                  Mobile Verification Code &nbsp;
                </Typography>
                <RHFTextField name="otp" label="OTP" placeholder="OTP" />

                <Stack>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={VerifyOtpIsSubmitting}
                    sx={{ width: "fit-content", margin: "auto" }}
                  >
                    Submit
                  </LoadingButton>
                </Stack>
                <Stack justifyContent={"end"} flexDirection={"row"}>
                  <Button size="small" onClick={resendOtp}>
                    Resend OTP?
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={"fit-content"}
            >
              <Lottie animationData={fingerScan} />
            </Box>
          )}
        </FormProvider>
      </Modal>
      {/* Loading Modal */}
      <Modal
        open={openLoading}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "20px" }} width={"fit-content"}>
          <Stack justifyContent={"center"} flexDirection={"row"}>
            <Icon
              icon="eos-icons:three-dots-loading"
              fontSize={100}
              color={theme.palette.primary.main}
            />
          </Stack>
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
