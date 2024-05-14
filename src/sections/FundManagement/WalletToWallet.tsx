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
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { FormProvider } from "react-hook-form";
import Scrollbar from "src/components/scrollbar";
import { RHFTextField } from "src/components/hook-form";
import { LoadingButton } from "@mui/lab";

function WalletToWallet() {
  const [value, setValue] = useState("email");
  const [tabvalue, setTabValue] = useState ("credit");
  const [inputValue, setInputValue] = useState('');
  const [data , setData] = useState ('');

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  const InputChange = (event:any) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    setData(value);
  };
  const handleTabChange =(event:any, newValue:string) => {
    setTabValue(newValue);
  }

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
    <>
      <Card sx={{ maxWidth: "100%", maxHeight: "80px", bgcolor: "#FFF8F8" }}>
        <Typography variant="h3" sx={{ p: 2, color: "#334A67" }}>
          Wallet To Wallet
        </Typography>
      </Card>
      <Stack flexDirection="row" bgcolor="#FFF8F8" mt={2} p={2}>
        <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <RadioGroup value={value} onChange={handleChange}>
            <Stack flexDirection="row">
              <FormControlLabel value="email" control={<Radio />} label="Search by Email" />
              <FormControlLabel value="number" control={<Radio />} label="Search by Mobile" />
            </Stack>
          </RadioGroup>
          <Stack flexDirection="row" gap={1} mt={1}>
            <TextField
              size="small"
              value={inputValue}
              onChange={InputChange}
              placeholder={value === 'email' ? 'Search by Email' : 'Search by Mobile'}
              inputProps={{
                maxLength: 10,
                type: value === 'email' ? 'text' : 'number',
              }}
            />
            <LoadingButton variant="contained" size="small" onClick={handleSubmit}>
              Search
            </LoadingButton>
          </Stack>
        </Grid>
          <Grid item xs={12} md={9}>
            <Card sx={{ maxHeight: "100%", bgcolor: "white", p: 2 }}>
            <Tabs
              value={tabvalue}
              onChange={handleTabChange}
              aria-label="disabled tabs example"
            >
              <Tab value="credit" label="Credit" />
              <Tab value="debit" label="Debit" />
            </Tabs>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="body2">{""}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" whiteSpace="nowrap">
                    {""}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" whiteSpace="nowrap">
                    {""}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Stack flexDirection="row">
                    <Typography
                      variant="body2"
                      whiteSpace="nowrap"
                    >
                      {""}
                    </Typography>
                    <Typography
                      variant="body2"
                      whiteSpace="nowrap"
                    >
                      {""}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" whiteSpace="nowrap">
                    {""}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    sx={{ textTransform: "lowercase", fontWeight: 600 }}
                  >
                    {""}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}

export default WalletToWallet;
