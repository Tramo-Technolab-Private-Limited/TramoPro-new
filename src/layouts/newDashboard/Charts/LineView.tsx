import { Stack, Typography } from "@mui/material";
import Chart from "react-apexcharts";

function LineView(props: any) {
  const chartData: any = {
    series: [
      {
        name: "Series 1",
        data: [35, 80, 65, 50, 19, 60, 20, 91, 125],
      },
      {
        name: "Series 2",
        data: [90, 30, 45, 30, 49, 30, 70, 91, 15],
      },
      {
        name: "Series 3",
        data: [40, 90, 5, 40, 79, 60, 40, 31, 25],
      },
      {
        name: "Series 4",
        data: [110, 40, 15, 90, 59, 60, 80, 31, 55],
      },
      {
        name: "Series 5",
        data: [50, 10, 65, 20, 49, 90, 70, 50, 25],
      },
    ],
    options: {
      chart: {
        id: "line-chart",
        stroke: {
          curve: "straight",
        },
        toolbar: {
          show: true,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
            customIcons: [],
          },
        },
        labels: {
          offsetY: -20, // Adjust this value as needed to position the labels properly
          show: true,
          style: {
            colors: "#333",
            fontSize: "12px",
          },
        },
      },
      contextMenu: {
        menu: null,
      },

      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
        ],
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
      },
    },
  };

  return (
    <Stack>
      <Stack flexDirection="row" justifyContent="space-between" m={2}>
        <Typography variant="h6">Services </Typography>
        <select>
          <option value="option1">2022</option>
          <option value="option2">2023</option>
          <option value="option3">2024</option>
        </select>
      </Stack>

      <Stack>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={props.chartHeight}
        />
      </Stack>
    </Stack>
  );
}

export default LineView;
