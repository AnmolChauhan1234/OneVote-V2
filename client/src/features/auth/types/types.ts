
import { Role } from "@/constants/roles";
import { UserType } from "@/constants/userTypes";
import {User} from "@/types/index"


// USER_TYPES STARTS HERE
export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface LoginResponse {
  message: string;
  user_id: string;
  role: Role;
  user_type: UserType;
  org_ids: string[];
}

export type LogoutResponse = MessageResponse;

// USER_TYPE ENDS HERE

// ADMIN TYPES STARTS HERE
export type CreateAdminResponse = User;
export type ListAllAdminResponse = User[];
export type ListAllUserAdminResponse=User[];
export type BlockUserResponse = MessageResponse;
export type SuspendUserResponse = MessageResponse;
export type DeleteUserResponse = MessageResponse;
// ADMIN TYPES ENDS HERE

// OTP TYPES STARTS HERE
export type OTPResponse = MessageResponse;
// OTP TYPES ENDS HERE

// USER_ORG TYPES STARTS HERE
export interface UserOrgIdentifierResponse {
  org_id: string;
  identifier_value: string;
  id: string;
  user_id: string;
}

export interface ListUserOrgIdentifiersResponse {
  identifiers: UserOrgIdentifierResponse[];
}

export type UserOrgIdentifierUpdateResponse = UserOrgIdentifierResponse;

export type UserOrgIdentifierDeleteResponse = MessageResponse;
// USER_ORG TYPES ENDS HERE

// COMMON TYPES STARTS HERE
export interface MessageResponse {
  message: string;
  test_otp?: string;
}
// COMMON TYPES ENDS HERE


