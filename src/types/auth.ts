// types/auth.ts
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  remember: boolean;
  role: string | string[];
  phoneExt: string;
  password: string;
  cell: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  token: string;
  admin: AuthUser;
}