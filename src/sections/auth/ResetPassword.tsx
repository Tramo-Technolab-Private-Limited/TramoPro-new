import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
// form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
// @mui
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_AUTH } from "../../routes/paths";
// components
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Link, Stack, Typography, Button, Tooltip, Box } from "@mui/material";

import { Api } from "../../webservices";
import { useState } from "react";
import ResetPassLayout from "src/layouts/reset/ResetPassLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  mobile: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { method } = useAuthContext();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    mobile: Yup.string().required("mobile number is required"),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: "", mobile: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const body = {
        mobile: data.mobile,
        email: data.email,
      };
      await Api(`auth/forgotPassword`, "POST", body, "").then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              navigate("/verifyotp", {
                state: { userid: Response.data.data.userId },
              });
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
        sx={{ position: "absolute", top: { xs: "3.5%", sm: 40 }, right: "5%" }}
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
        <Stack gap={3}>
          <RHFTextField
            type="number"
            name="mobile"
            label="Registered Mobile Number"
          />
          <RHFTextField
            name="email"
            label="Registered Email address"
            type="email"
          />
        </Stack>

        <Stack sx={{ my: 2 }}>
          <Typography variant="body2">
            Already have the password{" "}
            <Link
              variant="body2"
              color="inherit"
              underline="always"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(PATH_AUTH.login)}
            >
              Login here?
            </Link>
          </Typography>
        </Stack>

        <LoadingButton
          fullWidth
          size="medium"
          type="submit"
          variant="contained"
          sx={{ mb: 20 }}
          loading={isSubmitting}
        >
          Reset Password
        </LoadingButton>
      </FormProvider>
    </ResetPassLayout>
  );
}
