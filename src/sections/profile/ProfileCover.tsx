// @mui
import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
// auth
import { useAuthContext } from "../../auth/useAuthContext";
//utils
import { bgBlur } from "../../utils/cssStyles";

// components
import Image from "../../components/image";
import { CustomAvatar } from "../../components/custom-avatar";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
// ----------------------------------------------------------------------

const StyledInfo = styled("div")(({ theme }) => ({
  left: 0,
  right: 0,
  zIndex: 99,
  position: "absolute",
  marginTop: theme.spacing(5),
  [theme.breakpoints.up("md")]: {
    right: "auto",
    display: "flex",
    alignItems: "center",
    left: theme.spacing(3),
    bottom: theme.spacing(3),
  },
}));

// ----------------------------------------------------------------------

export default function ProfileCover({ cover }: any) {
  const { user } = useAuthContext();
  const StyledRoot = styled("div")(({ theme }) => ({
    "&:before": {
      ...bgBlur({
        imgUrl: `${AwsDocSign(user?.shopImage[0])}`,
      }),
      filter: "blur(4px)",
      top: 0,
      zIndex: 9,
      content: "''",
      width: "100%",
      height: "100%",
      position: "absolute",
      backgroundSize: "cover",
    },
  }));

  return (
    <StyledRoot>
      <StyledInfo>
        <CustomAvatar
          src={user?.selfie[0]}
          alt={user?.displayName}
          name={`${user?.firstName} ${user?.lastName}`}
          sx={{
            mx: "auto",
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: "common.white",
            width: { xs: 80, md: 128 },
            height: { xs: 80, md: 128 },
          }}
        />

        <Box
          sx={{
            ml: { md: 3 },
            mt: { xs: 1, md: 0 },
            // color: "common.white",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: (theme) => theme.palette.common.white }}
          >{`${user?.company_name}`}</Typography>
          <Typography
            variant="h6"
            sx={{ color: (theme) => theme.palette.common.white }}
          >
            {`${user?.firstName} ${user?.lastName}`}{" "}
            <Typography
              component={"span"}
              sx={{ color: (theme) => theme.palette.common.white }}
            >
              ({" "}
              {user?.role == "agent"
                ? "Agent"
                : user?.role == "distributor"
                ? "Distributor"
                : "Master Distributor"}{" "}
              )
            </Typography>
          </Typography>
        </Box>
      </StyledInfo>

      <Image
        alt="cover"
        src={user?.shopImage[0]}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "absolute",
        }}
      />
    </StyledRoot>
  );
}
