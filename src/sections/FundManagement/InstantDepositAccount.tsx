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
  SwitchProps,
  Checkbox,
  Switch,
} from "@mui/material";
// routes

import Image from "src/components/image/Image";
// components
import { Helmet } from "react-helmet-async";
// sections

// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Label from "src/components/label/Label";
import { Upload } from "src/components/upload";
import { UploadFile } from "src/webservices";

import { Box, CardProps, Typography } from "@mui/material";
import React from "react";
import { Api } from "src/webservices";
import { Icon } from "@iconify/react";
import { useSnackbar } from "notistack";
import neodeposit from "../../assets/icons/neodeposit.svg";
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

export default function InstantDepositAccount() {
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
  ////

  const [customerId, setCustomerId] = useState("");
  const [VPAccountAddress, setVPAccountAddress] = useState("");
  const [VPAccountAccountNumber, setVPAccountAccountNumber] = useState("");
  const [VPAccountBankName, setVPAccountBankName] = useState("");
  const [VPAccountaddressIfsc, setVPAccountIfsc] = useState("");
  const [VPAccountName, setVPAccountName] = useState("");
  const [customerReg, setCustomerReg] = useState("Customer Registration");

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
  const [currentTab, setCurrentTab] = useState("active");
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
  // const [vpaState, setState] = useState('');

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

  const category = [
    {
      _id: 1,
      status: "active",
      name: "Instant Deposits",
      label: "Auto collect Deposits",
      icon: neodeposit,
    },
  ];

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
    vpaAccount();
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
                  setDbank(Response?.data?.dbank?.bankAccounts);
                  setMDbank(Response?.data?.mbank?.bankAccounts);
                  setDBankTab(Response?.data?.dbank?.bankAccounts[0]);
                  setMDBankTab(Response?.data?.mbank?.bankAccounts[0]);
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
                  setMDbank(Response?.data?.mdata?.bankAccounts);
                  setMDBankTab(Response?.data?.mdata?.bankAccounts[0]);
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

  const vpaAccount = () => {
    let token = localStorage.getItem("token");
    Api(`agent/get_AgentDetail`, "GET", "", token).then((Response: any) => {
      console.log(
        "========registerForAutoCollect,,,,,,,,,,,,,,,,,=====>" + Response
      );

      if (Response.status == 200) {
        setCustomerId(Response.data.data.autoCollect.customerId);
        setVPAccountAddress(
          Response.data.data.autoCollect.virtualPaymentAddressDetails.address
        );
        setVPAccountAccountNumber(
          Response.data.data.autoCollect.virtualBankAccountDetails.accountNumber
        );
        setVPAccountBankName(
          Response.data.data.autoCollect.virtualBankAccountDetails.bankName
        );
        setVPAccountIfsc(
          Response.data.data.autoCollect.virtualBankAccountDetails.ifsc
        );
        setVPAccountName(
          Response.data.data.autoCollect.virtualBankAccountDetails.name
        );
        enqueueSnackbar(Response.data.message);
      } else {
        console.log("======BankList=======>" + Response);
        enqueueSnackbar(Response?.data?.message, { variant: "error" });
      }
    });
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
    Api(`agent/fundManagement/getAdminBank`, "GET", "", token).then(
      (Response: any) => {
        console.log("======BankList==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setAdminbank(Response.data.data);
            setAdminBankTab(Response.data.data[0]);
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

  const CreateCustomer = () => {
    let token = localStorage.getItem("token");
    let id = user?._id;

    Api(`agent/createVirtualAccount`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          console.log("CreateCustomerId==========>", Response);
          enqueueSnackbar(Response.data.message);
          setCustomerReg("Create Virtual Account");
        } else {
          console.log("======BankList=======>" + Response);
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    );
  };

  const RegisterVPAacc = () => {
    let token = localStorage.getItem("token");
    let id = user?._id;
    Api(`agent/registerForAutoCollect`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          console.log("RegisterVPAAccount==========>", Response);
          enqueueSnackbar(Response.data.message);
        } else {
          console.log("======BankList=======>" + Response);
          enqueueSnackbar(Response.data.message, { variant: "error" });
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
      <Box>
        <Tabs
          value={currentTab}
          aria-label="basic tabs example"
          onChange={(event, newValue) => setCurrentTab(newValue)}
        >
          {category.map((tab: any) => (
            <Tab
              key={tab._id}
              sx={{ mx: 3, textAlign: "start" }}
              label={
                <Grid
                  display={"grid"}
                  gridTemplateColumns={"repeat(2, auto)"}
                  gap={1}
                  alignItems={"center"}
                >
                  <Image
                    src={tab.icon}
                    alt=""
                    sx={{ width: 30, height: 30, objectFit: "cover" }}
                  />
                  <Stack>
                    <Typography variant="h5">{tab.name}</Typography>
                    <Typography variant="body2">{tab.label}</Typography>
                  </Stack>
                </Grid>
              }
              value={tab.status}
            />
          ))}
        </Tabs>

        {category.map(
          (tab: any) =>
            tab.status == currentTab && (
              <Box key={tab.status} sx={{ m: 3 }}>
                {currentTab == "active" ? (
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
                      <Grid>
                        {VPAccountAccountNumber || VPAccountAddress ? (
                          <Box display="flex">
                            <Grid sx={{ pl: 1, borderRadius: "20px" }}>
                              <Typography
                                sx={{ fontWeight: 700, fontSize: "1.1em" }}
                              >
                                Account Number
                              </Typography>
                              <Typography
                                onClick={(e) =>
                                  copyToClipboard(e.currentTarget.textContent)
                                }
                                sx={{ cursor: "pointer" }}
                              >
                                {VPAccountAccountNumber}
                                <Icon
                                  style={{ fontSize: "20px", float: "right" }}
                                  icon="uil:copy"
                                />
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.1em",
                                  pt: 1.5,
                                }}
                              >
                                Bank Name
                              </Typography>
                              <Typography
                                onClick={(e) =>
                                  copyToClipboard(e.currentTarget.textContent)
                                }
                                sx={{ cursor: "pointer" }}
                              >
                                {VPAccountBankName}
                                <Icon
                                  style={{ fontSize: "20px", float: "right" }}
                                  icon="uil:copy"
                                />
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.1em",
                                  pt: 1.5,
                                }}
                              >
                                IFSC
                              </Typography>
                              <Typography
                                onClick={(e) =>
                                  copyToClipboard(e.currentTarget.textContent)
                                }
                                sx={{ cursor: "pointer" }}
                              >
                                {VPAccountaddressIfsc}
                                <Icon
                                  style={{ fontSize: "20px", float: "right" }}
                                  icon="uil:copy"
                                />
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "1.1em",
                                  pt: 1.5,
                                }}
                              >
                                Name
                              </Typography>
                              <Typography
                                onClick={(e) =>
                                  copyToClipboard(e.currentTarget.textContent)
                                }
                                sx={{ cursor: "pointer" }}
                              >
                                {VPAccountName}
                                <Icon
                                  style={{ fontSize: "20px", float: "right" }}
                                  icon="uil:copy"
                                />
                              </Typography>
                            </Grid>
                          </Box>
                        ) : customerId ? (
                          <Button
                            variant="contained"
                            sx={{ my: 1 }}
                            onClick={CreateCustomer}
                          >
                            {/* Create Virtual Account */} {customerReg}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            sx={{ my: 1 }}
                            onClick={RegisterVPAacc}
                          >
                            {/* Customer Registration */}
                            {customerReg}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  ""
                )}
              </Box>
            )
        )}
      </Box>

      {/* ***************************modal for load wallet request*************************** */}
    </>
  );
}
