import React, { useEffect } from "react";
import { useState } from "react";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import Scrollbar from "../../../components/scrollbar";
import { Icon } from "@iconify/react";

// @mui
import {
  Grid,
  Modal,
  Card,
  Box,
  Table,
  Button,
  TableBody,
  Stack,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  MenuItem,
  Divider,
  TextField,
  Typography,
  CircularProgress,
  FormHelperText,
  useTheme,
} from "@mui/material";
import { Api } from "src/webservices";
// import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFCodes,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import _ from "lodash";
import DMT1pay from "./DMT1pay";
import Autocomplete from "@mui/material/Autocomplete";
import ApiDataLoading from "../../../components/customFunctions/ApiDataLoading";
// ----------------------------------------------------------------------

type FormValuesProps = {
  beneName: string;
  BmobileNumber: string;
  Bemail: string;
  BaccountNumber: string;
  BconfirmAccountNumber: string;
  Bifsc: string;
  remitterRelation: string;
  remitteBank: string;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

//--------------------------------------------------------------------

export default function DMT1BeneTable(props: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [transferShow, settransferShow] = useState(false);
  const [tabledata, setTableData] = useState<any>([]);

  //modal for add Beneficiary
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => setModalEdit(true);
  const handleClose = () => {
    setVerifyName("");
    setModalEdit(false);
  };

  //modal for delete beneficiary

  const [verifyData, setVerifyData] = useState({
    ifsc: "",
    accountNumber: "",
    bankName: "",
    bankId: "",
  });

  const [verifyName, setVerifyName] = useState("");
  const [bankNameErr, setBankNameErr] = useState<any>();
  const [Name, setName] = useState("");

  const [verifyDetail, setVerifyDetail] = useState({
    remitterMobileNumber: "",
    beneficiaryName: "",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    beneficiaryMobile: "",
    relationship: "",
    beneficiaryEmail: "",
    isBeneVerified: false,
    beneId: "",
  });

  const [payoutData, setPayoutData] = React.useState({
    bankName: "",
    accountNumber: "914010048942123",
    mobileNumber: "8588040488",
    rayzorpayBeneId: "fa_LtUNzeAyAD9pMQ",
    tramoBeneId: "",
    _id: "",
  });

  const DMTSchema = Yup.object().shape({
    remitterRelation: Yup.string().required("Relation is required"),
  });
  const defaultValues = {
    beneName: "",
    remitterRelation: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    fatchBeneficiary(props.remitter.remitterMobile);
  }, [props.remitter]);

  const fatchBeneficiary = (val: any) => {
    let token = localStorage.getItem("token");
    Api("dmt1/beneficiary/" + val, "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setTableData(Response.data.data);
          console.log(
            "==============>>> fatch beneficiary data 200",
            Response.data.data.data[0]
          );
        } else {
          enqueueSnackbar(Response.data.message);
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.message
          );
        }
      }
    });
  };
  const addBeneficiary = (data: FormValuesProps) => {
    if (Name == "") {
      setBankNameErr("");
    }
    if (Name || verifyName) {
      setVerifyDetail({
        ...verifyDetail,
        remitterMobileNumber: props.remitter.remitterMobile,
        beneficiaryName: verifyName ? verifyName : Name,
        accountNumber: verifyData.accountNumber,
        bankName: verifyData.bankName,
        ifsc: verifyData.ifsc,
        beneficiaryMobile: data.BmobileNumber || "",
        relationship: data.remitterRelation,
        beneficiaryEmail: data.Bemail || "",
        isBeneVerified: verifyName ? true : false,
      });
      let token = localStorage.getItem("token");
      let body = {
        remitterMobile: props.remitter.remitterMobile,
        beneficiaryName: "Sumit Kumar",
        ifsc: "UTIB0000824",
        accountNumber: "914010048942123",
        beneficiaryMobile: data.BmobileNumber || "",
        beneficiaryEmail: data.Bemail || "",
        relationship: data.remitterRelation,
        bankName: "AxisBank",
        isBeneVerified: verifyName ? true : false,
        bankId: 1,
      };

      Api("dmt1/beneficiary", "POST", body, token).then((Response: any) => {
        console.log(
          "==============>>> register beneficiary Response",
          Response
        );
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            handleClose();
            enqueueSnackbar(Response.data.message);
            reset(defaultValues);
            setName("");
            setVerifyName("");
            setTableData(Response.data.data.beneficiariesDetails);
            setVerifyDetail({
              ...verifyDetail,
              beneId: "",
            });
            console.log(
              "=====>>> register beneficiary data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.error.message);
            console.log(
              "==============>>> register beneficiary msg",
              Response.data.message
            );
          }
        }
      });
    } else {
      enqueueSnackbar("Please Enter Beneficiary Name");
    }
  };

  function varifyBank(val: any) {
    setVerifyData(val);
  }
  function beneVerifyData(val: any) {
    setVerifyName(val);
  }

  function callback(val: any) {
    setPayoutData(val);
  }

  function deleteBene(val: any) {
    setTableData(
      tabledata.filter((item: any) => {
        return item._id !== val._id;
      })
    );
  }

  return (
    <>
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer component={Paper}>
            <Scrollbar
              sx={{
                height: "fit-content",
                maxHeight: 500,
                scrollbarWidth: "thin",
              }}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                style={{ borderBottom: "1px solid #dadada" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>
                      Beneficiary Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>A/c No.</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>IFSC code</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      Mobile Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Verification</TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tabledata.map((row: any) => (
                    <BeneList
                      key={row._id}
                      row={row}
                      callback={callback}
                      remitterNumber={props.remitter.remitterMobile}
                      deleteBene={deleteBene}
                    />
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
            {verifyDetail.beneId && (
              <VerifyAddBene verifyDetail={verifyDetail} />
            )}
          </TableContainer>
          <Stack justifyContent={"end"} flexDirection={"row"} my={2}>
            <Button variant="contained" size="medium" onClick={openEditModal}>
              <span style={{ paddingRight: "5px", fontSize: "14px" }}>+ </span>{" "}
              Add New Beneficiary
            </Button>
          </Stack>
        </Paper>
      </Grid>
      {payoutData._id && (
        <DMT1pay remitter={props.remitter} beneficiary={payoutData} />
      )}

      {/* modal for add beneficiary */}
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          item
          xs={12}
          md={8}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Card sx={{ p: 3 }}>
            <VerifyBankAccountForm
              verifyForm={varifyBank}
              beneVerify={beneVerifyData}
            />
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(addBeneficiary)}
            >
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                }}
              >
                {verifyName ? (
                  <RHFTextField
                    type="text"
                    name="beneName1"
                    disabled
                    label="Beneficiary Name"
                    variant="filled"
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                  />
                ) : (
                  <TextField
                    error={bankNameErr == ""}
                    label="Beneficiary Name"
                    helperText={
                      bankNameErr == "" && "Please Enter Beneficiary Name"
                    }
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{
                      "aria-autocomplete": "none",
                    }}
                  />
                  // <RHFTextField type="text" name="beneName" label="Beneficiary Name" />
                )}
                <RHFSelect
                  name="remitterRelation"
                  label="Relation"
                  placeholder="Relation"
                  // InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    native: false,
                    sx: { textTransform: "capitalize" },
                  }}
                >
                  <MenuItem value="Husband/Wife">Husband/Wife</MenuItem>
                  <MenuItem value="Brother/Sister">Brother/Sister</MenuItem>
                  <MenuItem value="Mother/Father">Mother/Father</MenuItem>
                  <MenuItem value="Son/Daughter">Son/Daughter</MenuItem>
                  <MenuItem value="Aunt/Uncle">Aunt/Uncle</MenuItem>
                  <MenuItem value="Niece/Nephew">Niece/Nephew</MenuItem>
                  <MenuItem value="Friends">Friends</MenuItem>
                  <MenuItem value="Other">other</MenuItem>
                </RHFSelect>

                <Divider />
                <Divider />
                <RHFTextField
                  name="BmobileNumber"
                  label="Mobile Number (Optional)"
                />
                <RHFTextField name="Bemail" label="Email (Optional)" />
              </Box>
              <Stack flexDirection={"row"} gap={2} mt={2}>
                <Button type="submit" variant="contained">
                  Add Beneficiary
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Stack>
            </FormProvider>
          </Card>
        </Grid>
      </Modal>
      {/* modal for delete bene */}
    </>
  );
}

