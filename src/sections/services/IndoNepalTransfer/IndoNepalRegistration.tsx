import { Helmet } from "react-helmet-async";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import { paramCase } from "change-case";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import RechargeImg from "../../assets/Recharges/RechargeTopUp.png";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Upload } from "src/components/upload";
import { Icon } from "@iconify/react";

// import { Grid, Container, Box, Stack, Typography } from '@mui/material';

// @mui
import {
  Grid,
  TextField,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Card,
  Box,
  FormControl,
  Button,
  Radio,
  Accordion,
  AccordionDetails,
  Container,
  Stack,
  Typography,
  AccordionSummary,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  Link,
  CircularProgress,
  Hidden,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

//form
// import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import SuccessImage from "src/assets/icons/SuccessImage";
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
  RHFSelect,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
// import IndoNepalAddSender from './IndoNepalAddSender';

// ----------------------------------------------------------------------

type FormValuesProps = {
  remitterFirstName: string;
  remitterLastName: string;
  remitterMobileNumber: string;
  remitterAddress: string;
  remitterPincode: string;
  remitterDOB: string;
  remitterStateName: string;
  remitterStateCode: string;
  remitterOTP: string;
  BaccountNumber: string;
  BconfirmAccountNumber: string;
  Bifsc: string;
  beneName: string;
  BmobileNumber: string;
  BbankId: string;
  BgstState: string;
  BDOB: string;
  Baddress: string;
  Bpincode: string;
  fname: string;
  lname: string;
  payAmount: number;
  radiobuttonsgroup: string;
};

//--------------------------------------------------------------------

export default function IndoNepalRegistration(props: any) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [registrationStep, setRegistrationStep] = React.useState(false);
  const [success, setSuccess] = useState("upload");
  const steps = ["Add Sender", "Add Receiver", "Transaction"];

  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const uploadFile = acceptedFiles[0];
    setSuccess("upload");

    if (uploadFile) {
      setUploadFile(
        Object.assign(uploadFile, {
          preview: URL.createObjectURL(uploadFile),
        })
      );
    }
  }, []);
  const [uploadFile, setUploadFile] = useState<any>();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const DMTSchema = Yup.object().shape({});

  const defaultValues = {};

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const SenderRegistration = () => {};
  const uploadDoc = () => {};

  return (
    <>
      <Helmet>
        <title>Indo-nepal Registration </title>
      </Helmet>
      {registrationStep ? (
        <Box
          rowGap={3}
          columnGap={10}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            // sm: '0.2fr 0.8fr',
          }}
        >
          <Grid>
            <Typography sx={{ color: "#00AB55", fontSize: "1.3em" }}>
              You are not registeredfor Indo Nepal Transfer ! Register Now !
            </Typography>
            <Typography sx={{ color: "red" }}>
              One time registration Charges applicable : 200 Rs.{" "}
            </Typography>
            <Typography>will be debited from Main Wallet.</Typography>
            <Grid>
              <Box
                display="grid"
                width={{
                  xs: "100%",
                  sm: "50%",
                }}
              >
                <SuccessImage style={{ marginBottom: "50px" }} />
              </Box>
            </Grid>
            <Stack flexDirection={"row"} alignItems={"center"}>
              <Checkbox
                {...label}
                defaultChecked
                sx={{ color: "rgba(3, 81, 171)" }}
              />
              I agree to share my details to register for Indo -Nepal Transfer
              service.
            </Stack>
            <Button variant="contained"> Register Now </Button>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {activeStep === 0 ? (
                <FormProvider
                  methods={methods}
                  onSubmit={handleSubmit(SenderRegistration)}
                >
                  <Card>
                    <Accordion
                      expanded={expanded === "panel1"}
                      onChange={handleChange("panel1")}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                        sx={{ p: 2, background: "#F4F6F8" }}
                      >
                        <Typography>Sender Registration</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid sx={{ position: "relative", px: 2 }}>
                          <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                              xs: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                          >
                            <RHFTextField
                              type="text"
                              name="firstname"
                              label="First Name"
                              placeholder="First Name"
                            />
                            <RHFTextField
                              type="text"
                              name="middlename"
                              label="Middle Name"
                              placeholder="Middle Name"
                            />
                            <RHFTextField
                              type="text"
                              name="lastname"
                              label="Last Name"
                              placeholder="Last Name"
                            />
                            <RHFTextField
                              type="text"
                              name="mothername"
                              label="Mother Name"
                              placeholder="Mother Name"
                            />
                            <RHFTextField
                              type="text"
                              name="fathername"
                              label="Father Name"
                              placeholder="Father Name"
                            />
                            <TextField
                              type="number"
                              name="mobilenumber"
                              label="Mobile Number"
                              placeholder="Mobile Number"
                            />
                            <RHFSelect
                              type="text"
                              name="nationality"
                              label="Nationality"
                              placeholder="Nationality"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="Indian">Indian</MenuItem>
                              <MenuItem value="Nepalese">Nepalese</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="maritalstatus"
                              label="Marital Status"
                              placeholder="Marital Status"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="single">Single</MenuItem>
                              <MenuItem value="married">Married</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="gender"
                              label="Gender"
                              placeholder="Gender"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="male">Male</MenuItem>
                              <MenuItem value="female">Female</MenuItem>
                            </RHFSelect>
                            <RHFTextField
                              type="date"
                              name="dob"
                              label="Date Of Birth"
                              placeholder="Date Of Birth"
                              InputLabelProps={{ shrink: true }}
                            />
                            <span></span>
                            <span></span>
                            <RHFTextField
                              type="text"
                              name="pstate"
                              label="Permanent State"
                              placeholder="Permanent State"
                            />
                            <RHFTextField
                              type="text"
                              name="pdist"
                              label="Permanent Distt."
                              placeholder="Permanent Distt."
                            />
                            <RHFTextField
                              fullWidth
                              multiline
                              rows={3}
                              type="text"
                              name="paddress"
                              label="Permanent address"
                              placeholder="Permanent address."
                            />
                            <RHFTextField
                              type="text"
                              name="cstate"
                              label="Current State"
                              placeholder="Current State"
                            />
                            <RHFTextField
                              type="text"
                              name="cdist"
                              label="Current Distt."
                              placeholder="Current Distt."
                            />
                            <RHFTextField
                              fullWidth
                              multiline
                              rows={3}
                              type="text"
                              name="caddress"
                              label="Current Address"
                              placeholder="Current Address"
                            />
                            <span></span>
                            <span></span>
                          </Box>
                          <Stack alignItems={"center"} my={2}>
                            <Button
                              size="medium"
                              type="submit"
                              variant="contained"
                            >
                              Submit
                            </Button>
                          </Stack>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                  <Card sx={{ my: 3 }}>
                    <Accordion
                      expanded={expanded === "panel2"}
                      onChange={handleChange("panel2")}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                        sx={{ p: 2, background: "#F4F6F8" }}
                      >
                        <Typography>
                          Customer Due Diligence Information
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid sx={{ position: "relative", p: 2 }}>
                          <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                              xs: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                          >
                            <RHFSelect
                              type="text"
                              name="sourceoffund"
                              label="Source Of Fund"
                              placeholder="Source Of Fund"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="...">...</MenuItem>
                              <MenuItem value="...">...</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="occupation"
                              label="Occupation"
                              placeholder="Occupation"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="government">Govt. Job</MenuItem>
                              <MenuItem value="provate">Private Job</MenuItem>
                            </RHFSelect>
                          </Box>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                  <Card sx={{ my: 3 }}>
                    <Accordion
                      expanded={expanded === "panel3"}
                      onChange={handleChange("panel3")}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3bh-content"
                        id="panel3bh-header"
                        sx={{ p: 2, background: "#F4F6F8" }}
                      >
                        <Typography>Id Proof</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid sx={{ position: "relative", p: 2 }}>
                          <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                              xs: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                          >
                            <RHFSelect
                              type="text"
                              name="proof"
                              label="Proof"
                              placeholder="Proof"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="...">...</MenuItem>
                              <MenuItem value="...">...</MenuItem>
                            </RHFSelect>
                            <RHFTextField
                              type="text"
                              name="proofidnumber"
                              label="Proof Id Number"
                              placeholder="Proof Id Number"
                            />
                            <span></span>
                            <RHFTextField
                              type="date"
                              name="issuedate"
                              label="Issue Date"
                              placeholder="Issue Date"
                              InputLabelProps={{ shrink: true }}
                            />
                            <RHFTextField
                              type="date"
                              name="expiredate"
                              label="Expiry Date"
                              placeholder="Expiry Date"
                              InputLabelProps={{ shrink: true }}
                            />
                            <span></span>
                            <Stack>
                              <Upload
                                file={uploadFile}
                                onDrop={handleDropSingleFile}
                                onDelete={() => setUploadFile(null)}
                              />
                              <Stack flexDirection={"row"} mt={2}>
                                {success == "upload" ? (
                                  <LoadingButton
                                    variant="contained"
                                    component="span"
                                    style={{ width: "fit-content" }}
                                    onClick={() => uploadDoc()}
                                  >
                                    Upload File
                                  </LoadingButton>
                                ) : success == "wait" ? (
                                  <LoadingButton
                                    variant="contained"
                                    loading
                                    component="span"
                                  >
                                    success
                                  </LoadingButton>
                                ) : (
                                  <LoadingButton
                                    variant="contained"
                                    component="span"
                                  >
                                    success
                                  </LoadingButton>
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                          <FormControlLabel
                            sx={{ mt: 2 }}
                            label="By clicking the checkbox I accept the below declaration"
                            control={
                              <Checkbox
                                {...label}
                                defaultChecked
                                sx={{ color: "rgba(3, 81, 171)" }}
                              />
                            }
                          />
                          <Stack sx={{ mx: 4 }}>
                            <Typography variant="body2">
                              1. The id document ha to be marked as ' original
                              seen by verified'.
                            </Typography>
                            <Typography variant="body2">
                              2. Retailer needs to put his stamp on the id
                              document copy.
                            </Typography>
                            <Typography variant="body2">
                              3. The id document needs to be posted to (postal
                              address) .
                            </Typography>
                          </Stack>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </FormProvider>
              ) : activeStep === 1 ? (
                <FormProvider
                  methods={methods}
                  onSubmit={handleSubmit(SenderRegistration)}
                >
                  <Card>
                    <Accordion
                      expanded={expanded === "panel2"}
                      onChange={handleChange("panel2")}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                        sx={{ p: 2, background: "#F4F6F8" }}
                      >
                        <Typography>Receiver Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid sx={{ p: 2 }}>
                          <Box
                            rowGap={3}
                            columnGap={2}
                            display="grid"
                            gridTemplateColumns={{
                              xs: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              lg: "repeat(3, 1fr)",
                            }}
                          >
                            <RHFTextField
                              type="text"
                              name="firstname"
                              label="First Name"
                              placeholder="First Name"
                            />
                            <RHFTextField
                              type="text"
                              name="middlename"
                              label="Middle Name"
                              placeholder="Middle Name"
                            />
                            <RHFTextField
                              type="text"
                              name="lastname"
                              label="Last Name"
                              placeholder="Last Name"
                            />
                            <RHFSelect
                              type="text"
                              name="relation"
                              label="Relationship"
                              placeholder="Relationship"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="father">Father</MenuItem>
                              <MenuItem value="mother">Mother</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="gender"
                              label="Gender"
                              placeholder="Gender"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="male">Male</MenuItem>
                              <MenuItem value="female">Female</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="country"
                              label="Country"
                              placeholder="Country"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="India">India</MenuItem>
                              <MenuItem value="Nepal">Nepal</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="state"
                              label="State"
                              placeholder="State"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="India">India</MenuItem>
                              <MenuItem value="Nepal">Nepal</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="district"
                              label="District"
                              placeholder="District"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="India">India</MenuItem>
                              <MenuItem value="Nepal">Nepal</MenuItem>
                            </RHFSelect>
                            <RHFSelect
                              type="text"
                              name="city"
                              label="City"
                              placeholder="City"
                              SelectProps={{
                                native: false,
                                sx: { textTransform: "capitalize" },
                              }}
                            >
                              <MenuItem value="India">India</MenuItem>
                              <MenuItem value="Nepal">Nepal</MenuItem>
                            </RHFSelect>
                            <RHFTextField
                              type="text"
                              name="pincode"
                              label="Pincode"
                              placeholder="Pincode"
                            />
                            <RHFTextField
                              fullWidth
                              multiline
                              rows={3}
                              type="text"
                              name="address"
                              label="Address"
                              placeholder="Address."
                            />
                            <FormControl>
                              <FormLabel>Pyment Type</FormLabel>
                              <RadioGroup
                                defaultValue="female"
                                name="radio-buttons-group"
                              >
                                <FormControlLabel
                                  value="cash"
                                  control={<Radio />}
                                  label="Cash Payout"
                                />
                                <FormControlLabel
                                  value="bank"
                                  control={<Radio />}
                                  label="Bank Deposite"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Box>
                          <Stack alignItems={"center"} my={2}>
                            <Button
                              size="medium"
                              type="submit"
                              variant="contained"
                            >
                              Submit
                            </Button>
                          </Stack>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                </FormProvider>
              ) : (
                <Typography>Transaction Page</Typography>
              )}
              <Typography sx={{ mt: 2, mb: 1 }}></Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1, fontSize: "18px" }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleNext} sx={{ fontSize: "18px" }}>
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Box>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
