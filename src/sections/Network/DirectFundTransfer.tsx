import * as React from "react";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Api } from "src/webservices";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import { handleClosefunTrans } from "./Agent";
import { handleClosefunTransDist } from "./AllDistributor";
import { useAuthContext } from "src/auth/useAuthContext";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import Typography from "@mui/material/Typography";
import { Grid, MenuItem } from "@mui/material";
import { useSnackbar } from "notistack";
import ConfirmDialog from "src/components/confirm-dialog/ConfirmDialog";
export default function DirectFundTransfer(props: any) {
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 400,
    bgcolor: "background.paper",
    border: "2px ",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  const accountValidate = Yup.object().shape({});
  type FormValuesProps = {
    transactionType: string;
    reason: string;
    transactionid: string;
    amount: string;
    remarks: string;
  };

  const defaultValues = {
    transactionType: "",
    reason: "",
    transactionid: "",
    amount: "",
    remarks: "",
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isTxnOpen, setIsTxnOpen] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState({
    status: "",
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleOpenDetails = () => setOpenConfirm(true);
  const handleCloseDetails = () => {
    setOpenConfirm(false);
    reset(defaultValues);
  };
  const onSubmit = () => handleOpenDetails();

  const { user, UpdateUserDetail } = useAuthContext();
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(accountValidate),
    defaultValues,
  });

  const {
    reset,
    setError,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const confirmTransaction = (data: FormValuesProps) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    try {
      let body = {
        amount: getValues("amount"),
        from:
          getValues("transactionType") == "debit"
            ? props?.props?._id
            : user?._id,
        fromName:
          getValues("transactionType") == "debit"
            ? `${props?.props?.firstName} ${props?.props?.lastName}`
            : `${user?.firstName} ${user?.lastName}`,
        to:
          getValues("transactionType") == "credit"
            ? props?.props?._id
            : user?._id,
        toName:
          getValues("transactionType") == "credit"
            ? `${props?.props?.firstName} ${props?.props?.lastName}`
            : `${user?.firstName} ${user?.lastName}`,
        reason: getValues("reason"),
        remarks: getValues("remarks"),
        txnId: "",
      };
      Api(`agent/downline_fund_flow`, "POST", body, token).then(
        (Response: any) => {
          console.log("======get_CategoryList==response=====>" + Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              getValues("transactionType") === "debit"
                ? UpdateUserDetail({
                    main_wallet_amount: user?.main_wallet_amount + +body.amount,
                  })
                : UpdateUserDetail({
                    main_wallet_amount: user?.main_wallet_amount - +body.amount,
                  });

              setSuccessMsg(Response.data.message);

              setTransactionDetail(Response.data.data);
              if (user?.role == "distributor") {
                handleClosefunTrans();
              } else {
                handleClosefunTransDist();
              }
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
              setErrorMsg(Response.data.message);
            }
            setIsTxnOpen(true);
            handleCloseDetails();
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setErrorMsg("Failed");
            enqueueSnackbar("failed", { variant: "error" });
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Typography
        id="transition-modal-title"
        variant="h6"
        component="h2"
        sx={{ marginBottom: 2 }}
      >
        Fund Flow
      </Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid
          display={"grid"}
          gridTemplateColumns={{
            md: "repeat(1, 1fr)",
            sm: "repeat(1, 0.5fr)",
            xs: "repeat(1, 1fr,)",
          }}
          gap={1}
        >
          <RHFSelect
            name="transactionType"
            label="Transaction Type"
            placeholder="transaction Type"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
          >
            <MenuItem value={"credit"}>Credit</MenuItem>
            <MenuItem value={"debit"}>Debit</MenuItem>
          </RHFSelect>
          <RHFTextField
            name={props?.props?.firstName}
            label={`${props?.props?.firstName} ${props?.props?.lastName}`}
            placeholder={props?.props?.firstName}
            disabled
          />
          <RHFTextField name="reason" label="Reasons" placeholder="Reasons" />
          <RHFTextField name="remarks" label="Remarks" placeholder="Remarks" />
          <RHFTextField
            type="number"
            name="amount"
            label="Amount"
            placeholder="Amount"
          />
        </Grid>
        <LoadingButton
          variant="contained"
          sx={{ my: 2 }}
          type="submit"
          disabled={!isValid}
        >
          Proceed
        </LoadingButton>
        <ConfirmDialog
          open={openConfirm}
          onClose={handleCloseDetails}
          title="Fund Transfer Confirmation"
          content={`Are you sure to Transfer Rs.${getValues("amount")} ${
            getValues("transactionType") == "debit"
              ? `from ${props?.props?.firstName} ${props?.props?.lastName} to ${user?.firstName} ${user?.lastName}`
              : `from ${user?.firstName} ${user?.lastName} to ${props?.props?.firstName} ${props?.props?.lastName}`
          } `}
          action={
            <LoadingButton
              variant="contained"
              color="error"
              loading={isLoading}
              onClick={() => confirmTransaction(getValues())}
            >
              Sure
            </LoadingButton>
          }
        />
      </FormProvider>
    </>
  );
}
