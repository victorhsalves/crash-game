import type { AuthenticatedUser } from "@crash/auth";
import type { Socket } from "socket.io";

export interface AuthenticatedSocketData {
  user: AuthenticatedUser;
}

export type AuthenticatedSocket = Socket & {
  data: AuthenticatedSocketData;
};
