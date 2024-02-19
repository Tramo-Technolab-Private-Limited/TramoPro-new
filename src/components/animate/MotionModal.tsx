import { m, AnimatePresence } from "framer-motion";
// @mui
import {
  Dialog,
  Box,
  Paper,
  DialogProps,
  Modal,
  Stack,
  Button,
} from "@mui/material";
//
import { varFade } from "./variants";
import MotionContainer from "./MotionContainer";
import Scrollbar from "../scrollbar/Scrollbar";

// ----------------------------------------------------------------------

export interface Props extends DialogProps {
  onClose?: VoidFunction;
  width?: any;
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

export default function MotionModal({
  open = false,
  onClose,
  children,
  width = { xs: "100%", sm: 500, md: 700, lg: 900 },
  sx,
  ...other
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <Modal
          fullWidth
          open={open}
          onClose={onClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          {...other}
        >
          <Box sx={{ ...style, width }} component={MotionContainer}>
            <m.div variants={varFade().inUp}>
              <Stack
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <Scrollbar
                  sx={{
                    maxHeight: `${window.innerHeight - 100}px`,
                    maxWidth: `${window.innerWidth - 100}px`,
                    pr: 1,
                  }}
                >
                  {children}
                </Scrollbar>
              </Stack>
            </m.div>
          </Box>
        </Modal>
      )}
    </AnimatePresence>
  );
}
