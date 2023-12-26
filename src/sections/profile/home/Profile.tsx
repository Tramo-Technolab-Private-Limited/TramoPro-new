// @mui
import { Grid, Stack } from "@mui/material";
//
import ProfileAbout from "./ProfileAbout";
import ProfileFollowInfo from "./ProfileFollowInfo";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type Props = {
  info: any;
  posts: any[];
};

export default function Profile({ info, posts }: Props) {
  const { user } = useAuthContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          <ProfileFollowInfo
            follower={info.follower}
            following={info.following}
          />

          <ProfileAbout />

          {/* <ProfileSocialInfo socialLinks={info.socialLinks} /> */}
        </Stack>
      </Grid>

      {/* <Grid item xs={12} md={8}>
        <Stack spacing={3}>
          <ProfilePostInput />

          {posts.map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </Stack>
      </Grid> */}
    </Grid>
  );
}
