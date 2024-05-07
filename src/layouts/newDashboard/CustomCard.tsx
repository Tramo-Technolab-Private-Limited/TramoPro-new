import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import SuccessNew from "../../assets/dashboardIcon/Success.svg";
import FailedNew from "../../assets/dashboardIcon/Failed.svg";
import PendingNew from "../../assets/dashboardIcon/Pending.svg";
import { sentenceCase } from "change-case";

function CustomCard(props: any) {
  return (
    <>
      <Card sx={{ background: props.color }}>
        <CardContent>
          <Stack flexDirection="row" gap={1}>
            <Stack>
              <img
                src={
                  props?.Status == "success"
                    ? SuccessNew
                    : props?.Status == "failed"
                    ? FailedNew
                    : props?.Status == "pending"
                    ? PendingNew
                    : ""
                }
              />
            </Stack>
            <Typography gutterBottom variant="h5" color="000000">
              {sentenceCase(props?.Status)}
            </Typography>
          </Stack>
          <Typography variant="caption">Transaction Vol.</Typography>
          <Typography variant="h6" color="000000">
            ₹ {props.amount}
          </Typography>
          <Stack mt={1}>
            <Stack
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor:
                  props?.Status == "success"
                    ? "#36B37E"
                    : props?.Status == "failed" || props?.Status == "initiated"
                    ? "#FF5630"
                    : props?.Status == "pending"
                    ? "#FFAB00"
                    : "",
                padding: 3,
                color: "white",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ paddingLeft: 3, paddingRight: 3 }}
              >
                <Typography variant="caption" mt={0.5}>
                  Transaction Count
                </Typography>
                <Typography variant="h6">{props.noOfTransaction}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

export default CustomCard;
