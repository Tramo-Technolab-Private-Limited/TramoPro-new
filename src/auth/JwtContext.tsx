import {
  createContext,
  useEffect,
  useReducer,
  useCallback,
  useState,
} from "react";
// utils
import axios from "../utils/axios";

import {
  ActionMapType,
  AuthStateType,
  AuthUserType,
  JWTContextType,
} from "./types";
import { Api } from "src/webservices";
import { useNavigate } from "react-router";
import { fetchLocation } from "src/utils/fetchLocation";

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
  logOut: false,
  user: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    return {
      isInitialized: true,
      logOut: false,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGIN) {
    return {
      ...state,
      isAuthenticated: true,
      logOut: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.STEPS) {
    return {
      ...state,
      isAuthenticated: true,
      logOut: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      isAuthenticated: true,
      logOut: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.UPDATE_USER) {
    return {
      ...state,
      isAuthenticated: true,
      logOut: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      isAuthenticated: false,
      logOut: true,
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
  const [location, setLocation] = useState<boolean | null>(null);

  const initialize = useCallback(async () => {
    let location = await fetchLocation();
    if (location.coords.latitude && location.coords.longitude) {
      setLocation(true);
    } else {
      setLocation(false);
    }
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";
      if (token) {
        await Api(`auth/userData`, "GET", "", token).then((Response: any) => {
          if (Response.status === 200) {
            if (Response.data.code === 200) {
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
          } else {
            localStorage.removeItem("token");
            dispatch({
              type: Types.LOGOUT,
            });
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
      dispatch({
        type: Types.LOGOUT,
      });
    }
  }, []);

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
    localStorage.setItem("authentication", "true");
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
