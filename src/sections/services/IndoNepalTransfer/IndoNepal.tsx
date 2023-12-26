import { Helmet } from "react-helmet-async";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import { paramCase } from "change-case";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import RechargeImg from "../../assets/Recharges/RechargeTopUp.png";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Scrollbar from "../../../components/scrollbar";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Upload } from "src/components/upload";
import { Icon } from "@iconify/react";

// import { Grid, Container, Box, Stack, Typography } from '@mui/material';

// @mui
import {
  Grid,
  TextField,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Radio,
  FormLabel,
  MenuItem,
  styled,
  Modal,
  Card,
  Box,
  Table,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  Stack,
  Typography,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  Link,
  CircularProgress,
  Hidden,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
// import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
  RHFSelect,
} from "../../../components/hook-form";
import { useSnackbar } from "notistack";
import IndoNepalTransfer from "./IndoNepalTransfer";
import IndoNepalRegistration from "./IndoNepalRegistration";

// ----------------------------------------------------------------------

type FormValuesProps = {
  remitterFirstName: string;
  remitterLastName: string;
  remitterMobileNumber: string;
  remitterAddress: string;
  remitterPincode: string;
  remitterDOB: string;
  remitterStateName: string;
  remitterStateCode: string;
  remitterOTP: string;
  BaccountNumber: string;
  BconfirmAccountNumber: string;
  Bifsc: string;
  beneName: string;
  BmobileNumber: string;
  BbankId: string;
  BgstState: string;
  BDOB: string;
  Baddress: string;
  Bpincode: string;
  fname: string;
  lname: string;
  payAmount: number;
  radiobuttonsgroup: string;
};

//--------------------------------------------------------------------

export default function IndoNepal(props: any) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [registered, setRegistered] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [success, setSuccess] = useState("upload");
  const [hide, sethide] = useState(false);
  const [senderDetail, setSenderDetail] = useState(false);

  const [ragistration, setRagistration] = useState(false);
  const [senderRagistration, setSenderRagistration] = useState(false);
  const [receiver, setReceiver] = useState(false);
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

  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const DMTSchema = Yup.object().shape({});

  const defaultValues = {};

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

  function checksender() {
    sethide(true);
    if (mobileNumber == "7505660766") {
      setSenderDetail(true);
    } else {
      setSenderDetail(false);
    }
  }

  function senderragistration() {
    setSenderRagistration(true);
  }

  const SenderRegistration = () => {};
  const uploadDoc = () => {};
  const addReceiver = () => {};

  return (
    <>
      <Helmet>
        <title>Indo-nepal Transfer </title>
      </Helmet>
      {/* <h1
        style={{
          fontSize: '40px',
          width: '95%',
          margin: '30px auto',
          fontWeight: 800,
          textTransform: 'uppercase',
        }}
      >
        Indo Nepal Transfer
      </h1> */}
      {registered ? <IndoNepalTransfer /> : <IndoNepalRegistration />}
    </>
  );
}

// ----------------------------------------------------------------------
