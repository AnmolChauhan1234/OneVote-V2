import {Role} from "@/constants/roles";
import { UserType } from "@/constants/userTypes";

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string
  email: string
  full_name: string        
  role: Role               
  user_type: UserType      
  org_ids: string[]        
  phone_number: string
  created_at: string       // ISO string
}
