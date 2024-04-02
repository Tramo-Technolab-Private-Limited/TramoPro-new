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
  Button,
} from "@mui/material";
// components
import { Api } from "src/webservices";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import React, { useEffect, useState } from "react";
import { fDateTime } from "src/utils/formatTime";
import useResponsive from "src/hooks/useResponsive";
import { CustomAvatar } from "src/components/custom-avatar";
import { fIndianCurrency } from "src/utils/formatNumber";
import CustomPagination from "src/components/customFunctions/CustomPagination";
import MotionModal from "src/components/animate/MotionModal";
import FundFlow from "../FundManagement/FundFlow";
import FormProvider, {
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DirectFundTransfer from "./DirectFundTransfer";
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
  company_name: any;
};

export let handleClosefunTrans: any;

export default function Agent() {
  const [appdata, setAppdata] = useState([]);
  const isMobile = useResponsive("up", "sm");
  const [open, setModalEdit] = React.useState(false);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [TotalCount, setTotalCount] = useState<any>(0);
  const [openFundtrans, setFundTrans] = React.useState(false);
  const [selectedRow, setSelectedRow] = useState<any>();

  handleClosefunTrans = () => setFundTrans(false);
  const tableLabels: any = [
    { id: "product", label: "Name" },
    { id: "due", label: "User Code" },
    { id: "mobileNumber", label: "Mobile Number & email" },
    { id: "main_wallet_amount", label: "Current Balance" },
    { id: "maxComm", label: "Member Since" },
    { id: "schemeId", label: "Scheme Id" },
    { id: "status", label: "Status" },
    { id: "fundtrans", label: "Fund Transfer", align: "center" },
  ];

  type FormValuesProps = {
    status: string;
    shopName: string;
    mobile: string;
    userCode: string;
  };

  const txnSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
  });
  const defaultValues = {
    category: "",
    status: "",
    userCode: "",
    mobile: "",
    shopName: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(txnSchema),
    defaultValues,
  });

  const {
    reset,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  useEffect(() => {
    ApprovedList();
  }, [currentPage, pageSize]);

  const ApprovedList = () => {
    let body = {
      filter: {
        shopName: getValues("shopName"),
        userCode: getValues("userCode"),
        mobile: getValues("mobile"),
      },
    };

    let token = localStorage.getItem("token");

    Api(
      `agent/get_All_Agents?limit=${pageSize}&page=${currentPage}`,
      "POST",
      body,
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);

      if (Response.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];

          setTotalCount(Response?.data?.count);

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

  const FundTransfer = (val: any) => {
    setFundTrans(true);
    setSelectedRow(val);
    console.log("my value is ", val);
  };
  return (
    <>
      <Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(ApprovedList)}>
          <Stack flexDirection={"row"} justifyContent={"first"}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              style={{ padding: "0 25px", marginBottom: "10px" }}
            >
              <RHFTextField name="shopName" label="Shop Name" />
              <RHFTextField name="mobile" label="Mobile" />
              <RHFTextField name="userCode" label="User Code" />

              <LoadingButton
                variant="contained"
                type="submit"
                loading={isSubmitting}
              >
                Search
              </LoadingButton>
              <LoadingButton
                variant="contained"
                onClick={() => {
                  reset(defaultValues);
                  ApprovedList();
                }}
              >
                Clear
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </Stack>
      <Card>
        <TableContainer>
          <Scrollbar
            sx={{ maxHeight: window.innerHeight - (isMobile ? 140 : 50) }}
          >
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={tableLabels} />

              <TableBody>
                {appdata.map((row) => (
                  <EcommerceBestSalesmanRow
                    key={row}
                    row={row}
                    FundTransfer={FundTransfer}
                  />
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
      ></Stack>
      <CustomPagination
        page={currentPage - 1}
        count={TotalCount}
        onPageChange={(
          event: React.MouseEvent<HTMLButtonElement> | null,
          newPage: number
        ) => {
          setCurrentPage(newPage + 1);
        }}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(
          event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setPageSize(parseInt(event.target.value));
          setCurrentPage(1);
        }}
      />
      <MotionModal
        open={openFundtrans}
        onClose={handleClosefunTrans}
        width={{ xs: "95%", sm: 500 }}
      >
        <DirectFundTransfer props={selectedRow} />
      </MotionModal>
    </>
  );
}

// ----------------------------------------------------------------------

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
  FundTransfer: (row: RowProps) => void;
};

function EcommerceBestSalesmanRow({
  row,
  FundTransfer,
}: EcommerceBestSalesmanRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ padding: "0px" }}>
        <Stack direction="row" alignItems="center">
          <CustomAvatar
            name={row.firstName}
            alt={row.firstName}
            src={row.selfie[0]}
          />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2"> {row.firstName} </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.email}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row?.company_name ? row?.company_name : " No Shop Name "}
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
        {fIndianCurrency(row?.main_wallet_amount || "0")}
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {fDateTime(row.createdAt)}
        </Typography>
      </TableCell>
      <TableCell>{row.schemeId}</TableCell>
      <TableCell align="right">{row.verificationStatus}</TableCell>
      <TableCell align="center">
        <Button variant="contained" onClick={() => FundTransfer(row)}>
          Fund Transfer
        </Button>
      </TableCell>
    </TableRow>
  );
}
