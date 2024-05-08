import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  FormHelperText,
  Typography,
  Link,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { useSnackbar } from "../../components/snackbar";
import FormProvider, { RHFCodes } from "../../components/hook-form";

import { useState, useEffect } from "react";
import { PATH_DASHBOARD, STEP_DASHBOARD } from "src/routes/paths";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
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

export default function NpinOtp(props: any) {
  const pathname = useLocation();
  const { user, Api, UploadFileApi } = useAuthContext();
  const searchParams = new URLSearchParams(pathname.search);
  const eventVal = searchParams.get("event");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const VerifyCodeSchema = Yup.object().shape({
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

  const methods = useForm({
    mode: "onChange",

    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const HandleMobileCode = () => {
    setValue("code1", "");
    setValue("code2", "");
    setValue("code3", "");
    setValue("code4", "");
    setValue("code5", "");
    setValue("code6", "");
  };

  const HandleEmailCode = () => {
    setValue("otp1", "");
    setValue("otp2", "");
    setValue("otp3", "");
    setValue("otp4", "");
    setValue("otp5", "");
    setValue("otp6", "");
  };

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (eventVal == "signing_complete" || user?.is_eAgreement_signed) getotp();
    user?.isNPIN && navigate(PATH_DASHBOARD.root);
  }, []);

  const getotp = () => {
    let token = localStorage.getItem("token");
    Api(`auth/send_NpinOTP`, "GET", "", token).then((Response: any) => {
      console.log("=======send_NpinOTP======>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };
  const onSubmit = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    try {
      const body = {
        mobileOtp:
          data.code1 +
          data.code2 +
          data.code3 +
          data.code4 +
          data.code5 +
          data.code6,
        emailOtp:
          data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
      };
      await Api(`auth/verifyNpin_Otp`, "POST", body, token).then(
        (Response: any) => {
          console.log("=============>" + JSON.stringify(Response));
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              navigate(STEP_DASHBOARD.createnpin);
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
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
      {eventVal == "signing_complete" || user?.is_eAgreement_signed ? (
        <Stack margin={"auto"} alignItems={"center"}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h3" paragraph textAlign={"center"}>
              Verify OTP
            </Typography>

            <Typography
              sx={{ color: "text.secondary", mb: 5, textAlign: "center" }}
            >
              Please verify email address & mobile number associated <br /> with
              your account to create NPIN.
            </Typography>

            <Stack spacing={3}>
              <Typography
                variant="subtitle2"
                sx={{ my: 3 }}
                style={{ textAlign: "left", marginBottom: "0" }}
              >
                Mobile Verification Code &nbsp;
              </Typography>

              <Stack flexDirection="row" gap={1}>
                <Stack>
                  <RHFCodes
                    keyName="code"
                    inputs={[
                      "code1",
                      "code2",
                      "code3",
                      "code4",
                      "code5",
                      "code6",
                    ]}
                  />
                </Stack>
                <Stack>
                  <Stack rowGap={0.5}>
                    <Button
                      variant="contained"
                      style={{
                        float: "right",
                        fontSize: "10px",
                        height: "25px",
                      }}
                      onClick={() => getotp()}
                      size="small"
                    >
                      Resend code
                    </Button>

                    <Button
                      variant="outlined"
                      style={{
                        float: "right",
                        fontSize: "10px",
                        height: "25px",
                      }}
                      onClick={HandleMobileCode}
                      size="small"
                    >
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </Stack>

              {(!!errors.code1 ||
                !!errors.code2 ||
                !!errors.code3 ||
                !!errors.code4 ||
                !!errors.code5 ||
                !!errors.code6) && (
                <FormHelperText error sx={{ px: 2 }}>
                  Code is required
                </FormHelperText>
              )}

              <Typography
                variant="subtitle2"
                sx={{ my: 3 }}
                style={{ textAlign: "left", marginBottom: "0" }}
              >
                Email Verification Code &nbsp;
              </Typography>
              <Stack flexDirection="row" gap={1}>
                <RHFCodes
                  keyName="otp"
                  inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                />
                <Stack>
                  <Stack rowGap={0.5}>
                    <Button
                      variant="contained"
                      style={{
                        float: "right",
                        fontSize: "10px",
                        height: "25px",
                      }}
                      onClick={() => getotp()}
                      size="small"
                    >
                      Resend code
                    </Button>

                    <Button
                      variant="outlined"
                      style={{
                        float: "right",
                        fontSize: "10px",
                        height: "25px",
                      }}
                      onClick={HandleEmailCode}
                      size="small"
                    >
                      Clear
                    </Button>
                  </Stack>
                </Stack>
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
              {/* <Typography
                variant="body2"
                sx={{ my: 3 }}
                style={{ textAlign: "left", marginBottom: "0" }}
              >
                &nbsp;
                <Link
                  sx={{ cursor: "pointer" }}
                  variant="subtitle2"
                  style={{ float: "right" }}
                >
                  Resend code
                </Link>{" "}
              </Typography> */}

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{ mt: 3 }}
              >
                Verify
              </LoadingButton>
            </Stack>
          </FormProvider>
        </Stack>
      ) : (
        <>
          <Stack alignItems={"center"} justifyContent={"center"} my={3} gap={1}>
            <Typography variant="h3" color="red">
              Agreement Signing Unsuccessful
            </Typography>

            <Typography variant="h4" my={3}>
              Encountered an Issue? We're Here to Help!
            </Typography>

            <Typography textAlign={"center"} fontSize={24} my={2}>
              We noticed that the agreement signing process for your onboarding
              on the Tramo platform was unsuccessful. We apologize for any
              inconvenience this may have caused.
            </Typography>
            <Typography textAlign={"center"} fontSize={24} my={2}>
              Helpline Number:{" "}
              <a href={`tel:${process.env.REACT_APP_COMPANY_MOBILE}`}>
                {process.env.REACT_APP_COMPANY_MOBILE}
              </a>{" "}
              Email Support:{" "}
              <a href={`mailto:${process.env.REACT_APP_COMPANY_EMAIL}`}>
                {process.env.REACT_APP_COMPANY_EMAIL}
              </a>{" "}
              Please reach out to our support team via the provided contact
              details, and we'll be happy to regenerate a new e-agreement
              signing link for you.
            </Typography>
            <Typography textAlign={"center"} fontSize={24} my={2}>
              We appreciate your patience and cooperation.
            </Typography>
          </Stack>
        </>
      )}
    </>
    // ---------------------------------------------------
  );
}
