import { auth, useAuth } from "@clerk/nextjs";
import { Box, IconButton, Modal } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";

export const getData = async (token = null, clientId) => {
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
      `http://localhost:3000/api/payment/${clientId}`,
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

const PaymentHistory = ({ clientId, open, close }) => {
  const { userId, getToken } = useAuth();
  const [data, setData] = useState([]);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%", // Adjusted width to 80% of the viewport width
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 2,
    borderRadius: 2, // Adding borderRadius to make it rounded
  };

  const fetchData = useMemo(
    () => async () => {
      try {
        const clientPayments = await getData(await getToken(), clientId);
        setData(clientPayments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [clientId, getToken]
  );

  useEffect(() => {
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
              {/* row 1 */}
              {/* row 2 */}
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  );
};

export default PaymentHistory;

// <div>
//   <dialog id="my_modal_4" className="modal ">
//     <div className="modal-box bg-white  w-auto">
//       <form method="dialog">
//         {/* if there is a button in form, it will close the modal */}
//         <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
//           ✕
//         </button>
//       </form>
//       <div className="overflow-x-auto bg-white">
//         <table className="table bg-white">
//           {/* head */}
//           <thead>
//             <tr>
//               <th></th>
//               <th>Name</th>
//               <th>Job</th>
//               <th>Favorite Color</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((x, index) => {
//               return (
//                 <tr key={index} className="bg-base-200">
//                   <th>1</th>
//                   <td>{x.amount}DH</td>
//                   <td>{x.payment_date}</td>
//                   <td>{x.user_id}</td>
//                 </tr>
//               );
//             })}
//             {/* row 1 */}
//             {/* row 2 */}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   </dialog>
// </div>
