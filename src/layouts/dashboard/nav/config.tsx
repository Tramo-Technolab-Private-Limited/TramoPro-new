// routes
import { PATH_DASHBOARD } from "../../../routes/paths";
// components
import SvgColor from "../../../components/svg-color";

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  user: icon("ic_user"),
  ecommerce: icon("ic_ecommerce"),
  analytics: icon("ic_analytics"),
  dashboard: icon("ic_dashboard"),
};

const NavConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: "My Stats",
    items: [
      {
        title: "Home",
        path: PATH_DASHBOARD.mystats,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: "Dashboard",
    items: [
      {
        title: "services",
        path: PATH_DASHBOARD.services,
        roles: ["agent"],
        icon: ICONS.ecommerce,
      },
      {
        title: "Network",
        path: PATH_DASHBOARD.network,
        roles: ["distributor", "m_distributor"],
        icon: ICONS.ecommerce,
      },
      {
        title: "Transactions",
        path: PATH_DASHBOARD.transaction.root,
        icon: ICONS.user,
        children: [
          {
            title: "My Transactions",
            path: PATH_DASHBOARD.transaction.mytransaction,
          },
          {
            title: "Fund Flow",
            path: PATH_DASHBOARD.transaction.fundflow,
          },
          {
            title: "Wallet Ladger",
            path: PATH_DASHBOARD.transaction.walletladger,
          },
          {
            title: "Reports",
            path: PATH_DASHBOARD.transaction.historicalreports,
          },
        ],
      },
      {
        title: "Schemes",
        path: PATH_DASHBOARD.scheme.root,
        icon: ICONS.user,
        children: [
          {
            title: "All Scheme",
            path: PATH_DASHBOARD.scheme.allscheme,
          },
          {
            title: "BBPS Scheme",
            path: PATH_DASHBOARD.scheme.bbpsscheme,
          },
          {
            title: "Loan Scheme",
            path: PATH_DASHBOARD.scheme.loanscheme,
          },
        ],
      },
      {
        title: "Fund Management",
        path: PATH_DASHBOARD.fundmanagement.root,
        icon: ICONS.user,
        children: [
          {
            title: "My Fund Deposits",
            path: PATH_DASHBOARD.fundmanagement.myfunddeposits,
          },
          {
            title: "AEPS settlement",
            roles: ["agent"],
            path: PATH_DASHBOARD.fundmanagement.aepssettlement,
          },
          {
            title: "Bank Accounts",
            path: PATH_DASHBOARD.fundmanagement.mybankaccount,
          },
          {
            title: "Manage Fund Flow",
            roles: ["distributor", "m_distributor"],

            path: PATH_DASHBOARD.fundmanagement.managefundflow,
          },
          {
            title: "My Fund Requests",
            path: PATH_DASHBOARD.fundmanagement.myfundrequest,
          },
        ],
      },
      {
        title: "Setting",
        path: PATH_DASHBOARD.setting,
        icon: ICONS.ecommerce,
      },
      {
        title: "Help & Support",
        path: PATH_DASHBOARD.helpsupport,
        icon: ICONS.ecommerce,
      },
    ],
  },
];

export default NavConfig;
