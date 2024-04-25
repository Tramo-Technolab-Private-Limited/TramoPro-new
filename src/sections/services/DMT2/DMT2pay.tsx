import { useCallback, useEffect, useState } from "react";
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import MotionModal from "src/components/animate/MotionModal";
import TransactionModal from "src/components/customFunctions/TrasactionModal";

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

export default function DMT2pay({ clearPayout, remitter, beneficiary }: any) {
  const { dmt2RemitterAvailableLimit } = remitter;
  const { bankName, accountNumber, mobileNumber, beneName, ifsc } = beneficiary;
  const { enqueueSnackbar } = useSnackbar();
  const { initialize } = useAuthContext();
  const [txn, setTxn] = useState(true);
  const [mode, setMode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [checkNPIN, setCheckNPIN] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [count, setCount] = useState<any>(null);
  const [transactionDetail, setTransactionDetail] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setConfirm(false);
    setCheckNPIN(false);
    setTxn(true);
  };

  //success Modal
  const [open1, setOpen1] = useState(false);
  const handleOpen1 = () => setOpen1(true);
  const handleClose1 = () => setOpen1(false);

  const [open2, setOpen2] = useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => {
    setOpen2(false);
  };
  useEffect(() => {
    beneficiary._id && handleOpen2();
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
        "is-multiple-of-100",
        "Amount must be a multiple of 100",
        (value: any) => (+value > 5000 ? Number(value) % 100 === 0 : value)
      )
      .test(
        "is-less-than-max",
        "Limit Exceed ! available limit is " + dmt2RemitterAvailableLimit,
        (value: any) => (+value > dmt2RemitterAvailableLimit ? false : true)
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
    formState: { errors, isSubmitting },
  } = methods;

  // useEffect(() => {
  //   if (count !== null) {
  //     if (count > 0) {
  //       const timer = setInterval(() => {
  //         setCount((prevCount: any) => prevCount - 1);
  //       }, 1000);
  //       return () => clearInterval(timer);
  //     } else {
  //       window.location.reload();
  //     }
  //   }
  // }, [count]);

  const transaction = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      beneficiaryId: beneficiary._id,
      amount: data.payAmount,
      remitterId: remitter._id,
      mode: +mode,
      note1: "",
      note2: "",
      nPin:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
    };
    {
      body.nPin && setCheckNPIN(true);
    }
    {
      body.nPin &&
        Api("dmt2/transaction", "POST", body, token).then((Response: any) => {
          console.log(
            "==============>>> register beneficiary Response",
            Response
          );
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              Response.data.response.map((element: any) => {
                enqueueSnackbar(element.message);
                TextToSpeak(element.message);
                initialize();
              });
              setTransactionDetail(
                Response.data.response.map((item: any) => item.data)
              );
              handleOpen1();
              handleClose();
              // setCount(5);
              setTxn(false);
              setErrorMsg("");
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
              setErrorMsg(Response.data.message);
              setTxn(false);
            }
            // clearPayout();
          } else {
            setCheckNPIN(false);
            enqueueSnackbar(Response, { variant: "error" });
            // clearPayout();
            setTxn(false);
          }
        });
    }
  };

  return (
    <>
      <MotionModal open={open2} width={{ xs: "95%", sm: 400 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(transaction)}>
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
                  marginLeft: "15px",
                }}
              >
                <FormControlLabel
                  sx={{ color: "inherit" }}
                  name="NEFT"
                  value="1"
                  control={<Radio />}
                  label="NEFT"
                />
                <FormControlLabel
                  value="2"
                  name="IMPS"
                  control={<Radio />}
                  label="IMPS"
                />
              </RadioGroup>
            </FormControl>
            <Stack flexDirection={"row"} gap={1}>
              <Button
                onClick={() => {
                  handleClose2();
                  handleOpen();
                }}
                variant="contained"
                sx={{ mt: 1 }}
                disabled={
                  !mode ||
                  !(+watch("payAmount") > 5000
                    ? +watch("payAmount") % 100 === 0
                      ? true
                      : false
                    : +watch("payAmount") < 100
                    ? false
                    : true) ||
                  !(+watch("payAmount") > dmt2RemitterAvailableLimit
                    ? false
                    : true)
                }
              >
                Pay Now
              </Button>
              <Button
                onClick={() => {
                  handleClose2();
                  clearPayout();
                }}
                variant="contained"
                sx={{ mt: 1 }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
          <Typography textAlign="end">
            {convertToWords(+watch("payAmount"))}
          </Typography>
        </FormProvider>
      </MotionModal>
      <MotionModal open={open} width={{ xs: "95%", sm: 500 }}>
        {checkNPIN ? (
          txn ? (
            <Icon
              icon="eos-icons:bubble-loading"
              color="red"
              fontSize={300}
              style={{ padding: 25 }}
            />
          ) : errorMsg ? (
            <>
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
                    reset(defaultValues);
                  }}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Stack>
            </>
          ) : null
        ) : (
          <Box>
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
                    <Button variant="contained" type="submit">
                      Yes, Continue
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => {
                        // handleClose();
                        // clearPayout();
                        reset(defaultValues);
                      }}
                    >
                      Close{" "}
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
                    reset(defaultValues);
                  }}
                >
                  Close
                </Button>
              </Stack>
            )}
          </Box>
        )}
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
