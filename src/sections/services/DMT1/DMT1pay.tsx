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
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { fDateTime } from "src/utils/formatTime";

// ----------------------------------------------------------------------

type FormValuesProps = {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

//--------------------------------------------------------------------

export default function DMT1pay(props: any) {
  console.log("props", props);

  const { enqueueSnackbar } = useSnackbar();
  const [radioValue, setRadioValue] = useState("IMPS");
  const [txnAmount, setTxnAmount] = useState("");
  const [txn, setTxn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkNPIN, setCheckNPIN] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setConfirm(false);
    setCheckNPIN(false);
    setTxn(true);
  };

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
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const transaction = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      beneficiaryId: props.beneficiary._id,
      amount: txnAmount,
      remitterId: props.remitter._id,
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
        Api("dmt1/transaction", "POST", body, token).then((Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              setTransactionDetail(Response.data.response);
            } else {
              enqueueSnackbar(Response.data.error.message, {
                variant: "error",
              });
              setErrorMsg(Response.data.error.message);
            }
          } else {
            setCheckNPIN(false);
            enqueueSnackbar(Response, { variant: "error" });
          }
          setTxn(false);
          reset(defaultValues);
        });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(transaction)}>
        <Box
          rowGap={10}
          columnGap={2}
          display="grid"
          alignItems={"center"}
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            sm: "repeat(3, 0.5fr)",
          }}
        >
          <RHFTextField
            sx={{ marginTop: "20px", maxWidth: "500px" }}
            type="number"
            aria-autocomplete="none"
            name="payAmount"
            label="Enter Amount"
            value={txnAmount}
            onChange={(e) => setTxnAmount(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
          <FormControl style={{ display: "flex" }}>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="RTGS"
              name="radiobuttonsgroup"
              sx={{ display: "flex", flexDirection: "row", marginTop: "10px" }}
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
          <Button
            size="large"
            onClick={handleOpen}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Pay Now
          </Button>
        </Box>
      </FormProvider>
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
                  onClick={handleClose}
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
              width={{ xs: "100%", sm: "fit-content" }}
            >
              <Stack
                flexDirection={"row"}
                gap={1}
                mb={1}
                justifyContent={"center"}
              >
                <Button variant="contained" onClick={handleClose} size="small">
                  Download Receipt
                </Button>
                <Button variant="contained" onClick={handleClose} size="small">
                  Close
                </Button>
              </Stack>
              <Stack
                sx={{ border: "1.5px dashed #000000" }}
                p={3}
                borderRadius={2}
              >
                <Table
                  stickyHeader
                  aria-label="sticky table"
                  style={{ borderBottom: "1px solid #dadada" }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                        Client ref Id
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                        Created At
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                        status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionDetail.map((item: any) => (
                      <TableRow key={item.data._id}>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {item.data.amount && "₹"} {item.data.amount || "NA"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {fDateTime(item.data.createAt) || "NA"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {item.data.client_ref_Id || "NA"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {item.data.status || "NA"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <Typography variant="body1">
                {props.beneficiary.beneName}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Bank Name</Typography>
              <Typography variant="body1">
                {props.beneficiary.bankName}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Account Number</Typography>
              <Typography variant="body1">
                {props.beneficiary.accountNumber}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">IFSC code</Typography>
              <Typography variant="body1">{props.beneficiary.ifsc}</Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Mobile Number</Typography>
              <Typography variant="body1">
                {props.beneficiary.mobileNumber || "-"}
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Typography variant="subtitle1">Transaction Amount</Typography>
              <Typography variant="body1">₹{txnAmount}</Typography>
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
                    inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                    type="password"
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
                      onClick={handleClose}
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
                  onClick={handleClose}
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
