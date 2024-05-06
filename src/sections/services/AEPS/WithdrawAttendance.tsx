import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { Icon } from "@iconify/react";
import React from "react";

// @mui
import {
  Box,
  Button,
  Stack,
  Typography,
  MenuItem,
  Modal,
  useTheme,
} from "@mui/material";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import Lottie from "lottie-react";
import fingerScan from "../../../components/JsonAnimations/fingerprint-scan.json";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";
import { fetchLocation } from "src/utils/fetchLocation";

// ----------------------------------------------------------------------

type FormValuesProps = {
  deviceName: string;
  remark: string;
  AEPS: string;
  AP: string;
};

export default function WithdrawAttendance(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail, initialize } = useAuthContext();
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [arrofObj, setarrofObj] = useState<any>([]);

  //Loading Screen
  const [openLoading, setOpenLoading] = React.useState(false);
  const handleOpenLoading = () => setOpenLoading(true);
  const handleCloseLoading = () => setOpenLoading(false);

  //Modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setarrofObj([]);
    setMessage("");
  };

  const AEPSSchema = Yup.object().shape({
    deviceName: Yup.string().required("Please Select Device"),
    remark: Yup.string(),
  });

  const defaultValues = {
    deviceName: "",
    remark: `Attendance, ${fDateTime(new Date())}`,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(AEPSSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

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

  useEffect(() => {
    if (arrofObj.length > 0) {
      Attendence();
    }
  }, [arrofObj.length]);

  //   ********************************jquery start here for capture device ***************************

  const Attendence = async () => {
    handleOpenLoading();
    let token = localStorage.getItem("token");
    let body = {
      attendanceType: "TRANSACTIONAL",
      serviceType: props.attendance,
      latitude: localStorage.getItem("lat"),
      longitude: localStorage.getItem("long"),
      requestRemarks: getValues("remark"),
      nationalBankIdentificationNumber: "",
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
    await fetchLocation();
    await Api("aeps/presence", "POST", body, token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.data.message);
          props.handleCloseAttendance();
          setMessage(Response.data.message);
        } else if (Response.data.responseCode == 410) {
          enqueueSnackbar(Response.data.err.message, { variant: "error" });
          setMessage(Response.data.responseMessage);
        } else {
          enqueueSnackbar(Response.data.data.message, { variant: "error" });
          setMessage(Response.data.data.message);
        }
        handleClose();
        handleCloseLoading();
      } else {
        handleCloseLoading();
        handleClose();
      }
    });
  };

  const capture = (data: FormValuesProps) => {
    handleOpen();
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
    if (rdUrl == "") {
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
            enqueueSnackbar(errInfo);
            handleClose();
          }
        } else {
          handleClose();
        }
      }
    };
    xhr.onerror = function () {
      enqueueSnackbar("Check If RD Service/Utility is Running");
    };
    xhr.send(
      '<?xml version="1.0"?> <PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>'
    );
  };

  return (
    <>
      <Helmet>
        <title>AEPS Attendance | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <FormProvider methods={methods} onSubmit={handleSubmit(capture)}>
        <Stack
          width={{ xs: "100%", sm: 450 }}
          margin={"auto"}
          bgcolor={"#fff"}
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
            Plaese mark the attendance to use{" "}
            {props.attendance == "AEPS" ? "AEPS" : "Aadhar Pay"}{" "}
          </Typography>
          <RHFSelect
            name="deviceName"
            label="Select Device"
            placeholder="Select Device"
            SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
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
            disabled
            variant="filled"
            sx={{ width: "90%", margin: "auto" }}
          />
          <Stack
            flexDirection={"row"}
            gap={1}
            sx={{ width: "90%", margin: "auto" }}
          >
            <Button variant="contained" type="submit">
              Scan fingure to continue
            </Button>
            <Button
              variant="contained"
              onClick={() => props.handleCloseAttendance()}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </FormProvider>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {!message ? (
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
            width={{ xs: "100%", sm: 400 }}
          >
            <Stack flexDirection={"column"} alignItems={"center"}>
              <Typography variant="h3">Attendence Status</Typography>
            </Stack>
            <Typography variant="h4" textAlign={"center"} color={"#9e9e9ef0"}>
              {message}
            </Typography>
            <Stack flexDirection={"row"} justifyContent={"center"}>
              <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
                Close
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