function VerifyBankAccountForm(props: any) {
  const theme = useTheme();
  const [selectedValue, setSelectedValue] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankid, setBankId] = useState({ BankID: "" });
  const [accNumber, setAccNumber] = useState("");
  const [accountNoDisable, setAccountNoDisable] = useState(false);
  const [btn, setbtn] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [bankList, setBankList] = useState([]);

  //ERROR HANDLING
  const [ifscError, setIfscError] = useState<any>();
  const [bankNameErr, setBankNameErr] = useState<any>("a");
  const [bankAccErr, setBankAccErr] = useState<any>();

  useEffect(() => {
    getBankList();
  }, []);

  useEffect(() => {
    let obj = {
      ifsc: ifsc,
      accountNumber: accNumber,
      bankName: selectedValue,
      bankId: bankid,
    };
    props.verifyForm(obj);
  }, [ifsc, accNumber, selectedValue]);

  const getBankList = () => {
    let token = localStorage.getItem("token");
    Api("bankManagement/get_bank", "GET", "", token).then((Response: any) => {
      console.log("==============>>>fatch beneficiary Response", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          let bank: any = [];
          setBankList(
            Response.data.data.filter((item: any) => {
              if (item.ekoBankId) {
                return item;
              }
            })
          );
          enqueueSnackbar(Response.data.message);
          console.log(
            "==============>>> banklist data 200",
            Response.data.data.data
          );
        } else {
          console.log(
            "==============>>> fatch beneficiary message",
            Response.data.message
          );
        }
      }
    });
  };

  const verifyBene = () => {
    setbtn(false);
    if (!ifsc) {
      setIfscError(0);
    }
    if (ifsc.length < 11) {
      setIfscError(10);
    }
    if (!selectedValue) {
      setBankNameErr("");
    }
    if (!accNumber) {
      setBankAccErr("");
    }
    if (selectedValue !== "" || accNumber == "" || ifsc == "") {
      let token = localStorage.getItem("token");
      let body = {
        ifsc: ifsc,
        accountNumber: accNumber,
        bankName: selectedValue,
      };
      Api("dmt1/beneficiary/verify", "POST", body, token).then(
        (Response: any) => {
          console.log(
            "==============>>> verify beneficiary Response",
            Response
          );
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              props.beneVerify(Response.data.name);
              setAccountNoDisable(true);
              setbtn(true);
              setBankNameErr("a");
              console.log(
                "=====>>> verify beneficiary data 200",
                Response.data.data.message
              );
            } else {
              enqueueSnackbar(Response.data.message);
              setbtn(true);

              console.log(
                "==============>>> verify beneficiary msg",
                Response.data.message
              );
            }
          } else {
            setbtn(true);
          }
        }
      );
    } else {
      enqueueSnackbar("Please enter valid Fields");
      setbtn(true);
    }
  };

  function setBankValues(val: any) {
    setBankId(val.ekoBankId);
    setSelectedValue(val.bankName);
    setIfsc(val.masterIFSC);
  }

  return (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
      }}
      mb={2}
    >
      <Autocomplete
        id="bank-select-demo"
        options={bankList}
        autoHighlight
        getOptionLabel={(option: any) => option.bankName}
        onChange={(event, value) => setBankValues(value)}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
            {...props}
          >
            {option.bankName}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Bank Name"
            error={bankNameErr.length == 0}
            helperText={bankNameErr.length == 0 && "Bank Name is required"}
            inputProps={{
              ...params.inputProps,
              "aria-autocomplete": "none",
            }}
          />
        )}
      />
      <TextField
        error={ifscError == 0 || ifscError == 10}
        label="IFSC Code"
        helperText={
          ifscError == 0
            ? "Please Enter IFSC code"
            : ifscError == 10
            ? "Please Enter Valid IFSC"
            : ""
        }
        value={ifsc}
        onChange={(e) => setIfsc(e.target.value)}
        inputProps={{
          "aria-autocomplete": "none",
        }}
      />
      <TextField
        type="number"
        error={bankAccErr == ""}
        label="Account Number"
        variant={accountNoDisable ? "filled" : "outlined"}
        disabled={accountNoDisable}
        helperText={bankAccErr == "" && "Please Enter Account Number"}
        value={accNumber}
        onChange={(e) => setAccNumber(e.target.value)}
        inputProps={{
          "aria-autocomplete": "none",
        }}
      />
      <Stack
        flexDirection={"row"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"fir-content"}
      >
        {btn ? (
          <Button
            variant="contained"
            disabled={accountNoDisable}
            onClick={verifyBene}
          >
            verify Account Detail
          </Button>
        ) : (
          <ApiDataLoading />
        )}
      </Stack>
    </Box>
  );
}
// ----------------------------------------------------------------------

