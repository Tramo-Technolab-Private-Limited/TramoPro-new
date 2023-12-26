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
  Alert,
  Grid,
  Box,
  Container,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import LinearProgress from "@mui/material/LinearProgress";
import DoneIcon from "@mui/icons-material/Done";
import Docs1 from "src/assets/Onboarding/Docs1.svg";
import Docs2 from "src/assets/Onboarding/Docs2.svg";

import Docs3 from "src/assets/Onboarding/Docs3.svg";
import DocsUpload3 from "src/assets/Onboarding/DocsUpload3.svg";
import Docs4 from "src/assets/Onboarding/Docs4.svg";
import Docs5 from "src/assets/Onboarding/Docs5.svg";
import Docs6 from "src/assets/Onboarding/Docs6.svg";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import Paper from "@mui/material/Paper";
import { LoadingButton } from "@mui/lab";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FormProvider, { RHFTextField } from "../../../components/hook-form";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from 'react-router-dom';
import Upload from "../../../components/upload/Upload";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import AWS from "aws-sdk";
import { Icon } from "@iconify/react";
// ----------------------------------------------------------------------
import { Api, UploadFile } from "src/webservices";
import { useAuthContext } from "src/auth/useAuthContext";
import { STEP_DASHBOARD } from "src/routes/paths";
import Image from "src/components/image/Image";

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
  const { user } = useAuthContext();

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

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "start",
    color: theme.palette.text.secondary,
    boxShadow: "none",
  }));

  const aadharFrontupload = (e: any) => {
    let token = localStorage.getItem("token");
    setAadharFlie1(true);
    console.log("aadhar file", e.target.files[0]);
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
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
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
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
    setAadharFlieBack(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
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
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
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
    let token = localStorage.getItem("token");
    setAadharFliePan(true);
    console.log("panfile");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
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
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
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
    setAadharFlieCheque(true);
    let token = localStorage.getItem("token");

    let formData = new FormData();
    formData.append("document", e.target.files[0]);
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
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
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
    setAadharFlieSelfie(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("directoryName", "governance");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        console.log(
          "=====uploadAadharfrontResponse========>" + JSON.stringify(Response)
        );
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
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
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
    setAadharFlieShop(true);

    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("directoryName", "governance");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        console.log("=====upload shop========>" + JSON.stringify(Response));
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=shop====", Response.data.filePath);
            // shopImg.push(Response.data.filePath)
            let path = Response.data.filePath;
            if (shoppath?.length < 3) {
              setShoppath((shoppath) => [...shoppath, path]);
              setAadharFileShopBtnDis(true);
              setbtnDisabledForGstDocsShop(false);
            } else {
              enqueueSnackbar("Only 3 images you can select!");
            }
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
          setAadharFlieShop(false);
        } else {
          setAadharFlieShop(false);
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };
  const ShopImageCard = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
    Key: shoppath?.map((item: any) => item?.split("/").splice(4, 4).join("/")),
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
    }
  };
  const onSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    if (adhaarFpath !== "") {
      if (adhaarBpath !== "") {
        if (PanPath !== "") {
          if (chequePath !== "") {
            if (selfiePath !== "") {
              if (shoppath.length !== 0) {
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
              } else {
                enqueueSnackbar("Please Upload shop images", {
                  variant: "error",
                });
              }
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
                                        Reset
                                      </Button>

                                      <Image
                                        src={imageAadhar && imageAadhar}
                                        style={{
                                          borderRadius: "3px",
                                          border: "1px solid black",
                                          width: 50,
                                          height: 50,
                                        }}
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
            {/* {!agentDetail.aadharBackUrl && (
              <Stack>
                <p>Choose Back Side of Aadhar Card (Optional)</p>
                <Upload
                  file={adhaarBackFile}
                  onDrop={ABhandleDropSingleFile}
                  onDelete={() => setAdhaarBackFile(null)}
                />{' '}
                {adhaarBackFile && (
                  <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                    {successAadharBack == 'upload' ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        onClick={() => aadharBackupload()}
                      >
                        Upload File
                      </LoadingButton>
                    ) : successAadharBack == 'wait' ? (
                      <LoadingButton variant="contained" loading component="span">
                        success
                      </LoadingButton>
                    ) : (
                      <Icon
                        icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                        color="green"
                        fontSize={40}
                        style={{ marginRight: 15 }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            )} */}

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
                                        Reset
                                      </Button>
                                      <Image
                                        src={imageAadharBack && imageAadharBack}
                                        style={{
                                          borderRadius: "3px",
                                          border: "1px solid black",
                                          width: 50,
                                          height: 50,
                                        }}
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
            {/* {!agentDetail.PANFile && (
              <Stack>
                <p>Choose Pan Card</p>
                <Upload
                  file={PanFile}
                  onDrop={PANhandleDropSingleFile}
                  onDelete={() => setPanFile(null)}
                />{' '}
                {PanFile && (
                  <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                    {successPan == 'upload' ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        onClick={() => panUpload()}
                      >
                        Upload File
                      </LoadingButton>
                    ) : successPan == 'wait' ? (
                      <LoadingButton variant="contained" loading component="span">
                        success
                      </LoadingButton>
                    ) : (
                      <Icon
                        icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                        color="green"
                        fontSize={40}
                        style={{ marginRight: 15 }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            )} */}
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
                                src={AadharFilePanBtnDis ? DocsUpload3 : Docs3}
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
                                        Reset
                                      </Button>
                                      <Image
                                        src={PANCard && PANCard}
                                        style={{
                                          borderRadius: "3px",
                                          border: "1px solid black",
                                          width: 50,
                                          height: 50,
                                        }}
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

            {/* {!agentDetail.Cancelled_Cheque_File && (
              <Stack>
                <p>Choose Your Cancelled Cheque</p>
                <Upload
                  file={chequefile}
                  onDrop={chequehandleDropSingleFile}
                  onDelete={() => setChequefile(null)}
                />{' '}
                {chequefile && (
                  <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                    {successCheque == 'upload' ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        onClick={() => uploadCheque()}
                      >
                        Upload file
                      </LoadingButton>
                    ) : successCheque == 'wait' ? (
                      <LoadingButton variant="contained" loading component="span">
                        success
                      </LoadingButton>
                    ) : (
                      <Icon
                        icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                        color="green"
                        fontSize={40}
                        style={{ marginRight: 15 }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            )} */}

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
                                        Reset
                                      </Button>
                                      <Image
                                        src={CancelledCheque && CancelledCheque}
                                        style={{
                                          borderRadius: "3px",
                                          border: "1px solid black",
                                          width: 50,
                                          height: 50,
                                        }}
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

            {/* {!agentDetail.selfie[0]?.length && (
              <Stack>
                <p>Choose your Selfie</p>
                <Upload
                  file={selfieFile}
                  onDrop={selfiehandleDropSingleFile}
                  onDelete={() => setSelfieFile(null)}
                />{' '}
                {selfieFile && (
                  <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                    {successSelfie == 'upload' ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        onClick={() => selfieUpload()}
                      >
                        Upload file
                      </LoadingButton>
                    ) : successSelfie == 'wait' ? (
                      <LoadingButton variant="contained" loading component="span">
                        success
                      </LoadingButton>
                    ) : (
                      <Icon
                        icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                        color="green"
                        fontSize={40}
                        style={{ marginRight: 15 }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            )} */}
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
                                        Reset
                                      </Button>

                                      <Image
                                        src={SelfieImage && SelfieImage}
                                        style={{
                                          borderRadius: "3px",
                                          border: "1px solid black",
                                          width: 50,
                                          height: 50,
                                        }}
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
            {!user?.shopImage[0]?.length && !user?.shopImage[1]?.length && (
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
                                      Reset
                                    </Button>
                                    <Image
                                      src={ShopImage && ShopImage}
                                      style={{
                                        borderRadius: "3px",
                                        border: "1px solid black",
                                        width: 50,
                                        height: 50,
                                      }}
                                    />
                                    {}
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
            {/* {!agentDetail.shopImage[0]?.length && !agentDetail.shopImage[1]?.length && (
              <Stack>
                <p style={{ marginTop: '20px' }}>Choose Images of Your Shop</p>
                <Upload
                  file={shopfile}
                  onDrop={ShophandleDropSingleFile}
                  onDelete={() => setShopfile(null)}
                />{' '}
                {shopfile && (
                  <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                    {successShop == 'upload' ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        onClick={() => uploadshop()}
                      >
                        Upload file
                      </LoadingButton>
                    ) : successShop == 'wait' ? (
                      <LoadingButton variant="contained" loading component="span">
                        success
                      </LoadingButton>
                    ) : (
                      <Icon
                        icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                        color="green"
                        fontSize={40}
                        style={{ marginRight: 15 }}
                      />
                    )}
                  </Stack>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                  {shoppath.map((item: any, index: any) => {
                    console.log('shop images', item);
                    return (
                      <div
                        key={index}
                        style={{
                          width: '18%',
                          height: '65px',
                          borderRadius: '8px',
                          display: 'flex',
                          marginBottom: '0px',
                          marginRight: '10px',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={item}
                          style={{ borderRadius: '8px', width: '100%', height: '100%' }}
                        />

                        <CloseIcon
                          style={{
                            width: '15px',
                            margin: '3px',
                            position: 'absolute',
                            right: '0',
                            color: '#fff',
                            background: '#212B36',
                            borderRadius: '50%',
                            height: '15px',
                          }}
                          onClick={() =>
                            setShoppath(
                              shoppath.filter((image: any) => {
                                return image !== item;
                              })
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Stack>
            )} */}
          </>
          {/* </Grid> */}
          <Stack my={5}>
            <Button
              variant="contained"
              sx={{ width: "fit-content", margin: "auto" }}
              type="submit"
            >
              Confirm & Continue
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
  );
}

function ConstitutionIdentification() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail, initialize } = useAuthContext();

  //Gst Certificate
  const [gstCertificateFile, setGstCertificateFile] = useState<any>();
  const [successGstCertificate, setSuccessGstCertificate] = useState("upload");
  const [gstCertificatePath, setGstCertificatepath] = useState<any>(
    user?.GSTFile || ""
  );
  const [AadharFlieMSME, setAadharFlieMSME] = useState(false);
  const [AadharFileMSMEBtnDis, setAadharFileMSMEBtnDis] = useState(false);
  const [btnDisabledForGstDocsMSME, setbtnDisabledForGstDocsMSME] =
    useState(true);

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
  const [btnDisabledForGstDocsBusPrf, setbtnDisabledForGstDocsBusPrf] =
    useState(true);

  //Business pan
  const [AadharFlieBrdRes, setAadharFlieBrdRes] = useState(false);
  const [AadharFileBrdResBtnDis, setAadharFileBrdResBtnDis] = useState(false);
  const [businessPanPath, setBusinessPanpath] = useState<any>(
    user?.PANFile_Company || ""
  );

  //Partnership Deed
  const [partnershipDeedFile, setPartnershipDeedFile] = useState<any>();
  const [successPartnershipDeed, setSuccessPartnershipDeed] =
    useState("upload");
  const [partnershipDeedPath, setPartnershipDeedpath] = useState<any>(
    user?.Partnership_deed_File || ""
  );

  //board Resolution BrdRes
  const [boardResolutionFile, setBoardResolutionFile] = useState<any>();
  const [successBoardResolution, setSuccessBoardResolution] =
    useState("upload");
  const [boardResolutionPath, setBoardResolutionpath] = useState<any>(
    user?.Board_Resolution_File || ""
  );

  //Certificate Of Incorporation
  const [COIFile, setCOIFile] = useState<any>();
  const [successCOI, setSuccessCOI] = useState("upload");
  const [COIPath, setCOIpath] = useState<any>(user?.COI_File || "");

  //Memorandum Of Association
  const [MOAFile, setMOAFile] = useState<any>();
  const [successMOA, setSuccessMOA] = useState("upload");
  const [MOAPath, setMOApath] = useState<any>(user?.MOA_File || "");

  //Article Of Association
  const [AOAFile, setAOAFile] = useState<any>();
  const [successAOA, setSuccessAOA] = useState("upload");
  const [AOAPath, setAOApath] = useState<any>(user?.AOA_File || "");

  //Consent Letter
  const [consentLetterFile, setConsentLetterFile] = useState<any>();
  const [successConsentLetter, setSuccessConsentLetter] = useState("upload");
  const [consentLetterPath, setConsentLetterpath] = useState<any>(
    user?.Consent_Letter_File || ""
  );

  //Consent Letter
  const [DPINFile, setDPINFile] = useState<any>();
  const [successDPIN, setSuccessDPIN] = useState("upload");
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

  const gsthandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessGstCertificate("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setGstCertificateFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

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

  const partnershipDeedhandleDropSingleFile = useCallback(
    (acceptedFiles: File[]) => {
      setSuccessPartnershipDeed("upload");
      const docfile = acceptedFiles[0];
      if (docfile) {
        setPartnershipDeedFile(
          Object.assign(docfile, {
            preview: URL.createObjectURL(docfile),
          })
        );
      }
    },
    []
  );

  const boardResolutionhandleDropSingleFile = useCallback(
    (acceptedFiles: File[]) => {
      setSuccessBoardResolution("upload");
      const docfile = acceptedFiles[0];
      if (docfile) {
        setBoardResolutionFile(
          Object.assign(docfile, {
            preview: URL.createObjectURL(docfile),
          })
        );
      }
    },
    []
  );

  const COIhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessCOI("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setCOIFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const MOAhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessMOA("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setMOAFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const AOAhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessAOA("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setAOAFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  const consentLetterhandleDropSingleFile = useCallback(
    (acceptedFiles: File[]) => {
      setSuccessConsentLetter("upload");
      const docfile = acceptedFiles[0];
      if (docfile) {
        setConsentLetterFile(
          Object.assign(docfile, {
            preview: URL.createObjectURL(docfile),
          })
        );
      }
    },
    []
  );

  const DPINhandleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    setSuccessDPIN("upload");
    const docfile = acceptedFiles[0];
    if (docfile) {
      setDPINFile(
        Object.assign(docfile, {
          preview: URL.createObjectURL(docfile),
        })
      );
    }
  }, []);

  //Upload DOCS

  const gstCertificateUpload = (e: any) => {
    setAadharFlieMSME(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("directoryName", "gstCertificate");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=gstCertificate====", Response.data.filePath);
            setGstCertificatepath(Response.data.filePath);
            setAadharFileMSMEBtnDis(true);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
          setAadharFlieMSME(false);
        } else {
          setAadharFlieMSME(false);
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  //Upload DOCS
  const otherCertificateUpload = () => {
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
            setSuccessOtherCertificate("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessGstCertificate("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessOtherCertificate("upload");
        }
      }
    );
  };

  const businessProofUpload = (e: any) => {
    setAadharFlieBusPrf(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("directoryName", "businessProof");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=businessProof====", Response.data.filePath);
            setBusinessProofpath(Response.data.filePath);
            setAadharFileBusPrfBtnDis(true);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
          setAadharFlieBusPrf(false);
        } else {
          setAadharFlieBusPrf(false);
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const businessPanUpload = (e: any) => {
    // BrdRes
    setAadharFlieBrdRes(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("directoryName", "businessPan");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=businessPan====", Response.data.filePath);
            setBusinessPanpath(Response.data.filePath);
            setAadharFileBrdResBtnDis(true);
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
          }
          setAadharFlieBrdRes(false);
        } else {
          setAadharFlieBrdRes(false);
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  const partnershipDeedUpload = () => {
    setSuccessPartnershipDeed("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", partnershipDeedFile);
    formData.append("directoryName", "partnershipDeed");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=partnershipDeed====", Response.data.filePath);
            setPartnershipDeedpath(Response.data.filePath);
            setSuccessPartnershipDeed("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessPartnershipDeed("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessPartnershipDeed("upload");
        }
      }
    );
  };

  const boardResolutionUpload = () => {
    setSuccessBoardResolution("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", boardResolutionFile);
    formData.append("directoryName", "boardResolution");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=boardResolution====", Response.data.filePath);
            setBoardResolutionpath(Response.data.filePath);
            setSuccessBoardResolution("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessBoardResolution("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessBoardResolution("upload");
        }
      }
    );
  };

  const COIUpload = () => {
    setSuccessCOI("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", COIFile);
    formData.append("directoryName", "COI");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=COI====", Response.data.filePath);
            setCOIpath(Response.data.filePath);
            setSuccessCOI("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessCOI("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessCOI("upload");
        }
      }
    );
  };

  const MOAUpload = () => {
    setSuccessMOA("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", MOAFile);
    formData.append("directoryName", "COI");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=MOAFile====", Response.data.filePath);
            setMOApath(Response.data.filePath);
            setSuccessMOA("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessMOA("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessMOA("upload");
        }
      }
    );
  };

  const AOAUpload = () => {
    setSuccessAOA("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", AOAFile);
    formData.append("directoryName", "AOA");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=AOA====", Response.data.filePath);
            setAOApath(Response.data.filePath);
            setSuccessAOA("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessAOA("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessAOA("upload");
        }
      }
    );
  };

  const consentLetterUpload = () => {
    setSuccessConsentLetter("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", consentLetterFile);
    formData.append("directoryName", "COI");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=consentLetterFile====", Response.data.filePath);
            setConsentLetterpath(Response.data.filePath);
            setSuccessConsentLetter("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessConsentLetter("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessConsentLetter("upload");
        }
      }
    );
  };

  const DPINUpload = () => {
    setSuccessDPIN("wait");
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", DPINFile);
    formData.append("directoryName", "COI");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            console.log("===200=DPINFile====", Response.data.filePath);
            setDPINpath(Response.data.filePath);
            setSuccessDPIN("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            setSuccessDPIN("upload");
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
          setSuccessDPIN("upload");
        }
      }
    );
  };

  const constitutionDocs = Yup.object().shape({});

  const defaultValues = {};

  const handlePIDDocuments = (docVal: any) => {
    if (docVal == "MSME") {
      setAadharFileMSMEBtnDis(false);
    } else if (docVal == "BusPrf") {
      setAadharFileBusPrfBtnDis(false);
    } else if (docVal == "Boardresolution") {
      setAadharFileBrdResBtnDis(false);
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
            <Grid
            // display={'grid'}
            // gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            // gap={3}
            >
              {/* gst certificate */}
              {!user?.isGST &&
              (user?.constitutionType.toLowerCase() ==
                "private limited company" ||
                user?.constitutionType.toLowerCase() == "one person company" ||
                user?.constitutionType == "Partnership" ||
                user?.constitutionType == "Limited Liability Partnership" ||
                user?.constitutionType.toLowerCase() == "proprietorship") ? (
                // <Stack>
                //   <Typography>
                //     Shops and Establishment Reg. Certificate/Udyog Aadhaar Registration certificate
                //     for MSME
                //   </Typography>
                //   <Upload
                //     file={gstCertificateFile || agentDetail.GSTFile}
                //     onDrop={gsthandleDropSingleFile}
                //     onDelete={() => setGstCertificateFile(null)}
                //     disabled={agentDetail.GSTFile}
                //   />
                //   {gstCertificateFile && (
                //     <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                //       {successGstCertificate == 'upload' ? (
                //         <LoadingButton
                //           variant="contained"
                //           component="span"
                //           onClick={() => gstCertificateUpload()}
                //         >
                //           Upload file
                //         </LoadingButton>
                //       ) : successGstCertificate == 'wait' ? (
                //         <LoadingButton variant="contained" loading component="span">
                //           success
                //         </LoadingButton>
                //       ) : (
                //         <Icon
                //           icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                //           color="green"
                //           fontSize={40}
                //           style={{ marginRight: 15 }}
                //         />
                //       )}
                //     </Stack>
                //   )}
                // </Stack>

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
                                      />
                                    </Button>
                                  ) : (
                                    <>
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
                                        Reset
                                      </Button>
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
                <Stack>
                  <Typography>GST certificate</Typography>
                  <Upload
                    file={gstCertificateFile || user?.GSTFile}
                    onDrop={gsthandleDropSingleFile}
                    onDelete={() => setGstCertificateFile(null)}
                    disabled={user?.GSTFile}
                  />
                  {gstCertificateFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successGstCertificate == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => gstCertificateUpload}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successGstCertificate == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}

              {user?.constitutionType.toLowerCase() ==
                "private limited company" ||
              user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType == "Limited Liability Partnership" ||
              user?.constitutionType == "Partnership" ? (
                <>
                  {/* <Stack>
                    <p>Choose Business pan</p>
                    <Upload
                      file={businessPanFile || agentDetail.PANFile_Company}
                      onDrop={PanhandleDropSingleFile}
                      onDelete={() => setBusinessPanFile(null)}
                      disabled={agentDetail.PANFile_Company}
                    />
                    {businessPanFile && (
                      <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                        {successBusinessPan == 'upload' ? (
                          <LoadingButton
                            variant="contained"
                            component="span"
                            onClick={() => businessPanUpload()}
                          >
                            Upload file
                          </LoadingButton>
                        ) : successBusinessPan == 'wait' ? (
                          <LoadingButton variant="contained" loading component="span">
                            success
                          </LoadingButton>
                        ) : (
                          <Icon
                            icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                            color="green"
                            fontSize={40}
                            style={{ marginRight: 15 }}
                          />
                        )}
                      </Stack>
                    )}
                  </Stack> */}

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
                                    Choose Business pan
                                  </Typography>
                                </Stack>{" "}
                              </Item>
                            </Grid>
                            <Grid xs>
                              <Item>
                                {AadharFlieBusPrf ? (
                                  <LinearProgress />
                                ) : (
                                  <>
                                    {!AadharFileBusPrfBtnDis ? (
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
                                          onChange={businessProofUpload}
                                          type="file"
                                        />
                                      </Button>
                                    ) : (
                                      <>
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
                                          Reset
                                        </Button>
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
                <Stack>
                  <p>Choose Partnership Deed / Agreement</p>
                  <Upload
                    file={partnershipDeedFile || user?.Partnership_deed_File}
                    onDrop={partnershipDeedhandleDropSingleFile}
                    onDelete={() => setPartnershipDeedFile(null)}
                    disabled={user?.Partnership_deed_File}
                  />
                  {partnershipDeedFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successPartnershipDeed == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => partnershipDeedUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successPartnershipDeed == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {/* Copy of Board Resolution */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                // <Stack>
                //   <p>Choose Copy of Board resolution</p>
                //   <Upload
                //     file={boardResolutionFile || agentDetail.Board_Resolution_File}
                //     onDrop={boardResolutionhandleDropSingleFile}
                //     onDelete={() => setBoardResolutionFile(null)}
                //     disabled={agentDetail.Board_Resolution_File}
                //   />
                //   {boardResolutionFile && (
                //     <Stack flexDirection={'row'} justifyContent={'end'} mt={1}>
                //       {successBoardResolution == 'upload' ? (
                //         <LoadingButton
                //           variant="contained"
                //           component="span"
                //           onClick={() => boardResolutionUpload()}
                //         >
                //           Upload file
                //         </LoadingButton>
                //       ) : successBoardResolution == 'wait' ? (
                //         <LoadingButton variant="contained" loading component="span">
                //           success
                //         </LoadingButton>
                //       ) : (
                //         <Icon
                //           icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                //           color="green"
                //           fontSize={40}
                //           style={{ marginRight: 15 }}
                //         />
                //       )}
                //     </Stack>
                //   )}
                // </Stack>

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
                                        onChange={businessPanUpload}
                                        type="file"
                                      />
                                    </Button>
                                  ) : (
                                    <>
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
                                          handlePIDDocuments("Boardresolution")
                                        }
                                      >
                                        Reset
                                      </Button>
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
                <Stack>
                  <p>Choose Certificate Of Incorporation</p>
                  <Upload
                    file={COIFile || user?.COI_File}
                    onDrop={COIhandleDropSingleFile}
                    onDelete={() => setCOIFile(null)}
                    disabled={user?.COI_File}
                  />
                  {COIFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successCOI == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => COIUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successCOI == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {/* Memorandum Of Association */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                <Stack>
                  <p>Choose Memorandum Of Association</p>
                  <Upload
                    file={MOAFile || user?.MOA_File}
                    onDrop={MOAhandleDropSingleFile}
                    onDelete={() => setMOAFile(null)}
                    disabled={user?.MOA_File}
                  />
                  {MOAFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successMOA == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => MOAUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successMOA == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {/* Article Of Association */}
              {user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "private limited company" ? (
                <Stack>
                  <p>Choose Article Of Association</p>
                  <Upload
                    file={AOAFile || user?.AOA_File}
                    onDrop={AOAhandleDropSingleFile}
                    onDelete={() => setAOAFile(null)}
                    disabled={user?.AOA_File}
                  />
                  {AOAFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successAOA == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => AOAUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successAOA == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {/* Consent Letter */}
              {user?.constitutionType.toLowerCase() ==
                "limited liability partnership" ||
              user?.constitutionType == "Partnership" ? (
                <Stack>
                  <p>
                    Authority letter authorizing Desiginated Partner / Nominated
                    Partner to sign Agtreement and Other Documents.
                  </p>
                  <Upload
                    file={consentLetterFile || user?.Consent_Letter_File}
                    onDrop={consentLetterhandleDropSingleFile}
                    onDelete={() => setConsentLetterFile(null)}
                    disabled={user?.Consent_Letter_File}
                  />
                  {consentLetterFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successConsentLetter == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => consentLetterUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successConsentLetter == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {/* DPIN Designated Partner Identity Number */}
              {user?.constitutionType == "Limited Liability Partnership" ? (
                <Stack>
                  <p>Choose Designated Partner Identity Number</p>
                  <Upload
                    file={DPINFile || user?.DPIN_File}
                    onDrop={DPINhandleDropSingleFile}
                    onDelete={() => setDPINFile(null)}
                    disabled={user?.DPIN_File}
                  />
                  {DPINFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successDPIN == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => DPINUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successDPIN == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
              {(user?.constitutionType.toLowerCase() == "proprietorship" &&
                user?.isGST) ||
              user?.constitutionType.toLowerCase() == "one person company" ||
              user?.constitutionType.toLowerCase() ==
                "limited liability partnership " ||
              user?.constitutionType.toLowerCase() == "partnership" ||
              user?.isGST ? (
                <Stack>
                  <p>Other Doc. </p>
                  <p>
                    {" "}
                    <RHFTextField
                      name="docType"
                      label="Doc Type"
                      size="small"
                      disabled={user?.otherDocs[0]?.docType}
                      value={docType}
                      onChange={DocTypeHandle}
                    />
                  </p>
                  <p>
                    {" "}
                    <RHFTextField
                      name="docIdNum"
                      label="Doc ID Number"
                      size="small"
                      disabled={user?.otherDocs[0]?.docIdNumber}
                      value={docIdNum}
                      onChange={DocIdNumHandle}
                    />
                  </p>
                  <p>
                    <RHFTextField
                      name="docIssuedBy"
                      label="Issued By"
                      size="small"
                      disabled={user?.otherDocs[0]?.issuedBy}
                      value={docIssuedBy}
                      onChange={DocIssuedByHandle}
                    />
                  </p>

                  <Upload
                    file={otherCertificateFile || user?.otherDocs[0]?.docURL}
                    onDrop={otherhandleDropSingleFile}
                    onDelete={() => setOtherCertificateFile(null)}
                    disabled={user?.otherDocs[0]?.docURL}
                  />
                  {otherCertificateFile && (
                    <Stack flexDirection={"row"} justifyContent={"end"} mt={1}>
                      {successOtherCertificate == "upload" ? (
                        <LoadingButton
                          variant="contained"
                          component="span"
                          onClick={() => otherCertificateUpload()}
                        >
                          Upload file
                        </LoadingButton>
                      ) : successOtherCertificate == "wait" ? (
                        <LoadingButton
                          variant="contained"
                          loading
                          component="span"
                        >
                          success
                        </LoadingButton>
                      ) : (
                        <Icon
                          icon="streamline:interface-validation-check-check-form-validation-checkmark-success-add-addition"
                          color="green"
                          fontSize={40}
                          style={{ marginRight: 15 }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              ) : null}
            </Grid>
          ) : (
            <Typography variant="h4" sx={{ color: "#707070" }}>
              No Need of any Business Documents
            </Typography>
          )}
          <Stack mt={10}>
            {user?.isAadhaarVerified &&
            user?.isGSTVerified &&
            user?.isPANVerified &&
            user?.is_PID_Docs ? (
              <Button variant="contained" onClick={submitDocs}>
                Final Submit
              </Button>
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
            {user?.constitutionType.toLowerCase() == "individual" ? (
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
              onClick={() => {
                navigate("/login");
                localStorage.clear();
              }}
            >
              Logout
            </Button>
          </Stack>
        </>
      )}
    </>
  );
}
