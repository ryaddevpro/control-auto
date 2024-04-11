"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const confirmDelete = async (row, token) => {
  const client_id = row.original.client_id;
  try {
    const response = await fetch(
      `http://localhost:3000/api/client/${client_id}`,
      {
        method: "DELETE", // Specify the POST method
        headers: {
          "Content-Type": "application/json", // Set the Content-Type header if needed
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    // If you expect a response, you can handle it here
    const okResponse = await response.json();
    toast.success("client deleted avec success!");
    // table.setEditingRow(null); //exit editing mode
    // setData(sortedData(updatedData));
    return okResponse;
  } catch (error) {
    toast.error("une erreur est survenu");
    console.error("Error:", error);
  }
};

const ConfirmDialog = ({ rowClient, token }) => {
  const router = useRouter();
  return (
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Hello!</h3>
        <p className="py-4">
          Voulez-vous vraiment supprimer {rowClient?.original?.nom}{" "}
        </p>
        <div className="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn">Close</button>
            <button
              className="btn btn-danger "
              onClick={() => {
                confirmDelete(rowClient, token);
                router.refresh();
              }}
            >
              Supprimez
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
