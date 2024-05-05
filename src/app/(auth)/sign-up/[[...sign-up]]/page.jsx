"use client";
import { useState } from "react";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const createUser = async (token, user_id, email) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/user`, {
      method: "POST",
      headers: headers,
      cache: "no-store",
      body: JSON.stringify({
        user_id,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const RegisterPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  const { getToken } = useAuth();

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        email_address: email,
        password,
      });

      // send the email.
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to our pending section.
      setPendingVerification(true);
    } catch (err) {
      console.error(err);
    }
  };
  // Verify User Email Code
  const onPressVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        /*  investigate the response, to see if there was an error
           or if the user needs to complete more steps.*/
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        setActive({ session: completeSignUp.createdSessionId })
          .then(async () => await getToken())
          .then((token) => {
            console.log("----------------------token---------------------");
            console.log(token);
            return createUser(
              token,
              completeSignUp.createdUserId,
              completeSignUp.emailAddress
            );
          })
          .then(() => {
            router.push("/");
          })
          .catch((error) => {
            // Handle errors here
            console.error("Error:", error);
          });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <div className="border p-5 rounded   h-screen flex items-center justify-center  ">
      <div className="w-[25rem] bg-white shadow-2xl p-6 rounded-xl">
        <h1 className="text-2xl mb-4">Register</h1>
        {!pendingVerification && (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                placeholder="name@company.com"
                required={true}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="**********"
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                required={true}
              />
            </div>
            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Create an account
            </button>
            <div className="flex items-center justify-start ">
              <span className="box-border text-gray-600 m-0 text-sm font-normal leading-tight">
                Est ce que vous avez deja un compte
              </span>
              <Link href={`/sign-in`} className="btn btn-link px-1 font-bold">
                se conneceter
              </Link>
            </div>
          </form>
        )}
        {pendingVerification && (
          <div>
            <form className="space-y-4 md:space-y-6">
              <input
                value={code}
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                placeholder="Enter Verification Code..."
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="submit"
                onClick={onPressVerify}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Verify Email
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
