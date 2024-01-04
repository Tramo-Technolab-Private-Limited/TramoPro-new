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
import ApiDataLoading from "src/components/customFunctions/ApiDataLoading";
import Label from "src/components/label/Label";
import { sentenceCase } from "change-case";
import CustomPagination from "src/components/customFunctions/CustomPagination";
// ----------------------------------------------------------------------

export default function (props: any) {
  const { enqueueSnackbar } = useSnackbar();

  const [sdata, setSdata] = useState([]);
  const [refId, setRefId] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  const getFundReq = () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    let body = {
      pageInitData: {
        pageSize: pageSize,
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
          } else {
            console.log("======getRaisedRequests=======>" + Response);
            enqueueSnackbar(Response.data.message);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );
  };

  const filterRequest = (refId: string) => {
    setSdata([]);
    setIsLoading(true);
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
          } else {
            console.log("======Transaction=======>" + Response);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
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
      {isLoading ? (
        <ApiDataLoading />
      ) : (
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
                    <Typography variant="body1">
                      {fDateTime(row?.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1">Rs. {row?.amount}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1" textAlign={"center"}>
                      {!isNaN(row?.Charge) ? "Rs. " + row?.Charge : "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1" textAlign={"center"}>
                      {!isNaN(row?.Commission)
                        ? "Rs. " + parseFloat(row?.Commission).toFixed(2)
                        : "-"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1">{row?.deposit_type}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1">
                      {row?.transactional_details?.mobile}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body1">
                      {row?.transactional_details?.branch}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      textTransform: "lowercase",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    <Label
                      variant="soft"
                      color={
                        (row.status.toLowerCase() === "failed" && "error") ||
                        ((row.status.toLowerCase() === "pending" ||
                          row.status.toLowerCase() === "in_process") &&
                          "warning") ||
                        "success"
                      }
                      sx={{ textTransform: "capitalize" }}
                    >
                      {row.status.toLowerCase()
                        ? sentenceCase(row.status.toLowerCase())
                        : ""}
                    </Label>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <CustomPagination
            pageSize={pageSize}
            onChange={(event: React.ChangeEvent<unknown>, value: number) => {
              setCurrentPage(value);
            }}
            page={currentPage}
            Count={pageCount}
          />
        </Grid>
      )}
    </>
  );
}
