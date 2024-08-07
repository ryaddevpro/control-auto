import React from "react";
import { Toaster } from "react-hot-toast";
import FinanciereTableWithProviders from "@/components/gestion-financiere/table";

export const revalidate = 0;

export const getData = async (token = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    

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
  const newData = data.map(item => ({
    ...item,
    benefice: item.entree - item.sortie
  }));
  

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <header className="my-12">
        <h1 className="text-4xl text-center font-semibold font-serif">
        Entrée / Sortie
        </h1>
      </header>

      <div className="m-6">
        <div className="flex justify-end w-full my-2">
          {/* <CreateUserModal /> */}
        </div>
        <FinanciereTableWithProviders data={newData} />
      </div>
    </React.Fragment>
  );
}
