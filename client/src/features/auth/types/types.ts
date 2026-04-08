
import { Role } from "@/constants/roles";
import { UserType } from "@/constants/userTypes";

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


export interface MessageResponse {
  message: string;
  test_otp?: string;
}

export interface UserOrgIdentifierResponse {
  org_id: string;
  identifier_value: string;
  id: string;
  user_id: string;
}
