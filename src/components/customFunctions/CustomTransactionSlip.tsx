import {
  Grid,
  IconButton,
  Stack,
  tableCellClasses,
  Tooltip,
  TableCell,
  styled,
  Typography,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TextField,
  Divider,
  Modal,
  TableHead,
} from "@mui/material";
import React, { useRef, useState } from "react";
import Iconify from "../iconify/Iconify";
import ReactToPrint from "react-to-print";
import { useAuthContext } from "src/auth/useAuthContext";
import { fDateTime } from "src/utils/formatTime";
import Scrollbar from "../scrollbar/Scrollbar";
import { sentenceCase } from "change-case";
import { fIndianCurrency } from "src/utils/formatNumber";
import Logo from "../logo/Logo";
import Label from "../label/Label";
import { convertToWords } from "./ToWords";
// import HandleClose from "./TrasactionModal";

function CustomTransactionSlip({ newRow, handleCloseRecipt }: any) {
  const { user } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(true);
  const [convienienceFee, setConvienienceFee] = useState(0);
  const [textFieldValue, setTextFieldValue] = useState("");
  const handleTextFieldChange = (event: any) => {
    setTextFieldValue(event.target.value);
  };
  const closeModal = () => setModalOpen(false);

  console.log("newrow", newRow);

  // const HandleSlip = () => {
  //   handleClose();
  // };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: { xs: "100%" },
    bgcolor: "#ffffff",
    borderRadius: 2,
  };
  const componentRef = useRef<any>();
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

  return (
    <>
      <Grid sx={style}>
        <Stack flexDirection={"row"} justifyContent={"flex-end"} mx={1}>
          <Tooltip title="Close" onClick={handleCloseRecipt}>
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
        <Scrollbar sx={{ maxHeight: 500, minWidth: 720 }}>
          <Grid ref={componentRef} sx={{ p: 3, width: { xs: "100%" } }}>
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
                    TRX Date: {fDateTime(newRow[0]?.createdAt)}
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
                {(newRow[0]?.categoryName?.toLowerCase() == "money transfer" ||
                  newRow[0]?.categoryName?.toLowerCase() == "dmt1" ||
                  newRow[0]?.categoryName?.toLowerCase() == "dmt2") && (
                  <React.Fragment>
                    <Typography variant="subtitle1">Sender Details</Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                      Sender Name :{" "}
                      <span style={{ fontWeight: 500 }}>
                        {" "}
                        {newRow[0]?.moneyTransferSenderId?.remitterFN}
                        {newRow[0]?.moneyTransferSenderId?.remitterLN}{" "}
                      </span>
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                      Mobile Number :{" "}
                      <span style={{ fontWeight: 500 }}>
                        {newRow[0]?.moneyTransferSenderId?.remitterMobile}
                      </span>
                    </Typography>
                  </React.Fragment>
                )}
                {newRow[0]?.categoryName?.toLowerCase() == "bill payment" && (
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
                {newRow[0]?.categoryName?.toLowerCase() == "aeps" && (
                  <React.Fragment>
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                      Withdrawal Customer Mobile Number :{" "}
                      <span style={{ fontWeight: 500 }}>
                        {" "}
                        {newRow[0]?.mobileNumber}
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
                  {(newRow[0]?.categoryName?.toLowerCase() ==
                    "money transfer" ||
                    newRow[0]?.categoryName?.toLowerCase() == "dmt1" ||
                    newRow[0]?.categoryName?.toLowerCase() == "dmt2") && (
                    <React.Fragment>
                      <Typography variant="subtitle1">
                        Benificary Details
                      </Typography>

                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {" "}
                        Account Holder Name:{" "}
                        <span style={{ fontWeight: 500 }}>
                          {newRow[0]?.moneyTransferBeneficiaryDetails?.beneName}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {" "}
                        Bank Name:{" "}
                        <span style={{ fontWeight: 500 }}>
                          {newRow[0]?.moneyTransferBeneficiaryDetails?.bankName}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {" "}
                        Account Number:{" "}
                        <span style={{ fontWeight: 500 }}>
                          {
                            newRow[0]?.moneyTransferBeneficiaryDetails
                              ?.accountNumber
                          }
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        {" "}
                        IFSC:{" "}
                        <span style={{ fontWeight: 500 }}>
                          {newRow[0]?.moneyTransferBeneficiaryDetails?.ifsc}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                  {newRow[0]?.categoryName?.toLowerCase() == "bill payment" && (
                    <React.Fragment>
                      <Typography variant="subtitle1">
                        Operator Detail
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Operator Name :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key1}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        CA Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key2}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                  {newRow[0]?.categoryName?.toLowerCase() == "aeps" && (
                    <React.Fragment>
                      <Typography variant="subtitle1">
                        Customer Detail
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Bank Name :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key1}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Account Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key2}
                        </span>
                      </Typography>
                    </React.Fragment>
                  )}
                  {newRow[0]?.categoryName?.toLowerCase() == "recharges" && (
                    <React.Fragment>
                      <Typography variant="subtitle1">
                        Operator Detail
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Operator :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key1}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                        Mobile Number :{" "}
                        <span style={{ fontWeight: 500 }}>
                          {" "}
                          {newRow[0]?.operator?.key2}
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
                    {(newRow[0]?.categoryName?.toLowerCase() ==
                      "money transfer" ||
                      newRow[0]?.categoryName?.toLowerCase() == "dmt1" ||
                      newRow[0]?.categoryName?.toLowerCase() == "dmt2") && (
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        Mode
                      </TableCell>
                    )}
                    <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                      Service
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                      UTR
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                      Status
                    </TableCell>
                    {/* <TableCell>Amount</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newRow?.length ? (
                    newRow.map((item: any) => {
                      return (
                        <TableRow
                          sx={{
                            borderTop: "1px solid #c5c4c4",
                            borderCollapse: "collapse",
                          }}
                        >
                          <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                            {item?.clientRefId}
                          </TableCell>
                          {(item?.categoryName?.toLowerCase() ==
                            "money transfer" ||
                            item?.categoryName?.toLowerCase() == "dmt1" ||
                            item?.categoryName?.toLowerCase() == "dmt2") && (
                            <TableCell
                              sx={{ borderRight: "1px solid #c5c4c4" }}
                            >
                              {item?.modeOfPayment}
                            </TableCell>
                          )}
                          <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                            {item?.productName}
                          </TableCell>
                          <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                            {item?.vendorUtrNumber}
                          </TableCell>
                          <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                            {fIndianCurrency(Number(item?.amount))}
                          </TableCell>
                          <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                            <Label
                              color={
                                (item.status === "failed" && "error") ||
                                ((item.status === "pending" ||
                                  item.status === "in_process" ||
                                  item.status === "hold") &&
                                  "warning") ||
                                "success"
                              }
                            >
                              {item.status || "NA"}
                            </Label>
                          </TableCell>
                          {/* <TableCell>{fIndianCurrency(newRow?.amount)}</TableCell> */}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow
                      sx={{
                        borderTop: "1px solid #c5c4c4",
                        borderCollapse: "collapse",
                      }}
                    >
                      <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                        {newRow?.clientRefId}
                      </TableCell>
                      {(newRow?.categoryName?.toLowerCase() ==
                        "money transfer" ||
                        newRow?.categoryName?.toLowerCase() == "dmt1" ||
                        newRow?.categoryName?.toLowerCase() == "dmt2") && (
                        <TableCell sx={{ borderRight: "1px solid #c5c4c4" }}>
                          {newRow?.modeOfPayment}
                        </TableCell>
                      )}
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
                  )}
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
                {newRow?.length ? (
                  <Typography>
                    {" "}
                    {fIndianCurrency(
                      newRow.reduce((acc: any, item: any) => {
                        return acc + Number(item.amount);
                      }, 0)
                    )}
                  </Typography>
                ) : (
                  <Typography> {fIndianCurrency(newRow?.amount)}</Typography>
                )}
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
                  The convienience fee charged is the sole responsibility of the
                  Agent. {process.env.REACT_APP_COMPANY_NAME} assumes no
                  libiility for the imposition of this fee and any associated
                  consequences or issues arising from its application rest
                  entirely with the Agent .
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
                    (newRow?.length
                      ? newRow.reduce((acc: any, item: any) => {
                          return acc + Number(item.amount);
                        }, 0)
                      : Number(newRow?.amount)) + Number(convienienceFee)
                  )}
                </Typography>
                <Typography>
                  {convertToWords(
                    (newRow?.length
                      ? newRow.reduce((acc: any, item: any) => {
                          return acc + Number(item.amount);
                        }, 0)
                      : Number(newRow?.amount)) + Number(convienienceFee)
                  )}
                </Typography>
              </Stack>
            </TableContainer>
            <Typography sx={{ lineHeight: 1, fontSize: 10 }}>
              NOTE :- This transaction receipt is generated automatically and
              dose not require a physical signature. It is not a tax invoice but
              serves as a record of your transaction with{" "}
              {process.env.REACT_APP_COMPANY_NAME}. Please retain it for your
              refrence, and if you have any queries, fell free to contact our
              Customer Support team.
            </Typography>
            <Stack
              flexDirection="row"
              sx={{
                color: "white",
                bgcolor: (theme) => theme.palette.primary.light,
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

            <Divider
              variant="fullWidth"
              style={{ borderWidth: "2px", borderStyle: "dashed " }}
            />
          </Grid>
        </Scrollbar>
      </Grid>
    </>
  );
}

export default React.memo(CustomTransactionSlip);
