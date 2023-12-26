// @mui
import { styled, alpha } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
// auth
import { useAuthContext } from "../../../auth/useAuthContext";
// components
import { CustomAvatar } from "../../../components/custom-avatar";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import { sentenceCase } from "change-case";

// ----------------------------------------------------------------------

const StyledRoot = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 1.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user } = useAuthContext();

  return (
    <StyledRoot>
      <CustomAvatar
        src={user?.selfie[0].length && AwsDocSign(user?.selfie[0])}
        alt={user?.firstName + " " + user?.lastName}
        name={user?.displayName}
      />

      <Box sx={{ ml: 2, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {user?.firstName + " " + user?.lastName}
        </Typography>
        <Typography variant="subtitle2" noWrap>
          {user?.userCode}
        </Typography>

        <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
          {sentenceCase(user?.role)}
        </Typography>
      </Box>
    </StyledRoot>
  );
}
