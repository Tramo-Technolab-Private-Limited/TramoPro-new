import {
  Stack,
  Tab,
  Tabs,
  Card,
  Typography,
  Button,
  FormHelperText,
  Grid,
  Paper,
  styled,
  LinearProgress,
  MenuItem,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import PersonalLoanIcon from "src/assets/icons/loan/PersonalLoanIcon";
import BusinessLoanIcon from "src/assets/icons/loan/BusinessLoanIcon";
import HomeLoanIcon from "src/assets/icons/loan/HomeLoanIcon";
import GoldLoanIcon from "src/assets/icons/loan/GoldLoanIcon";
import { Api, UploadFile } from "src/webservices";
import { CategoryContext } from "src/pages/Services";
import Compressor from "compressorjs";

// form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFCodes,
  RHFSelect,
  RHFSlider,
  RHFTextField,
} from "../../../components/hook-form";
import { LoadingButton } from "@mui/lab";
import MotionModal from "src/components/animate/MotionModal";
import AWS from "aws-sdk";
import UploadIcon from "src/assets/icons/UploadIcon";
import { useSnackbar } from "notistack";
import Image from "src/components/image/Image";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import useResponsive from "src/hooks/useResponsive";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { fDateFormatForApi } from "src/utils/formatTime";
import { m, AnimatePresence } from "framer-motion";
import { MotionContainer, varSlide } from "src/components/animate";
import Iconify from "src/components/iconify/Iconify";
import { sentenceCase } from "change-case";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

type FormValuesProps = {
  mobileNumber: string;
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
  filePath: string;
  profileDetails: {
    name: string;
    dob: Date | null;
    panNo: string;
    dobDateType: string;
    address: string;
    gender: string;
    maritalStatus: string;
    pinCode: number | null;
  };
  secureFilePath: string;
  clientRefId: string;
  loanToken: string;
};

