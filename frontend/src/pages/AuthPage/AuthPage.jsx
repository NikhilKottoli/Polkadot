import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader, Loader2Icon } from "lucide-react";

export default function AuthPage() {
  return (
    <>
      <div className="fixed inset-y-0 right-0 hidden h-screen w-2/3 object-cover object-left lg:block  p-8 pr-0">
        <img
          src="https://images.unsplash.com/photo-1687720657052-c026be7f388c?q=80&w=2785&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Login illustration"
          className="h-full w-full object-cover rounded-l-4xl"
        />
      </div>

      <main className="relative z-10 mx-auto h-screen px-6 py-12 lg:grid lg:w-screen lg:max-w-full lg:grid-cols-2 lg:gap-32 lg:px-0 flex items-center ">
        <div className="w-full  px-32">
          <div className="w-[400px] ">
            <div className="mb-1 mt-12 text-3xl  text-gray-100">
              Welcome to <span className="font-black">Polkaflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome back! Sign in to continue.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 text-sm"
              >
                <Loader2Icon className="h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 text-sm"
              >
                <Loader className="h-4 w-4" />
                Microsoft
              </Button>
            </div>

            <form className="mt-8 space-y-6">
              <div className="relative flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  Or continue with
                </span>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-4 ">
                <div className="space-y-2">
                  <Label htmlFor="email">Your email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm text-blue-300 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-12 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                className="text-blue-300 underline"
                href="/examples/forms/register3"
              >
                Create account
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
