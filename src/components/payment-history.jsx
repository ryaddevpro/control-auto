import { Box, IconButton, Modal } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

const addPayment = async (clientId, amount) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/payment/${clientId}`,
      {
        method: "POST",
        headers: headers,
        cache: "no-cache",
        body: JSON.stringify(amount),
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

export const getData = async (clientId) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}api/payment/${clientId}`,
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
    return data?.clientPayments;
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

const PaymentHistory = ({ clientId, open, close, prix_total }) => {
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
      await addPayment(clientId, data);
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
        const clientPayments = await getData(clientId);
        setData(clientPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [clientId]
  );

  useEffect(() => {
    console.log(data);
    if (clientId) {
      fetchData();
    }
  }, [clientId, fetchData]);

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
        <h2 className="text-lg ">
          Historique de{" "}
          <b>
            {data[0]?.client?.nom} {data[0]?.client?.prenom}
          </b>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="py-4 ">
          <div className="flex gap-4 justify-end ">
            <div>
              <label className="input flex-grow input-bordered flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="combien il va payer aujourd'hui ?"
                  {...register("amount", { required: true })}
                />
              </label>
              <p className="text-red-500">
                {errors?.amount && <span>This field is required</span>}
              </p>
            </div>
            <button className="btn btn-secondary" type="submit">
              ajouter
            </button>
          </div>
        </form>

        <div className="overflow-x-auto bg-white">
          <table className="table bg-white">
            {/* head */}
            <thead>
              <tr>
                <th>Date</th>
                <th>deja paye</th>
              </tr>
            </thead>
            <tbody>
              {data.map((x, index) => {
                return (
                  <tr key={index} className="bg-base-200">
                    <td>{formatDate(x.payment_date)}</td>
                    <td>{x.amount}DH</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <h1>
          prix restant:
          {+prix_total -
            data.reduce((total, payment) => {
              return +total + +payment.amount;
            }, 0)}
        </h1>
      </Box>
    </Modal>
  );
};

export default PaymentHistory;
