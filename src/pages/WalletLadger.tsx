import { useEffect, useState } from "react";
import {
  Card,
  Stack,
  Grid,
  TableHead,
  Modal,
  Button,
  tableCellClasses,
  styled,
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "notistack";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Typography,
  TableContainer,
} from "@mui/material";
import Label from "src/components/label/Label";
import { TableHeadCustom, TableNoData } from "src/components/table";
import React from "react";
import Iconify from "src/components/iconify/Iconify";

import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "../components/customFunctions/CustomPagination";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import * as XLSX from "xlsx";
import FileFilterButton from "../sections/MyTransaction/FileFilterButton";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { sentenceCase } from "change-case";
import { green, red } from "@mui/material/colors";
import { fIndianCurrency } from "src/utils/formatNumber";
import { LoadingButton } from "@mui/lab";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "src/components/hook-form";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import MotionModal from "src/components/animate/MotionModal";
import { WalletLadgerSkeleton } from "src/components/skeletons/WalletLadgerSkeleton";

// ----------------------------------------------------------------------

type FormValuesProps = {
  startDate: Date | null;
  endDate: Date | null;
  clientRefId: string;
  walletType: string;
  walletId: string;
};

type RowProps = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function WalletLadger() {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [ladgerData, setLadgerData] = useState<any>([]);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sendLoading, setSendLoading] = useState(false);
  const [WalletCount, setWalletCount] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const agenttableLabels = [
    { id: "date", label: "Date/Time  " },
    { id: "walletId", label: "Wallet ID" },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Debit/Credit" },
    { id: "walletType", label: "WalletType " },
    { id: "Transcation ", label: "Transcation ID " },
    { id: "statue", label: "Status " },
  ];
  const distributortableLabels = [
    { id: "date", label: "Date/Time  " },
    { id: "walletId", label: "Wallet ID" },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Debit/Credit" },
    { id: "walletType", label: "WalletType " },
    { id: "Transcation ", label: "Transcation ID " },
    { id: "statue", label: "Status " },
  ];
  const MDtableLabels = [
    { id: "date", label: "Date/Time " },
    { id: "walletId", label: "Wallet ID" },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Debit/Credit" },
    { id: "walletType", label: "WalletType " },
    { id: "Transcation ", label: "Transcation ID " },
    { id: "statue", label: "Status " },
  ];

  const {
    startDate,
    endDate,
    onChangeStartDate,
    onChangeEndDate,
    open: openPicker,
    onOpen: onOpenPicker,
    onClose: onClosePicker,
    isSelected: isSelectedValuePicker,
    isError,
    shortLabel,
  } = useDateRangePicker(null, null);

  // Form Controller
  const FilterSchema = Yup.object().shape({});
  const defaultValues = {
    startDate: null,
    endDate: null,
    clientRefId: "",
    walletId: "",
    walletType: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getTransactional();
  }, [currentPage]);

  const getTransactional = () => {
    let token = localStorage.getItem("token");
    setSendLoading(true);
    handleClose();
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId") || "",
      walletId: getValues("walletId") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };
    Api(`agent/walletLedger`, "POST", body, token).then((Response: any) => {
      console.log("======Transaction==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setLadgerData(Response.data?.data?.data);
          setWalletCount(Response.data.data.totalNumberOfRecords);
          enqueueSnackbar(Response.data.message);
          setSendLoading(false);
          reset(defaultValues);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
          setSendLoading(false);
        }
      }
    });
  };

  const handleReset = () => {
    reset(defaultValues);
    setLadgerData([]);
    getTransactional();
  };

  return (
    <>
      <Helmet>
        <title>Wallet Ladger | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <Stack sx={{ maxHeight: window.innerHeight - 220 }}>
        <Stack flexDirection={"row"} gap={1} mb={1} justifyContent={"right"}>
          <Button variant="contained" onClick={handleReset}>
            <Iconify icon="bx:reset" color={"common.white"} mr={1} />
            Reset
          </Button>
          <Button variant="contained" onClick={handleOpen}>
            <Iconify
              icon="icon-park-outline:filter"
              color={"common.white"}
              mr={1}
            />{" "}
            Filter
          </Button>
        </Stack>
        <MotionModal
          open={open}
          onClose={handleClose}
          width={{ xs: "95%", sm: 500 }}
        >
          {/* <Box> */}
          <Stack mb={1}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(getTransactional)}
            >
              <Stack m={1} gap={1}>
                <RHFTextField
                  name="clientRefId"
                  placeholder={"Client Ref Id"}
                  fullWidth
                />
                <RHFTextField
                  name="walletId"
                  placeholder={"Wallet ID"}
                  fullWidth
                />
                <Stack flexDirection={"row"} gap={1}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start date"
                      inputFormat="DD/MM/YYYY"
                      value={watch("startDate")}
                      maxDate={new Date()}
                      onChange={(newValue: any) =>
                        setValue("startDate", newValue)
                      }
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          size={"small"}
                          sx={{ width: 250 }}
                        />
                      )}
                    />
                    <DatePicker
                      label="End date"
                      inputFormat="DD/MM/YYYY"
                      value={watch("endDate")}
                      minDate={watch("startDate")}
                      maxDate={new Date()}
                      onChange={(newValue: any) =>
                        setValue("endDate", newValue)
                      }
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          size={"small"}
                          sx={{ width: 250 }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <LoadingButton variant="contained" onClick={handleClose}>
                    Cancel
                  </LoadingButton>
                  <LoadingButton variant="contained" onClick={handleReset}>
                    <Iconify icon="bx:reset" color={"common.white"} mr={1} />{" "}
                    Reset
                  </LoadingButton>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={isSubmitting}
                  >
                    Apply
                  </LoadingButton>
                </Stack>
              </Stack>
            </FormProvider>
          </Stack>
          {/* </Box> */}
        </MotionModal>

        <Grid item xs={12} md={6} lg={8}>
          <TableContainer>
            <Scrollbar sx={{ maxHeight: window.innerHeight - 200 }}>
              <Table aria-label="customized table" stickyHeader size="small">
                <TableHeadCustom
                  headLabel={
                    user?.role == "m_distributor"
                      ? MDtableLabels
                      : user?.role == "distributor"
                      ? distributortableLabels
                      : agenttableLabels
                  }
                />

                <TableBody>
                  {(sendLoading ? [...Array(12)] : ladgerData).map((row: any) =>
                    sendLoading ? (
                      <WalletLadgerSkeleton />
                    ) : (
                      <LadgerRow key={row._id} row={row} />
                    )
                  )}
                </TableBody>
                {!sendLoading && (
                  <TableNoData isNotFound={!ladgerData?.length} />
                )}
              </Table>
            </Scrollbar>
          </TableContainer>
        </Grid>
      </Stack>

      <CustomPagination
        page={currentPage - 1}
        count={WalletCount}
        onPageChange={(
          event: React.MouseEvent<HTMLButtonElement> | null,
          newPage: number
        ) => setCurrentPage(newPage + 1)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setPageSize(parseInt(event.target.value));
          setCurrentPage(1);
        }}
      />
    </>
  );
}

