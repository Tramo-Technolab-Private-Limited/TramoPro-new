import { useEffect, useState, useCallback } from "react";
import {
  Stack,
  Grid,
  Pagination,
  TextField,
  FormLabel,
  Tabs,
  Tab,
  Select,
  InputLabel,
  MenuItem,
  Modal,
  Button,
  tableCellClasses,
  styled,
  TableHead,
  FormControl,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  CircularProgress,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@mui/lab";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Upload } from "src/components/upload";
import { useSnackbar } from "notistack";
import React from "react";

// import FormProvider, { RHFTextField, RHFSelect } from '../../../components/hook-form';
import FormProvider, {
  RHFTextField,
  RHFSelect,
} from "../../components/hook-form";
import dayjs, { Dayjs } from "dayjs";
import { useAuthContext } from "src/auth/useAuthContext";
type FormValuesProps = {
  branch: string;
  trxID: string;
  amount: string;
  bank_name: string;
  modeName: string;
  mobile: string;
  trxId: string;
  date_of_deposit: Dayjs;
  transactionSlip: string;
};

function EditRequest(props: any) {
  const { Api, UploadFileApi } = useAuthContext();
  const [uploadFile, setUploadFile] = useState<any>();
  const [success, setSuccess] = useState("upload");
  const { enqueueSnackbar } = useSnackbar();
  const [openRequestEdit, setOpenRequestEdit] = React.useState(true);
  const handleCloseEdit = () => setOpenRequestEdit(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedBankID, setSelectedBankID] = useState<any>([]);

  const [selectedMode, setSelectedMode] = useState<any>([]);
  const [selectedModes, setSelectedModes] = useState<any>([]);

  const [selectedModeId, setSelectedModeId] = useState(null);

  const FilterSchema = Yup.object().shape({});
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

  const handleChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 400,
    bgcolor: "#ffffff",
    boxShadow: 24,
    p: 4,
  };

  const dateObj = new Date(props.date_of_deposit);
  const day = dateObj.getUTCDate();
  const month = dateObj.getUTCMonth() + 1; // Month is 0-based, so add 1
  const year = dateObj.getUTCFullYear();
  const formattedDay = day.toString().padStart(2, "0");
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDateGet = `${formattedDay}/${formattedMonth}/${year}`;

  const defaultValues = {
    amount: props.amount,
    modeName: props.deposit_type,
    bank_name: props.bankId?.bank_details?.bank_name,
    trxID: props.deposit_type,
    mobile: props?.transactional_details?.mobile,
    branch: props?.transactional_details?.branch,
    trxId: props?.transactional_details?.trxId,
    date_of_deposit: formattedDateGet,
    transactionSlip: props.transactionSlip,
  };

  const handleSelectModes = (event: any) => {
    setSelectedModes(event.target.value);
    setSelectedModeId(event.target.value.modeId);
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FilterSchema),
    defaultValues,
  });
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
    dayjs(props.date_of_deposit)
  );

  const formattedDate = selectedDate ? selectedDate.format("DD/MM/YYYY") : "";

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const handleSelectChange = (event: any) => {
    setSelectedItem(event.target.value);
    setSelectedBankID(event.target.value._id);
    let token = localStorage.getItem("token");
    Api(
      `agent/fundManagement/getAdminBank/` + event.target.value._id,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log(
        "================>Modes List  Response==============>",
        Response.data.data.modes_of_transfer
      );

      if (Response.status == 200) {
        if (Response.data.code == 200) {
          const ModesNames = Response.data.data.modes_of_transfer;
          setSelectedMode(ModesNames);
        } else {
          console.log("======BankList=======>" + Response);
        }
      }
    });
  };

  const onSubmit = async (data: FormValuesProps) => {
    let token = localStorage.getItem("token");

    let body = {
      bankId: selectedBankID,
      modeId: selectedModeId,
      request_to: "ADMIN",
      transactional_details: {
        branch: data.branch,
        trxId: data.trxId,
        mobile: data.mobile,
      },
      date_of_deposit: formattedDate,
      amount: data.amount,
      transactionSlip: data.transactionSlip ? data.transactionSlip : docUrl,
    };

    Api(
      `agent/fundManagement/updateRaisedRequests/` + props._id,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("===========>Update request =========>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
        } else {
          console.log("======BankList=======>" + Response);
        }
      }
    });
  };

  const [docUrl, setDocUrl] = useState("");
  const uploadDoc = () => {
    if (uploadFile?.size > Math.pow(1024, 5))
      return enqueueSnackbar("File size should be less than 5MB", {
        variant: "error",
      });
    setSuccess("wait");
    let doc = uploadFile;
    let token = localStorage.getItem("token");
    let formData = new FormData();
    formData.append("document", doc);
    formData.append("directoryName", "others");
    UploadFileApi(`upload/upload_agent_doc`, formData, token).then(
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
      <Modal
        open={openRequestEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} style={{ borderRadius: "20px", height: "100vh" }}>
          <Grid rowGap={3} columnGap={2} display="grid">
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <FormLabel id="demo-row-radio-buttons-group-label">
                {" "}
                Fund Request Update
              </FormLabel>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                {/* <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-label">
                    {props?.bankId?.bank_details?.bank_name}
                  </InputLabel>
                  <Select
                    labelId="data-select-label"
                    id="data-select"
                    value={selectedItem}
                    onChange={handleSelectChange}
                    sx={{ width: 250 }}
                    label={props?.bankId?.bank_details?.bank_name}
                    size="small"
                    defaultValue={props?.bankId?.bank_details?.bank_name}
                  >
                    <MenuItem value=""></MenuItem>
                    {props.banklist.map((item: any) => (
                      <MenuItem key={item._id} value={item}>
                        {item.bank_details.bank_name}{' '}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                {/* <RHFSelect name="bank_name" label="select Bank">
                  {props.banklist.map((item: any) => (
                    <option key={item._id} value={item.bank_details.bank_name}>
                      {item.bank_details.bank_name}
                    </option>
                  ))}
                </RHFSelect> */}
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-label">
                    {props?.deposit_type}
                  </InputLabel>
                  <Select
                    value={selectedModes}
                    onChange={handleSelectModes}
                    label="Select Mode"
                    size="small"
                    sx={{ width: 250 }}
                    defaultValue={props?.deposit_type}
                  >
                    <MenuItem value=""></MenuItem>
                    {selectedMode.map((item: any) => (
                      <MenuItem key={item._id} value={item}>
                        {item.modeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* <RHFSelect name="modeName" label="select Mode" onChange={handleSelectModes}>
                  {selectedMode.map((item: any) => (
                    <MenuItem key={item._id} value={item.modeName}>
                      {item.modeName}
                    </MenuItem>
                  ))}
                </RHFSelect> */}
              </Typography>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <RHFTextField
                  name="amount"
                  label="Amount"
                  defaultValue={props?.amount}
                  sx={{ width: 250 }}
                />
                <RHFTextField
                  name="mobile"
                  label="Mobile"
                  defaultValue={props?.transactional_details?.mobile}
                  sx={{ width: 250 }}
                />
              </Typography>
              <Typography
                variant="h3"
                my={1}
                sx={{ display: "flex", gap: "20px" }}
              >
                <RHFTextField
                  name="branch"
                  label="Branch"
                  defaultValue={props?.transactional_details?.branch}
                  sx={{ width: 250 }}
                />
                <RHFTextField
                  name="trxId"
                  label="TRXID"
                  value={props?.transactional_details?.trxId}
                  sx={{ width: 250 }}
                />
              </Typography>

              <Stack>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    label="Date "
                    inputFormat="DD/MM/YYYY"
                    value={selectedDate}
                    // defaultValue={selectedDate}
                    onChange={handleChange}
                    renderInput={(params: any) => (
                      <TextField {...params} sx={{ my: 1, width: 250 }} />
                    )}
                  />
                </LocalizationProvider>
              </Stack>
              <Stack sx={{ width: 250, height: 20 }}>
                {<Stack>Upload Receipt</Stack>}
                <Upload
                  sx={{
                    display: "flex",
                    marginLeft: "21vw",
                    marginTop: "-5vw",
                  }}
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
                      sx={{ display: "flex", marginLeft: "21vw" }}
                      variant="contained"
                      component="span"
                      style={{ width: "fit-content" }}
                      onClick={() => uploadDoc()}
                    >
                      Upload File
                    </LoadingButton>
                  ) : (
                    ""
                  )}
                </Stack>
              </Stack>
              <Stack sx={{ display: "inline-block", alignItems: "end" }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Update
                </LoadingButton>
              </Stack>
            </FormProvider>
          </Grid>
        </Box>
      </Modal>
    </>
  );
}

export default EditRequest;
