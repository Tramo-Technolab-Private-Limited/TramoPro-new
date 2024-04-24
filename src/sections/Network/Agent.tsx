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
  MenuItem,
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
import Iconify from "src/components/iconify";
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
  const [tempData, setTempData] = useState<any>([]);
  const [open, setModalEdit] = React.useState(false);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [TotalCount, setTotalCount] = useState<any>(0);
  const [openFundtrans, setFundTrans] = React.useState(false);
  const [selectedRow, setSelectedRow] = useState<any>();
  const [userList, setUserList] = useState([]);
  const [open1, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  handleClosefunTrans = () => setFundTrans(false);
  const tableLabels: any = [
    { id: "product", label: "Name" },
    { id: "due", label: "User Code" },
    { id: "mobileNumber", label: "Mobile Number & email" },
    { id: "main_wallet_amount", label: "Current Balance" },
    { id: "maxComm", label: "Member Since" },
    { id: "schemeId", label: "Scheme Id" },
    { id: "status", label: "Balance" },
    { id: "fundtrans", label: "Fund Transfer", align: "center" },
  ];

  type FormValuesProps = {
    status: string;
    shopName: string;
    mobile: string;
    userCode: string;
    usersearchby: string;
    User: string;
  };

  const txnSchema = Yup.object().shape({
    status: Yup.string(),
    clientRefId: Yup.string(),
    usersearchby: Yup.string().required("Search by is required field"),
    searchval: Yup.string()
      .when("usersearchby", {
        is: "userCode",
        then: Yup.string().required("User Code is required field"),
      })
      .when("usersearchby", {
        is: "firstName",
        then: Yup.string().required("First Name is required field"),
      })
      .when("usersearchby", {
        is: "contact_no",
        then: Yup.string().required("Contact Number is required field"),
      })
      .when("usersearchby", {
        is: "email",
        then: Yup.string().required("Email is required field"),
      }),
  });
  const defaultValues = {
    category: "",
    status: "",
    userCode: "",
    mobile: "",
    shopName: "",
    usersearchby: "",
    User: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(txnSchema),
    defaultValues,
  });

  const {
    resetField,
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

  useEffect(() => {
    if (getValues("User")?.length > 2) searchFromUser(getValues("User"));
  }, [watch("User")]);

  useEffect(() => {
    resetField("User");
  }, [watch("usersearchby")]);

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

  const searchFromUser = (val: string) => {
    let body = {
      searchBy: watch("usersearchby"),
      searchInput: val,
      finalStatus: "approved",
    };
    {
      Api(`admin/search_user`, "POST", body, "").then((Response: any) => {
        console.log("======get_CategoryList==response=====>" + Response);
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setUserList(Response.data.data);
          } else {
            console.log("======search_usert=======>" + Response);
          }
        }
      });
    }
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

  const handleReset = (val: any) => {
    reset(defaultValues);
    setSelectedRow(val);
    ApprovedList();
  };

  return (
    <>
      <Stack>
        <Stack flexDirection={"row"} gap={1} justifyContent={"right"} mb={1}>
          <Button variant="contained" onClick={handleReset}>
            <Iconify icon="bx:reset" color={"common.white"} mr={1} />
            Reset
          </Button>
          <Button variant="contained" onClick={handleOpen}>
            <Iconify
              icon="icon-park-outline:filter"
              color={"common.white"}
              mr={1}
            />{" "}
            Filter
          </Button>
        </Stack>
        <MotionModal
          open={open1}
          onClose={handleClose}
          width={{ xs: "95%", sm: 500 }}
        >
          {/* <Box> */}
          <FormProvider methods={methods} onSubmit={handleSubmit(ApprovedList)}>
            <RHFSelect
              fullWidth
              name="usersearchby"
              label="User Search By"
              size="small"
              placeholder="User Search By"
              // InputLabelProps={{ shrink: true }}
              SelectProps={{
                native: false,
                sx: { textTransform: "capitalize", mb: "10px" },
              }}
            >
              <MenuItem value={"userCode"}>User Code</MenuItem>
              <MenuItem value={"firstName"}>First Name</MenuItem>
              <MenuItem value={"shopName"}>Shop Name</MenuItem>
              <MenuItem value={"contact_no"}>Contact Number</MenuItem>
              <MenuItem value={"email"}>Email</MenuItem>
            </RHFSelect>
            {watch("usersearchby") && (
              <Stack sx={{ position: "relative", minWidth: "200px" }}>
                <RHFTextField
                  fullWidth
                  name="User"
                  placeholder={"Type here..."}
                />
                <Stack flexDirection={"row"} mt={5} gap={1}>
                  <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={isSubmitting}
                    onClick={() => {
                      setAppdata(tempData);
                      handleClose();
                      reset(defaultValues);
                    }}
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
                <Stack
                  sx={{
                    position: "absolute",
                    top: 40,
                    zIndex: 9,
                    width: "100%",
                    bgcolor: "white",
                    border: "1px solid grey",
                    borderRadius: 2,
                  }}
                >
                  <Scrollbar sx={{ maxHeight: 400 }}>
                    {userList.length > 0 &&
                      userList.map((item: any) => {
                        return (
                          <Typography
                            sx={{
                              p: 1,
                              cursor: "pointer",
                              color: "grey",
                              "&:hover": { color: "black" },
                            }}
                            onClick={() => {
                              setUserList([]);
                              setTempData([{ ...item }]);
                              setValue(
                                "User",
                                `${item.firstName} ${item.lastName}`
                              );
                            }}
                            variant="subtitle2"
                          >
                            {" "}
                            {item.userCode
                              ? `${item.firstName} ${item.lastName} (${item.userCode})`
                              : `${item.firstName} ${item.lastName}`}
                          </Typography>
                        );
                      })}
                  </Scrollbar>
                </Stack>
              </Stack>
            )}
          </FormProvider>

          {/* </Box> */}
        </MotionModal>
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
      <TableCell align="left">
        <Typography>
          Main Balance : {fIndianCurrency(row?.main_wallet_amount || "0")}
        </Typography>
        <Typography>
          AEPS Balance : {fIndianCurrency(row?._id?.AEPS_wallet_amount || "0")}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Button variant="contained" onClick={() => FundTransfer(row)}>
          Fund Transfer
        </Button>
      </TableCell>
    </TableRow>
  );
}
