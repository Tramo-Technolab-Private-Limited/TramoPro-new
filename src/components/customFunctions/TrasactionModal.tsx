import * as React from "react";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import SuccessImage from "../../assets/transactionIcons/success.svg";
import FailedImage from "../../assets/transactionIcons/failed.svg";
import PenddingImage from "../../assets/transactionIcons/pending.svg";
import IntiatedImage from "../../assets/transactionIcons/initiated.svg";
import HoldImage from "../../assets/transactionIcons/hold.svg";
import IN_PROCESSImgae from "../../assets/transactionIcons/in_process.svg";

import Image from "src/components/image/Image";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import { Icon } from "@iconify/react";
import { sentenceCase } from "change-case";

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
  console.log("transactionDetail", transactionDetail, errorMsg);
  if (errorMsg) {
    return (
      <Modal
        open={isTxnOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack flexDirection={"row"} justifyContent={"center"}>
            <Image src={FailedImage} alt={"Failed"} />
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
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={isTxnOpen}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Stack flexDirection={"row"} justifyContent={"center"}>
          <Image
            src={
              transactionDetail?.status == "success"
                ? SuccessImage
                : transactionDetail?.status == "pending"
                ? PenddingImage
                : transactionDetail?.status == "hold"
                ? HoldImage
                : transactionDetail?.status == "in_process"
                ? IN_PROCESSImgae
                : IntiatedImage
            }
            alt={`${transactionDetail?.status}`}
          />
        </Stack>
        <Typography
          id="transition-modal-title"
          variant="h4"
          sx={{ marginBottom: 2, textAlign: "center" }}
        >
          {`Trasaction ${sentenceCase(transactionDetail?.status)}`}
        </Typography>
        <Button onClick={handleTxnModal} variant="contained">
          Close
        </Button>
      </Box>
    </Modal>
  );
}