function Loan() {
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useResponsive("up", "sm");
  const categoryContext: any = useContext(CategoryContext);
  const [currentTab, setCurrentTab] = useState("");
  const [subCurrentTab, setSubCurrentTab] = useState("");
  const [productList, setProductList] = useState([]);
  const [productName, setProductName] = useState("");
  const [timer, setTimer] = useState(0);
  const [isOtpVerify, setIsOtpVerify] = useState(false);
  const [isPanVerify, setIsPanVerify] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  const [step, setStep] = useState(1);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetField("code1");
    resetField("code2");
    resetField("code3");
    resetField("code4");
    resetField("code5");
    resetField("code6");
  };

  const loanPageSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .max(10),
  });

  const defaultValues = {
    mobileNumber: "",
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
    code6: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(loanPageSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    resetField,
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    let time = setTimeout(() => {
      setTimer(timer - 1);
    }, 1000);
    if (timer == 0) {
      clearTimeout(time);
    }
  }, [timer]);

  useEffect(() => {
    categoryContext.sub_category.filter((row: any) => {
      if (row.sub_category_name == "Business Loan") {
        setCurrentTab(row._id);
        getProductFilter(categoryContext._id, row._id);
      }
    });
  }, []);

  const getProductFilter = (category: string, subcategory: string) => {
    let body = {
      category: category,
      subcategory: subcategory,
      productFor: "",
    };
    Api("product/product_Filter", "POST", body, "").then((Response: any) => {
      console.log("==========>>product Filter", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setProductList(Response.data.data);
          setSubCurrentTab(Response.data.data[0]._id);
          setProductName(Response.data.data[0].productName || "");
        }
      }
    });
  };

  // step 1
  const onSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        mobileNumber: "+91-" + data.mobileNumber,
      };
      await Api("app/loan/easy_loan_step1", "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              handleOpen();
              setTimer(60);
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
  // step 1 - resend otp
  const resendOtp = () => {
    let token = localStorage.getItem("token");
    let body = {
      mobileNumber: "+91-" + getValues("mobileNumber"),
    };
    Api("app/loan/easy_loan_step1", "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setTimer(60);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };
  // step 2
  const verifyOtp = () => {
    setIsVerifyLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      mobileNumber: "+91-" + getValues("mobileNumber"),
      otp:
        getValues("code1") +
        getValues("code2") +
        getValues("code3") +
        getValues("code4") +
        getValues("code5") +
        getValues("code6"),
      productId: subCurrentTab,
    };
    Api("app/loan/easy_loan_step2", "POST", body, token).then(
      (Response: any) => {
        console.log("==========>>product Filter", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            handleClose();
            setIsOtpVerify(true);
            setValue("clientRefId", Response.data.data.clientRefId);
            setValue("loanToken", Response.data.data.user_token);
            if (Response.data.data.userData.panVerified) {
              console.log(
                "==========>>Response.data.data.userData",
                Response.data.data.userData?.docs?.panNo
              );
              setValue(
                "profileDetails.panNo",
                Response.data.data.userData?.docs?.panNo
              );
              setValue("profileDetails.name", Response.data.data.userData.name);
              setValue(
                "profileDetails.address",
                Response.data.data.userData.address
              );
              setValue("profileDetails.dob", Response.data.data.userData.dob);
              setValue(
                "profileDetails.gender",
                Response.data.data.userData.gender
              );
              setValue(
                "profileDetails.maritalStatus",
                Response.data.data.userData.maritalStatus
              );
              setValue(
                "profileDetails.pinCode",
                Response.data.data.userData.pinCode
              );
            }
            setStep(2);
            setTimer(0);
          }
        }
        setIsVerifyLoading(false);
      }
    );
  };

  return (
    <div>
      <Stack style={{ width: "100%", borderRadius: "3px" }}>
        <Stack flexDirection={"row"}>
          {categoryContext.sub_category
            .filter((row: any) => row.sub_category_name == "Business Loan")
            .map((item: any) => {
              return (
                <Stack
                  height={100}
                  ml={2}
                  alignItems={"center"}
                  justifyContent={"center"}
                  onClick={() => {
                    setCurrentTab(item._id);
                    getProductFilter(categoryContext._id, item._id);
                    reset(defaultValues);
                    setStep(1);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  {item.sub_category_name == "Personal Loan" ? (
                    <PersonalLoanIcon active={currentTab == item._id} />
                  ) : item.sub_category_name == "Business Loan" ? (
                    <BusinessLoanIcon active={currentTab == item._id} />
                  ) : item.sub_category_name == "Home Loan" ? (
                    <HomeLoanIcon active={currentTab == item._id} />
                  ) : item.sub_category_name == "Gold Loan" ? (
                    <GoldLoanIcon active={currentTab == item._id} />
                  ) : null}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: currentTab == item._id ? "#C52031" : "#333333",
                    }}
                  >
                    {item.sub_category_name}
                  </Typography>
                </Stack>
              );
            })}
        </Stack>
        {productList.length > 0 && (
          <>
            <Stack flexDirection={"row"} justifyContent={"space-between"}>
              <Tabs
                value={subCurrentTab}
                onChange={(event: any, newValue: string) => {
                  setSubCurrentTab(newValue);
                  reset(defaultValues);
                  setStep(1);
                }}
                sx={{ mx: 2 }}
                aria-label="wrapped label tabs example"
              >
                {productList.map((item: any, index: number) => {
                  return (
                    <Tab
                      value={item._id}
                      label={item.productName}
                      onClick={() => setProductName(item.productName || "")}
                      sx={{ fontSize: 14 }}
                    />
                  );
                })}
              </Tabs>
            </Stack>
            <Scrollbar
              sx={
                isMobile
                  ? { maxHeight: window.innerHeight - 350 }
                  : { maxHeight: window.innerHeight - 280 }
              }
            >
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence>
                  {step == 1 && (
                    <Stack sx={{ p: 2 }} component={MotionContainer}>
                      <m.div variants={varSlide().inLeft}>
                        <Typography variant="h3">{productName}</Typography>
                        <Stack gap={2} width={{ xs: "95%", sm: 500 }}>
                          <RHFTextField
                            name="mobileNumber"
                            label="Customer Mobile Number"
                          />

                          {/* {Data.reqdFields.map((item: any) => {
                    return item.type == "enum" ? (
                      <RHFSelect name={item?.field} label={item?.displayName}>
                        {item?.value?.map((item1: any) => {
                          return <MenuItem value={item1}>{item1}</MenuItem>;
                        })}
                      </RHFSelect>
                    ) : (
                      <>
                        <RHFTextField
                          name={item?.field}
                          label={item?.displayName}
                          InputLabelProps={
                            item?.field
                              ? {
                                  shrink: true,
                                }
                              : {}
                          }
                          SelectProps={{
                            native: false,
                            sx: { textTransform: "capitalize" },
                          }}
                          onChange={(e) =>
                            setValue(item?.field, +e.target.value)
                          }
                        />
                        <RHFSlider
                          name={item?.field}
                          min={item?.lowerBound}
                          max={item?.upperBound}
                          step={item?.lowerBound}
                        />
                      </>
                    );
                  })} */}

                          <LoadingButton
                            variant="contained"
                            disabled={!isValid}
                            loading={isSubmitting}
                            type="submit"
                            sx={{ width: "fit-content" }}
                          >
                            Continue
                          </LoadingButton>
                        </Stack>
                      </m.div>
                    </Stack>
                  )}
                </AnimatePresence>
                {/* otp modal */}
                <MotionModal open={open} width={{ xs: "100%", sm: 570 }}>
                  <Stack gap={3}>
                    <Typography
                      variant="body2"
                      style={{ textAlign: "left", marginBottom: "0" }}
                    >
                      Mobile Verification Code &nbsp;
                    </Typography>
                    <Stack flexDirection="row" gap={1}>
                      <RHFCodes
                        keyName="code"
                        inputs={[
                          "code1",
                          "code2",
                          "code3",
                          "code4",
                          "code5",
                          "code6",
                        ]}
                      />
                      <Stack>
                        <Stack rowGap={0.5}>
                          <Button
                            variant="contained"
                            style={{
                              float: "right",
                              fontSize: "10px",
                              height: "25px",
                            }}
                            onClick={resendOtp}
                            size="small"
                            disabled={!!timer}
                          >
                            <Typography
                              sx={{ whiteSpace: "nowrap" }}
                              variant="caption"
                            >
                              {" "}
                              Resend code {timer !== 0 && `(${timer})`}{" "}
                            </Typography>
                          </Button>

                          <Button
                            variant="outlined"
                            style={{
                              float: "right",
                              fontSize: "10px",
                              height: "25px",
                            }}
                            onClick={() => {
                              resetField("code1");
                              resetField("code2");
                              resetField("code3");
                              resetField("code4");
                              resetField("code5");
                              resetField("code6");
                            }}
                            size="small"
                          >
                            Clear
                          </Button>
                        </Stack>
                      </Stack>
                      {(!!errors.code1 ||
                        !!errors.code2 ||
                        !!errors.code3 ||
                        !!errors.code4 ||
                        !!errors.code5 ||
                        !!errors.code6) && (
                        <FormHelperText error sx={{ px: 2 }}>
                          Code is required
                        </FormHelperText>
                      )}
                    </Stack>
                    <Stack flexDirection={"row"} gap={1}>
                      <LoadingButton
                        variant="outlined"
                        onClick={handleClose}
                        loading={isVerifyLoading}
                      >
                        Close
                      </LoadingButton>
                      <LoadingButton
                        variant="contained"
                        onClick={verifyOtp}
                        loading={isVerifyLoading}
                        disabled={
                          !getValues("code1") ||
                          !getValues("code2") ||
                          !getValues("code3") ||
                          !getValues("code4") ||
                          !getValues("code5") ||
                          !getValues("code6")
                        }
                      >
                        Verify
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </MotionModal>
              </FormProvider>

              <AnimatePresence>
                {step == 2 && (
                  <Stack sx={{ p: 2 }} component={MotionContainer}>
                    <m.div variants={varSlide().inLeft}>
                      <Stack gap={2} width={{ xs: "95%", sm: 500 }}>
                        <UploadPan
                          data={{
                            user_token: watch("loanToken"),
                            clientRefId: watch("clientRefId"),
                            userProfile: watch("profileDetails"),
                          }}
                          setStep={setStep}
                        />
                      </Stack>
                    </m.div>
                  </Stack>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {step == 3 && (
                  <Stack sx={{ p: 2 }} component={MotionContainer}>
                    <m.div variants={varSlide().inLeft}>
                      <Stack gap={2} width={{ xs: "95%", sm: 500 }}>
                        <DynamicForm
                          data={{
                            user_token: watch("loanToken"),
                            clientRefId: watch("clientRefId"),
                            loanSubCategory: subCurrentTab,
                          }}
                          setStep={setStep}
                        />
                      </Stack>
                    </m.div>
                  </Stack>
                )}
              </AnimatePresence>
            </Scrollbar>
          </>
        )}
      </Stack>
    </div>
  );
}

export default Loan;

const UploadPan = React.memo(({ data, setStep }: any) => {
  const { user_token, clientRefId } = data;
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isPanVerify, setIsPanVerify] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loanPageSchema = Yup.object().shape({
    profileDetails: Yup.object().shape({
      name: Yup.string().required("Name is required"),
      dob: Yup.date()
        .typeError("please enter a valid date")
        .required("Please select Date"),
      panNo: Yup.string().required("PAN Number is required"),
      address: Yup.string().required("Address is required"),
      gender: Yup.string().required("Field is required"),
      maritalStatus: Yup.string().required("Field is required"),
      pinCode: Yup.number()
        .typeError("Please enter a valid pin code")
        .test(
          "len",
          "Pin Code should be exactly 6 digits",
          (val) => (val?.toString().length ?? 0) == 6
        )
        .required("Pin code is required"),
    }),
  });

  const defaultValues = {
    filePath: "",
    profileDetails: {
      name: data?.userProfile?.name || "",
      dob: data?.userProfile?.dob || new Date(),
      panNo: data?.userProfile?.panNo || "",
      dobDateType: "",
      address: data?.userProfile?.address || "",
      gender: data?.userProfile?.gender || "",
      maritalStatus: data?.userProfile?.maritalStatus || "",
      pinCode: data?.userProfile?.pinCode || null,
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(loanPageSchema),
    defaultValues,
    mode: "all",
  });

  const {
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const handleFile = async (e: any) => {
    setErrorMsg("");
    setIsSubmitLoading(true);
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("panFront", e.target.files[0]);
    formData.append("user_token", data.user_token);
    await UploadFile(
      `app/loan/easy_loan_step3/${data.clientRefId}`,
      formData,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.data.success);
          setValue("filePath", Response.data.data.panURL);
          setValue(
            "profileDetails.panNo",
            Response.data.data.profileDetails.docs.panNo
          );
          setValue(
            "profileDetails.name",
            Response.data.data.profileDetails.name
          );
          setValue(
            "profileDetails.address",
            Response.data.data.profileDetails.address
          );
          setValue("profileDetails.dob", Response.data.data.profileDetails.dob);
          setValue(
            "profileDetails.gender",
            Response.data.data.profileDetails.gender
          );
          setValue(
            "profileDetails.maritalStatus",
            Response.data.data.profileDetails.maritalStatus
          );
          setValue(
            "profileDetails.pinCode",
            Response.data.data.profileDetails.pinCode
          );
        } else {
          enqueueSnackbar(Response.data.error.errorDescription, {
            variant: "error",
          });
          setErrorMsg(Response.data.error.errorDescription);
        }
        setIsSubmitLoading(false);
      } else {
        enqueueSnackbar("Failed", {
          variant: "error",
        });
      }
    });
  };

  // step 4
  const sendUpdatedUserPan = async (data: FormValuesProps) => {
    setErrorMsg("");
    try {
      let token = localStorage.getItem("token");
      let body = {
        name: data.profileDetails.name,
        address: data.profileDetails.address,
        dob: fDateFormatForApi(data.profileDetails.dob),
        gender: data.profileDetails.gender,
        maritalStatus: data.profileDetails.maritalStatus,
        pinCode: data.profileDetails.pinCode + "",
        user_token: user_token,
      };

      await Api(
        "app/loan/easy_loan_step4/" + clientRefId,
        "POST",
        body,
        token
      ).then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setStep(3);
            enqueueSnackbar(Response.data.message);
          }
          enqueueSnackbar(Response.data.message);
          Response.data.error.errorCode == "userDetailsAlreadyVerified" &&
            setStep(3);
          setErrorMsg(Response.data.error.errorDescription);
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(sendUpdatedUserPan)}>
      <IconButton onClick={() => setStep(1)}>
        <Iconify
          icon="ic:outline-arrow-back"
          color="#000000"
          height={20}
          width={20}
        />
      </IconButton>

      {errorMsg && (
        <Alert sx={{ mb: 1 }} severity="error">
          {errorMsg}
        </Alert>
      )}
      <Stack>
        {!watch("profileDetails.panNo") && (
          <>
            <Typography
              component="label"
              role={undefined}
              tabIndex={-1}
              sx={{
                border: `1px solid ${
                  errors?.filePath?.type == "required"
                    ? "red"
                    : "rgba(145, 158, 171, 0.32)"
                }`,
                borderRadius: 1,
                p: 1,
                px: 2,
                cursor: "pointer",
                "&:hover": {
                  border: "1px solid #000000",
                },
              }}
            >
              <Stack flexDirection={"row"} justifyContent={"space-between"}>
                <Typography
                  sx={{
                    color:
                      errors?.filePath?.type == "required"
                        ? "error.main"
                        : "#919EAB",
                  }}
                >
                  Upload PAN{" "}
                </Typography>
                <Stack flexDirection={"row"} gap={1}>
                  <UploadIcon
                    sx={{ alignSelf: "end" }}
                    color={
                      errors?.filePath?.type == "required" ? "red" : "default"
                    }
                  />
                </Stack>
              </Stack>

              <VisuallyHiddenInput
                type="file"
                accept="image/jpeg"
                onChange={handleFile}
              />
            </Typography>
            {errors?.filePath?.type == "required" && (
              <FormHelperText sx={{ ml: 2 }} error>
                {errors?.filePath?.message}
              </FormHelperText>
            )}
          </>
        )}
        {watch("profileDetails.panNo") && (
          <Stack gap={2}>
            {watch("filePath") && (
              <Image src={watch("filePath")} alt={"PAN Image"} />
            )}
            <RHFTextField
              name="profileDetails.panNo"
              label="PAN Number"
              disabled
            />
            <RHFTextField name="profileDetails.name" label="Name" />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="DOB"
                inputFormat="DD/MM/YYYY"
                value={dayjs(watch("profileDetails.dob"))}
                maxDate={new Date()}
                onChange={(newValue: any) =>
                  setValue("profileDetails.dob", newValue)
                }
                renderInput={(params: any) => (
                  <RHFTextField
                    name="profileDetails.dob"
                    type="date"
                    size="small"
                    autoComplete="off"
                    onPaste={(e: any) => {
                      e.preventDefault();
                      return false;
                    }}
                    {...params}
                  />
                )}
              />
            </LocalizationProvider>
            <RHFTextField name="profileDetails.address" label="Address" />
            <RHFSelect
              name="profileDetails.gender"
              label="Gender"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </RHFSelect>
            <RHFSelect
              name="profileDetails.maritalStatus"
              label="Marital Status"
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Widowed">Widowed</MenuItem>
            </RHFSelect>
            <RHFTextField
              name="profileDetails.pinCode"
              label="Pin Code"
              type="number"
            />
            <LoadingButton
              type="submit"
              variant="contained"
              disabled={!isValid}
              loading={isSubmitLoading}
              sx={{ width: "fit-content" }}
            >
              Continue
            </LoadingButton>
          </Stack>
        )}
      </Stack>
      {isSubmitLoading && <LinearProgress sx={{ mt: 1 }} color="primary" />}
    </FormProvider>
  );
});

