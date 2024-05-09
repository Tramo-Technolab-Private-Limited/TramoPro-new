import { useEffect, useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// auth
import { useAuthContext } from "../../auth/useAuthContext";
// components
import Iconify from "../../components/iconify";
import FormProvider, { RHFTextField } from "../../components/hook-form";

import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { requestPermission } from "./firebase";
import { fetchLocation } from "src/utils/fetchLocation";

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  afterSubmit?: string;
};

export default function AuthLoginForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login, Api } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email or mobile number is required")
      .test(
        "valid-email-or-mobile",
        "Enter a valid email address or mobile number",
        function (value) {
          // Check if the value is a valid email or a valid mobile number
          const isEmail = Yup.string().email().isValidSync(value);
          const isMobile = Yup.string()
            .matches(/^[0-9]{10}$/, "Invalid mobile number")
            .isValidSync(value);

          return isEmail || isMobile;
        }
      ),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    email: "",
    password: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  useEffect(() => requestPermission(), []);

  const onSubmit = async (data: FormValuesProps) => {
    let body = {
      username: data.email.toLocaleLowerCase(),
      password: data.password,
      FCM_token: sessionStorage.getItem("fcm"),
    };
    try {
      await fetchLocation();
      await Api(`auth/login_in`, "POST", body, "").then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            Api(`auth/userData`, "GET", "", Response.data.data.token).then(
              (response: any) => {
                if ((response.status = 200)) {
                  if (response.data.code == 200) {
                    login(Response.data.data.token, response.data.data);
                  }
                }
              }
            );
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar("Server Error", { variant: "error" });
        }
      });
    } catch (error) {
      if (error.code == 1) {
        enqueueSnackbar(`${error.message} !`, { variant: "error" });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />

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
      </Stack>

      <Stack alignItems="flex-end" sx={{ my: 2 }}>
        <Link
          variant="body2"
          color="inherit"
          underline="always"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/reset")}
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="medium"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </FormProvider>
  );
}
