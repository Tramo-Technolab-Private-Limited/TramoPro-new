import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import {
  Box,
  Card,
  FormHelperText,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
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

import { TableNoData } from "src/components/table";
import { fDateTime } from "src/utils/formatTime";
import { fIndianCurrency } from "src/utils/formatNumber";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import CustomPagination from "src/components/customFunctions/CustomPagination";

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

  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [txnCount, setTxnCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const tableLabels = [
    { id: "Date&Time", label: "Txn Details" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/ Commission", label: "Charge/ Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
  ];

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
    getTxn();
  }, []);

  const getTxn = async () => {
    let token = localStorage.getItem("token");
    try {
      setLoading(true);
      let body = {
        pageInitData: {
          pageSize: pageSize,
          currentPage: currentPage,
        },
        clientRefId: "",
        status: "",
        transactionType: "Wallet To Wallet Settlement",
        categoryId: "",
        mobileNumber: "",
        accountNumber: "",
        productId: "",
        startDate: "",
        endDate: "",
      };
      await Api(`transaction/transactionByUser`, "POST", body, token).then(
        (Response: any) => {
          console.log("======Transaction==response=====>" + Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              setTransactionData(Response.data.data.data);
              setTxnCount(Response.data.data.totalNumberOfRecords);
            } else {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            }
            setLoading(false);
          } else {
            setLoading(false);
            enqueueSnackbar("Failed", { variant: "error" });
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
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
    <React.Fragment>
      <Grid container>
        <Grid item sm={4}>
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
                          <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                          >
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
                  Are you sure to settle Rs. {getValues("amount")} to main
                  wallet
                </Typography>
                <Stack
                  flexDirection={"row"}
                  gap={1}
                  justifyContent={"end"}
                  mt={3}
                >
                  <LoadingButton
                    onClick={handleClose}
                    loading={isSubmitLoading}
                  >
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
        </Grid>
        <Grid item sm={8}>
          <Card sx={{ mt: 3, position: "relative" }}>
            <Scrollbar>
              {loading ? (
                <ApiDataLoading />
              ) : (
                <Table size="small" aria-label="customized table" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {tableLabels.map((item: any) => {
                        return (
                          <TableCell key={item.id}>{item.label}</TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {transactionData.map((row: any) => (
                      <TransactionRow key={row._id} row={row} />
                    ))}
                  </TableBody>

                  <TableNoData isNotFound={!transactionData.length} />
                </Table>
              )}
            </Scrollbar>
            {/* <CustomPagination
              page={currentPage - 1}
              count={txnCount}
              onPageChange={(
                event: React.MouseEvent<HTMLButtonElement> | null,
                newPage: number
              ) => {
                setCurrentPage(newPage + 1);
              }}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                setPageSize(parseInt(event.target.value));
                setCurrentPage(1);
              }}
            /> */}
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
});

function TransactionRow({ row }: any) {
  const { user } = useAuthContext();

  const [newRow, setNewRow] = useState(row);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[300],
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <>
      <StyledTableRow key={newRow._id}>
        {/* Date & Time */}
        <StyledTableCell>
          <Typography variant="body2">{newRow?.transactionType}</Typography>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {newRow?.clientRefId}{" "}
          </Typography>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fDateTime(newRow?.createdAt)}
          </Typography>
        </StyledTableCell>

        {/* Opening Balance */}
        <StyledTableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fIndianCurrency(
              user?.role === "agent"
                ? newRow?.agentDetails?.oldMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.oldMainWalletBalance
                : newRow?.masterDistributorDetails?.oldMainWalletBalance
            )}
          </Typography>
        </StyledTableCell>

        {/* Transaction Amount */}
        <StyledTableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fIndianCurrency(newRow.amount) || 0}
          </Typography>
        </StyledTableCell>

        {/* Charge/Commission */}
        <StyledTableCell>
          <Stack flexDirection={"row"}>
            <Typography variant="body2" whiteSpace={"nowrap"} color={"error"}>
              {user?.role === "agent" && <>-{fIndianCurrency(newRow.debit)}/</>}
            </Typography>{" "}
            <Typography variant="body2" whiteSpace={"nowrap"} color={"green"}>
              +{" "}
              {fIndianCurrency(
                user?.role === "agent"
                  ? newRow?.agentDetails?.creditedAmount
                  : user?.role === "distributor"
                  ? newRow?.distributorDetails?.creditedAmount
                  : newRow?.masterDistributorDetails?.creditedAmount
              ) || 0}
            </Typography>
          </Stack>
        </StyledTableCell>

        {/* Closing Balance */}
        <StyledTableCell>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fIndianCurrency(
              user?.role === "agent"
                ? newRow?.agentDetails?.newMainWalletBalance
                : user?.role === "distributor"
                ? newRow?.distributorDetails?.newMainWalletBalance
                : newRow?.masterDistributorDetails?.newMainWalletBalance
            )}
          </Typography>
        </StyledTableCell>

        {/* GST/TDS */}

        {user?.role == "agent" && (
          <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
            <Typography variant="body2">
              GST :{" "}
              {fIndianCurrency((user?.role == "agent" && newRow?.GST) || "0")}
            </Typography>
            <Typography variant="body2">
              TDS :{" "}
              {fIndianCurrency(
                (user?.role == "agent" && newRow?.agentDetails?.TDSAmount) ||
                  "0"
              )}
            </Typography>
          </StyledTableCell>
        )}

        <StyledTableCell
          sx={{
            textTransform: "lowercase",
            fontWeight: 600,
          }}
        >
          <Label
            variant="soft"
            color={
              (newRow.status === "failed" && "error") ||
              ((newRow.status === "pending" ||
                newRow.status === "in_process") &&
                "warning") ||
              "success"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {newRow.status ? sentenceCase(newRow.status) : ""}
          </Label>
        </StyledTableCell>
      </StyledTableRow>
    </>
  );
}
