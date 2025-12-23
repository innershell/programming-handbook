When building from a Loveable generated website you'll apply the following strategy.

# 1. Database and API Setup

Extract the table structure and API endpoints necessary using the `static/src/integrations/supabase/types.ts` file. Xano handles permission at the API level, there will not be Row Level Security (RLS).

1. Establish a list of tables, their fields, and relationships. All string `id` fields should use `int`, as Xano does not support string primary keys.
2. Create these tables in Xano, ensuring that field types and relationships are accurately represented.
3. The `types.ts` file also contains the endpoints used to interact with the Supabase backend. List them and list their expected input (type and optionality)
4. Create these endpoints in Xano following Xano best practices.
5. Ensure the user pushes the tables and endpoints to Xano created before proceeding to the frontend development.

# 2. Frontend Development

Here the goal is to replace the Supabase integration with a Xano integration interfacing the newly created Xano backend.

!!!IMPORTANT!!!
ENSURE YOU PULL THE LATEST API SPECIFICATIONS FROM XANO USING THE `get_xano_api_specifications` TOOL BEFORE PROCEEDING.
!!!IMPORTANT!!!

1. Retrieve the current Xano API specifications using the `get_xano_api_specifications` tool.
2. Analyze the specifications to understand the endpoints, methods, authentication, and data structures.
3. Build a xano client to interact with the Xano API in `static/src/integrations/xano/client.ts` it will host the Xano client code.

```ts
// import the xano types
import { User, ... } from "./types";

export class XanoClient {
  // pull the URL of the different api groups from the OpenAPI spec
  // and add them below
  private authenticationUrl = `https://<Xano-Server-URL>/abcd-1234`;
  // private bookUrl = `https://<Xano-Server-URL>/efgh-5678`;
  // ... other api groups

  constructor(private authToken: string | null) {
    this.updateAuthToken(authToken);
  }

  updateAuthToken(token: string | null) {
    this.authToken = token;
    localStorage.setItem("authToken", token || "");
  }

  // Add all the API methods you need below

  /**
   * Fetch the current authenticated user
   * @returns The authenticated user or null if not authenticated
   */
  async auth_me(): Promise<User> {
    const response = await fetch(`${this.authenticationUrl}/auth/me`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Not authenticated");
    }
  }

  /**
   * Log in a user with email and password
   * @param email User's email
   * @param password User's password
   * @param options Optional parameters (matches the supabase options)
   * @returns The authentication token and user data
   */
  async auth_signup(
    name: string,
    email: string,
    password: string,
    options?: {
      /**
       * Optional URL to redirect the user to after email confirmation
       */
      emailRedirectTo?: string,
    },
  ): Promise<string> {
    const response = await fetch(`${this.authenticationUrl}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    if (response.ok) {
      const { authToken } = await response.json();
      if(options.emailRedirectTo) {
        setTimeout(() => {
          window.location.href = options.emailRedirectTo!;
        }, 1000); // Redirect after 1 second
      }
      return authToken;
    } else {
      throw new Error("Signup failed");
    }
  }

  // Add other methods as needed
  // async book_getAll():Promise<Book[]> { ... }
  // async book_create(...):Promise<Book> { ... }
  // async order_create(...):Promise<Order> { ... }
  // ...
}

export const xanoClient = new XanoClient(localStorage.getItem("authToken"));
```

# 3. Add the useXanoAuth.tsx hook to manage authentication

```tsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { xanoClient } from "@/integrations/xano/client";
import { User } from "@/integrations/xano/types";

export function useXanoAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current user on mount
    const fetchUser = async () => {
      try {
        const user = await xanoClient.auth_me();
        setUser(user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const signOut = async () => {
    await setUser(null);
    xanoClient.updateAuthToken(null);
  };

  retur {
    user,
    loading,
    signOut,
  };
}
```

This should allow you to replace the supabase version with the xano version in `static/src/pages/Index.tsx`:

```tsx
import { useAuth } from "@/hooks/useAuth";
```

with the new Xano version:

```tsx
import { useXanoAuth } from "@/hooks/useXanoAuth";
```

and proceed to use the `useXanoAuth` hook instead of the `useAuth` hook.

## 4. Replace all Supabase calls with Xano calls

Look for all the `supabase.functions.invoke(...)` calls and replace them with the corresponding `xanoClient` calls.
For example, replace:

```ts
const { data, error } = await supabase.functions.invoke("getProfile");
```

with

```ts
const data = await xanoClient.getProfile();
```

Make sure to handle errors appropriately, as the error handling mechanisms may differ between Supabase and Xano.

!!!IMPORTANT!!!
ENSURE YOU REMOVE ALL SUPABASE DEPENDENCIES FROM THE PROJECT, IN THE CODE, INCLUDING THE `supabaseClient` INTEGRATION AND THE `supabase` PACKAGE IN `package.json`
!!!IMPORTANT!!!
