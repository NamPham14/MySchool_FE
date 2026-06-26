import type { APIResponse, PageResponse, UserStatus } from "./common.type.ts";
import type { RoleResponse } from "./role.type.ts";

export interface UserResponse {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  rollNumber: string;
  campus: string;
  avatarUrl: string;
  status: UserStatus;
  roles: RoleResponse[];
}

export interface UserProfileResponse {
  id: number;
  email: string;
  fullName: string;
  rollNumber: string;
  avatarUrl: string;
  phoneNumber: string;
  campus: string;
  status: string;
  createdAt: string;
  roles?: string[]; // Thêm roles nếu cần
}

export type UserPageResponse = APIResponse<PageResponse<UserResponse>>;