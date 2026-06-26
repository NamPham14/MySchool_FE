/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { logout, setAuth, setUserProfile } from "../authSlice"; // Thêm setUserProfile vào đây
import type { APIResponse, AuthResponse } from "../../types/common.type";
import type { UserProfileResponse } from "../../types/user.type";

interface LoginRequest {
  phoneNumber: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  password: string;
  otp: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: (() => {
    const url = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
    return (url.endsWith("/api") ? url : `${url}/api`).replace(/\/$/, "");
  })(),

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/v1/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      const data = refreshResult.data as APIResponse<AuthResponse>;
      const newAccessToken = data?.data?.token;
      const newRefreshToken = data?.data?.refreshToken || refreshToken;

      if (newAccessToken) {
        api.dispatch(
          setAuth({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: customBaseQuery,
  tagTypes: [
    "Users",
    "Roles",
    "Dashboard",
    "Settings",
    "MyInfo",
    "Classes",
    "Semesters",
    "Subjects",
    "Assignments",
    "Events",
    "Leaves",
    "Timetables",
    "Notifications",
  ],
  endpoints: (builder) => ({
    login: builder.mutation<APIResponse<AuthResponse>, LoginRequest>({
      query: (loginData) => ({
        url: "/v1/auth/login",
        method: "POST",
        body: loginData,
      }),
    }),

    getMyInfo: builder.query<APIResponse<UserProfileResponse>, void>({
        query: () => "/users/profile",
        providesTags: [{ type: "MyInfo", id: "CURRENT_USER" }],
        async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled;
                if (data.data) {
                    dispatch(setUserProfile(data.data as any));
                }
            } catch (err) {
                console.error("Failed to sync user profile:", err);
            }
        },
    }),

    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/v1/auth/logout",
        method: "POST",
      }),
    }),

    register: builder.mutation<APIResponse<void>, RegisterRequest>({
      query: (userData) => ({
        url: "/v1/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    uploadImage: builder.mutation<APIResponse<string>, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMyInfoQuery,
  useRegisterMutation,
  useLogoutMutation,
  useUploadImageMutation,
} = baseApi;
