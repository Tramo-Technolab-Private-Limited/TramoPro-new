import React, { useState, useEffect, useRef } from "react";
import { Modal, Box, Grid, Typography, Button, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import { PATH_AUTH } from "src/routes/paths";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "#ffffff",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AutoLogout = ({ children }: any) => {
  const navigate = useNavigate();
  const pathName = useLocation();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const timeoutRef: any = useRef();

  const handleLogout = () => {
    if (window.location.href.split("/").includes("dashboard")) {
      handleOpen();
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, 900000);
  };

  const onEvent = () => {
    resetTimeout();
  };

  useEffect(() => {
    resetTimeout();
    const events = ["mousedown", "keydown", "mousemove", "scroll"];
    events.forEach((event) => {
      document.addEventListener(event, onEvent);
    });
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => {
        document.removeEventListener(event, onEvent);
      });
    };
  }, []);

  const logout = () => {
    handleClose();
    localStorage.clear();
    navigate(PATH_AUTH.login);
  };

  return (
    <>
      {children}
      <Modal
        open={open}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
            }}
          >
            <Typography variant="subtitle1" textAlign={"center"}>
              You have been automatically logged out due to inactivity.
            </Typography>
            <Button
              onClick={logout}
              variant="contained"
              sx={{
                mt: 1,
                width: "fit-content",
                margin: "auto",
              }}
            >
              login
            </Button>
          </Grid>
        </Box>
      </Modal>
    </>
  );
};

export default AutoLogout;
