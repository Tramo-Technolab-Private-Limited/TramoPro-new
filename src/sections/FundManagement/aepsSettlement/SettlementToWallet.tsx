import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { Box, FormHelperText, Grid, Stack, Typography } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSecureCodes,
} from "src/components/hook-form";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Api } from "src/webservices";
import NPinReset from "../../Settings/NPinReset";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import { DialogAnimate } from "src/components/animate";

type FormValuesProps = {
  amount: number | null | string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

export default React.memo(function SettlementToWallet() {
  const { enqueueSnackbar } = useSnackbar();
  const { initialize } = useAuthContext();
  const [eligibleSettlementAmount, setEligibleSettlementAmount] = useState("");
  const [resetNpin, setResetNpin] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const FilterSchema = Yup.object().shape({
    amount: Yup.number()
      .required("Amount is required")
      .integer()
      .min(500)
      .max(Number(eligibleSettlementAmount))
      .typeError("Amount is required"),
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
  });
  const defaultValues = {
    amount: "",
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
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getEligibleSettlementAmount();
  }, []);

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

  const settleToMainWallet = () => {
    setIsSubmitLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      amount: String(getValues("amount")),
      nPin:
        getValues("otp1") +
        getValues("otp2") +
        getValues("otp3") +
        getValues("otp4") +
        getValues("otp5") +
        getValues("otp6"),
    };

    Api(`settlement/to_main_wallet`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            initialize();
            handleClose();
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

  return (
    <Box style={{ borderRadius: "20px" }}>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(settleToMainWallet)}
      >
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
            <Typography variant="subtitle1" textAlign="center">
              Maximum Eligible Settlement Amount for Main Wallet is
              {Number(eligibleSettlementAmount)}
            </Typography>

            {Number(eligibleSettlementAmount) < 500 && (
              <Typography variant="caption" textAlign="center" color="red">
                Minimum amount for AEPS settlement is 500
              </Typography>
            )}

            {resetNpin ? (
              <NPinReset />
            ) : (
              <Stack gap={2}>
                <Stack sx={{ width: 250, alignSelf: "center" }} gap={1}>
                  <RHFTextField
                    name="amount"
                    label="Amount"
                    placeholder="Amount"
                    type="number"
                  />
                </Stack>

                {watch("amount") && (
                  <>
                    <Stack alignSelf="center">
                      <Stack flexDirection="row" justifyContent="space-between">
                        <Typography variant="h5" textAlign="center">
                          NPIN
                        </Typography>
                        {/* Add your reset NPIN button here if needed */}
                      </Stack>

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
                    </Stack>
                  </>
                )}

                <LoadingButton
                  variant="contained"
                  onClick={handleOpen}
                  disabled={!isValid}
                  sx={{ width: "fit-content", alignSelf: "center" }}
                >
                  Settle amount to Main Wallet
                </LoadingButton>
              </Stack>
            )}
          </Grid>
        </Scrollbar>
        <DialogAnimate open={open}>
          <Stack sx={{ p: 4 }} gap={1}>
            <Typography variant="h6">Confirmation</Typography>
            <Typography>
              Are you sure to settle Rs. {getValues("amount")} to main wallet
            </Typography>
            <Stack flexDirection={"row"} gap={1} justifyContent={"end"} mt={3}>
              <LoadingButton onClick={handleClose} loading={isSubmitLoading}>
                cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitLoading}
                onClick={settleToMainWallet}
              >
                Sure
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogAnimate>
      </FormProvider>
    </Box>
  );
});
