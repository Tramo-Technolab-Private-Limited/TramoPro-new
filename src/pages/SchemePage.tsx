import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// @mui
import {
  TextField,
  Stack,
  Grid,
  Tabs,
  Tab,
  MenuItem,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";

import { Box, CardProps } from "@mui/material";
import { Helmet } from "react-helmet-async";

import ViewAepsTable from "../sections/ViewScheme/ViewAepsTable";
import ViewMoneyTransferTable from "../sections/ViewScheme/ViewMoneyTransferTable";
import ViewRechargeTable from "../sections/ViewScheme/ViewRechargeTable";
import ViewAadharPayTable from "../sections/ViewScheme/ViewAadharPayTable";
import ViewDmt1Table from "../sections/ViewScheme/ViewDmt1Table";
import ViewDmt2Table from "../sections/ViewScheme/ViewDmt2Table";
import ViewBBPSTable from "../sections/ViewScheme/ViewBBPSTable";
import LoadingScreen from "src/components/loading-screen/LoadingScreen";
import ViewMatmTable from "../sections/ViewScheme/ViewMatmTable";
import { useSnackbar } from "notistack";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
// ----------------------------------------------------------------------

export default function ViewAllScheme() {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [com, setCom] = useState([]);
  const [categoryList, setCategoryList] = useState<any>([]);
  const [distributor, setDistributor] = useState([]);
  const [superCurrentTab, setSuperCurrentTab] = useState("");
  const [mdSchemeId, setMDschemeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role == "m_distributor") {
      getDistributors();
    }
    getCategoryList();
  }, []);

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      console.log("======getcategory_list====>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setCategoryList(
            Response.data.data.filter(
              (item: any) =>
                item.category_name.toLowerCase() !== "bill payment" &&
                item.category_name.toLowerCase() !== "loan"
            )
          );
          setSuperCurrentTab(
            user?.role != "m_distributor" && Response.data.data[0].category_name
          );
          if (user?.role != "m_distributor")
            getSchemeDetail(Response.data.data[0]._id, user?.schemeId);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const getSchemeDetail = async (tab: string, schemeid: string) => {
    setLoading(true);
    setCom([]);
    let token = localStorage.getItem("token");
    Api(`scheme/getShemeDetail/${schemeid}/${tab}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            if (Response.data.data.succ == null) {
              setLoading(false);
            } else {
              setCom(Response?.data?.data?.succ?.commissionSetting);
            }
          } else {
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
          setLoading(false);
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          setLoading(false);
        }
      }
    );
  };

  const getDistributors = () => {
    let token = localStorage.getItem("token");
    Api(`agent/distributorDropDown`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setDistributor(Response.data.data);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
      }
    });
  };

  return (
    <>
      <Helmet>
        <title> My Schemes | {process.env.REACT_APP_COMPANY_NAME} </title>
      </Helmet>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 1,
            fontSize: "20px",
          }}
        >
          <Tabs
            value={superCurrentTab}
            aria-label="basic tabs example"
            sx={{ background: "#F4F6F8", padding: "0 10px", height: "48px" }}
            onChange={(event, newValue) => setSuperCurrentTab(newValue)}
          >
            {categoryList.map((tab: any) => (
              <Tab
                style={{ fontSize: "16px" }}
                key={tab._id}
                disabled={
                  user?.role == "m_distributor" && !mdSchemeId ? true : false
                }
                sx={{ mx: 2 }}
                label={
                  <h5 style={{ marginBlockStart: "16px" }}>
                    {tab.category_name}
                  </h5>
                }
                value={tab.category_name}
                onClick={() =>
                  getSchemeDetail(
                    tab._id,
                    user?.role == "m_distributor" ? mdSchemeId : user?.schemeId
                  )
                }
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      {user?.role == "m_distributor" && (
        <Stack sx={{ m: 1 }} maxWidth={200}>
          <TextField
            id="outlined-select-currency-native"
            select
            error={!mdSchemeId}
            label="Distributor"
            SelectProps={{ native: false }}
            helperText={!mdSchemeId && "Please Select Distributor"}
          >
            {distributor.map((item: any) => {
              return (
                <MenuItem
                  key={item._id}
                  value={item.schemeId}
                  onClick={() => {
                    setMDschemeId(item.schemeId);
                    setSuperCurrentTab(categoryList[0].category_name);
                    getSchemeDetail(categoryList[0]._id, item.schemeId);
                  }}
                >
                  {item.firstName + " " + item.lastName}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>
      )}
      {user?.role == "m_distributor" && !mdSchemeId ? null : (
        <Scrollbar sx={{ maxHeight: window.innerHeight - 220 }}>
          <Stack>
            {loading ? (
              <ApiDataLoading />
            ) : (
              <Grid item xs={12} md={6} lg={8}>
                {superCurrentTab.toLowerCase() == "aeps" ? (
                  <ViewAepsTable comData={com} />
                ) : superCurrentTab.toLowerCase() == "recharges" ? (
                  <ViewRechargeTable comData={com} />
                ) : superCurrentTab.toLowerCase() == "money transfer" ? (
                  <ViewMoneyTransferTable comData={com} />
                ) : superCurrentTab.toLowerCase() == "aadhaar pay" ? (
                  <ViewAadharPayTable comData={com} />
                ) : superCurrentTab.toLowerCase() == "dmt1" ? (
                  <ViewDmt1Table comData={com} />
                ) : superCurrentTab.toLowerCase() == "dmt2" ? (
                  <ViewDmt2Table comData={com} />
                ) : superCurrentTab.toLowerCase() == "matm" ? (
                  <ViewMatmTable comData={com} />
                ) : null}
              </Grid>
            )}
          </Stack>
        </Scrollbar>
      )}
    </>
  );
}
