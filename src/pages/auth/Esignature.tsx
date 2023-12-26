import { Helmet } from "react-helmet-async";

// @mui
import { Typography, Stack, useTheme } from "@mui/material";
import SetNpinForm from "./CreateNpin";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { Api } from "src/webservices";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import { STEP_DASHBOARD } from "src/routes/paths";
export default function NPinPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [verifyLoding, setVerifyLoading] = useState(false);

  useEffect(() => {
    user?.is_eAgreement_signed && navigate(STEP_DASHBOARD.verifyusernpin);
  }, []);

  const redirectToGoogle = () => {
    setVerifyLoading(true);
    window.location.href = user?.eAgreement_URL;
  };

  return (
    <>
      <Stack
        sx={{ alignItems: "center", justifyContent: "center", margin: "40px" }}
      >
        <Helmet>
          <title> Esignature | {process.env.REACT_APP_COMPANY_NAME}</title>
        </Helmet>

        <Stack alignItems={"center"} justifyContent={"center"} my={3} gap={1}>
          <Typography variant="h3" color="green">
            Congratulations! Your profile has been successfully approved!
          </Typography>

          <Typography variant="h4" marginTop={3}>
            To begin your journey with us, please sign the digital agreement by
            clicking the button below. This agreement outlines the terms and
            conditions of your association with{" "}
            {process.env.REACT_APP_COMPANY_NAME}. Thank you for choosing to
            partner with us.
          </Typography>
        </Stack>

        <LoadingButton
          size="medium"
          type="submit"
          variant="contained"
          sx={{ mt: 5 }}
          disabled={user?.is_eAgreement_signed}
          loading={verifyLoding}
          onClick={redirectToGoogle}
        >
          E-Signature
        </LoadingButton>
      </Stack>
    </>
  );
}
