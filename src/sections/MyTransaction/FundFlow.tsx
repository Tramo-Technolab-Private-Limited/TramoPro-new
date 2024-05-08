import { useEffect, useState } from "react";

// @mui
import {
  Stack,
  Grid,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Avatar,
  MenuItem,
  Tooltip,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useSnackbar } from "notistack";
import React from "react";

import Scrollbar from "src/components/scrollbar";
import { TableHeadCustom, TableNoData } from "src/components/table";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import FileFilterButton from "./FileFilterButton";
import Iconify from "src/components/iconify/Iconify";
import ApiDataLoading from "../../components/customFunctions/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDate, fDateFormatForApi, fDateTime } from "src/utils/formatTime";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { LoadingButton } from "@mui/lab";
import CustomPagination from "src/components/customFunctions/CustomPagination";
import { sentenceCase } from "change-case";
import Label from "src/components/label/Label";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { CustomAvatar } from "src/components/custom-avatar";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useResponsive from "src/hooks/useResponsive";
import { fCurrency } from "src/utils/formatNumber";
import MotionModal from "src/components/animate/MotionModal";
import { FundFlowTransactionSkeleton } from "src/components/skeletons/FundFlowTransactionSkeleton";
// ----------------------------------------------------------------------
type FormValuesProps = {
  transactionType: string;
  status: string;
  clientRefId: string;
  startDate: Date | null;
  endDate: Date | null;
};

export default function FundFlow() {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useResponsive("up", "sm");
  const [Loading, setLoading] = useState(false);
  const [superCurrentTab, setSuperCurrentTab] = useState(1);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>(0);
  const [sdata, setSdata] = useState([]);
  const [pageSize, setPageSize] = useState<any>(25);
  const [stats, setStats] = useState({
    debit: 0,
    credit: 0,
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const txnSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
  });

  const defaultValues = {
    transactionType: "",
    category: "",
    status: "",
    clientRefId: "",
    startDate: null,
    endDate: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(txnSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    getTransaction();
  }, [currentPage, pageSize]);

  useEffect(() => setCurrentPage(1), [superCurrentTab]);

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

  const getTransaction = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId"),
      status: getValues("status"),
      transactionType: getValues("transactionType"),
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);

            enqueueSnackbar(Response.data.message);
            setStats((prevState) => ({
              ...prevState,
              debit: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (user?._id == currentValue?.walletLedgerData?.from?.id) {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
              credit: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (user?._id != currentValue?.walletLedgerData?.from?.id) {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
            }));
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
          setLoading(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setLoading(false);
        }
      }
    );
  };

  const formattedStart = startDate
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(startDate)
    : "";
  const formattedSEndDate = endDate
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      }).format(endDate)
    : "";

  const filterTransaction = (data: FormValuesProps) => {
    setCurrentPage(1);
    setLoading(true);
    handleClose();
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: data.clientRefId,
      status: data.status,
      transactionType: data.transactionType,
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };
    Api(`transaction/fund_flow_transaction`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);
            enqueueSnackbar(Response.data.message);
            reset(defaultValues);
            const debit = Response.data.data.data.reduce(
              (accumulator: number, currentValue: any) => {
                if (user?._id == currentValue?.walletLedgerData?.from?.id) {
                  return accumulator + currentValue.amount;
                } else {
                  return accumulator + 0;
                }
              },
              0
            );

            console.log("debit", debit);
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
  };

  const handleReset = () => {
    reset(defaultValues);
    setSdata([]);
    getTransaction();
  };

  const tableLabels = [
    { id: "Date&Time", label: "Fund Flow Details" },
    { id: "From", label: "From/To" },
    // { id: "to", label: "To" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
  ];

  return (
    <>
      <Helmet>
        <title> Transactions | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>
      <Stack flexDirection={"row"} gap={1} justifyContent={"space-between"}>
        <Stack flexDirection={"row"} gap={1}>
          <Label variant="soft" color="error">
            {`Total Debit: ${fCurrency(stats.debit)}`}
          </Label>
          <Label variant="soft" color="success">
            {`Total Credit: ${fCurrency(stats.credit)}`}
          </Label>
        </Stack>
        <Stack flexDirection={"row"} gap={1} mb={1}>
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
            onSubmit={handleSubmit(filterTransaction)}
          >
            <Stack gap={1} m={1}>
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
              <RHFSelect
                name="status"
                label="Status"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_process">In process</MenuItem>
                <MenuItem value="hold">Hold</MenuItem>
                <MenuItem value="initiated">Initiated</MenuItem>
              </RHFSelect>
              <RHFTextField name="clientRefId" label="Client Ref Id" />
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
                        sx={{ width: 150 }}
                      />
                    )}
                  />
                  <DatePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("endDate")}
                    minDate={watch("startDate")}
                    maxDate={new Date()}
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size={"small"}
                        sx={{ width: 150 }}
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
        <>
          <Scrollbar
            sx={
              isMobile
                ? { maxHeight: window.innerHeight - 204 }
                : { maxHeight: window.innerHeight - 170 }
            }
          >
            <Table
              sx={{ minWidth: 720 }}
              stickyHeader
              aria-label="sticky table"
            >
              <TableHeadCustom headLabel={tableLabels} />
              <TableBody>
                {(Loading ? [...Array(20)] : sdata).map((row: any) =>
                  Loading ? (
                    <FundFlowTransactionSkeleton />
                  ) : (
                    <TransactionRow key={row._id} row={row} />
                  )
                )}
              </TableBody>
              {!Loading && <TableNoData isNotFound={!sdata.length} />}
            </Table>
          </Scrollbar>
          <CustomPagination
            page={currentPage - 1}
            count={pageCount}
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
          />
        </>
      </Grid>
    </>
  );
}

