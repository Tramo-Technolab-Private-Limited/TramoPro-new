import { useEffect, useState } from "react";
// @mui
import {
  Stack,
  Grid,
  Button,
  Typography,
  Modal,
  FormControlLabel,
  styled,
  SwitchProps,
  Switch,
  useTheme,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
// sections

import { useSnackbar } from "src/components/snackbar";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, TableRow, TableCell } from "@mui/material";
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from "src/components/hook-form";
import React from "react";
import { Api } from "src/webservices";
import { LoadingButton } from "@mui/lab";
import { Icon } from "@iconify/react";
import { AnimatePresence, m } from "framer-motion";
import {
  MotionContainer,
  varBgKenburns,
  varBounce,
  varSlide,
} from "../../components/animate";
import MotionModal from "src/components/animate/MotionModal";

// ----------------------------------------------------------------------
type FormValuesProps = {
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
};

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 62,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(32px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function MyBankAccount() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState("active");
  const [Loading, setLoading] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [active, setActive] = useState(true);
  const [addBankLoading, setAddBankLoading] = useState(false);
  const [bankList, setBankList] = useState<any>([]);
  const [userBankList, setUserBankList] = useState<any>([]);
  const [selectBank, setSelectBank] = useState<any>({
    name: "",
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    ifsc: "",
    pincode: "",
    state: "",
    isDefaultBank: "",
  });
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
    reset(defaultValues);
  };
  const handleClose = () => setOpen(false);

  const FilterSchema = Yup.object().shape({
    bankName: Yup.string().required("Bank Name is required"),
    accountNumber: Yup.string().required("Account Number is required"),
    ifsc: Yup.string().required("IFSC code is required"),
    confirmAccountNumber: Yup.string()
      .required("Confirm Account Number is required")
      .oneOf([Yup.ref("accountNumber"), null], "Account Number must match"),
  });
  const defaultValues = {
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
    mode: "all",
  });
  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const category = [
    { _id: 1, status: "active", name: "Active Bank Accounts" },
    { _id: 2, status: "disable", name: "" },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "100%", sm: 500 },
  };

  useEffect(() => {
    getUserBankList();
  }, []);

  const getUserBankList = () => {
    let token = localStorage.getItem("token");
    Api(`user/user_bank_list`, "GET", "", token).then((Response: any) => {
      console.log("======BankList==response=====>" + Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          if (Response.data.data.length) {
            setUserBankList(Response?.data?.data[0]?.bankAccounts);
            setSelectBank(Response?.data?.data[0]?.bankAccounts[0]);
          }
        } else {
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
      }
    });
  };

  const getBankList = () => {
    setLoading(true);
    let token = localStorage.getItem("token");
    Api("bankManagement/get_bank", "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setBankList(Response?.data?.data);
          handleOpen();
        } else {
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
        setLoading(false);
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
        setLoading(false);
      }
    });
  };

  const addBank = (data: FormValuesProps) => {
    setAddBankLoading(true);
    try {
      let token = localStorage.getItem("token");
      let body = {
        bankName: data?.bankName,
        account_number: data?.accountNumber,
        ifsc: data?.ifsc,
      };
      Api(`user/KYC/bank_acc_verify`, "POST", body, token).then(
        (Response: any) => {
          console.log("======bank_acc_verify=Response====>" + Response);
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              getUserBankList();
              enqueueSnackbar(Response.data.message);
              handleClose();
            } else if (Response.data.code == 400) {
              enqueueSnackbar(Response.data.message, { variant: "error" });
            } else {
              enqueueSnackbar(Response.data.error.message, {
                variant: "error",
              });
            }
            setAddBankLoading(false);
          } else {
            setAddBankLoading(false);
            enqueueSnackbar("Failed", { variant: "error" });
          }
        }
      );
    } catch (err) {
      console.log("bank_acc_verify=error", err);
    }
  };

  const defaultBank = (accountNumber: string, ifsc: string) => {
    setDefaultLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      accountNumber: accountNumber,
      ifsc: ifsc,
    };
    Api(`user/set_default_bank`, "POST", body, token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          setUserBankList(
            userBankList.map((item: any) => {
              if (
                item.accountNumber == selectBank.accountNumber &&
                item.ifsc == selectBank.ifsc
              ) {
                return { ...item, isDefaultBank: true };
              } else {
                return { ...item, isDefaultBank: false };
              }
            })
          );
          setDefaultLoading(false);
          setSelectBank({ ...selectBank, isDefaultBank: true });
        } else {
          setDefaultLoading(false);
          enqueueSnackbar(Response?.data?.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
        setDefaultLoading(false);
      }
    });
  };

  const changeBankDetail = (val: string) => {
    userBankList.forEach((item: any) => {
      if (item._id === val) {
        setSelectBank(item);
      }
    });
  };
  return (
    <>
      <Helmet>
        <title>
          View Update Bank Detail | {process.env.REACT_APP_COMPANY_NAME}
        </title>
      </Helmet>
      <Box>
        <Stack flexDirection={"row"} justifyContent={"space-between"} m={1}>
          <Typography variant="h4">Bank Accounts</Typography>
          <LoadingButton
            variant="contained"
            onClick={getBankList}
            loading={Loading}
            disabled={userBankList.length === 5}
          >
            Add New Bank Account
          </LoadingButton>
        </Stack>

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
                      sm: "0.2fr 0.8fr",
                    }}
                  >
                    {userBankList?.length > 0 && (
                      <>
                        <Grid
                          rowGap={3}
                          columnGap={2}
                          display="grid"
                          height={"fit-content"}
                          gridTemplateColumns={{
                            xs: "repeat(1, 1fr)",
                            // sm: 'repeat(2, 1fr)'
                          }}
                        >
                          {userBankList?.length &&
                            userBankList.map((item: any, index: any) => {
                              return (
                                <Button
                                  variant={
                                    selectBank.accountNumber ==
                                    item.accountNumber
                                      ? "contained"
                                      : "outlined"
                                  }
                                  key={item._id}
                                  value={item?.accountNumber}
                                  onClick={() => {
                                    changeBankDetail(item?._id);
                                  }}
                                >
                                  {item.bankName}
                                </Button>
                              );
                            })}
                        </Grid>
                        <Grid>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>
                              Name
                            </TableCell>
                            <TableCell>{selectBank?.name}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>
                              Bank Name
                            </TableCell>
                            <TableCell>{selectBank?.bankName}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>
                              Account Number
                            </TableCell>
                            <TableCell>{selectBank?.accountNumber}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>
                              IFSC code
                            </TableCell>
                            <TableCell>{selectBank?.ifsc}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>
                              Default Bank
                            </TableCell>
                            <TableCell>
                              {selectBank?.isDefaultBank ? (
                                <Icon
                                  icon="ic:round-done-outline"
                                  color={theme.palette.primary.main}
                                  fontSize={40}
                                />
                              ) : (
                                <LoadingButton
                                  onClick={() =>
                                    defaultBank(
                                      selectBank.accountNumber,
                                      selectBank.ifsc
                                    )
                                  }
                                  loading={defaultLoading}
                                  variant="contained"
                                >
                                  Set default Bank
                                </LoadingButton>
                              )}
                            </TableCell>
                          </TableRow>
                        </Grid>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box
                    rowGap={3}
                    columnGap={10}
                    display="grid"
                    gridTemplateColumns={{
                      xs: "repeat(1, 1fr)",
                      sm: "0.2fr 0.8fr",
                    }}
                  >
                    <Grid
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      height={100}
                      gridTemplateColumns={{
                        xs: "repeat(1, 1fr)",
                        // sm: 'repeat(2, 1fr)'
                      }}
                    >
                      <Button variant="contained">IDFC Bank</Button>
                      <Button variant="outlined">Fino Bank Ltd</Button>
                    </Grid>
                    <Grid>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Bank Name
                        </TableCell>
                        <TableCell>IDFC Bank</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Bank Branch
                        </TableCell>
                        <TableCell>saharanpur</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Account Number
                        </TableCell>
                        <TableCell>99999999999</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          IFSC code
                        </TableCell>
                        <TableCell>IDFC001234</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Min Deposits Limit
                        </TableCell>
                        <TableCell>10,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Max Deposits Limit
                        </TableCell>
                        <TableCell>2 Cr</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Allowed Transaction Type
                        </TableCell>
                        <TableCell>NEFT, IMPS</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }}>
                          Cash Deposits Charge
                        </TableCell>
                        <TableCell>3 rs./ 1000rs.</TableCell>
                      </TableRow>
                      <FormControlLabel
                        control={<IOSSwitch sx={{ m: 1 }} />}
                        onClick={() => setActive(!active)}
                        value={active ? "Active" : "Disable"}
                        label={active ? "Active" : "Disable"}
                      />
                      <TableCell>
                        Bank Account is Disabled for Everyone
                      </TableCell>
                    </Grid>
                  </Box>
                )}
              </Box>
            )
        )}
      </Box>

      <MotionModal
        open={open}
        onClose={handleClose}
        width={{ xs: "100%", sm: 500 }}
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(addBank)}>
          <Grid
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: "repeat(1, 1fr)",
            }}
          >
            <RHFAutocomplete
              name="bank"
              onChange={(event, value) => {
                setValue("bankName", value?.bankName);
                setValue("ifsc", value?.masterIFSC);
              }}
              options={bankList.map((option: any) => option)}
              getOptionLabel={(option: any) => option.bankName}
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
                <RHFTextField name="bankName" label="Bank Name" {...params} />
              )}
            />

            <RHFTextField
              name="ifsc"
              label="IFSC code"
              placeholder="IFSC code"
              InputLabelProps={{
                shrink: watch("ifsc") ? true : false,
              }}
            />
            <RHFTextField
              type="number"
              name="accountNumber"
              label="Account Number"
              placeholder="Account Number"
              autoComplete="off"
            />
            <RHFTextField
              type="password"
              name="confirmAccountNumber"
              label="Confirm Account Number"
              onPaste={(e) => e.preventDefault()}
              placeholder="Confirm Account Number"
            />
          </Grid>
          <Stack flexDirection={"row"} gap={1} justifyContent={"end"} mt={2}>
            <LoadingButton
              size="medium"
              type="submit"
              variant="contained"
              loading={addBankLoading}
              disabled={!isValid}
            >
              Submit
            </LoadingButton>
            <LoadingButton
              loading={addBankLoading}
              size="medium"
              onClick={handleClose}
              variant="contained"
            >
              Close
            </LoadingButton>
          </Stack>
        </FormProvider>
      </MotionModal>
    </>
  );
}
