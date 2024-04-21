import { auth } from "@clerk/nextjs";
import React from "react";
import { Toaster } from "react-hot-toast";
import FinanciereTableWithProviders from "@/components/gestion-financiere/table";
import CreateUserModal from "@/components/modals/create-user-modal";

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
      "http://localhost:3000/api/gestion_financiere",
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
  const data = await getData();

  const sortedData = data.slice().sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at) : null;
    const dateB = b.updated_at ? new Date(b.updated_at) : null;

    // Handle null values
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Compare the dates
    return dateB - dateA;
  });

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <header className="my-12">
        <h1 className="text-4xl text-center font-semibold font-serif">
          Gestion Financiere
        </h1>
      </header>

      <div className="m-6">
        <div className="flex justify-end w-full my-2">
          <CreateUserModal />
        </div>
        <FinanciereTableWithProviders data={data} />
      </div>
    </React.Fragment>
  );
}
