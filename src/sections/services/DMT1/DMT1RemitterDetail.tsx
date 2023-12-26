import { Fragment, useState } from "react";
import Scrollbar from "../../../components/scrollbar";
// @mui
import {
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Paper,
  TableCell,
  Typography,
} from "@mui/material";
import _ from "lodash";

// ----------------------------------------------------------------------

export default function DMT1RemitterDetail({ remitterData }: any) {
  return (
    <Fragment>
      <Typography variant="h5">Remitter details fetch succesfully.</Typography>
      <TableContainer component={Paper}>
        <Scrollbar sx={{ scrollbarWidth: "thin" }}>
          <Table sx={{ minWidth: 350 }} size="small" aria-label="simple table">
            <TableBody>
              <TableRow sx={{ borderBottom: "1px Solid #00000026" }}>
                <TableCell
                  sx={{ fontWeight: 700, px: 0, width: "120px" }}
                  component="th"
                  scope="row"
                >
                  Full Name
                </TableCell>
                <TableCell>
                  {remitterData.remitterFN + " " + remitterData.remitterLN ||
                    ""}
                </TableCell>
              </TableRow>
              <TableRow sx={{ borderBottom: "1px Solid #00000026" }}>
                <TableCell
                  sx={{ fontWeight: 700, px: 0, width: "120px" }}
                  component="th"
                  scope="row"
                >
                  Mobile
                </TableCell>
                <TableCell>{remitterData.remitterMobile || ""}</TableCell>
              </TableRow>
              <TableRow sx={{ borderBottom: "1px Solid #00000026" }}>
                <TableCell
                  sx={{ fontWeight: 700, px: 0, width: "120px" }}
                  component="th"
                  scope="row"
                >
                  Occupation
                </TableCell>
                <TableCell>{remitterData.remitterOccupation || ""}</TableCell>
              </TableRow>
              <TableRow sx={{ borderBottom: "1px Solid #00000026" }}>
                <TableCell
                  sx={{ fontWeight: 700, px: 0, width: "120px" }}
                  component="th"
                  scope="row"
                >
                  Monthly Limit
                </TableCell>
                <TableCell>
                  {remitterData.airtelRemitterAvailableLimit}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Fragment>
  );
}

// ----------------------------------------------------------------------
