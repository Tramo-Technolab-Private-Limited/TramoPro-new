import { Helmet } from "react-helmet-async";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import { paramCase } from "change-case";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import RechargeImg from "../../assets/Recharges/RechargeTopUp.png";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Scrollbar from "../../../components/scrollbar";
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
  RadioGroup,
  FormControlLabel,
  FormControl,
  Radio,
  FormLabel,
  MenuItem,
  styled,
  Modal,
  Card,
  Box,
  Table,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  Stack,
  Typography,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  Link,
  CircularProgress,
  Hidden,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";

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

export default function IndoNepalTransfer(props: any) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [progress, setprogress] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [success, setSuccess] = useState("upload");
  const [hide, sethide] = useState(false);
  const [senderDetail, setSenderDetail] = useState(false);

  const [ragistration, setRagistration] = useState(false);
  const [senderRagistration, setSenderRagistration] = useState(false);
  const [receiver, setReceiver] = useState(false);
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

  useEffect(() => {
    // navigate('/dashboard/IndoNepal')
  }, []);

  function checksender() {
    sethide(true);
    if (mobileNumber == "7505660766") {
      setSenderDetail(true);
    } else {
      setSenderDetail(false);
    }
  }

  function senderragistration() {
    setSenderRagistration(true);
  }

  const SenderRegistration = () => {};
  const uploadDoc = () => {};
  const addReceiver = () => {};

  return (
    <>
      <Helmet>
        <title>Indo-nepal Transfer </title>
      </Helmet>
      {ragistration ? (
        <FormProvider methods={methods}>
          <Typography>Use:- 7505660766(Registered user)</Typography>
          <Grid
            style={{
              display: "grid",
              gap: "20px",
              position: "relative",
            }}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
            }}
          >
            <Grid sx={{ position: "relative" }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  // sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField
                  style={{ marginTop: "20px" }}
                  type="number"
                  name="mobileNumber"
                  label="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </Box>
              <Box
                style={progress ? { display: "block" } : { display: "none" }}
              >
                <Icon
                  icon="material-symbols:person-search"
                  onClick={checksender}
                  style={{
                    right: "8px",
                    top: "29px",
                    position: "absolute",
                    width: "40px",
                    height: "40px",
                    color: "#00AB55",
                    cursor: "pointer",
                  }}
                />
                {/* <CircularProgress color="success" style={{
                                    right: '8px',
                                    top: '29px',
                                    position: 'absolute',
                                    width: '40px',
                                    height: '40px',
                                    color: '#00AB55',
                                    cursor: 'pointer'
                                }} /> */}
              </Box>
            </Grid>
            <Grid
              sx={{
                Width: "min-content",
                margin: "auto",
              }}
              style={
                hide ? { visibility: "visible" } : { visibility: "hidden" }
              }
            >
              <p style={{ margin: "0 auto 5px", fontWeight: 700 }}>
                Sender details fetch succesfully.
              </p>
              {senderDetail ? (
                <TableContainer component={Paper}>
                  <Scrollbar sx={{ scrollbarWidth: "thin" }}>
                    <Table size="small" aria-label="simple table">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, px: 0, width: "120px" }}
                            component="th"
                            scope="row"
                          >
                            Full Name
                          </TableCell>
                          <TableCell>Sharad Choudhary</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, px: 0, width: "120px" }}
                            component="th"
                            scope="row"
                          >
                            Contact Number
                          </TableCell>
                          <TableCell>7505660766</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, px: 0, width: "120px" }}
                            component="th"
                            scope="row"
                          >
                            KYC status
                          </TableCell>
                          <TableCell>Submitted</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 700, px: 0, width: "120px" }}
                            component="th"
                            scope="row"
                          >
                            Available Transaction
                          </TableCell>
                          <TableCell>8/12</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              ) : (
                <Button variant="contained" onClick={senderragistration}>
                  {" "}
                  Add Sender{" "}
                </Button>
              )}
            </Grid>
          </Grid>
        </FormProvider>
      ) : (
        <Container>
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
                <Checkbox {...label} defaultChecked color="success" />I agree to
                share my details to register for Indo -Nepal Transfer service.
              </Stack>
              <Button variant="contained"> Register Now </Button>
            </Grid>
          </Box>
        </Container>
      )}

      {senderRagistration ? (
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(SenderRegistration)}
        >
          <Card>
            <Stack sx={{ p: 2, background: "#F4F6F8" }}>
              Sender Registration
            </Stack>
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
                  sx={{ mb: 2 }}
                  type="number"
                  disabled
                  variant="filled"
                  label="Mobile Number"
                  value={mobileNumber}
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
              {/* <Box style={progress ? { display: 'block' } : { display: 'none' }}>
                                <CircularProgress color="success" style={{
                                    right: '8px',
                                    top: '29px',
                                    position: 'absolute',
                                    width: '40px',
                                    height: '40px',
                                    color: '#00AB55',
                                    cursor: 'pointer'
                                }} />
                            </Box> */}
            </Grid>
          </Card>
          <Card sx={{ my: 3 }}>
            <Stack sx={{ p: 2, background: "#F4F6F8" }}>
              Customer Due Diligence Information
            </Stack>
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
          </Card>
          <Card sx={{ my: 3 }}>
            <Stack sx={{ p: 2, background: "#F4F6F8" }}>Id Proof</Stack>
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
                      <LoadingButton variant="contained" component="span">
                        success
                      </LoadingButton>
                    )}
                  </Stack>
                </Stack>
              </Box>
              <FormControlLabel
                sx={{ mt: 2 }}
                label="By clicking the checkbox I accept the below declaration"
                control={<Checkbox {...label} defaultChecked color="success" />}
              />
              <Stack sx={{ mx: 4 }}>
                <Typography variant="body2">
                  1. The id document ha to be marked as ' original seen by
                  verified'.
                </Typography>
                <Typography variant="body2">
                  2. Retailer needs to put his stamp on the id document copy.
                </Typography>
                <Typography variant="body2">
                  3. The id document needs to be posted to (postal address) .
                </Typography>
              </Stack>
            </Grid>
          </Card>
          <Stack justifyContent={"center"} flexDirection={"row"}>
            <Button
              variant="contained"
              sx={{ mx: 2 }}
              onClick={() => setSenderRagistration(false)}
            >
              {" "}
              Submit
            </Button>
            <Button variant="contained"> Cancel</Button>
          </Stack>
        </FormProvider>
      ) : null}

      {/* <Button variant='contained' onClick={() => setReceiver(true)}> Add Receiver</Button>
            <FormProvider methods={methods} onSubmit={handleSubmit(addReceiver)}>
                <Card sx={{ my: 3 }}>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer component={Paper}>
                            <Scrollbar sx={{ height: 'fit-content', maxHeight: 300, scrollbarWidth: 'thin' }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Beneficiary ID</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Bank ID</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Bank Name</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Beneficiary Name</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>A/c No.</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>IFSC code</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Bank Type</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Verification</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        

                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>
                    </Paper>
                    {receiver ?
                        <Grid sx={{ p: 3 }}>
                            <Stack sx={{ p: 2, background: '#F4F6F8' }}>Receiver Details</Stack>
                            <Box
                                rowGap={3}
                                columnGap={2}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                    lg: 'repeat(3, 1fr)',
                                }}
                            >
                                <RHFTextField
                                    type="text"
                                    name="firstname"
                                    label="First Name"
                                    placeholder='First Name'
                                />
                                <RHFTextField
                                    type="text"
                                    name="middlename"
                                    label="Middle Name"
                                    placeholder='Middle Name'
                                />
                                <RHFTextField
                                    type="text"
                                    name="lastname"
                                    label="Last Name"
                                    placeholder='Last Name'
                                />
                                <RHFSelect
                                    type="text"
                                    name="relation"
                                    label="Relationship"
                                    placeholder='Relationship'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='father'>Father</MenuItem>
                                    <MenuItem value='mother'>Mother</MenuItem>
                                </RHFSelect>
                                <RHFSelect
                                    type="text"
                                    name="gender"
                                    label="Gender"
                                    placeholder='Gender'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='male'>Male</MenuItem>
                                    <MenuItem value='female'>Female</MenuItem>
                                </RHFSelect>
                                <RHFSelect
                                    type="text"
                                    name="country"
                                    label="Country"
                                    placeholder='Country'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='India'>India</MenuItem>
                                    <MenuItem value='Nepal'>Nepal</MenuItem>
                                </RHFSelect>
                                <RHFSelect
                                    type="text"
                                    name="state"
                                    label="State"
                                    placeholder='State'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='India'>India</MenuItem>
                                    <MenuItem value='Nepal'>Nepal</MenuItem>
                                </RHFSelect>
                                <RHFSelect
                                    type="text"
                                    name="district"
                                    label="District"
                                    placeholder='District'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='India'>India</MenuItem>
                                    <MenuItem value='Nepal'>Nepal</MenuItem>
                                </RHFSelect>
                                <RHFSelect
                                    type="text"
                                    name="city"
                                    label="City"
                                    placeholder='City'
                                    SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                                >
                                    <MenuItem value='India'>India</MenuItem>
                                    <MenuItem value='Nepal'>Nepal</MenuItem>
                                </RHFSelect>
                                <RHFTextField
                                    type="text"
                                    name="pincode"
                                    label="Pincode"
                                    placeholder='Pincode'
                                />
                                <RHFTextField
                                    fullWidth multiline rows={3}
                                    type="text"
                                    name="address"
                                    label="Address"
                                    placeholder='Address.'
                                />
                                <FormControl>
                                    <FormLabel>Pyment Type</FormLabel>
                                    <RadioGroup
                                        defaultValue="female"
                                        name="radio-buttons-group"
                                    >
                                        <FormControlLabel value="cash" control={<Radio />} label="Cash Payout" />
                                        <FormControlLabel value="bank" control={<Radio />} label="Bank Deposite" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <Stack alignItems={'center'} my={2}>
                                <Button
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    onClick={() => setReceiver(false)}
                                >
                                    Submit
                                </Button>
                            </Stack>
                        </Grid> : null}
                </Card>
            </FormProvider> */}
    </>
  );
}

// ----------------------------------------------------------------------
