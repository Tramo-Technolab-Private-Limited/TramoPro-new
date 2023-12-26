import { useEffect, useState } from "react";
// @mui
import {
  Stack,
  Grid,
  TableHead,
  Box,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Button,
  Typography,
  Pagination,
} from "@mui/material";

import { Helmet } from "react-helmet-async";

import { useSnackbar } from "notistack";

import { Api } from "src/webservices";
import { fDateTime } from "src/utils/formatTime";
// ----------------------------------------------------------------------

export default function (props: any) {
  const { enqueueSnackbar } = useSnackbar();

  const [sdata, setSdata] = useState([]);
  const [refId, setRefId] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // const [fundRequestCreatedAt, setFundRequestCreatedAt] = useState('');

  const tableLabels = [
    { id: "Date", label: "Date & Time" },
    { id: "amount", label: "Amount" },
    { id: "Charge", label: "Charge" },
    { id: "Commission", label: "Commission" },
    { id: " deposit_type", label: " Deposit Type" },
    { id: "mobile", label: "Mobile" },
    { id: " branch", label: " Branch" },
    { id: " status", label: " Status" },
  ];

  useEffect(() => {
    getFundReq();
  }, [currentPage]);

  const handlePageChange = (event: any, newValue: number) => {
    setCurrentPage(newValue);
  };

  const getFundReq = () => {
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: 20,
        currentPage: currentPage,
      },
    };
    Api(`agent/fundManagement/getRaisedRequests`, "POST", body, token).then(
      (Response: any) => {
        console.log("======FundsRequests All==response=====>", Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            setPageCount(Response.data.count);
            setSdata(Response.data.data);
            console.log(
              "===========getRaisedRequests Details ==========>",
              Response.data.data
            );
          } else {
            console.log("======getRaisedRequests=======>" + Response);
            enqueueSnackbar(Response.data.message);
          }
        }
      }
    );
  };

  const filterRequest = (refId: string) => {
    setSdata([]);

    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: 20,
        currentPage: currentPage,
      },
      clientRefId: refId,
    };
    Api(`transaction/transactionByUser`, "POST", body, token).then(
      (Response: any) => {
        console.log("======Transaction==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setSdata(Response.data.data.data);
            enqueueSnackbar(Response.data.message);
            console.log(
              "======getUser===data.data ==============XXXXX=============Transaction====>",
              Response
            );
          } else {
            console.log("======Transaction=======>" + Response);
          }
        }
      }
    );
  };

  return (
    <>
      <Helmet>
        <title> Transactions |{process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <Stack flexDirection={"row"} justifyContent={"end"}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          style={{ padding: "0 25px", marginBottom: "10px" }}
        >
          <TextField
            id="outlined-password-input"
            label="Search By Ref Id"
            size="small"
            type="text"
            onChange={(e) => setRefId(e.target.value)}
          />
          <Button variant="contained" onClick={() => filterRequest(refId)}>
            Search
          </Button>
        </Stack>
      </Stack>

      <Grid item xs={16} md={12} lg={12}>
        <Table
          sx={{ minWidth: 720 }}
          stickyHeader
          size="medium"
          aria-label="customized table"
        >
          <TableHead>
            <TableRow>
              {tableLabels.map((column: any) => (
                <TableCell key={column.id} align="center">
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sdata.map((row: any) => (
              <TableRow
                key={row._id}
                hover
                role="checkbox"
                tabIndex={-1}
                sx={{ borderBottom: "1px solid #dadada" }}
                // hover
              >
                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {fDateTime(row?.createdAt)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Rs. {row?.amount}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {!isNaN(row?.Charge) ? "Rs. " + row?.Charge : "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {!isNaN(row?.Commission)
                      ? "Rs. " + parseFloat(row?.Commission).toFixed(2)
                      : "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {row?.deposit_type}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {row?.transactional_details?.mobile}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {row?.transactional_details?.branch}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" alignItems="center">
                    <Box sx={{ ml: 2 }}>
                      <Typography
                        variant="body2"
                        sx={
                          row.status.toLowerCase() == "pending" ||
                          row.status.toLowerCase() == "hold"
                            ? { color: "#ffc107" }
                            : row.status.toLowerCase() == "failed"
                            ? { color: "#dc3545" }
                            : { color: "#198754" }
                        }
                      >
                        {row?.status}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Stack flexDirection={"row"} justifyContent={"center"} mt={2}>
          <Pagination
            count={Math.floor(pageCount / 20) + (pageCount % 20 === 0 ? 0 : 1)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            variant="outlined"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Grid>
    </>
  );
}
