import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @mui
import {
  Stack,
  Alert,
  Typography,
  Link,
  styled,
  Container,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import * as React from "react";
import GovernanceForm from "../../sections/auth/RegistrationSteps/GovernanceForm";
import AadharForm from "../../sections/auth/RegistrationSteps/AadharForm";
import FinalVerificationForm from "../../sections/auth/RegistrationSteps/FinalVerificationForm";
import StepsLayout from "src/layouts/steps/StepsLayout";
import { Api } from "../../webservices";
import { useAuthContext } from "src/auth/useAuthContext";
import { STEP_DASHBOARD } from "src/routes/paths";

export default function RegisterSteps() {
  const navigate = useNavigate();
  const { user, UpdateUserDetail, initialize } = useAuthContext();
  const [currentTab, setCurrentTab] = useState(1);

  const TABS = [
    { id: 1, label: "PERSONAL IDENTIFICATION" },
    { id: 2, label: "CONSTITUTION'S DETAILS" },
    { id: 3, label: "UPLOAD DOCUMENTS" },
  ];

  function changeTab(val: number) {
    setCurrentTab(val);
  }

  useEffect(() => {
    if (user?.finalStatus === "approved") {
      navigate(STEP_DASHBOARD.esignature);
    }
    if (user?.is_CID_Docs && user?.is_PID_Docs) {
      setCurrentTab(3);
    } else if (
      user?.isAadhaarVerified &&
      !user?.isPANVerified! &&
      user?.isGSTVerified
    ) {
      setCurrentTab(1);
    } else if (user?.isPANVerified && !user?.isGSTVerified) {
      setCurrentTab(2);
    } else if (user?.isGSTVerified) {
      setCurrentTab(3);
    }
  }, [user]);

  useEffect(() => {
    initialize();
  }, [currentTab]);

  return (
    <Container>
      <Typography variant="h3" paragraph>
        {user?.isAadhaarVerified && !user?.isPANVerified ? (
          <Stack justifyContent={"center"}>
            {" "}
            Great! Now let’s verify your PAN
          </Stack>
        ) : user?.isAadhaarVerified &&
          user?.isPANVerified &&
          user?.isGSTVerified ? (
          <Stack justifyContent={"center"}>Upload your KYC Documents</Stack>
        ) : user?.isAadhaarVerified && user?.isPANVerified ? (
          <>Now, Let’s verify your Business Details </>
        ) : (
          <>
            Welcome to {process.env.REACT_APP_COMPANY_NAME}, Let’s verify your
            Aadhar{" "}
          </>
        )}
      </Typography>

      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={currentTab}
            aria-label="basic tabs example"
            // onChange={(event, newValue) => setCurrentTab(newValue)}
          >
            {TABS.map((tab: any) => (
              <Tab
                key={tab.id}
                sx={{ mx: 3 }}
                label={tab.label}
                value={tab.id}
                disabled={user?.is_CID_Docs && user?.is_PID_Docs}
              />
            ))}
          </Tabs>
          <Box mt={2}>
            {currentTab == 1 ? (
              <AadharForm callBack={changeTab} />
            ) : currentTab == 2 ? (
              <GovernanceForm callBack={changeTab} />
            ) : currentTab == 3 ? (
              <FinalVerificationForm />
            ) : null}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
