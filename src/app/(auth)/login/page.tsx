import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — illustration */}
      <div className="hidden lg:flex flex-1 bg-[#E8EBF5] relative overflow-hidden items-center justify-center">
        {/* Decorative symbols */}
        <span className="absolute top-20 left-14 text-2xl text-gray-400 select-none">
          +
        </span>
        <span className="absolute top-36 left-36 w-4 h-4 rounded-full border-2 border-gray-300" />
        <span className="absolute top-1/3 right-24 text-2xl text-gray-400 select-none">
          +
        </span>
        <span className="absolute bottom-40 left-20 w-3 h-3 rounded-full border-2 border-gray-300" />
        <span className="absolute bottom-28 right-14 text-2xl text-gray-400 select-none">
          +
        </span>

        {/* Illustration */}
        <Image
          src="/assets/images/login-illustration.png"
          alt="Login Illustration"
          width={400}
          height={400}
          className="w-auto h-80 object-contain"
        />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:flex-none lg:w-120 bg-white flex flex-col justify-center px-10 md:px-16 py-12">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/assets/svgs/brand.svg"
            alt="Company Logo"
            width={120}
            height={40}
            className="h-10 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Login</h1>
        <p className="text-sm text-gray-500 mb-8">
          Use your company provided Login credentials
        </p>

        <LoginForm />
      </div>
    </div>
  );
}
