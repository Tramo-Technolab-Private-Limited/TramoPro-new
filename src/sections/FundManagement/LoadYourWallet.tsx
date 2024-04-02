import { useEffect, useState, useCallback } from "react";

// @mui
import {
  Grid,
  Tabs,
  Button,
  Stack,
  Tab,
  MenuItem,
  Modal,
  styled,
  SwitchProps,
  Checkbox,
  Switch,
} from "@mui/material";
// routes
import { PATH_DASHBOARD } from "src/routes/paths";
// components
import { Helmet } from "react-helmet-async";
// sections

import { LoadingButton } from "@mui/lab";
// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Label from "src/components/label/Label";
import { Upload } from "src/components/upload";
import { UploadFile } from "src/webservices";

import { Box, CardProps, Typography } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "src/components/hook-form";
import React from "react";
import { Api } from "src/webservices";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { Link } from "react-router-dom";
import { useAuthContext } from "src/auth/useAuthContext";

// import { Label } from '@mui/icons-material';

// ----------------------------------------------------------------------
type FormValuesProps = {
  transactionDate: string;
  utr: string;
  amount: any;
  depositto: string;
  transferto: string;
  transferfrom: string;
  deposittype: string;
  depositMethod: any;
};

interface Props extends CardProps {}

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function LoadYourWallet() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [ABank, setAbank] = React.useState([]);
  const [dBank, setDbank] = React.useState([]);
  const [MDbank, setMDbank] = React.useState([]);
  const [adminBank, setAdminbank] = React.useState([]);
  const [bankList, setBankList] = React.useState([]);
  const [success, setSuccess] = useState("upload");
  const [charge, setCharge] = React.useState<any>();
  const [docName, setDocName] = useState("");
  const [requestTo, setRequestTo] = useState<any>();
  const [docUrl, setDocUrl] = useState("");

  const [transactionType, setTransactionType] = useState<any>([]);
  const handleDropSingleFile = useCallback((acceptedFiles: File[]) => {
    const uploadFile = acceptedFiles[0];
    setSuccess("upload");
    if (uploadFile) {
      setUploadFile(
        Object.assign(uploadFile, {
          preview: URL.createObjectURL(uploadFile),
        })
      );
    }
  }, []);
  const [uploadFile, setUploadFile] = useState<any>();

  const [dBankTab, setDBankTab] = useState({
    accountNumber: "",
    bankBranch: "",
    bankName: "",
    ifsc: "",
    name: "",
    pincode: "",
    state: "",
    _id: "",
  });
  const [mdBankTab, setMDBankTab] = useState({
    accountNumber: "",
    bankBranch: "",
    bankName: "",
    ifsc: "",
    name: "",
    pincode: "",
    state: "",
    _id: "",
  });
  const [adminBankTab, setAdminBankTab] = useState({
    accountNumber: "",
    bankBranch: "",
    bankName: "",
    ifsc: "",
    name: "",
    pincode: "",
    state: "",
    _id: "",
  });
  const [bankdetail, setBankDetail] = useState({
    accountNumber: "",
    bankName: "",
    ifsc: "",
    name: "",
  });
  const [userTab, setUserTab] = useState("C");
  const [deposit, setDeposit] = useState("");
  const [Amount, setAmount] = React.useState<any>();
  const [mdCode, setMDcode] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const FilterSchema = Yup.object().shape({
    transactionDate: Yup.string().required("Transaction date is required"),
    utr: Yup.string().required("Transaction ID is required"),
    // amount: Yup.string().test(),
    depositto: Yup.string().required("Deposits date is required"),
    transferto: Yup.string().required("Transaction to is required"),
    // transferfrom: Yup.string().required(),
    deposittype: Yup.string().required("Deposite type is required"),
  });
  const defaultValues = {
    transactionDate: "",
    utr: "",
    amount: "",
    depositto: "",
    transferto: "",
    transferfrom: "",
    deposittype: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const role = user?.role;
  const duser = user?.referralCode;

  const users = [
    { _id: 1, user_name: "Company", code: "C" },
    {
      _id: 2,
      user_name: "Master Distributor",
      code: mdCode,
    },
    { _id: 3, user_name: "Distributor", code: user?.referralCode },
  ];
  if (role == "distributor") {
    users.pop();
  } else if (role == "m_distributor" || duser == "") {
    users.pop();
    users.pop();
  } else {
  }

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const copyToClipboard = (str: any) => {
    enqueueSnackbar("Copied: " + str);
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(str);
    return Promise.reject("The Clipboard API is not available.");
  };

  useEffect(() => {
    getAllBank();
    getBankList();
    getAdminBankList();

    getMDcode();
  }, []);

  function getBank(val: string) {
    if (val.startsWith("D")) {
      setRequestTo(user?.referralCode);
      setBankList(dBank);
    } else if (val.startsWith("M")) {
      setRequestTo(mdCode);
      setBankList(MDbank);
    } else {
      setRequestTo("Admin");
      setBankList(adminBank);
    }
  }

  function catchBankDetail(val: any) {
    setBankDetail(val);
    setTransactionType(val.depositMethod);
    setCharge(val.cashDepositeCharge);
  }

  const getAllBank = () => {
    let token = localStorage.getItem("token");
    {
      role == "agent"
        ? Api(`agent/dist_BankDetails`, "GET", "", token).then(
            (Response: any) => {
              console.log("======dist_BankDetails==response=====>" + Response);
              if (Response.status == 200) {
                if (Response.data.code == 200) {
                  setDbank(Response.data.dbank.bankAccounts);
                  setMDbank(Response.data.mbank.bankAccounts);
                  setDBankTab(Response.data.dbank.bankAccounts[0]);
                  setMDBankTab(Response.data.mbank.bankAccounts[0]);
                  console.log(
                    "======dist_BankDetails===data.data 200====>",
                    Response.data.success
                  );
                } else {
                  console.log("======dist_BankDetails=======>" + Response);
                }
              }
            }
          )
        : Api(`agent/mdist_BankDetails`, "GET", "", token).then(
            (Response: any) => {
              console.log("======mdist_BankDetails==response=====>" + Response);
              if (Response.status == 200) {
                if (Response.data.code == 200) {
                  setMDbank(Response.data.mdata.bankAccounts);
                  setMDBankTab(Response.data.mdata.bankAccounts[0]);
                  console.log(
                    "======mdist_BankDetails===data.data 200====>",
                    Response.data.success
                  );
                } else {
                  console.log("======mdist_BankDetails=======>" + Response);
                }
              }
            }
          );
    }
  };

  const getBankList = () => {
    let token = localStorage.getItem("token");
    let id = user?._id;
    Api(`user/get_user_bank_list/` + id, "GET", "", token).then(
      (Response: any) => {
        console.log("======BankList==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setAbank(Response.data.success[0].bankAccounts);
            console.log(
              "======BankList===data.data 200====>",
              Response.data.success
            );
          } else {
            console.log("======BankList=======>" + Response);
          }
        }
      }
    );
  };

  const getMDcode = () => {
    let token = localStorage.getItem("token");
    Api(`auth/userData`, "GET", "", token).then((Response: any) => {
      console.log("======BankList==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setMDcode(Response.data.data.m_distCode);
          console.log(
            "======BankList===data.data 200====>",
            Response.data.success
          );
        } else {
          console.log("======BankList=======>" + Response);
        }
      }
    });
  };

  const getAdminBankList = () => {
    let token = localStorage.getItem("token");
    Api(`admin/getBankList/646da52e7a55f384c140d4dc`, "GET", "", token).then(
      (Response: any) => {
        console.log("======BankList==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setAdminbank(Response.data.success[0].bankAccounts);
            setAdminBankTab(Response.data.success[0].bankAccounts[0]);
            console.log(
              "======BankList===data.data 200====>",
              Response.data.success
            );
          } else {
            console.log("======BankList=======>" + Response);
          }
        }
      }
    );
  };

  const loadWallet = (data: FormValuesProps) => {
    if (Amount != "") {
      let token = localStorage.getItem("token");
      let body = {
        requestTo: requestTo,
        txnDetails: [
          {
            toAccountName: bankdetail.bankName,
            transactionType: data.deposittype,
            cashTxnCharge:
              data.deposittype.toLowerCase() == "cash"
                ? (Amount * charge) / 100
                : 0,
            transferFrom: data.transferfrom,
            depositAmount: Amount,
            transactionId: data.utr,
            transactionDate: data.transactionDate,
            slip: docUrl,
            reference: Math.floor(1000000 + Math.random() * 9000000).toString(),
            toAccountno: bankdetail.accountNumber,
            toifsc: bankdetail.ifsc,
            documentname: docName,
          },
        ],
      };
      Api("agent/loadWallet_request", "POST", body, token).then(
        (Response: any) => {
          console.log("==========>>product Filter", Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              reset(defaultValues);
              handleClose();
              setUploadFile(null);
              enqueueSnackbar(Response.data.message);
              console.log("=====product filter code 200", Response.data.data);
            } else {
              console.log(
                "==============>>> post mobile number",
                Response.massage
              );
            }
          }
        }
      );
    }
  };

  const uploadDoc = () => {
    if (uploadFile?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setSuccess("wait");
    let doc = uploadFile;
    console.log("===file", uploadFile);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", doc);
    formData.append("directoryName", "others");
    UploadFile(`upload/upload_agent_doc`, formData, token).then(
      (Response: any) => {
        // console.log("=====token===aadharFront===", token)
        console.log(
          "=====uploadAadharfrontResponse========>" + JSON.stringify(Response)
        );
        if (Response.status == 200) {
          if (Response.data.status == "success") {
            enqueueSnackbar("successfully file uploaded");
            setDocUrl(Response.data.filePath);
            console.log("===200=aadharFront====", Response.data.filePath);
            setSuccess("success");
          } else {
            enqueueSnackbar("Server didn`t response", { variant: "error" });
            console.log("=====404=aadharFront===", Response.data.message);
          }
        } else {
          enqueueSnackbar("file must be less then 1mb", { variant: "error" });
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>
          View Update Bank Detail | {process.env.REACT_APP_COMPANY_NAME}
        </title>
      </Helmet>
      <Box style={{ padding: "0" }}>
        <Box
          rowGap={3}
          columnGap={10}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            // sm: '0.2fr 0.8fr',
          }}
        >
          <Grid>
            <Box
              sx={{
                background: "#F4F6F8",
                pl: 1,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              <Tabs
                value={userTab}
                aria-label="basic tabs example"
                onChange={(event, newValue) => setUserTab(newValue)}
              >
                {users.map((tab: any) => (
                  <Tab
                    key={tab.user_name}
                    sx={{ mx: 0, fontSize: { xs: 16, sm: 20 } }}
                    label={tab.user_name}
                    iconPosition="top"
                    value={tab.user_name}
                  />
                ))}
              </Tabs>
            </Box>

            {userTab == "Distributor" ? (
              <Tabs
                value={dBankTab.bankName}
                aria-label="basic tabs example"
                onChange={(event, newValue) => setDBankTab(newValue)}
              >
                {dBank.map((tab: any) => (
                  <Button
                    key={tab._id}
                    onClick={() => setDBankTab(tab)}
                    sx={{ mr: 1 }}
                    variant={dBankTab._id == tab._id ? "contained" : "outlined"}
                  >
                    {tab.bankName}
                  </Button>
                ))}
              </Tabs>
            ) : userTab == "Master Distributor" ? (
              <Tabs
                value={mdBankTab.bankName}
                aria-label="basic tabs example"
                onChange={(event, newValue) => setMDBankTab(newValue)}
              >
                {MDbank.map((tab: any) => (
                  <Button
                    key={tab._id}
                    onClick={() => setMDBankTab(tab)}
                    sx={{ mr: 1 }}
                    variant={
                      mdBankTab._id == tab._id ? "contained" : "outlined"
                    }
                  >
                    {tab.bankName}
                  </Button>
                ))}
              </Tabs>
            ) : (
              <Tabs
                value={adminBankTab.bankName}
                aria-label="basic tabs example"
                onChange={(event, newValue) => setAdminBankTab(newValue)}
              >
                {adminBank.map((tab: any) => (
                  <Button
                    key={tab._id}
                    onClick={() => setAdminBankTab(tab)}
                    sx={{ mr: 1 }}
                    variant={
                      adminBankTab.bankName == tab.bankName
                        ? "contained"
                        : "outlined"
                    }
                  >
                    {tab.bankName}
                  </Button>
                ))}
              </Tabs>
            )}
            <Typography>
              <Link to="/dashboard/fundmanagement/MyFundDeposites">
                {" "}
                My Fund Deposits{" "}
              </Link>
              .
            </Typography>
          </Grid>
          <Box
            display="grid"
            width={{
              xs: "100%",
              sm: "50%",
            }}
          >
            <Grid
              sx={{ p: 2, border: "1px dashed black", borderRadius: "20px" }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1.1em", pt: 1.5 }}>
                Beneficiary Name
              </Typography>
              <Typography
                onClick={(e) => copyToClipboard(e.currentTarget.textContent)}
                sx={{ cursor: "pointer" }}
              >
                {userTab == "Distributor"
                  ? dBankTab.name
                  : userTab == "Master Distributor"
                  ? mdBankTab.name
                  : "Tramo Technolab Private Limited"}{" "}
                <Icon
                  style={{ fontSize: "20px", float: "right" }}
                  icon="uil:copy"
                />
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1em", pt: 1.5 }}>
                Bank Name
              </Typography>
              <Typography
                onClick={(e) => copyToClipboard(e.currentTarget.textContent)}
                sx={{ cursor: "pointer" }}
              >
                {
                  (userTab == "Distributor"
                    ? dBankTab
                    : userTab == "Master Distributor"
                    ? mdBankTab
                    : adminBankTab
                  ).bankName
                }
                <Icon
                  style={{ fontSize: "20px", float: "right" }}
                  icon="uil:copy"
                />
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1em", pt: 1.5 }}>
                Account Number
              </Typography>
              <Typography
                onClick={(e) => copyToClipboard(e.currentTarget.textContent)}
                sx={{ cursor: "pointer" }}
              >
                {
                  (userTab == "Distributor"
                    ? dBankTab
                    : userTab == "Master Distributor"
                    ? mdBankTab
                    : adminBankTab
                  ).accountNumber
                }{" "}
                <Icon
                  style={{ fontSize: "20px", float: "right" }}
                  icon="uil:copy"
                />
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1em", pt: 1.5 }}>
                Ifsc Code
              </Typography>
              <Typography
                onClick={(e) => copyToClipboard(e.currentTarget.textContent)}
                sx={{ cursor: "pointer" }}
              >
                {
                  (userTab == "Distributor"
                    ? dBankTab
                    : userTab == "Master Distributor"
                    ? mdBankTab
                    : adminBankTab
                  ).ifsc
                }{" "}
                <Icon
                  style={{ fontSize: "20px", float: "right" }}
                  icon="uil:copy"
                />
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1em", pt: 1.5 }}>
                Acount Type
              </Typography>
              <Typography
                onClick={(e) => copyToClipboard(e.currentTarget.textContent)}
                sx={{ cursor: "pointer" }}
              >
                Current{" "}
                <Icon
                  style={{ fontSize: "20px", float: "right" }}
                  icon="uil:copy"
                />
              </Typography>
            </Grid>
          </Box>
          <Typography>I have deposited the fund to this account</Typography>
          <Button
            variant="contained"
            sx={{ width: "fit-content" }}
            onClick={handleOpen}
          >
            {" "}
            Raise my Request{" "}
          </Button>
        </Box>
      </Box>

      {/* ***************************modal for load wallet request*************************** */}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(loadWallet)}>
          <Box sx={style} style={{ borderRadius: "20px", width: "50%" }}>
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
                {deposit != "cash" && (
                  <RHFSelect
                    name="transferfrom"
                    label="Transfered From Bank Account"
                    placeholder="Transfered From Bank Account"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {ABank.map((item: any, index: any) => {
                      return (
                        <MenuItem key={index} value={item.bankName}>
                          {item.bankName}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                )}

                <RHFSelect
                  name="transferto"
                  label="Transfered To"
                  placeholder="Transfered To "
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {users.map((item: any, index: any) => {
                    return (
                      <MenuItem
                        key={index}
                        value={item.code}
                        onClick={() => getBank(item.code)}
                      >
                        {item.user_name}
                      </MenuItem>
                    );
                  })}
                </RHFSelect>

                <RHFSelect
                  name="depositto"
                  label="Deposited To"
                  placeholder="Deposited To"
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  {bankList.map((item: any, index: any) => {
                    return (
                      <MenuItem
                        key={index}
                        value={item.bankName}
                        onClick={() => catchBankDetail(item)}
                      >
                        {item.bankName}
                      </MenuItem>
                    );
                  })}
                </RHFSelect>
                {transactionType.length !== 0 && (
                  <RHFSelect
                    name="deposittype"
                    label="Deposit Type"
                    placeholder="Deposit Type"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {transactionType.map((item: any) => {
                      return (
                        <MenuItem
                          key={item._id}
                          value={item}
                          onClick={() => setDeposit(item)}
                        >
                          {item}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                )}

                <RHFTextField
                  type="number"
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                  value={Amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {deposit == "CASH" && Amount ? (
                  <Typography variant="body2" color={"red"}>
                    Rs. {(Amount * charge) / 100} total charge (@Rs. {charge}
                    /1000) are applicable. Your wallet will be loaded with Rs.{" "}
                    {Amount - (Amount * charge) / 100}.
                  </Typography>
                ) : null}
                <RHFTextField
                  name="utr"
                  label="UTR / Transaction ID"
                  placeholder="UTR / Transaction ID"
                />
                <RHFTextField
                  type="date"
                  name="transactionDate"
                  InputLabelProps={{ shrink: true }}
                  label="Transaction Date"
                />
                <Stack>
                  <Stack>
                    {deposit == "CASH"
                      ? "Choose Receipt upload"
                      : "Choose Screenshot / receipt(Optional)"}{" "}
                  </Stack>
                  <Upload
                    file={uploadFile}
                    onDrop={handleDropSingleFile}
                    onDelete={() => setUploadFile(null)}
                  />
                  <Stack
                    flexDirection={"row"}
                    mt={2}
                    style={
                      uploadFile != null
                        ? { visibility: "visible" }
                        : { visibility: "hidden" }
                    }
                  >
                    {success == "upload" ? (
                      <LoadingButton
                        variant="contained"
                        component="span"
                        style={{ width: "fit-content" }}
                        onClick={() => uploadDoc()}
                      >
                        Upload File
                      </LoadingButton>
                    ) : success == "wait" ? (
                      <LoadingButton
                        variant="contained"
                        loading
                        component="span"
                      >
                        success
                      </LoadingButton>
                    ) : (
                      <LoadingButton variant="contained" component="span">
                        success
                      </LoadingButton>
                    )}
                  </Stack>
                </Stack>
              </Grid>
              <Stack flexDirection={"row"} sx={{ my: 2 }}>
                <Checkbox {...label} defaultChecked sx={{ color: "#2065D1" }} />
                <Typography sx={{ fontSize: "14px" }}>
                  I have transfered funds from my own account and UPI/VPA ID
                  held in my name and verified. These funds have been acquired
                  by me through legitimate sources.
                </Typography>
              </Stack>
              <LoadingButton
                fullWidth
                size="medium"
                type="submit"
                variant="contained"
                sx={{
                  mt: 5,
                }}
              >
                Submit
              </LoadingButton>
            </Scrollbar>
          </Box>
        </FormProvider>
      </Modal>
    </>
  );
}