const LadgerRow = ({ row }: any) => {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();

  const tableLabelsTO = [
    { id: "productName", label: "Product/TransactionType " },
    { id: "oldMainWalletBalance", label: " Opening/Closing" },
    { id: "commissionAmount", label: " Amount" },
    { id: "credit", label: "Credit/Debit " },
    { id: "GST/TDS", label: "GST/TDS " },
    { id: "Status", label: "Status " },
    { id: "BeneficiaryDetails", label: "BeneficiaryDetails" },
    { id: "operator", label: "Operator " },
    { id: "mobileNumber", label: "MobileNumber " },
  ];

  const [ToFromData, setToFromData] = useState<any>([]);
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
    getTransactionbyId(val.txnId);
    setToFromData(val);
  };
  const handleClose = () => {
    setModalEdit(false);
  };

  const [txnData, setTxnData] = useState([]);
  const getTransactionbyId = (val: string) => {
    let token = localStorage.getItem("token");

    Api(`transaction/transactionById/` + val, "GET", "", token).then(
      (Response: any) => {
        console.log("======transactionById==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            let iterateObj: any = Object.keys(Response.data.data).map(function (
              key
            ) {
              return (
                <option key={key} value={key}>
                  {Response.data.data[key]}
                </option>
              );
            });
            setTxnData(iterateObj);
            console.log(
              "======transactionById===data.data iterateObj====>",
              iterateObj
            );
          } else {
            console.log("======transactionById=======>" + Response);
          }
        }
      }
    );
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
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

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  return (
    <>
      <StyledTableRow
        key={row._id}
        role="checkbox"
        tabIndex={-1}
        sx={{ borderBottom: "1px solid #dadada" }}
      >
        <StyledTableCell>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", cursor: "pointer" }}
          >
            {row?.createdAt
              ? fDateTime(row?.createdAt)
              : fDateTime(row?.createdAt)}
          </Typography>
        </StyledTableCell>
        <StyledTableCell>
          <Typography variant="body2">{row?.walletId}</Typography>
        </StyledTableCell>
        <StyledTableCell>
          {row?.transaction?.productName && (
            <Stack direction="row" gap={0.5}>
              <Typography variant="subtitle2">Remark :</Typography>
              <Typography variant="body2">{row?.remarks || "-"}</Typography>
            </Stack>
          )}

          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2">Transaction Type : </Typography>
            <Typography variant="body2">
              {row?.transaction?.transactionType}
            </Typography>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          <Stack direction="row">
            <Typography variant="subtitle2"></Typography>
            <Typography variant="body2">
              {row?.transaction?.productName || "-"}
            </Typography>
          </Stack>

          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2"></Typography>
            <Typography variant="body2">
              {/* {row?.transaction?.transactionType} */}
            </Typography>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2">
              {fIndianCurrency(row?.transaction?.amount) || "0"}
            </Typography>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          {user?._id === row?.to?.id?._id ? (
            <Typography sx={{ color: "success.dark" }}>
              {fIndianCurrency(row?.to?.amount) || "0"}
            </Typography>
          ) : (
            <Typography color={"error"}>
              {fIndianCurrency(row?.from?.amount) || "0"}{" "}
            </Typography>
          )}
        </StyledTableCell>

        <StyledTableCell>
          <Stack direction={"row"} fontSize={15}>
            {user?._id === row?.to?.id?._id ? (
              <>
                <Label
                  variant="soft"
                  color={
                    (row?.to?.walletType === "MAIN" && "error") ||
                    (row?.to?.walletType === "AEPS" && "warning") ||
                    "success"
                  }
                  sx={{ textTransform: "capitalize" }}
                >
                  {row?.to?.walletType}
                </Label>
                :
                {row?.to?.walletType === "MAIN" ? (
                  <>{fIndianCurrency(row?.to?.newMainWalletBalance || "0")}</>
                ) : (
                  <>{fIndianCurrency(row?.to?.newAepsWalletBalance || "0")}</>
                )}
              </>
            ) : (
              <>
                <Label
                  variant="soft"
                  color={
                    (row?.from?.walletType === "MAIN" && "error") ||
                    (row?.from?.walletType === "AEPS" && "warning") ||
                    "success"
                  }
                  sx={{ textTransform: "capitalize" }}
                >
                  {row?.from?.walletType}
                </Label>
                :
                {row?.from?.walletType === "MAIN" ? (
                  <>{fIndianCurrency(row?.from?.newMainWalletBalance || "0")}</>
                ) : (
                  <>{fIndianCurrency(row?.from?.newAepsWalletBalance || "0")}</>
                )}
              </>
            )}
          </Stack>
        </StyledTableCell>

        {row?.transaction?.clientRefId ? (
          <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
            <Stack flexDirection={"row"} gap={1} alignItems={"center"}>
              <Typography
                onClick={() => openEditModal(row)}
                variant="body1"
                sx={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {row?.transaction?.clientRefId || "-"}{" "}
              </Typography>
              <Tooltip title="Copy" placement="top">
                <IconButton
                  onClick={() => onCopy(row?.transaction?.clientRefId)}
                >
                  <Iconify icon="eva:copy-fill" width={20} />
                </IconButton>
              </Tooltip>
            </Stack>
          </StyledTableCell>
        ) : (
          <Typography variant="body1" sx={{ m: 4 }}>
            No Trasaction
          </Typography>
        )}

        <StyledTableCell
          sx={{
            textTransform: "lowercase",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          <Label
            variant="soft"
            color={
              (row.transaction.status === "failed" && "error") ||
              ((row.transaction.status === "pending" ||
                row.transaction.status === "in_process") &&
                "warning") ||
              "success"
            }
            sx={{ textTransform: "capitalize" }}
          >
            {row.transaction.status ? sentenceCase(row.transaction.status) : ""}
          </Label>
        </StyledTableCell>
      </StyledTableRow>

      <MotionModal
        open={open}
        onClose={handleClose}
        width={{ xs: "100%", sm: "90%" }}
      >
        <Grid item xs={6} md={6}>
          <Card>
            <TableContainer style={{ margin: "0 auto", maxHeight: "300px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {tableLabelsTO.map((column: any) => (
                      <TableCell key={column.id}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow
                    key={ToFromData._id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    sx={{ borderBottom: "1px solid #dadada" }}
                  >
                    <TableCell>
                      {row?.transaction?.productName && (
                        <Stack direction="row" gap={0.5}>
                          <Typography variant="subtitle2">Product:</Typography>
                          <Typography variant="body2">
                            {row?.transaction?.productName || "-"}
                          </Typography>
                        </Stack>
                      )}

                      <Stack gap={0.5}>
                        <Typography variant="subtitle2">
                          Transaction Type:
                        </Typography>
                        <Typography variant="body2">
                          {row?.transaction?.transactionType}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {user?.role == "agent" ? (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction?.agentDetails
                                  ?.oldMainWalletBalance || "-"
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction?.agentDetails
                                  ?.newMainWalletBalance
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails
                                ?.commissionAmount || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.agentDetails
                                  ?.creditedAmount
                              }
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction?.agentDetails?.TDSAmount
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    ) : user?.role == "distributor" ? (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction?.distributorDetails
                                  ?.oldMainWalletBalance || "-"
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction?.distributorDetails
                                  ?.newMainWalletBalance
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.distributorDetails
                                ?.commissionAmount || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.distributorDetails
                                  ?.creditedAmount
                              }
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {
                                ToFromData?.transaction?.distributorDetails
                                  ?.TDSAmount
                              }
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Opening:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction
                                  ?.masterDistributorDetails
                                  ?.oldMainWalletBalance || "-"
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction
                                  ?.masterDistributorDetails
                                  ?.newMainWalletBalance
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction
                                  ?.masterDistributorDetails
                                  ?.commissionAmount || "-"
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction
                                  ?.masterDistributorDetails?.creditedAmount
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {fIndianCurrency(
                                ToFromData?.transaction
                                  ?.masterDistributorDetails?.TDSAmount
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </>
                    )}

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Credit:</Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(ToFromData?.transaction?.credit)}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Debit:</Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(ToFromData?.transaction?.debit)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">TDS:</Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(ToFromData?.transaction?.TDS)}
                        </Typography>
                      </Stack>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">GST:</Typography>
                        <Typography variant="body2">
                          {fIndianCurrency(ToFromData?.transaction?.GST)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Status:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.status}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Bank:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.bankName
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">AccNumber:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.accountNumber
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">beneName:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.beneName
                          }
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">ifsc:</Typography>
                        <Typography variant="body2">
                          {
                            ToFromData?.transaction
                              ?.moneyTransferBeneficiaryDetails?.ifsc
                          }
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Bank:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key1}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">IFSC:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key2}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">AccNumber:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.operator?.key3}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {ToFromData?.transaction?.mobileNumber}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                mt: 5,
                ml: 1,
              }}
            >
              Close
            </Button>
          </Card>
        </Grid>
      </MotionModal>
    </>
  );
};
