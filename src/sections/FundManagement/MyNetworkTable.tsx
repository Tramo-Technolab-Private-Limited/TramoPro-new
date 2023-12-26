// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  CardProps,
  Button,
  Typography,
  TableContainer,
  Modal,
  TextField,
  Grid,
} from "@mui/material";
// components
import Scrollbar from "src/components/scrollbar/Scrollbar";
import { TableHeadCustom } from "src/components/table";
import { PATH_DASHBOARD } from "src/routes/paths";

import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { Api } from "src/webservices";
import { useSnackbar } from "notistack";
import { fDateTime } from "src/utils/formatTime";

// ----------------------------------------------------------------------

type RowProps = {
  cashTxnCharge: string;
  createAt: string;
  depositAmount: string;
  reference: string;
  slip: string;
  status: string;
  toAccountName: string;
  toAccountno: string;
  toifsc: string;
  transactionDate: string;
  transactionId: string;
  transactionType: string;
  transferFrom: string;
  _id: string;
  name: string;
  email: string;
  avatar: string;
  firstName: string;
  documentname: string;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
  gopro: any;
}

export default function MyNetworkTable({
  title,
  subheader,
  tableData,
  tableLabels,
  gopro,
  ...other
}: Props) {
  return (
    <Card {...other}>
      {/* <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} /> */}

      <TableContainer sx={{ overflow: "unset" }}>
        <Scrollbar>
          <Table sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <MyNetworkTableRow key={row._id} row={row} gopro={gopro} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type MyNetworkTableRowProps = {
  row: RowProps;
  gopro: any;
};
// sd
function MyNetworkTableRow({ row, gopro }: MyNetworkTableRowProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = React.useState(false);
  const handleOpen = (val: any) => setOpen(true);
  const handleClose = () => setOpen(false);
  const [rowId, setRowId] = React.useState("");
  const [comment, setComment] = React.useState("");

  const action = (val: any) => {
    let token = localStorage.getItem("token");
    let body = {
      _id: rowId,
      status: val,
      comment: comment,
      userCode: "Admin",
    };
    Api("agent/updateStatus", "POST", body, token).then((Response: any) => {
      console.log("==========>>product Filter", Response);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          enqueueSnackbar(Response.data.message);
          handleClose();
          console.log("=====product filter code 200", Response.data.data);
        } else {
          console.log("==============>>> post mobile number", Response.massage);
        }
      }
    });
  };

  return (
    <>
      <TableRow
        hover
        sx={{ borderBottom: "1px solid #00000012" }}
        onClick={() => setRowId(row._id)}
      >
        <TableCell>
          <Stack direction="row" alignItems="center">
            <Avatar alt={row.name} src={row.avatar} />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2"> {row.firstName} </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {row.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {fDateTime(row.createAt)}
              </Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>{row.reference}</TableCell>
        <TableCell sx={{ textTransform: "uppercase" }}>
          {row.transactionType}
        </TableCell>
        <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap" }}>
          {row.transferFrom ? row.transferFrom : "-"}
        </TableCell>
        <TableCell>{row.toAccountno}</TableCell>
        <TableCell>{row.transactionId}</TableCell>
        <TableCell>{row.depositAmount}</TableCell>
        <TableCell>{row.cashTxnCharge}</TableCell>
        <TableCell onClick={handleOpen} sx={{ cursor: "pointer" }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>
            {row.slip ? "1 Attachment" : "No Attachment"}
          </Typography>
          <Typography sx={{ whiteSpace: "nowrap" }}>
            {row.documentname.slice(15)}
          </Typography>
        </TableCell>
        {gopro == 0 ? (
          <TableCell sx={{ textAlign: "center" }}>
            <Button variant="contained" onClick={handleOpen}>
              View
            </Button>
          </TableCell>
        ) : (
          <TableCell sx={{ textTransform: "uppercase" }}>
            {row.status}
          </TableCell>
        )}
      </TableRow>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Grid
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            bgcolor: "#ffffff",
            boxShadow: 24,
            p: 4,
            borderRadius: "20px",
          }}
        >
          <Grid sx={{ height: "500px", margin: "auto" }}>
            <img
              src={row.slip || "/assets/illustrations/dummy.png"}
              style={{ borderRadius: "8px", height: "100%" }}
            ></img>
          </Grid>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            placeholder="Notes"
            sx={{ my: 3 }}
            onChange={(e) => setComment(e.target.value)}
          />
          <Stack flexDirection={"row"}>
            <Button
              variant="contained"
              size="medium"
              sx={{ m: 0.2 }}
              onClick={() => action("approved")}
            >
              Approved
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="medium"
              sx={{ m: 0.2 }}
              onClick={() => action("clarification")}
            >
              Ask for Clarification
            </Button>
            <Button
              variant="contained"
              color="error"
              size="medium"
              sx={{ m: 0.2 }}
              onClick={() => action("rejected")}
            >
              Rejected
            </Button>
          </Stack>
        </Grid>
      </Modal>
    </>
  );
}
