import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
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
  Tooltip,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_DASHBOARD } from "../../routes/paths";
import { PATH_AUTH } from "../../routes/paths";
// components
import { useSnackbar } from "../../components/snackbar";
import FormProvider, {
  RHFCodes,
  RHFTextField,
} from "../../components/hook-form";
import Iconify from "../../components/iconify";
import { Api } from "../../webservices";
import { Fragment, useEffect, useState } from "react";
import ResetPassLayout from "src/layouts/reset/ResetPassLayout";
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
  password: string;
  confirmPassword: string;
};

export default function AuthVerifyCodeForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { method } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
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
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
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
    password: "",
    confirmPassword: "",
  };

  const methods = useForm({
    mode: "onChange",
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    console.log(state);
    !state?.userid && navigate("/reset");
  }, []);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const body = {
        m_otp:
          data.code1 +
          data.code2 +
          data.code3 +
          data.code4 +
          data.code5 +
          data.code6,
        e_otp:
          data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
        userId: state.userid,
        password: data.password,
      };
      await Api(`auth/otpVerifyAndResetPassword`, "POST", body, "").then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              navigate(PATH_AUTH.login);
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            }
          } else {
            enqueueSnackbar("Failed", { variant: "error" });
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ResetPassLayout>
      <Button
        sx={{ position: "absolute", top: { xs: 10, sm: 40 }, right: "5%" }}
        variant={"contained"}
        onClick={() => navigate(PATH_AUTH.login)}
      >
        Login
      </Button>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">Reset Password</Typography>

        <Tooltip title={method} placement="left">
          <Box
            component="img"
            alt={method}
            src={`/assets/icons/auth/ic_${method}.png`}
            sx={{ width: 32, height: 32, position: "absolute", right: 0 }}
          />
        </Tooltip>
      </Stack>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>{"Enter Your OTP"}</strong>
        </Alert>
        <Stack spacing={2}>
          <Fragment>
            <Typography variant="subtitle2" style={{ textAlign: "left" }}>
              Mobile Verification Code &nbsp;
              <Link variant="subtitle2" style={{ float: "right" }}>
                Resend code
              </Link>
            </Typography>
            <RHFCodes
              keyName="code"
              inputs={["code1", "code2", "code3", "code4", "code5", "code6"]}
            />

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
          </Fragment>
          <Fragment>
            <Typography variant="subtitle2" style={{ textAlign: "left" }}>
              Email Verification Code &nbsp;
              <Link
                sx={{ cursor: "pointer" }}
                variant="subtitle2"
                style={{ float: "right" }}
              >
                Resend code
              </Link>
            </Typography>
            <RHFCodes
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
          </Fragment>

          <RHFTextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <Iconify
                      icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <RHFTextField
            name="confirmPassword"
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    <Iconify
                      icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
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
    </ResetPassLayout>
    // ---------------------------------------------------
  );
}
