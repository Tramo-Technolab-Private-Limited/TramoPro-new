// ----------------------------------------------------------------------


function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "/auth";
const ROOT_STEPS = "/new";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: "/login",
  register: "/register",
};

export const STEP_DASHBOARD = {
  steps: path(ROOT_STEPS, "/user/registrationsteps"),
  esignature: path(ROOT_STEPS, "/user/esignature"),
  agreement: path(ROOT_STEPS, "/user/agreement"),
  verifyusernpin: path(ROOT_STEPS, "/user/verifyuserotp"),
  createnpin: path(ROOT_STEPS, "/user/createnpin"),
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  mystats: path(ROOTS_DASHBOARD, "/mystats"),
  services: path(ROOTS_DASHBOARD, "/services"),
  network: path(ROOTS_DASHBOARD, "/network"),
  transaction: {
    root: path(ROOTS_DASHBOARD, "/transaction"),
    mytransaction: path(ROOTS_DASHBOARD, "/transaction/mytransaction"),
    fundflow: path(ROOTS_DASHBOARD, "/transaction/fundflow"),
    walletladger: path(ROOTS_DASHBOARD, "/transaction/walletladger"),
    historicalreports: path(ROOTS_DASHBOARD, "/transaction/reports"),
  },
  scheme: {
    root: path(ROOTS_DASHBOARD, "/scheme"),
    allscheme: path(ROOTS_DASHBOARD, "/scheme/allscheme"),
    bbpsscheme: path(ROOTS_DASHBOARD, "/scheme/bbpsscheme"),
    loanscheme: path(ROOTS_DASHBOARD, "/scheme/loanscheme"),
  },
  fundmanagement: {
    root: path(ROOTS_DASHBOARD, "/fundmanagement"),
    myfunddeposits: path(ROOTS_DASHBOARD, "/fundmanagement/myfunddeposits"),
    mybankaccount: path(ROOTS_DASHBOARD, "/fundmanagement/mybankaccount"),
    aepssettlement: path(ROOTS_DASHBOARD, "/fundmanagement/aepssettlement"),
    myfundrequest: path(ROOTS_DASHBOARD, "/fundmanagement/myfundrequest"),
    Wallettowallet: path(ROOTS_DASHBOARD, "/fundmanagement/WalletToWallet"),
    managefundflow: path(ROOTS_DASHBOARD, "/fundmanagement/managefundflow"),
    mynetworkfunds: path(ROOTS_DASHBOARD, "/fundmanagement/mynetworkfunds"),
  },
  setting: path(ROOTS_DASHBOARD, "/setting"),
  helpsupport: path(ROOTS_DASHBOARD, "/helpsupport"),
  userprofilepage: path(ROOTS_DASHBOARD, "/userprofilepage"),
};