const VerifyAddBene = ({ verifyDetail }: any) => {
  const {
    remitterMobileNumber,
    beneficiaryName,
    accountNumber,
    bankName,
    ifsc,
    beneficiaryMobile,
    relationship,
    beneficiaryEmail,
    isBeneVerified,
    beneId,
  } = verifyDetail;
  const { enqueueSnackbar } = useSnackbar();
  const [open, setModalEdit] = React.useState(true);
  const openEditModal = (val: any) => setModalEdit(true);
  const handleClose = () => setModalEdit(false);

  const DMTSchema = Yup.object().shape({
    otp1: Yup.string().required(),
    otp2: Yup.string().required(),
    otp3: Yup.string().required(),
    otp4: Yup.string().required(),
    otp5: Yup.string().required(),
    otp6: Yup.string().required(),
  });
  const defaultValues = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const verifyBeneOTP = (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      beneId: beneId,
      remitterMobile: remitterMobileNumber,
      otp:
        data.otp1 + data.otp2 + data.otp3 + data.otp4 + data.otp5 + data.otp6,
      accountNumber: accountNumber,
      ifsc: ifsc,
      beneficiaryMobile: beneficiaryMobile,
      beneficiaryName: beneficiaryName,
      relationship: relationship,
      bankName: bankName,
      isBeneVerified: isBeneVerified,
      beneficiaryEmail: beneficiaryEmail,
    };
    Api("dmt1/beneficiary/verify", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>> verify beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose();
            // setTableData(
            //   tabledata.map((item: any) => {
            //     if (item._id == val) {
            //       return { ...item, isVerified: true };
            //     } else {
            //       return item;
            //     }
            //   })
            // );
            // setVarifyStatus(true);
            reset(defaultValues);
            console.log(
              "==============>>> verify beneficiary data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.message);
            console.log(
              "==============>>> verify beneficiary msg",
              Response.data.message
            );
          }
        }
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <FormProvider methods={methods}>
        <Grid
          item
          xs={12}
          md={8}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Card sx={{ p: 3 }}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(verifyBeneOTP)}
            >
              <Stack
                alignItems={"center"}
                justifyContent={"space-between"}
                mt={2}
                gap={2}
              >
                <Typography variant="h4">OTP</Typography>
                <RHFCodes
                  keyName="otp"
                  inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
                  type="password"
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
                <Stack flexDirection={"row"} gap={1} mt={2}>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </Stack>
              </Stack>
            </FormProvider>
          </Card>
        </Grid>
      </FormProvider>
    </Modal>
  );
};

