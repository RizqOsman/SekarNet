import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DemoLoginButtons } from "./AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm({ onTabChange }: { onTabChange: () => void }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Demo login function
  const handleDemoLogin = (role: string) => {
    setIsLoading(true);
    
    // Set timeouts to simulate loading
    setTimeout(() => {
      setIsLoading(false);
      
      // Redirect based on role
      if (role === "customer") {
        login("customer", "customerpassword");
      } else if (role === "technician") {
        login("tech", "techpassword");
      } else if (role === "admin") {
        login("admin", "adminpassword");
      }
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me" 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="remember-me" 
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
            )}
          />
          
          <Button variant="link" className="p-0 h-auto text-sm font-medium text-primary hover:text-blue-700">
            Forgot password?
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-primary text-white"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account? 
          <Button 
            variant="link" 
            className="p-0 h-auto ml-1 font-medium text-primary hover:text-blue-700"
            onClick={onTabChange}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </p>
      </div>
      
      <DemoLoginButtons onLogin={handleDemoLogin} />
    </Form>
  );
}
