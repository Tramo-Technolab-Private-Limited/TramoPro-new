import { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Stack,
  Button,
  Stepper,
  Step,
  StepLabel,
  styled,
  StepIconProps,
  Typography,
  Modal,
  Grid,
  Box,
  Container,
} from "@mui/material";

import LinearProgress from "@mui/material/LinearProgress";
import DoneIcon from "@mui/icons-material/Done";
import Docs1 from "src/assets/Onboarding/Docs1.svg";
import Docs2 from "src/assets/Onboarding/Docs2.svg";

import Docs3 from "src/assets/Onboarding/Docs3.svg";
import DocsUpload3 from "src/assets/Onboarding/DocsUpload3.svg";
import Docs4 from "src/assets/Onboarding/Docs4.svg";
import Docs5 from "src/assets/Onboarding/Docs5.svg";
import Docs6 from "src/assets/Onboarding/Docs6.svg";

import Paper from "@mui/material/Paper";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import FormProvider from "../../../components/hook-form";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from 'react-router-dom';

import GroupAddIcon from "@mui/icons-material/GroupAdd";
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import AWS from "aws-sdk";
import { Icon } from "@iconify/react";
// ----------------------------------------------------------------------
import { Api, UploadFile } from "src/webservices";
import { useAuthContext } from "src/auth/useAuthContext";
import { PATH_AUTH, STEP_DASHBOARD } from "src/routes/paths";
import Image from "src/components/image/Image";
//image compressor
import Compressor from "compressorjs";

type FormValuesProps = {
  gstCertificateFile: string;
  selfie: string;
  shopImage: string;
  afterSubmit?: string;
};

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const s3 = new AWS.S3();