function BeneList({ row, callback, remitterNumber, deleteBene }: any) {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [cell, setCell] = useState(row);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [varifyStatus, setVarifyStatus] = useState(true);
  const [confimDele, setConfimDele] = useState(true);
  const [count, setCount] = useState(0);

  const [open2, setModalEdit2] = React.useState(false);
  const openEditModal2 = (val: any) => {
    setModalEdit2(true);
    setPayoutData(val);
    deleteBeneficiary(remitterNumber);
  };

  const handleClose2 = () => {
    setModalEdit2(false);
    // settransferShow(false);
    setDeleteOtp("");
    setConfimDele(true);
  };
  const [payoutData, setPayoutData] = React.useState({
    bankName: "",
    accountNumber: "914010048942123",
    mobileNumber: "8588040488",
    rayzorpayBeneId: "fa_LtUNzeAyAD9pMQ",
    tramoBeneId: "",
    _id: "",
  });

  const DMTSchema = Yup.object().shape({
    remitterRelation: Yup.string().required("Relation is required"),
  });
  const defaultValues = {
    beneName: "",
    remitterRelation: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(DMTSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const verifyBene = (val: string) => {
    setVarifyStatus(false);
    let token = localStorage.getItem("token");
    let body = {
      beneficiaryId: val,
    };
    Api("dmt1/beneficiary/verify", "POST", body, token).then(
      (Response: any) => {
        console.log("==============>>> verify beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            callback(val);
            setVarifyStatus(true);
            console.log(
              "==============>>> verify beneficiary data 200",
              Response.data.data
            );
          } else {
            enqueueSnackbar(Response.data.message);
            setVarifyStatus(true);
            console.log(
              "==============>>> verify beneficiary msg",
              Response.data.message
            );
          }
        }
      }
    );
  };

  const deleteBeneficiary = (val: string) => {
    let token = localStorage.getItem("token");
    Api("dmt1/beneficiary/delete/sendOtp/" + val, "GET", "", token).then(
      (Response: any) => {
        console.log("==============>>> verify beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            console.log(
              "==============>>> verify beneficiary data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.message);
            console.log(
              "==============>>> verify beneficiary msg",
              Response.data.message
            );
          }
        }
      }
    );
  };
  const confirmDeleteBene = () => {
    setConfimDele(false);
    let token = localStorage.getItem("token");
    let body = {
      remitterMobile: remitterNumber,
      beneficiaryId: payoutData._id,
      otp: deleteOtp,
    };
    Api("dmt1/beneficiary/delete", "POST", body, token).then(
      (Response: any) => {
        console.log("========>>> verify beneficiary Response", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            handleClose2();
            setDeleteOtp("");
            setConfimDele(true);
            deleteBene(payoutData._id);
            console.log(
              "==============>>> verify beneficiary data 200",
              Response.data.data.message
            );
          } else {
            enqueueSnackbar(Response.data.message);
            console.log(
              "==============>>> verify beneficiary msg",
              Response.data.message
            );
          }
        }
      }
    );
  };

  useEffect(() => {
    if (count > 0) {
      const timer = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [count]);

  function ResendOtp() {
    deleteBene(remitterNumber);
    setCount(30);
  }

  return (
    <>
      <TableRow hover key={cell.bene_id} sx={{ cursor: "pointer" }}>
        <TableCell>{cell.beneName}</TableCell>
        <TableCell>{cell.accountNumber}</TableCell>
        <TableCell>{cell.ifsc}</TableCell>
        <TableCell>{cell.mobileNumber}</TableCell>
        <TableCell>
          {varifyStatus ? (
            <Stack>
              {!cell.isVerified ? (
                <Button
                  sx={{ display: "flex", alignItems: "center", width: "105px" }}
                  variant="contained"
                  color="warning"
                  onClick={() => verifyBene(cell._id)}
                >
                  Verify Now
                </Button>
              ) : (
                <TableCell style={{ color: "#00AB55" }}>
                  <Icon icon="material-symbols:verified" /> Verified
                </TableCell>
              )}
            </Stack>
          ) : (
            <ApiDataLoading />
          )}
        </TableCell>
        <TableCell>
          <Stack justifyContent={"center"} flexDirection={"row"}>
            <Button variant="contained" onClick={() => callback(cell)}>
              Pay
            </Button>
            <Button onClick={() => openEditModal2(cell)} sx={{ ml: 3 }}>
              <Icon icon="ic:outline-delete" fontSize={25} color={"red"} />
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      <Modal
        open={open2}
        onClose={handleClose2}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <FormProvider methods={methods}>
          <Grid
            item
            xs={12}
            md={8}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Card sx={{ p: 3 }}>
              <Stack>
                <RHFTextField
                  type="number"
                  name="deleteotp"
                  label="OTP"
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value)}
                />
              </Stack>
              {count === 0 ? (
                <Typography
                  variant="subtitle2"
                  onClick={ResendOtp}
                  sx={{
                    width: "fit-content",
                    mt: 2,
                    cursor: "pointer",
                    color: theme.palette.primary.main,
                  }}
                >
                  Resend OTP
                </Typography>
              ) : (
                <Typography
                  variant="subtitle2"
                  sx={{ width: "fit-content", mt: 2 }}
                >
                  Wait {count} sec to resend OTP
                </Typography>
              )}
              {confimDele ? (
                <>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={confirmDeleteBene}
                  >
                    Delete Beneficiary
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleClose2}
                    sx={{ mt: 2, ml: 1 }}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <ApiDataLoading />
              )}
            </Card>
          </Grid>
        </FormProvider>
      </Modal>
    </>
  );
}
