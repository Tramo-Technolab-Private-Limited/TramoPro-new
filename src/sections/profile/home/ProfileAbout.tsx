// @mui
import { styled } from "@mui/material/styles";
import { Link, Card, Typography, CardHeader, Stack } from "@mui/material";
// components
import Iconify from "../../../components/iconify";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

const StyledIcon = styled(Iconify)(({ theme }) => ({
  width: 20,
  height: 20,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

export default function ProfileAbout() {
  const { user, Api, UploadFileApi } = useAuthContext();

  return (
    <Card>
      <CardHeader title="About" />

      <Stack spacing={2} sx={{ p: 3 }}>
        {/* <Typography variant="body2">{quote}</Typography> */}

        <Stack direction="row">
          <StyledIcon icon="eva:pin-fill" />

          <Typography variant="body2">
            Live at &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {`${user?.addressInAadhar} ${user?.localityInAadhar} ${user?.cityInAadhar} ${user?.distInAadhar} ${user?.aadharpincode}`}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">
            Shop at &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {`${user?.shopAddress}`}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">
            Mobile No &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {`${user?.contact_no}`}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">
            Aadhar &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {`${user?.aadharNumber}`}
            </Link>
          </Typography>
        </Stack>

        {user?.isGST && (
          <Stack direction="row">
            <StyledIcon icon="eva:email-fill" />
            <Typography variant="body2">
              GST &nbsp;
              <Link component="span" variant="subtitle2" color="text.primary">
                {`${user?.GSTNumber}`}
              </Link>
            </Typography>
          </Stack>
        )}

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">
            PAN &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {`${user?.PANnumber}`}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">
            {" "}
            Refer by {user?.referralCode}
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="eva:email-fill" />
          <Typography variant="body2">Email is {user?.email}</Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="ic:round-business-center" />

          <Typography variant="body2">
            {user?.role} at &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {/* {company} */}
              {process.env.REACT_APP_COMPANY_NAME}
            </Link>
          </Typography>
        </Stack>

        <Stack direction="row">
          <StyledIcon icon="ic:round-business-center" />

          <Typography variant="body2">
            UserCode &nbsp;
            <Link component="span" variant="subtitle2" color="text.primary">
              {user?.userCode}
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
