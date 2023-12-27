import { Helmet } from "react-helmet-async";

import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

// @mui
import {
  Grid,
  TextField,
  Modal,
  Card,
  Box,
  Divider,
  Container,
  CircularProgress,
  Typography,
  Button,
  Stack,
  MenuItem,
  FormHelperText,
  useTheme,
} from "@mui/material";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFCodes,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import _ from "lodash";
import DMT1RemitterDetail from "./DMT1RemitterDetail";
import DMT1BeneTable from "./DMT1BeneTable";
import ApiDataLoading from "../../../components/customFunctions/ApiDataLoading";

// ----------------------------------------------------------------------

type FormValuesProps = {
  remitterFirstName: string;
  remitterLastName: string;
  remitterMobileNumber: string;
  remitterEmail: string;
  remitterOccupation: string;
  remitterOTP: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

//--------------------------------------------------------------------

export default function DMT1() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [mobileNumber, setMobileNumber] = useState("");
  const [tableShow, setTableShow] = useState(false);
  const [progress, setprogress] = useState(true);
  const [remitterProgress, setRemitterProgress] = useState(false);

  //modal 1
  const [open1, setModalEdit1] = React.useState(false);
  const openEditModal1 = () => setModalEdit1(true);
  const handleClose1 = () => setModalEdit1(false);

  //modal 2
  const [open2, setModalEdit2] = React.useState(false);
  const openEditModal2 = () => setModalEdit2(true);
  const handleClose2 = () => {
    setModalEdit2(false);
  };
  const [tableData, setTableData] = useState([]);
  const [remitterData, setRemitterData] = useState<any>({
    remitterMobile: "",
    isMobileVerifiedWithEko: true,
    remitterFN: "",
    remitterLN: "",
    remitterEmail: "",
    airtelRemitterConsumedLimit: 0,
    airtelRemitterAvailableLimit: 0,
  });
  const [remitter, setRemitter] = useState(false);
  const [count, setCount] = useState(0);

  const DMTSchema = Yup.object().shape({
    remitterFirstName: Yup.string()
      .required("First Name is required")
      .test(
        "len",
        "Name must be between 3 to 10 Character",
        (val: any) => val.toString().length >= 3 && val.toString().length <= 10
      )
      .matches(
        /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
        "Name can only contain Alpha characters."
      ),
    remitterLastName: Yup.string()
      .test(
        "len",
        "Name must be maximum 10 Character",
        (val: any) => val.toString().length <= 20
      )
      .matches(
        /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
        "Name can only contain Alpha characters."
      ),
    remitterOccupation: Yup.string().required("Occupation is required"),
    remitterEmail: Yup.string(),
  });

  const defaultValues = {
    remitterFirstName: "",
    remitterLastName: "",
    remitterMobileNumber: "",
    remitterOTP: "",
    remitterEmail: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const hanldeKeyPress = (event: any) => {
    if (event.key.toLowerCase() == "enter" && mobileNumber.length == 10) {
      fatchRemmiter();
    }
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    borderRadius: 2,
    p: 4,
  };

  const fatchRemmiter = () => {
    setprogress(false);
    let token = localStorage.getItem("token");
    Api("dmt1/remitter/" + mobileNumber, "GET", "", token).then(
      (Response: any) => {
        if (Response.data.code == 200) {
          setRemitter(true);
          enqueueSnackbar(Response.data.message);
          setRemitterData(Response.data.data);
          setprogress(true);
          setTableShow(true);
          setMobileNumber("");
        } else if (Response.data.error.code == 400) {
          setRemitter(false);
          setTableShow(false);
          if (Response.data.error.data == null) {
            enqueueSnackbar(Response.data.error.message);
            openEditModal1();
            setprogress(true);
          } else if (!Response.data.error.data.isMobileVerifiedWithEko) {
            setRemitterData({
              ...Response.data.error.data,
              errorMsg: Response.data.message,
            });
            enqueueSnackbar(Response.data.error.message);
            reSendOTP(Response.data.error.data.remitterMobile);
          } else {
          }
        } else {
          enqueueSnackbar(Response.data.error.message);
          setprogress(true);
        }
      }
    );
  };

  const reSendOTP = (val: any) => {
    let token = localStorage.getItem("token");
    Api("dmt1/remitter/resendOtp/" + val, "GET", "", token).then(
      (Response: any) => {
        if (Response.data.code == 200) {
          openEditModal2();
          handleClose1();
          setCount(30);
          enqueueSnackbar(Response.data.message);
          setprogress(true);
          console.log("==============>>> sendOtp data 200", Response.data.data);
        } else {
          enqueueSnackbar(Response.data.message);
          console.log(
            "==============>>> sendOtp message",
            Response.data.message
          );
        }
      }
    );
  };

  const addRemmiter = (data: FormValuesProps) => {
    setRemitterProgress(true);
    let token = localStorage.getItem("token");
    let body = {
      remitterMobile: mobileNumber,
      firstName: data.remitterFirstName,
      lastName: data.remitterLastName,
      occupation: data.remitterOccupation,
      email: data.remitterEmail || "",
    };
    Api("dmt1/remitter", "POST", body, token).then((Response: any) => {
      console.log("==============>>> register remmiter Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setRemitterProgress(false);
          openEditModal2();
          handleClose1();
          enqueueSnackbar(Response.data.message);
          console.log(
            "==============>>> register remmiter data 200",
            Response.data.data.message
          );
        } else {
          setRemitterProgress(false);
          enqueueSnackbar(Response.data.error.message);
          console.log(
            "==============>>> register remmiter message",
            Response.data.message
          );
        }
      }
    });
  };

  useEffect(() => {
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [count]);

  const childFunc = () => {
    handleClose2();
    fatchRemmiter();
  };

  return (
    <>
      <Helmet>
        <title>DMT1 | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <Grid container spacing={2} sx={{ marginTop: "-28px" }}>
        <Grid item sm={4}>
          <Box
            rowGap={2}
            columnGap={2}
            display="grid"
            sx={{ position: "relative" }}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)',
            }}
          >
            <TextField
              error={mobileNumber.length > 10}
              label="Sender Mobile Number"
              value={mobileNumber}
              type="number"
              onChange={(e) =>
                setMobileNumber(e.target.value.replace(/\D/g, ""))
              }
              helperText={
                mobileNumber.length > 10 &&
                "Please enter valid 10 digit mobile number"
              }
              onKeyPress={hanldeKeyPress}
              size="small"
            />
            {mobileNumber.length == 10 &&
              (progress ? (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: -37,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={fatchRemmiter}
                >
                  Search
                </Button>
              ) : (
                <Box>
                  <CircularProgress
                    color="success"
                    style={{
                      right: "30px",
                      top: "5px",
                      position: "absolute",
                      width: "30px",
                      height: "30px",
                      color: theme.palette.primary.main,
                      cursor: "pointer",
                    }}
                  />
                </Box>
              ))}
          </Box>
          <Typography variant="caption">
            To comply with RBI guidelines, a valid sender mobile number is
            mandatory for DMT1. Please ensure you provide a valid sender mobile
            number to proceed with the transaction. to know more{" "}
            <a
              href="https://tramo.in/domestic-money-transfer-guidelines/"
              target="_tramo"
            >
              click here
            </a>
          </Typography>

          <Stack mt={5}>
            {remitter && (
              <DMT1RemitterDetail
                remitterData={remitterData}
                mobileNumber={mobileNumber}
              />
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={8}>
          {tableShow && (
            <DMT1BeneTable remitter={remitterData} table={tableData} />
          )}
        </Grid>
      </Grid>
      <Modal
        open={open1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(addRemmiter)}>
          <Grid
            item
            xs={12}
            md={8}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Card sx={{ p: 3 }}>
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
                  aria-autocomplete="none"
                  name="remitterFirstName"
                  label="First Name*"
                />
                <RHFTextField
                  aria-autocomplete="none"
                  name="remitterLastName"
                  label="Last Name"
                />
                <RHFTextField
                  name="remitterMobileNumber"
                  label="Mobile Number*"
                  type="number"
                  value={mobileNumber}
                  variant="filled"
                  disabled
                />

                <RHFSelect
                  name="remitterOccupation"
                  label="Occupation"
                  placeholder="Occupation"
                  // InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="General Worker">General Worker</MenuItem>
                  <MenuItem value="Machine Operator">Machine Operator</MenuItem>
                  <MenuItem value="Packaging Assistant">
                    Packaging Assistant
                  </MenuItem>
                  <MenuItem value="Warehouse Helper">Warehouse Helper</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </RHFSelect>
                <RHFTextField
                  aria-autocomplete="none"
                  name="remitterEmail"
                  label="Sender Email (Optional)"
                />
              </Box>
              <Stack flexDirection={"row"} mt={2}>
                {remitterProgress ? (
                  <ApiDataLoading />
                ) : (
                  <Stack flexDirection={"row"} gap={1}>
                    <Button type="submit" variant="contained">
                      Add Remitter
                    </Button>
                    <Button variant="contained" onClick={handleClose1}>
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid>
        </FormProvider>
      </Modal>
      <Modal
        open={open2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <OtpSubmissionForRegistrantion
            handleClose2={handleClose2}
            mobilenumber={mobileNumber}
            callback={childFunc}
          />
        </Box>
      </Modal>
    </>
  );
}

const OtpSubmissionForRegistrantion = ({
  mobilenumber,
  handleClose2,
  callback,
}: any) => {
  const { enqueueSnackbar } = useSnackbar();

  const DMTSchema = Yup.object().shape({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const verifyOtp = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      remitterMobile: mobilenumber,
      otp: data.otp1 + data.otp2 + data.otp3,
    };
    Api("dmt1/remitter/verifyOTP", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>> register remmiter Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            reset(defaultValues);
            callback();
            console.log(
              "==============>>> register remmiter data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.message);
            console.log(
              "==============>>> register remmiter message",
              Response.data.message
            );
          }
        }
      }
    );
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(verifyOtp)}>
      <Stack
        alignItems={"center"}
        justifyContent={"space-between"}
        mt={2}
        gap={2}
      >
        <Typography variant="h4">OTP</Typography>
        <RHFCodes keyName="otp" inputs={["otp1", "otp2", "otp3"]} />

        {(!!errors.otp1 || !!errors.otp2 || !!errors.otp3) && (
          <FormHelperText error sx={{ px: 2 }}>
            Code is required
          </FormHelperText>
        )}
        <Stack flexDirection={"row"} gap={1} mt={2}>
          <Button variant="contained" type="submit">
            Confirm
          </Button>
          <Button variant="contained" color="warning" onClick={handleClose2}>
            Close
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

// ----------------------------------------------------------------------
