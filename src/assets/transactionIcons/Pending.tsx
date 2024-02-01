import { memo } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import { Box, BoxProps } from "@mui/material";

// ----------------------------------------------------------------------

function Pending({ ...other }: BoxProps) {
  return (
    <Box {...other}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M60 10C32.3858 10 10 32.3858 10 60C10 87.6142 32.3858 110 60 110C87.6142 110 110 87.6142 110 60C110 46.7392 104.732 34.0215 95.3553 24.6447C85.9785 15.2678 73.2608 10 60 10ZM65 80C65 82.7614 62.7614 85 60 85C57.2386 85 55 82.7614 55 80V55C55 52.2386 57.2386 50 60 50C62.7614 50 65 52.2386 65 55V80ZM55 40C55 42.7614 57.2386 45 60 45C62.7614 45 65 42.7614 65 40C65 37.2386 62.7614 35 60 35C57.2386 35 55 37.2386 55 40Z"
          fill="#FFAB00"
        />
      </svg>
    </Box>
  );
}

export default memo(Pending);
