import { Box, Grid, Paper, styled } from "@mui/material";
import React, { createContext, useEffect, useState } from "react";
import {
  CompanyBankAccounts,
  FundDepositeTable,
  InstantDepositAccounts,
  NewFundRequest,
} from "./fundDeposits";
import { Api } from "src/webservices";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { m, AnimatePresence } from "framer-motion";
import { MotionContainer, varBounce, varSlide } from "src/components/animate";

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

  return (
    <MotionContainer>
      <BankAccountContext.Provider value={bankList}>
        <Scrollbar sx={{ maxHeight: window.innerHeight - 120, p: 2 }}>
          <Grid container spacing={2} p={1}>
            <Grid item sm={12} md={4} sx={{ height: "100%" }}>
              <m.div variants={varBounce({ durationIn: 1.1 }).in}>
                <NewFundRequest getRaisedRequest={getFundReq} />
              </m.div>
            </Grid>
            <Grid item spacing={2} sm={12} md={8}>
              <Grid item mb={2}>
                <m.div variants={varBounce({ durationIn: 1.1 }).in}>
                  <CompanyBankAccounts />
                </m.div>
              </Grid>
              <Grid item>
                <m.div variants={varBounce({ durationIn: 1.1 }).in}>
                  <InstantDepositAccounts />
                </m.div>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <m.div variants={varBounce({ durationIn: 1.1 }).in}>
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
