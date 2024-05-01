import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Divider,
  Grid,
  Modal,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { Api } from "src/webservices";
import WalletTop from "../../assets/dashboardIcon/Wallet.svg";
import Earned from "../../assets/dashboardIcon/Earned.svg";
import Incurred from "../../assets/dashboardIcon/Incurred.svg";
import CustomCard from "./CustomCard";
import AmountCustomCard from "./AmountCustomCard";
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
function TransactionDeatails() {
  const [value, setValue] = useState("daily");
  const [transaction, setTransactions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCommission, setTotalCommission] = useState({
    totalCommission: "",
  });
  const [totalCharge, setTotalCharge] = useState<any>({
    totalCharge: "",
  });
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    getTransactionList();
    getTotalCommission();
    getTotalCharge();
  }, [value]);

  const getTransactionList = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    Api(`user/dashboard/transactionVolume/${value}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setTransactions(Response?.data?.data);
            setIsLoading(false);
          }
          setIsLoading(false);
        }
      }
    );
  };

  const getTotalCommission = () => {
    let token = localStorage.getItem("token");
    Api(`user/dashboard/totalCommission/${value}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setTotalCommission({
              totalCommission: Response?.data?.totalCommission,
            });
          }
        }
      }
    );
  };
  const getTotalCharge = () => {
    let token = localStorage.getItem("token");
    Api(`user/dashboard/totalCharges/${value}`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setTotalCharge({
              totalCharge: Response?.data?.totalCharges,
            });
          }
        }
      }
    );
  };

  return (
    <>
      <Card
        sx={{
          width: "100%",
          background: "#F8FAFC",
        }}
      >
        <Box sx={{ p: 1, background: "#F6F6F6" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="disabled tabs example"
            >
              <Tab value="daily" label="Today" />
              <Tab value="weekly" label="Weekly" />
              <Tab value="monthly" label="Monthly" />
            </Tabs>
          </Stack>
        </Box>
        <Divider />
        {isLoading ? (
          <ApiDataLoading />
        ) : (
          <>
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "center",
                transform: "scale(1)",
              }}
              gap={6}
            >
              <Grid container spacing={3}>
                {transaction.map((item: any) => (
                  <Grid item xs={12} sm={6} md={4}>
                    <Stack>
                      <CustomCard
                        color="FFFFFF"
                        Status={item?.status}
                        amount={item?.count}
                        noOfTransaction={item?.totalAmount}
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "center",
                transform: "scale(1)",
              }}
              gap={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <AmountCustomCard
                    amountType="Wallet Top Up"
                    Amount="40,00,00,000"
                    icon={<img src={WalletTop} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <AmountCustomCard
                    amountType="Total Commission Earned"
                    Amount={totalCommission?.totalCommission}
                    icon={<img src={Earned} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <AmountCustomCard
                    amountType="Charges Incurred"
                    Amount={totalCharge?.totalCharges}
                    icon={<img src={Incurred} />}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Card>
    </>
  );
}

export default TransactionDeatails;
