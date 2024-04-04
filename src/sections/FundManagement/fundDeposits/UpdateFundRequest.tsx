import {
  Button,
  Card,
  FormHelperText,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
  styled,
} from "@mui/material";

//form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import { useContext, useEffect, useState } from "react";
import { BankAccountContext } from "../MyFundDeposite";
import { bankAccountProps, fundRequestProps, paymentModesProps } from "./types";
import { LoadingButton } from "@mui/lab";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UploadIcon from "src/assets/icons/UploadIcon";
import { convertToWords } from "src/components/customFunctions/ToWords";
import { useAuthContext } from "src/auth/useAuthContext";
import dayjs from "dayjs";
import { Api, UploadFile } from "src/webservices";
//image compressor
import Compressor from "compressorjs";
import { useSnackbar } from "notistack";
import { AwsDocSign } from "src/components/customFunctions/AwsDocSign";
import Image from "src/components/image/Image";
import AWS from "aws-sdk";
import React from "react";
import MotionModal from "src/components/animate/MotionModal";
import CloseIcon from "src/assets/icons/CloseIcon";
import { fIndianCurrency } from "src/utils/formatNumber";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

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

type FormValuesProps = {
  bank_details: {
    ifsc: string;
    account_number: string;
    bank_name: string;
    branch_name: string;
    address: string;
    min_Deposit_Amount: string;
    max_Deposit_Amount: string;
    _id: string;
  };
  modesDetail: {
    transactionFeeOption: {
      for_API_user: string;
      for_Agent: string;
      for_M_Distributor: string;
      for_Distributor: string;
    };
    transactionFeeValue: {
      for_API_user: string;
      for_Agent: string;
      for_M_Distributor: string;
      for_Distributor: string;
    };
    modeId: string;
    modeName: string;
    transactionFeeType: string;
    _id: string;
  };
  feeCalc: string;
  paymentModeId: string;
  amount: number;
  date: Date | string | null;
  branchName: string;
  mobileNumber: string;
  txnId: string;
  filePath: string;
  secureFilePath: string;
  remarks: string;
};

type props = {
  preData: fundRequestProps;
  handleClose: VoidFunction;
  getRaisedRequest: VoidFunction;
};

