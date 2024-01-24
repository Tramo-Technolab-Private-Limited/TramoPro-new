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
export default function TrasactionModal(props: any) {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    height: 200,
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 2,
    overflow: "auto",
  };

  const [open, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      Hi
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="transition-modal-title"
            variant="h6"
            component="h2"
            sx={{ marginBottom: 2 }}
          >
            Trasaction
            {/* {props.TransactionData.status == "success" ? (
              <Image src={SuccessImage} alt="" sx={{ width: 30, height: 30 }} />
            ) : props.TransactionData.status == "pending" ? (
              <Image
                src={PenddingImage}
                alt=""
                sx={{ width: 30, height: 30 }}
              />
            ) : props.TransactionData.status == "failed" ? (
              <Image src={FailedImage} alt="" sx={{ width: 30, height: 30 }} />
            ) : props.TransactionData.status == "hold" ? (
              <Image src={HoldImage} alt="" sx={{ width: 30, height: 30 }} />
            ) : props.TransactionData.status == "in_process" ? (
              <Image
                src={IN_PROCESSImgae}
                alt=""
                sx={{ width: 30, height: 30 }}
              />
            ) : props.TransactionData.status == "initiated" ? (
              <Image
                src={IntiatedImage}
                alt=""
                sx={{ width: 30, height: 30 }}
              />
            ) : (
              ""
            )} */}
          </Typography>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}
