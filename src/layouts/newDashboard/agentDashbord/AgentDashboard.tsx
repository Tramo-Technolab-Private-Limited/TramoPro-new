import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Divider,
  Grid,
  Modal,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import DonutView from "../Charts/DonutView";
import LineView from "../Charts/LineView";
import TransactionDeatails from "../TransactionDeatails";
import Scrollbar from "src/components/scrollbar";
import useResponsive from "src/hooks/useResponsive";
function AgentDashboard() {
  const isMobile = useResponsive("up", "sm");
  return (
    <>
      <Scrollbar
        sx={
          isMobile
            ? { maxHeight: window.innerHeight - 134 }
            : { maxHeight: window.innerHeight - 170 }
        }
      >
        <Stack width={"100%"} p={2} spacing={2}>
          <TransactionDeatails />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              transform: "scale(1)",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={5}>
                <Stack
                  sx={{
                    border: "1px dotted",
                    borderColor: "#C1C1C1",
                    borderRadius: 4,
                    borderWidth: 1,
                  }}
                >
                  <DonutView chartHeight="300" />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={7}>
                <Stack
                  sx={{
                    border: "1px dotted",
                    borderColor: "#C1C1C1",
                    borderRadius: 4,
                    borderWidth: 1,
                  }}
                >
                  <LineView chartHeight="300" />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Scrollbar>
    </>
  );
}

export default AgentDashboard;
