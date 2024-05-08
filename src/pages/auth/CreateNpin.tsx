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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// routes
import { PATH_DASHBOARD } from "../../routes/paths";
import { PATH_AUTH } from "../../routes/paths";
// components
import { useSnackbar } from "../../components/snackbar";
import FormProvider, {
  RHFCodes,
  RHFSecureCodes,
  RHFTextField,
} from "../../components/hook-form";
import Iconify from "../../components/iconify";

import { useState, useEffect } from "react";
import { useAuthContext } from "src/auth/useAuthContext";
import { fetchLocation } from "src/utils/fetchLocation";
// ----------------------------------------------------------------------

type FormValuesProps = {
  // npin: string;
  // confirmnpin: string;
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

export default function CreateNpin() {
  const navigate = useNavigate();
  const { user, UpdateUserDetail, Api } = useAuthContext();
  const [msg, setMsg] = useState("Create Your NPIN");
  const { enqueueSnackbar } = useSnackbar();

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required("Code is required"),
    code2: Yup.string().required("Code is required"),
    code3: Yup.string().required("Code is required"),
    code4: Yup.string().required("Code is required"),
    code5: Yup.string().required("Code is required"),
    code6: Yup.string().required("Code is required"),
    otp1: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code1"), null], "npin must match"),
    otp2: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code2"), null], "npin must match"),
    otp3: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code3"), null], "npin must match"),
    otp4: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code4"), null], "npin must match"),
    otp5: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code5"), null], "npin must match"),
    otp6: Yup.string()
      .required("Code is required")
      .oneOf([Yup.ref("code6"), null], "npin must match"),
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

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    user?.isNPIN && navigate(PATH_DASHBOARD.root);
  }, []);

  const onSubmit = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    try {
      const body = {
        nPin:
          data.code1 +
          data.code2 +
          data.code3 +
          data.code4 +
          data.code5 +
          data.code6,
      };
      await Api(`auth/create_Npin`, "POST", body, token).then(
        (Response: any) => {
          console.log("=============>" + JSON.stringify(Response));
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              UpdateUserDetail({ isNPIN: true });
              navigate(PATH_DASHBOARD.mystats);
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
    <Stack margin={"auto"} alignItems={"center"}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4" textAlign={"center"} mb={3}>
          Create TPIN
        </Typography>
        <Stack spacing={3}>
          <Typography variant="subtitle1" sx={{ mb: 0 }}>
            TPIN
          </Typography>
          <RHFSecureCodes
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
          <Typography variant="subtitle1" sx={{ mb: 0 }}>
            Confirm TPIN
          </Typography>
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
    // ---------------------------------------------------
  );
}
