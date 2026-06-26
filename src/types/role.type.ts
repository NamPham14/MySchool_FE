import type { APIResponse, PageResponse } from "./common.type";

export interface RoleResponse {
  id: number;
  name: string;
}
export type RolePageResponse = APIResponse<PageResponse<RoleResponse>>