import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { requestPermission, onMessageListener } from "./sections/auth/firebase";
import { Grid } from "@mui/material";
import { useSnackbar } from "notistack";

function Notification() {
  const { enqueueSnackbar } = useSnackbar();
  const [notification, setNotification] = useState({ title: "", body: "" });
  useEffect(() => {
    // requestPermission();
    const unsubscribe = onMessageListener().then((payload:any) => {
      console.log('payload',payload)
      setNotification({
        title: payload?.notification?.title,
        body: payload?.notification?.body,
      });
      enqueueSnackbar(`${payload?.notification?.title}: ${payload?.notification?.body}`)
      toast.success(
        `${payload?.notification?.title}: ${payload?.notification?.body}`,
        {
          duration: 6000,
          position: "top-right",
        }
      );
    });
    return () => {
      unsubscribe.catch((err) => console.log("failed: ", err));
    };
  }, []);
  return (
    <Grid>
      
    </Grid>
  );
}
export default Notification;
