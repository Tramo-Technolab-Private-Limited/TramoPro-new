import * as Yup from "yup";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import React from "react";
import Image from "src/components/image/Image";
//image
import RechargeImg from "../../../../assets/Recharges/RechargeTopUp.png";
// form
import { useForm } from "react-hook-form";
import InputAdornment from "@mui/material/InputAdornment";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Button,
  FormHelperText,
  Divider,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { useSnackbar } from "../../../components/snackbar";
import { Api } from "src/webservices";
import FormProvider, {
  RHFCodes,
  RHFSecureCodes,
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import { Helmet } from "react-helmet-async";
import { SubCategoryContext } from "./Recharges";
import { CategoryContext } from "src/pages/Services";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------

type FormValuesProps = {
  mobileNumber: string;
  DTHNumber: string;
  operator: string;
  operator1: string;
  circle: string;
  amount: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

export default function DTH() {
  const subCategoryContext: any = useContext(SubCategoryContext);
  const categoryContext: any = useContext(CategoryContext);

  const [operatorList, setOperatorList] = useState([]);
  const [formValues, setFormValues] = useState({
    DTHNumber: "",
    circle: "",
    productName: "",
    operatorid: "",
    amount: "",
  });

  const [open1, setModalEdit1] = React.useState(false);
  const openEditModal1 = () => {
    setModalEdit1(true);
  };
  const handleClose1 = () => {
    setModalEdit1(false);
    reset(defaultValues);
  };

  const rechargePageSchema = Yup.object().shape({
    DTHNumber: Yup.string().required("DTH Number is required"),
    operator: Yup.string().required("Operator is required"),
    // circle: Yup.string().required('Cicle is required'),
    amount: Yup.number().required("Amount is required"),
  });

  const defaultValues = {
    DTHNumber: "",
    operator: "",
    amount: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(rechargePageSchema),
    defaultValues,
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;
  useEffect(() => {
    subCategoryContext?.subcategoryId &&
      subCategoryContext?.categoryId &&
      getProductFilter(
        subCategoryContext?.categoryId,
        subCategoryContext?.subcategoryId
      );
  }, [subCategoryContext?.subcategoryId]);

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

  const onSubmit = (data: FormValuesProps) => {
    setFormValues({
      ...formValues,
      DTHNumber: data.DTHNumber,
      circle: data.circle,
      operatorid: data.operator,
      amount: data.amount,
    });
    openEditModal1();
  };

  return (
    <>
      <Helmet>
        <title>DTH | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>
      <Stack gap={2}>
        <Stack>
          <Typography variant="h4">Recharge your DTH</Typography>
          <Typography variant="body2"></Typography>
        </Stack>
        {/* <FetchDetail data={operatorList} /> */}
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={2}>
            <RHFTextField
              name="DTHNumber"
              placeholder="DTH number"
              label="DTH Number"
            />
            <Stack flexDirection={"row"} gap={1}>
              <RHFSelect
                name="operator"
                placeholder="Operator"
                label="Operator"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                {operatorList.map((item: any, index: any) => (
                  <MenuItem
                    key={item._id}
                    value={item.operatorid}
                    onClick={() =>
                      setFormValues({
                        ...formValues,
                        productName: item.productName,
                      })
                    }
                  >
                    {item.productName}
                  </MenuItem>
                ))}
              </RHFSelect>
              {/* <RHFSelect
                name="circle"
                placeholder="Circle"
                label="Circle"
                
                SelectProps={{
                  native: false,
                  sx: { textTransform: 'capitalize' },
                }}
              >
                {circleList.map((item: any, index: any) => (
                  <MenuItem key={item.id} value={item.name}>
                    {item.name}
                  </MenuItem>
                ))}
              </RHFSelect> */}
            </Stack>
            <RHFTextField
              name="amount"
              placeholder="amount"
              label="Amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <LoadingButton
              fullWidth
              size="medium"
              type="submit"
              variant="contained"
            >
              Submit
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Stack>
      <Modal
        open={open1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <VerifyNPIN data={formValues} handleClose={handleClose1} />
      </Modal>
    </>
  );
}

function VerifyNPIN({ data, handleClose }: any) {
  const { user, UpdateUserDetail } = useAuthContext();
  const { DTHNumber, amount, circle, operatorid, productName } = data;
  const { enqueueSnackbar } = useSnackbar();
  const [confirm, setConfirm] = React.useState(false);

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
  });

  const {
    reset: otpReset,
    register: otpForm,
    handleSubmit: handleOtpSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const formSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        OperatorId: operatorid,
        number: DTHNumber,
        amount: amount,
        nPin:
          data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
      };
      await Api("agents/v1/doRechargeLTS", "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar("Status:" + Response.data.data.status);
              handleClose();
              otpReset(defaultValues2);
              console.log(
                "==============>>> post mobile data message",
                Response.data.message
              );
              UpdateUserDetail({
                main_wallet_amount:
                  Response?.data?.data?.agentDetails?.newMainWalletBalance,
              });
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
              console.log(
                "==============>>> post mobile number",
                Response.data.message
              );
            }
            otpReset(defaultValues2);
            setConfirm(false);
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
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
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Amount</Typography>
          <Typography variant="body1">{amount}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Operator</Typography>
          <Typography variant="body1">{productName}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Mobile Number</Typography>
          <Typography variant="body1">{DTHNumber}</Typography>
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
                variant="contained"
                type="submit"
                loading={isSubmitting2}
              >
                Yes, Continue
              </LoadingButton>
              <Button variant="contained" color="warning" onClick={handleClose}>
                Close
              </Button>
            </Stack>
          </Stack>
        )}
        {!confirm && (
          <Stack flexDirection={"row"} gap={1} mt={2}>
            <LoadingButton variant="contained" onClick={() => setConfirm(true)}>
              Confirm
            </LoadingButton>
            <Button variant="contained" color="warning" onClick={handleClose}>
              Close
            </Button>
          </Stack>
        )}
      </Box>
    </FormProvider>
  );
}

function FetchDetail({ data }: any) {
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile is required"),
    operator1: Yup.string().required("Operator is required"),
  });

  const defaultValues2 = {
    mobileNumber: "",
    operator1: "",
  };

  const method2 = useForm<FormValuesProps>({
    resolver: yupResolver(Schema),
    defaultValues: defaultValues2,
  });

  const {
    handleSubmit: handleSubmit,
    formState: { errors: error2, isSubmitting: isSubmitting2 },
  } = method2;

  const fetchDetail = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      mobile_number: data.mobileNumber,
      operator: data.operator1,
    };
    Api("agents/v1/DTH_cus_info", "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  return (
    <FormProvider methods={method2} onSubmit={handleSubmit(fetchDetail)}>
      <Stack gap={2}>
        <RHFTextField
          name="mobileNumber"
          type="number"
          placeholder="Mobile number"
          label="Mobile Number"
        />
        <Grid display={"grid"} gridTemplateColumns={"1.5fr 0.5fr"} gap={1}>
          <RHFSelect
            name="operator1"
            placeholder="Operator"
            label="Operator"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
          >
            {data.map((item: any, index: any) => (
              <MenuItem key={item._id} value={item.productName}>
                {item.productName}
              </MenuItem>
            ))}
          </RHFSelect>
          <Button
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            type="submit"
          >
            Fetch detail
          </Button>
        </Grid>
        <Divider>
          <Chip label="OR" />
        </Divider>
      </Stack>
    </FormProvider>
  );
}
