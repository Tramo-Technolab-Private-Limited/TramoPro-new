import { Label } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import {
  Card,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import Scrollbar from "src/components/scrollbar";
import { RHFRadioGroup, RHFTextField } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";
import { TableHeadCustom, TableNoData } from "src/components/table";
import useResponsive from "src/hooks/useResponsive";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

type FormValuesProps = {
  searchType:string;
  search:string;
}

function WalletToWallet() {
  const isMobile = useResponsive("up", "sm");
  const [value, setValue] = useState("email");
  const [tabvalue, setTabValue] = useState("credit");
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState("");

  const schema = yup.object().shape({
    search: yup.string().when("searchType", {
      is: "email",
      then: yup
        .string()
        .email("Invalid email format")
        .required("Email is required"),
      otherwise: yup
        .string()
        .required("Mobile number is required")
        .matches(/^[0-9]{10}$/, "Must be a 10 digit number"),
    }),
  });

  const defaultValues = {
    searchType:"",
    search:"",
  };


  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

  const InputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  // const handleSubmit = () => {
  //   setData(value);
  // };
  const handleTabChange = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

  const tableLabels = [
    { id: "username", label: "User Name" },
    { id: "usercode", label: "User Code" },
    { id: "businessname", label: "Business Name" },
    { id: "amount", label: "Amount" },
    { id: "status", label: "Status" },
  ];

  return (
    <>
      <Card sx={{ maxWidth: "100%", maxHeight: "80px", bgcolor: "#FFF8F8" }}>
        <Typography variant="h3" sx={{ p: 2, color: "#334A67" }}>
          Wallet To Wallet
        </Typography>
      </Card>
      <FormProvider {...methods}>
        <Stack
          flexDirection="row"
          bgcolor="#FFF8F8"
          mt={2}
          p={2}
          height={"70vh"}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <RadioGroup
                value={methods.watch("searchType")}
                onChange={(e) => methods.setValue("searchType", e.target.value)}
              >
                <Stack flexDirection="row">
                  <RHFRadioGroup
                    name="SearchType"
                    options={[{ value: "email", label: "Search by Email" }]}
                  />
                  <RHFRadioGroup
                    name="SearchType"
                    options={[{ value: "mobile", label: "Search by Mobile" }]}
                  />
                </Stack>
              </RadioGroup>
              <Stack flexDirection="row" gap={1} mt={1}>
                <Controller
                  name="search"
                  render={({ field }) => (
                    <RHFTextField
                      {...field}
                      size="small"
                      label="Search"
                      placeholder={
                        value === "email"
                          ? "Search by Email"
                          : "Search by Mobile"
                      }
                    />
                  )}
                />
                <LoadingButton variant="contained">Search</LoadingButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={9}>
              <Card sx={{ height: "65vh", bgcolor: "white", p: 2 }}>
                <Tabs
                  value={tabvalue}
                  onChange={handleTabChange}
                  aria-label="disabled tabs example"
                >
                  <Tab value="credit" label="Credit" />
                  <Tab value="debit" label="Debit" />
                </Tabs>
                <Typography variant="h5" mt={1} mb={1}>
                  Recent Transactions
                </Typography>
                <Grid item xs={12} md={12} lg={12}>
                  <Scrollbar
                    sx={
                      isMobile
                        ? { maxHeight: window.innerHeight - 190 }
                        : { maxHeight: window.innerHeight - 250 }
                    }
                  >
                    <Table
                      size="small"
                      aria-label="customized table"
                      stickyHeader
                    >
                      <TableHeadCustom headLabel={tableLabels} />
                      <TableBody></TableBody>
                    </Table>
                  </Scrollbar>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </FormProvider>
    </>
  );
}

export default WalletToWallet;
