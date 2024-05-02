import { Grid } from "@mui/material";
import { createContext, useEffect, useState } from "react";
import {
  CompanyBankAccounts,
  FundDepositeTable,
  InstantDepositAccounts,
  NewFundRequest,
} from "./fundDeposits";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { m } from "framer-motion";
import { MotionContainer, varFade } from "src/components/animate";
import { fundRequestProps } from "./fundDeposits/types";
import useResponsive from "src/hooks/useResponsive";
import FundManagementSkeleton from "src/components/skeletons/FundManagementSkeleton";

export const BankAccountContext = createContext([]);

export default function MyFundDeposite() {
  const isMobile = useResponsive("up", "sm");
  const [bankList, setBankList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBankDeatails();
    getFundReq();
  }, []);

  const getBankDeatails = () => {
    let token = localStorage.getItem("token");
    Api(`agent/fundManagement/getAdminBank`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setBankList(Response.data.data);
          } else {
            console.log("======BankList=======>" + Response);
          }
        }
        setIsLoading(false);
      }
    );
  };

  const getFundReq = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: 5,
        currentPage: 1,
      },
    };
    Api(`agent/fundManagement/getRaisedRequests`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setTableData(
              Response.data.data.map((item: fundRequestProps) => {
                return {
                  ...item,
                  requestEditTime: Response.data.MS_to_permanent,
                };
              })
            );
          }
        }
      }
    );
  };

  if (isLoading) {
    return <FundManagementSkeleton />;
  }

  return (
    <MotionContainer>
      <BankAccountContext.Provider value={bankList}>
        <Scrollbar
          sx={
            isMobile
              ? { maxHeight: window.innerHeight - 140 }
              : { maxHeight: window.innerHeight - 70 }
          }
        >
          <Grid container spacing={2} p={1}>
            <Grid item sm={12} md={4}>
              <m.div variants={varFade().inLeft} style={{ height: "100%" }}>
                <NewFundRequest getRaisedRequest={getFundReq} />
              </m.div>
            </Grid>
            <Grid item spacing={2} sm={12} md={8}>
              <Grid item mb={2}>
                <m.div variants={varFade().inRight}>
                  <CompanyBankAccounts />
                </m.div>
              </Grid>
              <Grid item>
                <m.div variants={varFade().inRight}>
                  <InstantDepositAccounts />
                </m.div>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <m.div variants={varFade().inUp}>
                <FundDepositeTable
                  tableData={tableData}
                  getRaisedRequest={getFundReq}
                />
              </m.div>
            </Grid>
          </Grid>
        </Scrollbar>
      </BankAccountContext.Provider>
    </MotionContainer>
  );
}
