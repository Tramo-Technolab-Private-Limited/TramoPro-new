import React, { useContext, useEffect, useState } from "react";
import { BankAccountContext } from "../MyFundDeposite";
import {
  Button,
  Card,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import { LoadingButton } from "@mui/lab";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import demoQR from "../../../assets/icons/demoqr.svg";
import Image from "src/components/image/Image";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import Iconify from "src/components/iconify/Iconify";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  maxHeight: 230,
  maxWidth: 230,
  margin: "auto",
  border: `1px solid ${theme.palette.primary.main}`,
}));

function InstantDepositAccounts() {
  const { user } = useAuthContext();
  const { copy } = useCopyToClipboard();
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

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  if (user?.autoCollect?.virtualBankAccountDetails.accountNumber) {
    return (
      <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
        <Grid container xs={12}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color={"primary"}>
              Instant Deposit Account
            </Typography>

            <Stack flexDirection={"row"} alignItems={"center"} gap={2} my={2}>
              <Button variant="contained">
                {user?.autoCollect?.virtualBankAccountDetails?.bankName}
              </Button>
            </Stack>

            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="subtitle2">Bank Name</Typography>
              <Typography variant="body2">
                {user?.autoCollect?.virtualBankAccountDetails?.bankName}{" "}
                <Tooltip title="Copy" placement="top">
                  <IconButton
                    onClick={() =>
                      onCopy(
                        user?.autoCollect?.virtualBankAccountDetails?.bankName
                      )
                    }
                  >
                    <Iconify
                      icon="eva:copy-fill"
                      width={20}
                      color={"primary.main"}
                    />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="subtitle2">Account Number</Typography>
              <Typography variant="body2">
                {user?.autoCollect?.virtualBankAccountDetails?.accountNumber}
                <Tooltip title="Copy" placement="top">
                  <IconButton
                    onClick={() =>
                      onCopy(
                        user?.autoCollect?.virtualBankAccountDetails
                          ?.accountNumber
                      )
                    }
                  >
                    <Iconify
                      icon="eva:copy-fill"
                      width={20}
                      color={"primary.main"}
                    />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="subtitle2">IFSC</Typography>
              <Typography variant="body2">
                {user?.autoCollect?.virtualBankAccountDetails?.ifsc}
                <Tooltip title="Copy" placement="top">
                  <IconButton
                    onClick={() =>
                      onCopy(user?.autoCollect?.virtualBankAccountDetails?.ifsc)
                    }
                  >
                    <Iconify
                      icon="eva:copy-fill"
                      width={20}
                      color={"primary.main"}
                    />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Stack>
            <Stack
              flexDirection={"row"}
              justifyContent={"space-between"}
              mb={1}
            >
              <Typography variant="subtitle2">UPI</Typography>
              <Typography variant="body2">
                tramo@rbl
                <Tooltip title="Copy" placement="top">
                  <IconButton onClick={() => onCopy("tramo@rbl")}>
                    <Iconify
                      icon="eva:copy-fill"
                      width={20}
                      color={"primary.main"}
                    />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Item>
              <Image src={demoQR} alt={"qr"} />
            </Item>
          </Grid>
        </Grid>
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
