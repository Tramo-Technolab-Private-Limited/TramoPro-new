import { useEffect, useRef, useState } from "react";

// @mui
import {
  Stack,
  Grid,
  TextField,
  Tabs,
  tableCellClasses,
  Button,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  styled,
  useTheme,
  Tooltip,
  Modal,
  TableContainer,
  Avatar,
  Card,
  Divider,
  MenuItem,
  Container,
  Chip,
  TableHead,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import React from "react";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar";
import { TableHeadCustom, TableNoData } from "src/components/table";
import receipt_long from "../assets/icons/receipt_long.svg";
import Group from "../assets/icons/Group.svg";
import autorenew from "../assets/icons/autorenew.svg";
import LogoMain from "../assets/icons/tramoTrmao-Final-Logo.svg";
import DateRangePicker, {
  useDateRangePicker,
} from "src/components/date-range-picker";
import FileFilterButton from "../sections/MyTransaction/FileFilterButton";
import Iconify from "src/components/iconify/Iconify";
import ReactToPrint from "react-to-print";
import * as XLSX from "xlsx";
import { fDate, fDateTime } from "../utils/formatTime";
import Image from "../components/image";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import { useAuthContext } from "src/auth/useAuthContext";
import CustomPagination from "src/components/customFunctions/CustomPagination";
import FormProvider, { RHFSelect, RHFTextField } from "../components/hook-form";
import { LoadingButton } from "@mui/lab";
import Logo from "src/components/logo/Logo";
import { fIndianCurrency } from "src/utils/formatNumber";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import { Icon } from "@iconify/react";
import useResponsive from "src/hooks/useResponsive";
import { CustomAvatar } from "src/components/custom-avatar";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { fDateFormatForApi } from "src/utils/formatTime";
import MotionModal from "src/components/animate/MotionModal";
import { convertToWords } from "src/components/customFunctions/ToWords";

// ----------------------------------------------------------------------

type FormValuesProps = {
  status: string;
  clientRefId: string;
  category: string;
  product: string;
  accountNumber: string;
  mobileNumber: string;
  startDate: Date | null;
  endDate: Date | null;
  sDate: Date | null;
  eDate: Date | null;
};

export default function MyTransactions() {
  let token = localStorage.getItem("token");
  const isMobile = useResponsive("up", "sm");
  const isDesktop = useResponsive("up", "sm");
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [Loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>(0);
  const [categoryList, setCategoryList] = useState([]);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentTab, setCurrentTab] = useState("all");
  const [ProductList, setProductList] = useState([]);
  const [filterdValue, setFilterdValue] = useState<any>([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [sumOfTransactions, setSumOfTransactions] = useState({
    success: 0,
    failed: 0,
    pending: 0,
    in_process: 0,
    hold: 0,
    initiated: 0,
  });

  const txnSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
  });

  const defaultValues = {
    category: "",
    status: "",
    clientRefId: "",
    product: "",
    sDate: null,
    eDate: null,
    accountNumber: "",
    mobileNumber: "",
    startDate: null,
    endDate: null,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(txnSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getCategoryList();
    getTransaction();
  }, [currentPage]);

  useEffect(() => setCurrentPage(1), [currentTab]);

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
  } = useDateRangePicker(new Date(), new Date());

  const getProductlist = (val: string) => {
    Api(`product/get_ProductList/${val}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setProductList(Response.data.data);
          }
        }
      }
    );
  };

  const getCategoryList = () => {
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(Response.data.data);
        }
      }
    });
  };

  const getTransaction = () => {
    setLoading(true);
    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
      clientRefId: getValues("clientRefId"),
      accountNumber: getValues("accountNumber"),
      mobileNumber: getValues("mobileNumber"),
      status: getValues("status"),
      transactionType: "",
      categoryId: getValues("category"),
      productId: getValues("product") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };

    Api(`transaction/transactionByUser`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setFilterdValue(Response.data.data.data);
            setPageCount(Response.data.data.totalNumberOfRecords);
            setCurrentTab("");
            enqueueSnackbar(Response.data.message);

            setSumOfTransactions((prevState) => ({
              ...prevState,
              success: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "success") {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),

              failed: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "failed") {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
              pending: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "pending") {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
              in_process: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "in_process") {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
              hold: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "hold") {
                    return accumulator + currentValue.amount;
                  } else {
                    return accumulator + 0;
                  }
                },
                0
              ),
              initiated: Response.data.data.data.reduce(
                (accumulator: number, currentValue: any) => {
                  if (currentValue.status == "initiated") {
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

  const filterTransaction = async (data: FormValuesProps) => {
    setCurrentPage(1);
    try {
      setFilterdValue([]);
      setLoading(true);
      let body = {
        pageInitData: {
          pageSize: pageSize,
          currentPage: currentPage,
        },
        clientRefId: data.clientRefId,
        status: data.status,
        transactionType: "",
        categoryId: data.category,
        productId: data.product,
        mobileNumber: data.mobileNumber,
        accountNumber: data.accountNumber,
        startDate: fDateFormatForApi(getValues("startDate")),
        endDate: fDateFormatForApi(getValues("endDate")),
      };
      await Api(`transaction/transactionByUser`, "POST", body, token).then(
        (Response: any) => {
          console.log("======Transaction==response=====>" + Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              setFilterdValue(Response.data.data.data);
              setPageCount(Response.data.data.totalNumberOfRecords);
              handleClose();
              enqueueSnackbar(Response.data.message);
              setSumOfTransactions((prevState) => ({
                ...prevState,
                success: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "success") {
                      return accumulator + currentValue.amount;
                    } else {
                      return accumulator + 0;
                    }
                  },
                  0
                ),

                failed: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "failed") {
                      return accumulator + currentValue.amount;
                    } else {
                      return accumulator + 0;
                    }
                  },
                  0
                ),
                pending: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "pending") {
                      return accumulator + currentValue.amount;
                    } else {
                      return accumulator + 0;
                    }
                  },
                  0
                ),
                in_process: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "in_process") {
                      return accumulator + currentValue.amount;
                    } else {
                      return accumulator + 0;
                    }
                  },
                  0
                ),
                hold: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "hold") {
                      return accumulator + currentValue.amount;
                    } else {
                      return accumulator + 0;
                    }
                  },
                  0
                ),
                initiated: Response.data.data.data.reduce(
                  (accumulator: number, currentValue: any) => {
                    if (currentValue.status == "initiated") {
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
            setLoading(false);
            enqueueSnackbar("Failed", { variant: "error" });
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
  const handleDelete = (val: string) => {
    setFilterdValue(
      filterdValue.filter((item: any) => {
        return val != item.key;
      })
    );
    if (val == "clientRefId") resetField("clientRefId");
    if (val == "status") resetField("status");
    if (val == "categoryName") {
      setValue("category", "");
      resetField("category");
    }

    if (val == "startDate") setValue("startDate", null);
    if (val == "endDate") setValue("endDate", null);
    if (val == "productName") {
      resetField("product");
      setValue("product", "");
    }
  };

  const tableLabels = [
    { id: "Date&Time", label: "Txn Details" },
    { id: "agent", label: "Agent" },
    { id: "dist", label: "Distributor" },
    { id: "mode", label: "Mode" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/ Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/ Ref Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/Commission", label: "Charge/ Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    // { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];
  const tableLabels1 = [
    { id: "Date&Time", label: "Txn Details" },

    { id: "agent", label: "Agent" },
    { id: "mode", label: "Mode" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/ Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/ Ref Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/ Commission", label: "Charge/ Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    // { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];
  const tableLabels2 = [
    { id: "Date&Time", label: "Txn Details" },
    { id: "mode", label: "Mode" },
    { id: "Product", label: "Product" },
    { id: "Operator", label: "Operator/ Beneficiary" },
    { id: "Mobile Number", label: "Mobile Number" },
    { id: "Operator Txn ID", label: "UTR/ Ref Number" },
    { id: "Opening Balance", label: "Opening Balance" },
    { id: "Txn Amount", label: "Txn Amount" },
    { id: "Charge/ Commission", label: "Charge/ Commission" },
    { id: "Closing Balance", label: "Closing Balance" },
    { id: "GST/TDS", label: "GST/TDS" },
    { id: "status", label: "Status" },
    { id: "Action", label: "Action" },
  ];

  const ExportData = () => {
    let token = localStorage.getItem("token");

    let body = {
      pageInitData: {
        pageSize: "",
        currentPage: "",
      },
      clientRefId: getValues("clientRefId"),
      accountNumber: getValues("accountNumber"),
      mobileNumber: getValues("mobileNumber"),
      status: getValues("status"),
      transactionType: "",
      categoryId: getValues("category"),
      productId: getValues("product") || "",
      startDate: fDateFormatForApi(getValues("startDate")),
      endDate: fDateFormatForApi(getValues("endDate")),
    };

    Api(`transaction/transactionByUser`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            if (Response.data.data.data.length) {
              const Dataapi = Response.data.data.data;
              console.log("Dataapi", Dataapi);
              const formattedData = Response.data?.data?.data.map(
                (item: any) => ({
                  createdAt: new Date(item?.createdAt).toLocaleString(),
                  client_ref_Id: item?.client_ref_Id,
                  transactionType: item?.transactionType,
                  productName: item?.productName,
                  categoryName: item?.categoryName,
                  "User Name":
                    user?._id === item?.agentDetails?.id?._id
                      ? item?.agentDetails?.id?.firstName
                      : user?._id === item?.distributorDetails?.id?._id
                      ? item?.distributorDetails?.id?.firstName
                      : user?._id === item?.masterDistributorDetails?.id?._id
                      ? item?.masterDistributorDetails?.id?.firstName
                      : "",

                  "Opening Balance":
                    user?._id === item?.agentDetails?.id?._id
                      ? item?.agentDetails?.oldMainWalletBalance
                      : user?._id === item?.distributorDetails?.id?._id
                      ? item?.distributorDetails?.oldMainWalletBalance
                      : user?._id === item?.masterDistributorDetails?.id?._id
                      ? item?.masterDistributorDetails?.oldMainWalletBalance
                      : "",

                  "Closing Balance":
                    user?._id === item?.agentDetails?.id?._id
                      ? item?.agentDetails?.newMainWalletBalance
                      : user?._id === item?.distributorDetails?.id?._id
                      ? item?.distributorDetails?.newMainWalletBalance
                      : user?._id === item?.masterDistributorDetails?.id?._id
                      ? item?.masterDistributorDetails?.newMainWalletBalance
                      : "",
                  " Commission Amount":
                    user?._id === item?.agentDetails?.id?._id
                      ? item?.agentDetails?.commissionAmount
                      : user?._id === item?.distributorDetails?.id?._id
                      ? item?.distributorDetails?.commissionAmount
                      : user?._id === item?.masterDistributorDetails?.id?._id
                      ? item?.masterDistributorDetails?.commissionAmount
                      : "",
                  amount: item?.amount,
                  credit: item?.credit,
                  debit: item?.debit,
                  TDS: item?.TDS,
                  GST: item?.GST,
                  ipAddress: item?.metaData?.ipAddress,
                  deviceType: item?.checkStatus?.deviceType,
                  three_way_recoon: item?.three_way_recoon,
                  status: item?.status,
                  bankName: item?.moneyTransferBeneficiaryDetails?.bankName,
                  accountNumber:
                    item?.moneyTransferBeneficiaryDetails?.accountNumber,
                  vendorUtrNumber: item?.vendorUtrNumber,
                  providerBank: item?.providerBank,
                  ifsc: item?.ifsc,
                  operator: item?.key1,
                  number: item?.key2,
                  mobileNumber: item?.mobileNumber,
                })
              );

              const ws = XLSX.utils.json_to_sheet(formattedData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

              const currentDate = fDateTime(new Date());
              XLSX.writeFile(wb, `Transaction${currentDate}.xlsx`);
              handleClose();
            } else {
              enqueueSnackbar("Data Not Found ", { variant: "error" });
            }
          }
        }
      }
    );
  };

  const handleReset = () => {
    reset(defaultValues);
    setFilterdValue([]);
    getTransaction();
  };

  return (
    <>
      <Helmet>
        <title> Transactions | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>
      <Stack
        flexDirection={"row"}
        justifyContent={isDesktop ? "space-between" : "end"}
        gap={1}
        mb={1}
      >
        {/* <Stack flexDirection={"row"} m={1} gap={1}>
          {filterdValue.length > 0 &&
            filterdValue.map((item: any) => {
              return (
                item.value && (
                  <Chip
                    key={item.key}
                    label={item.value}
                    onDelete={() => handleDelete(item.key)}
                  />
                )
              );
            })}
        </Stack> */}

        <Scrollbar>
          <Stack flexDirection={"row"} gap={2} sx={{ minWidth: 720 }}>
            <Label
              variant="soft"
              color={"success"}
              sx={{ textTransform: "capitalize" }}
            >
              Success : {fIndianCurrency(sumOfTransactions?.success) || "₹" + 0}
            </Label>
            <Label
              variant="soft"
              color={"error"}
              sx={{ textTransform: "capitalize" }}
            >
              Failed : {fIndianCurrency(sumOfTransactions?.failed) || "₹" + 0}
            </Label>
            <Label
              variant="soft"
              color={"warning"}
              sx={{ textTransform: "capitalize" }}
            >
              Pending : {fIndianCurrency(sumOfTransactions?.pending) || "₹" + 0}
            </Label>
            <Label
              variant="soft"
              color={"info"}
              sx={{ textTransform: "capitalize" }}
            >
              In Process :{" "}
              {fIndianCurrency(sumOfTransactions?.in_process) || "₹" + 0}
            </Label>
            <Label
              variant="soft"
              color={"warning"}
              sx={{ textTransform: "capitalize" }}
            >
              Hold : {fIndianCurrency(sumOfTransactions?.hold) || "₹" + 0}
            </Label>
            <Label
              variant="soft"
              color={"info"}
              sx={{ textTransform: "capitalize" }}
            >
              Initiated :{" "}
              {fIndianCurrency(sumOfTransactions?.initiated) || "₹" + 0}
            </Label>
          </Stack>
        </Scrollbar>

        <Stack flexDirection={"row"} gap={1}>
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
      <Stack>
        <MotionModal
          open={open}
          onClose={handleClose}
          width={{ xs: "95%", sm: 500 }}
        >
          {/* <Box> */}
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(filterTransaction)}
          >
            <Stack gap={1} m={1}>
              <RHFSelect
                name="category"
                label="Category"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {categoryList.map((item: any) => {
                  return (
                    <MenuItem
                      key={item._id}
                      value={item._id}
                      onClick={() => getProductlist(item._id)}
                    >
                      {item?.category_name}
                    </MenuItem>
                  );
                })}
              </RHFSelect>
              <RHFSelect
                name="product"
                label="Product"
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
              >
                <MenuItem value="">All</MenuItem>
                {ProductList.map((item: any) => {
                  return (
                    <MenuItem value={item._id}>{item?.productName}</MenuItem>
                  );
                })}
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
              <RHFTextField name="clientRefId" label="Transaction Id" />
              <RHFTextField name="accountNumber" label="AccountNumber" />
              <RHFTextField name="mobileNumber" label="MobileNumber" />
              <Stack direction={"row"} gap={1}>
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
                        sx={{ maxWidth: 250 }}
                      />
                    )}
                  />
                  <DatePicker
                    label="End date"
                    inputFormat="DD/MM/YYYY"
                    value={watch("endDate")}
                    minDate={watch("startDate")}
                    maxDate={
                      watch("startDate")
                        ? dayjs(watch("startDate")).add(31, "days").toDate()
                        : null
                    }
                    onChange={(newValue: any) => setValue("endDate", newValue)}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size={"small"}
                        sx={{ maxWidth: 250 }}
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
                <Button variant="contained" onClick={ExportData}>
                  Export
                </Button>
              </Stack>
            </Stack>
          </FormProvider>
          {/* </Box> */}
        </MotionModal>

        <Grid item xs={12} md={6} lg={8}>
          <>
            {Loading ? (
              <ApiDataLoading />
            ) : (
              <Scrollbar
                sx={
                  isMobile
                    ? { maxHeight: window.innerHeight - 190 }
                    : { maxHeight: window.innerHeight - 250 }
                }
              >
                <Table size="small" aria-label="customized table" stickyHeader>
                  <TableHeadCustom
                    headLabel={
                      user?.role == "m_distributor"
                        ? tableLabels
                        : user?.role == "distributor"
                        ? tableLabels1
                        : tableLabels2
                    }
                  />

                  <TableBody>
                    {filterdValue.map((row: any) => (
                      <TransactionRow key={row._id} row={row} />
                    ))}
                  </TableBody>
                  <TableNoData isNotFound={!filterdValue.length} />
                </Table>
              </Scrollbar>
            )}
            {!Loading && (
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
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >
                ) => {
                  setPageSize(parseInt(event.target.value));
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        </Grid>
      </Stack>
    </>
  );
}

type childProps = {
  row: any;
};

function TransactionRow({ row }: childProps) {
  const theme = useTheme();
  const { copy } = useCopyToClipboard();
  const { user } = useAuthContext();
  const componentRef = useRef<any>();
  const { enqueueSnackbar } = useSnackbar();
  const [newRow, setNewRow] = useState(row);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [convienienceFee, setConvienienceFee] = useState(0);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const CheckTransactionStatus = (row: any) => {
    setLoading(true);
    let token = localStorage.getItem("token");
    let rowFor = row;
    Api(
      rowFor.categoryName.toLowerCase() == "money transfer"
        ? `moneyTransfer/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "recharges"
        ? `agents/v1/checkStatus/` + rowFor._id
        : rowFor.categoryName.toLowerCase() == "dmt2"
        ? `dmt2/transaction/status/` + rowFor._id
        : rowFor.transactionType == "Wallet To Bank Account Settlement" &&
          `settlement/checkStatus/` + rowFor._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);

          setNewRow({ ...newRow, status: Response.data.data.status });
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  };

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 720 },
    bgcolor: "#ffffff",
    borderRadius: 2,
  };

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
            <Tooltip title="Copy" placement="top">
              <IconButton onClick={() => onCopy(newRow?.clientRefId)}>
                <Iconify icon="eva:copy-fill" width={20} />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="body2" whiteSpace={"nowrap"}>
            {fDateTime(newRow?.createdAt)}
          </Typography>
        </StyledTableCell>

        {user?.role === "distributor" && (
          <StyledTableCell>
            <Stack flexDirection={"row"} gap={1}>
              <CustomAvatar
                name={newRow?.agentDetails?.id?.firstName}
                alt={newRow?.agentDetails?.id?.firstName}
                src={newRow?.agentDetails?.id?.selfie[0]}
              />
              <Stack>
                <Typography variant="body2" noWrap>
                  {newRow?.agentDetails?.id?.firstName}{" "}
                  {newRow?.agentDetails?.id?.lastName}
                </Typography>
                <Typography variant="body2">
                  {newRow?.agentDetails?.id?.userCode}
                </Typography>
                <Typography variant="body2" noWrap>
                  {newRow?.company_name ? newRow?.company_name : "No Shop Name"}
                </Typography>
              </Stack>
            </Stack>
          </StyledTableCell>
        )}

        {/* Distributor Detail */}
        {user?.role === "m_distributor" && (
          <>
            <StyledTableCell>
              <Stack flexDirection={"row"} gap={1}>
                <CustomAvatar
                  name={newRow?.agentDetails?.id?.firstName}
                  alt={newRow?.agentDetails?.id?.firstName}
                  src={newRow?.agentDetails?.id?.selfie[0]}
                />
                <Stack>
                  <Typography variant="body2" noWrap>
                    {newRow?.agentDetails?.id?.firstName}{" "}
                    {newRow?.agentDetails?.id?.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {newRow?.agentDetails?.id?.userCode}
                  </Typography>
                  <Typography variant="body2">
                    {newRow?.agentDetails?.id?.company_name}
                  </Typography>
                </Stack>
              </Stack>
            </StyledTableCell>
            <StyledTableCell>
              <Stack flexDirection={"row"} gap={1}>
                <CustomAvatar
                  name={newRow?.distributorDetails?.id?.firstName}
                  alt={newRow?.distributorDetails?.id?.firstName}
                  src={newRow?.distributorDetails?.id?.selfie[0]}
                />
                <Stack>
                  <Typography variant="body2">
                    {newRow?.distributorDetails?.id?.firstName}{" "}
                    {newRow?.distributorDetails?.id?.lastName}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {newRow?.company_name}
                  </Typography>
                </Stack>
              </Stack>
            </StyledTableCell>
          </>
        )}
        {/* mode of payment */}
        <StyledTableCell>
          <Typography variant="body2">
            {newRow?.modeOfPayment || "-"}
          </Typography>
        </StyledTableCell>

        {/* Product  */}
        <StyledTableCell>
          <Typography variant="body2">{newRow?.productName || "-"}</Typography>
        </StyledTableCell>

        {/* Operator */}
        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
          <Typography variant="body2">{newRow?.operator?.key1}</Typography>
          <Typography variant="body2">{newRow?.operator?.key2}</Typography>
          <Typography variant="body2">{newRow?.operator?.key3}</Typography>
        </StyledTableCell>

        {/* Mobile Number */}
        <StyledTableCell>
          <Typography variant="body2">{newRow?.mobileNumber}</Typography>
        </StyledTableCell>

        {/* Operator Txn Id */}
        <StyledTableCell>
          <Typography>
            {newRow?.vendorUtrNumber || "-"}
            {newRow?.vendorUtrNumber && (
              <Tooltip title="Copy" placement="top">
                <IconButton onClick={() => onCopy(newRow?.vendorUtrNumber)}>
                  <Iconify icon="eva:copy-fill" width={20} />
                </IconButton>
              </Tooltip>
            )}
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
          <Stack flexDirection={"row"} justifyContent={"center"}>
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
              {fIndianCurrency(
                (user?.role == "agent" && newRow?.agentDetails?.GST) || "0"
              )}
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
            textAlign: "center",
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

        <StyledTableCell sx={{ width: "fit-content" }}>
          <Stack flexDirection={"row"} flexWrap={"nowrap"}>
            <IconButton>
              <img src={Group} alt="Receipt Icon" />
            </IconButton>
            {newRow.status !== "success" && newRow.status !== "failed" && (
              <Tooltip title="Check Status" placement="top">
                <IconButton
                  onClick={() => !loading && CheckTransactionStatus(newRow)}
                  color="primary"
                  aria-label="check transaction status"
                >
                  <img src={autorenew} alt="Check Status" />
                </IconButton>
              </Tooltip>
            )}
            {user?.role === "agent" &&
              newRow?.transactionType == "Product/Service" && (
                <Tooltip title="View Receipt" placement="top">
                  <IconButton>
                    <img
                      src={receipt_long}
                      alt="Receipt Icon"
                      onClick={openModal}
                    />
                  </IconButton>
                </Tooltip>
              )}
          </Stack>
        </StyledTableCell>
      </StyledTableRow>

      {/* //modal for transaction receipt */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Grid sx={style}>
          <Stack flexDirection={"row"} justifyContent={"flex-end"} mx={1}>
            <Tooltip title="Close" onClick={closeModal}>
              <IconButton>
                <Iconify icon="carbon:close-outline" />
              </IconButton>
            </Tooltip>
            <ReactToPrint
              trigger={() => (
                <Tooltip title="Print">
                  <IconButton>
                    <Iconify icon="eva:printer-fill" />
                  </IconButton>
                </Tooltip>
              )}
              content={() => componentRef.current}
              onAfterPrint={closeModal}
            />
          </Stack>
          <Scrollbar>
            <Grid
              ref={componentRef}
              sx={{ p: 3, width: { xs: 800, md: "100%" } }}
            >
              <Grid container>
                <Grid item xs={4}>
                  <Typography variant="h5" sx={{ lineHeight: 1.1 }}>
                    {user?.company_name}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
                    {user?.shopAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
                    {user?.contact_no}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.1 }}>
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5" textAlign="center">
                    PAYMENT RECEIPT
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={4}
                  display="flex"
                  justifyContent="end"
                  alignItems="start"
                >
                  <Stack alignItems="end">
                    <Logo />
                    <Typography variant="body2">
                      TRX Date: {fDateTime(newRow?.createdAt)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Grid container>
                <Grid
                  item
                  xs={6}
                  display="flex"
                  flexDirection="column"
                  justifyContent="end"
                >
                  {newRow?.categoryName?.toLowerCase() == "money transfer" && (
                    <React.Fragment>
                      <Typography variant="subtitle1">
                        Sender Details
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Sender Name :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow?.moneyTransferSenderId?.remitterFN}
                          {newRow?.moneyTransferSenderId?.remitterLN}{" "}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Mobile Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {newRow?.moneyTransferSenderId?.remitterMobile}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                  {newRow?.categoryName?.toLowerCase() == "bill payment" && (
                    <React.Fragment>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Payer Mobile Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow?.mobileNumber}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                  {newRow?.categoryName?.toLowerCase() == "aeps" && (
                    <React.Fragment>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Withdrawal Customer Mobile Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow?.mobileNumber}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                </Grid>

                <Grid
                  item
                  xs={6}
                  display="flex"
                  justifyContent="end"
                  alignItems="start"
                >
                  <Stack alignItems="end">
                    {newRow?.categoryName?.toLowerCase() ==
                      "money transfer" && (
                      <React.Fragment>
                        <Typography variant="subtitle1">
                          Benificary Details
                        </Typography>

                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          {" "}
                          Account Holder Name:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          {" "}
                          Bank Name:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          {" "}
                          Account Number:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {
                              newRow?.moneyTransferBeneficiaryDetails
                                ?.accountNumber
                            }
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          {" "}
                          IFSC:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                          </span>
                        </Typography>
                      </React.Fragment>
                    )}
                    {newRow?.categoryName?.toLowerCase() == "bill payment" && (
                      <React.Fragment>
                        <Typography variant="subtitle1">
                          Operator Detail
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          Operator Name :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key1}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          CA Number :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key2}
                          </span>
                        </Typography>
                      </React.Fragment>
                    )}
                    {newRow?.categoryName?.toLowerCase() == "aeps" && (
                      <React.Fragment>
                        <Typography variant="subtitle1">
                          Customer Detail
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          Bank Name :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key1}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          Account Number :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key2}
                          </span>
                        </Typography>
                      </React.Fragment>
                    )}
                    {newRow?.categoryName?.toLowerCase() == "recharges" && (
                      <React.Fragment>
                        <Typography variant="subtitle1">
                          Operator Detail
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          Operator :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key1}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                          Mobile Number :{" "}
                          <span style={{ fontWeight: 500 }}>
                            {" "}
                            {newRow?.operator?.key2}
                          </span>
                        </Typography>
                      </React.Fragment>
                    )}
                  </Stack>
                </Grid>
              </Grid>

              <TableContainer sx={{ border: "1px solid #c5c4c4" }}>
                <Table
                  size="small"
                  sx={{
                    borderCollapse: "collapse",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        Transaction Id
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        Service
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        UTR
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        Status
                      </TableCell>
                      {/* <TableCell>Amount</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      sx={{
                        borderTop: "1px solid #c5c4c4",
                        borderCollapse: "collapse",
                      }}
                    >
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        {newRow?.clientRefId}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        {newRow?.productName}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        {newRow?.vendorUtrNumber}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        {newRow?.status}
                      </TableCell>
                      {/* <TableCell>{fIndianCurrency(newRow?.amount)}</TableCell> */}
                    </TableRow>
                  </TableBody>
                </Table>
                <Stack
                  sx={{
                    borderTop: "1px solid #c5c4c4",
                    px: 2,
                    py: 0.5,
                    flexDirection: "row",
                    gap: 2,
                  }}
                >
                  <Typography>Transaction Amount : </Typography>
                  <Typography> {fIndianCurrency(newRow?.amount)}</Typography>
                </Stack>
                <Stack
                  sx={{
                    borderTop: "1px solid #c5c4c4",
                    px: 2,
                    flexDirection: "row",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Typography>Convienience Fee : </Typography>
                  <Stack flexDirection="row">
                    ₹
                    <TextField
                      placeholder="Fee"
                      variant="standard"
                      size="small"
                      value={convienienceFee}
                      onChange={(e: any) => setConvienienceFee(e.target.value)}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
                    {" "}
                    The convienience fee charged is the sole responsibility of
                    the Agent. Tramo assumes no libiility for the imposition of
                    this fee and any associated consequences or issues arising
                    from its application rest entirely with the Agent .
                  </Typography>
                </Stack>
                <Stack
                  sx={{
                    borderTop: "1px solid #c5c4c4",
                    px: 2,
                    py: 0.5,
                    flexDirection: "row",
                    gap: 2,
                  }}
                >
                  <Typography>Total Amount : </Typography>
                  <Typography>
                    {" "}
                    {fIndianCurrency(
                      Number(newRow?.amount) + Number(convienienceFee)
                    )}
                  </Typography>
                  <Typography>
                    {convertToWords(
                      Number(newRow?.amount) + Number(convienienceFee)
                    )}
                  </Typography>
                </Stack>
              </TableContainer>
              <Typography sx={{ lineHeight: 1, fontSize: 10 }}>
                NOTE :- This transaction receipt is generated automatically and
                dose not require a physical signature. It is not a tax invoice
                but serves as a record of your transaction with Tramo. Please
                retain it for your refrence, and if you have any queries, fell
                free to contact our Customer Support team.
              </Typography>
              <Stack
                flexDirection="row"
                sx={{
                  color: "white",
                  bgcolor: "#375067",
                }}
                justifyContent="space-between"
                mt={1}
              >
                <Typography variant="body2">
                  Helpline Numbers +{process.env.REACT_APP_COMPANY_MOBILE} ,{" "}
                  {process.env.REACT_APP_COMPANY_MOBILEOTHER}
                </Typography>
                <Typography variant="body2">
                  Timings : 08:00AM to 10:00 PM (Mon-Sun)
                </Typography>
                <Typography variant="body2">
                  Email : {process.env.REACT_APP_COMPANY_EMAIL}
                </Typography>
              </Stack>

              <Grid container spacing={0}>
                {/* <Grid item xs={12} sm={4}>
                <Stack flexDirection={"row"} gap={1}>
                  <Typography variant="caption">Agent Name: </Typography>
                  <Typography variant="caption">
                    {`${user?.firstName} ${user?.lastName}`}
                  </Typography>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <Typography variant="caption">User code: </Typography>
                  <Typography variant="caption">
                    {`${user?.userCode}`}
                  </Typography>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <Typography variant="caption"> Mobile Number: </Typography>
                  <Typography variant="caption">{user?.contact_no}</Typography>
                </Stack>
                <Stack flexDirection={"row"} gap={1}>
                  <Typography variant="caption"> Shop Name: </Typography>
                  <Typography variant="caption">{user?.shopAddress}</Typography>
                </Stack>
                {newRow?.categoryName == "MONEY TRANSFER" && (
                  <Stack flexDirection={"row"} gap={1} mt={4}>
                    <Typography variant="caption">Sender Name : </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterFN}
                      {newRow?.moneyTransferSenderId?.remitterLN}{" "}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "MONEY TRANSFER" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterMobile}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "MONEY TRANSFER" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Service Type: </Typography>
                    <Typography variant="caption">
                      {newRow?.productName}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT2" && (
                  <Stack flexDirection={"row"} gap={1} mt={4}>
                    <Typography variant="caption">Sender Name : </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterFN}
                      {newRow?.moneyTransferSenderId?.remitterLN}{" "}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT2" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterMobile}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT2" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Service Type: </Typography>
                    <Typography variant="caption">
                      {newRow?.productName}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT1" && (
                  <Stack flexDirection={"row"} gap={1} mt={4}>
                    <Typography variant="caption">Sender Name : </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterFN}
                      {newRow?.moneyTransferSenderId?.remitterLN}{" "}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT1" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.moneyTransferSenderId?.remitterMobile}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT1" && (
                  <Stack flexDirection={"row"} gap={1}>
                    <Typography variant="caption"> Service Type: </Typography>
                    <Typography variant="caption">
                      {newRow?.productName}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "Aadhaar Pay" && (
                  <Stack flexDirection={"row"} gap={1} mt={2}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "AEPS" && (
                  <Stack flexDirection={"row"} gap={1} mt={2}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "BILL PAYMENT" && (
                  <Stack flexDirection={"row"} gap={1} top={10}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "LOAN" && (
                  <Stack flexDirection={"row"} gap={1} top={10}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}

                {newRow?.categoryName == "withdraw" && (
                  <Stack flexDirection={"row"} gap={1} top={10}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}
                {newRow?.categoryName == "Balance Inquiry" && (
                  <Stack flexDirection={"row"} gap={1} top={10}>
                    <Typography variant="caption"> Mobile Number: </Typography>
                    <Typography variant="caption">
                      {newRow?.mobileNumber}
                    </Typography>
                  </Stack>
                )}
              </Grid> */}
                {/* <Grid item xs={12} sm={4}>
                <Typography variant="h6">PAYMENT RECEIPT</Typography>
              </Grid> */}
                {/* <Grid item xs={10} sm={4}>
                <Logo />
                <Typography variant="body2">
                  TRX Date: {fDateTime(newRow?.createdAt)}
                </Typography>
                {newRow?.categoryName == "MONEY TRANSFER" && (
                  <Stack>
                    <Typography variant="subtitle1">
                      Benificary Details
                    </Typography>

                    <Stack flexDirection={"row"}>
                      <Typography variant="body2">
                        {" "}
                        Account Holder Name:{" "}
                      </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> IFSC : </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "DMT2" && (
                  <Stack>
                    <Typography variant="subtitle1">
                      Benificary Details
                    </Typography>

                    <Stack flexDirection={"row"}>
                      <Typography variant="body2">
                        {" "}
                        Account Holder Name:{" "}
                      </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.beneName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> IFSC : </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.ifsc}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "RECHARGES" && (
                  <Stack>
                    <Stack flexDirection={"row"}>
                      <Typography variant="body2"> Operator: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key1}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Mobile Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key2}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "AADHAAR PAY" && (
                  <Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key1}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key2}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "AEPS" && (
                  <Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key1}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.operator?.key2}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "withdraw" && (
                  <Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {newRow?.categoryName == "Mini Statement" && (
                  <Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Bank Name: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.bankName}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2"> Account Number: </Typography>
                      <Typography variant="body2">
                        {newRow?.moneyTransferBeneficiaryDetails?.accountNumber}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
               
                {newRow?.categoryName == "LOAN" && (
                  <Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <Typography variant="body2">
                        {" "}
                        Loan Applied for :{" "}
                      </Typography>
                      <Typography variant="body2">
                        {newRow?.productName}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Grid> */}
              </Grid>

              <Divider
                variant="fullWidth"
                style={{ borderWidth: "2px", borderStyle: "dashed " }}
              />
            </Grid>
          </Scrollbar>
        </Grid>
      </Modal>
    </>
  );
}
