import * as Yup from "yup";
// form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
// @mui
import { LoadingButton } from "@mui/lab";
// components
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Typography } from "@mui/material";

import { Api } from "../../webservices";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  mobile: string;
};

export default function ResetPassword(props: any) {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email must be a valid email address")
      .required("Email is required")
      .test({
        name: "max",
        exclusive: false,
        params: {},
        message: "please enter your registered email ",
        test: function (value) {
          return value === user?.email;
        },
      }),
    mobile: Yup.string()
      .required("mobile number is required")
      .test({
        name: "max",
        exclusive: false,
        params: {},
        message: "please enter your registered Mobile Number ",
        test: function (value) {
          return value === user?.contact_no;
        },
      }),
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
    const body = {
      mobile: data.mobile,
      email: data.email,
    };
    Api(`auth/forgotPassword`, "POST", body, "").then((Response: any) => {
      console.log("=============>" + JSON.stringify(Response));
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          props.callback(false);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h3" my={1} sx={{ mt: -2 }}>
        Reset Password
      </Typography>
      <RHFTextField
        type="number"
        name="mobile"
        label="Registered Mobile Number"
        sx={{ "margin-bottom": "20px" }}
      />
      <RHFTextField name="email" type="email" label="Email address" />

      <LoadingButton
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ mt: 2 }}
      >
        Reset Password
      </LoadingButton>
    </FormProvider>
  );
}
