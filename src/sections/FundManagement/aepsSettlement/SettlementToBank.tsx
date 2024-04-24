import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "notistack";
import {
  Alert,
  Box,
  Button,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFSecureCodes,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Api } from "src/webservices";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import { useNavigate } from "react-router-dom";
import { PATH_DASHBOARD } from "src/routes/paths";
import { DialogAnimate } from "src/components/animate";
import { watch } from "fs";
import LoadingScreen from "src/components/loading-screen/LoadingScreen";

type FormValuesProps = {
  bankDetail: {
    ifsc: string;
    accountNumber: string;
    bankName: string;
  };
  amount: number | null | string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

export default React.memo(function SettlementToBank() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { initialize } = useAuthContext();
  const [load, setLoad] = useState(false);
  const [eligibleSettlementAmount, setEligibleSettlementAmount] =
    useState<any>();
  const [transferTo, setTransferTo] = useState<boolean | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const FilterSchema = Yup.object().shape({
    amount: Yup.number()
      .required("Amount is required")
      .integer()
      .min(1000)
      .max(Number(eligibleSettlementAmount))
      .typeError("Amount is required"),
    accountNumber: transferTo
      ? Yup.string()
      : Yup.string().required("Bank account is required"),
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
  });
  const defaultValues = {
    amount: "",
    accountNumber: "",
    ifsc: "",
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  function goTomybankaccount() {
    navigate(PATH_DASHBOARD.fundmanagement.mybankaccount);
  }

  useEffect(() => {
    BankList();
    getEligibleSettlementAmount();
  }, []);

  const BankList = () => {
    setLoad(true);
    let token = localStorage.getItem("token");
    Api(`user/user_bank_list`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data?.length) {
            Response.data?.data[0]?.bankAccounts.map((item: any) => {
              if (item.isDefaultBank) {
                setValue("bankDetail", item);
              }
            });
          } else {
            enqueueSnackbar("Please Add Bank account to initiate Transaction", {
              variant: "error",
            });
          }
          setLoad(false);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const getEligibleSettlementAmount = () => {
    let token = localStorage.getItem("token");
    Api(`settlement/eligible_settlement_amount`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setEligibleSettlementAmount(Response.data.data);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      }
    );
  };

  const settleToBank = () => {
    setIsSubmitLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      amount: String(getValues("amount")),
      accountNumber: getValues("bankDetail.accountNumber"),
      ifsc: getValues("bankDetail.ifsc"),
      nPin:
        getValues("otp1") +
        getValues("otp2") +
        getValues("otp3") +
        getValues("otp4") +
        getValues("otp5") +
        getValues("otp6"),
    };
    Api(`settlement/to_bank_account`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            initialize();
            handleClose();
            reset(defaultValues);
            BankList();
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
          setIsSubmitLoading(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setIsSubmitLoading(false);
        }
      }
    );
  };

  if (load) {
    return <LoadingScreen />;
  }
  if (!watch("bankDetail.ifsc")?.length) {
    return (
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          mt: 20,
        }}
      >
        <Stack gap={1}>
          <LoadingButton
            variant="contained"
            onClick={goTomybankaccount}
            sx={{ alignSelf: "center" }}
          >
            Add New Bank Account
          </LoadingButton>
          <Alert severity="warning">
            Note: if you already add a bank. Please choose a default bank
            account from your existing banks.
          </Alert>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box style={{ borderRadius: "20px" }}>
      <FormProvider methods={methods} onSubmit={handleSubmit(settleToBank)}>
        <Scrollbar sx={{ maxHeight: 600, pr: 1 }}>
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            pt={1}
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
              // sm: 'repeat(2, 1fr)'
            }}
          >
            <Typography variant="subtitle1" textAlign={"center"}>
              Maximum Eligible Settlement Amount for Bank account is{" "}
              {Number(eligibleSettlementAmount) || 0}
            </Typography>
            {Number(eligibleSettlementAmount) < 1000 && (
              <Typography variant="caption" textAlign={"center"} color={"red"}>
                Minimum amount for AEPS settlement is 1000
              </Typography>
            )}
            <Stack gap={2}>
              <Stack sx={{ width: 250, alignSelf: "center" }} gap={1}>
                {!transferTo && (
                  <>
                    <RHFSelect
                      name="accountNumber"
                      label="Bank account"
                      placeholder="Bank account"
                      disabled
                      value={1}
                      variant="filled"
                      SelectProps={{
                        native: false,
                        sx: { textTransform: "capitalize" },
                      }}
                    >
                      <MenuItem key={"1"} value={1} selected>
                        <Stack>
                          <span>{getValues("bankDetail.bankName")}</span>
                          <span>
                            {"*".repeat(
                              watch("bankDetail.accountNumber").length - 4
                            ) +
                              watch("bankDetail.accountNumber").slice(
                                watch("bankDetail.accountNumber").length - 4
                              )}
                          </span>
                        </Stack>
                      </MenuItem>
                    </RHFSelect>
                  </>
                )}

                <RHFTextField
                  name="amount"
                  type="number"
                  label="Amount"
                  placeholder="Amount"
                />
              </Stack>
              {watch("amount") && (
                <>
                  <Stack alignSelf={"center"}>
                    <Stack
                      flexDirection={"row"}
                      justifyContent={"space-between"}
                    >
                      <Typography variant="h5" textAlign={"center"}>
                        NPIN
                      </Typography>
                      {/* <Button onClick={() => setResetNpin(true)}>Reset nPin?</Button> */}
                    </Stack>
                    <RHFSecureCodes
                      keyName="otp"
                      inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
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
                  </Stack>
                </>
              )}
              <LoadingButton
                variant="contained"
                onClick={handleOpen}
                disabled={!isValid}
                loading={isSubmitting}
                sx={{ width: "fit-content", alignSelf: "center" }}
              >
                Settle amount to Bank account
              </LoadingButton>
            </Stack>
          </Grid>
          <DialogAnimate open={open}>
            <Stack sx={{ p: 4 }} gap={1}>
              <Typography variant="h6">Confirmation</Typography>
              <Typography>
                Are you sure to settle{" "}
                <strong> Rs. {getValues("amount")}</strong> to Bank Account
              </Typography>
              <Stack
                flexDirection={"row"}
                gap={1}
                justifyContent={"end"}
                mt={3}
              >
                <LoadingButton onClick={handleClose} loading={isSubmitLoading}>
                  cancel
                </LoadingButton>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitLoading}
                  onClick={settleToBank}
                >
                  Sure
                </LoadingButton>
              </Stack>
            </Stack>
          </DialogAnimate>
        </Scrollbar>
      </FormProvider>
    </Box>
  );
});
