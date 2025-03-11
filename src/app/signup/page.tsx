
import SignupForm from "../components/SignupForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Login from "../components/LoginForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen border-amber-50 border-2 ">
      <Tabs defaultValue="Login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Login">Login</TabsTrigger>
          <TabsTrigger value="Signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="Login"><Login/></TabsContent>
        <TabsContent value="Signup"><SignupForm/></TabsContent>
      </Tabs>
    </div>
  )
}