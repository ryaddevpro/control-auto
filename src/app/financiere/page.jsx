import { auth } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "react-hot-toast";
import FinanciereTableWithProviders from "@/components/gestion-financiere/table";
import CreateUserModal from "@/components/modals/create-user-modal";
import Image from "next/image";
import Link from "next/link";

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
      `${process.env.NEXT_PUBLIC_URL}/api/gestion_financiere`,
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
    return data?.gestion_financiere;
  } catch (error) {
    console.error("Error:", error);
  }
};

export default async function Home() {
  const data = (await getData()) || [];

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <header className="my-12"></header>

      <div className="container mx-auto py-24 flex justify-center flex-col items-center">
        <h2 className="text-2xl font-bold mb-12 text-center ">
          Gestion financière
        </h2>
        <div className="flex items-center justify-center gap-8">
          <Link
            href="/financiere/entre-sortie"
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 overflow-hidden">
              <Image
                className="w-full h-full"
                alt="Entrées / Sorties"
                height="120"
                src="/entre_sortie.png"
                width="120"
              />
            </div>
            <span className="text-lg font-semibold">Entrées / Sorties</span>
          </Link>
          <Link
            href="/financiere/restant"
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 overflow-hidden">
              <Image
                className="w-full h-full"
                alt="Paiements restants"
                height="120"
                src="/payment_restant.jpg"
                width="120"
              />
            </div>
            <span className="text-lg font-semibold">Paiements restants</span>
          </Link>
        </div>
      </div>
      {/* <FinanciereTableWithProviders data={data} /> */}
    </React.Fragment>
  );
}
