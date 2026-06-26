import type { APIResponse } from "../../types/common.type";
import { baseApi } from "./baseApi";


export const settingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSettings: builder.query<APIResponse<Record<string, string>>, void>({
            query: () => "/settings",
            providesTags: ["Settings"]
        }),
        updateSettings: builder.mutation<APIResponse<void>, Record<string, string>>({
            query: (body) => ({
                url: "/settings",
                method: "PUT",
                body
            }),
            invalidatesTags: ["Settings", "Dashboard"]
        }),
    })
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingApi;