function UpdateFundRequest({ preData, handleClose, getRaisedRequest }: props) {
  const bankListContext = useContext(BankAccountContext);
  const { user } = useAuthContext();
  const [amountMinMaxValidation, setAmountMinMaxValidation] = useState({
    min: preData.bankId.min_Deposit_Amount || 0,
    max: preData.bankId.max_Deposit_Amount || 0,
  });
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [paymentModes, setPaymentModes] = useState<any>(
    preData.bankId.modes_of_transfer || []
  );

  //modal for preview image
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const fundRequestSchema = Yup.object().shape({
    bank_details: Yup.object().shape({
      bank_name: Yup.string().required("Please select Bank"),
    }),
    paymentModeId: Yup.string().required("Please select Mode"),
    amount: Yup.number()
      .typeError("That doesn't look like an Amount")
      .positive("An Amount can't start with a minus")
      .min(
        +amountMinMaxValidation.min,
        `Please enter minimum ${fIndianCurrency(amountMinMaxValidation.min)}`
      )
      .max(
        +amountMinMaxValidation.max,
        `You can enter maximum ${fIndianCurrency(amountMinMaxValidation.max)}`
      )
      .required("Amount is required"),
    date: Yup.date()
      .typeError("please enter a valid date")
      .required("Please select Date"),
    branchName: Yup.string().required("Branch Name is required"),
    mobileNumber: Yup.string()
      .required("Mobile number field is required")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .max(10),
    txnId: Yup.string()
      .when("modesDetail.modeName", {
        is: "RTGS",
        then: Yup.string().required("Transaction ID is required"),
      })
      .when("modesDetail.modeName", {
        is: "IMPS",
        then: Yup.string().required("Transaction ID is required"),
      })
      .when("modesDetail.modeName", {
        is: "NEFT",
        then: Yup.string().required("Transaction ID is required"),
      })
      .when("modesDetail.modeName", {
        is: "Fund Transfer",
        then: Yup.string().required("Transaction ID is required"),
      }),
    filePath: Yup.string()
      .when("modesDetail.modeName", {
        is: "Cash deposit at branch",
        then: Yup.string().required("Please Select Slip"),
      })
      .when("modesDetail.modeName", {
        is: "Cash deposit at CDM",
        then: Yup.string().required("Please Select Slip"),
      }),
    remarks: Yup.string().required("Remark Field is required"),
  });

  const defaultValues = {
    bank_details: {
      ifsc: preData.bankId.bank_details.ifsc,
      account_number: preData.bankId.bank_details.account_number,
      bank_name: preData.bankId.bank_details.bank_name,
      branch_name: preData.bankId.bank_details.branch_name,
      address: preData.bankId.bank_details.address,
      min_Deposit_Amount: preData.bankId.min_Deposit_Amount,
      max_Deposit_Amount: preData.bankId.max_Deposit_Amount,
      _id: preData.bankId._id,
    },
    feeCalc: "",
    modesDetail: preData.bankId.modes_of_transfer.filter(
      (item: any) => item.modeId == preData.modeId._id
    )[0],
    paymentModeId: (
      preData.bankId.modes_of_transfer.filter(
        (item: any) => item.modeId == preData.modeId._id
      )[0] as any
    ).modeId,
    transactionFeeType: "",
    amount: +preData.amount,
    date: preData.date_of_deposit,
    branchName: preData.transactional_details.branch,
    mobileNumber: preData.transactional_details.mobile,
    txnId: preData.transactional_details.trxId,
    filePath: preData.transactionSlip,
    secureFilePath: AwsDocSign(preData.transactionSlip),
    remarks: preData.remark,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(fundRequestSchema),
    defaultValues,
    mode: "all",
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
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
      Key: preData.transactionSlip?.split("/").splice(4, 4).join("/"),
      Expires: 600, // Expiration time in seconds
    };

    s3.getSignedUrl("getObject", params, (err: any, url: any) => {
      setValue("secureFilePath", url);
    });
  }, []);

  //upload file
  const handleFile = (e: any) => {
    if (e.target.files[0]?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setIsSubmitLoading(true);
    let token = localStorage.getItem("token");
    new Compressor(e.target.files[0], {
      quality: 0.2, // 0.6 can also be used, but its not recommended to go below.
      success: async (compressedResult) => {
        let formData = new FormData();
        formData.append("document", compressedResult);
        formData.append("directoryName", "others");
        await UploadFile(`upload/upload_agent_doc`, formData, token).then(
          (Response: any) => {
            if (Response.status == 200) {
              if (Response.data.status == "success") {
                enqueueSnackbar("successfully file uploaded");
                const s3 = new AWS.S3();
                const params = {
                  Bucket: process.env.REACT_APP_AWS_BUCKET_NAME,
                  Key: Response.data.filePath
                    ?.split("/")
                    .splice(4, 4)
                    .join("/"),
                  Expires: 600, // Expiration time in seconds
                };

                s3.getSignedUrl("getObject", params, (err: any, url: any) => {
                  setValue("secureFilePath", url);
                });
                setValue("filePath", Response.data.filePath);
              } else {
                enqueueSnackbar("Server didn`t response", {
                  variant: "error",
                });
              }
            } else {
              enqueueSnackbar("Failed", {
                variant: "error",
              });
            }
            setIsSubmitLoading(false);
          }
        );
      },
    });
  };

  const onSubmit = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");
    let body = {
      bankId: data.bank_details._id,
      modeId: data.paymentModeId,
      amount: data.amount,
      date_of_deposit: dayjs(data.date).format("DD/MM/YYYY"),
      transactional_details: {
        branch: data.branchName,
        trxId: data.txnId,
        mobile: data.mobileNumber,
      },
      remark: data.remarks,
      request_to: "ADMIN",
      transactionSlip: data.filePath,
    };

    Api(
      `agent/fundManagement/updateRaisedRequests/${preData._id}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          reset(defaultValues);
          getRaisedRequest();
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
        handleClose();
      }
    });
  };

  //calculate fee
  useEffect(() => {
    if (user?.role == "agent")
      calculateFee(
        getValues("modesDetail.transactionFeeType"),
        getValues("modesDetail.transactionFeeValue.for_Agent"),
        getValues("modesDetail.transactionFeeOption.for_Agent")
      );
    if (user?.role == "distributor")
      calculateFee(
        getValues("modesDetail.transactionFeeType"),
        getValues("modesDetail.transactionFeeValue.for_Distributor"),
        getValues("modesDetail.transactionFeeOption.for_Distributor")
      );
    if (user?.role == "m_distributor")
      calculateFee(
        getValues("modesDetail.transactionFeeType"),
        getValues("modesDetail.transactionFeeValue.for_M_Distributor"),
        getValues("modesDetail.transactionFeeOption.for_M_Distributor")
      );
  }, [watch("amount")]);

  const calculateFee = (type: any, value: any, option: any) => {
    let amount: any = getValues("amount");
    if (option == "flat") setValue("feeCalc", value);
    if (option == "percentage")
      setValue("feeCalc", String((Number(amount) * Number(value)) / 100));
  };

  return (
    <>
      <Typography variant="subtitle1">Update Fund Request</Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2} mt={2}>
          <RHFSelect
            name="bank_details.bank_name"
            label="Select Bank Account"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
          >
            {bankListContext.map((item: bankAccountProps) => {
              return (
                <MenuItem
                  value={item.bank_details.bank_name}
                  onClick={() => {
                    setValue("bank_details", {
                      ...item.bank_details,
                      _id: item._id,
                      min_Deposit_Amount: item.min_Deposit_Amount,
                      max_Deposit_Amount: item.max_Deposit_Amount,
                    });
                    setAmountMinMaxValidation({
                      min: +item.min_Deposit_Amount,
                      max: +item.max_Deposit_Amount,
                    });
                    setPaymentModes(item.modes_of_transfer);
                  }}
                >
                  {`${
                    item?.bank_details?.bank_name
                  } (Ending with ${item.bank_details.account_number.slice(
                    item.bank_details.account_number.length - 4
                  )})`}
                </MenuItem>
              );
            })}
          </RHFSelect>
          <RHFSelect
            name="paymentModeId"
            label="Select Payment Mode"
            SelectProps={{
              native: false,
              sx: { textTransform: "capitalize" },
            }}
          >
            {paymentModes.map((item: paymentModesProps) => {
              return (
                <MenuItem
                  value={item.modeId}
                  onClick={() => {
                    setValue("modesDetail", item);
                    setValue("amount", 0);
                  }}
                >
                  {item.modeName} (
                  {item.transactionFeeType +
                    " " +
                    (item.transactionFeeOption?.[
                      user?.role == "agent"
                        ? "for_Agent"
                        : user?.role == "distributor"
                        ? "for_Distributor"
                        : user?.role == "m_distributor"
                        ? "for_M_Distributor"
                        : "for_API_user"
                    ] == "flat"
                      ? "Rs."
                      : "") +
                    item.transactionFeeValue?.[
                      user?.role == "agent"
                        ? "for_Agent"
                        : user?.role == "distributor"
                        ? "for_Distributor"
                        : user?.role == "m_distributor"
                        ? "for_M_Distributor"
                        : "for_API_user"
                    ] +
                    (item.transactionFeeOption?.[
                      user?.role == "agent"
                        ? "for_Agent"
                        : user?.role == "distributor"
                        ? "for_Distributor"
                        : user?.role == "m_distributor"
                        ? "for_M_Distributor"
                        : "for_API_user"
                    ] == "flat"
                      ? ""
                      : "%")}
                  )
                </MenuItem>
              );
            })}
          </RHFSelect>
          <Stack>
            <RHFTextField name="amount" label="Amount" type="number" />
            {watch("bank_details.min_Deposit_Amount") &&
              watch("bank_details.max_Deposit_Amount") && (
                <>
                  <Typography variant="caption" ml={2}>
                    {convertToWords(+watch("amount") || 0)}
                  </Typography>
                  <Typography variant="caption" ml={2}>
                    Please enter amount between{" "}
                    <strong>
                      {" "}
                      Rs.{getValues("bank_details.min_Deposit_Amount")} - Rs.
                      {getValues("bank_details.max_Deposit_Amount")}{" "}
                    </strong>
                  </Typography>
                </>
              )}
            {watch("modesDetail.transactionFeeType") &&
              watch("amount") !== null && (
                <Typography
                  variant="caption"
                  ml={2}
                  sx={{
                    color:
                      watch("modesDetail.transactionFeeType") == "Charge"
                        ? "error.main"
                        : "success.main",
                  }}
                >
                  {watch("feeCalc")} Rs{" "}
                  {watch("modesDetail.transactionFeeType")} Applicable.
                </Typography>
              )}
          </Stack>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date"
              inputFormat="DD/MM/YYYY"
              value={dayjs(watch("date"))}
              maxDate={new Date()}
              minDate={dayjs(new Date()).subtract(4, "day") as any}
              onChange={(newValue: any) => setValue("date", newValue)}
              renderInput={(params: any) => (
                <RHFTextField
                  name="date"
                  type="date"
                  size="small"
                  disabled
                  onPaste={(e: any) => {
                    e.preventDefault();
                    return false;
                  }}
                  {...params}
                />
              )}
            />
          </LocalizationProvider>
          <RHFTextField
            name="mobileNumber"
            label="Enter Depositor Mobile Number"
            type="number"
          />
          <Stack flexDirection={"row"} gap={2}>
            <RHFTextField name="branchName" label="Deposit Branch" />
            <RHFTextField name="txnId" label="TrxID/UTR" />
          </Stack>

          {/* file upload */}
          <Stack>
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
                  Receipt Upload{" "}
                </Typography>
                <Stack flexDirection={"row"} gap={1}>
                  <UploadIcon
                    sx={{
                      alignSelf: "end",
                    }}
                    color={
                      errors?.filePath?.type == "required" ? "red" : "default"
                    }
                  />
                </Stack>
              </Stack>

              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleFile}
              />
            </Typography>
            {errors?.filePath?.type == "required" && (
              <FormHelperText sx={{ ml: 2 }} error>
                {errors?.filePath?.message}
              </FormHelperText>
            )}
          </Stack>

          {/* image preview */}
          {isSubmitLoading && <LinearProgress color="primary" />}
          {watch("secureFilePath") && !isSubmitLoading && (
            <Stack sx={{ height: 100, position: "relative" }}>
              <Image
                src={watch("secureFilePath")}
                alt={"slip"}
                sx={{ borderRadius: 1, cursor: "zoom-in" }}
                onClick={handleOpenModal}
              />
              <CloseIcon
                sx={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  height: 25,
                  width: 25,
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={() => {
                  setValue("filePath", "");
                  setValue("secureFilePath", "");
                }}
              />
            </Stack>
          )}

          <RHFTextField name="remarks" label="Remarks" />
          <Stack flexDirection={"row"} gap={1}>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isSubmitting}
            >
              Update
            </LoadingButton>
            <LoadingButton variant="contained" onClick={handleClose}>
              Cancel
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
      <MotionModal open={openModal} onClose={handleCloseModal}>
        <Image src={watch("secureFilePath")} alt={"slip"} />
        <Button
          onClick={handleCloseModal}
          variant="contained"
          sx={{ alignSelf: "end", mt: 1 }}
        >
          Close
        </Button>
      </MotionModal>
    </>
  );
}

export default React.memo(UpdateFundRequest);
