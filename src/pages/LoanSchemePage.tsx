import { useEffect, useState } from "react";
import { Api } from "src/webservices";
import {
  Card,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  TableHead,
  Typography,
  FormControl,
  TextField,
  MenuItem,
} from "@mui/material";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import PersonalLoanIcon from "src/assets/icons/loan/PersonalLoanIcon";
import BusinessLoanIcon from "src/assets/icons/loan/BusinessLoanIcon";
import HomeLoanIcon from "src/assets/icons/loan/HomeLoanIcon";
import GoldLoanIcon from "src/assets/icons/loan/GoldLoanIcon";
import { useAuthContext } from "src/auth/useAuthContext";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import useResponsive from "src/hooks/useResponsive";
// ----------------------------------------------------------------------

export default function LoanSchemePage() {
  const { user } = useAuthContext();
  const isMobile = useResponsive("up", "sm");
  const [tableData, setTableData] = useState({
    _id: "",
    categoryId: "",
    schemeDescription: "",
    schemeId: "",
    subSchemes: [],
  });
  const [category, setCategory] = useState({
    _id: "",
    category_name: "",
    sub_category: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [schemeId, setSchemeId] = useState("");
  const [currentTab, setCurrentTab] = useState("");
  const [subCurrentTab, setSubCurrentTab] = useState("");
  const [distributor, setDistributor] = useState([]);

  useEffect(() => {
    setFilteredData(
      tableData.subSchemes.filter(
        (item: any) => item.productId == subCurrentTab
      )
    );
  }, [subCurrentTab]);

  useEffect(() => {
    getLoanSchemeList();
    getDistributors();
  }, []);

  const getLoanSchemeList = async () => {
    let token = localStorage.getItem("token");
    Api("app/loan/user_scheme", "GET", "", token).then((Response: any) => {
      if (Response?.status == 200) {
        if (Response.data.code == 200) {
          setTableData(Response.data.data);
          getCategoryList();
        }
      }
    });
  };

  const getDistLoanSchemeList = async (val: string) => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api("app/loan/user_scheme_by_user_id/" + val, "GET", "", token).then(
      (Response: any) => {
        if (Response?.status == 200) {
          if (Response.data.code == 200) {
            setTableData(Response.data.data);
            getCategoryList();
          }
        }
        setIsLoading(false);
      }
    );
  };

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      console.log("======getcategory_list====>", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          const sortedData = Response?.data?.data.filter((item: any) => {
            if (item?.category_name.toLowerCase() === "loan") {
              return item;
            }
          })[0];
          setCategory(sortedData);
          setCurrentTab(sortedData.sub_category[0]._id);
          getProductFilter(sortedData._id, sortedData.sub_category[0]._id);
        }
      }
    });
  };

  const getProductFilter = (categoryId: string, subcategoryId: string) => {
    let token = localStorage.getItem("token");
    let body = {
      category: categoryId,
      subcategory: subcategoryId,
      productFor: "",
    };
    Api("product/product_Filter", "POST", body, token).then((Response: any) => {
      console.log("==========>>product Filter", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setProductList(Response.data.data);
          setSubCurrentTab(Response.data.data[0]._id);
          setFilteredData(
            tableData.subSchemes.filter(
              (item: any) => item.productId == Response.data.data[0]._id
            )
          );
        }
      }
    });
  };
  const getDistributors = () => {
    let token = localStorage.getItem("token");
    Api(`agent/distributorDropDown`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setDistributor(Response.data.data);
        }
      }
    });
  };

  return (
    <>
      {isLoading ? (
        <ApiDataLoading />
      ) : (
        <>
          {user?.role === "m_distributor" && (
            <>
              <FormControl sx={{ mt: 1, minWidth: 200 }}>
                <TextField
                  id="outlined-select-currency-native"
                  select
                  size="small"
                  label="Distributor"
                  SelectProps={{ native: false }}
                  onChange={(e) => getDistLoanSchemeList(e.target.value)}
                >
                  {distributor.map((item: any) => {
                    return (
                      <MenuItem key={item._id} value={item._id}>
                        {item.firstName + " " + item.lastName}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </FormControl>
            </>
          )}
          <Scrollbar
            sx={
              isMobile
                ? { maxHeight: window.innerHeight - 200 }
                : { maxHeight: window.innerHeight - 130 }
            }
          >
            <Card sx={{ borderRadius: 0.5, p: 0.5 }}>
              <Stack flexDirection={"row"}>
                {category.sub_category.map((item: any) => {
                  return (
                    <Stack
                      height={100}
                      mr={2}
                      alignItems={"center"}
                      justifyContent={"center"}
                      onClick={() => {
                        setFilteredData([]);
                        setCurrentTab(item._id);
                        getProductFilter(category._id, item._id);
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
            </Card>
            {productList.length > 0 && (
              <Card sx={{ borderRadius: 0.5, p: 0.5, mt: 1 }}>
                <Stack flexDirection={"row"} justifyContent={"space-between"}>
                  <Tabs
                    value={subCurrentTab}
                    onChange={(event: any, newValue: string) => {
                      setSubCurrentTab(newValue);
                    }}
                    aria-label="wrapped label tabs example"
                  >
                    {productList.map((item: any) => {
                      return (
                        <Tab
                          value={item._id}
                          label={item.productName}
                          sx={{ fontSize: 14 }}
                        />
                      );
                    })}
                  </Tabs>
                </Stack>
              </Card>
            )}
            {filteredData.length ? (
              <Stack>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1">Onlead Generation</Typography>
                  <Card sx={{ mt: 2 }}>
                    <TableContainer sx={{ overflow: "unset" }}>
                      <Scrollbar sx={{ pb: 2 }}>
                        <Table sx={{ minWidth: 720 }} size="small">
                          <TableHead>
                            <TableRow>
                              {[
                                {
                                  id: "Agent charge/commission type",
                                  label: "Agent charge/commission type",
                                },
                                {
                                  id: "Agent charge/ commission Value",
                                  label: "Agent charge/ commission Value",
                                },
                                (user?.role == "distributor" ||
                                  user?.role == "m_distributor") && {
                                  id: "Distributor commission value",
                                  label: "Distributor commission value",
                                },
                                user?.role == "m_distributor" && {
                                  id: "Master Distributor commission Value",
                                  label: "Master Distributor commission Value",
                                },
                              ].map((item: any) => {
                                return (
                                  <TableCell>
                                    <Typography variant="subtitle2">
                                      {item.label}
                                    </Typography>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            <TableCell>
                              {
                                filteredData[0]
                                  .commissionSettingsForLeadGeneration.agent
                                  .transactionType
                              }
                            </TableCell>
                            <TableCell>
                              {
                                filteredData[0]
                                  .commissionSettingsForLeadGeneration.agent
                                  .rateType
                              }
                            </TableCell>
                            {(user?.role == "distributor" ||
                              user?.role == "m_distributor") && (
                              <TableCell>
                                {
                                  filteredData[0]
                                    .commissionSettingsForLeadGeneration
                                    .distributor.rate
                                }
                              </TableCell>
                            )}
                            {user?.role == "m_distributor" && (
                              <TableCell>
                                {
                                  filteredData[0]
                                    .commissionSettingsForLeadGeneration
                                    .masterDistributor.rate
                                }
                              </TableCell>
                            )}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Card>
                  <Card sx={{ mt: 4, width: 720 }}>
                    <TableContainer sx={{ overflow: "unset" }}>
                      <Scrollbar>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Settlement Type</TableCell>
                              {filteredData[0]
                                .settlementSettingForLeadGeneration.type ==
                                "Scheduled" && (
                                <>
                                  <TableCell>Settlement Month</TableCell>
                                  {filteredData[0]
                                    .settlementSettingForLeadGeneration
                                    .scheduledFor == "Next Month" && (
                                    <TableCell>Settlement Date</TableCell>
                                  )}
                                </>
                              )}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            <TableRow sx={{ verticalAlign: "baseline" }}>
                              <TableCell>
                                {filteredData[0]
                                  .settlementSettingForLeadGeneration.type ||
                                  "-"}
                              </TableCell>
                              {filteredData[0]
                                .settlementSettingForLeadGeneration.type ==
                                "Scheduled" && (
                                <>
                                  <TableCell>
                                    {filteredData[0]
                                      .settlementSettingForLeadGeneration
                                      .scheduledFor || "-"}
                                  </TableCell>

                                  {filteredData[0]
                                    .settlementSettingForLeadGeneration
                                    .scheduledFor == "Next Month" && (
                                    <TableCell>
                                      {filteredData[0]
                                        .settlementSettingForLeadGeneration
                                        .dayOfMonth || "-"}
                                    </TableCell>
                                  )}
                                </>
                              )}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Card>
                </Card>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1">On Disbursal</Typography>
                  <Card sx={{ mt: 2 }}>
                    {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

                    <TableContainer sx={{ overflow: "unset" }}>
                      <Scrollbar sx={{ pb: 2 }}>
                        <Table sx={{ minWidth: 720 }} size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Min Rs.</TableCell>
                              <TableCell>Max Rs.</TableCell>
                              <TableCell>Agent Charge/ Commission</TableCell>
                              <TableCell>Type(Agent)</TableCell>
                              <TableCell>Value(Agent)</TableCell>
                              {(user?.role == "distributor" ||
                                user?.role == "m_distributor") && (
                                <>
                                  <TableCell>
                                    Commission Type(Distributor)
                                  </TableCell>
                                  <TableCell>
                                    Commission value(Distributor)
                                  </TableCell>
                                </>
                              )}
                              {user?.role == "m_distributor" && (
                                <>
                                  <TableCell>
                                    Commission Type(Master Distributor)
                                  </TableCell>
                                  <TableCell>
                                    Commission value(Master Distributor)
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {filteredData[0].commissionSettingsPostDisbursal.map(
                              (item: any, index: number) => {
                                return (
                                  <TableRow
                                    key={index}
                                    sx={{ verticalAlign: "baseline" }}
                                  >
                                    <TableCell>{item.slabLowerLimit}</TableCell>
                                    <TableCell>{item.slabUpperLimit}</TableCell>
                                    <TableCell>
                                      {item.agent.transactionType || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {item.agent.rateType || "-"}
                                    </TableCell>
                                    <TableCell>
                                      {item.agent.rate || "-"}
                                    </TableCell>
                                    {(user?.role == "distributor" ||
                                      user?.role == "m_distributor") && (
                                      <>
                                        <TableCell>
                                          {item.distributor.transactionType ||
                                            "-"}
                                        </TableCell>
                                        <TableCell>
                                          {item.distributor.rate || "-"}
                                        </TableCell>
                                      </>
                                    )}
                                    {user?.role == "m_distributor" && (
                                      <>
                                        <TableCell>
                                          {item.masterDistributor
                                            .transactionType || "-"}
                                        </TableCell>
                                        <TableCell>
                                          {item.masterDistributor.rate || "-"}
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                );
                              }
                            )}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Card>

                  <Card sx={{ mt: 4, width: 720 }}>
                    <TableContainer sx={{ overflow: "unset" }}>
                      <Scrollbar>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Settlement Type</TableCell>
                              {filteredData[0].settlementSettingForDisbursal
                                .type == "Scheduled" && (
                                <>
                                  <TableCell>Settlement Month</TableCell>
                                  {filteredData[0].settlementSettingForDisbursal
                                    .scheduledFor == "Next Month" && (
                                    <TableCell>Settlement Date</TableCell>
                                  )}
                                </>
                              )}
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            <TableRow sx={{ verticalAlign: "baseline" }}>
                              <TableCell>
                                {filteredData[0].settlementSettingForDisbursal
                                  .type || "-"}
                              </TableCell>
                              {filteredData[0].settlementSettingForDisbursal
                                .type == "Scheduled" && (
                                <>
                                  <TableCell>
                                    {filteredData[0]
                                      .settlementSettingForDisbursal
                                      .scheduledFor || "-"}
                                  </TableCell>

                                  {filteredData[0].settlementSettingForDisbursal
                                    .scheduledFor == "Next Month" && (
                                    <TableCell>
                                      {filteredData[0]
                                        .settlementSettingForDisbursal
                                        .dayOfMonth || "-"}
                                    </TableCell>
                                  )}
                                </>
                              )}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Card>
                </Card>
              </Stack>
            ) : (
              <Stack flexDirection={"row"} justifyContent={"center"}>
                {filteredData.length && user?.role == "m_distributor" ? (
                  <Typography variant="subtitle1">
                    Scheme Not created
                  </Typography>
                ) : (
                  <Typography variant="subtitle1">
                    Please Select Distributor
                  </Typography>
                )}
              </Stack>
            )}
          </Scrollbar>
        </>
      )}
    </>
  );
}
