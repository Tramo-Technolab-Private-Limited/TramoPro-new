import React, { useContext, useEffect, useState } from "react";
import { BankAccountContext } from "../MyFundDeposite";
import { Button, Card, Stack, Typography } from "@mui/material";
import { bankAccountProps } from "./types";
import ICICIBank from "src/assets/icons/bankicons/ICICIBank";
import { DemoBank } from "src/assets/icons/bankicons/demoBank";

function CompanyBankAccounts() {
  const bankListContext: bankAccountProps | any =
    useContext(BankAccountContext);
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

  return (
    <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
      <Typography variant="subtitle1" color={"primary"}>
        Company Bank Account
      </Typography>

      <Stack m={1} flexDirection={"row"} alignItems={"center"} gap={2}>
        {bankListContext.map((item: bankAccountProps) => {
          return item.bank_details.bank_name == "ICICI BANK" ? (
            <ICICIBank
              active={
                item.bank_details.account_number === activeBank.account_number
              }
              onClick={() => setActiveBank(item.bank_details)}
            />
          ) : (
            <DemoBank onClick={() => setActiveBank(item.bank_details)} />
          );
        })}
      </Stack>

      <Stack width={{ sm: "100%", md: "50%" }} gap={2}>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="subtitle2">Beneficiary Name</Typography>
          <Typography variant="body2">
            {process.env.REACT_APP_COMPANY_LEGAL_NAME}
          </Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="subtitle2">Bank Name</Typography>
          <Typography variant="body2">{activeBank.bank_name}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="subtitle2">Account Number</Typography>
          <Typography variant="body2">{activeBank.account_number}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="subtitle2">IFSC</Typography>
          <Typography variant="body2">{activeBank.ifsc}</Typography>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography variant="subtitle2">Account Type</Typography>
          <Typography variant="body2">Current</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

export default React.memo(CompanyBankAccounts);
