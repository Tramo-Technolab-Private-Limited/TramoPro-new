import { useEffect, useState } from "react";
// import { Grid, Container, Box, Stack, Typography } from '@mui/material';

// @mui
import { Tab, Tabs, Card, Box, Divider, Container } from "@mui/material";

import { useSnackbar } from "notistack";

// sections

import { responsiveFontSizes } from "src/theme/typography";
import Security from "../sections/Settings/Security";
import MPin from "../sections/Settings/NPin";
import Notification from "../sections/Settings/Notification";
import ComingSoonPage from "src/pages/ComingSoonPage";

// ----------------------------------------------------------------------

export default function Settings(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState("Security");

  const settingsCategory: any = [
    {
      id: 1,
      name: "Security",
    },

    {
      id: 2,
      name: "MPin",
    },

    {
      id: 2,
      name: "Apps & website",
    },
    {
      id: 3,
      name: "QR Code",
    },
    {
      id: 4,
      name: "Notifications",
    },
    {
      id: 4,
      name: "Settings & Privacy",
    },
  ];

  return (
    <>
      <h1
        style={{
          fontSize: "40px",
          width: "95%",
          margin: "30px auto",
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {currentTab}
      </h1>

      <Card style={{ padding: "0" }}>
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          sx={{ background: "#F4F6F8" }}
          onChange={(event, newValue) => setCurrentTab(newValue)}
        >
          {settingsCategory.map((tab: any) => (
            <Tab
              key={tab._id}
              sx={{ mx: 3 }}
              label={tab.name}
              value={tab.name}
            />
          ))}
        </Tabs>

        {settingsCategory.map(
          (tab: any) =>
            tab.name == currentTab && (
              <Box key={tab.name} sx={{ m: 3 }}>
                {currentTab == "Security" ? (
                  <Security />
                ) : currentTab == "Notifications" ? (
                  <Notification />
                ) : currentTab == "MPin" ? (
                  <MPin />
                ) : (
                  <ComingSoonPage />
                )}
              </Box>
            )
        )}
        <Divider />
      </Card>
    </>
  );
}
