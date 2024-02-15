import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Stack,
  Button,
  Alert,
  MenuItem,
  Typography,
  Grid,
  useTheme,
} from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "../../../components/hook-form";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Api } from "src/webservices";
import { Icon } from "@iconify/react";
import Image from "src/components/image/Image";
import GSTImage from "src/assets/Onboarding/GSTImage.png";
import NotGSTImage from "src/assets/Onboarding/NotGSTImage.png";
import { useSnackbar } from "notistack";
import { useAuthContext } from "src/auth/useAuthContext";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
// ----------------------------------------------------------------------

type FormValuesProps = {
  gst: string;
  pan: string;
  afterSubmit?: string;
  BusinessName: string;
  address: string;
  stateJurisdiction: string;
  panNumber: string;
  ShopName: string;
  taxpayerType: string;
  Status: string;
  gstNumber: string;
};

function a11yProp2(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function GovernanceForm(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { user, UpdateUserDetail } = useAuthContext();
  const [gstDeatil, setGstDetail] = React.useState({
    company_name: "",
    state_jurisdiction: "",
    taxpayer_type: "",
    pan_number: "",
    gst_number: "",
    constitution_type: "",
    status: "",
    address: "",
  });
  const [radioVal, setRadioVal] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [remainingAttempt, setRemainingAttempt] = React.useState(null);
  const [valueTabs, setvalueTabs] = React.useState(0);
  const [verifyDetail, setVerifyDetail] = React.useState(false);
  const [gstData, setGstData] = React.useState(false);
  const stateName = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
    "Ladakh",
    "Jammu",
    "Kashmir",
    "Daman",
    "Diu",
  ];
  const GovernanceSchema = Yup.object().shape({
    // gst: Yup.number().required('GST Number required').test('len', 'Enter Valid 15-digits GST Number', (val:any) => val.toString().length == 15),

    gst:
      valueTabs == 0 || radioVal !== "Individual"
        ? Yup.string()
            .matches(
              /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})$/,
              "Invalid GST Number"
            )
            .required("GST Number is required")
            .uppercase()
        : Yup.string(),
  });

  const OtpSchema = Yup.object().shape({
    BusinessName: Yup.string().required("Business Name is required"),
    address: Yup.string().required("Address is required"),
    stateJurisdiction: Yup.string().required("State is required"),
    ShopName:
      radioVal == "Individual" && !user?.isGSTVerified
        ? Yup.string().required("State is required")
        : Yup.string(),
    panNumber:
      radioVal !== "Individual"
        ? Yup.string()
            .required("PAN Card Number required")
            .uppercase()
            .matches(/[0-9]/, "Enter valid PAN")
            .matches(/[A-Z]/, "Enter valid PAN")
            .max(10)
            .length(10, "Enter Valid PAN Number")
        : Yup.string(),
  });

  const defaultValues = {
    gst: user?.GSTNumber ? user?.GSTNumber : "",
  };

  const defaultValues2 = {
    BusinessName: "",
    address: "",
    stateJurisdiction: "",
    panNumber: "",
    ShopName: "",
    Status: "",
    taxpayerType: "",
    gstNumber: "",
  };

  const method2 = useForm<FormValuesProps>({
    mode: "onChange",
    resolver: yupResolver(OtpSchema),
    defaultValues: defaultValues2,
  });

  const methods = useForm<FormValuesProps>({
    mode: "onChange",
    resolver: yupResolver(GovernanceSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const {
    reset,
    setError,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
      let isGST;
      if (valueTabs == 0) {
        isGST = true;
      } else {
        isGST = false;
      }
      let token = localStorage.getItem("token");
      const body = {
        GST_Number: data.gst,
      };
      await Api(`user/KYC/Verify_GST`, "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);

              console.log("GST MESSAGE ....................", Response);
              setGstDetail(Response.data.resData);
              setRemainingAttempt(Response.data.remaining_Attempts);

              setRadioVal(Response.data.resData.constitution_type);
              // localStorage.setItem('legalname', Response.data.KYCStatus.body.kycResult.legalName);

              localStorage.setItem(
                "company_name",
                Response.data.resData.company_name
              );
              localStorage.setItem("pan", Response?.data?.resData?.pan_number);

              localStorage.setItem("gst", Response.data.resData.gst_number);
              localStorage.setItem(
                "address",
                Response.data.resData.state_jurisdiction
              );
              localStorage.setItem(
                "taxpayer",
                Response.data.resData.taxpayer_type
              );
              localStorage.setItem("status", Response.data.resData.status);
              localStorage.setItem(
                "constition",
                Response.data.resData.constitution_type
              );
              localStorage.setItem("address", Response.data.resData.address);
              setVerifyDetail(true);
              setLoading(false);
            } else {
              enqueueSnackbar(Response.data.message);
              setLoading(false);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  const formSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    if (radioVal !== "") {
      let body = {
        business_name: data.BusinessName,
        state_jurisdiction: data.stateJurisdiction,
        taxpayer_type: data.taxpayerType,

        // pan_number: data.panNumber,
        // gst_number: data.gstNumber,
        company_name: data.ShopName,
        status: data.Status,
        userId: user?._id,
        constitution_type: radioVal,
        last_gst_filing_status: "",
        isGST: !valueTabs,
      };
      Api("user/KYC/save_data", "POST", body, token).then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            props.callBack(3);
            localStorage.setItem("legalname", data.BusinessName);
            localStorage.setItem("statej", data.stateJurisdiction);
            localStorage.setItem("taxpayer", data.taxpayerType);
            localStorage.setItem("PANnumber", data.pan);
            localStorage.setItem("gst", data.gstNumber);
            localStorage.setItem("address", data.address);
            localStorage.setItem("status", data.Status);
            localStorage.setItem("constition", radioVal);
            UpdateUserDetail({
              company_name: data.BusinessName,
              GSTNumber: data.gstNumber,
              isGSTVerified: true,
              isGST: !valueTabs,
              constitutionType: radioVal,
            });
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      });
    } else {
      enqueueSnackbar("Please select Constitution Type", { variant: "error" });
    }
  };

  const confirmDetail = () => {
    let token = localStorage.getItem("token");

    if (!user?.isGSTVerified) {
      let body = {
        // business_name: gstDeatil.legalName,
        state_jurisdiction: gstDeatil.state_jurisdiction,
        // taxpayer_type: gstDeatil.constitution_type,
        // address: gstDeatil.address,
        // pan_number: gstDeatil.pan_number,

        company_name: gstDeatil.company_name,
        gst_number: gstDeatil.gst_number,
        status: gstDeatil.status,
        userId: user?._id,
        constitution_type: gstDeatil.constitution_type,
        last_gst_filing_status: "",
        isGST: !valueTabs,
      };
      Api("user/KYC/save_data", "POST", body, token).then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setVerifyDetail(false);
            UpdateUserDetail({
              isGSTVerified: true,
              GSTNumber: gstDeatil.gst_number,
              isGST: !valueTabs,
            });
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      });
    } else {
      props.callBack(3);
    }
  };

  const handleChangePanel2 = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };

  const handleChangeRadio = (
    event: React.SyntheticEvent,
    myValue: string | ""
  ) => {
    setRadioVal(myValue);
  };

  const HandleClearGST = () => {
    setVerifyDetail(false);
    reset(gstDeatil);
  };

  const SaveGstData = () => {
    setGstData(true);
  };
  const ClearGstData = () => {
    reset(defaultValues2);
    setGstData(false);
    setRadioVal("");
  };

  return (
    <Stack spacing={2.5}>
      {!!errors.afterSubmit && (
        <Alert severity="error">{errors.afterSubmit.message}</Alert>
      )}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 0, borderColor: "divider" }}>
          <Tabs value={valueTabs} onChange={handleChangePanel2}>
            {user?.isGST == null || !user?.isGST ? (
              <Tab
                style={{
                  minHeight: "40px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette.primary.main}`,
                  padding: "0 10px",
                  color: theme.palette.primary.main,
                  marginRight: "20px",
                }}
                label="I have GST Number"
                {...a11yProp2(0)}
              />
            ) : null}
            {user?.isGST == null || !user?.isGST ? (
              <Tab
                style={{
                  minHeight: "40px",
                  borderRadius: "4px",
                  border: `1px solid 1px solid ${theme.palette.primary.main}`,
                  padding: "0 10px",
                  color: theme.palette.primary.main,
                  marginRight: "20px",
                }}
                label="I don't have GST Number"
                {...a11yProp2(1)}
              />
            ) : null}
          </Tabs>
        </Box>
        {valueTabs == 0 ? (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            {!user?.isGSTVerified && (
              <>
                <Stack
                  flexDirection={"row"}
                  gap={2}
                  width={{ xs: "100%", sm: "80%", md: "60%", lg: "35%" }}
                >
                  <RHFTextField
                    name="gst"
                    label="GST Number"
                    disabled={user?.isGSTVerified}
                    style={{ marginTop: "20px" }}
                  />
                </Stack>
                <Stack my={2} alignItems={"left"}>
                  {loading ? (
                    <ApiDataLoading />
                  ) : (
                    <>
                      <Stack
                        flexDirection={"row"}
                        gap={2}
                        width={{ xs: "100%", sm: "80%", md: "60%", lg: "35%" }}
                      >
                        <Button
                          variant="contained"
                          type="submit"
                          size="small"
                          fullWidth
                          disabled={watch("gst") == "" || verifyDetail}
                        >
                          Fetch
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={HandleClearGST}
                          disabled={watch("gst") == ""}
                        >
                          Clear
                        </Button>
                      </Stack>
                      <Stack mt={2}>
                        {verifyDetail && (
                          <Typography variant="h6">
                            Remaining Attempt : {remainingAttempt}
                          </Typography>
                        )}
                      </Stack>
                    </>
                  )}
                </Stack>
              </>
            )}
          </FormProvider>
        ) : (
          <>
            {gstData ? (
              <Stack
                alignItems={"center"}
                justifyContent={"center"}
                flexDirection={"row"}
                my={3}
                gap={1}
              >
                <Typography variant="h4" color="green">
                  Business Details Fetched Successfully
                </Typography>
                <Icon icon="el:ok" color="green" fontSize={25} />
              </Stack>
            ) : (
              ""
            )}

            <FormProvider
              methods={method2}
              onSubmit={handleFormSubmit(formSubmit)}
            >
              <Typography variant="subtitle1" mt={3}>
                Please select your constitution type
              </Typography>
              <FormControl sx={{ my: 2 }}>
                <RadioGroup
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={radioVal}
                  onChange={handleChangeRadio}
                >
                  <Stack flexDirection="row" gap={1}>
                    <FormControlLabel
                      value="Individual"
                      control={<Radio />}
                      label="Individual"
                    />
                    <FormControlLabel
                      value="Proprietorship"
                      control={<Radio />}
                      label="Proprietorship"
                    />
                    <FormControlLabel
                      value="Private Limited Company"
                      control={<Radio />}
                      label="Private Limited Company"
                    />
                    <FormControlLabel
                      value="Partnership"
                      control={<Radio />}
                      label="Partnership"
                    />
                  </Stack>
                  <Stack flexDirection="row" gap={1}>
                    <FormControlLabel
                      value="Limited Liability Partnership"
                      control={<Radio />}
                      label="Limited Liability Partnership"
                    />
                    <FormControlLabel
                      value="One Person Company"
                      control={<Radio />}
                      label="One Person Company"
                    />
                    <FormControlLabel
                      value="Limited Company"
                      control={<Radio />}
                      label="Limited Company"
                    />
                  </Stack>
                </RadioGroup>
              </FormControl>

              <>
                <Stack
                  gap={1}
                  width={{ xs: "100%", sm: "80%", md: "60%", lg: "45%" }}
                >
                  <RHFTextField
                    name="BusinessName"
                    label="Shop/Business Name"
                    disabled={gstData}
                  />

                  <RHFTextField
                    name="address"
                    label="Address"
                    disabled={gstData}
                  />

                  <Stack flexDirection="row" gap={2}>
                    <RHFTextField
                      name="BusinessName"
                      label="Village/City"
                      disabled={gstData}
                    />

                    <RHFTextField
                      name="address"
                      label="District"
                      disabled={gstData}
                    />
                  </Stack>
                  <Stack flexDirection="row" gap={2}>
                    <RHFSelect
                      name="stateJurisdiction"
                      label="Select State"
                      placeholder="Select State"
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                      sx={{ width: "100%", margin: "auto" }}
                      disabled={gstData}
                    >
                      {stateName.map((item: any) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </RHFSelect>

                    <RHFTextField
                      name="address"
                      label="PIN Code"
                      disabled={gstData}
                    />
                  </Stack>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <Stack my={3}>
                    <Button
                      variant="contained"
                      onClick={SaveGstData}
                      sx={{ margin: "auto" }}
                      disabled={gstData || radioVal == ""}
                    >
                      Save
                    </Button>
                  </Stack>
                  <Stack my={3}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{ margin: "auto" }}
                      disabled={!gstData}
                    >
                      continue
                    </Button>
                  </Stack>

                  <Stack my={3}>
                    <Button
                      variant="contained"
                      onClick={ClearGstData}
                      sx={{ margin: "auto" }}
                      disabled={!gstData}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </>
            </FormProvider>
          </>
        )}
        {user?.isGSTVerified ? (
          <>
            <Stack
              alignItems={"center"}
              justifyContent={"center"}
              flexDirection={"row"}
              my={3}
              gap={1}
            >
              <Typography variant="h4" color="green">
                GST Verified Successfully{" "}
              </Typography>
              <Icon icon="el:ok" color="green" fontSize={25} />
            </Stack>
            <Stack columnGap={10}>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  Company Name
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("company_name")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  GST number
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {gstDeatil.gst_number}
                </Typography>
              </Stack>

              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  Address
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("address")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  State Jurisdiction
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("statej")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  Taxpayer Type
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("taxpayer")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  constitution Of Business
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("constition")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle1" sx={{ width: 250 }}>
                  Status
                </Typography>
                <Typography variant="body1" textAlign={"end"}>
                  {localStorage.getItem("status")}
                </Typography>
              </Stack>
            </Stack>
            <Stack my={3}>
              <Button
                variant="contained"
                sx={{ margin: "auto" }}
                onClick={confirmDetail}
              >
                Confirm & continue
              </Button>
            </Stack>
          </>
        ) : (
          ""
        )}

        <Stack flexDirection="row" gap={5}>
          <Stack>
            {verifyDetail && (
              <>
                <Stack
                  justifyContent={"flex-start"}
                  flexDirection={"row"}
                  my={2}
                  gap={1}
                >
                  <Typography variant="h4" color="green">
                    GST Fetch Successfully{" "}
                  </Typography>
                  <Icon icon="el:ok" color="green" fontSize={25} />
                </Stack>
                <Stack columnGap={10}>
                  <Stack
                    flexDirection={"row"}
                    justifyContent="space-between"
                    width={{ xs: "100%", sm: "80%", md: "60%", lg: "100%" }}
                  >
                    <Typography variant="subtitle1">
                      Company Name
                      <Typography variant="body1">
                        {gstDeatil.company_name}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle1">
                      GST number
                      <Typography variant="body1">
                        {" "}
                        {gstDeatil.gst_number}{" "}
                      </Typography>
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection={"row"}
                    justifyContent="space-between"
                    width={{ xs: "100%", sm: "80%", md: "60%", lg: "100%" }}
                  >
                    <Typography variant="subtitle1">
                      State Jurisdiction
                      <Typography variant="body1">
                        {gstDeatil.state_jurisdiction}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle1">
                      constitution Of Business
                      <Typography variant="body1">
                        {" "}
                        {gstDeatil.constitution_type}{" "}
                      </Typography>
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection={"row"}
                    justifyContent="space-between"
                    width={{ xs: "100%", sm: "80%", md: "60%", lg: "100%" }}
                  >
                    <Typography variant="subtitle1">
                      Address
                      <Typography variant="body1">
                        {" "}
                        {gstDeatil.address}{" "}
                      </Typography>
                    </Typography>
                    <Typography variant="subtitle1">
                      Status
                      <Typography variant="body1">
                        {" "}
                        {gstDeatil.status}
                      </Typography>
                    </Typography>
                  </Stack>
                </Stack>
                <Stack my={5}>
                  <Button
                    variant="contained"
                    sx={{ margin: "auto" }}
                    onClick={confirmDetail}
                  >
                    Confirm & continue
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
          <Stack>
            <Image
              disabledEffect
              visibleByDefault
              alt="auth"
              src={GSTImage}
              sx={{
                width: "50%",
                marginTop: "50px",
                marginLeft: "250px",
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
