import { Stack, Typography } from "@mui/material";
import Chart from "react-apexcharts";

const DonutView = (props: any) => {
  const series = [44, 55, 13, 43, 22, 55, 13, 43];

  const options: any = {
    chart: {
      type: "donut",
      height: 350,
    },
    contextMenu: {
      menu: null,
    },
    labels: [
      "Recharge",
      "Bill Payments",
      "Money Transfer",
      "Payout",
      "AEPS",
      "Aadhar Pay",
      "mATM",
      "Indo Nepal",
    ],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
          fill: {
            type: "gradient",
          },
        },
      },
    ],
  };

  return (
    <Stack>
      <Stack flexDirection="row" justifyContent="space-between" m={2}>
        <Typography variant="h6">Services </Typography>
        <select>
          <option value="option1">Today</option>
          <option value="option2">2023</option>
          <option value="option3">2024</option>
        </select>
      </Stack>
      <Stack>
        <Chart
          options={options}
          series={series}
          type="donut"
          height={props.chartHeight}
        />
      </Stack>
    </Stack>
  );
};

export default DonutView;
