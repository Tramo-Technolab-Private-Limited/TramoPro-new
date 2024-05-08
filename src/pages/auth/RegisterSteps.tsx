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
  Stepper,
  Step,
  StepLabel,
  StepIconProps,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import * as React from "react";
import GovernanceForm from "../../sections/auth/RegistrationSteps/GovernanceForm";
import AadharForm from "../../sections/auth/RegistrationSteps/AadharForm";
import FinalVerificationForm from "../../sections/auth/RegistrationSteps/FinalVerificationForm";
import StepsLayout from "src/layouts/steps/StepsLayout";

import { useAuthContext } from "src/auth/useAuthContext";
import { STEP_DASHBOARD } from "src/routes/paths";
import { Check, Circle } from "@mui/icons-material";

const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#36B37E",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: "#784af4",
    }),
    "& .QontoStepIcon-completedIcon": {
      color: "#36B37E",
      zIndex: 1,
      fontSize: 10,
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: ownerState.active
        ? theme.palette.primary.main
        : "#eaeaf0",
    },
  })
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Circle className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

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
      <Stack display="flex" alignItems="center">
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
              Aadhaar{" "}
            </>
          )}
        </Typography>
      </Stack>
      <Stack sx={{ width: "100%" }} spacing={4}>
        <Stepper
          alternativeLabel
          activeStep={currentTab - 1}
          connector={<QontoConnector />}
        >
          {TABS.map((item) => (
            <Step key={item.id}>
              <StepLabel StepIconComponent={QontoStepIcon}>
                <Typography variant="subtitle1">{item.label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>

      <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
        <Box sx={{ width: "100%" }}>
          {/* <Tabs
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
          </Tabs> */}
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
