import * as React from "react";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import Image from "src/components/image/Image";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import { Icon } from "@iconify/react";
import { sentenceCase } from "change-case";
import Failed from "src/assets/transactionIcons/Failed";
import Success from "src/assets/transactionIcons/Success";
import Pending from "src/assets/transactionIcons/Pending";
import Hold from "src/assets/transactionIcons/Hold";
import Inprocess from "src/assets/transactionIcons/Inprocess";
import Initiated from "src/assets/transactionIcons/Initiated";
import MotionModal from "../animate/MotionModal";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "100%", sm: 400 },
  bgcolor: "background.paper",
  border: "2px ",
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
};

export default function TransactionModal({
  transactionDetail,
  errorMsg,
  isTxnOpen,
  handleTxnModal,
}: any) {
  if (errorMsg) {
    return (
      <MotionModal open={isTxnOpen}>
        <Stack flexDirection={"row"} justifyContent={"center"}>
          <Failed />
        </Stack>
        <Typography variant="h4" textAlign={"center"}>
          Transaction Failed
        </Typography>
        <Typography
          variant="h4"
          textAlign={"center"}
          color={"#9e9e9ef0"}
          my={1}
        >
          {errorMsg}
        </Typography>
        <Button onClick={handleTxnModal} variant="contained">
          Close
        </Button>
      </MotionModal>
    );
  }

  return (
    <MotionModal open={isTxnOpen}>
      <Stack flexDirection={"row"} justifyContent={"center"}>
        {transactionDetail?.status == "success" ? (
          <Success />
        ) : transactionDetail?.status == "pending" ? (
          <Pending />
        ) : transactionDetail?.status == "hold" ? (
          <Hold />
        ) : transactionDetail?.status == "in_process" ? (
          <Inprocess />
        ) : (
          <Initiated />
        )}
      </Stack>
      <Typography
        id="transition-modal-title"
        variant="h4"
        sx={{ marginBottom: 2, textAlign: "center" }}
      >
        {transactionDetail?.status &&
          `Trasaction ${sentenceCase(transactionDetail?.status)}`}
      </Typography>
      <Button onClick={handleTxnModal} variant="contained">
        Close
      </Button>
    </MotionModal>
  );
}
