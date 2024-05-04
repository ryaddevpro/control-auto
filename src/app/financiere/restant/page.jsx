import { auth } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "react-hot-toast";
import ClientTableWithProviders from "@/components/gestion-client/table";

export const revalidate = 0;

export const getData = async (token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const { getToken } = auth();

      const authToken = await getToken();
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/gestion_financiere/restant`,
      {
        method: "GET",
        headers: headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data?.paymant_restant;
  } catch (error) {
    console.error("Error:", error);
  }
};

export default async function Home() {
  const data = (await getData()) || [];

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <header className="my-12">
        <h1 className="text-4xl text-center font-semibold font-sans">
          Client Restant
        </h1>
        <div className="text-center w-full">
          client qui n&apos;ont pas tous paye
        </div>
      </header>

      <div className="m-6">
        <div className="flex justify-end w-full my-2">
          {/* <CreateUserModal /> */}
        </div>
        <ClientTableWithProviders data={data} />
      </div>
    </React.Fragment>
  );
}
