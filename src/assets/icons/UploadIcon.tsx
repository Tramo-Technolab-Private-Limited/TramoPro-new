import { memo } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import { Box, BoxProps } from "@mui/material";

// ----------------------------------------------------------------------

function UploadIcon({ ...other }: BoxProps) {
  const theme = useTheme();

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  return (
    <Box {...other}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.8 11.667V15.223C16.8 15.6945 16.6127 16.1468 16.2792 16.4802C15.9458 16.8137 15.4935 17.001 15.022 17.001H2.57799C2.10643 17.001 1.65419 16.8137 1.32075 16.4802C0.987312 16.1468 0.799988 15.6945 0.799988 15.223V11.667"
          stroke="#707070"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.245 5.444L8.79999 1L4.35599 5.444"
          stroke="#707070"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.79999 1V11.667"
          stroke="#707070"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </Box>
  );
}

export default memo(UploadIcon);
