import * as Yup from "yup";
import { useCallback } from "react";
import React from "react";
import Image from "src/components/image/Image";
//image
import DATACardImage from "../../../assets/images/DATACardImage.png";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  MenuItem,
  Modal,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// auth
import { useAuthContext } from "../../../auth/useAuthContext";
import { CustomFile } from "../../../components/upload";
import { useSnackbar } from "notistack";
import FormProvider, {
  RHFSwitch,
  RHFSelect,
  RHFTextField,
} from "../../../components/hook-form";
import { StyledSection } from "src/layouts/login/styles";

// ----------------------------------------------------------------------

type FormValuesProps = {
  displayName: string;
  email: string;
  photoURL: CustomFile | string | null;
  phoneNumber: string | null;
  country: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  zipCode: string | null;
  about: string | null;
  isPublic: boolean;
};

export default function DTH() {
  const [open, setModalEdit] = React.useState(false);
  const openEditModal = (val: any) => {
    setModalEdit(true);
  };
  const handleClose = () => {
    setModalEdit(false);
  };
  const { enqueueSnackbar } = useSnackbar();

  const { user, Api, UploadFileApi } = useAuthContext();

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required("Name is required"),
  });

  const defaultValues = {
    displayName: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    address: user?.address || "",
    state: user?.state || "",
    city: user?.city || "",
    zipCode: user?.zipCode || "",
    about: user?.about || "",
    isPublic: user?.isPublic || false,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar("Update success!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue("photoURL", newFile);
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid
        container
        style={{ display: "grid", gridTemplateColumns: "auto 0.9fr" }}
      >
        <Grid>
          <Typography variant="h4">Recharge your Data Card</Typography>

          <Typography variant="body2">
            Created by Distributors and associated with distributor Schemes.
          </Typography>

          <RHFTextField
            style={{ marginTop: "20px" }}
            type="number"
            name="DataCard Number"
            label="DataCard Number"
          />
          <RHFSelect
            style={{ marginTop: "20px", marginRight: "2%" }}
            name="Operator"
            label="Operator"
            placeholder="Operator"
            // InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
          >
            <MenuItem value="">
              <em>none</em>
            </MenuItem>
            <MenuItem value="Airtel">Airtel</MenuItem>
            <MenuItem value="Jio">Jio</MenuItem>
          </RHFSelect>
          <Grid style={{ marginTop: "20px", position: "relative" }}>
            <p
              style={{
                height: "98%",
                position: "absolute",
                padding: "0 10px",
                right: "0.5px",
                top: "-14px",
                background: "#FFAB00",
                fontWeight: "700",
                fontSize: "15px",
                alignItems: "center",
                display: "grid",
                placeItems: "center",
                borderRadius: "0px 8px 8px 0",
                cursor: "pointer",
                zIndex: "1",
              }}
              onClick={openEditModal}
            >
              Browse Plans
            </p>
            {/* <Iconify
              style={{ marginTop: '15px', position: 'absolute' }}
              icon="ph:currency-dollar-simple-thin"
            /> */}
            <RHFTextField type="number" name="Amount" label="Amount" />
          </Grid>
          <RHFSelect
            style={{ marginTop: "20px" }}
            name="Circle"
            label="Circle"
            placeholder="Circle"
            // InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false, sx: { textTransform: "capitalize" } }}
          >
            <MenuItem value="UttarPradesh">Uttar Pradesh</MenuItem>
            <MenuItem value="Uttrakhand">Uttrakhand</MenuItem>
          </RHFSelect>
          <RHFTextField
            style={{ marginTop: "20px" }}
            type="number"
            name="Recharge Type"
            label="Recharge Type"
          />
          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#000000",
              mt: 5,
              color: (theme) =>
                theme.palette.mode === "light" ? "common.white" : "grey.800",
              "&:hover": {
                bgcolor: "#00AB55",
                color: (theme) =>
                  theme.palette.mode === "light" ? "common.white" : "grey.800",
              },
            }}
          >
            Submit
          </LoadingButton>
        </Grid>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Grid
            item
            xs={12}
            md={8}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              outline: "none",
            }}
          >
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: "repeat(1, 1fr)",
                }}
              >
                <p>Browse Plan PopUp</p>
              </Box>
            </Card>
          </Grid>
        </Modal>
        <StyledSection>
          <Image disabledEffect visibleByDefault src={DATACardImage} alt="" />
        </StyledSection>
      </Grid>
    </FormProvider>
  );
}
