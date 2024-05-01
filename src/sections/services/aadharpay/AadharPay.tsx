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
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Api } from "src/webservices";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFAutocomplete,
  RHFSecureCodes,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { StyledSection } from "src/layouts/login/styles";
import Image from "src/components/image/Image";
import { Icon } from "@iconify/react";
import aadharPayImg from "../../../assets/images/aadharpay.png";
import RegistrationAeps from "../AEPS/RegistrationAeps";
import AttendenceAeps from "../AEPS/AttendenceAeps";
import { useAuthContext } from "src/auth/useAuthContext";
import MotionModal from "src/components/animate/MotionModal";
import { fIndianCurrency } from "src/utils/formatNumber";
import { CaptureDevice } from "src/utils/CaptureDevice";
import { fetchLocation } from "src/utils/fetchLocation";
import { LoadingButton } from "@mui/lab";

import Lottie from "lottie-react";
import fingerScan from "../../../components/JsonAnimations/fingerprint-scan.json";
import TransactionModal from "src/components/customFunctions/TrasactionModal";

// ----------------------------------------------------------------------

type FormValuesProps = {
  device: string;
  bankDetail: {
    AEPSFingPayStatus: string;
    AadhaarPayFingpayStatus: string;
    FingpayAEPSIIN: string;
    FingpayAPIIN: string;
    bankName: string | null;
    ekoBankId: string;
    impsStatus: string;
    isVerificationAvailable: string;
    masterIFSC: string;
    name: string;
    neftStatus: string;
    shortCode: string;
    status: string;
    tramoShortCode: string;
  };
  aadharnumber: Number | string | null;
  mobilenumber: Number | string | null;
  amount: Number | string | null;
  categoryId: string;
};

var localTime: any;

export default function AadharPay() {
  const { user } = useAuthContext();
  const [attendanceTimeout, setAttendanceTimeout] = useState(0);

  const [postData, setPostData] = useState<any>({
    device: "",
    bankDetail: {
      AEPSFingPayStatus: "",
      AadhaarPayFingpayStatus: "",
      FingpayAEPSIIN: "",
      FingpayAPIIN: "",
      bankName: "",
      ekoBankId: "",
      impsStatus: "",
      isVerificationAvailable: "",
      masterIFSC: "",
      name: "",
      neftStatus: "",
      shortCode: "",
      status: "",
      tramoShortCode: "",
    },
    aadharnumber: "",
    mobilenumber: "",
    amount: "",
  });

  const [bankList, setBankList] = useState([]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const DMTSchema = Yup.object().shape({
    device: Yup.string().required("Device is a required field"),
    bankDetail: Yup.object().shape({
      bankName: Yup.string().nullable().required("Bank Name required field"),
    }),
    mobilenumber: Yup.number()
      .typeError("please enter valid Mobile Number")
      .nullable()
      .required("Mobile number is a required field"),
    aadharnumber: Yup.number()
      .typeError("please enter valid Aadhaar Number")
      .nullable()
      .required("Aadhar Number required field")
      .test(
        "len",
        "Enter valid 12-digit aadhar number",
        (val: any) => val.toString().length == 12
      ),
    amount: Yup.number()
      .typeError("please enter valid Amount")
      .nullable()
      .required(),
  });

  const defaultValues = {
    device: "",
    bankDetail: {
      bankName: "",
    },
    aadharnumber: "",
    mobilenumber: "",
    amount: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const deviceType = [
    { _id: 1, category_name: "MORPHO" },
    { _id: 2, category_name: "MANTRA" },
    { _id: 3, category_name: "STARTEK" },
    { _id: 4, category_name: "SECUGEN" },
  ];

  useEffect(() => {
    getBankList();
    getCategory();
  }, []);

  const getCategory = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      console.log("======getcategory_list====>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          Response?.data?.data.map((item: any) => {
            if (item?.category_name.toUpperCase() == "AADHAAR PAY") {
              setValue("categoryId", item?._id);
            }
          });
        }
      }
    });
  };

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

  const onSubmit = async (data: FormValuesProps) => {
    setPostData({ ...data });
    handleOpen();
  };

  // useEffect(() => {
  //   let interval = setInterval(() => {
  //     if (seconds > 0) {
  //       setSeconds(seconds - 1);
  //     } else {
  //       clearInterval(interval)
  //     }
  //   }, 1000)
  // }, [seconds])

  // setTimeout(() => {
  //   setBlink(!blink);
  // }, 1000);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setAutoClose(autoClose - 1);
  //   }, 1000);
  //   if (autoClose == 0) {
  //     clearTimeout(timer);
  //     setarrofObj([]);
  //   }
  // }, [autoClose]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setLocalAttendance(
  //       Math.floor((user?.presenceAtForAP + 150000 - Date.now()) / 1000)
  //     );
  //     setAttend(true);
  //   }, 0);
  // }, [user?.presenceAtForAP]);

  useEffect(() => {
    let time = Math.floor((user?.presenceAtForAP + 150000 - Date.now()) / 1000);
    setAttendanceTimeout(time);
    localTime = setTimeout(() => {
      setAttendanceTimeout(attendanceTimeout - 1);
    }, 1000);
    if (attendanceTimeout <= 0) {
      clearTimeout(localTime);
    }
  }, [user]);

  if (!user?.fingPayAPESRegistrationStatus || !user?.fingPayAEPSKycStatus) {
    return <RegistrationAeps />;
  }

  if (attendanceTimeout <= 0) {
    return <AttendenceAeps attendance={"AP"} />;
  }

  return (
    <>
      <Helmet>
        <title>Aadhar Pay | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {attendanceTimeout > 0 && (
          <Typography variant="subtitle2" textAlign={"end"}>
            Aadhaar Withdrawal Attendance Timeout:{" "}
            <span
              style={{
                color: Math.floor(attendanceTimeout) < 60 ? "red" : "green",
              }}
            >
              {Math.floor(attendanceTimeout / 60)} Minutes{" "}
              {Math.floor(attendanceTimeout % 60)} Seconds
            </span>
          </Typography>
        )}
        <Stack my={4}>
          <Grid container spacing={1}>
            <Grid item sm={6} md={4} spacing={1}>
              <Stack gap={1}>
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
                <RHFAutocomplete
                  name="bank"
                  onChange={(event, value) => setValue("bankDetail", value)}
                  options={bankList.map((option: any) => option)}
                  getOptionLabel={(option: any) => option.bankName}
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
                    <RHFTextField
                      name="bankDetail.bankName"
                      label="Bank Name"
                      {...params}
                    />
                  )}
                />

                <RHFTextField
                  name="aadharnumber"
                  label="Customer AadharCard No."
                  type="number"
                />
                <RHFTextField
                  name="mobilenumber"
                  label="Customer Number"
                  type="number"
                />
                <RHFTextField name="amount" label="Amount" type="number" />
                <Stack flexDirection={"row"} gap={1}>
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
      </FormProvider>
      <MotionModal open={open} width={{ md: 500 }}>
        <ConfirmDetails
          handleClose={handleClose}
          {...postData}
          resetForm={() => {
            reset(defaultValues);
            setAttendanceTimeout(0);
          }}
        />
      </MotionModal>
    </>
  );
}

