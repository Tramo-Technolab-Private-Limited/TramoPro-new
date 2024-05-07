import * as Yup from "yup";
import { memo, useContext, useEffect, useReducer, useState } from "react";
import React from "react";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  CircularProgress,
  Box,
  FormHelperText,
  Button,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// components
import { useSnackbar } from "../../../components/snackbar";
import Iconify from "../../../components/iconify";
import { Api } from "src/webservices";
import FormProvider, {
  RHFCodes,
  RHFSecureCodes,
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Helmet } from "react-helmet-async";
import { SubCategoryContext } from "./Recharges";
import { CategoryContext } from "../../../pages/Services";
import { useAuthContext } from "src/auth/useAuthContext";
import MotionModal from "src/components/animate/MotionModal";
import { Icon } from "@iconify/react";
import { fetchLocation } from "src/utils/fetchLocation";
import CustomTransactionSlip from "src/components/customFunctions/CustomTransactionSlip";
import { sentenceCase } from "change-case";
import { fDateTime } from "src/utils/formatTime";
import successAnimation from "../../../components/JsonAnimations/success.json";
import Lottie from "lottie-react";

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
    "3G/4G": [],
    COMBO: [],
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
  const theme = useTheme();
  const { user, initialize } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const subCategoryContext: any = useContext(SubCategoryContext);
  const categoryContext: any = useContext(CategoryContext);
  const [isOperatorFetchLoading, setIsOperatorFetchLoading] = useState(false);

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
    tabChange("3G/4G");
  };
  const handleClose = () => setModal(false);

  const [open1, setModal1] = React.useState(false);
  const openModal1 = () => setModal1(true);
  const handleClose1 = () => {
    setModal1(false);
    reset(defaultValues);
    otpReset(defaultValues2);
  };

  const [responseOpen, setResponseOpen] = useState(false);
  const handleOpenResponse = () => setResponseOpen(true);
  const handleCloseResponse = () => setResponseOpen(false);

  const [isAnimation, setIsAnimation] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState<any>([]);
  const [planList, setPlanList] = useState([]);
  const [tabsData, setTabsData] = useState({
    "3G/4G": [],
    COMBO: [],
    Roaming: [],
    TOPUP: [],
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
    trigger,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
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
    { value: "3G/4G", label: "3G/4G" },
    { value: "COMBO", label: "COMBO" },
    { value: "Roaming", label: "Roaming" },
    { value: "TOPUP", label: "TOPUP" },
  ];

  const circleList = [
    { id: 1, name: "Delhi", value: "Delhi NCR" },
    { id: 2, name: "Gujarat", value: "Gujarat" },
    { id: 3, name: "Haryana", value: "Haryana" },
    {
      id: 4,
      name: "Andhra Pradesh",
      value: "Andhra Pradesh",
    },
    { id: 5, name: "Assam", value: "Assam" },
    { id: 6, name: "Bihar", value: "Bihar" },
    { id: 7, name: "Chennai", value: "Chennai" },
    { id: 8, name: "HimachalPradesh", value: "Himachal Pradesh" },
    { id: 9, name: "Jammu", value: "Jammu" },
    { id: 10, name: "Karnataka", value: "Karnataka" },
    { id: 11, name: "Kerala", value: "Kerala" },
    { id: 12, name: "Kolkata", value: "Kolkata" },
    {
      id: 13,
      name: "Chhattisgarh",
      value: "Chhattisgarh",
    },
    { id: 14, name: "Goa", value: "Goa" },
    { id: 15, name: "Maharashtra", value: "Maharashtra" },
    { id: 16, name: "NorthEast", value: "North East" },
    { id: 17, name: "Odisha", value: "Odisha" },
    { id: 18, name: "Punjab", value: "Punjab" },
    { id: 19, name: "Rajasthan", value: "Rajasthan" },
    { id: 20, name: "Tamil Nadu", value: "Tamil Nadu" },
    { id: 21, name: "Uttar Pradesh", value: "Uttar Pradesh" },
    // { id: 22, name: "UP West and Uttaranchal", value: "UP West" },
    { id: 23, name: "WestBengal", value: "West Bengal" },
    { id: 24, name: "Arunachal Pradesh", value: "Arunachal Pradesh" },
    { id: 25, name: "Jharkhand", value: "Jharkhand" },
    { id: 26, name: "Madhya Pradesh", value: "Madhya Pradesh" },
    { id: 27, name: "Manipur", value: "Manipur" },
    { id: 28, name: "Meghalaya", value: "Meghalaya" },
    { id: 29, name: "Mizoram", value: "Mizoram" },
    { id: 30, name: "Nagaland", value: "Nagaland" },
    { id: 31, name: "Sikkim", value: "Sikkim" },
    { id: 32, name: "Telangana", value: "Telangana" },
    { id: 33, name: "Tripura", value: "Tripura" },
    { id: 34, name: "Uttarakhand", value: "Uttarakhand" },
    {
      id: 35,
      name: "Andaman and Nicobar Islands",
      value: "Andaman and Nicobar Islands",
    },
    { id: 36, name: "Chandigarh", value: "Chandigarh" },
    { id: 37, name: "Dadra and Nagar Haveli", value: "Dadra and Nagar Haveli" },
    { id: 38, name: "Lakshadweep", value: "Lakshadweep" },
    { id: 39, name: "Puducherry", value: "Puducherry" },
    { id: 40, name: "Ladakh", value: "Ladakh" },
    { id: 41, name: "Kashmir", value: "Kashmir" },
    { id: 42, name: "Daman", value: "Daman" },
    { id: 43, name: "Diu", value: "Diu" },
  ];

  function tabChange(val: any) {
    setPlanCurrentTab(val);
    if (val == "3G/4G") {
      setPlanList(tabsData["3G/4G"] || []);
    } else if (val == "COMBO") {
      setPlanList(tabsData.COMBO || []);
    } else if (val == "Romaing") {
      setPlanList(tabsData.Roaming || []);
    } else if (val == "TOPUP") {
      setPlanList(tabsData.TOPUP || []);
    }
  }

  useEffect(() => {
    subCategoryContext?.subcategoryId &&
      subCategoryContext?.categoryId &&
      getProductFilter(
        subCategoryContext?.categoryId,
        subCategoryContext?.subcategoryId
      );
  }, [subCategoryContext?.subcategoryId]);

  useEffect(() => {
    setValue("mobileNumber", getValues("mobileNumber").slice(0, 10));
    getValues("mobileNumber").length > 0 && trigger("mobileNumber");
    if (watch("mobileNumber").length === 10) {
      getRechargePlan(getValues("mobileNumber"));
    }
  }, [watch("mobileNumber")]);

  useEffect(() => {
    if (getValues("operator") && getValues("circle")) browsePlan();
  }, [watch("operator") || watch("circle")]);

  const getRechargePlan = (val: string) => {
    let token = localStorage.getItem("token");
    setIsOperatorFetchLoading(true);

    Api(`agents/v1/getOperator/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setValue("operator", Response.data.data.operatorid);
            setValue("operatorName", Response.data.data.plan_operator);
            setValue("circle", Response.data.data.circle);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "warning" });
          }
          setIsOperatorFetchLoading(false);
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
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setOperatorList(Response.data.data);
        }
      }
    });
  };

  const browsePlan = async () => {
    planDispatch({ type: "PLAN_FETCH_REQUEST" });
    let token = localStorage.getItem("token");
    let body = {
      circle: circleList.filter((item: any) => {
        return item.value === getValues("circle");
      })[0]?.value,
      operator: getValues("operatorName"),
    };
    await fetchLocation();
    await Api("agents/v1/get_plan", "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            planDispatch({
              type: "PLAN_FETCH_SUCCESS",
              payload: Response.data.data,
            });
            setTabsData(Response.data.data);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
            planDispatch({
              type: "PLAN_FETCH_FAILURE",
              error: Response.data.message,
            });
          }
        }
      }
    );
  };

  const onSubmit = (data: FormValuesProps) => {
    openModal1();
  };

  const formSubmit = async (data: FormValuesProps) => {
    rechargeDispatch({ type: "RECHARGE_FETCH_REQUEST" });
    let token = localStorage.getItem("token");
    let body = {
      OperatorId: getValues("operator"),
      number: getValues("mobileNumber"),
      amount: getValues("amount"),
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    await fetchLocation();
    await Api("agents/v1/doRechargeLTS", "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar("Recharge : " + Response.data.data.status);
            rechargeDispatch({
              type: "RECHARGE_FETCH_SUCCESS",
              payload: Response.data.data,
            });
            if (Response.data.data.status == "success") {
              setIsAnimation(true);
              setTimeout(() => {
                setIsAnimation(false);
              }, 1800);
            }
            setTransactionDetail([Response.data.data]);
            handleOpenResponse();
            initialize();
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
            rechargeDispatch({ type: "RECHARGE_FETCH_FAILURE" });
          }
          handleClose1();
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
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
          <Stack sx={{ position: "relative" }}>
            <RHFTextField
              type="number"
              name="mobileNumber"
              label="Mobile Number"
              placeholder="Mobile Number"
              disabled={isOperatorFetchLoading}
            />
            {isOperatorFetchLoading && (
              <Icon
                icon="eos-icons:loading"
                color={theme.palette.primary.main}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 5,
                  height: 25,
                  width: 25,
                }}
              />
            )}
          </Stack>
          <Stack flexDirection={"row"} gap={1}>
            <RHFSelect
              name="operator"
              label="Operator"
              placeholder="Operator"
              disabled={isOperatorFetchLoading}
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
              disabled={isOperatorFetchLoading}
              SelectProps={{
                native: false,
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: "200px",
                    },
                  },
                },
                sx: { textTransform: "capitalize" },
              }}
            >
              {circleList.map((item: any, index: any) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
          <RHFTextField
            name="amount"
            label="Amount"
            type="number"
            placeholder="Amount"
            disabled={isOperatorFetchLoading}
            InputProps={{
              endAdornment: (
                <LoadingButton
                  variant="contained"
                  color="warning"
                  disabled={isOperatorFetchLoading}
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

      <MotionModal
        open={open}
        onClose={handleClose}
        width={{ xs: "95%", sm: "70%" }}
        sx={{
          maxHeight: "85%",
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
          <TableContainer>
            {planList.length ? (
              <>
                <Tabs
                  // sx={{ background: "#F4F6F8" }}
                  value={planCurrentTab}
                  variant="standard"
                  onChange={(event, newValue) => tabChange(newValue)}
                >
                  {TABS.map((tab) => (
                    <Tab key={tab.value} label={tab.label} value={tab.value} />
                  ))}
                </Tabs>
                <Grid>
                  {planList.map((item: any, index: any) => (
                    <TableContainer
                      style={{ borderBottom: "1px solid #BBBFBF" }}
                      key={index}
                    >
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        onClick={() => {
                          setValue("amount", item.rs + "");
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
              </>
            ) : (
              <Typography variant="h4" textAlign={"center"}>
                {" "}
                No Plans Found{" "}
              </Typography>
            )}
            <Stack flexDirection={"row"} justifyContent={"end"} my={2}></Stack>
          </TableContainer>
        </Scrollbar>
        <Button variant="contained" size="small" onClick={handleClose}>
          Close
        </Button>
      </MotionModal>
      <MotionModal open={open1} width={{ xs: "95%", md: 500 }}>
        <FormProvider methods={method2} onSubmit={handleOtpSubmit(formSubmit)}>
          <Typography variant="h4" textAlign={"center"}>
            Confirm Details
          </Typography>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Amount</Typography>
            <Typography variant="body1">{getValues("amount")}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Operator</Typography>
            <Typography variant="body1">{getValues("operatorName")}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">circle</Typography>
            <Typography variant="body1">{getValues("circle")}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Mobile Number</Typography>
            <Typography variant="body1">{getValues("mobileNumber")}</Typography>
          </Stack>
          <Stack
            alignItems={"center"}
            justifyContent={"space-between"}
            mt={2}
            gap={2}
          >
            <Typography variant="h4">Confirm TPIN</Typography>
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
        </FormProvider>
      </MotionModal>

      <MotionModal open={responseOpen} width={{ xs: "95%", md: 500 }}>
        {isAnimation && (
          <Stack sx={{ position: "absolute" }}>
            {" "}
            <Lottie animationData={successAnimation} />{" "}
          </Stack>
        )}
        <Stack flexDirection={"column"} alignItems={"center"}>
          <Typography variant="h3">
            Transaction {sentenceCase(rechargeState?.data?.status || "")}
          </Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Amount</Typography>
          <Typography variant="body1">
            ₹{rechargeState?.data?.amount}
          </Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Transaction Id</Typography>
          <Typography variant="body1">
            {rechargeState?.data?.transactionId}
          </Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Date</Typography>
          <Typography variant="body1">
            {fDateTime(rechargeState?.data?.createdAt)}
          </Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Client Ref Id</Typography>
          <Typography variant="body1">
            {rechargeState?.data?.clientRefId}
          </Typography>
        </Stack>{" "}
        <Stack flexDirection="row" gap={1}>
          <Button
            variant="contained"
            onClick={handleCloseResponse}
            sx={{ my: 3 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{ my: 3 }}
            onClick={() => setIsReceiptOpen(true)}
          >
            View Receipt
          </Button>
        </Stack>
      </MotionModal>
      <Modal
        open={isReceiptOpen}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <Grid
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "#ffffff",
              boxShadow: 4,
              p: 2,
              borderRadius: "20px",
              minWidth: { xs: "95%", md: 720 },
            }}
          >
            <Stack>
              <CustomTransactionSlip
                newRow={transactionDetail}
                handleCloseRecipt={() => setIsReceiptOpen(false)}
              />
            </Stack>
          </Grid>
        </>
      </Modal>
    </>
  );
}

export default memo(MobilePrepaid);
