import { CircularProgress, Stack, useTheme } from "@mui/material";
import { varFade } from "../animate";
import { m } from "framer-motion";
import Lottie from "lottie-react";
import TramoLoading from "../JsonAnimations/Tramo Loader.json";

function ApiDataLoading() {
  const theme = useTheme();
  return (
    <Stack flexDirection={"row"} justifyContent={"center"} my={2}>
      <m.div variants={varFade().in}>
        <Lottie animationData={TramoLoading} />
      </m.div>
    </Stack>
  );
}

export default ApiDataLoading;
