import { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Stack,
  IconButton,
  RadioGroup,
  Radio,
  Checkbox,
  Modal,
  TextField,
  Button,
  Grid,
  Tabs,
  Box,
  Card,
  Alert,
  InputAdornment,
  FormHelperText,
  Typography,
  Link,
  CircularProgress,
  useTheme,
} from "@mui/material";

import AppBar from "@mui/material/AppBar";
import { LoadingButton } from "@mui/lab";
// components
import Iconify from "../../components/iconify";
import FormProvider, {
  RHFTextField,
  RHFCodes,
} from "../../components/hook-form";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import * as React from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Api } from "../../webservices";
import { useSnackbar } from "../../components/snackbar";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import TermAndCondition from "./TermAndConditions/TermAndCondition";
import RefundPolicy from "./TermAndConditions/RefundPolicy";
import PrivacyPolicy from "./TermAndConditions/PrivacyPolicy";
import GrievancePolicy from "./TermAndConditions/GrievancePolicy";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { useAuthContext } from "src/auth/useAuthContext";
import { requestPermission } from "./firebase";


// ----------------------------------------------------------------------

type FormValuesProps = {
  mobile: string;
  mobileNumber: string;
  refCode: string;
  email: string;
  password: string;
  confirmPassword: string;
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default function AuthRegisterForm(props: any) {
  const navigate = useNavigate();
  const { UpdateUserDetail, initialize } = useAuthContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setModalEdit] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setconfirmPassword] = useState(false);
  const [value2, setvalue2] = React.useState("agent");
  const [radioVal, setRadioVal] = React.useState("agent");
  const [refName, setRefName] = useState("");
  const [verifyLoad, setVerifyLoad] = useState(false);
  const [gOTP, setgOTP] = useState(false);
  const [refShow, setRefShow] = useState(false);
  const [checkbox, setCheckbox] = useState(true);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    refCode: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    condition: checkbox,
    // role: '',
  });

  const handleClearClick = () => {
    setRefName("");
    setValue("refCode", "");
    setFormValues({ ...formValues, refCode: "" });
  };

  const RegisterSchema = Yup.object().shape({
    mobile: Yup.string()
      .matches(
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
        "Mobile number must contain only numbers"
      )
      .min(10, "Mobile number must be at least 10 digits")
      .max(10, "Mobile number must not exceed 10 digits")
      .required("Mobile number is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("email is required"),
    refCode:
      radioVal === "directagent" ||
      radioVal === "directdistributor" ||
      value2 === "m_distributor"
        ? Yup.string()
        : Yup.string().required("Referral code is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .max(15, "Password must be less than 15 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });

  const OtpSchema = Yup.object().shape({
    code1: Yup.string().required("Code is required"),
    code2: Yup.string().required("Code is required"),
    code3: Yup.string().required("Code is required"),
    code4: Yup.string().required("Code is required"),
    code5: Yup.string().required("Code is required"),
    code6: Yup.string().required("Code is required"),
    otp1: Yup.string().required("Code is required"),
    otp2: Yup.string().required("Code is required"),
    otp3: Yup.string().required("Code is required"),
    otp4: Yup.string().required("Code is required"),
    otp5: Yup.string().required("Code is required"),
    otp6: Yup.string().required("Code is required"),
  });

  const defaultValues = {
    mobile: "",
    mobileNumber: "",
    refCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const defaultValues2 = {
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
    code6: "",
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const [tabValue, setTbValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTbValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setTbValue(index);
  };

  const method2 = useForm<FormValuesProps>({
    resolver: yupResolver(OtpSchema),
    defaultValues: defaultValues2,
  });

  const methods = useForm<FormValuesProps>({
    mode: "onChange",
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    register: otpForm,
    reset: otpReset,
    setValue: otpSetValue,
    handleSubmit: handleOtpSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const {
    reset,
    register,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const handleChangeTab = (
    event: React.SyntheticEvent,
    myValue: string | ""
  ) => {
    setvalue2(myValue);
    if (myValue == "agent") setRadioVal("agent");
    if (myValue == "distributor") setRadioVal("distributor");
    reset(formValues);
    setRefName("");
    setValue("refCode", "");
    setRefShow(false);
    setFormValues({ ...formValues, refCode: "" });
  };

  const onSubmit = (data: FormValuesProps) => {
    setFormValues({
      ...formValues,
      refCode: data.refCode,
      mobileNumber: data.mobile,
      email: data.email.toLowerCase(),
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    let body = {
      email: data.email.toLowerCase(),
      mobileNumber: data.mobile,
    };
    Api(`auth/sendOTP`, "POST", body, "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setgOTP(true);
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  const openEditModal = (val: any) => {
    setModalEdit(true);
  };

  const handleClose = () => {
    setModalEdit(false);
  };

  const resendOtp = (email: string, mobile: string) => {
    let body = {
      email: email.toLowerCase(),
      mobileNumber: mobile,
    };
    Api(`auth/sendOTP`, "POST", body, "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  const verifyRef = (e: string) => {
    setLoading(true);
    let rfcode;
    if (value2 == "distributor") {
      rfcode = "MD_" + e;
    } else if (value2 == "agent") {
      rfcode = "D_" + e;
    }
    Api(`auth/referralCode/` + rfcode, "GET", "", "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setLoading(false);

          setRefShow(true);
          setRefName(
            `${Response.data.data.firstName} ${Response.data.data.lastName}`
          );
          enqueueSnackbar(
            Response.data.message +
              ` ${Response.data.data.firstName} ${Response.data.data.lastName}`
          );
        } else {
          setLoading(false);
          enqueueSnackbar(Response.data.message);
        }
      } else {
        setLoading(false);
      }
    });
  };

  const formSubmit = (data: FormValuesProps) => {
    setVerifyLoad(true);
    const body = {
      email_OTP:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
      mobile_OTP:
        data.code1 +
        data.code2 +
        data.code3 +
        data.code4 +
        data.code5 +
        data.code6,
      email: formValues.email?.toLowerCase(),
      mobileNumber: formValues.mobileNumber,
    };

    Api(`auth/verifyOTP`, "POST", body, "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          createUser();
        } else {
          setVerifyLoad(false);
          enqueueSnackbar(Response.data.message);
        }
      }
    });
  };

  useEffect(() => requestPermission(), [])

  const createUser = () => {
    let rfcode;
    if (value2 == "distributor") {
      rfcode = "MD_" + formValues.refCode;
    } else if (value2 == "agent") {
      rfcode = "D_" + formValues.refCode;
    }

    const body = {
      contactNo: formValues.mobileNumber,
      email: formValues.email?.toLowerCase(),
      password: formValues.password,
      role: value2 == "m_distributor" ? value2 : radioVal,
      application_no: Math.floor(Math.random() * 10000000),
      referralCode: rfcode,
      FCM_token:sessionStorage.getItem('fcm')
    };
    Api(`auth/create_account`, "POST", body, "").then((Response: any) => {
      console.log("=============> Create" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          localStorage.setItem("token", Response.data.data.token);
          initialize();
          setVerifyLoad(false);
        } else {
          enqueueSnackbar(Response.data.message);
        }
        if (Response.data.code == 400) {
          setVerifyLoad(false);
          setRefName("");
          setgOTP(false);
          reset(defaultValues);
          otpReset(defaultValues2);
          setFormValues({ ...formValues, refCode: "" });
        }
      }
    });
  };

  const handleChangeRadio = (
    event: React.SyntheticEvent,
    myValue: string | ""
  ) => {
    setRadioVal(myValue);
  };

  useEffect(() => {
    if (getValues("mobile").length > 10) {
      setValue("mobile", getValues("mobile").slice(0, 10));
    }
  }, [watch("mobile")]);

  const HandleClearrefCode = () => {
    reset(formValues);
    setRefName("");
    setValue("refCode", "");
    setFormValues({ ...formValues, refCode: "" });
    setRefShow(false);
  };

  const HandleMobileCode = () => {
    otpSetValue("code1", "");
    otpSetValue("code2", "");
    otpSetValue("code3", "");
    otpSetValue("code4", "");
    otpSetValue("code5", "");
    otpSetValue("code6", "");
  };

  const HandleEmailCode = () => {
    otpSetValue("otp1", "");
    otpSetValue("otp2", "");
    otpSetValue("otp3", "");
    otpSetValue("otp4", "");
    otpSetValue("otp5", "");
    otpSetValue("otp6", "");
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TabContext value={value2}>
            <TabList
              variant="scrollable"
              scrollButtons={false}
              onChange={handleChangeTab}
            >
              <Tab
                style={{
                  minHeight: "35px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.primary.main}`,
                  padding: "0 10px",
                  color: theme.palette.primary.main,
                  marginRight: "10px",
                }}
                label="Agent"
                value="agent"
              />
              <Tab
                style={{
                  minHeight: "35px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.primary.main}`,
                  padding: "0 10px",
                  color: theme.palette.primary.main,
                  marginRight: "10px",
                }}
                label="Distributor"
                value="distributor"
              />
              <Tab
                style={{
                  minHeight: "35px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.primary.main}`,
                  padding: "0 10px",
                  color: theme.palette.primary.main,
                  marginRight: "10px",
                }}
                label="Master Distributor"
                value="m_distributor"
              />
            </TabList>
          </TabContext>
          {value2 == "agent" && (
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                defaultValue={radioVal}
                onChange={handleChangeRadio}
              >
                <FormControlLabel
                  value="agent"
                  control={<Radio />}
                  label="Netwrok Agent"
                />
              </RadioGroup>
            </FormControl>
          )}

          {value2 == "distributor" && (
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                defaultValue={radioVal}
                onChange={handleChangeRadio}
              >
                <FormControlLabel
                  value="distributor"
                  control={<Radio />}
                  label="Netwrok Distributor"
                />
              </RadioGroup>
            </FormControl>
          )}
          <Stack
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1,
            }}
          >
            {radioVal === "directagent" ||
              radioVal === "directdistributor" ||
              (value2 !== "m_distributor" && (
                <Stack sx={{ position: "relative" }}>
                  <TextField
                    disabled={gOTP}
                    error={!!errors.refCode}
                    label="Referral Code"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {value2 == "agent" ? "D_" : "MD_"}
                        </InputAdornment>
                      ),
                    }}
                    {...register("refCode", {
                      onChange: (e) =>
                        setFormValues({
                          ...formValues,
                          refCode: e.target.value,
                        }),
                      required: true,
                    })}
                    sx={{ width: 265 }}
                  />
                  {!!errors.refCode && (
                    <FormHelperText error sx={{ pl: 2 }}>
                      Please check your Ref Code.
                    </FormHelperText>
                  )}
                  {formValues.refCode && (
                    <LoadingButton
                      variant="contained"
                      size="medium"
                      loading={loading}
                      sx={{ position: "absolute", marginLeft: "190px", top: 2 }}
                      onClick={() => {
                        setLoading(true);
                        verifyRef(formValues.refCode);
                      }}
                      disabled={refShow}
                    >
                      Check
                    </LoadingButton>
                  )}
                </Stack>
              ))}

            {refName && (
              <Stack justifyContent="row" gap={1}>
                <Typography variant="h5">
                  {refName}{" "}
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={HandleClearrefCode}
                  >
                    Clear
                  </Button>
                </Typography>
              </Stack>
            )}
          </Stack>
          <Stack
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1,
            }}
          >
            <RHFTextField
              name="email"
              label="Email address"
              type="email"
              disabled={gOTP}
            />
            <RHFTextField
              name="mobile"
              label="Mobile Number"
              disabled={gOTP}
              type="number"
            />
          </Stack>
          <Stack
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1,
            }}
          >
            <RHFTextField
              disabled={gOTP}
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
            />
            <RHFTextField
              disabled={gOTP}
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword2 ? "text" : "password"}
            />
          </Stack>
          <FormControl>
            <Stack flexDirection="row" alignItems="start">
              <Checkbox
                {...label}
                color={"primary"}
                onClick={() => setCheckbox(!checkbox)}
              />
              <p style={{ fontSize: "12px", margin: "0 auto" }}>
                You agree to receive automated promotional, transactional
                messages from {process.env.REACT_APP_COMPANY_NAME}. Also agree
                our <Link onClick={openEditModal}> terms & conditions</Link>,
                privacy policies and cookies policy.
              </p>
            </Stack>
          </FormControl>
        </Stack>

        {!gOTP && (
          <LoadingButton
            fullWidth
            size="small"
            variant="contained"
            disabled={checkbox}
            // onClick={sendOTP}
            loading={isSubmitting}
            type="submit"
          >
            Generate OTP
          </LoadingButton>
        )}
      </FormProvider>

      <FormProvider methods={method2} onSubmit={handleOtpSubmit(formSubmit)}>
        {gOTP && (
          <Stack sx={{ width: "100", margin: "auto" }}>
            <Typography
              variant="body2"
              sx={{ my: 3 }}
              style={{ textAlign: "left", marginBottom: "0" }}
            >
              Mobile Verification Code &nbsp;
              <Link
                sx={{ cursor: "pointer" }}
                variant="subtitle2"
                style={{ float: "right" }}
                onClick={() => resendOtp("", formValues.mobileNumber)}
              >
                Resend code
              </Link>
            </Typography>
            <Stack flexDirection="row" gap={2}>
              <RHFCodes
                keyName="code"
                inputs={["code1", "code2", "code3", "code4", "code5", "code6"]}
              />
              <Button
                variant="outlined"
                size="medium"
                style={{ float: "right" }}
                onClick={HandleMobileCode}
              >
                Clear
              </Button>
            </Stack>
            {(!!error2.code1 ||
              !!error2.code2 ||
              !!error2.code3 ||
              !!error2.code4 ||
              !!error2.code5 ||
              !!error2.code6) && (
              <FormHelperText error sx={{ px: 2 }}>
                Code is required
              </FormHelperText>
            )}
            <Typography
              variant="body2"
              sx={{ my: 3 }}
              style={{ textAlign: "left", marginBottom: "0" }}
            >
              Email Verification Code &nbsp;
              <Link
                sx={{ cursor: "pointer" }}
                variant="subtitle2"
                style={{ float: "right" }}
                onClick={() => resendOtp(formValues.email, "")}
              >
                Resend code
              </Link>
            </Typography>
            <Stack flexDirection="row" gap={2}>
              <RHFCodes
                keyName="otp"
                inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
              />
              <Button
                variant="outlined"
                size="medium"
                style={{ float: "right" }}
                onClick={HandleEmailCode}
              >
                Clear
              </Button>
            </Stack>
            {(!!error2.otp1 ||
              !!error2.otp2 ||
              !!error2.otp3 ||
              !!error2.otp4 ||
              !!error2.otp5 ||
              !!error2.otp6) && (
              <FormHelperText error sx={{ px: 2 }}>
                Code is required
              </FormHelperText>
            )}

            <Stack mt={2}>
              {verifyLoad ? (
                <ApiDataLoading />
              ) : (
                <LoadingButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  loading={isSubmitting2}
                  sx={{ mt: 3, mb: 8 }}
                >
                  Verify
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        )}
      </FormProvider>

      <Modal
        open={open}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 2,
            bgcolor: "#ffffff",
            p: 4,
            width: {
              xs: "75%",
              sm: "75%",
            },
          }}
        >
          <Scrollbar sx={{ maxHeight: 600, minWidth: 650 }}>
            <AppBar position="static">
              <Tabs
                value={tabValue}
                onChange={handleChange}
                variant="fullWidth"
                aria-label="full width tabs example"
                style={{ backgroundColor: "#ffffff" }}
              >
                <Tab
                  label=" Term and Conditions"
                  {...a11yProps(0)}
                  style={{ color: "#C52031" }}
                />
                <Tab
                  label="Refund Policy"
                  {...a11yProps(1)}
                  style={{ color: "#C52031" }}
                />
                <Tab
                  label="Privacy Policy"
                  {...a11yProps(2)}
                  style={{ color: "#C52031" }}
                />
                <Tab
                  label="Grievance Policy"
                  {...a11yProps(3)}
                  style={{ color: "#C52031" }}
                />
              </Tabs>
            </AppBar>

            <TabPanel value={tabValue} index={0} dir={theme.direction}>
              <TermAndCondition />
            </TabPanel>
            <TabPanel value={tabValue} index={1} dir={theme.direction}>
              <RefundPolicy />
            </TabPanel>
            <TabPanel value={tabValue} index={2} dir={theme.direction}>
              <PrivacyPolicy />
            </TabPanel>
            <TabPanel value={tabValue} index={3} dir={theme.direction}>
              <GrievancePolicy />
            </TabPanel>
            {/* </Box> */}

            <Button onClick={handleClose} variant="contained" size="medium">
              Acept
            </Button>
          </Scrollbar>
        </Box>
      </Modal>
    </>
  );
}
