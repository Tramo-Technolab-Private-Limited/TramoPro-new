// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { TextField, TextFieldProps } from "@mui/material";

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
};

export default function RHFMobileNumber({ name, ...other }: Props) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          // autoComplete="off"
          size="small"
          fullWidth
          value={
            !!name.match(/mobile/i) ? field.value?.slice(0, 10) : field.value
          }
          error={!!error}
          helperText={error?.message}
          inputProps={{
            maxLength: 10,
            type: "number",
          }}
          {...other}
        />
      )}
    />
  );
}
