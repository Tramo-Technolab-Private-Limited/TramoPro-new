// @mui
import { Grid, Stack } from "@mui/material";
//
import ProfileAbout from "./ProfileAbout";
import ProfileFollowInfo from "./ProfileFollowInfo";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import useResponsive from "src/hooks/useResponsive";
import ProfileDocuments from "./ProfileDocuments";

// ----------------------------------------------------------------------

type Props = {
  info: any;
  posts: any[];
};

export default function Profile({ info, posts }: Props) {
  const { user } = useAuthContext();
  const isMobile = useResponsive("up", "sm");

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={3}>
          <ProfileFollowInfo
            follower={info.follower}
            following={info.following}
          />
          <Scrollbar
            sx={
              isMobile
                ? { maxHeight: window.innerHeight - 440, pb: 1 }
                : { maxHeight: window.innerHeight - 390, pb: 1 }
            }
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <ProfileAbout />
              </Grid>
              <Grid item xs={12} md={9}>
                <ProfileDocuments />
              </Grid>
            </Grid>
          </Scrollbar>
        </Stack>
      </Grid>
    </Grid>
  );
}
