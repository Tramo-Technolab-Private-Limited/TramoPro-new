import { useEffect, useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
// @mui
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputAdornment,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  FormHelperText,
} from "@mui/material";
import { Api } from "src/webservices";
// import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFCodes,
  RHFSecureCodes,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { convertToWords } from "src/components/customFunctions/ToWords";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";
import { TextToSpeak } from "src/components/customFunctions/TextToSpeak";
import TransactionModal from "src/components/customFunctions/TrasactionModal";
import MotionModal from "src/components/animate/MotionModal";
import { fetchLocation } from "src/utils/fetchLocation";

// ----------------------------------------------------------------------

type FormValuesProps = {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
  payAmount: string;
};

//--------------------------------------------------------------------

export default function DMTpay({
  remitter,
  beneficiary,
  isOpen,
  handleTxnClose,
}: any) {
  const { availableLimitForMoneyTransfer } = remitter;
  const { bankName, accountNumber, mobileNumber, beneName, ifsc } = beneficiary;
  const { enqueueSnackbar } = useSnackbar();
  const { UpdateUserDetail, initialize } = useAuthContext();
  const [mode, setMode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [transactionDetail, setTransactionDetail] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };

  //recipt modal
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const DMTSchema = Yup.object().shape({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
    payAmount: Yup.string()
      .required("Amount is required field")
      .test(
        "is-greater-than-100",
        "Amount should be greater than 100",
        (value: any) => +value > 99
      )
      .test(
        "is-less-than-max",
        "Limit Exceed ! available limit is " + availableLimitForMoneyTransfer,
        (value: any) => (+value > availableLimitForMoneyTransfer ? false : true)
      ),
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
    payAmount: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
    mode: "all",
  });
  const {
    reset,
    setError,
    getValues,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const transaction = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      beneficiaryId: beneficiary._id,
      amount: data.payAmount,
      remitterId: remitter._id,
      mode: mode,
      note1: "",
      note2: "",
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    await fetchLocation();
    await Api("moneytransfer/transaction", "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setTransactionDetail([{ ...Response.data.data }]);
            TextToSpeak(Response.data.message);
            initialize();
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
            setErrorMsg(Response.data.message);
          }
          handleClose();
          handleOpen1();
        } else {
          enqueueSnackbar(Response, { variant: "error" });
        }
      }
    );
  };

  const onsubmit = () => {};

  return (
    <>
      {/* transactional user confirm */}
      <MotionModal open={isOpen} width={{ xs: "95%", sm: 400 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onsubmit)}>
          <Stack justifyContent={"space-between"} mb={2}>
            <Stack gap={1}>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle2">Beneficiary Name</Typography>
                <Typography variant="subtitle2">{beneName}</Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle2"> Bank Name</Typography>
                <Typography variant="subtitle2">{bankName}</Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle2"> Account Number</Typography>
                <Typography variant="subtitle2">{accountNumber}</Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography variant="subtitle2">IFSC</Typography>
                <Typography variant="subtitle2">{ifsc}</Typography>
              </Stack>
            </Stack>

            <RHFTextField
              sx={{ marginTop: "20px", maxWidth: "500px" }}
              aria-autocomplete="none"
              name="payAmount"
              type="number"
              label="Enter Amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <Typography variant="caption">
              {convertToWords(+watch("payAmount"))}
            </Typography>
            <FormControl style={{ display: "flex" }}>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                value={mode}
                onChange={(event, value) => setMode(value)}
                name="radiobuttonsgroup"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: "10px",
                  marginLeft: "2px",
                }}
              >
                <FormControlLabel
                  sx={{ color: "inherit" }}
                  name="NEFT"
                  value="NEFT"
                  control={<Radio />}
                  label="NEFT"
                />
                <FormControlLabel
                  value="IMPS"
                  name="IMPS"
                  control={<Radio />}
                  label="IMPS"
                />
              </RadioGroup>
            </FormControl>
            <Stack flexDirection={"row"} gap={1}>
              <Button
                onClick={() => {
                  handleTxnClose();
                  handleOpen();
                }}
                variant="contained"
                sx={{ mt: 1 }}
                disabled={
                  !mode ||
                  !(+watch("payAmount") > 99 ? true : false) ||
                  !(+watch("payAmount") > availableLimitForMoneyTransfer
                    ? false
                    : true)
                }
              >
                Pay Now
              </Button>
              <Button
                onClick={() => {
                  handleTxnClose();
                }}
                variant="contained"
                sx={{ mt: 1 }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </MotionModal>

      <MotionModal open={open} width={{ xs: "95%", sm: 500 }}>
        <Typography variant="h4" textAlign={"center"}>
          Confirm Details
        </Typography>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Beneficiary Name</Typography>
          <Typography variant="body1">{beneName}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Bank Name</Typography>
          <Typography variant="body1">{bankName}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Account Number</Typography>
          <Typography variant="body1">{accountNumber}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">IFSC code</Typography>
          <Typography variant="body1">{ifsc}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Mobile Number</Typography>
          <Typography variant="body1">{mobileNumber || "-"}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
          <Typography variant="subtitle1">Transaction Amount</Typography>
          <Typography variant="body1">₹{getValues("payAmount")}</Typography>
        </Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(transaction)}>
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
            <Stack flexDirection={"row"} gap={1} mt={2}>
              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
              >
                Continue
              </LoadingButton>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  handleClose();
                }}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </MotionModal>

      <MotionModal open={open1} width={{ xs: "95%", md: 720 }}>
        <Stack flexDirection={"row"} gap={1} mt={1} justifyContent={"center"}>
          <TransactionModal
            isTxnOpen={open1}
            handleTxnModal={() => {
              setOpen1(false);
              setErrorMsg("");
              setMode("");
            }}
            errorMsg={errorMsg}
            transactionDetail={transactionDetail}
          />
        </Stack>
      </MotionModal>
    </>
  );
}

// ----------------------------------------------------------------------
