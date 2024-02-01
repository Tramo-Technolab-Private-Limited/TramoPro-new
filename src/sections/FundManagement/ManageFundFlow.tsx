import React, { useEffect, useState } from "react";
import {
  Stack,
  MenuItem,
  Grid,
  Typography,
  Button,
  TextField,
  Modal,
  Box,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import { Icon } from "@iconify/react";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import { Image } from "@mui/icons-material";

type FormValuesProps = {
  transactionType: string;
  from: {
    firstName: string;
    lastName: string;
    userCode: string;
    contact_no: string;
    _id: string;
  };
  to: {
    firstName: string;
    lastName: string;
    userCode: string;
    contact_no: string;
    _id: string;
  };
  reason: string;
  transactionid: string;
  amount: string;
  remarks: string;
};

export default function ManageFundFlow() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail } = useAuthContext();
  const agentDetail: any = user;
  const [txnAmount, setTxnAmount] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [txnresponse, setTxnResponse] = useState({
    from: "",
    fromName: "",
    to: "",
    toName: "",
    txnId: "",
    amount: "",
    reason: "",
    remarks: "",
    walletId: "",
    _id: "",
  });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };
  const handleDetail = (event: any, newValue: any) => {
    setSelectedUser(newValue);
  };

  const FilterSchema = Yup.object().shape({
    // transactionType: Yup.string().required('Transaction Type is required'),
    // from: txntype == 'credit' ? Yup.string() : Yup.string().required('From is required'),
    // fromsearchby:
    //   txntype == 'debit' ? Yup.string().required('Search by is required') : Yup.string(),
    // to: txntype == 'debit' ? Yup.string() : Yup.string().required('to is required'),
    // tosearchby: txntype == 'credit' ? Yup.string().required('Search by is required') : Yup.string(),
    // reason: Yup.string().required('Reason is required'),
    // amount:
    //   creditReason == 'wrongdebit' ||
    //   creditReason == 'wrongcredit' ||
    //   creditReason == 'creditreturn' ||
    //   creditReason == 'chargeback'
    //     ? Yup.string()
    //     : Yup.string().required('Amount is required'),
    // remarks: Yup.string().required('Remark is required'),
  });
  const defaultValues = {
    transactionType: "",
    from: {
      firstName: "",
      lastName: "",
      userCode: "",
      contact_no: "",
      _id: "",
    },
    to: {
      firstName: "",
      lastName: "",
      userCode: "",
      contact_no: "",
      _id: "",
    },
    reason: "",
    transactionid: "",
    amount: "",
    remarks: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });
  const {
    reset,
    register,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    searchUsers();
  }, []);

  useEffect(() => {
    if (getValues("transactionType") === "credit") {
      setValue("from", agentDetail);
      setValue("to", {
        firstName: "",
        lastName: "",
        userCode: "",
        contact_no: "",
        _id: "",
      });
    }
    if (getValues("transactionType") === "debit") {
      setValue("to", agentDetail);
      setValue("from", {
        firstName: "",
        lastName: "",
        userCode: "",
        contact_no: "",
        _id: "",
      });
    }
  }, [watch("transactionType")]);

  const searchUsers = () => {
    let token = localStorage.getItem("token");
    Api(
      user?.role == "m_distributor"
        ? `agent/get_All_Distributor`
        : `agent/get_All_Agents`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("======get_CategoryList==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setUsers(Response.data.data);
          console.log(
            "======get_CategoryList get_CategoryList====>",
            Response.data.data
          );
        } else {
          console.log("======get_CategoryList=======>" + Response);
        }
      }
    });
  };

  const gettransaction = (val: string) => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: "10",
        currentPage: "1",
      },
      clientRefId: val,
      status: "",
      transactionType: "",
      userId: "",
    };
    Api(`adminTransaction/get_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======get_CategoryList==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setTxnAmount(Response.data.data[0].amount);
            console.log(
              "======get_CategoryList get_CategoryList====>",
              Response.data.data
            );
          } else {
            enqueueSnackbar(Response.data.message);
            console.log("======get_CategoryList=======>" + Response);
          }
        }
      }
    );
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let body = {
        amount: data.amount,
        from: data.from._id,
        fromName: `${data.from.firstName} ${data.from.lastName}`,
        to: data.to._id,
        toName: `${data.to.firstName} ${data.to.lastName}`,
        reason: data.reason,
        remarks: data.remarks,
        txnId: "",
      };
      await Api(`agent/downline_fund_flow`, "POST", body, "").then(
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
              setTxnResponse(Response.data.data);
              handleOpen();
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            }
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Stack>
      <Grid display={"grid"} m={1}>
        <Typography variant="h3" my={2}>
          Fund Flow
        </Typography>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid
            display={"grid"}
            gridTemplateColumns={{
              md: "repeat(1, 0.3fr)",
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

            <RHFAutocomplete
              name="from"
              value={watch("from")}
              onChange={(event, newValue) => {
                setValue("from", newValue);
              }}
              disabled={getValues("transactionType") === "credit"}
              options={users.map((option: any) => option)}
              getOptionLabel={(option: any) =>
                `${option.firstName} ${option.lastName}`
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                  {...props}
                >
                  {`${option.firstName} ${option.lastName} (${option.userCode})`}
                </Box>
              )}
              freeSolo
              disableClearable
              renderInput={(params) => (
                <TextField
                  label="From"
                  variant={
                    getValues("transactionType") === "credit"
                      ? "filled"
                      : "outlined"
                  }
                  {...params}
                />
              )}
            />

            <RHFAutocomplete
              name="to"
              value={selectedUser}
              onChange={handleDetail}
              disabled={getValues("transactionType") === "debit"}
              options={users.map((option: any) => option)}
              getOptionLabel={(option: any) =>
                `${option.firstName} ${option.lastName}`
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                  {...props}
                >
                  {`${option.firstName} ${option.lastName} (${option.userCode})`}
                </Box>
              )}
              freeSolo
              disableClearable
              renderInput={(params) => (
                <TextField
                  label="To"
                  placeholder="To"
                  variant={
                    getValues("transactionType") === "debit"
                      ? "filled"
                      : "outlined"
                  }
                  {...params}
                />
              )}
            />
            {selectedUser && (
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    component="div"
                    color="ButtonText"
                  >
                    {`${selectedUser.firstName} ${selectedUser.lastName}`}
                  </Typography>
                  <Typography color="text.secondary">
                    Role: {selectedUser.role}
                  </Typography>
                  <Typography color="text.secondary">
                    Email: {selectedUser.email}
                  </Typography>
                  <Typography color="text.secondary">
                    Phone: {selectedUser.contact_no}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <RHFTextField name="reason" label="Reasons" placeholder="Reasons" />
            <RHFTextField
              name="remarks"
              label="Remarks"
              placeholder="Remarks"
            />
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
            loading={isSubmitting}
          >
            Proceed
          </LoadingButton>
        </FormProvider>
      </Grid>
      <Modal
        open={open}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ffffff",
            boxShadow: 24,
            borderRadius: "20px",
            p: 4,
            width: {
              xs: "100%",
              sm: "50%",
            },
          }}
        >
          <FormProvider methods={methods}>
            <Grid
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                // sm: 'repeat(2, 1fr)'
              }}
            >
              <Icon
                icon="icon-park-solid:success"
                style={{
                  alignSelf: "center",
                  color: "green",
                  fontSize: 40,
                  width: "100%",
                }}
              />
              <Stack justifyContent={"center"} alignItems={"center"}>
                <Typography variant="subtitle1" color={"green"}>
                  Success
                </Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="h4">From</Typography>
                <Typography variant="body1">{`${watch(
                  "from.firstName"
                )} ${watch("from.lastName")}`}</Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="h4">To</Typography>
                <Typography variant="body1">{`${watch("to.firstName")} ${watch(
                  "to.lastName"
                )}`}</Typography>
              </Stack>
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="h4">Reason</Typography>
                <Typography variant="body1">{txnresponse.reason}</Typography>
              </Stack>
              {txnresponse.txnId && (
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Typography variant="h4">Transaction Id</Typography>
                  <Typography variant="body1">{txnresponse.txnId}</Typography>
                </Stack>
              )}
              <Stack
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography variant="h4">Amount</Typography>
                <Typography variant="body1">{`${watch("amount")}`}</Typography>
              </Stack>
              <Stack justifyContent={"center"} alignItems={"center"}>
                <Typography variant="body1" fontStyle={"italic"}>
                  Remark: {txnresponse.remarks}
                </Typography>
              </Stack>
              <Button
                sx={{ margin: "auto" }}
                size="small"
                variant="contained"
                onClick={handleClose}
              >
                Close
              </Button>
            </Grid>
          </FormProvider>
        </Box>
      </Modal>
    </Stack>
  );
}
