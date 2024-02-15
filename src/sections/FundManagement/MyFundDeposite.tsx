import { Grid, Paper, styled } from "@mui/material";
import React, { createContext, useEffect, useState } from "react";
import {
  CompanyBankAccounts,
  FundDepositeTable,
  InstantDepositAccounts,
  NewFundRequest,
} from "./fundDeposits";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { formatDistanceToNow } from "date-fns";

export const BankAccountContext = createContext([]);

export default function MyFundDeposite() {
  const [bankList, setBankList] = useState([]);
  const [tableData, setTableData] = useState([]);

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
            setTableData(Response.data.data);
          }
        }
      }
    );
  };

  console.log(
    new Date(1710069968596)
    // formatDistanceToNow(new Date(1708069968596), {
    //   includeSeconds: true,
    // })
  );

  return (
    <BankAccountContext.Provider value={bankList}>
      <Scrollbar sx={{ maxHeight: window.innerHeight - 120, p: 2 }}>
        <Grid container spacing={2} p={1}>
          <Grid item sm={12} md={4}>
            <NewFundRequest getRaisedRequest={getFundReq} />
          </Grid>
          <Grid item spacing={2} sm={12} md={8}>
            <Grid item mb={2}>
              <CompanyBankAccounts />
            </Grid>
            <Grid item>
              <InstantDepositAccounts />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <FundDepositeTable tableData={tableData} />
          </Grid>
        </Grid>
      </Scrollbar>
    </BankAccountContext.Provider>
  );
}
