import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

function CircularProgressOneMinute() {
  const [progress, setProgress] = useState(100);
  const [remainingTime, setRemainingTime] = useState("1:00");

  useEffect(() => {
    const startTime = new Date().getTime();
    const endTime = startTime + 60 * 1000;

    const updateProgress = () => {
      const currentTime = new Date().getTime();
      const elapsedTime = endTime - currentTime;
      const remainingProgress = (elapsedTime / (60 * 1000)) * 100;

      setProgress(remainingProgress);

      const remainingMinutes = Math.floor(elapsedTime / (60 * 1000));
      const remainingSeconds = Math.floor((elapsedTime % (60 * 1000)) / 1000);

      setRemainingTime(
        `${remainingMinutes}:${
          remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`
      );

      if (remainingProgress <= 0) {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(updateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <CircularProgress variant="determinate" value={progress} size={20} />
      <Typography variant="h6" component="div" color="textSecondary">
        {remainingTime}
      </Typography>
    </div>
  );
}

export default CircularProgressOneMinute;
