import { memo, useContext, useEffect, useReducer, useState } from "react";
import React from "react";

// @mui
import {
  Grid,
  Card,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Tabs,
  Tab,
  TableRow,
  TableCell,
  TableContainer,
  Box,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { useSnackbar } from "../../../components/snackbar";
import Iconify from "../../../components/iconify";
import { Api } from "src/webservices";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFCodes,
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Helmet } from "react-helmet-async";
import { SubCategoryContext } from "./Recharges";
import { CategoryContext } from "../../../pages/Services";
import { useAuthContext } from "src/auth/useAuthContext";

// ----------------------------------------------------------------------

type FormValuesProps = {
  mobileNumber: string;
  operator: string;
  operatorName: string;
  circle: string;
  amount: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

const initialPlanState = {
  data: {
    "2G": [],
    "3G/4G": [],
    FULLTT: [],
    Roaming: [],
    TOPUP: [],
  },
  isLoading: false,
  error: null,
};

const initialRechargeState = {
  isLoading: false,
  data: {},
  message: "",
};

const Reducer = (state: any, action: any) => {
  switch (action.type) {
    case "PLAN_FETCH_REQUEST":
      return { ...state, isLoading: true };
    case "PLAN_FETCH_SUCCESS":
      return { ...state, data: action.payload, isLoading: false };
    case "PLAN_FETCH_FAILURE":
      return { ...state, error: action.error, isLoading: false };
    case "RECHARGE_FETCH_REQUEST":
      return { ...state, isLoading: true };
    case "RECHARGE_FETCH_SUCCESS":
      return { ...state, data: action.payload, isLoading: false };
    case "RECHARGE_FETCH_FAILURE":
      return { ...state, message: action.message, isLoading: false };
    default:
      return state;
  }
};

function MobilePrepaid() {
  const { user, UpdateUserDetail } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const subCategoryContext: any = useContext(SubCategoryContext);
  const categoryContext: any = useContext(CategoryContext);
  const [planState, planDispatch] = useReducer(Reducer, initialPlanState);
  const [rechargeState, rechargeDispatch] = useReducer(
    Reducer,
    initialRechargeState
  );

  const [operatorList, setOperatorList] = useState([]);
  const [planCurrentTab, setPlanCurrentTab] = useState("");

  const [open, setModal] = React.useState(false);
  const openModal = (val: any) => {
    setModal(true);
    tabChange("2G");
  };
  const handleClose = () => setModal(false);

  const [open1, setModal1] = React.useState(false);
  const openModal1 = () => setModal1(true);
  const handleClose1 = () => {
    setModal1(false);
    reset(defaultValues);
    otpReset(defaultValues2);
  };

  const [planList, setPlanList] = useState([]);
  const [tabsData, setTabsData] = useState({
    "2G": [],
    "3G/4G": [],
    Roaming: [],
    TOPUP: [],
    FULLTT: [],
  });

  const rechargePageSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .max(10),
    operator: Yup.string().required("Operator is required"),
    circle: Yup.string().required("Cicle is required"),
    amount: Yup.string().required("Amount is required"),
  });

  const defaultValues = {
    mobileNumber: "",
    circle: "",
    operator: "",
    amount: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(rechargePageSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const OtpSchema = Yup.object().shape({
    otp1: Yup.string().required("Code is required"),
    otp2: Yup.string().required("Code is required"),
    otp3: Yup.string().required("Code is required"),
    otp4: Yup.string().required("Code is required"),
    otp5: Yup.string().required("Code is required"),
    otp6: Yup.string().required("Code is required"),
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
    mode: "all",
  });

  const {
    reset: otpReset,
    register: otpForm,
    handleSubmit: handleOtpSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const TABS = [
    { value: "2G", label: "2G" },
    { value: "3G/4G", label: "3G/4G" },
    { value: "FULLTT", label: "FULLTT" },
    { value: "Roaming", label: "Roaming" },
    { value: "TOPUP", label: "TOPUP" },
  ];

  const circleList = [
    // { id: 1, name: "Delhi NCR", value: "Delhi NCR" },
    { id: 1, name: "Delhi", value: "Delhi NCR" },
    { id: 2, name: "Gujarat", value: "Gujarat" },
    { id: 3, name: "Haryana", value: "Haryana" },
    {
      id: 4,
      name: "AndhraPradeshTelangana",
      value: "Andhra Pradesh Telangana",
    },
    { id: 5, name: "Assam", value: "Assam" },
    { id: 6, name: "BiharJharkhand", value: "Bihar Jharkhand" },
    { id: 7, name: "Chennai", value: "Chennai" },
    { id: 8, name: "HimachalPradesh", value: "Himachal Pradesh" },
    { id: 9, name: "JammuKashmir", value: "Jammu Kashmir" },
    { id: 10, name: "Karnataka", value: "Karnataka" },
    { id: 11, name: "Kerala", value: "Kerala" },
    { id: 12, name: "Kolkata", value: "Kolkata" },
    {
      id: 13,
      name: "MadhyaPradeshChhattisgarh",
      value: "Madhya Pradesh Chhattisgarh",
    },
    { id: 14, name: "MaharashtraGoa", value: "Maharashtra Goa" },
    { id: 15, name: "Mumbai", value: "Mumbai" },
    { id: 16, name: "NorthEast", value: "North East" },
    { id: 17, name: "Orissa", value: "Orissa" },
    { id: 18, name: "Punjab", value: "Punjab" },
    { id: 19, name: "Rajasthan", value: "Rajasthan" },
    { id: 20, name: "TamilNadu", value: "Tamil Nadu" },
    { id: 21, name: "UPEast", value: "UP East" },
    { id: 22, name: "UP West and Uttaranchal", value: "UP West" },
    // { id: 22, name: "UP West", value: "UP West" },
    { id: 23, name: "WestBengal", value: "West Bengal" },
  ];

  function tabChange(val: any) {
    setPlanCurrentTab(val);
    if (val == "3G/4G") {
      setPlanList(tabsData["2G"] || []);
    } else if (val == "2G") {
      setPlanList(tabsData["3G/4G"] || []);
    } else if (val == "FULLTT") {
      setPlanList(tabsData.FULLTT || []);
    } else if (val == "Roaming") {
      setPlanList(tabsData.Roaming || []);
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
    subCategoryContext &&
      getProductFilter(categoryContext._id, subCategoryContext);
  }, [subCategoryContext]);

  useEffect(() => {
    if (watch("mobileNumber").length === 10) {
      getRechargePlan(getValues("mobileNumber"));
    }
  }, [watch("mobileNumber")]);

  useEffect(() => {
    if (getValues("operator") && getValues("circle")) browsePlan();
  }, [watch("operator") || watch("circle")]);

  const getRechargePlan = (val: string) => {
    let token = localStorage.getItem("token");
    Api(`agents/v1/getOperator/${val}`, "GET", "", token).then(
      (Response: any) => {
        console.log("==========>>getOperator Filter", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setValue("operator", Response.data.data.operatorid);
            setValue("operatorName", Response.data.data.plan_operator);
            setValue("circle", Response.data.data.circle);
            console.log("=====getOperator filter code 200", Response.data.data);
          } else {
            console.log(
              "==============>>> getOperator mobile number",
              Response.massage
            );
          }
        }
      }
    );
  };

  const getProductFilter = (cateId: string, subCateId: string) => {
    let token = localStorage.getItem("token");
    let body = {
      category: cateId,
      subcategory: subCateId,
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
    planDispatch({ type: "PLAN_FETCH_REQUEST" });
    let token = localStorage.getItem("token");
    let body = {
      circle: circleList.filter((item: any) => {
        return item.name === getValues("circle");
      })[0]?.value,

      // circle: getValues("circle"),
      operator: getValues("operatorName"),
    };
    Api("agents/v1/get_plan", "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          planDispatch({
            type: "PLAN_FETCH_SUCCESS",
            payload: Response.data.data,
          });
          setTabsData(Response.data.data);
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message);
          planDispatch({
            type: "PLAN_FETCH_FAILURE",
            error: Response.data.message,
          });
        }
      }
    });
  };

  const onSubmit = (data: FormValuesProps) => {
    openModal1();
  };

  const formSubmit = (data: FormValuesProps) => {
    rechargeDispatch({ type: "RECHARGE_FETCH_REQUEST" });
    let token = localStorage.getItem("token");
    let body = {
      OperatorId: getValues("operator"),
      number: getValues("mobileNumber"),
      amount: getValues("amount"),
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    Api("agents/v1/doRechargeLTS", "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar("Recharge : " + Response.data.data.status);
            rechargeDispatch({
              type: "RECHARGE_FETCH_SUCCESS",
              payload: Response.data.data,
            });
            UpdateUserDetail({
              main_wallet_amount:
                Response?.data?.data?.agentDetails?.newMainWalletBalance,
            });
            handleClose1();
          } else {
            enqueueSnackbar(Response.data.message);
            rechargeDispatch({ type: "RECHARGE_FETCH_FAILURE" });
          }
        } else {
          enqueueSnackbar("Failed");
          rechargeDispatch({ type: "RECHARGE_FETCH_FAILURE" });
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
        <Stack gap={2} mt={2}>
          <RHFTextField
            type="number"
            name="mobileNumber"
            label="Mobile Number"
            placeholder="Mobile Number"
          />
          <Stack flexDirection={"row"} gap={1}>
            <RHFSelect
              name="operator"
              label="Operator"
              placeholder="Operator"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {operatorList.map((item: any, index: any) => (
                <MenuItem
                  key={item.operatorid}
                  value={item.operatorid}
                  onClick={() => setValue("operatorName", item.productName)}
                >
                  {item.productName}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              name="circle"
              label="Circle"
              placeholder="Circle"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {circleList.map((item: any, index: any) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
          <RHFTextField
            name="amount"
            label="Amount"
            placeholder="amount"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
              endAdornment: (
                <LoadingButton
                  variant="contained"
                  color="warning"
                  loading={planState.isLoading}
                  onClick={openModal}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Browse Plan
                </LoadingButton>
              ),
            }}
          />
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
            <TableContainer
              sx={{ p: 3 }}
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
                  >
                    <Stack
                      flexDirection={"row"}
                      justifyContent={"space-between"}
                      onClick={() => {
                        setValue("amount", item.rs);
                        handleClose();
                      }}
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
              <Typography variant="body1">{getValues("amount")}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Operator</Typography>
              <Typography variant="body1">
                {getValues("operatorName")}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">circle</Typography>
              <Typography variant="body1">{getValues("circle")}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Mobile Number</Typography>
              <Typography variant="body1">
                {getValues("mobileNumber")}
              </Typography>
            </Stack>
            <Stack
              alignItems={"center"}
              justifyContent={"space-between"}
              mt={2}
              gap={2}
            >
              <Typography variant="h4">Confirm NPIN</Typography>
              <RHFCodes
                keyName="otp"
                inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                type="password"
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
            </Stack>
            <Stack flexDirection={"row"} gap={1} mt={2}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={rechargeState.isLoading}
              >
                Confirm
              </LoadingButton>
              <LoadingButton
                variant="contained"
                color="warning"
                onClick={handleClose1}
              >
                Close
              </LoadingButton>
            </Stack>
            {/* )} */}
          </Box>
        </FormProvider>
      </Modal>
    </>
  );
}

export default memo(MobilePrepaid);
