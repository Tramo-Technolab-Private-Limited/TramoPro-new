import {
  Box,
  Card,
  Stack,
  Button,
  useTheme,
  MenuItem,
  Typography,
  Modal,
  FormHelperText,
  Grid,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, {
  RHFAutocomplete,
  RHFCodes,
  RHFSecureCodes,
  RHFTextField,
} from "../../../components/hook-form";
import { useEffect, useState } from "react";

import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import MenuPopover from "src/components/menu-popover/MenuPopover";
import Label from "src/components/label/Label";
import { useAuthContext } from "src/auth/useAuthContext";
import useResponsive from "src/hooks/useResponsive";
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TextToSpeak } from "src/components/customFunctions/TextToSpeak";
import { init } from "i18next";
import { fetchLocation } from "src/utils/fetchLocation";

type FormValuesProps = {
  operator: {
    _id: string;
    productName: string;
  };
  category: { cateName: string; cateId: string };
  bbpsParams: {}[];
  location: {
    location: string;
  };
};
type PayValuesProps = {
  customerName: string;
  mobileNumber: string | number;
  amount: string | number;
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
  otp5: string;
  otp6: string;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#ffffff",
  boxShadow: 24,
  p: 4,
};

function Bbps_One() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, Api, UploadFileApi } = useAuthContext();

  const [categoryListOne, setCategoryListOne] = useState<any>([]);
  const [categoryListTwo, setCategoryListTwo] = useState<any>([]);

  const [paramList, setParamList] = useState([]);
  const [isBillFetchMendatory, setIsBillFetchMendatory] = useState(1);
  const [locationList, letLocationList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isBillFetch, setIsBillFetch] = useState(false);
  const [fetchDetail, setFetchDetail] = useState({
    DueAmount: "",
    DueDate: "",
    CustomerName: "",
    BillNumber: "",
    BillDate: "",
    BillPeriod: "",
    isBillFetched: false,
  });

  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) =>
    setOpenPopover(event.currentTarget);
  const handleClosePopover = () => setOpenPopover(null);

  const bbpsSchema = Yup.object().shape({
    // bbpsParams: Yup.array().of(
    //   Yup.object().shape({
    //     dynamicField: Yup.string().required('Field is required'), // Use your regex here
    //   })
    // ),
  });
  const defaultValues = {
    operator: { productName: "", _id: "" },
    bbpsParams: [],
    location: {
      location: "",
    },
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(bbpsSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    control,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  useEffect(() => {
    getLocation();
    getCategoryList();
  }, []);

  useEffect(() => {
    if (getValues("location.location") && getValues("category.cateId")) {
      getOperatorList(watch("location.location"));
    }
    if (watch("location") == null) {
      handleToReset();
    }
  }, [watch("location")]);

  const isMobile = useResponsive("up", "sm");

  const getCategoryList = () => {
    let token = localStorage.getItem("token");
    Api(`category/get_CategoryList`, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          const sortedData = Response?.data?.data
            .filter(
              (item: any) =>
                item?.category_name.toLowerCase() === "bill payment"
            )[0]
            .sub_category.filter((item: any) => {
              if (
                item.sub_category_name.toLowerCase() == "electricity" ||
                item.sub_category_name.toLowerCase() == "water"
              ) {
                return item;
              }
            })
            .toSorted((a: any, b: any) => a.order - b.order);
          setValue("category.cateName", sortedData[0]?.sub_category_name);
          setValue("category.cateId", sortedData[0]?._id);

          if (!isMobile) {
            setCategoryListOne(sortedData?.splice(0, 1));
            setCategoryListTwo(sortedData?.splice(0, sortedData.length));
          } else {
            setCategoryListOne(sortedData?.splice(0, 6));
            setCategoryListTwo(sortedData?.splice(0, sortedData.length));
          }
        } else {
        }
      }
    });
  };

  const getLocation = () => {
    let token = localStorage.getItem("token");
    Api("bbps/location", "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          letLocationList(
            Response.data.data
              .filter((item: any) => item.location !== "")
              .toSorted((a: any, b: any) =>
                a.location.localeCompare(b.location)
              )
          );
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
      }
    });
  };

  const getOperatorList = (location: string) => {
    let token = localStorage.getItem("token");
    Api(
      `bbps/operator?location=${location}&subCategoryId=${getValues(
        "category.cateId"
      )}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setProductList(Response.data.data);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
      }
    });
  };

  const getParams = (val: String) => {
    let token = localStorage.getItem("token");
    Api("bbps/operatorParam/" + val, "GET", "", token).then((Response: any) => {
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setParamList(Response.data.data.productParams);
          setIsBillFetchMendatory(Response.data.dataisBillFetchMandatory);
        } else {
          enqueueSnackbar(Response.data.message, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Failed", { variant: "error" });
      }
    });
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let token = localStorage.getItem("token");
      let body = {
        params: data.bbpsParams.map((item: any) => {
          for (const key in item) {
            return { key: key, value: item[key] };
          }
        }),
        productId: data.operator._id,
      };
      await fetchLocation();
      await Api(`bbps/fetchBill`, "POST", body, token).then((Response: any) => {
        if (Response.status == 200) {
          if (Response.data.code == 200) {
            setFetchDetail({ ...Response.data.data, isBillFetched: true });
            setIsBillFetch(true);
            enqueueSnackbar(Response.data.message);
          } else {
            enqueueSnackbar(Response.data.error.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar("Failed", { variant: "error" });
          handleToReset();
        }
      });
    } catch (error) {
      if (error.code == 1) {
        enqueueSnackbar(`${error.message} !`, { variant: "error" });
      }
    }
  };

  const handleTabChange = (value: any) => {
    let arr = [...categoryListOne];
    if (!isMobile) {
      if (arr.length > 1) {
        arr.pop();
      }
      if (arr.length == 1) {
        arr.push(value);
      }
    } else {
      if (arr.length > 6) {
        arr.pop();
      }
      if (arr.length == 6) {
        arr.push(value);
      }
    }
    setCategoryListOne(arr);
    handleClosePopover();
    handleToReset();
    setProductList([]);
    setParamList([]);
    setValue("category.cateName", value?.sub_category_name);
    setValue("category.cateId", value?._id);
  };

  const handleToReset = () => {
    setProductList([]);
    setParamList([]);
    reset(defaultValues);
    setIsBillFetch(false);
    setIsBillFetchMendatory(1);
    setFetchDetail({
      DueAmount: "",
      DueDate: "",
      CustomerName: "",
      BillNumber: "",
      BillDate: "",
      BillPeriod: "",
      isBillFetched: false,
    });
    setValue("category.cateName", categoryListOne[0]?.sub_category_name);
    setValue("category.cateId", categoryListOne[0]?._id);
  };

  return (
    <>
      <Scrollbar
        sx={{ maxHeight: window.innerHeight - (isMobile ? 270 : 180) }}
      >
        <Card>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={
                !isBillFetch
                  ? {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                    }
                  : {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(1, 0.5fr)",
                    }
              }
            >
              <Stack>
                <Stack flexDirection={"row"} gap={1} my={2}>
                  {categoryListOne?.map((item: any) => {
                    return (
                      <Button
                        key={item._id}
                        sx={{ whiteSpace: "nowrap", width: "fit-content" }}
                        size="small"
                        disabled={isBillFetch}
                        variant={
                          watch("category.cateId") === item._id
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => {
                          handleToReset();
                          setValue(
                            "category.cateName",
                            item?.sub_category_name
                          );
                          setValue("category.cateId", item?._id);
                        }}
                      >
                        {item.sub_category_name}
                      </Button>
                    );
                  })}
                  {categoryListOne?.length > 6 && (
                    <Stack my={0.4}>
                      <Label
                        variant="soft"
                        color={"primary"}
                        onClick={(e) => !isBillFetch && handleOpenPopover(e)}
                        sx={{ cursor: "pointer" }}
                      >
                        +
                        {categoryListOne?.length > (isMobile ? 6 : 1)
                          ? categoryListTwo?.length - 1
                          : categoryListTwo?.length}{" "}
                        more
                      </Label>
                    </Stack>
                  )}
                  <MenuPopover
                    open={openPopover}
                    onClose={handleClosePopover}
                    arrow="left-top"
                    sx={{ width: 200 }}
                  >
                    <Scrollbar sx={{ height: { xs: 400, sm: "auto" } }}>
                      {categoryListTwo?.map((item: any) => {
                        return (
                          <MenuItem
                            key={item._id}
                            onClick={() => handleTabChange(item)}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {item.sub_category_name}{" "}
                          </MenuItem>
                        );
                      })}
                    </Scrollbar>
                  </MenuPopover>
                </Stack>
                <Stack flexDirection={isMobile ? "row" : "column"} gap={2}>
                  <Stack width={isMobile ? "50%" : "100%"} gap={2}>
                    <RHFAutocomplete
                      name="location"
                      onChange={(event, newValue) =>
                        setValue("location", newValue)
                      }
                      options={locationList}
                      getOptionLabel={(option: any) => option?.location}
                      disabled={isBillFetch}
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                          {...props}
                        >
                          {option?.location}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <RHFTextField
                          name="location.location"
                          label="Location"
                          {...params}
                        />
                      )}
                    />
                    {productList.length ? (
                      <RHFAutocomplete
                        name="operator"
                        onChange={(event, newValue) => {
                          setValue("operator", newValue);
                          getParams(newValue?._id);
                        }}
                        options={productList}
                        getOptionLabel={(option: any) => option?.productName}
                        disabled={isBillFetch}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                            {...props}
                          >
                            {option?.productName}
                          </Box>
                        )}
                        renderInput={(params) => (
                          <RHFTextField
                            name="operator.productName"
                            label="Product Name"
                            {...params}
                          />
                        )}
                      />
                    ) : (
                      watch("location.location") && (
                        <Typography variant="subtitle1">
                          Product Not available
                        </Typography>
                      )
                    )}
                    <Stack rowGap={3} columnGap={2} display="grid">
                      {paramList?.map((item: any, index: number) => {
                        return (
                          <Stack
                            flexDirection={"row"}
                            alignItems={"start"}
                            gap={1}
                            key={item.param_id}
                          >
                            <RHFTextField
                              name={`bbpsParams.${index}.${item.param_label}`}
                              error={
                                !new RegExp(item.regex).test(
                                  watch(`bbpsParams.${index}`) &&
                                    Object.values(
                                      watch(`bbpsParams.${index}`)
                                    )[0] + ""
                                )
                              }
                              disabled={isBillFetch}
                              id="outlined-error-helper-text"
                              type={
                                item.param_type === "AlphaNumeric"
                                  ? "text"
                                  : "number"
                              }
                              helperText={item.error_message}
                              label={item.param_label}
                              placeholder={item.param_label}
                              inputProps={{ pattern: item.regex }}
                            />
                            {paramList.length - 1 == index && (
                              <LoadingButton
                                type="submit"
                                variant="contained"
                                loading={isSubmitting}
                                disabled={isBillFetch}
                              >
                                Fetch
                              </LoadingButton>
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Stack>
                  {isBillFetch && (
                    <Stack sx={{ width: isMobile ? "50%" : "100%" }}>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          Bill date
                        </Typography>
                        <Typography variant="body1" align="right">
                          {fetchDetail?.BillDate}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          Bill Number
                        </Typography>
                        <Typography variant="body1" align="right">
                          {fetchDetail?.BillNumber}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          Customer Name
                        </Typography>
                        <Typography variant="body1" align="right">
                          {fetchDetail?.CustomerName}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          Due Date
                        </Typography>
                        <Typography variant="body1" align="right">
                          {fetchDetail?.DueDate}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          BillPeriod
                        </Typography>
                        <Typography variant="body1" align="right">
                          {fetchDetail?.BillPeriod}
                        </Typography>
                      </Stack>
                      <Stack
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" align="left">
                          Due Amount
                        </Typography>
                        <Typography variant="body1" align="right">
                          Rs. {fetchDetail?.DueAmount}
                        </Typography>
                      </Stack>
                      <Stack
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          display: "flex",
                          flexDirection: "column",
                        }}
                      ></Stack>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Grid>
          </FormProvider>
          {!isBillFetchMendatory && (
            <Box
              mt={3}
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 0.5fr)",
              }}
            >
              <BbpsBillPayment
                data={watch(["location", "operator", "bbpsParams", "category"])}
                fetchDetail={fetchDetail}
                isBillFetch={isBillFetch}
                handleToReset={handleToReset}
              />
            </Box>
          )}
        </Card>
      </Scrollbar>
    </>
  );
}

export default Bbps_One;

const BbpsBillPayment = ({
  data,
  fetchDetail,
  isBillFetch,
  handleToReset,
}: any) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, Api, initialize } = useAuthContext();
  const [isParentValid, setIsParentValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [open, setModal] = useState(false);
  const handleOpen = () => setModal(true);
  const handleClose = () => {
    setModal(false);
    reset(defaultValues);
    handleToReset();
  };

  //bbps receipt data
  const [consumerData, setConsumerData] = useState<any>([]);

  const bbpsSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .required("Mobile Number is required")
      .min(10, "mobileNumber must be at least 10 Digits")
      .max(10, "mobileNumber should be maximum 10 digits"),
    customerName: Yup.string().required("Customer Namer is Required"),
    amount: Yup.string().required("Amount is Required"),
    otp1: open ? Yup.string().required() : Yup.string(),
    otp2: open ? Yup.string().required() : Yup.string(),
    otp3: open ? Yup.string().required() : Yup.string(),
    otp4: open ? Yup.string().required() : Yup.string(),
    otp5: open ? Yup.string().required() : Yup.string(),
    otp6: open ? Yup.string().required() : Yup.string(),
  });
  const defaultValues = {
    customerName: "",
    mobileNumber: "",
    amount: "",
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  };

  const methods = useForm<PayValuesProps>({
    resolver: yupResolver(bbpsSchema),
    defaultValues,
    mode: "all",
  });

  const {
    reset,
    control,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  useEffect(() => {
    setConsumerData(data);
    if (isBillFetch) {
      setValue("amount", isBillFetch && fetchDetail?.DueAmount);
      setValue("customerName", isBillFetch && fetchDetail?.CustomerName);
    }
    Object.values(data[2]).map((item: any) => {
      for (const key in item) {
        item[key] == "" ? setIsParentValid(true) : setIsParentValid(false);
      }
    });
  }, [data]);

  const onSubmit = () => {};

  const submit = async () => {
    setIsLoading(true);
    let token = localStorage.getItem("token");
    try {
      let body = {
        amount: getValues("amount"),
        utilityAccNumber: Object.values(data[2][0])[0],
        mobileNumber: getValues("mobileNumber"),
        customerName: fetchDetail?.CustomerName || "",
        productId: data[1]?._id,
        bbpsBillFetchData: fetchDetail,
        bbpsParametersDetails: Object.values(data[2]).map((item: any) => {
          for (const key in item) {
            return { key: key, value: item[key] };
          }
        }),
        nPin:
          getValues("otp1") +
          getValues("otp2") +
          getValues("otp3") +
          getValues("otp4") +
          getValues("otp5") +
          getValues("otp6"),
      };
      await fetchLocation();
      await Api("bbps/transaction", "POST", body, token).then(
        (Response: any) => {
          if (Response.status == 200) {
            if (Response.data.code == 200) {
              if (Response.data.data.status == "success") {
                initialize();
              }
              TextToSpeak(Response.data.message);
              enqueueSnackbar(Response.data.message);
            } else {
              enqueueSnackbar(Response.data.error.message, {
                variant: "error",
              });
            }
            reset(defaultValues);
            handleClose();
            handleToReset();
            setIsLoading(false);
          } else {
            reset(defaultValues);
            handleToReset();
            handleClose();
            enqueueSnackbar("Failed", { variant: "error" });
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      setIsLoading(false);
      if (error.code == 1) {
        enqueueSnackbar(`${error.message} !`, { variant: "error" });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={3}>
        <Stack
          mt={3}
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
          }}
        >
          <RHFTextField
            name="amount"
            label="Amount"
            placeholder="Amount"
            type="number"
            disabled={isBillFetch}
            variant={isBillFetch ? "filled" : "outlined"}
          />
          <RHFTextField
            name="customerName"
            label="Customer Name"
            placeholder="Customer Name"
            disabled={isBillFetch}
            variant={isBillFetch ? "filled" : "outlined"}
          />
          <RHFTextField
            name="mobileNumber"
            type="number"
            label="Customer Mobile Number"
            placeholder="Customer Mobile Number"
          />
        </Stack>
        <Stack flexDirection={"row"} gap={1}>
          <LoadingButton
            variant="contained"
            size="medium"
            sx={{ whiteSpace: "nowrap" }}
            disabled={!isValid || isParentValid}
            onClick={handleOpen}
          >
            Pay Now
          </LoadingButton>
          <LoadingButton
            variant="contained"
            size="medium"
            onClick={() => {
              handleToReset();
              reset(defaultValues);
            }}
          >
            Reset
          </LoadingButton>
        </Stack>
      </Stack>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          style={{ borderRadius: "20px" }}
          width={{ xs: "100%", sm: 450 }}
          minWidth={350}
        >
          <Typography variant="h4" textAlign={"center"}>
            Confirm Details
          </Typography>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Location</Typography>
            <Typography variant="body1">{consumerData[0]?.location}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Operator</Typography>
            <Typography variant="body1">
              {consumerData[1]?.productName}
            </Typography>
          </Stack>
          {consumerData[2]?.map((item: any) => {
            for (let key in item) {
              return (
                <Stack
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  mt={2}
                >
                  <Typography variant="subtitle1">{key}</Typography>
                  <Typography variant="body1">{item[key]}</Typography>
                </Stack>
              );
            }
          })}
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Customer Name </Typography>
            <Typography variant="body1">{getValues("customerName")}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Mobile Number</Typography>
            <Typography variant="body1">{getValues("mobileNumber")}</Typography>
          </Stack>
          <Stack flexDirection={"row"} justifyContent={"space-between"} mt={2}>
            <Typography variant="subtitle1">Amount</Typography>
            <Typography variant="body1">Rs. {getValues("amount")}</Typography>
          </Stack>
          <Stack
            alignItems={"center"}
            justifyContent={"space-between"}
            mt={2}
            gap={2}
          >
            <Typography variant="h4">Confirm NPIN</Typography>
            <RHFSecureCodes
              keyName="otp"
              inputs={["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]}
            />
            {(!!errors.otp1 ||
              !!errors.otp2 ||
              !!errors.otp3 ||
              !!errors.otp4 ||
              !!errors.otp5 ||
              !!errors.otp6) && (
              <FormHelperText error sx={{ px: 2 }}>
                Code is required
              </FormHelperText>
            )}
          </Stack>
          <Stack flexDirection={"row"} gap={1} mt={2}>
            <LoadingButton
              variant="contained"
              loading={isLoading}
              disabled={!isValid}
              onClick={submit}
            >
              Confirm
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color="warning"
              onClick={handleClose}
            >
              Close
            </LoadingButton>
          </Stack>
          {/* )} */}
        </Box>
      </Modal>
    </FormProvider>
  );
};
