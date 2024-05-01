import { Stack, Typography } from "@mui/material";

import Chart from "react-apexcharts";

const MonochromePieChart = (props: any) => {
  const series = [20, 55];

  const options: any = {
    chart: {
      type: "pie",
      toolbar: {
        show: false,
      },
    },
    colors: ["#FF5630", "#3498DB"],
    labels: ["InActive", "Active "],
    dataLabels: {
      enabled: true,
    },
    legend: {
      show: true,
    },
  };

  return (
    <Stack style={{ position: "relative" }}>
      <Stack style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}>
        <Typography variant="h6" sx={{ ml: 2, mt: 2 }}>
          Days/Activity
        </Typography>
      </Stack>
      <Stack style={{ paddingTop: "30px" }}>
        <Chart
          options={options}
          series={series}
          type="pie"
          height={props.chartHeight}
        />
      </Stack>
    </Stack>
  );
};

export default MonochromePieChart;
