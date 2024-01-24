import { Fragment, useEffect, useState } from "react";
import { Api } from "src/webservices";
import {
  Button,
  Divider,
  FormControl,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  styled,
  tableCellClasses,
} from "@mui/material";
import { TableHeadCustom } from "src/components/table";
import CustomPagination from "../components/customFunctions/CustomPagination";
import { useSnackbar } from "notistack";
import ApiDataLoading from "../components/customFunctions/ApiDataLoading";

//form
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFSelect, RHFTextField } from "../components/hook-form";
import { useAuthContext } from "src/auth/useAuthContext";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import useResponsive from "src/hooks/useResponsive";
// ----------------------------------------------------------------------

type FormValuesProps = {
  subcategoryList: string[];
  subcategory: string;
  product: string;
};

export default function BBPSSchemePage() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const isMobile = useResponsive("up", "sm");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tempTableData, setTempTableData] = useState([]);
  const [isFilter, setIsFilted] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [distributor, setDistributor] = useState([]);

  const rechargePageSchema = Yup.object().shape({});

  const defaultValues = {
    subcategory: "",
    product: "",
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(rechargePageSchema),
    defaultValues,
    mode: "all",
  });

  const { getValues, setValue, handleSubmit } = methods;

  const tableLabels = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "commissiontype2", label: "Distributor Commission Type" },
    { id: "dis", label: "Distributor Commission" },
    { id: "commissiontype1", label: "Master Distributor Commission Type" },
    { id: "mdis", label: "Master Distributor Commission" },
  ];
  const tableLabels1 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
    { id: "commissiontype2", label: "Distributor Commission Type" },
    { id: "dis", label: "Distributor Commission" },
  ];
  const tableLabels2 = [
    { id: "minslab", label: "Min Slab" },
    { id: "maxslab", label: "Max Slab" },
    { id: "cate", label: "Category" },
    { id: "product", label: "Product" },
    { id: "commissiontype3", label: "Agent Commission Type" },
    { id: "Agcommission", label: "Agent Commission" },
  ];

  useEffect(() => {
    user?.role !== "m_distributor" && getSchemeDetails(user?.bbpsSchemeId);
    user?.role === "m_distributor" && getDistributors();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
    let temp = [...searchData];
    setTempTableData(
      temp.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
  }, [searchData.length]);

  //pagenation in frontend
  useEffect(() => {
    let temp = isFilter ? [...searchData] : [...tableData];
    setTempTableData(
      temp.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
  }, [currentPage, tableData]);

  const getDistributors = () => {
    let token = localStorage.getItem("token");
    Api(`agent/distributorDropDown`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setDistributor(Response.data.data);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
      }
    });
  };

  const getSchemeDetails = async (val: any) => {
    let token = localStorage.getItem("token");
    setIsLoading(true);
    await Api(
      `bbpsManagement/bbpsScheme/scheme_details/` + val,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setTableData(Response.data.data.commissionSetting);
          setCurrentPage(1);
        } else {
          enqueueSnackbar(Response.data.message);
        }
        let arr: any = [];
        Response.data?.data?.commissionSetting?.map((item: any) => {
          if (!arr.includes(item.subCategoryName)) {
            arr.push(item.subCategoryName);
          }
        });
        setValue("subcategoryList", arr);
        setTimeout(() => setIsLoading(false), 1000);
      } else {
        enqueueSnackbar("Failed to Load");
        setIsLoading(false);
      }
    });
  };

  const onSubmit = (data: FormValuesProps) => {
    setIsFilted(true);
    if (data.subcategory && !data.product) {
      setSearchData(
        tableData.filter(
          (item: any) => item.subCategoryName == data.subcategory
        )
      );
    } else if (!data.subcategory && data.product) {
      setSearchData(
        tableData.filter((item: any) =>
          item.product.productName
            .toLowerCase()
            .match(data.product.toLowerCase())
        )
      );
    } else if (data.subcategory && data.product) {
      setSearchData(
        tableData
          .filter((item: any) => item.subCategoryName == data.subcategory)
          .filter((item: any) =>
            item.product.productName
              .toLowerCase()
              .match(data.product.toLowerCase())
          )
      );
    } else {
      setSearchData(tableData);
    }
  };

  const clear = () => {
    setIsFilted(false);
    setTempTableData(
      tableData.slice(currentPage * pageSize - pageSize, currentPage * pageSize)
    );
    setCurrentPage(1);
    setValue("product", "");
    setValue("subcategory", "");
  };

  return (
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
            >
              {distributor.map((item: any) => {
                return (
                  <MenuItem
                    key={item._id}
                    value={item.bbpsSchemeId}
                    onClick={() => getSchemeDetails(item.bbpsSchemeId)}
                  >
                    {item.firstName + " " + item.lastName}
                  </MenuItem>
                );
              })}
            </TextField>
          </FormControl>
        </>
      )}

      {isLoading ? (
        <ApiDataLoading />
      ) : (
        <>
          {tableData.length > 0 && (
            <Stack mx={1}>
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack
                  flexDirection={"row"}
                  gap={1}
                  mb={1}
                  width={{ xs: "100%", sm: "50%" }}
                >
                  <RHFSelect
                    name="subcategory"
                    label="Category"
                    placeholder="Category"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  >
                    {getValues("subcategoryList")?.map((item: string) => {
                      return (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </RHFSelect>
                  <RHFTextField
                    name="product"
                    label="Product"
                    placeholder="Product"
                    SelectProps={{
                      native: false,
                      sx: { textTransform: "capitalize" },
                    }}
                  />
                  <Button variant="contained" type="submit">
                    {" "}
                    Search
                  </Button>
                  <Button variant="contained" onClick={clear}>
                    Clear
                  </Button>
                </Stack>
              </FormProvider>

              <TableContainer sx={{ overflow: "unset" }}>
                <Scrollbar
                  sx={
                    isMobile
                      ? { maxHeight: window.innerHeight - 200 }
                      : { maxHeight: window.innerHeight - 130 }
                  }
                >
                  <Table
                    sx={{ minWidth: 720 }}
                    stickyHeader
                    aria-label="customized table"
                  >
                    <TableHeadCustom
                      headLabel={
                        user?.role?.toLowerCase() == "m_distributor"
                          ? tableLabels
                          : user?.role?.toLowerCase() == "distributor"
                          ? tableLabels1
                          : tableLabels2
                      }
                    />

                    <TableBody sx={{ overflow: "auto" }}>
                      {tempTableData.map((row: any) => {
                        return (
                          <SchemeRow
                            key={row._id}
                            row={row}
                            rowDetail={user?.role}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Stack>
          )}
        </>
      )}

      <CustomPagination
        pageSize={pageSize}
        onChange={(event: React.ChangeEvent<unknown>, value: number) => {
          setCurrentPage(value);
        }}
        page={currentPage}
        Count={(isFilter ? searchData : tableData).length}
      />
    </>
  );
}

const SchemeRow = ({ row, rowDetail }: any) => {
  const [item, setItem] = useState(row);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      padding: 6,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[300],
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  return (
    <StyledTableRow>
      <StyledTableCell>{item?.minSlab}</StyledTableCell>
      <StyledTableCell>{item?.maxSlab}</StyledTableCell>
      <StyledTableCell>{item?.subCategoryName}</StyledTableCell>
      <StyledTableCell>{item?.product?.productName}</StyledTableCell>

      {rowDetail == "m_distributor" && (
        <>
          <StyledTableCell>
            {item?.agentCommissionType == "flat"
              ? "Rs."
              : item?.agentCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.agentCommission}</StyledTableCell>
          <StyledTableCell>
            {item?.distributorCommissionType == "flat"
              ? "Rs."
              : item?.distributorCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.distributorCommission}</StyledTableCell>
          <StyledTableCell>
            {item?.masterDistributorCommissionType == "flat"
              ? "Rs."
              : item?.masterDistributorCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.masterDistributorCommission}</StyledTableCell>
        </>
      )}
      {rowDetail == "distributor" && (
        <>
          <StyledTableCell>
            {item?.agentCommissionType == "flat"
              ? "Rs."
              : item?.agentCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.agentCommission}</StyledTableCell>
          <StyledTableCell>
            {item?.distributorCommissionType == "flat"
              ? "Rs."
              : item?.distributorCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.distributorCommission}</StyledTableCell>
        </>
      )}
      {rowDetail == "agent" && (
        <>
          <StyledTableCell>
            {item?.agentCommissionType == "flat"
              ? "Rs."
              : item?.agentCommissionType == "percentage"
              ? "%"
              : "-"}
          </StyledTableCell>
          <StyledTableCell>{item?.agentCommission}</StyledTableCell>
        </>
      )}
    </StyledTableRow>
  );
};
