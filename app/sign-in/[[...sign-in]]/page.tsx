import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center border border-sky-500/40 shadow-sm shadow-sky-950">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <Link href="/" className="font-bold text-lg tracking-tight text-white hover:text-sky-400 transition-colors">
          AegisScan
        </Link>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
