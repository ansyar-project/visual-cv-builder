// next-auth type declarations
declare module "next-auth" {
  export interface AuthOptions {
    adapter?: any;
    providers: any[];
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
      jwt?: (params: { token: any; user?: any }) => any;
      session?: (params: { session: any; token: any }) => any;
    };
    [key: string]: any;
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
