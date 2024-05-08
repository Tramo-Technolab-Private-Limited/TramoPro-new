import React, { useContext, useEffect, useState } from "react";
import { BankAccountContext } from "../../MyFundDeposite";
import {
  Button,
  Card,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { useAuthContext } from "src/auth/useAuthContext";
import { LoadingButton } from "@mui/lab";

import { useSnackbar } from "notistack";
import demoQR from "../../../assets/icons/demoqr.svg";
import Image from "src/components/image/Image";
import useCopyToClipboard from "src/hooks/useCopyToClipboard";
import Iconify from "src/components/iconify/Iconify";

function InstantDepositAccounts() {
  const { user, Api, UploadFileApi } = useAuthContext();
  const { copy } = useCopyToClipboard();
  const { enqueueSnackbar } = useSnackbar();
  const [registerVAloading, setRegisterVAloading] = useState(false);
  const [createVAloading, setCreateVAloading] = useState(false);
  const [identifiers, setIdentifiers] = useState([]);
  const [services, setServices] = React.useState<any>();

  useEffect(() => {
    getIdentifiers();
  }, []);

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar("Copied!");
      copy(text);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setServices(newValue);
  };

  const getIdentifiers = () => {
    let token = localStorage.getItem("token");
    Api(`autoCollect/fetch`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          console.log(
            "===========autoCollect Details =============>",
            Response.data.data
          );

          setServices(Response.data.data[0]);
          setIdentifiers(Response.data.data);
        } else {
          console.log("======autoCollect=======>" + Response);
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      }
    });
  };

  const registerVirtualAcc = () => {
    let token = localStorage.getItem("token");
    let body = {
      autoCollectId: services?._id,
    };
    Api(`autoCollect/customer/registration`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            console.log(
              "===========autoCollect Details =============>",
              Response.data.data
            );
          } else {
            console.log("======autoCollect=======>" + Response);
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      }
    );
  };

  const createVirtualAcc = () => {
    let token = localStorage.getItem("token");
    let body = {
      autoCollectId: services?._id,
    };
    Api(`autoCollect/create/virtualAccount`, "POST", body, token).then(
      (Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            enqueueSnackbar(Response.data.message);
            console.log(
              "===========autoCollect Details =============>",
              Response.data.data
            );
            setCreateVAloading(true);
            setRegisterVAloading(true);
          } else {
            console.log("======autoCollect=======>" + Response);
            enqueueSnackbar(Response.data.message, { variant: "error" });
          }
        }
      }
    );
  };

  return (
    <Card sx={{ p: 2, bgcolor: "primary.lighter" }}>
      <Typography variant="subtitle1" color={"primary"}>
        Instant Deposit Account
      </Typography>
      <Stack flexDirection={"row"} justifyContent={"space-between"} p={1}>
        <Tabs
          value={services}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            ".MuiTabs-indicator": {
              marginBottom: 1,
            },
          }}
        >
          {identifiers.map((item: any) => (
            <Tab
              key={item?.autoCollectIdentifier}
              value={item}
              label={item.autoCollectIdentifier}
              sx={{ fontWeight: "bold" }}
            />
          ))}
        </Tabs>
      </Stack>
      {user?.autoCollectData?.find(
        (item: any) =>
          item.autoCollect == services?._id &&
          item?.hasOwnProperty("customerId")
      ) ? (
        user?.autoCollectData?.find(
          (item: any) =>
            item.autoCollect == services?._id &&
            item?.hasOwnProperty("customerId") &&
            item?.hasOwnProperty("virtualAccountId")
        ) ? (
          <>
            {user?.autoCollectData
              ?.filter(
                (item: any) =>
                  item?.autoCollect === services?._id &&
                  item?.hasOwnProperty("customerId") &&
                  item?.hasOwnProperty("virtualAccountId")
              )
              ?.map((service: any, index: number) =>
                service?.services?.map((item: any) => (
                  <>
                    <Stack p={1}>
                      <Stack>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="body1"
                        >
                          Beneficiary Name
                        </Typography>
                        <Typography variant="body1">
                          <Typography key={index}>
                            {item?.data?.name}
                            <Tooltip title="Copy" placement="top">
                              <IconButton
                                onClick={() => onCopy(item?.data?.name)}
                              >
                                <Iconify
                                  icon="eva:copy-fill"
                                  width={20}
                                  color={"primary.main"}
                                />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Typography>
                      </Stack>
                      <Stack>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="body1"
                        >
                          Bank Name
                        </Typography>
                        <Typography>
                          <Typography key={index}>
                            {item?.data?.bank_name}
                            <Tooltip title="Copy" placement="top">
                              <IconButton
                                onClick={() => onCopy(item?.data?.bank_name)}
                              >
                                <Iconify
                                  icon="eva:copy-fill"
                                  width={20}
                                  color={"primary.main"}
                                />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Typography>
                      </Stack>
                      <Stack>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="body1"
                        >
                          Account Number
                        </Typography>
                        <Typography>
                          <Typography key={index}>
                            {item?.data?.account_number}
                            <Tooltip title="Copy" placement="top">
                              <IconButton
                                onClick={() =>
                                  onCopy(item?.data?.account_number)
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
                        </Typography>
                      </Stack>
                      <Stack>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="body1"
                        >
                          IFSC
                        </Typography>
                        <Typography>
                          <Typography key={index}>
                            {item?.data?.ifsc}
                            <Tooltip title="Copy" placement="top">
                              <IconButton
                                onClick={() => onCopy(item?.data?.ifsc)}
                              >
                                <Iconify
                                  icon="eva:copy-fill"
                                  width={20}
                                  color={"primary.main"}
                                />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Typography>
                      </Stack>
                      {/* <Stack>
                      <Typography
                        style={{ fontWeight: "bold" }}
                        variant="body2"
                      >
                        UPI ID
                      </Typography>
                      <Typography>
                        <Typography key={index}>
                          {service?.services[0]?.data?.ifsc}
                        </Typography>
                      </Typography>
                    </Stack> */}
                    </Stack>
                  </>
                ))
              )}
          </>
        ) : (
          <LoadingButton
            variant="contained"
            loading={registerVAloading}
            onClick={createVirtualAcc}
            sx={{ mt: 2 }}
          >
            Creact Virtual Account
          </LoadingButton>
        )
      ) : (
        <LoadingButton
          variant="contained"
          loading={registerVAloading}
          onClick={registerVirtualAcc}
          sx={{ mt: 2 }}
        >
          Registration
        </LoadingButton>
      )}
    </Card>
  );
}

export default React.memo(InstantDepositAccounts);
