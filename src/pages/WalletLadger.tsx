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
import { TableHeadCustom } from "src/components/table";
import React from "react";
import Iconify from "src/components/iconify/Iconify";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import CustomPagination from "../components/customFunctions/CustomPagination";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import * as XLSX from "xlsx";
import FileFilterButton from "../sections/MyTransaction/FileFilterButton";
import { fDate, fDateTime } from "src/utils/formatTime";
import { useAuthContext } from "src/auth/useAuthContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { sentenceCase } from "change-case";
import { green, red } from "@mui/material/colors";
import { fCurrency } from "src/utils/formatNumber";

// ----------------------------------------------------------------------

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
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [ladgerData, setLadgerData] = useState([]);
  const [pageSize, setPageSize] = useState<any>(20);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [sendLoding, setSendLoading] = useState(false);
  const [WalletCount, setWalletCount] = useState(0);

  const agenttableLabels = [
    { id: "date", label: "Date/Time  " },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "main", label: "Main Balance " },
    { id: "AEPS", label: "AEPS Wallet Balance " },
    { id: "Transcation ", label: "Transcation ID " },
    { id: "statue", label: "Status " },
  ];
  const distributortableLabels = [
    { id: "date", label: "Date/Time  " },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "main", label: "Main Balance " },
    { id: "AEPS", label: "AEPS Wallet Balance " },
    { id: "Transcation ", label: "Transcation ID " },
    { id: "statue", label: "Status " },

    { id: "walletId", label: "Wallet Id" },
  ];
  const MDtableLabels = [
    { id: "date", label: "Date/Time " },
    { id: "Remark/TransactionType", label: "Remark/TransactionType" },
    { id: "productName", label: "Product " },
    { id: "amount", label: "Transaction Amount" },
    { id: "Charge/Commission", label: "Charge/Commission" },
    { id: "main", label: "Main Balance " },
    { id: "AEPS", label: "AEPS Wallet Balance " },
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
  } = useDateRangePicker(new Date(), new Date());

  useEffect(() => {
    getTransactional();
  }, [currentPage]);

  const getTransactional = () => {
    let token = localStorage.getItem("token");
    setSendLoading(true);

    let body = {
      pageInitData: {
        pageSize: pageSize,
        currentPage: currentPage,
      },
    };
    Api(`agent/walletLedger`, "POST", body, token).then((Response: any) => {
      console.log("======Transaction==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setLadgerData(Response.data?.data?.data);
          setWalletCount(Response.data.data.totalNumberOfRecords);
          enqueueSnackbar(Response.data.message);
          setSendLoading(false);
        } else {
          enqueueSnackbar(Response.data.message);
          setSendLoading(false);
        }
      }
    });
  };

  const ExportData = () => {
    let token = localStorage.getItem("token");

    // Check if startDate and endDate are not empty
    if (!startDate || !endDate) {
      console.log("Start date and end date are required for export.");
      return;
    }

    let body = {
      pageInitData: {
        pageSize: "",
        currentPage: "",
      },
      startDate: startDate,
      endDate: endDate,
    };

    Api(`agent/walletLedger`, "POST", body, token).then((Response: any) => {
      console.log("======walletLedger==response=====>" + Response);
      if (Response.status === 200) {
        if (Response.data.code === 200) {
          if (Response.data.data.data.length) {
            const Dataapi = Response.data.data.data;

            console.log(
              "Response of the ==============walletLedger===========>",
              Response.data?.data?.data
            );

            // Rest of your code for formatting and exporting data...

            console.log(
              "======getUser===data.data ===Transaction====>",
              Response
            );
          } else {
            enqueueSnackbar("Data Not Found ");
          }
        } else {
          console.log("======Transaction=======>" + Response);
        }
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Wallet Ladger | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <Stack sx={{ maxHeight: window.innerHeight - 220 }}>
        <Stack flexDirection={"row"} justifyContent={"end"}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            style={{ padding: "0 25px", marginBottom: "10px" }}
          >
            <FileFilterButton
              isSelected={!!isSelectedValuePicker}
              startIcon={<Iconify icon="eva:calendar-fill" />}
              onClick={onOpenPicker}
            >
              {`${fDate(startDate)} - ${fDate(endDate)}`}
            </FileFilterButton>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                variant="input"
                title="Select Date Range"
                startDate={startDate}
                endDate={endDate}
                onChangeStartDate={onChangeStartDate}
                onChangeEndDate={onChangeEndDate}
                open={openPicker}
                onClose={onClosePicker}
                isSelected={isSelectedValuePicker}
                isError={isError}
              />
            </LocalizationProvider>
            <Button variant="contained" onClick={ExportData}>
              Search
            </Button>
          </Stack>
        </Stack>
        {sendLoding ? (
          <ApiDataLoading />
        ) : (
          <Grid item xs={12} md={6} lg={8}>
            <TableContainer>
              <Scrollbar sx={{ maxHeight: window.innerHeight - 200 }}>
                <Table
                  sx={{ minWidth: 720 }}
                  aria-label="customized table"
                  stickyHeader
                >
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
                    {Array.isArray(ladgerData) &&
                      ladgerData.map((row: any) => (
                        <LadgerRow key={row._id} row={row} />
                      ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Grid>
        )}
      </Stack>

      <CustomPagination
        pageSize={pageSize}
        onChange={(event: React.ChangeEvent<unknown>, value: number) => {
          setCurrentPage(value);
        }}
        page={currentPage}
        Count={WalletCount}
      />
    </>
  );
}

const LadgerRow = ({ row }: any) => {
  const { user } = useAuthContext();

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
              {" "}
              {fCurrency(row?.from?.amount || "-")}
            </Typography>
          </Stack>
        </StyledTableCell>
        <StyledTableCell>
          <Typography variant="subtitle2"  sx={{color:'red'}}>
            {" "}
            Charge :{fCurrency(row?.transaction?.debit)}
          </Typography>
          {user?.role === "agent" && (
            <Typography variant="subtitle2" sx={{color:'green'}}>
           Commission : {fCurrency(row?.transaction?.agentDetails?.commissionAmount)}
            </Typography>
          )}

          {user?.role === "distributor" && (
            <Typography variant="subtitle2">
          Commission :  {fCurrency(row?.transaction?.distributorDetails?.commissionAmount)}
            </Typography>
          )}

          {user?.role === "masterdistributor" && (
            <Typography variant="subtitle2">
             {" "}
             Commission : {fCurrency(row?.transaction?.masterDistributorDetails?.commissionAmount)}
            </Typography>
          )}
        </StyledTableCell>

        <StyledTableCell>
          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2">
              {" "}
              {fCurrency(row?.from?.newMainWalletBalance|| "-")}
            </Typography>
          </Stack>
        </StyledTableCell>

        <StyledTableCell>
          <Stack direction="row" gap={0.5}>
            <Typography variant="subtitle2">
              {" "}
              {fCurrency(row?.from?.newAepsWalletBalance|| "-")}
            </Typography>
          </Stack>
        </StyledTableCell>

        {row?.transaction?.clientRefId ? (
          <StyledTableCell onClick={() => openEditModal(row)}>
            <Typography
              variant="body1"
              sx={{ color: "blue", textDecoration: "underline",cursor:'pointer' }}
            >
              {row?.transaction?.clientRefId || "-"}
            </Typography>
          </StyledTableCell>
        ) : (
          <Typography
          variant="body1"
          sx={{m:4}}
        >
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

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          item
          xs={6}
          md={6}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Card sx={{ p: 3 }}>
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
                              {ToFromData?.transaction?.agentDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.agentDetails?.newMainWalletBalance?.toFixed(
                                2
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
                              {ToFromData?.transaction?.agentDetails?.TDSAmount?.toFixed(
                                2
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
                              {ToFromData?.transaction?.distributorDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.distributorDetails?.newMainWalletBalance?.toFixed(
                                2
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
                              {ToFromData?.transaction?.masterDistributorDetails?.oldMainWalletBalance?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">
                              Closing:
                            </Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.newMainWalletBalance?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Comm:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.commissionAmount?.toFixed(
                                2
                              ) || "-"}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">Credit:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.creditedAmount?.toFixed(
                                2
                              )}
                            </Typography>
                          </Stack>

                          <Stack gap={0.5} direction="row">
                            <Typography variant="subtitle2">TDS:</Typography>
                            <Typography variant="body2">
                              {ToFromData?.transaction?.masterDistributorDetails?.TDSAmount?.toFixed(
                                2
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
                          {ToFromData?.transaction?.credit?.toFixed(2)}
                        </Typography>
                      </Stack>

                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">Debit:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.debit?.toFixed(2)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">TDS:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.TDS.toFixed(2)}
                        </Typography>
                      </Stack>
                      <Stack gap={0.5} direction="row">
                        <Typography variant="subtitle2">GST:</Typography>
                        <Typography variant="body2">
                          {ToFromData?.transaction?.GST?.toFixed(2)}
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
      </Modal>
    </>
  );
};