// ----------------------------------------------------------------------

type childProps = {
  handleClose: () => void;
  resetForm: () => void;
  other: FormValuesProps;
};

const ConfirmDetails = ({ handleClose, resetForm, ...other }: childProps) => {
  const {
    device,
    bankDetail,
    aadharnumber,
    mobilenumber,
    amount,
    categoryId,
  }: any = other;

  const { enqueueSnackbar } = useSnackbar();
  const { user, initialize } = useAuthContext();
  const [scanLoading, setScanLoading] = useState(false);

  const NPINSchema = Yup.object().shape({
    // otp1: Yup.string().required("Code is required"),
    // otp2: Yup.string().required("Code is required"),
    // otp3: Yup.string().required("Code is required"),
    // otp4: Yup.string().required("Code is required"),
    // otp5: Yup.string().required("Code is required"),
    // otp6: Yup.string().required("Code is required"),
  });

  const defaultValues = {
    // otp1: "",
    // otp2: "",
    // otp3: "",
    // otp4: "",
    // otp5: "",
    // otp6: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NPINSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const detailText = (name: string, value: string) => {
    return (
      <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
        <Typography variant="subtitle1">{name}</Typography>
        <Typography variant="body1">{value}</Typography>
      </Stack>
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    setScanLoading(true);
    let { error, success }: any = await CaptureDevice(device);
    setScanLoading(false);
    if (!success) {
      enqueueSnackbar(error);
      return;
    }
    try {
      let token = localStorage.getItem("token");
      let body = {
        latitude: localStorage.getItem("lat"),
        longitude: localStorage.getItem("long"),
        contact_no: mobilenumber,
        nationalBankIdentificationNumber: bankDetail?.FingpayAPIIN,
        adhaarNumber: aadharnumber,
        categoryId: categoryId,
        amount: amount,
        captureResponse: success,
      };
      await fetchLocation();
      await Api("aeps/aadhaar_pay_LTS", "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            }
            resetForm();
            initialize();
            handleClose();
          } else {
            enqueueSnackbar("failed");
            handleClose();
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  if (scanLoading) {
    return <Lottie animationData={fingerScan} />;
  }

  return (
    <React.Fragment>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack flexDirection={"column"} alignItems={"center"}>
          <Typography variant="h3">Confirm Details</Typography>
          <Icon
            icon="iconoir:fingerprint-check-circle"
            color="green"
            fontSize={70}
          />
          {/* <Icon icon="icon-park-outline:success" /> */}
        </Stack>
        {detailText("Amount", String(fIndianCurrency(amount)))}
        {detailText("Aadhaar Number", String(aadharnumber))}
        {detailText("Mobile Number", String(mobilenumber))}
        {detailText("Bank Name", String(bankDetail?.bankName))}

        {/* <Stack
          alignItems={"center"}
          justifyContent={"space-between"}
          mt={2}
          gap={2}
        >
          <Typography variant="h4">Confirm NPIN</Typography>
          <RHFSecureCodes
            keyName="otp"
            inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
          />

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
        </Stack> */}

        <Stack flexDirection={"row"} gap={1} mt={2}>
          <LoadingButton
            variant="contained"
            type="submit"
            loading={isSubmitting}
          >
            Confirm
          </LoadingButton>
          {!isSubmitting && (
            <LoadingButton variant="contained" onClick={handleClose}>
              Close
            </LoadingButton>
          )}
        </Stack>
      </FormProvider>
    </React.Fragment>
  );
};
