import Image from "src/components/image/Image";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  FormHelperText,
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import Scrollbar from "src/components/scrollbar";
import {
  RHFRadioGroup,
  RHFSecureCodes,
  RHFTextField,
} from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
import { TableHeadCustom, TableNoData } from "src/components/table";
import useResponsive from "src/hooks/useResponsive";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthContext } from "src/auth/useAuthContext";
import FormProvider from "src/components/hook-form/FormProvider";
import { useSnackbar } from "notistack";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MotionModal from "src/components/animate/MotionModal";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ErrorIcon } from "src/theme/overrides/CustomIcons";

type FormValuesProps = {
  searchType: string;
  search: any;
  searchfield: string;
  amount: number;
  slab: number;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

function WalletToWallet() {
  const { enqueueSnackbar } = useSnackbar();
  const { Api } = useAuthContext();
  const isMobile = useResponsive("up", "sm");
  const [modalOpen, setModalOpen] = useState(false);
  const [userDetail, setUserDetail] = useState({
    configuration: {
      chargeOn: "",
      slabs: [],
      settings: {
        isAllowed: null,
        minAmount: 0,
        maxAmount: 0,
      },
    },
    userInfo: {
      _id: "",
      userCode: "",
      role: "",
      firstName: "",
      lastName: "",
      contact_no: "",
      email: "",
      selfie: [],
      company_name: "",
    },
  });
  const [validationAmount, setValidationAmount] = useState({ min: 0, max: 0 });
  const [value, setValue] = useState("email");
  const [tabvalue, setTabValue] = useState("credit");
  const [inputValue, setInputValue] = useState("");
  const [userEligibility, setUserEligibility] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [charge, setCharge] = useState(0);
  const [transactonValue, setTransactonValue] = useState();
  const [transactonMessage, setTransactonMessage] = useState();
  const [transactionSuccessModalOpen, setTransactionSuccessModalOpen] =
    useState(false);

  const selfieSrc = AwsDocSign(userDetail?.userInfo?.selfie[0]);

  const schema = yup.object().shape({
    otp1: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    otp2: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    otp3: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    otp4: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    otp5: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    otp6: userDetail?.userInfo?.firstName
      ? yup.string().required()
      : yup.string(),
    searchfield: userDetail?.userInfo?.firstName
      ? yup.string()
      : yup.string().when("searchType", {
          is: "email",
          then: yup
            .string()
            .email("Invalid email format")
            .required("Email is required"),
          otherwise: yup
            .string()
            .required("Mobile number is required")
            .matches(/^[0-9]{10}$/, "Must be a 10 digit number"),
        }),
    amount: userDetail?.userInfo?.firstName
      ? yup
          .number()
          .min(
            validationAmount.min,
            `Amount should be minimum ${validationAmount.min}`
          )
          .max(
            validationAmount.max,
            `Amount should be maximum ${validationAmount.max}`
          )
          .typeError("invalid amount !")
      : yup.string(),
  });

  const defaultValues = {
    searchType: "email",
    search: "",
    searchfield: "",
    amount: 0,
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver<any>(schema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    trigger,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const handleChange = (e: any) => {
    setValue(e.target.value);
    setInputValue(e.target.value);
  };

  const handleTabChange = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

  const tableLabels = [
    { id: "username", label: "User Name" },
    { id: "usercode", label: "User Code" },
    { id: "businessname", label: "Business Name" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
  ];

  useEffect(() => {
    getUserEligibility();
  }, []);

  const getUserEligibility = () => {
    let token = localStorage.getItem("token");
    Api(`app/walletToWallet/check_eligibility`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setUserEligibility(Response.data.isAllowedToSend);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        } else if (Response.status == 404) {
          setUserEligibility(false);
          enqueueSnackbar("Resource not found", { variant: "error" });
        } else {
          enqueueSnackbar("An error occurred", { variant: "error" });
        }
      }
    );
  };

  const getsearchUser = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    Api(
      `app/walletToWallet/search_receiver?contact_no=${
        getValues("searchType") == "mobile" ? getValues("searchfield") : ""
      }&email=${
        getValues("searchType") == "email" ? getValues("searchfield") : ""
      }`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setUserDetail(Response.data.data);
          enqueueSnackbar(Response.data.message);
          setValidationAmount({
            min: Response.data.data.configuration.settings?.minAmount,
            max: Response.data.data.configuration.settings?.maxAmount,
          });
          setLoading(false);
          console.log("search_receiver>>>>>>>>>>>>>", Response);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          setLoading(false);
        }
      }
    });
  };

  const transactionComplete = () => {
    setModalOpen(false);
    setTransactionSuccessModalOpen(true);
    let token = localStorage.getItem("token");
    let body = {
      receiverId: userDetail.userInfo._id,
      amount: getValues("amount"),
      nPin:
        getValues("otp1") +
        getValues("otp2") +
        getValues("otp3") +
        getValues("otp4") +
        getValues("otp5") +
        getValues("otp6"),
    };
    {
      Api(`app/walletToWallet/transaction`, "POST", body, token).then(
        (Response: any) => {
          console.log("======get_CategoryList==response=====>" + Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              setTransactonValue(Response.data.data);
              setTransactonMessage(Response.data.code);
              enqueueSnackbar(Response.data.message);
            } else {
              console.log("======transaction=======>" + Response);
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setUserDetail({
      configuration: {
        chargeOn: "",
        slabs: [],
        settings: {
          isAllowed: null,
          minAmount: 0,
          maxAmount: 0,
        },
      },
      userInfo: {
        _id: "",
        userCode: "",
        role: "",
        firstName: "",
        lastName: "",
        contact_no: "",
        email: "",
        selfie: [],
        company_name: "",
      },
    });
  };

  useEffect(() => {
    const result: any = userDetail.configuration.slabs.filter(
      (item: any) =>
        item.minAmount <= Number(watch("amount")) &&
        item.maxAmount >= Number(watch("amount"))
    );

    if (result?.length) {
      setCharge(
        result[0]?.chargeType == "flat"
          ? result[0]?.charges
          : +watch("amount") * (result[0]?.charges / 100)
      );
    } else {
      setCharge(0);
    }
  }, [watch("amount")]);

  if (userEligibility == null) {
    return <ApiDataLoading />;
  }

  if (!userEligibility) {
    return (
      <Stack alignItems="center" mt={"20%"}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "red" }} />
        <Typography
          variant="h5"
          sx={{ textAlign: "center", mt: 1, color: "red" }}
        >
          User is not eligible to perform this transaction.
        </Typography>
      </Stack>
    );
  }

  const handleButtonClick = async () => {
    const values = getValues();
    (await trigger("amount")) && setModalOpen(true);
  };

  return (
    <>
      <Card sx={{ maxWidth: "100%", maxHeight: "100%", bgcolor: "#FFF8F8" }}>
        <Typography variant="h3" sx={{ p: 2, color: "#334A67" }}>
          Wallet To Wallet
        </Typography>
      </Card>
      <Stack
        flexDirection="row"
        bgcolor="#FFF8F8"
        mt={2}
        p={2}
        sx={{
          maxHeight: "100%",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      >
        <Grid container spacing={2} sx={{ maxHeight: "100%" }}>
          <Grid item xs={12} md={3}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(getsearchUser)}
            >
              <RadioGroup onClick={handleChange}>
                <Stack flexDirection="row">
                  <RHFRadioGroup
                    name="searchType"
                    options={[
                      { value: "email", label: "Search by Email" },
                      { value: "mobile", label: "Search by Mobile" },
                    ]}
                  />
                </Stack>
              </RadioGroup>
              <Stack flexDirection="row" gap={1} mt={1}>
                <RHFTextField
                  name="searchfield"
                  size="small"
                  label="Search"
                  placeholder={
                    watch("searchType") === "email"
                      ? "Search by Email"
                      : "Search by Mobile"
                  }
                />
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={loading}
                >
                  Search
                </LoadingButton>
              </Stack>
            </FormProvider>
            {userDetail?.userInfo?.firstName && (
              <Card
                sx={{
                  maxHeight: "100%",
                  bgcolor: "white",
                  mt: 2,
                  backgroundColor: "rgb(232, 240, 254)",
                }}
              >
                <Stack alignItems="center" mt={2}>
                  {selfieSrc ? (
                    <Image
                      src={selfieSrc}
                      alt="selfie"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <AccountCircleIcon
                      style={{
                        fontSize: 100,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </Stack>
                <Stack paddingLeft={3} gap={2} marginTop={1}>
                  <Typography>
                    Full Name
                    <Typography variant="subtitle1">
                      {userDetail?.userInfo?.firstName}
                      {userDetail?.userInfo?.lastName}{" "}
                    </Typography>
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    Shop/Business Name
                    <Typography variant="subtitle1">
                      {userDetail?.userInfo?.company_name}
                    </Typography>{" "}
                  </Typography>
                  <FormProvider
                    methods={methods}
                    onSubmit={handleSubmit(transactionComplete)}
                  >
                    <Typography>
                      <RHFTextField
                        name="amount"
                        size="small"
                        label="Amount"
                        type="number"
                        sx={{ width: 160, mt: 2 }}
                      />
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      Charges
                      <Typography variant="subtitle1">{charge}</Typography>
                    </Typography>
                    <Stack flexDirection={"row"} gap={1} mb={2}>
                      <LoadingButton
                        variant="contained"
                        size="small"
                        sx={{ width: 120, mt: 2 }}
                        loading={isSubmitting}
                        onClick={handleButtonClick}
                        // disabled={!isValid}
                      >
                        Transfer
                      </LoadingButton>
                      <LoadingButton
                        variant="contained"
                        size="small"
                        sx={{ width: 120, mt: 2 }}
                        onClick={handleReset}
                      >
                        Reset
                      </LoadingButton>
                    </Stack>
                    <MotionModal
                      open={modalOpen}
                      width={{ xs: "95%", sm: 500 }}
                    >
                      <Grid
                        rowGap={2}
                        columnGap={2}
                        display="grid"
                        gridTemplateColumns={{
                          xs: "repeat(1, 1fr)",
                        }}
                      >
                        <Typography
                          id="transaction-details-modal"
                          variant="h5"
                          sx={{ color: "#F82228", paddingLeft: 13 }}
                        >
                          Wallet To Wallet Transfer
                        </Typography>
                        <Stack
                          flexDirection={"row"}
                          justifyContent={"space-between"}
                        >
                          User Name{" "}
                          <Typography variant="subtitle1">
                            {" "}
                            {userDetail?.userInfo?.firstName}
                            {userDetail?.userInfo?.lastName}{" "}
                          </Typography>
                        </Stack>
                        <Stack
                          flexDirection={"row"}
                          justifyContent={"space-between"}
                        >
                          Business Name{" "}
                          <Typography variant="subtitle1">
                            {" "}
                            {userDetail?.userInfo?.company_name}
                          </Typography>
                        </Stack>
                        <Stack
                          flexDirection={"row"}
                          justifyContent={"space-between"}
                        >
                          Amount{" "}
                          <Typography variant="subtitle1">
                            {" "}
                            {getValues("amount")}
                          </Typography>
                        </Stack>
                        <Stack
                          flexDirection={"row"}
                          justifyContent={"space-between"}
                        >
                          Charge{" "}
                          <Typography variant="subtitle1">{charge}</Typography>
                        </Stack>
                        <Typography variant="h5">NPIN</Typography>
                        <RHFSecureCodes
                          keyName="otp"
                          inputs={[
                            "otp1",
                            "otp2",
                            "otp3",
                            "otp4",
                            "otp5",
                            "otp6",
                          ]}
                        />

                        {(!!errors.otp1 ||
                          !!errors.otp2 ||
                          !!errors.otp3 ||
                          !!errors.otp4 ||
                          !!errors.otp5 ||
                          !!errors.otp6) && (
                          <FormHelperText error sx={{ px: 2 }}>
                            Code is required
                          </FormHelperText>
                        )}
                        <Typography
                          id="transaction-details-description"
                          sx={{ mt: 2 }}
                        ></Typography>
                        <Stack flexDirection={"row"} gap={2}>
                          <LoadingButton
                            variant="contained"
                            size="small"
                            loading={isSubmitting}
                            type="submit"
                            disabled={!isValid}
                            onClick={() => transactionComplete()}
                          >
                            Make Payment
                          </LoadingButton>
                          <LoadingButton
                            size="small"
                            onClick={() => {
                              setModalOpen(false);
                              handleReset();
                            }}
                            variant="contained"
                          >
                            Close
                          </LoadingButton>
                        </Stack>
                      </Grid>
                    </MotionModal>
                    <MotionModal open={transactionSuccessModalOpen}>
                      <Stack
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {transactonMessage == 200 ? (
                          <>
                            <CheckCircleIcon
                              sx={{ fontSize: 48, color: "success.main" }}
                            />
                            <Typography variant="h5">
                              Transaction Success
                            </Typography>
                            <Typography>
                              Your transaction has been successful!
                            </Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon
                              sx={{ fontSize: 48, color: "error.main" }}
                            />
                            <Typography variant="h5">
                              Transaction Failed
                            </Typography>
                            <Typography>
                              Your transaction has failed. Please try again.
                            </Typography>
                          </>
                        )}
                      </Stack>
                      <LoadingButton
                        size="small"
                        onClick={() => {
                          setTransactionSuccessModalOpen(false);
                          handleReset();
                        }}
                        variant="contained"
                      >
                        Close
                      </LoadingButton>
                    </MotionModal>
                  </FormProvider>
                </Stack>
              </Card>
            )}
          </Grid>
          <Grid item xs={12} md={9}>
            <Card sx={{ maxHeight: "100%", bgcolor: "white", p: 2 }}>
              <Tabs
                value={tabvalue}
                onChange={handleTabChange}
                aria-label="disabled tabs example"
              >
                <Tab value="credit" label="Credit" />
                <Tab value="debit" label="Debit" />
              </Tabs>
              <Typography variant="h5" mt={1} mb={1}>
                Recent Transactions
              </Typography>
              <Grid item xs={12} md={12} lg={12}>
                <Scrollbar
                  sx={
                    isMobile
                      ? { maxHeight: window.innerHeight - 190 }
                      : { maxHeight: window.innerHeight - 250 }
                  }
                >
                  <Table
                    size="small"
                    aria-label="customized table"
                    stickyHeader
                  >
                    <TableHeadCustom headLabel={tableLabels} />
                    <TableBody></TableBody>
                  </Table>
                </Scrollbar>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

export default WalletToWallet;
