import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { useSnackbar } from "../../components/snackbar";
import FormProvider, {
  RHFCodes,
  RHFTextField,
} from "../../components/hook-form";
import Iconify from "../../components/iconify";
import { Api } from "../../webservices";
import { useState } from "react";
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

export default function VerifyCode(props: any) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [msg, setMsg] = useState("Enter Your OTP");
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
        userId: user?._id,
        password: data.password,
      };

      Api(`auth/otpVerifyAndResetPassword`, "POST", body, "").then(
        (Response: any) => {
          console.log("=============>" + JSON.stringify(Response));
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              props.callback(true);
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
              enqueueSnackbar("Wrong OTP!", { variant: "error" });
            }
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography
          variant="body2"
          sx={{ my: 3 }}
          style={{ textAlign: "left", marginBottom: "0" }}
        >
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

        {/* <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Verify
        </LoadingButton> */}

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
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Verify
        </LoadingButton>
      </Stack>
    </FormProvider>
    // ---------------------------------------------------
  );
}
