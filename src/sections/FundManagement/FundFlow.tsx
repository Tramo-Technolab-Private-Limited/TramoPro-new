import { useEffect, useState } from "react";
import {
  Stack,
  MenuItem,
  Grid,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
  Card,
  Button,
} from "@mui/material";
import React from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import ConfirmDialog from "src/components/confirm-dialog/ConfirmDialog";
import TransactionModal from "src/components/customFunctions/TrasactionModal";
import { CustomAvatar } from "src/components/custom-avatar";
import RoleBasedGuard from "src/auth/RoleBasedGuard";
import { TableHeadCustom, TableNoData } from "src/components/table";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { fDateTime } from "src/utils/formatTime";
import Iconify from "src/components/iconify";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { useNavigate } from "react-router";

type FormValuesProps = {
  transactionType: string;
  User: string;
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

function FundFlow() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, UpdateUserDetail } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUser, setFilteredUser] = useState([]);
  const [users, setUsers] = useState([]);
  const [isTxnOpen, setIsTxnOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sdata, setSdata] = useState([]);
  const [pageSize, setPageSize] = useState<any>(10000);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>(0);
  const [Loading, setLoading] = useState(false);
  const [transactionDetail, setTransactionDetail] = useState({
    status: "",
  });

  //confirm modal
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleOpenDetails = () => setOpenConfirm(true);
  const handleCloseDetails = () => {
    setOpenConfirm(false);
    reset(defaultValues);
  };

  const navigate = useNavigate();
  const tableLabels = [
    { id: "Date&Time", label: "Date & Time" },
    { id: "TransactionType", label: "Transaction Type" },
    { id: "Client Ref Id", label: "Client Ref Id" },
    { id: "From", label: "From" },
    { id: "to", label: "To" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
  ];

  const FilterSchema = Yup.object().shape({
    transactionType: Yup.string().required("Transaction Type is required"),
    User: Yup.string().required("Please Select User"),
    from: Yup.object().shape({
      _id: Yup.string().when("transactionType", {
        is: "debit",
        then: Yup.string().required("please select User"),
      }),
    }),
    to: Yup.object().shape({
      _id: Yup.string().when("transactionType", {
        is: "credit",
        then: Yup.string().required("please select User"),
      }),
    }),
    reason: Yup.string().required("Reason is required"),
    amount: Yup.string().required("Reason is required"),
    remarks: Yup.string().required("Reason is required"),
  });

  const defaultValues = {
    transactionType: "",
    User: "",
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
    resetField,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    searchUsers();
    getTransaction();
  }, []);
  useEffect(() => {
    setFilteredUser(
      users.filter((item: any) => {
        if (
          item.firstName
            .toLowerCase()
            .startsWith(getValues("User").toLowerCase()) ||
          item.email.toLowerCase().startsWith(getValues("User").toLowerCase())
        ) {
          return item;
        }
      })
    );
  }, [watch("User")]);

  useEffect(() => {
    resetField("User");
    resetField("amount");
    resetField("reason");
    resetField("remarks");
    setValue("from._id", "");
    setValue("from.contact_no", "");
    setValue("from.firstName", "");
    setValue("from.lastName", "");
    setValue("from.userCode", "");
    setValue("to._id", "");
    setValue("to.contact_no", "");
    setValue("to.firstName", "");
    setValue("to.lastName", "");
    setValue("to.userCode", "");
  }, [watch("transactionType")]);

  const searchUsers = () => {
    let token = localStorage.getItem("token");
    let body = {
      filter: {
        userName: "",
        userCode: "",
        email: "",
        mobile: "",
      },
    };
    Api(
      `agent/get_All_${
        user?.role == "m_distributor" ? "Distributor" : "Agents"
      }?page=${currentPage}&limit=${pageSize}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setUsers(Response.data.data);
        }
      }
    });
  };

  const getTransaction = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);
          } else {
            enqueueSnackbar(Response.data.message);
          }
          setLoading(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setLoading(false);
        }
      }
    );
  };

  const onSubmit = () => handleOpenDetails();

  const confirmTransaction = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    try {
      let body = {
        amount: getValues("amount"),
        from:
          getValues("transactionType") == "debit"
            ? getValues("from._id")
            : user?._id,
        fromName:
          getValues("transactionType") == "debit"
            ? `${getValues("from.firstName")} ${getValues("from.lastName")}`
            : `${user?.firstName} ${user?.lastName}`,
        to:
          getValues("transactionType") == "credit"
            ? getValues("to._id")
            : user?._id,
        toName:
          getValues("transactionType") == "credit"
            ? `${getValues("to.firstName")} ${getValues("to.lastName")}`
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
              setTransactionDetail(Response.data.data);
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
      <RoleBasedGuard hasContent roles={["distributor", "m_distributor"]}>
        <Grid display={"grid"} m={1}>
          <Typography variant="h3" my={2}>
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

              {getValues("transactionType") && (
                <Stack sx={{ position: "relative", minWidth: "200px" }}>
                  <RHFTextField
                    fullWidth
                    name="User"
                    placeholder={
                      getValues("transactionType") == "credit" ? "To" : "From"
                    }
                  />
                  {filteredUser.length > 0 && watch("User").length > 0 && (
                    <Stack
                      sx={{
                        position: "absolute",
                        top: 40,
                        zIndex: 9,
                        width: "100%",
                        bgcolor: "white",
                        border: "1px solid grey",
                        borderRadius: 2,
                      }}
                    >
                      <Scrollbar sx={{ maxHeight: 400 }}>
                        {filteredUser.map((item: any) => {
                          return (
                            <Stack
                              flexDirection={"row"}
                              gap={1}
                              sx={{
                                p: 1,
                                cursor: "pointer",
                                color: "grey",
                                "&:hover": { color: "black" },
                              }}
                              onClick={() => {
                                setValue(
                                  getValues("transactionType") == "credit"
                                    ? "to"
                                    : "from",
                                  item
                                );
                                setValue(
                                  "User",
                                  `${item.firstName} ${item.lastName}`
                                );
                                setFilteredUser([]);
                              }}
                            >
                              <CustomAvatar
                                src={item?.selfie[0]}
                                alt={item?.firstName}
                                name={item?.firstName}
                              />
                              <Stack>
                                <Typography variant="body2">
                                  {item.firstName} {item.lastName}{" "}
                                </Typography>{" "}
                                <Typography variant="body2">
                                  {item.userCode}
                                </Typography>{" "}
                                <Typography variant="body2">
                                  {item.email}
                                </Typography>{" "}
                              </Stack>
                            </Stack>
                          );
                        })}
                      </Scrollbar>
                    </Stack>
                  )}
                </Stack>
              )}

              <RHFTextField
                name="reason"
                label="Reasons"
                placeholder="Reasons"
              />
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
                  ? `from ${getValues("from.firstName")} ${getValues(
                      "from.lastName"
                    )} to ${user?.firstName} ${user?.lastName}`
                  : `from ${user?.firstName} ${user?.lastName} to ${getValues(
                      "to.firstName"
                    )} ${getValues("to.lastName")}`
              } `}
              action={
                <LoadingButton
                  variant="contained"
                  color="error"
                  loading={isLoading}
                  onClick={confirmTransaction}
                >
                  Sure
                </LoadingButton>
              }
            />
          </FormProvider>
        </Grid>

        <TransactionModal
          isTxnOpen={isTxnOpen}
          handleTxnModal={() => {
            setIsTxnOpen(false);
            setErrorMsg("");
          }}
          errorMsg={errorMsg}
          transactionDetail={transactionDetail}
        />
      </RoleBasedGuard>
    </>
  );
}

export default FundFlow;
