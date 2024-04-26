import { Helmet } from "react-helmet-async";

import React, { useReducer, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";

// @mui
import {
  Grid,
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  MenuItem,
  FormHelperText,
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
import { LoadingButton } from "@mui/lab";
import DMTRemitterDetail from "./DMTRemitterDetail";
import DMTbeneficiary from "./DMTbeneficiary";
import RHFMobileNumber from "src/components/hook-form/RHFMobileNumber";

// ----------------------------------------------------------------------

type FormValuesProps = {
  mobileNumber: string;
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

export const RemitterContext = React.createContext({});

const initialRemitter = {
  isLoading: false,
  data: {},
  remitterfetch: false,
};

const Reducer = (state: any, action: any) => {
  switch (action.type) {
    case "REMITTER_FETCH_REQUEST":
      return { ...state, isLoading: true, data: {}, remitterfetch: false };
    case "REMITTER_FETCH_SUCCESS":
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        remitterfetch: true,
      };
    case "REMITTER_NOT_FOUND":
      return { ...state, isLoading: false, data: {} };
    default:
      return state;
  }
};

export default function DMT() {
  const { enqueueSnackbar } = useSnackbar();
  const [remitter, remitterDispatch] = useReducer(Reducer, initialRemitter);

  //modal 1
  const [open1, setModalEdit1] = React.useState(false);
  const openEditModal1 = () => setModalEdit1(true);
  const handleClose1 = () => setModalEdit1(false);

  //modal 2
  const [open2, setModalEdit2] = React.useState(false);
  const openEditModal2 = () => setModalEdit2(true);
  const handleClose2 = () => setModalEdit2(false);

  const DMTSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .matches(
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
        "Phone number is not valid"
      )
      .typeError("That doesn't look like a phone number")
      .min(10, "Please enter 10 digit mobile number")
      .max(10, "Please enter 10 digit mobile number")
      .required("A phone number is required"),
  });

  const defaultValues = {
    mobileNumber: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    reset,
    getValues,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    borderRadius: 2,
    width: { xs: "95%", md: 500 },
    p: 4,
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      remitterDispatch({ type: "REMITTER_FETCH_REQUEST" });
      await Api(
        "moneyTransfer/remitter/" + data.mobileNumber,
        "GET",
        "",
        token
      ).then((Response: any) => {
        console.log("dmt response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            remitterDispatch({
              type: "REMITTER_FETCH_SUCCESS",
              payload: Response.data.data,
            });
            reset(defaultValues);
          } else if (Response.data.code == 400) {
            remitterDispatch({ type: "REMITTER_NOT_FOUND" });
            if (Response.data.data == null) {
              openEditModal1();
            } else {
              SendOTP(data.mobileNumber);
              openEditModal2();
            }
          }
        } else {
          remitterDispatch({ type: "REMITTER_NOT_FOUND" });
          enqueueSnackbar("Internal Server Error");
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const SendOTP = (val: any) => {
    let token = localStorage.getItem("token");
    Api("moneyTransfer/remitter/sendOtp/" + val, "GET", "", token).then(
      (Response: any) => {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          console.log("==============>>> sendOtp data 200", Response.data.data);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          console.log(
            "==============>>> sendOtp message",
            Response.data.message
          );
        }
      }
    );
  };

  const childFunc = (val: string) => {
    handleClose2();
    remitterDispatch({ type: "REMITTER_FETCH_REQUEST" });
    let token = localStorage.getItem("token");
    Api("moneyTransfer/remitter/" + val, "GET", "", token).then(
      (Response: any) => {
        console.log("dmt response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            remitterDispatch({
              type: "REMITTER_FETCH_SUCCESS",
              payload: Response.data.data,
            });
          } else if (Response.data.code == 400) {
            remitterDispatch({ type: "REMITTER_NOT_FOUND" });
            if (Response.data.data == null) {
              openEditModal1();
            } else {
              SendOTP(val);
              openEditModal2();
            }
            enqueueSnackbar(Response.data.message, { variant: "warning" });
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else {
          remitterDispatch({ type: "SERVER_ERROR" });
        }
      }
    );
  };

  const handleNewRegistaion = (val: string) => {
    if (val === "SUCCESS") {
      SendOTP(getValues("mobileNumber"));
      handleClose1();
      openEditModal2();
    } else {
      handleClose1();
    }
  };

  return (
    <RemitterContext.Provider value={remitter.data}>
      <Helmet>
        <title>Money Transfer |{process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <Grid container spacing={2}>
        <Grid item sm={3}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              sx={{ position: "relative" }}
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
              }}
            >
              <RHFTextField
                name="mobileNumber"
                type="number"
                label="Sender Mobile Number"
                placeholder="Sender Mobile Number"
                aria-autocomplete="none"
                InputProps={{
                  endAdornment: isValid && (
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                      sx={{ right: "-10px" }}
                    >
                      Search
                    </LoadingButton>
                  ),
                }}
              />
            </Box>
            <Typography variant="caption">
              To comply with RBI guidelines, a valid sender mobile number is
              mandatory for money transfers. Please ensure you provide a valid
              sender mobile number to proceed with the transaction. to know more{" "}
              <a
                href="https://tramo.in/domestic-money-transfer-guidelines/"
                target="_tramo"
              >
                click here
              </a>
            </Typography>
          </FormProvider>
          {remitter.remitterfetch && <DMTRemitterDetail />}
        </Grid>
        <Grid item xs={12} sm={9}>
          {remitter.remitterfetch && <DMTbeneficiary />}
        </Grid>
      </Grid>
      <Modal
        open={open1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <NewRegistration
            mobilenumber={getValues("mobileNumber")}
            handleNewRegistaion={handleNewRegistaion}
          />
        </Box>
      </Modal>
      <Modal
        open={open2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <OtpSubmissionForRegistrantion
            callback={childFunc}
            mobilenumber={getValues("mobileNumber")}
            handleClose2={handleClose2}
          />
        </Box>
      </Modal>
    </RemitterContext.Provider>
  );
}

