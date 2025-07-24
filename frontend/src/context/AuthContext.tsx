import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Update this to match your User type
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  referal: string;
  points: number;
  role: "admin" | "student" | "employee";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    userData: Omit<User, "id" | "role"> & { password: string }
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  employee_login: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user data");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Special case for admin login (hardcoded)
      if (email === "admin@sankalp.com" && password === "admin") {
        const adminUser: User = {
          id: "1",
          name: "Admin User",
          email,
          phone: "1234567890",
          role: "admin",
        };
        setUser(adminUser);
        localStorage.setItem("user", JSON.stringify(adminUser));
        setLoading(false);
        return;
      }

      console.log("Attempting login with:", email);

      // Regular student login via API
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Convert API response to match our User type
      const loggedInUser: User = {
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        referal: data.user.referal,
        points: data.user.points,
        role: "student", // API users are always students
      };

      console.log("Setting user state with:", loggedInUser);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: Omit<User, "id" | "role"> & { password: string }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto-login after successful registration if desired
      // Otherwise, just return without setting the user

      // If you want auto-login, uncomment below:
      /*
      const newUser: User = {
        ...userData,
        id: data.userId.toString(),
        role: 'student',
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.error("Registration error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const employee_login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", email);

      // Regular student login via API
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/employee_login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Convert API response to match our User type
      const loggedInUser: User = {
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        referal: data.user.referal,
        points: data.user.points,
        role: "employee", // API users are always students
      };

      console.log("Setting user state with:", loggedInUser);
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const employee_register = async (
    userData: Omit<User, "id" | "role"> & { password: string }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/employee_register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Auto-login after successful registration if desired
      // Otherwise, just return without setting the user

      // If you want auto-login, uncomment below:
      /*
      const newUser: User = {
        ...userData,
        id: data.userId.toString(),
        role: 'student',
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      */
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Employee Registration failed"
      );
      console.error("Employee Registration error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        employee_login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
