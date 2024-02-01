// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  Pagination,
} from "@mui/material";
// components
import { Api } from "src/webservices";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import React, { useEffect, useState, useCallback } from "react";
import { fDateTime } from "src/utils/formatTime";
import useResponsive from "src/hooks/useResponsive";
// ----------------------------------------------------------------------

type RowProps = {
  schemeId: number;
  main_wallet_amount: number;
  id: string;
  name: string;
  firstName: string;
  email: string;
  city: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: any;
  verificationStatus: string;
  avatar: string;
  category: string;
  flag: string;
  total: number;
  rank: string;
  finalStatus: string;
  userCode: string;
  contact_no: string;
  role: string;
  createdAt: string;
  selfie: any;
};

export default function Agent() {
  const [appdata, setAppdata] = useState([]);
  const isMobile = useResponsive("up", "sm");

  const [currentPage, setCurrentPage] = useState<any>(1);

  const tableLabels: any = [
    { id: "product", label: "Name" },
    { id: "due", label: "User Code" },
    { id: "mobileNumber", label: "Mobile Number & email" },
    { id: "main_wallet_amount", label: "Current Balance" },
    { id: "maxComm", label: "Member Since" },
    { id: "schemeId", label: "Scheme Id" },
    { id: "status", label: "Status" },
  ];

  useEffect(() => {
    ApprovedList();
  }, []);

  const ApprovedList = () => {
    let token = localStorage.getItem("token");
    Api(`agent/get_All_Agents`, "GET", "", token).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);

      if (Response.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];
          arr = Response.data.data.filter((item: any) => {
            return (
              (item.role == "agent" && item.referralCode != "") ||
              item.role == "distributor" ||
              item.role == "m_distributor"
            );
          });
          setAppdata(arr);
        }
      }
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Card>
        <TableContainer>
          <Scrollbar
            sx={{ maxHeight: window.innerHeight - (isMobile ? 140 : 50) }}
          >
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={tableLabels} />

              <TableBody>
                {appdata.map((row) => (
                  <EcommerceBestSalesmanRow key={row} row={row} />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
      <Stack
        justifyContent="center"
        alignItems="center"
        sx={{
          position: "fixed",
          bottom: 25,
          left: "50%",
          transform: "translate(-50%)",
          bgcolor: "white",
        }}
      >
        <Pagination
          sx={{ display: "flex", justifyContent: "center" }}
          // count={pageSize}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>
    </>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
};
// sd
function EcommerceBestSalesmanRow({ row }: EcommerceBestSalesmanRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ padding: "0px" }}>
        <Stack direction="row" alignItems="center">
          <Avatar alt={row.name} src={row.selfie} />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2"> {row.firstName} </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.email}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>{row.userCode != "" ? row.userCode : "NA"}</TableCell>
      <TableCell>
        {row.email}
        <br />
        {row.contact_no}
      </TableCell>
      <TableCell sx={{ color: "#0D571C" }}>
        {row.main_wallet_amount.toFixed(2)}
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {fDateTime(row.createdAt)}
        </Typography>
      </TableCell>
      <TableCell>{row.schemeId}</TableCell>
      <TableCell align="right">{row.verificationStatus}</TableCell>
    </TableRow>
  );
}
