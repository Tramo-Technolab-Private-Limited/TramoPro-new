import {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
} from "react";
// utils
import axios from "../utils/axios";
//
import { isValidToken, setSession } from "./utils";
import {
  ActionMapType,
  AuthStateType,
  AuthUserType,
  JWTContextType,
} from "./types";
import { Api } from "src/webservices";

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

enum Types {
  INITIAL = "INITIAL",
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  LOGOUT = "LOGOUT",
  STEPS = "STEPS",
  UPDATE_USER = "UPDATE_USER",
}

type Payload = {
  [Types.INITIAL]: {
    isAuthenticated: boolean;
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.STEPS]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.UPDATE_USER]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.STEPS) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.UPDATE_USER) {
    return {
      ...state,
      isAuthenticated: true,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext<JWTContextType | null>(null);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [location, setLocation] = useState<boolean | null>(true);

  const initialize = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";
      if (token) {
        await Api(`auth/userData`, "GET", "", token).then((Response: any) => {
          if ((Response.status = 200)) {
            if (Response.data.code == 200) {
              if (Response.data.data.userData == null) {
                localStorage.removeItem("token");
                dispatch({
                  type: Types.LOGOUT,
                });
              } else {
                dispatch({
                  type: Types.INITIAL,
                  payload: {
                    isAuthenticated: true,
                    user: {
                      ...Response.data.data.userData,
                      attendanceAEPS: Response.data.data.attendanceAEPS,
                      attendanceAP: Response.data.data.attendanceAP,
                      m_distCode: Response.data.data.m_distCode,
                    },
                  },
                });
              }
            } else {
              localStorage.removeItem("token");
              dispatch({
                type: Types.LOGOUT,
              });
            }
          }
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }: any) => {
        localStorage.setItem("lat", coords.latitude);
        localStorage.setItem("long", coords.longitude);
      },
      (error) => {
        setLocation(true);
      }
    );
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => localStorage.setItem("ip", data.ip));
  }, [localStorage.getItem("token")]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  //UPSATE USER
  const UpdateUserDetail = async (val: any) => {
    dispatch({
      type: Types.UPDATE_USER,
      payload: {
        user: { ...state.user, ...val },
      },
    });
  };

  // LOGIN
  const login = async (token: string, user: any) => {
    console.log(token, user);
    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...user.userData,
          attendanceAEPS: user.userData.attendanceAEPS,
          attendanceAP: user.userData.attendanceAP,
          m_distCode: user.userData.m_distCode,
        },
      },
    });
    localStorage.setItem("token", token);
  };

  // REGISTER
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const response = await axios.post("/api/account/register", {
      email,
      password,
      firstName,
      lastName,
    });
    const { token, user } = response.data;

    localStorage.setItem("token", token);

    dispatch({
      type: Types.REGISTER,
      payload: {
        user,
      },
    });
  };

  // LOGOUT
  const logout = async () => {
    localStorage.removeItem("token");
    dispatch({
      type: Types.LOGOUT,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        location,
        initialize,
        login,
        loginWithGoogle: () => {},
        loginWithGithub: () => {},
        loginWithTwitter: () => {},
        logout,
        register,
        UpdateUserDetail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