const DynamicForm = ({ data, setStep }: any) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user_token, clientRefId, loanSubCategory } = data;
  const [formValues, setFormValues] = useState<any>({});
  const [formValuesProps, setFormValuesProps] = useState<any>({});
  const [formValuesValidation, setFormValuesValidation] = useState<any>({});
  const [defaultFormValues, setDefaultFormValues] = useState<any>({});

  type dynamicFormValuesProps = {
    loanCategory: string;
    loanSubCategory: string;
    loanApplicationDetails: any;
    clientRefId: string;
    user_token: string;
  };

  const FormSchema = Yup.object().shape({
    loanApplicationDetails: Yup.object().shape(formValuesValidation),
  });

  const defaultValues =
    defaultFormValues.length &&
    defaultFormValues?.reduce(
      (obj: any, field: any) => ({ ...obj, [field.name]: "" }),
      {}
    );
  const methods = useForm<dynamicFormValuesProps>({
    resolver: yupResolver(FormSchema),
    defaultValues,
    mode: "all",
  });

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    getDynamicForm();
  }, []);

  //getFormValues
  const getDynamicForm = () => {
    let token = localStorage.getItem("token");
    let body = {
      user_token: user_token,
    };
    Api("app/loan/easy_loan_step5/" + clientRefId, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setFormValues(Response.data.data);

            Response.data.data.reqdFields.map((item: any) => {
              setFormValuesValidation((prevState: any) => ({
                ...prevState,
                [item.field]: Yup.string().required("field is required"),
              }));
              setDefaultFormValues((prevState: any) => ({
                ...prevState,
                [item.field]: "",
              }));
            });

            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  const onSubmit = async (data: dynamicFormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        loanApplicationDetails: {
          ...data.loanApplicationDetails,
        },
      };
      Api("app/loan/easy_loan_step6/" + clientRefId, "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              enqueueSnackbar(Response.data.message);
              setStep(1);
            } else {
              enqueueSnackbar(Response.data.message);
            }
          }
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2}>
        {formValues?.reqdFields?.map((item: any) => {
          return item.type == "enum" ? (
            <RHFSelect
              name={`loanApplicationDetails.${item?.field}`}
              label={item?.displayName}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize" },
              }}
            >
              {item?.value?.map((item1: any) => {
                return <MenuItem value={item1}>{sentenceCase(item1)}</MenuItem>;
              })}
            </RHFSelect>
          ) : (
            <Stack gap={2}>
              <RHFTextField
                name={`loanApplicationDetails.${item?.field}`}
                label={item?.displayName}
                InputLabelProps={
                  item?.field
                    ? {
                        shrink: true,
                      }
                    : {}
                }
                SelectProps={{
                  native: false,
                  sx: { textTransform: "capitalize" },
                }}
                disabled
                // onChange={(e) => setValue(item?.field, e.target.value)}
              />
              <RHFSlider
                name={`loanApplicationDetails.${item?.field}`}
                min={item?.lowerBound}
                max={item?.upperBound}
                step={item?.lowerBound}
              />
            </Stack>
          );
        })}
      </Stack>
      <LoadingButton
        type="submit"
        // onClick={() =÷> console.log(formValuesValidation)}
        variant="contained"
        loading={isSubmitting}
        sx={{ width: "fit-content", mt: 2 }}
      >
        Continue
      </LoadingButton>
    </FormProvider>
  );
};