export default function FinalVerificationForm(props: any) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<any>(0);
  const { user, logout } = useAuthContext();

  useEffect(() => {
    if (user?.finalStatus == "approved" && user?.isNPIN == false) {
      navigate(STEP_DASHBOARD.verifyusernpin);
    }
    if (
      user?.aadharFileUrl === "" ||
      user?.aadharBackUrl === "" ||
      user?.PANFile === "" ||
      user?.selfie[0] === "" ||
      user?.shopImage[0] === ""
    ) {
    } else {
      setActiveStep(1);
    }
  }, []);

  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
      borderRadius: 1,
    },
  }));

  const ColorlibStepIconRoot = styled("div")<{
    ownerState: { completed?: boolean; active?: boolean };
  }>(({ theme, ownerState }) => ({
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.active && {
      backgroundImage:
        "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
    ...(ownerState.completed && {
      backgroundImage:
        "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    }),
  }));
  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement } = {
      1: <Icon icon="arcticons:maadhaar" color="white" fontSize={40} />,
      2: <GroupAddIcon />,
      3: <VideoLabelIcon />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }
  const steps = ["Personal Identification", "Constitution Identification"];

  function nextTab(val: any) {
    setActiveStep(val);
  }

  return (
    <>
      <Stack justifyContent={"start"} my={2}>
        <Stepper activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label, index) => (
            <Step
              key={label}
              // onClick={() => setActiveStep(index)}
            >
              <StepLabel
                StepIconComponent={ColorlibStepIcon}
                sx={{ flexDirection: "column" }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>
      {activeStep == 0 ? (
        <PersonalIdentification callBack={nextTab} />
      ) : (
        <ConstitutionIdentification />
      )}
    </>
  );
}

function PersonalIdentification(props: any) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail } = useAuthContext();

  // aadhaar card front

  const [adhaarFpath, setAdhaarFpath] = useState<any>(
    user?.aadharFileUrl || ""
  );
  const [imageAadhar, setImageAadhar] = useState("");
  const [AadharFlie1, setAadharFlie1] = useState(false);
  const [AadharFile1BtnDis, setAadharFile1BtnDis] = useState(false);
  const [btnDisabledForGstDocs, setbtnDisabledForGstDocs] = useState(true);

  // aadhaar card back
  const [imageAadharBack, setImageAadharBack] = useState("");
  const [adhaarBpath, setAdhaarBpath] = useState<any>(
    user?.aadharBackUrl || ""
  );
  const [AadharFlieBack, setAadharFlieBack] = useState(false);
  const [AadharFileBackBtnDis, setAadharFileBackBtnDis] = useState(false);
  const [btnDisabledForGstDocsBack, setbtnDisabledForGstDocsBack] =
    useState(true);

  //Pan Card
  const [PANCard, setPANCard] = useState("");
  const [PanPath, setPanPath] = useState<any>(user?.PANFile || "");
  const [AadharFliePan, setAadharFliePan] = useState(false);
  const [AadharFilePanBtnDis, setAadharFilePanBtnDis] = useState(false);
  const [btnDisabledForGstDocsPan, setbtnDisabledForGstDocsPan] =
    useState(true);

  //cancelled Cheque Selfie
  const [CancelledCheque, setCancelledCheque] = useState("");
  const [chequePath, setChequePath] = useState(
    user?.Cancelled_Cheque_File || ""
  );
  const [AadharFlieCheque, setAadharFlieCheque] = useState(false);
  const [AadharFileChequeBtnDis, setAadharFileChequeBtnDis] = useState(false);
  const [btnDisabledForGstDocsCheque, setbtnDisabledForGstDocsCheque] =
    useState(true);

  //selfie
  const [SelfieImage, setSelfieImage] = useState("");
  const [AadharFlieSelfie, setAadharFlieSelfie] = useState(false);
  const [AadharFileSelfieBtnDis, setAadharFileSelfieBtnDis] = useState(false);
  const [btnDisabledForGstDocsSelfie, setbtnDisabledForGstDocsSelfie] =
    useState(true);
  const [selfiePath, setSelfiePath] = useState(user?.selfie[0] || "");

  // shop file

  const [ShopImage, setShopImage] = useState("");
  const [shoppath, setShoppath] = useState<any[]>([]);
  const [AadharFlieShop, setAadharFlieShop] = useState(false);
  const [AadharFileShopBtnDis, setAadharFileShopBtnDis] = useState(false);
  const [btnDisabledForGstDocsShop, setbtnDisabledForGstDocsShop] =
    useState(true);

  const defaultValues = {
    docFileUrl: "",
    selfie: "",
    shopImage: "",
  };

  const [Img, setImg] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = (val: string) => {
    setImg(val);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const methods = useForm<FormValuesProps>({
    // resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const Item: any = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "start",
    color: theme.palette.text.secondary,
    boxShadow: "none",
  }));

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    borderRadius: 1,
    p: 4,
  };

  const aadharFrontupload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    let token = localStorage.getItem("token");
    setAadharFlie1(true);
    console.log("aadhar file", e.target.files[0]);
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        console.log(compressedResult);
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "AadharFront");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=aadharFront====", Response.data.filePath);
                setAadharFile1BtnDis(true);
                setbtnDisabledForGstDocs(false);
                setAdhaarFpath(Response.data.filePath);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFlie1(false);
            } else {
              setAadharFlie1(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const params = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: adhaarFpath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", params, (err: any, url: any) => {
    setImageAadhar(url);
  });

  const aadharBackupload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieBack(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "AadharBack");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                setAdhaarBpath(Response.data.filePath);
                setAadharFileBackBtnDis(true);
                setbtnDisabledForGstDocsBack(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFlieBack(false);
            } else {
              setAadharFlieBack(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const adharBack = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: adhaarBpath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", adharBack, (err: any, url: any) => {
    setImageAadharBack(url);
  });

  const panUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    let token = localStorage.getItem("token");
    setAadharFliePan(true);
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "Pancard");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                setPanPath(Response.data.filePath);
                setAadharFilePanBtnDis(true);
                setbtnDisabledForGstDocsPan(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFliePan(false);
            } else {
              setAadharFliePan(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const PanCard = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: PanPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", PanCard, (err: any, url: any) => {
    setPANCard(url);
  });

  const uploadCheque = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieCheque(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "Cheque");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            console.log("=====upload doc========>" + JSON.stringify(Response));

            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=doc====", Response.data.filePath);
                setChequePath(Response.data.filePath);
                setAadharFileChequeBtnDis(true);
                setbtnDisabledForGstDocsCheque(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFlieCheque(false);
            } else {
              setAadharFlieCheque(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const SelfieImageCard = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: selfiePath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", SelfieImageCard, (err: any, url: any) => {
    setSelfieImage(url);
  });

  const selfieUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieSelfie(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "governance");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=aadharFront====", Response.data.filePath);
                setSelfiePath(Response.data.filePath);
                setAadharFileSelfieBtnDis(true);
                setbtnDisabledForGstDocsSelfie(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFlieSelfie(false);
            } else {
              setAadharFlieSelfie(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const CancelledChequeImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: chequePath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", CancelledChequeImage, (err: any, url: any) => {
    setCancelledCheque(url);
  });

  const uploadshop = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieShop(true);

    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "governance");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            console.log("=====upload shop========>" + JSON.stringify(Response));
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=shop====", Response.data.filePath);

                let path = Response.data.filePath;
                if (shoppath?.length < 3) {
                  setShoppath((shoppath) => [...shoppath, path]);
                  setAadharFileShopBtnDis(true);
                  setbtnDisabledForGstDocsShop(false);
                  console.log(
                    "///////////////////////////////////////////////////////////////////////",
                    "jjjjjjjjjjjjjjjjjj"
                  );
                } else {
                  enqueueSnackbar("Only 3 images you can select!");
                }
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
              setAadharFlieShop(false);
            } else {
              setAadharFlieShop(false);
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };
  const ShopImageCard = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: shoppath[0]?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", ShopImageCard, (err: any, url: any) => {
    setShopImage(url);

    console.log("shop Image path ...................URL..", url);
  });

  const handleDocuments = (docVal: any) => {
    if (docVal == "AadharFront") {
      setAadharFile1BtnDis(false);
    } else if (docVal == "AadharBack") {
      setAadharFileBackBtnDis(false);
    } else if (docVal == "PanNumber") {
      setAadharFilePanBtnDis(false);
    } else if (docVal == "CancelledCheque") {
      setAadharFileChequeBtnDis(false);
    } else if (docVal == "ShopImage") {
      setAadharFileShopBtnDis(false);
    } else if (docVal == "Selfie") {
      setAadharFileSelfieBtnDis(false);
    }
  };
  const onSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    if (adhaarFpath !== "") {
      if (adhaarBpath !== "") {
        if (PanPath !== "") {
          if (chequePath !== "") {
            if (selfiePath !== "") {
              // if (shoppath.length !== "") {
              const body = {
                aadhaar_front: adhaarFpath,
                aadhaar_back: adhaarBpath,
                PAN_url: PanPath,
                selfie: [selfiePath],
                shop_images: shoppath,
                Cancelled_Cheque_File: chequePath,
              };
              Api(`user/KYC/save_PID_Info`, "POST", body, token).then(
                (Response: any) => {
                  console.log("=============>", Response);
                  if (Response.status == 200) {
                    if (Response.data.code == 200) {
                      enqueueSnackbar(Response.data.message);
                      UpdateUserDetail({
                        aadharFileUrl: adhaarFpath,
                        aadharBackUrl: adhaarBpath,
                        PANFile: PanPath,
                        selfie: [],
                        shopImage: shoppath,
                        is_PID_Docs: true,
                        chequeCancelled: chequePath,
                      });
                      props.callBack(1);
                      window.scrollTo(0, 0);
                    } else {
                      enqueueSnackbar(Response.data.message, {
                        variant: "error",
                      });
                    }
                  }
                }
              );
              // } else {
              //   enqueueSnackbar("Please Upload shop images", {
              //     variant: "error",
              //   });
              // }
            } else {
              enqueueSnackbar("Please Upload Selfie ", { variant: "error" });
            }
          } else {
            enqueueSnackbar("Please Upload cheque FIle", { variant: "error" });
          }
        } else {
          enqueueSnackbar("Please Upload Pan FIle", { variant: "error" });
        }
      } else {
        enqueueSnackbar("Please Upload Aadhar Back FIle", { variant: "error" });
      }
    } else {
      enqueueSnackbar("Please Upload Aadhar Front FIle", { variant: "error" });
    }
  };

  const handleOnClickfileUploadSuccess = () => {
    navigate("/auth/verifyaadhar");
  };
  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {!user?.is_PID_Docs ||
        user?.aadharFileUrl === "" ||
        user?.aadharBackUrl === "" ||
        user?.PANFile === "" ||
        user?.selfie[0] === "" ||
        user?.shopImage[0] === "" ? (
          <>
            {/* aadhaar Front */}

            <>
              {!user?.aadharFileUrl && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 2,
                          sm: 3,
                          md: 4,
                          lg: 5,
                          xl: 8,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs1}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Front Side of Aadhar Card
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlie1 ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFile1BtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="AdharFile"
                                        onChange={aadharFrontupload}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("AadharFront")
                                          }
                                        >
                                          Clear
                                        </Button>

                                        <Image
                                          src={imageAadhar && imageAadhar}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageAadhar &&
                                            handleOpen(imageAadhar)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}

              {/* aadhaar back */}
              {!user?.aadharBackUrl && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs2}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Back Side of Aadhar Card
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieBack ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileBackBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="AdharFile"
                                        onChange={aadharBackupload}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",

                                            color: "black",

                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("AadharBack")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={
                                            imageAadharBack && imageAadharBack
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageAadharBack &&
                                            handleOpen(imageAadharBack)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}
              {/* Pan Card */}

              {!user?.PANFile && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={
                                    AadharFilePanBtnDis ? DocsUpload3 : Docs3
                                  }
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Pan Crad
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFliePan ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFilePanBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="AdharFile"
                                        onChange={panUpload}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("PanNumber")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={PANCard && PANCard}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            PANCard && handleOpen(PANCard)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}
              {/* cancelled cheque */}

              {!user?.Cancelled_Cheque_File && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs4}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Your Cancelled Cheque
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieCheque ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileChequeBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="AdharFile"
                                        onChange={uploadCheque}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",

                                            color: "black",

                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("CancelledCheque")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={
                                            CancelledCheque && CancelledCheque
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            CancelledCheque &&
                                            handleOpen(CancelledCheque)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}
              {/* selfle */}

              {!user?.selfie[0]?.length && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs5}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Your Selfle
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieSelfie ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileSelfieBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="AdharFile"
                                        onChange={selfieUpload}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",

                                            color: "black",

                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("Selfie")
                                          }
                                        >
                                          Clear
                                        </Button>

                                        <Image
                                          src={SelfieImage && SelfieImage}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            SelfieImage &&
                                            handleOpen(SelfieImage)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}
              {!user?.shopImage[0]?.length && (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs6}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Your Shop Image
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieShop ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileShopBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="ShopImage"
                                        onChange={uploadshop}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handleDocuments("ShopImage")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={ShopImage && ShopImage}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            ShopImage && handleOpen(ShopImage)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              )}
            </>
            {/* </Grid> */}

            <Stack flexDirection="row" gap={1} ml={5} mt={3}>
              <Typography variant="h6">Note :</Typography>
              <Typography variant="body1" mt={0.5}>
                Please ensure all your Personal KYC documents are self attested
                and the company documents must be stamped and duly signed.{" "}
              </Typography>
            </Stack>
            <Stack my={5}>
              <Button
                variant="contained"
                sx={{ width: "fit-content", margin: "auto" }}
                type="submit"
              >
                Continue
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Stack
              alignItems={"center"}
              justifyContent={"center"}
              flexDirection={"row"}
              my={3}
              gap={1}
            >
              <Typography variant="h4" color="green">
                Personal Identification Documents already Uploaded{" "}
              </Typography>
              <Icon icon="el:ok" color="green" fontSize={25} />
            </Stack>
            <Stack my={5}>
              <Button
                variant="contained"
                sx={{ width: "fit-content", margin: "auto" }}
                type="submit"
              >
                Continue
              </Button>
            </Stack>
          </>
        )}
      </FormProvider>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} width={{ sm: "95%", md: "70%" }}>
          <Image src={Img} alt={"IMAGE"} />
          <Button variant="contained" onClick={handleClose}>
            close
          </Button>
        </Box>
      </Modal>
    </>
  );
}