const OtpSubmissionForRegistrantion = ({
  mobilenumber,
  callback,
  handleClose2,
}: any) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const DMTSchema = Yup.object().shape({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
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
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      remitterMobile: mobilenumber,
      otp:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    Api("moneyTransfer/remitter/verifyOTP", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>> register remmiter Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            reset(defaultValues);
            callback(mobilenumber);
            setIsLoading(false);
            console.log(
              "==============>>> register remmiter data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
            setIsLoading(false);
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
        <Typography variant="h4">Please verify OTP</Typography>
        <Stack>
          <RHFCodes
            keyName="otp"
            inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
          />
        </Stack>

        {(!!errors.otp1 ||
          !!errors.otp2 ||
          !!errors.otp3 ||
          !!errors.otp4 ||
          !!errors.otp5 ||
          !!errors.otp6) && (
          <FormHelperText error sx={{ px: 2 }}>
            Code is required
          </FormHelperText>
        )}
        <Stack flexDirection={"row"} gap={1} mt={2}>
          <LoadingButton variant="contained" type="submit" loading={isLoading}>
            Confirm
          </LoadingButton>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              handleClose2();
              reset(defaultValues);
            }}
          >
            Close
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const NewRegistration = ({ mobilenumber, handleNewRegistaion }: any) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const DMTSchema = Yup.object().shape({
    remitterFirstName: Yup.string()
      .required("First Name is required")
      .matches(
        /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
        "Name can only contain Alpha characters."
      ),
    remitterLastName: Yup.string().matches(
      /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
      "Name can only contain Alpha characters."
    ),
    remitterOccupation: Yup.string().required("Occupation is required"),
    remitterEmail: Yup.string().email("Invalid email address"),
  });
  const defaultValues = {
    remitterFirstName: "",
    remitterLastName: "",
    remitterOccupation: "",
    remitterEmail: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
    mode: "onBlur",
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const addRemmiter = (data: FormValuesProps) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      remitterMobile: mobilenumber,
      firstName: data.remitterFirstName,
      lastName: data.remitterLastName,
      occupation: data.remitterOccupation,
      email: data.remitterEmail || "",
    };
    Api("moneyTransfer/remitter", "POST", body, token).then((Response: any) => {
      console.log("==============>>> register remmiter Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setIsLoading(false);
          handleNewRegistaion("SUCCESS");
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          setIsLoading(false);
          handleNewRegistaion("FAIL");
        }
      }
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(addRemmiter)}>
      <Box
        rowGap={2}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
        }}
      >
        <RHFTextField name="remitterFirstName" label="First Name*" />
        <RHFTextField name="remitterLastName" label="Last Name" />
        <RHFTextField
          name="remitterMobileNumber"
          label="Mobile Number*"
          type="number"
          variant="filled"
          value={mobilenumber}
          InputLabelProps={{ shrink: true }}
          disabled
        />

        <RHFSelect
          name="remitterOccupation"
          label="Occupation"
          placeholder="Occupation"
          SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
        >
          <MenuItem value="General Worker">General Worker</MenuItem>
          <MenuItem value="Machine Operator">Machine Operator</MenuItem>
          <MenuItem value="Packaging Assistant">Packaging Assistant</MenuItem>
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
      <Stack flexDirection={"row"} gap={1} mt={2}>
        <LoadingButton
          size="medium"
          type="submit"
          variant="contained"
          loading={isLoading}
        >
          Add Remitter
        </LoadingButton>
        <LoadingButton
          variant="contained"
          onClick={() => handleNewRegistaion("FAIL")}
        >
          Cancel
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
};

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
