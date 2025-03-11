'use client'
import { useState } from "react";
import { supabase } from "@/lib/supaBaseClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
        if (error.message.includes("Email not confirmed")) {
            toast.error("Verify Your Email!", {
              description: "Please check your inbox and confirm your email before signing in.",
            });
          } else {
            toast("Error Login..", {
                description: `Error: ${error.message}`,
              })  
          }
    } else {
        toast("Login Sucessfully", {
            description: "Redirecting to your dashboard",
          })
          setEmail("");
          setPassword("");
          setTimeout(() => {
            router.push("/"); // Redirect to home after success
          }, 1500);

    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignin} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded"
      />
      <Button type="submit" disabled={loading}> {loading ? "Signing In..." : "Login"}</Button>
     
    </form>
  );
};

export default Login;
