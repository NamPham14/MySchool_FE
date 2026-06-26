

export type Gender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface APIResponse<T> {
  status: number;
  code: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  content: T[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  phoneNumber: string;
  fullName: string;
  avatarUrl: string;
  email: string;
  rollNumber: string;
  campus: string;
  roles: string[];
}