function ConstitutionIdentification() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail, initialize, logout } = useAuthContext();

  //Gst Certificate

  const [gstCertificatePath, setGstCertificatepath] = useState<any>(
    user?.GSTFile || ""
  );
  const [imageMSME, setImageMSME] = useState("");
  const [AadharFlieMSME, setAadharFlieMSME] = useState(false);
  const [AadharFileMSMEBtnDis, setAadharFileMSMEBtnDis] = useState(false);

  //Other Certificate
  const [otherCertificateFile, setOtherCertificateFile] = useState<any>();
  const [successOtherCertificate, setSuccessOtherCertificate] =
    useState("upload");
  const [otherCertificatePath, setOtherCertificatepath] = useState<any>(
    user?.otherDocs[0]?.docURL || ""
  );

  //Business Proof

  const [businessProofPath, setBusinessProofpath] = useState<any>("");
  const [AadharFlieBusPrf, setAadharFlieBusPrf] = useState(false);
  const [AadharFileBusPrfBtnDis, setAadharFileBusPrfBtnDis] = useState(false);

  //Business pan
  const [imagePAN, setImagePAN] = useState("");
  const [AadharFileBusPanBtnDis, setAadharFileBusPanBtnDis] = useState<any>("");
  const [AadharFlieBusPan, setAadharFlieBusPan] = useState(false);
  const [businessPanPath, setBusinessPanpath] = useState<any>(
    user?.PANFile_Company || ""
  );

  //Partnership Deed
  const [imagepartnershipDeed, setImagepartnershipDeed] = useState("");
  const [AadharFilepDeedBtnDis, setAadharFilepDeedBtnDis] = useState<any>("");
  const [AadharFliepDeed, setAadharFliepDeed] = useState(false);
  const [partnershipDeedPath, setPartnershipDeedpath] = useState<any>(
    user?.Partnership_deed_File || ""
  );

  //board Resolution
  const [imageboardResolution, setimageboardResolution] = useState("");
  const [AadharFlieBrdRes, setAadharFlieBrdRes] = useState(false);
  const [AadharFileBrdResBtnDis, setAadharFileBrdResBtnDis] = useState(false);
  const [boardResolutionPath, setBoardResolutionpath] = useState<any>(
    user?.Board_Resolution_File || ""
  );

  //Certificate Of Incorporation
  const [imageCOI, setimageCOI] = useState("");
  const [AadharFlieCOI, setAadharFlieCOI] = useState(false);
  const [AadharFileCOIBtnDis, setAadharFileCOIBtnDis] = useState(false);
  const [COIPath, setCOIpath] = useState<any>(user?.COI_File || "");

  //Memorandum Of Association
  const [imageMOA, setImageMOA] = useState("");
  const [AadharFlieMOA, setAadharFlieMOA] = useState(false);
  const [AadharFileMOABtnDis, setAadharFileMOABtnDis] = useState(false);
  const [MOAPath, setMOApath] = useState<any>(user?.MOA_File || "");

  //Article Of Association
  const [imageAOA, setImageAOA] = useState("");
  const [AadharFlieAOA, setAadharFlieAOA] = useState(false);
  const [AadharFileAOABtnDis, setAadharFileAOABtnDis] = useState(false);
  const [AOAPath, setAOApath] = useState<any>(user?.AOA_File || "");

  //Consent Letter
  const [imageNominatedPartner, setImageNominatedPartner] = useState("");
  const [AadharFlieNominatedPartner, setAadharFlieNominatedPartner] =
    useState(false);
  const [
    AadharFileNominatedPartnerBtnDis,
    setAadharFileNominatedPartnerBtnDis,
  ] = useState(false);
  const [consentLetterPath, setConsentLetterpath] = useState<any>(
    user?.Consent_Letter_File || ""
  );

  //Consent Letter
  const [imagePartnerIdentity, setImagePartnerIdentity] = useState("");
  const [AadharFliePartnerIdentity, setAadharFliePartnerIdentity] =
    useState(false);
  const [AadharFilePartnerIdentityBtnDis, setAadharFilePartnerIdentityBtnDis] =
    useState(false);
  const [DPINPath, setDPINpath] = useState<any>(user?.DPIN_File || "");

  const [docType, setDocType] = useState(user?.otherDocs[0]?.docType || "");
  const [docIdNum, setDocIdNum] = useState(
    user?.otherDocs[0]?.docIdNumber || ""
  );
  const [docIssuedBy, setDocIssuedBy] = useState(
    user?.otherDocs[0]?.issuedBy || ""
  );

  const DocTypeHandle = (e: any) => {
    setDocType(e.target.type);
  };
  const DocIdNumHandle = (e: any) => {
    setDocIdNum(e.target.type);
  };
  const DocIssuedByHandle = (e: any) => {
    setDocIssuedBy(e.target.type);
  };
  const navigate = useNavigate();

  const [Img, setImg] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = (val: string) => {
    setImg(val);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    borderRadius: 1,
    p: 4,
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "start",
    color: theme.palette.text.secondary,
    boxShadow: "none",
  }));

  // const LOGIN = () => {
  //   navigate(PATH_AUTH.login);
  // };

  const otherhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessOtherCertificate("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setOtherCertificateFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const gstCertificateUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });

    setAadharFlieMSME(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "gstCertificate");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log(
                  "===200=gstCertificate====",
                  Response.data.filePath
                );
                setGstCertificatepath(Response.data.filePath);
                setAadharFileMSMEBtnDis(true);
                setAadharFlieMSME(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const gstCertificateImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: gstCertificatePath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", gstCertificateImage, (err: any, url: any) => {
    setImageMSME(url);
  });

  const otherCertificateUpload = () => {
    if (otherCertificateFile?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setSuccessOtherCertificate("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", otherCertificateFile);
    formData.append("directoryName", "gstCertificate");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=gstCertificate====", Response.data.filePath);
            setOtherCertificatepath(Response.data.filePath);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const businessProofUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieBusPrf(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "businessProof");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=businessProof====", Response.data.filePath);
                setBusinessProofpath(Response.data.filePath);
                setAadharFileBusPrfBtnDis(true);
                setAadharFlieBusPrf(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const businessPanUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    console.log("bpan");
    setAadharFlieBusPan(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "businessPan");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=businessPan====", Response.data.filePath);
                setBusinessPanpath(Response.data.filePath);
                setAadharFileBusPanBtnDis(true);
                setAadharFlieBusPan(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const BusPANImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: businessPanPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", BusPANImage, (err: any, url: any) => {
    setImagePAN(url);
  });

  const partnershipDeedUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFliepDeed(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "partnershipDeed");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log(
                  "===200=partnershipDeed====",
                  Response.data.filePath
                );
                setPartnershipDeedpath(Response.data.filePath);

                setAadharFliepDeed(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const NominatedPartnerImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: partnershipDeedPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", NominatedPartnerImage, (err: any, url: any) => {
    setImagepartnershipDeed(url);
  });

  const boardResolutionUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    console.log("brdr");
    setAadharFlieBrdRes(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "boardResolution");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log(
                  "===200=boardResolution====",
                  Response.data.filePath
                );
                setBoardResolutionpath(Response.data.filePath);
                setAadharFileBrdResBtnDis(true);
                setAadharFlieBrdRes(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const boardResolutionImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: boardResolutionPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", boardResolutionImage, (err: any, url: any) => {
    setimageboardResolution(url);
  });

  const COIUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieCOI(false);
    console.log("coi");
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "COI");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=COI====", Response.data.filePath);
                setCOIpath(Response.data.filePath);
                setAadharFileCOIBtnDis(true);
                setAadharFlieCOI(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const COIImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: COIPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", COIImage, (err: any, url: any) => {
    setimageCOI(url);
  });

  const MOAUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    console.log("moa");
    setAadharFlieMOA(false);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "MOA");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=MOAFile====", Response.data.filePath);
                setMOApath(Response.data.filePath);
                setAadharFileMOABtnDis(true);
                setAadharFlieMOA(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const MOAImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: MOAPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", MOAImage, (err: any, url: any) => {
    setImageMOA(url);
  });

  const AOAUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieAOA(false);
    console.log("aoa");
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "AOA");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=AOA====", Response.data.filePath);
                setAOApath(Response.data.filePath);
                setAadharFileAOABtnDis(true);
                setAadharFlieAOA(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  // setImageAOA

  const AOAImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: AOAPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", AOAImage, (err: any, url: any) => {
    setImageAOA(url);
  });

  const consentLetterUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFlieNominatedPartner(false);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "COI");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log(
                  "===200=consentLetterFile====",
                  Response.data.filePath
                );
                setConsentLetterpath(Response.data.filePath);
                setAadharFileNominatedPartnerBtnDis(true);
                setAadharFlieNominatedPartner(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const PartnershipDeedImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: consentLetterPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", PartnershipDeedImage, (err: any, url: any) => {
    setImageNominatedPartner(url);
  });

  const DPINUpload = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setAadharFliePartnerIdentity(false);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "COI");
        UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                console.log("===200=DPINFile====", Response.data.filePath);
                setDPINpath(Response.data.filePath);
                setAadharFilePartnerIdentityBtnDis(true);
                setAadharFliePartnerIdentity(false);
              } else {
                enqueueSnackbar("Server didn`t response", { variant: "error" });
              }
            } else {
              enqueueSnackbar("file must be less then 1mb", {
                variant: "error",
              });
            }
          }
        );
      },
    });
  };

  const PartnerIdentityImage = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: DPINPath?.split("/").splice(4, 4).join("/"),
    Expires: 600, // Expiration time in seconds
  };

  s3.getSignedUrl("getObject", PartnerIdentityImage, (err: any, url: any) => {
    setImagePartnerIdentity(url);
  });

  const constitutionDocs = Yup.object().shape({});

  const defaultValues = {};

  const handlePIDDocuments = (docVal: any) => {
    if (docVal == "MSME") {
      setAadharFileMSMEBtnDis(false);
    } else if (docVal == "BusPrf") {
      setAadharFileBusPanBtnDis(false);
    } else if (docVal == "Boardresolution") {
      setAadharFileBrdResBtnDis(false);
    } else if (docVal == "Incorporation") {
      setAadharFileBrdResBtnDis(false);
    } else if (docVal == "AOA") {
      setAadharFileAOABtnDis(false);
    } else if (docVal == "partnershipDeed") {
      setAadharFilepDeedBtnDis(false);
    } else if (docVal == "NominatedPartner") {
      setAadharFileNominatedPartnerBtnDis(false);
    } else if (docVal == "PartnerIdentity") {
      setAadharFilePartnerIdentityBtnDis(false);
    }
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(constitutionDocs),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  //upload validation
  const onSubmit = (data: FormValuesProps) => {
    if (user?.constitutionType.toLowerCase() == "proprietorship") {
      if (user?.isGST) {
        gstCertificatePath == ""
          ? enqueueSnackbar("Please uplaod GST certificate")
          : submitDocs();
      } else {
        businessProofPath == ""
          ? enqueueSnackbar("Please uplaod business proof")
          : submitDocs();
      }
    }
    if (user?.constitutionType.toLowerCase() == "partnership") {
      if (user?.isGST) {
        businessPanPath == "" ||
        partnershipDeedPath == "" ||
        gstCertificatePath == "" ||
        boardResolutionPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      } else {
        businessPanPath == "" || partnershipDeedPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      }
    }
    if (user?.constitutionType.toLowerCase() == "one person company") {
      if (user?.isGST) {
        businessPanPath == "" ||
        COIPath == "" ||
        MOAPath == "" ||
        gstCertificatePath == "" ||
        AOAPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      } else {
        businessPanPath == "" || COIPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      }
    }
    if (user?.constitutionType.toLowerCase() == "private limited company") {
      if (user?.isGST) {
        gstCertificatePath == "" ||
        businessPanPath == "" ||
        COIPath == "" ||
        MOAPath == "" ||
        AOAPath == "" ||
        boardResolutionPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      } else {
        businessPanPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      }
    }
    if (
      user?.constitutionType.toLowerCase() == "limited liability partnership"
    ) {
      if (user?.isGST) {
        gstCertificatePath == "" ||
        businessPanPath == "" ||
        COIPath == "" ||
        partnershipDeedPath == "" ||
        consentLetterPath == "" ||
        DPINPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      } else {
        businessPanPath == ""
          ? enqueueSnackbar("Please uplaod All Documents")
          : submitDocs();
      }
    }
    if (user?.constitutionType.toLowerCase() == "individual") {
      submitDocs();
    }
  };

  function submitDocs() {
    let token = localStorage.getItem("token");
    const body = {
      otherDocs: [
        {
          docType: docType,
          docIdNumber: docIdNum,
          docURL: otherCertificatePath,
          issuedBy: docIssuedBy,
        },
      ],
      GSTFile: gstCertificatePath || "",
      PANFile_Company: businessPanPath || "",
      AOA_File: AOAPath || "",
      DPIN_File: DPINPath || "",
      Consent_Letter_File: consentLetterPath || "",
      COI_File: COIPath || "",
      MOA_File: MOAPath || "",
      Partnership_deed_File: partnershipDeedPath || "",
      Board_Resolution_File: boardResolutionPath || "",
    };
    Api(`user/KYC/save_CID_Info`, "POST", body, token).then((Response: any) => {
      console.log("=============>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          UpdateUserDetail({
            is_CID_Docs: true,
            GSTFile: gstCertificatePath,
            PANFile_Company: businessPanPath,
          });
          initialize();
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  }

  return (
    <>
      {(!user?.is_CID_Docs ||
        user?.GSTFile === "" ||
        user?.PANFile_company === "") &&
      user?.constitutionType.toLowerCase() !== "individual" ? (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {user?.constitutionType.toLowerCase() !== "individual" ? (
            <Grid>
              {/* gst certificate */}
              {!user?.isGST &&
              (user?.constitutionType.toLowerCase() ==
                "private limited company" ||
                user?.constitutionType.toLowerCase() == "one person company" ||
                user?.constitutionType == "Partnership" ||
                user?.constitutionType == "Limited Liability Partnership" ||
                user?.constitutionType.toLowerCase() == "proprietorship") ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs1}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Shops and Establishment Reg. Certificate/Udyog
                                  Aadhaar Registration certificate for MSME
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieMSME ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileMSMEBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",

                                        color: "black",

                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="MSME"
                                        onChange={gstCertificateUpload}
                                        type="file"
                                        disabled={user?.GSTFile}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",

                                            color: "black",

                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments("MSME")
                                          }
                                        >
                                          Clear
                                        </Button>

                                        <Image
                                          src={imageMSME && imageMSME}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageMSME && handleOpen(imageMSME)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {user?.isGST &&
              (user?.constitutionType.toLowerCase() ==
                "private limited company" ||
                user?.constitutionType.toLowerCase() == "one person company" ||
                user?.constitutionType == "Partnership" ||
                user?.constitutionType == "Limited Liability Partnership" ||
                user?.constitutionType.toLowerCase() == "proprietorship") ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs1}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  GST Certificate
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieMSME ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileMSMEBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="MSME"
                                        onChange={gstCertificateUpload}
                                        type="file"
                                        disabled={user?.GSTFile}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",

                                            color: "black",

                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments("MSME")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={imageMSME && imageMSME}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageMSME && handleOpen(imageMSME)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}

              {user?.constitutionType.toLowerCase() ==
                "private limited company" ||
              user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType == "Limited Liability Partnership" ||
              user?.constitutionType == "Partnership" ? (
                <>
                  <Box>
                    <Container component="main">
                      <Box
                        justifyContent={"center"}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "gray",
                          marginTop: {
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 2,
                          },
                          width: "100%",
                        }}
                      >
                        <Box padding={0}>
                          <Grid container>
                            <Grid xs={10}>
                              <Item>
                                <Stack
                                  display={"flex"}
                                  direction={"row"}
                                  spacing={1}
                                >
                                  <img
                                    src={Docs2}
                                    style={{
                                      height: "20px",
                                      width: "20px",
                                      marginTop: "0px",
                                    }}
                                    alt=""
                                  />
                                  <Typography
                                    fontSize={14}
                                    color={"#454F5B"}
                                    fontStyle={"normal"}
                                    fontFamily={"Public Sans"}
                                    fontWeight={500}
                                  >
                                    Choose Business pan
                                  </Typography>
                                </Stack>{" "}
                              </Item>
                            </Grid>
                            <Grid xs>
                              <Item>
                                {AadharFlieBusPan ? (
                                  <LinearProgress />
                                ) : (
                                  <>
                                    {!AadharFileBusPanBtnDis ? (
                                      <Button
                                        component="label"
                                        size="small"
                                        sx={{
                                          border: "1px solid",

                                          color: "black",

                                          fontFamily: "Public Sans",
                                          fontSize: "14px",
                                          textTransform: "none",
                                        }}
                                        startIcon={
                                          <FileUploadIcon sx={{ mt: 0 }} />
                                        }
                                      >
                                        Upload
                                        <VisuallyHiddenInput
                                          name="BusPrf"
                                          onChange={businessPanUpload}
                                          type="file"
                                          disabled={user?.PANFile_Company}
                                        />
                                      </Button>
                                    ) : (
                                      <>
                                        <Stack
                                          display={"flex"}
                                          direction={"row"}
                                          spacing={1}
                                        >
                                          <Button
                                            component="label"
                                            size="small"
                                            sx={{
                                              border: "1px solid",

                                              color: "black",

                                              fontFamily: "Public Sans",
                                              fontSize: "14px",
                                              textTransform: "none",
                                            }}
                                            onClick={() =>
                                              handlePIDDocuments("BusPrf")
                                            }
                                          >
                                            Clear
                                          </Button>
                                          <Image
                                            src={imagePAN && imagePAN}
                                            style={{
                                              borderRadius: "3px",
                                              border: "1px solid black",
                                              width: 50,
                                              height: 50,
                                            }}
                                            onClick={() =>
                                              imagePAN && handleOpen(imagePAN)
                                            }
                                          />
                                        </Stack>
                                      </>
                                    )}
                                  </>
                                )}
                              </Item>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Container>
                  </Box>
                </>
              ) : (
                ""
              )}
              {/* Registered Partnership Deed */}
              {user?.constitutionType == "Partnership" ||
              user?.constitutionType == "Limited Liability Partnership" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs6}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Partnership Deed / Agreement
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFliepDeed ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFilepDeedBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="partnershipDeed"
                                        onChange={partnershipDeedUpload}
                                        type="file"
                                        disabled={user?.Partnership_deed_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        direction={"row"}
                                        display={"flex"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments(
                                              "partnershipDeed"
                                            )
                                          }
                                        >
                                          Clear
                                        </Button>

                                        <Image
                                          src={
                                            imagepartnershipDeed &&
                                            imagepartnershipDeed
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imagepartnershipDeed &&
                                            handleOpen(imagepartnershipDeed)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* Copy of Board Resolution */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs3}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Copy of Board resolution
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieBrdRes ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileBrdResBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="BusPrf"
                                        onChange={boardResolutionUpload}
                                        type="file"
                                        disabled={user?.Board_Resolution_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments(
                                              "Boardresolution"
                                            )
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={
                                            imageboardResolution &&
                                            imageboardResolution
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageboardResolution &&
                                            handleOpen(imageboardResolution)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* Certificate Of Incorporation */}
              {user?.constitutionType.toLowerCase() ==
                "private limited company" ||
              user?.constitutionType.toLowerCase() == "one person company" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs4}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Certificate Of Incorporation
                                </Typography>
                              </Stack>
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieCOI ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileCOIBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="Incorporation"
                                        onChange={COIUpload}
                                        type="file"
                                        disabled={user?.COI_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments("Incorporation")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={imageCOI && imageCOI}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageCOI && handleOpen(imageCOI)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* Memorandum Of Association */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs5}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Memorandum Of Association
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieMOA ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileMOABtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="MOA"
                                        onChange={MOAUpload}
                                        type="file"
                                        disabled={user?.MOA_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments("MOA")
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={imageMOA && imageMOA}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageMOA && handleOpen(imageMOA)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* Article Of Association */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs6}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Article Of Association
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieAOA ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileAOABtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="MOA"
                                        onChange={AOAUpload}
                                        type="file"
                                        disabled={user?.AOA_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments("AOA")
                                          }
                                        >
                                          Clear
                                        </Button>

                                        <Image
                                          src={imageAOA && imageAOA}
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageAOA && handleOpen(imageAOA)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* Consent Letter */}
              {user?.constitutionType.toLowerCase() ==
                "limited liability partnership" ||
              user?.constitutionType == "Partnership" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs6}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Authority letter authorizing Desiginated
                                  Partner / Nominated Partner to sign Agtreement
                                  and Other Documents.
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFlieNominatedPartner ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFileNominatedPartnerBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="Consent_Letter_File"
                                        onChange={consentLetterUpload}
                                        type="file"
                                        disabled={user?.Consent_Letter_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments(
                                              "NominatedPartner"
                                            )
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={
                                            imageNominatedPartner &&
                                            imageNominatedPartner
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imageNominatedPartner &&
                                            handleOpen(imageNominatedPartner)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
              {/* DPIN Designated Partner Identity Number */}
              {user?.constitutionType == "Limited Liability Partnership" ? (
                <Box>
                  <Container component="main">
                    <Box
                      justifyContent={"center"}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "gray",
                        marginTop: {
                          xs: 1,
                          sm: 1,
                          md: 2,
                          lg: 2,
                          xl: 2,
                        },
                        width: "100%",
                      }}
                    >
                      <Box padding={0}>
                        <Grid container>
                          <Grid xs={10}>
                            <Item>
                              <Stack
                                display={"flex"}
                                direction={"row"}
                                spacing={1}
                              >
                                <img
                                  src={Docs6}
                                  style={{
                                    height: "20px",
                                    width: "20px",
                                    marginTop: "0px",
                                  }}
                                  alt=""
                                />
                                <Typography
                                  fontSize={14}
                                  color={"#454F5B"}
                                  fontStyle={"normal"}
                                  fontFamily={"Public Sans"}
                                  fontWeight={500}
                                >
                                  Choose Designated Partner Identity Number
                                </Typography>
                              </Stack>{" "}
                            </Item>
                          </Grid>
                          <Grid xs>
                            <Item>
                              {AadharFliePartnerIdentity ? (
                                <LinearProgress />
                              ) : (
                                <>
                                  {!AadharFilePartnerIdentityBtnDis ? (
                                    <Button
                                      component="label"
                                      size="small"
                                      sx={{
                                        border: "1px solid",
                                        color: "black",
                                        fontFamily: "Public Sans",
                                        fontSize: "14px",
                                        textTransform: "none",
                                      }}
                                      startIcon={
                                        <FileUploadIcon sx={{ mt: 0 }} />
                                      }
                                    >
                                      Upload
                                      <VisuallyHiddenInput
                                        name="Consent_Letter_File"
                                        onChange={DPINUpload}
                                        type="file"
                                        disabled={user?.Consent_Letter_File}
                                      />
                                    </Button>
                                  ) : (
                                    <>
                                      <Stack
                                        display={"flex"}
                                        direction={"row"}
                                        spacing={1}
                                      >
                                        <Button
                                          component="label"
                                          size="small"
                                          sx={{
                                            border: "1px solid",
                                            color: "black",
                                            fontFamily: "Public Sans",
                                            fontSize: "14px",
                                            textTransform: "none",
                                          }}
                                          onClick={() =>
                                            handlePIDDocuments(
                                              "PartnerIdentity"
                                            )
                                          }
                                        >
                                          Clear
                                        </Button>
                                        <Image
                                          src={
                                            imagePartnerIdentity &&
                                            imagePartnerIdentity
                                          }
                                          style={{
                                            borderRadius: "3px",
                                            border: "1px solid black",
                                            width: 50,
                                            height: 50,
                                          }}
                                          onClick={() =>
                                            imagePartnerIdentity &&
                                            handleOpen(imagePartnerIdentity)
                                          }
                                        />
                                      </Stack>
                                    </>
                                  )}
                                </>
                              )}
                            </Item>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </Container>
                </Box>
              ) : null}
            </Grid>
          ) : (
            <Typography variant="h4" sx={{ color: "#707070" }}>
              No Need of any Business Documents
            </Typography>
          )}
          <Stack flexDirection="row" gap={1} ml={5} mt={3}>
            <Typography variant="h6">Note :</Typography>
            <Typography variant="body1" mt={0.5}>
              Please ensure all your Personal KYC documents are self attested
              and the company documents must be stamped and duly signed.{" "}
            </Typography>
          </Stack>
          <Stack mt={5}>
            {user?.isAadhaarVerified &&
            user?.isGSTVerified &&
            user?.isPANVerified &&
            user?.is_PID_Docs ? (
              <>
                <Stack justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={submitDocs}
                    sx={{
                      width: "fit-content",
                      mx: "auto",
                    }}
                  >
                    Continue
                  </Button>
                </Stack>
              </>
            ) : (
              <Typography variant="h4" color="green">
                Your Application has been submitted successfully
              </Typography>
            )}
          </Stack>
        </FormProvider>
      ) : (
        <>
          <Stack alignItems={"center"} justifyContent={"center"} my={3} gap={1}>
            {user?.constitutionType.toLowerCase() == "Individual" ? (
              <Typography variant="h4" color="green">
                Constitution Documents Uploaded Successfully
                <Icon icon="el:ok" color="green" fontSize={25} />
              </Typography>
            ) : (
              <Typography variant="h4" color="green">
                Constitution Documents Uploaded Successfully
                <Icon icon="el:ok" color="green" fontSize={25} />
              </Typography>
            )}

            <Typography variant="h3" marginTop={3} marginBottom={6}>
              KYC Under Review.
            </Typography>
          </Stack>
          <Stack alignItems={"center"} justifyContent={"center"} my={3} gap={1}>
            <Button
              style={{ width: "200px" }}
              variant="contained"
              size="large"
              onClick={logout}
            >
              Logout
            </Button>
          </Stack>
        </>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} width={{ sm: "95%", md: "70%" }}>
          <Image src={Img} alt={"IMAGE"} />
          <Button variant="contained" onClick={handleClose}>
            close
          </Button>
        </Box>
      </Modal>
    </>
  );
}
