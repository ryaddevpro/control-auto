import { auth, useAuth } from "@clerk/nextjs";
import { Box, IconButton, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

const addSortie = async (token = null, user_id, dataSortie) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const authToken = await getToken();
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/gestion_financiere/${user_id}`,
      {
        method: "POST",
        headers: headers,
        cache: "no-cache",
        body: JSON.stringify(dataSortie),
      }
    );

    if (!response.ok) {
      toast.error("il y a une erreur");
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    toast.success("client mis a jour");
    return data?.clientPayments;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const getData = async (token = null, userId) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const authToken = await getToken();
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/gestion_financiere/${userId}`,
      {
        method: "GET",
        headers: headers,
        cache: "no-cache",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data?.sortie;
  } catch (error) {
    console.error("Error:", error);
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("fr", { month: "long" }).format(date);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

const Sortie = ({ user_id, open, close, prix_total }) => {
  const { getToken } = useAuth();
  const [data, setData] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await addSortie(await getToken(), user_id, data);
      reset(); // Reset the form
      fetchData(); // Refetch the data
      router.refresh();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%", // Adjusted width to 80% of the viewport width
    maxWidth: "600px", // Set a maximum width if needed
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
    borderRadius: 2, // Adding borderRadius to make it rounded
  };

  const fetchData = useMemo(
    () => async () => {
      try {
        const clientPayments = await getData(await getToken(), user_id);
        setData(clientPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [user_id, getToken]
  );

  useEffect(() => {
    if (user_id) {
      fetchData();
    }
  }, [user_id, fetchData]);

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className=""
    >
      <Box sx={style}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={close}>
            <IoClose />
          </IconButton>
        </Box>
        <h2 className="text-lg font-semibold font-sans">Sortie</h2>
        <p className="text-md text-sm text-gray-600 tracking-wide">Un champ pour enregistrer les dépenses quotidiennes, afin de calculer ultérieurement le bénéfice</p>

        <form onSubmit={handleSubmit(onSubmit)} className="py-4 flex flex-col gap-3 ">
          <div className="flex justify-center gap-x-4 w-full">
            <div className="flex gap-4 justify-end w-full">
              <div className="w-full">
                <label className="flex-grow w-full input-bordered flex items-center gap-2">
                  <input
                    type="text"
                    className="input input-bordered w-full text-sm "
                    placeholder="Description de la sortie example: essence, assurance, impot,..."
                    {...register("description", {})}
                  />
                </label>
                <p className="text-red-500">
                  {errors?.description && <span>Ce champ est obligatoire</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-end w-full">
              <div className="w-full"> 
                <label className="flex-grow flex items-center gap-2 w-full">
                  <input
                    type="number"
                    className="grow input-bordered input w-full text-xs "
                    placeholder="Le montant de vos dépenses ? (400, 500)"
                    {...register("amount", { required: true })}
                  />
                </label>
                <p className="text-red-500">
                  {errors?.amount && <span>Ce champ est obligatoire</span>}
                </p>
              </div>
            </div>
          </div>
          <button className="btn self-end btn-secondary" type="submit">
            ajouter
          </button>
        </form>

        <div className="overflow-x-auto bg-white">
          <table className="table bg-white">
            {/* head */}
            <thead>
              <tr>
                <th>date</th>
                <th>description</th>

                <th>sortie</th>
              </tr>
            </thead>
            <tbody>
              {data.map((x, index) => {
                return (
                  <tr key={index} className="bg-base-200">
                    <td>{formatDate(x?.created_at)}</td>
                    <td>{x?.description}</td>
                    <td>{x?.amount}DH</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  );
};

export default Sortie;
