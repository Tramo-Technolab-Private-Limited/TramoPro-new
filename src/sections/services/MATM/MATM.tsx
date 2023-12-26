import { Helmet } from "react-helmet-async";
import React from "react";
import { useEffect, useState } from "react";
import { paramCase } from "change-case";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import RechargeImg from "../../assets/Recharges/RechargeTopUp.png";
import { useForm } from "react-hook-form";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { Icon } from "@iconify/react";

// @mui
import {
  Grid,
  Tabs,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputAdornment,
  FormLabel,
  Tab,
  styled,
  Modal,
  Card,
  Box,
  Table,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  Stack,
  Typography,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableCell,
  MenuItem,
  CircularProgress,
  Hidden,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";

import { useSnackbar } from "notistack";
import { Translation } from "react-i18next";

export default function MATM(props: any) {
  return (
    <>
      <Helmet>
        <title>MATM </title>
      </Helmet>
      <Box
        sx={{
          border: "1px light #000",
          borderRadius: "4px",
          // backgroundColor: '#f0f0f0',
          // padding: '1px',
        }}
      >
        <Grid sx={{ display: "grid", placeItems: "center", height: "25vh" }}>
          <iframe
            src="https://embed.lottiefiles.com/animation/4529"
            style={{ border: "none", margin: "auto" }}
          ></iframe>
        </Grid>
        <Typography variant="inherit" fontSize={"20px"} textAlign={"center"}>
          To use MATM service please download our Android App.
        </Typography>
        <Grid>
          <Stack
            flexDirection={"row"}
            alignItems={"center"}
            sx={{
              backgroundColor: "black",
              width: "fit-content",
              margin: "5% auto",
              padding: "2px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            <Stack>
              <Icon
                icon="logos:google-play-icon"
                fontSize={"40px"}
                color={"white"}
              />
            </Stack>
            <Stack
              color={"#fff"}
              margin={"0 10px"}
              padding={"0px -1px 0px -1px"}
            >
              <Typography
                fontSize={"13px"}
                fontFamily={"Arial, Helvetica, sans-serif"}
              >
                GET IT ON
              </Typography>
              <Typography
                fontSize={"20px"}
                fontFamily={"Arial, Helvetica, sans-serif"}
              >
                Google Play
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------
