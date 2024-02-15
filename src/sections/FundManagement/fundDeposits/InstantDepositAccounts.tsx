import React, { useContext, useEffect, useState } from "react";
import { BankAccountContext } from "../MyFundDeposite";
import { Button, Card, Stack, Typography } from "@mui/material";
import { bankAccountProps } from "./types";
import ICICIBank from "src/assets/icons/bankicons/ICICIBank";
import { DemoBank } from "src/assets/icons/bankicons/demoBank";
import { useAuthContext } from "src/auth/useAuthContext";
import { LoadingButton } from "@mui/lab";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";

function InstantDepositAccounts() {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [registerVAloading, setRegisterVAloading] = useState(false);
  const [createVAloading, setCreateVAloading] = useState(false);
  const bankListContext: any = useContext(BankAccountContext);
  const [activeBank, setActiveBank] = useState({
    ifsc: "",
    account_number: "",
    bank_name: "",
    branch_name: "",
    address: "",
  });

  useEffect(() => {
    if (bankListContext.length) setActiveBank(bankListContext[0]?.bank_details);
  }, [bankListContext]);

  if (user?.autoCollect?.virtualBankAccountDetails.accountNumber) {
    return (
      <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
        <Typography variant="subtitle1" color={"primary"}>
          Instant Deposit Account
        </Typography>

        <Stack flexDirection={"row"} alignItems={"center"} gap={2} my={2}>
          <Button variant="contained">
            {user?.autoCollect?.virtualBankAccountDetails?.bankName}
          </Button>
        </Stack>

        <Stack width={{ sm: "100%", md: "50%" }} gap={2}>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography variant="subtitle2">Bank Name</Typography>
            <Typography variant="body2">
              {user?.autoCollect?.virtualBankAccountDetails?.bankName}
            </Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography variant="subtitle2">Account Number</Typography>
            <Typography variant="body2">
              {user?.autoCollect?.virtualBankAccountDetails?.accountNumber}
            </Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"}>
            <Typography variant="subtitle2">IFSC</Typography>
            <Typography variant="body2">
              {user?.autoCollect?.virtualBankAccountDetails?.ifsc}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    );
  }

  const createCustomer = async () => {
    setCreateVAloading(true);
    let token = localStorage.getItem("token");
    await Api(`agent/createVirtualAccount`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
        setCreateVAloading(false);
      }
    );
  };

  if (user?.autoCollect?.customerId) {
    return (
      <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
        <Typography variant="subtitle1" color={"primary"}>
          Instant Deposit Account
        </Typography>

        <LoadingButton
          variant="contained"
          loading={createVAloading}
          onClick={createCustomer}
          sx={{ mt: 2 }}
        >
          Create Virtual Account
        </LoadingButton>
      </Card>
    );
  }

  const registerVPacc = async () => {
    setRegisterVAloading(true);
    let token = localStorage.getItem("token");
    await Api(`agent/registerForAutoCollect`, "GET", "", token).then(
      (Response: any) => {
        if (Response.status == 200) {
          enqueueSnackbar(Response.data.message);
        } else {
          enqueueSnackbar(Response.data.message);
        }
        setRegisterVAloading(false);
      }
    );
  };

  return (
    <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
      <Typography variant="subtitle1" color={"primary"}>
        Instant Deposit Account
      </Typography>

      <LoadingButton
        variant="contained"
        loading={registerVAloading}
        onClick={registerVPacc}
        sx={{ mt: 2 }}
      >
        Register for Virtual Account
      </LoadingButton>
    </Card>
  );
}

export default React.memo(InstantDepositAccounts);
