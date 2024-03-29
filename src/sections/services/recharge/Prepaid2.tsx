import * as Yup from "yup";
import { useEffect, useState } from "react";
import React from "react";
import Image from "src/components/image/Image";
//image
import RechargeImg from "../../../../assets/Recharges/RechargeTopUp.png";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import Autocomplete from "@mui/material/Autocomplete";
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  TableRow,
  TableCell,
  TableContainer,
  FormHelperText,
  TextField,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { useSnackbar } from "notistack";
import Iconify from "../../../components/iconify";
import { Api } from "src/webservices";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import FormProvider, {
  RHFCodes,
  RHFSecureCodes,
} from "../../../components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Helmet } from "react-helmet-async";
// ----------------------------------------------------------------------

type FormValuesProps = {
  mobileNumber: string;
  Operator: string;
  Circle: string;
  Amount: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

export default function Prepaid1(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [confirm, setConfirm] = React.useState(false);
  const [operatorList, setOperatorList] = useState([]);
  const [planCurrentTab, setPlanCurrentTab] = useState("Roaming");
  const [loading, setLoading] = useState(true);

  const [Error, setError] = useState({
    oError: false,
    cError: false,
    mError: false,
    aError: false,
  });

  const [formValues, setFormValues] = useState({
    mobileNumber: "",
    circle: "",
    productName: "",
    operatorid: "",
    amount: "",
  });
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
    tabChange(planCurrentTab);
    browsePlan();
  };
  const handleClose = () => {
    setModalEdit(false);
  };

  const [open1, setModalEdit1] = React.useState(false);
  const openEditModal1 = () => {
    setModalEdit1(true);
  };
  const handleClose1 = () => {
    setModalEdit1(false);
  };

  const popUpClose = (val: any) => {
    setFormValues({ ...formValues, amount: val.rs });
    handleClose();
  };

  const [planList, setPlanList] = useState([]);
  const [tabsData, setTabsData] = useState({
    "3G/4G": [],
    COMBO: [],
    Romaing: [],
    TOPUP: [],
  });

  const rechargePageSchema = Yup.object().shape({
    // mobileNumber: Yup.string()
    //   .required('Mobile Number is required')
    //   .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
    //   .required('Mobile is required'),
    // Operator: Yup.string().required('Operator is required'),
    // Circle: Yup.string().required('Cicle is required'),
    // Amount: Yup.number().required('Amount is required'),
  });

  const OtpSchema = Yup.object().shape({
    otp1: Yup.string().required("Code is required"),
    otp2: Yup.string().required("Code is required"),
    otp3: Yup.string().required("Code is required"),
    otp4: Yup.string().required("Code is required"),
    otp5: Yup.string().required("Code is required"),
    otp6: Yup.string().required("Code is required"),
  });

  const defaultValues = {
    mobileNumber: "",
    Circle: "",
    Operator: "",
    amount: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(rechargePageSchema),
    defaultValues,
  });

  const defaultValues2 = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const method2 = useForm<FormValuesProps>({
    resolver: yupResolver(OtpSchema),
    defaultValues: defaultValues2,
  });

  const {
    register: otpForm,
    handleSubmit: handleOtpSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const TABS = [
    {
      value: "3G/4G",
      label: "3G/4G",
    },
    {
      value: "COMBO",
      label: "COMBO",
    },
    {
      value: "Romaing",
      label: "Romaing",
    },
    {
      value: "TOPUP",
      label: "TOPUP",
    },
  ];

  const circleList = [
    { id: 1, name: "DelhiNCR" },
    { id: 2, name: "Gujarat" },
    { id: 3, name: "Haryana" },
    { id: 4, name: "AndhraPradeshTelangana" },
    { id: 5, name: "Assam" },
    { id: 6, name: "BiharJharkhand" },
    { id: 7, name: "Chennai" },
    { id: 8, name: "HimachalPradesh" },
    { id: 9, name: "JammuKashmir" },
    { id: 10, name: "Karnataka" },
    { id: 11, name: "Kerala" },
    { id: 12, name: "Kolkata" },
    { id: 13, name: "MadhyaPradeshChhattisgarh" },
    { id: 14, name: "MaharashtraGoa" },
    { id: 15, name: "Mumbai" },
    { id: 16, name: "NorthEast" },
    { id: 17, name: "Orissa" },
    { id: 18, name: "Punjab" },
    { id: 19, name: "Rajasthan" },
    { id: 20, name: "TamilNadu" },
    { id: 21, name: "UPEast" },
    { id: 22, name: "UPWest" },
    { id: 23, name: "WestBengal" },
  ];

  function tabChange(val: any) {
    setPlanCurrentTab(val);
    if (val == "3G/4G") {
      setPlanList(tabsData["3G/4G"] || []);
    } else if (val == "COMBO") {
      setPlanList(tabsData.COMBO || []);
    } else if (val == "Romaing") {
      setPlanList(tabsData.Romaing || []);
    } else if (val == "TOPUP") {
      setPlanList(tabsData.TOPUP || []);
    }
  }

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    getProductFilter();
  }, []);

  useEffect(() => {
    if (formValues.mobileNumber.length == 10) {
      getRechargePlan();
    }
    console.log(formValues.mobileNumber.length);
  }, [formValues.mobileNumber]);

  useEffect(() => {
    if (formValues.operatorid !== "" && formValues.circle !== "") {
      browsePlan();
    }
    console.log("get detail", formValues);
  }, [formValues.operatorid, formValues.circle]);

  useEffect(() => {
    if (formValues.operatorid !== "") {
      setError({ ...Error, oError: false });
    }
    if (formValues.circle !== "") {
      setError({ ...Error, cError: false });
    }
    if (formValues.amount !== "") {
      setError({ ...Error, aError: false });
    }
    if (formValues.mobileNumber.length == 10) {
      setError({ ...Error, mError: false });
    }
    console.log(formValues);
  }, [formValues]);

  const getRechargePlan = () => {
    let token = localStorage.getItem("token");
    Api(
      `agents/v1/getOperator/${formValues.mobileNumber}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("==========>>getOperator Filter", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setFormValues({
            ...formValues,
            operatorid: Response.data.data.operatorid,
            productName: Response.data.data.productName,
            circle: Response.data.data.circle,
          });
          // setOperator(Response.data.data);
          console.log("=====getOperator filter code 200", Response.data.data);
        } else {
          console.log(
            "==============>>> getOperator mobile number",
            Response.massage
          );
        }
      }
    });
  };

  const getProductFilter = () => {
    let token = localStorage.getItem("token");
    let body = {
      category: props.supCategory._id,
      subcategory: props.category._id,
      productFor: "",
    };
    Api("product/product_Filter", "POST", body, token).then((Response: any) => {
      console.log("==========>>product Filter", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setOperatorList(Response.data.data);
          console.log("=====product filter code 200", Response.data.data);
        } else {
          console.log("==============>>> post mobile number", Response.massage);
        }
      }
    });
  };

  const browsePlan = () => {
    setLoading(false);
    let token = localStorage.getItem("token");
    let body = {
      circle: "UP West",
      operator: formValues.productName,
    };
    Api("agents/v1/get_plan", "POST", body, token).then((Response: any) => {
      console.log("==============>>> plans mobile Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data.response_code == 1) {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
          setTabsData(Response.data.data);
          setPlanCurrentTab("3G/4G");
          setLoading(true);
          console.log(
            "==============>>> plans mobile data",
            Response.data.data
          );
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const onSubmit = (data: FormValuesProps) => {
    if (formValues.operatorid == "") {
      setError({ ...Error, oError: true });
    }
    if (formValues.circle == "") {
      setError({ ...Error, cError: true });
    }
    if (formValues.amount == "") {
      setError({ ...Error, aError: true });
    }
    if (formValues.mobileNumber.length !== 10) {
      setError({ ...Error, mError: true });
    }
    (Error.oError && Error.cError && Error.aError && Error.mError) ||
      openEditModal1();
  };

  const formSubmit = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      OperatorId: formValues.operatorid,
      number: formValues.mobileNumber,
      amount: formValues.amount,
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    Api("agents/v1/doRechargeLTS", "POST", body, token).then(
      (Response: any) => {
        if (Response.data.code == 200) {
          enqueueSnackbar("Recharge : " + Response.data.data.status);
          handleClose1();
          console.log("==============>>> post mobile data message", Response);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          console.log(
            "==============>>> post mobile number",
            Response.data.message
          );
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Recharges | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4">Recharge your mobile</Typography>
        <Typography variant="body2"></Typography>
        <Stack gap={2} mt={2}>
          <Stack>
            <TextField
              error={Error.mError}
              label="Mobile Number"
              type="number"
              inputProps={{ pattern: "^[6-9]d{9}$" }}
              size="small"
              {...register("mobileNumber", {
                onChange: (e) =>
                  setFormValues({
                    ...formValues,
                    mobileNumber: e.target.value,
                  }),
                required: true,
                max: 10,
              })}
            />
            {Error.mError && (
              <FormHelperText error sx={{ pl: 2 }}>
                Please Enter Valid Mobile Number{" "}
              </FormHelperText>
            )}
          </Stack>
          <Stack flexDirection={"row"} gap={1}>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel
                id="demo-simple-select-helper-label"
                sx={Error.oError ? { color: "#FF5630" } : {}}
              >
                Operator
              </InputLabel>
              <Select
                error={Error.oError}
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                label="Operator"
                size="small"
                value={formValues.operatorid}
                {...register("Operator", {
                  // onChange: (e) => setFormValues({ ...formValues, operatorid: e.target.value }),
                  required: true,
                })}
              >
                {operatorList.map((item: any, index: any) => (
                  <MenuItem
                    key={item.id}
                    value={item.operatorid}
                    onClick={() =>
                      setFormValues({
                        ...formValues,
                        productName: item.productName,
                        operatorid: item.operatorid,
                      })
                    }
                  >
                    {item.productName}
                  </MenuItem>
                ))}
              </Select>
              {Error.oError && (
                <FormHelperText error>Please Select Operator</FormHelperText>
              )}
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel
                id="demo-simple-select-helper-label"
                sx={Error.cError ? { color: "#FF5630" } : {}}
              ></InputLabel>
              <Autocomplete
                id="demo-simple-select-helper"
                value={formValues.circle}
                onChange={(event, newValue) => {
                  setFormValues({ ...formValues, circle: newValue });
                }}
                options={circleList.map((item: any) => item.name)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Circle"
                    error={Error.cError}
                    helperText={Error.cError && "Please select a circle"}
                  />
                )}
              />
            </FormControl>
          </Stack>
          <Stack>
            <Grid style={{ position: "relative" }}>
              {loading ? (
                <p
                  style={{
                    height: "98%",
                    position: "absolute",
                    padding: "0 10px",
                    right: "0.5px",
                    top: "-14.5px",
                    background: "#f0f0f0",
                    fontWeight: "700",
                    fontSize: "15px",
                    alignItems: "center",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "0px 8px 8px 0",
                    cursor: "pointer",
                    zIndex: "1",
                  }}
                  onClick={openEditModal}
                >
                  Browse Plans
                </p>
              ) : (
                <Stack
                  style={{
                    height: "98%",
                    position: "absolute",
                    padding: "0 10px",
                    right: "0.5px",
                    top: "-1.5px",
                    fontWeight: "700",
                    fontSize: "15px",
                    alignItems: "center",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "0px 8px 8px 0",
                    cursor: "pointer",
                    zIndex: "1",
                  }}
                >
                  <CircularProgress sx={{ color: "red" }} />
                </Stack>
              )}

              <Stack>
                <TextField
                  error={Error.aError}
                  label="Amount"
                  size="small"
                  value={formValues.amount}
                  {...register("Amount", {
                    onChange: (e) =>
                      setFormValues({ ...formValues, amount: e.target.value }),
                    required: true,
                  })}
                />
              </Stack>
              {/* <RHFTextField
                type="number"
                name="Amount"
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              /> */}
            </Grid>
            {Error.aError && (
              <FormHelperText error sx={{ pl: 2 }}>
                Please Enter Recharge Amount
              </FormHelperText>
            )}
          </Stack>
        </Stack>
        <LoadingButton
          fullWidth
          size="small"
          type="submit"
          variant="contained"
          sx={{ mt: 5 }}
        >
          Submit
        </LoadingButton>
      </FormProvider>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          item
          // xs={12}
          // md={8}
          style={{
            position: "relative",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            height: "85%",
            outline: "none",
            background: "white",
            overflow: "auto",
            border: "16px 0 0 16px",
            scrollbarWidth: "none",
            cursor: "pointer",
            borderRadius: "20px",
          }}
        >
          <Scrollbar sx={{ scrollbarWidth: "thin" }}>
            <Card sx={{ p: 3 }}>
              <TableContainer
                sx={{ px: 1 }}
                style={{ borderBottom: "1px solid #BBBFBF" }}
              >
                <Card>
                  <Tabs
                    sx={{ background: "#F4F6F8" }}
                    value={planCurrentTab}
                    onChange={(event, newValue) => tabChange(newValue)}
                  >
                    {TABS.map((tab) => (
                      <Tab
                        key={tab.value}
                        sx={{ mx: 3 }}
                        label={tab.label}
                        value={tab.value}
                      />
                    ))}
                  </Tabs>
                </Card>

                <Grid>
                  {planList.map((item: any, index: any) => (
                    <TableContainer
                      sx={{ px: 1 }}
                      style={{ borderBottom: "1px solid #BBBFBF" }}
                      key={index}
                      onClick={() => popUpClose(item)}
                    >
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <TableCell
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                          sx={{ px: 0 }}
                          key={index}
                        >
                          Validity: {item.validity}
                        </TableCell>
                        <TableCell
                          style={{
                            boxShadow: "0px 1px 10px #BBBFBF",
                            borderRadius: "15px",
                          }}
                          sx={{ px: 2, py: 0, my: 2 }}
                          key={index}
                        >
                          <Iconify
                            width={15}
                            icon="material-symbols:currency-rupee"
                          />
                          {item.rs}
                        </TableCell>
                      </Stack>
                      <TableRow style={{ textAlign: "justify" }} key={index}>
                        {item.desc}
                      </TableRow>
                    </TableContainer>
                  ))}
                </Grid>
              </TableContainer>
            </Card>
          </Scrollbar>
        </Grid>
      </Modal>
      <Modal
        open={open1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider methods={method2} onSubmit={handleOtpSubmit(formSubmit)}>
          <Box
            sx={style}
            style={{ borderRadius: "20px" }}
            width={{ xs: "100%", sm: 450 }}
            minWidth={350}
          >
            <Typography variant="h4" textAlign={"center"}>
              Confirm Details
            </Typography>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Amount</Typography>
              <Typography variant="body1">{formValues.amount}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Operator</Typography>
              <Typography variant="body1">{formValues.productName}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">circle</Typography>
              <Typography variant="body1">{formValues.circle}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Mobile Number</Typography>
              <Typography variant="body1">{formValues.mobileNumber}</Typography>
            </Stack>
            {confirm && (
              <Stack
                alignItems={"center"}
                justifyContent={"space-between"}
                mt={2}
                gap={2}
              >
                <Typography variant="h4">Confirm NPIN</Typography>
                <RHFSecureCodes
                  keyName="otp"
                  inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                />
                {(!!error2.otp1 ||
                  !!error2.otp2 ||
                  !!error2.otp3 ||
                  !!error2.otp4 ||
                  !!error2.otp5 ||
                  !!error2.otp6) && (
                  <FormHelperText error sx={{ px: 2 }}>
                    Code is required
                  </FormHelperText>
                )}
                <Stack flexDirection={"row"} gap={1} mt={2}>
                  <LoadingButton
                    fullWidth
                    size="medium"
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Yes, Continue
                  </LoadingButton>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleClose1}
                  >
                    Close
                  </Button>
                </Stack>
              </Stack>
            )}
            {!confirm && (
              <Stack flexDirection={"row"} gap={1} mt={2}>
                <Button variant="contained" onClick={() => setConfirm(true)}>
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleClose1}
                >
                  Close
                </Button>
              </Stack>
            )}
          </Box>
        </FormProvider>
      </Modal>
    </>
  );
}
