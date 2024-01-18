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
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { convertToWords } from "src/components/customFunctions/ToWords";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";
import { TextToSpeak } from "src/components/customFunctions/TextToSpeak";

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

export default function DMTpay({ clearPayout, remitter, beneficiary }: any) {
  const { availableLimitForMoneyTransfer } = remitter;
  const { bankName, accountNumber, mobileNumber, beneName, ifsc } = beneficiary;
  const { enqueueSnackbar } = useSnackbar();
  const { UpdateUserDetail } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [txn, setTxn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkNPIN, setCheckNPIN] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState({
    amount: "",
    clientRefId: "",
    createdAt: "",
    status: "",
  });
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setConfirm(false);
    setCheckNPIN(false);
    setTxn(true);
    reset(defaultValues);
  };
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => {
    setOpen1(false);
  };
  useEffect(() => {
    beneficiary._id && handleOpen1();
  }, [beneficiary._id]);

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

  const transaction = (data: FormValuesProps) => {
    setIsLoading(true);
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
    {
      if (body.nPin) {
        setCheckNPIN(true);
        setIsLoading(false);
      }
    }
    {
      body.nPin &&
        Api("moneytransfer/transaction", "POST", body, token).then(
          (Response: any) => {
            console.log(
              "==============>>> register beneficiary Response",
              Response
            );
            if (Response.status == 200) {
              if (Response.data.code == 200) {
                enqueueSnackbar(Response.data.message);
                setTransactionDetail(Response.data.data);
                setErrorMsg("");
                TextToSpeak(Response.data.message);
                setTxn(false);
                UpdateUserDetail({
                  main_wallet_amount:
                    Response?.data?.data?.agentDetails?.newMainWalletBalance,
                });
              } else {
                enqueueSnackbar(Response.data.message, { variant: "error" });
                setErrorMsg(Response.data.message);
              }
              clearPayout();
              setIsLoading(false);
            } else {
              setIsLoading(false);
              setCheckNPIN(false);
              clearPayout();
              enqueueSnackbar(Response, { variant: "error" });
            }
          }
        );
    }
  };

  const onsubmit = () => {};

  return (
    <>
      <Modal
        open={open1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          style={{ borderRadius: "20px" }}
          width={{ xs: "100%", sm: 400 }}
        >
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
                    handleClose1();
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
                    handleClose1();
                    clearPayout();
                  }}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </FormProvider>
        </Box>
      </Modal>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {checkNPIN ? (
          txn ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={"fit-content"}
            >
              <Icon
                icon="eos-icons:bubble-loading"
                color="red"
                fontSize={300}
                style={{ padding: 25 }}
              />
            </Box>
          ) : errorMsg ? (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              width={{ xs: "100%", sm: 400 }}
            >
              <Stack flexDirection={"column"} alignItems={"center"}>
                <Typography variant="h3">Transaction Failed</Typography>
                <Icon
                  icon="heroicons:exclaimation-circle"
                  color="red"
                  fontSize={70}
                />
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                mt={2}
              >
                <Typography
                  variant="h4"
                  textAlign={"center"}
                  color={"#9e9e9ef0"}
                >
                  {errorMsg}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} justifyContent={"center"}>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleClose();
                    clearPayout();
                  }}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={style}
              style={{ borderRadius: "20px" }}
              p={2}
              width={{ xs: "100%", sm: 450 }}
            >
              <Stack
                sx={{ border: "1.5px dashed #000000" }}
                p={3}
                borderRadius={2}
              >
                <Stack flexDirection={"column"} alignItems={"center"}>
                  <Typography variant="h6">
                    Transaction {transactionDetail.status}
                  </Typography>
                  {transactionDetail.status.toLowerCase() == "success" ? (
                    <Icon
                      icon="icon-park-outline:success"
                      color="#4BB543"
                      fontSize={70}
                    />
                  ) : transactionDetail.status.toLowerCase() == "failed" ? (
                    <Icon
                      icon="heroicons:exclaimation-circle"
                      color="red"
                      fontSize={70}
                    />
                  ) : (
                    <Icon
                      icon="streamline:interface-page-controller-loading-1-progress-loading-load-wait-waiting"
                      color="orange"
                      fontSize={70}
                    />
                  )}
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Amount</Typography>
                  <Typography variant="body1">
                    {transactionDetail.amount && "₹"}{" "}
                    {transactionDetail.amount || "NA"}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Transaction Id</Typography>
                  <Typography variant="body1">
                    {transactionDetail.clientRefId || "NA"}
                  </Typography>
                </Stack>
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">Date</Typography>
                  <Typography variant="body1">
                    {fDateTime(transactionDetail.createdAt) || "NA"}
                  </Typography>
                </Stack>
              </Stack>
              <Stack flexDirection={"row"} gap={1} mt={1}>
                {/* <Button variant="contained" onClick={handleClose} size="small">
                  Download Receipt
                </Button> */}
                <Button
                  variant="contained"
                  onClick={() => {
                    handleClose();
                    clearPayout();
                  }}
                  size="small"
                >
                  Close
                </Button>
              </Stack>
            </Box>
          )
        ) : (
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
              <Typography variant="subtitle1">Beneficiary Name</Typography>
              <Typography variant="body1">{beneName}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Bank Name</Typography>
              <Typography variant="body1">{bankName}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Account Number</Typography>
              <Typography variant="body1">{accountNumber}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">IFSC code</Typography>
              <Typography variant="body1">{ifsc}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Mobile Number</Typography>
              <Typography variant="body1">{mobileNumber || "-"}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Transaction Amount</Typography>
              <Typography variant="body1">₹{getValues("payAmount")}</Typography>
            </Stack>
            {confirm && (
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(transaction)}
              >
                <Stack
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  mt={2}
                  gap={2}
                >
                  <Typography variant="h4">Confirm NPIN</Typography>
                  <RHFCodes
                    keyName="otp"
                    type="password"
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
                      loading={isLoading}
                    >
                      Yes, Continue
                    </LoadingButton>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => {
                        handleClose();
                        clearPayout();
                      }}
                    >
                      Close
                    </Button>
                  </Stack>
                </Stack>
              </FormProvider>
            )}
            {!confirm && (
              <Stack flexDirection={"row"} gap={1} mt={2}>
                <Button variant="contained" onClick={() => setConfirm(true)}>
                  Confirm
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    handleClose();
                    clearPayout();
                  }}
                >
                  Close
                </Button>
              </Stack>
            )}
          </Box>
        )}
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------
