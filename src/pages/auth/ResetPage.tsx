import { Helmet } from "react-helmet-async";
// sections
import Login from "../../sections/auth/Login";
import ResetPassword from "src/sections/auth/ResetPassword";

// ----------------------------------------------------------------------

export default function ResetPage() {
  return (
    <>
      <Helmet>
        <title> Reset Password | {process.env.REACT_APP_COMPANY_NAME}</title>
      </Helmet>

      <ResetPassword />
    </>
  );
}
