// @mui
import {
  Paper,
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
} from "@mui/material";
import {
  DatePicker,
  CalendarPicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
// hooks
import useResponsive from "../../hooks/useResponsive";
//
import { DateRangePickerProps } from "./types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// ----------------------------------------------------------------------

export default function DateRangePicker({
  title = "Select date range",
  variant = "input",
  //
  startDate,
  endDate,
  //
  onChangeStartDate,
  onChangeEndDate,
  //
  open,
  onClose,
  //
  isError,
}: DateRangePickerProps) {
  const isDesktop = useResponsive("up", "md");

  const isCalendarView = variant === "calendar";

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : "xs"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            isDesktop && {
              overflow: "unset",
            }),
        }}
      >
        <Stack
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && isDesktop ? "row" : "column"}
          justifyContent="center"
          sx={{
            pt: 1,
            "& .MuiCalendarPicker-root": {
              ...(!isDesktop && {
                width: "auto",
              }),
            },
          }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "divider",
                  borderStyle: "dashed",
                }}
              >
                <CalendarPicker date={startDate} onChange={onChangeStartDate} />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "divider",
                  borderStyle: "dashed",
                }}
              >
                <CalendarPicker date={endDate} onChange={onChangeEndDate} />
              </Paper>
            </>
          ) : (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start date"
                  inputFormat="DD/MM/YYYY"
                  value={dayjs(startDate)}
                  onChange={onChangeStartDate}
                  renderInput={(params: any) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End date"
                  inputFormat="DD/MM/YYYY"
                  value={dayjs(endDate)}
                  onChange={onChangeEndDate}
                  renderInput={(params: any) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </>
          )}
        </Stack>

        {isError && (
          <FormHelperText sx={{ color: "error.main", px: 2 }}>
            End date must be later than start date
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button disabled={isError} variant="contained" onClick={onClose}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
