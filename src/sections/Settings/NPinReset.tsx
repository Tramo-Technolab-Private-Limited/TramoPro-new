import { useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Stack, FormHelperText, Typography, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormProvider, {
  RHFCodes,
  RHFTextField,
} from "../../components/hook-form";
import * as React from "react";
import { Api } from "../../webservices";
import { useSnackbar } from "notistack";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
  npin: string;
  confirmnpin: string;
  mobile: string;
  email: string;
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

export default function NPinReset(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const [verifyLoad, setVerifyLoad] = useState(false);
  const [gOTP, setgOTP] = useState(false);
  const [VerOTP, setVerOTP] = useState(false);

  const [formValues, setFormValues] = useState({
    mobileNumber: "",
    email: "",
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
    email: "",
  };

  const VerifyCodeSchema = Yup.object().shape({
    npin: Yup.string()
      .min(6, "NPIN must be at least 6 digit")
      .max(6, "NPIN must be at least 6 digit")
      .required("Password is required"),
    confirmnpin: Yup.string()
      .required("Confirm npin is required")
      .oneOf([Yup.ref("npin"), null], "npin must match"),
  });

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

  const defaultValuesCreate = {
    mobile: "",
    email: "",
  };

  const method2 = useForm<FormValuesProps>({
    resolver: yupResolver(OtpSchema),
    defaultValues: defaultValues2,
  });

  const methodCreate = useForm<FormValuesProps>({
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues: defaultValuesCreate,
  });

  const methods = useForm<FormValuesProps>({
    mode: "onChange",

    defaultValues,
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const {
    handleSubmit: handleSubmitCreate,
    formState: { errors: error3, isSubmitting: isSubmittingCreate },
  } = methodCreate;

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    const body = {
      nPin: user?.nPin,
    };
    Api(`auth/send_NpinOTP`, "GET", body, token).then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);

          setgOTP(true);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const resendOtp = (email: string, mobile: string) => {
    let body = {
      email: email,
      mobileNumber: mobile,
    };
    Api(`auth/send_NpinOTP`, "POST", body, "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const formSubmit = (data: FormValuesProps) => {
    console.log("form value", formValues);
    setVerifyLoad(true);
    const body = {
      emailOtp:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
      mobileOtp:
        data.code1 +
        data.code2 +
        data.code3 +
        data.code4 +
        data.code5 +
        data.code6,
    };
    let token = localStorage.getItem("token");

    Api(`auth/verifyNpin_Otp`, "POST", body, token).then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);

          console.log("==========OTP VERIFIED ===========>.", Response);

          setVerOTP(true);
          // createUser();
        } else {
          setVerifyLoad(false);
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
      setVerifyLoad(false);
    });
  };

  const onSubmitCreate = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    console.log("======form====", data);
    try {
      const body = {
        nPin: data.npin,
      };

      await Api(`auth/create_Npin`, "POST", body, token).then(
        (Response: any) => {
          console.log("=============>" + JSON.stringify(Response));
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              let msg = Response.data.message;
              enqueueSnackbar(msg);
              // setMsg(msg);
              // navigate(PATH_DASHBOARD.MyStats.MyStats);
              setgOTP(false);
              setVerOTP(false);
            } else {
              let msg = Response.data.message;
              enqueueSnackbar(msg, { variant: "error" });
              // setMsg(msg);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {gOTP && !VerOTP && (
        <FormProvider methods={method2} onSubmit={handleOtpSubmit(formSubmit)}>
          <Stack>
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
            <RHFCodes
              keyName="code"
              inputs={["code1", "code2", "code3", "code4", "code5", "code6"]}
            />

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
            <RHFCodes
              keyName="otp"
              inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
            />

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
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting2}
                  sx={{ mt: 3 }}
                >
                  Verify
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </FormProvider>
      )}

      {!gOTP && !VerOTP && (
        <>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <LoadingButton
              size="small"
              variant="contained"
              // onClick={sendOTP}
              loading={isSubmitting}
              type="submit"
              sx={{ mb: "5px" }}
            >
              Reset MPin
            </LoadingButton>
          </FormProvider>
        </>
      )}

      {gOTP && VerOTP ? (
        <FormProvider
          methods={methodCreate}
          onSubmit={handleSubmitCreate(onSubmitCreate)}
        >
          <Stack spacing={3}>
            <RHFTextField
              name="npin"
              label="NPIN"
              type="number"
              inputProps={{ pattern: "[0-9]*" }}
            />
            <RHFTextField
              name="confirmnpin"
              label="Confirm MPIN"
              inputProps={{ pattern: "[0-9]*" }}
              type="number"
            />
            <LoadingButton
              fullWidth
              size="medium"
              type="submit"
              variant="contained"
              loading={isSubmittingCreate}
              sx={{ mt: 3 }}
            >
              Create MPin
            </LoadingButton>
          </Stack>
        </FormProvider>
      ) : (
        ""
      )}
    </>
  );
}
