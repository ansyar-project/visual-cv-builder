// next-auth type declarations
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
declare module "next-auth" {
  export interface AuthOptions {
    adapter?: Adapter;
    providers: Provider[];
    session?: {
      strategy?: "jwt" | "database";
      maxAge?: number;
      updateAge?: number;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    callbacks?: {
      jwt?: (params: {
        token: Record<string, unknown>;
        user?: { id: string };
      }) => unknown;
      session?: (params: {
        session: { user?: { id?: string } } & Record<string, unknown>;
        token: Record<string, unknown>;
      }) => unknown;
    };
    [key: string]: unknown;
  }

  export type NextAuthOptions = AuthOptions;

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