type childProps = {
  row: any;
};

const TransactionRow = React.memo(({ row }: childProps) => {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  return (
    <>
      <TableRow hover key={newRow._id}>
        {/* client ref id */}
        <TableCell>
          <Typography variant="body2" noWrap>
            {fDateTime(newRow?.createdAt)}{" "}
          </Typography>
          <Typography variant="body2">{newRow?.transactionType} </Typography>
          <Typography variant="body2">
            {newRow?.clientRefId}{" "}
            <Tooltip title="Copy" placement="top">
              <IconButton onClick={() => onCopy(newRow?.clientRefId)}>
                <Iconify icon="eva:copy-fill" width={20} />
              </IconButton>
            </Tooltip>
          </Typography>
        </TableCell>
        {/* From */}
        <TableCell>
          {newRow?.walletLedgerData?.from?.id !== user?._id ? (
            <>
              {newRow?.walletLedgerData?.from?.id ==
              newRow?.adminDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.adminDetails?.id?.email}
                    alt={newRow?.adminDetails?.id?.email}
                    src={
                      newRow?.adminDetails?.id?.selfie &&
                      newRow?.adminDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      Admin
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              ) : newRow?.walletLedgerData?.from?.id ==
                newRow.agentDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.agentDetails?.id?.firstName}
                    alt={newRow?.agentDetails?.id?.firstName}
                    src={
                      newRow?.agentDetails?.id?.selfie &&
                      newRow?.agentDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {newRow?.agentDetails?.id?.company_name
                        ? newRow?.agentDetails?.id?.company_name
                        : " No Shop Name "}
                    </Typography>
                  </Stack>
                </Stack>
              ) : newRow?.walletLedgerData?.from?.id ==
                newRow.distributorDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.distributorDetails?.id?.firstName}
                    alt={newRow?.distributorDetails?.id?.firstName}
                    src={
                      newRow?.distributorDetails?.id?.selfie &&
                      newRow?.distributorDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {newRow?.company_name
                        ? newRow?.company_name
                        : " No Shop Name "}
                    </Typography>
                  </Stack>
                </Stack>
              ) : newRow?.walletLedgerData?.from?.id ==
                newRow.masterDistributorDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.masterDistributorDetails?.id?.firstName}
                    alt={newRow?.masterDistributorDetails?.id?.firstName}
                    src={
                      newRow?.masterDistributorDetails?.id?.selfie &&
                      newRow?.masterDistributorDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                      {newRow?.masterDistributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.masterDistributorDetails?.id?.userCode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {newRow?.company_name
                        ? newRow?.company_name
                        : " No Shop Name "}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.agentDetails?.id?.firstName}
                    alt={newRow?.agentDetails?.id?.firstName}
                    src={
                      newRow?.agentDetails?.id?.selfie &&
                      newRow?.agentDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {newRow?.agentDetails?.id?.company_name
                        ? newRow?.agentDetails?.id?.company_name
                        : " No Shop Name "}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </>
          ) : (
            <>
              {newRow?.walletLedgerData?.to?.id ==
              newRow.adminDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.adminDetails?.id?.email}
                    alt={newRow?.adminDetails?.id?.email}
                    src={
                      newRow?.adminDetails?.id?.selfie &&
                      newRow?.adminDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      Admin
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {newRow?.adminDetails?.id?.email}
                    </Typography>
                  </Stack>
                </Stack>
              ) : newRow?.walletLedgerData?.to?.id ==
                newRow.agentDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.agentDetails?.id?.firstName}
                    alt={newRow?.agentDetails?.id?.firstName}
                    src={
                      newRow?.agentDetails?.id?.selfie &&
                      newRow?.agentDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.agentDetails?.id?.firstName}{" "}
                      {newRow?.agentDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.agentDetails?.id?.userCode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {newRow?.agentDetails?.id?.company_name
                        ? newRow?.agentDetails?.id?.company_name
                        : " No Shop Name "}
                    </Typography>
                  </Stack>
                </Stack>
              ) : newRow?.walletLedgerData?.to?.id ==
                newRow.distributorDetails.id?._id ? (
                <Stack flexDirection={"row"} gap={1}>
                  <CustomAvatar
                    name={newRow?.distributorDetails?.id?.firstName}
                    alt={newRow?.distributorDetails?.id?.firstName}
                    src={
                      newRow?.distributorDetails?.id?.selfie &&
                      newRow?.distributorDetails?.id?.selfie[0]
                    }
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {newRow?.distributorDetails?.id?.firstName}{" "}
                      {newRow?.distributorDetails?.id?.lastName}
                    </Typography>
                    <Typography variant="body2">
                      {newRow?.distributorDetails?.id?.userCode}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                newRow?.walletLedgerData?.to?.id ==
                  newRow.masterDistributorDetails.id?._id && (
                  <Stack flexDirection={"row"} gap={1}>
                    <CustomAvatar
                      name={newRow?.masterDistributorDetails?.id?.firstName}
                      alt={newRow?.masterDistributorDetails?.id?.firstName}
                      src={
                        newRow?.masterDistributorDetails?.id?.selfie &&
                        newRow?.masterDistributorDetails?.id?.selfie[0]
                      }
                    />
                    <Stack>
                      <Typography variant="body2" noWrap>
                        {newRow?.masterDistributorDetails?.id?.firstName}{" "}
                        {newRow?.masterDistributorDetails?.id?.lastName}
                      </Typography>
                      <Typography variant="body2">
                        {newRow?.masterDistributorDetails?.id?.userCode}
                      </Typography>
                    </Stack>
                  </Stack>
                )
              )}
            </>
          )}
        </TableCell>

        {/* Transaction */}
        <TableCell sx={{ whiteSpace: "nowrap" }}>
          {user?._id == newRow?.walletLedgerData?.from?.id ? (
            <Typography variant="body2" color={"error.main"}>
              - {newRow.amount}
            </Typography>
          ) : (
            <Typography variant="body2" color={"success.main"}>
              + {newRow.amount}
            </Typography>
          )}
        </TableCell>

        <TableCell
          sx={{
            textTransform: "lowercase",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <Typography>
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
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
});
