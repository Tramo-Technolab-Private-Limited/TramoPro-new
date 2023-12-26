import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// @mui
import {
  Container,
  Card,
  Stack,
  Grid,
  InputAdornment,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Button,
  Link,
} from "@mui/material";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  Box,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  CardHeader,
  Typography,
  TableContainer,
} from "@mui/material";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";
import React from "react";
import { useSettingsContext } from "src/components/settings";
import Label from "src/components/label";
import { Api } from "src/webservices";
import MyNetworkTable from "./MyNetworkTable";
import { useAuthContext } from "src/auth/useAuthContext";
// ----------------------------------------------------------------------
type RowProps = {
  id: string;
  //name: string;
  firstName: string;
  email: string;
  avatar: string;
  commission: string;
  due: string;
  maxComm: number;
  commType: string;
  status: string;
};
interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function MyNetwrokFunds() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { themeStretch } = useSettingsContext();
  const [clardata, setclardata] = useState([]);
  const [appdata, setAppdata] = useState([]);
  const [rejdata, setRejdata] = useState([]);
  const [pendata, setPendata] = useState([]);
  const [clarlen, setclarlen] = useState("");
  const [applen, setApplen] = useState("");
  const [penlen, setPenlen] = useState("");
  const [rejlen, setRejlen] = useState("");
  const [pro, setPro] = useState("go");

  type FormValuesProps = {
    product: string;
    apiProvider: string;
    commType: string;
    commIn: string;
    search: string;
    afterSubmit?: string;
  };

  const FilterSchema = Yup.object().shape({
    product: Yup.string(),
    apiProvider: Yup.string(),
    commType: Yup.string(),
    commIn: Yup.string(),
  });

  const defaultValues = {
    product: "",
    apiProvider: "",
    commType: "",
    commIn: "",
    search: "",
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

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // if (register) {
      //   await register(data.email, data.password, data.firstName, data.lastName);
      // }
    } catch (error) {
      console.error(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };
  useEffect(() => {
    clarificationList();
    ApprovedList();
    RejectedList();
    PendingList();
  }, []);

  const PendingList = () => {
    let token = localStorage.getItem("token");
    let body = {
      userCode: user?.userCode,
    };
    Api(`agent/deposit_req_list/pending`, "POST", body, token).then(
      (Response: any) => {
        console.log("======getUser==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setPendata(Response.data.data);
            setPenlen(Response.data.data.length);
            console.log("======getUser===data.data udata====>", pendata);
          } else {
            console.log("======getUser=======>" + Response);
          }
        }
      }
    );
  };

  const clarificationList = () => {
    let token = localStorage.getItem("token");
    let body = {
      userCode: user?.userCode,
    };
    Api(`agent/deposit_req_list/clarification`, "POST", body, token).then(
      (Response: any) => {
        console.log("======getUser==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setclardata(Response.data.data);
            setclarlen(Response.data.data.length);
            console.log("======getUser===data.data udata====>", pendata);
          } else {
            console.log("======getUser=======>" + Response);
          }
        }
      }
    );
  };

  const ApprovedList = () => {
    let token = localStorage.getItem("token");
    let body = {
      userCode: user?.userCode,
    };
    Api(`agent/deposit_req_list/approved`, "POST", body, token).then(
      (Response: any) => {
        console.log("======getUser==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setAppdata(Response.data.data);
            setApplen(Response.data.data.length);
            console.log("======getUser===data.data udata====>", pendata);
          } else {
            console.log("======getUser=======>" + Response);
          }
        }
      }
    );
  };

  const RejectedList = () => {
    let token = localStorage.getItem("token");
    let body = {
      userCode: user?.userCode,
    };
    Api(`agent/deposit_req_list/rejected`, "POST", body, token).then(
      (Response: any) => {
        console.log("======getUser==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setRejdata(Response.data.data);
            setRejlen(Response.data.data.length);
            console.log("======getUser===data.data udata====>", pendata);
          } else {
            console.log("======getUser=======>" + Response);
          }
        }
      }
    );
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box style={{ padding: "24px 0" }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }
  const [valueTabs, setvalueTabs] = React.useState(0);
  const handleChangePanels = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setvalueTabs(newValue);
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            marginBottom: "20px",
            fontSize: "20px",
          }}
        >
          <Tabs
            value={valueTabs}
            onChange={handleChangePanels}
            aria-label="basic tabs example"
            sx={{ justifyItems: "center" }}
          >
            {/* <Tab style={{fontSize:'20px', color:'#212B36'}} label={ <h5 style={{color:'primary'}}> <Iconify icon={'eva:star-fill'} style={{marginRight:'5px'}} />All Leads<Label variant="soft"  color={('info')} style={{marginLeft:'5px'}}>5K</Label></h5>} {...a11yProps(0)} /> */}
            <Tab
              style={{ fontSize: "20px", color: "#00AB55" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:bell-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  New Leads
                  <Label
                    variant="soft"
                    color={"primary"}
                    style={{ marginLeft: "5px" }}
                  >
                    {penlen ? penlen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(1)}
            />
            <Tab
              style={{ fontSize: "20px", color: "#FFAB00" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:phone-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  In clarification
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginLeft: "5px" }}
                  >
                    {clarlen ? clarlen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(2)}
            />
            <Tab
              style={{ fontSize: "20px", color: "#00AB55" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:checkmark-circle-2-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  Approved
                  <Label
                    variant="soft"
                    color={"success"}
                    style={{ marginLeft: "5px" }}
                  >
                    {applen ? applen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(3)}
            />
            <Tab
              style={{ fontSize: "20px", color: "#FF3030" }}
              label={
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <Iconify
                    icon={"eva:close-circle-fill"}
                    style={{ marginRight: "5px" }}
                  />
                  Rejected
                  <Label
                    variant="soft"
                    color={"warning"}
                    style={{ marginLeft: "5px" }}
                  >
                    {rejlen ? rejlen : "0"}
                  </Label>
                </h5>
              }
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>
      </Box>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          style={{ padding: "0 25px", marginBottom: "20px" }}
        >
          <RHFTextField name="role" label="Roles" sx={{ width: "25%" }} />
          <RHFTextField
            name="search"
            sx={{ width: "75%" }}
            label="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <Iconify icon={"eva:search-outline"} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </FormProvider>

      <TabPanel value={valueTabs} index={0}>
        <Grid item xs={12} md={6} lg={8}>
          <MyNetworkTable
            gopro={valueTabs}
            // onClick={()=>steppage()}
            tableData={pendata}
            tableLabels={[
              { id: "depositor", label: "Depositor Detail" },
              { id: "Ref", label: "#Ref" },
              { id: "RequestType", label: "Request Type" },
              { id: "From", label: "From" },
              { id: "tobank", label: "To Bank Account" },
              { id: "depositormobile", label: "Transaction No./ UTR" },
              { id: "amount", label: "Amount" },
              { id: "deposit charges", label: "deposit charges" },
              { id: "attachment", label: "Receipt/ Screenshot" },
              { id: "action", label: "Action" },
            ]}
          />
        </Grid>
      </TabPanel>
      <TabPanel value={valueTabs} index={1}>
        <Grid item xs={12} md={6} lg={8}>
          <MyNetworkTable
            // onClick={()=>steppage()}
            gopro={valueTabs}
            tableData={clardata}
            tableLabels={[
              { id: "depositor", label: "Depositor Detail" },
              { id: "Ref", label: "#Ref" },
              { id: "RequestType", label: "Request Type" },
              { id: "From", label: "From" },
              { id: "tobank", label: "To Bank Account" },
              { id: "depositormobile", label: "Transaction No./ UTR" },
              { id: "amount", label: "Amount" },
              { id: "deposit charges", label: "deposit charges" },
              { id: "attachment", label: "Receipt/ Screenshot" },
              { id: "status", label: "Status" },
            ]}
          />
        </Grid>
      </TabPanel>
      <TabPanel value={valueTabs} index={2}>
        <Grid item xs={12} md={6} lg={8}>
          <MyNetworkTable
            // onClick={()=>steppage()}
            gopro={valueTabs}
            tableData={appdata}
            tableLabels={[
              { id: "depositor", label: "Depositor Detail" },
              { id: "Ref", label: "#Ref" },
              { id: "RequestType", label: "Request Type" },
              { id: "From", label: "From" },
              { id: "tobank", label: "To Bank Account" },
              { id: "depositormobile", label: "Transaction No./ UTR" },
              { id: "amount", label: "Amount" },
              { id: "deposit charges", label: "deposit charges" },
              { id: "attachment", label: "Receipt/ Screenshot" },
              { id: "status", label: "Status" },
            ]}
          />
        </Grid>
      </TabPanel>
      <TabPanel value={valueTabs} index={3}>
        <Grid item xs={12} md={6} lg={8}>
          <MyNetworkTable
            // onClick={()=>steppage()}
            gopro={valueTabs}
            tableData={rejdata}
            tableLabels={[
              { id: "depositor", label: "Depositor Detail" },
              { id: "Ref", label: "#Ref" },
              { id: "RequestType", label: "Request Type" },
              { id: "From", label: "From" },
              { id: "tobank", label: "To Bank Account" },
              { id: "depositormobile", label: "Transaction No./ UTR" },
              { id: "amount", label: "Amount" },
              { id: "deposit charges", label: "deposit charges" },
              { id: "attachment", label: "Receipt/ Screenshot" },
              { id: "status", label: "Status" },
            ]}
          />
        </Grid>
      </TabPanel>
    </>
  );
}
