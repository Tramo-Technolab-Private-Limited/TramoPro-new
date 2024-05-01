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
                    : props?.Status == "failed" || props?.Status == "initiated"
                    ? FailedNew
                    : props?.Status == "pending"
                    ? PendingNew
                    : ""
                }
              />
            </Stack>
            <Typography gutterBottom variant="h5" color="000000">
              {props?.Status}
            </Typography>
          </Stack>
          <Typography variant="caption">Transaction Vol.</Typography>
          <Typography variant="h6" color="000000">
            ₹ {props.amount}
          </Typography>
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
              padding: "4px",
              color: "white",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ paddingLeft: 2, paddingRight: 2 }}
            >
              <Typography variant="caption">Transaction Count</Typography>
              <Typography variant="overline">
                {props.noOfTransaction}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

export default CustomCard;
