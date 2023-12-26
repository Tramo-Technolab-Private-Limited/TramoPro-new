// @mui
import {
  Alert,
  Tooltip,
  Stack,
  Typography,
  Link,
  Box,
  Button,
} from "@mui/material";
// hooks
import { useAuthContext } from "../../auth/useAuthContext";
// layouts
import RegisterLayout from "src/layouts/register/RegisterLayout";
//
import AuthWithSocial from "./AuthWithSocial";
import AuthRegisterForm from "./AuthRegisterForm";
import { useNavigate } from "react-router";
import { PATH_AUTH } from "src/routes/paths";

// ----------------------------------------------------------------------

export default function Register() {
  const { method } = useAuthContext();
  const navigate = useNavigate();

  return (
    <RegisterLayout>
      <Button
        sx={{
          zIndex: 9,
          position: "absolute",
          top: "3.5%",
          right: "5%",
        }}
        variant={"contained"}
        onClick={() => navigate(PATH_AUTH.login)}
      >
        Login
      </Button>
      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Typography variant="h4">
          Register in {process.env.REACT_APP_COMPANY_NAME}
        </Typography>

        <Tooltip title={method} placement="left">
          <Box
            component="img"
            alt={method}
            src={`/assets/icons/auth/ic_${method}.png`}
            sx={{ width: 32, height: 32, position: "absolute", right: 0 }}
          />
        </Tooltip>
      </Stack>

      <AuthRegisterForm />
    </RegisterLayout>
  );
}
