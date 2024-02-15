import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { sentenceCase, sentenceCaseTransform } from "change-case";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import EditIcon from "src/assets/icons/EditIcon";
import Label from "src/components/label/Label";
import { TableHeadCustom } from "src/components/table";
import { fCurrency } from "src/utils/formatNumber";
import { fDate, fToNow } from "src/utils/formatTime";
import { fundRequestProps } from "./types";

type props = {
  tableData: fundRequestProps[];
};

function FundDepositeTable({ tableData }: props) {
  const { enqueueSnackbar } = useSnackbar();
  const tableLabels = [
    { id: "depositor", label: "Deposited TO" },
    { id: "Ref", label: "#UTR/Payment Reference Number" },
    { id: "RequestType", label: "Request Mode" },
    { id: "From", label: "Amount" },
    { id: "tobank", label: "Charge/Commission" },
    { id: "depositormobile", label: "Status" },
    { id: "amount", label: "Edit" },
  ];

  return (
    <Card>
      {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

      <TableContainer sx={{ overflow: "unset" }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom headLabel={tableLabels} />

          <TableBody>
            {tableData.map((row: any) => (
              <FundRequestTable key={row._id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default FundDepositeTable;

const FundRequestTable = ({ row }: any) => {
  console.log(fToNow(row.createdAt));
  return (
    <TableRow key={row?._id} hover>
      <TableCell>
        <Typography>{row?.bankId?.bank_details?.bank_name}</Typography>
        <Typography>{fDate(row?.date_of_deposit)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{row?.transactional_details?.mobile}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{row?.modeId?.transfer_mode_name}</Typography>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status.toLowerCase() === "failed" && "error") ||
            ((row.status.toLowerCase() === "pending" ||
              row.status.toLowerCase() === "in_process") &&
              "warning") ||
            "success"
          }
          sx={{ textTransform: "capitalize" }}
        >
          {fCurrency(row?.amount)}
        </Label>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={row.Charge !== "NA" ? "error" : "success"}
          sx={{ textTransform: "capitalize" }}
        >
          {fCurrency(row.Charge !== "NA" ? row.Charge : row.Commission)}
        </Label>
      </TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            ((row.status.toLowerCase() === "failed" ||
              row.status.toLowerCase() === "rejected") &&
              "error") ||
            ((row.status.toLowerCase() === "pending" ||
              row.status.toLowerCase() === "in_process") &&
              "warning") ||
            "success"
          }
          sx={{ textTransform: "capitalize" }}
        >
          {row.status ? sentenceCase(row.status) : ""}
        </Label>
      </TableCell>
      <TableCell>
        <EditIcon active={false} />
      </TableCell>
    </TableRow>
  );
};
