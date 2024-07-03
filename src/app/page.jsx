import React from "react";
import { Toaster } from "react-hot-toast";
import ClientTableWithProviders from "@/components/gestion-client/table";
import CreateUserModal from "@/components/modals/create-user-modal";

export const revalidate = 0;

export const getData = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/client`, {
      method: "GET",
      headers: headers,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data?.clients;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const sortedData = (data) => {
  return data.slice().sort((a, b) => {
    // Convert the date strings to Date objects for comparison
    const dateA = a.updated_at ? new Date(a.updated_at) : null;
    const dateB = b.updated_at ? new Date(b.updated_at) : null;

    // Handle null values
    if (!dateA && !dateB) return 0; // Both are null, consider them equal
    if (!dateA) return 1; // If dateA is null, move it to the end
    if (!dateB) return -1; // If dateB is null, move it to the beginning

    // Compare the dates
    return dateB - dateA;
  });
};

export default async function Home() {
  const data = (await getData()) || [];

  const sortedData = data.slice().sort((a, b) => {
    // Convert the date strings to Date objects for comparison
    const dateA = a.updated_at ? new Date(a.updated_at) : null;
    const dateB = b.updated_at ? new Date(b.updated_at) : null;

    // Handle null values
    if (!dateA && !dateB) return 0; // Both are null, consider them equal
    if (!dateA) return 1; // If dateA is null, move it to the end
    if (!dateB) return -1; // If dateB is null, move it to the beginning

    // Compare the dates
    return dateB - dateA;
  });

  return (
    <React.Fragment>
      <Toaster position="top-right" reverseOrder={false} />
      <header className="my-12">
        <h1 className="text-4xl text-center font-semibold font-serif">
          Gestion Client
        </h1>
      </header>

      <div className="m-6">
        <div className="flex justify-end w-full my-2">
          <CreateUserModal />
        </div>
        <ClientTableWithProviders data={sortedData} />
      </div>
    </React.Fragment>
  );
}
