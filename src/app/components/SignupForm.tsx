'use client'
import { useState } from "react";
import { supabase } from "../../../lib/supaBaseClient";
import { toast } from "sonner";

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error  } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast("Error signing up..", {
        description: `Error: ${error.message}`,
      })
      setError(error.message);
      
    } else {
      toast("Signup Sucessfully", {
        description: "You are one step closer to building amazing resume",
        action: {
          label: "Go to Login page",
          onClick: () => console.log("Login"),
        },
      })
      setEmail("");
      setPassword("");
      
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default SignupForm;
