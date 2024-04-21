"use client";
import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { auth, useAuth } from "@clerk/nextjs";
import { getData, sortedData } from "@/app/page";
import PaymentHistory from "../payment-history";
import toast from "react-hot-toast";
import ConfirmDeleteDialog from "../modals/confirm-delete-modal";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Table = ({ initialData }) => {
  const [data, setData] = useState(initialData); // State to hold data
  const [confirmModal, setConfirmModal] = useState(false);
  const [token, setToken] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(initialData); // Update data when initialData changes
        const token = await getToken();
        setToken(token);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error state here, for example:
        // setErrorMessage("Failed to fetch data. Please try again.");
      }
    };

    fetchData();
  }, [initialData, getToken]);

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "client_id",
        header: "N°",
        enableColumnFilter: true,
        enableEditing: false,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.id,
          helperText: validationErrors?.id,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              id: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "nom",
        header: "Nom",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.nom,
          helperText: validationErrors?.nom,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nom: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },

      {
        accessorKey: "prenom",
        header: "Prenom",

        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.prenom,
          helperText: validationErrors?.prenom,

          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              prenom: undefined,
            }),
        },
      },
      {
        accessorKey: "cin",
        header: "cin",
        muiEditTextFieldProps: {
          type: "cin",
          required: true,
          error: !!validationErrors?.cin,
          helperText: validationErrors?.cin,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              cin: undefined,
            }),
        },
      },
      {
        accessorKey: "prix_total",
        header: "prix_total",
        muiEditTextFieldProps: {
          type: "prix_total",
          required: true,
          error: !!validationErrors?.prix_total,
          helperText: validationErrors?.prix_total,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              prix_total: undefined,
            }),
        },
      },
      {
        accessorKey: "prix_restant",
        header: "prix_restant",
        enableEditing: false,
        Cell: ({ cell }) => {
          const [getClientId, setGetClientId] = useState(null);
          const [open, setOpen] = useState(false);
          const handleOpen = () => setOpen(true);
          const handleClose = () => setOpen(false);

          return (
            <Box component="span" className="flex gap-2 items-center">
              <button
                size="small"
                onClick={() => {
                  handleOpen();
                  setGetClientId(cell.row.original.client_id);
                }}
              >
                <FaHistory />
              </button>
              {
                <PaymentHistory
                  clientId={getClientId}
                  open={open}
                  close={handleClose}
                  prix_total={cell.row.original.prix_total}
                />
              }
              {cell.getValue()}
            </Box>
          );
        },
        muiEditTextFieldProps: {
          type: "prix_restant",
          required: true,
          error: !!validationErrors?.prix_restant,
          helperText: validationErrors?.prix_restant,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              prix_restant: undefined,
            }),
        },
      },
      {
        accessorKey: "date_exam",
        header: "date_exam",
        muiEditTextFieldProps: {
          type: "date",
          required: true,
          error: !!validationErrors?.date_exam,
          helperText: validationErrors?.date_exam,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              date_exam: undefined,
            }),
        },
      },
      {
        accessorKey: "num_tel",
        header: "num_tel",
        muiEditTextFieldProps: {
          type: "num_tel",
          required: true,
          error: !!validationErrors?.num_tel,
          helperText: validationErrors?.num_tel,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              num_tel: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  //UPDATE action
  const handleSaveUser = async ({ values, table }) => {
    const { client_id } = values;

    try {
      const response = await fetch(
        `http://localhost:3000/api/client/${client_id}`,
        {
          method: "PUT", // Specify the POST method
          headers: {
            "Content-Type": "application/json", // Set the Content-Type header if needed
            Authorization: `Bearer ${await getToken()}`,
          },
          // Add body if you want to send data along with the POST request
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      // If you expect a response, you can handle it here
      const okResponse = await response.json();
      table.setEditingRow(null); //exit editing mode
      const updatedData = await getData(await getToken());
      setData(sortedData(updatedData));

      return okResponse;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //DELETE action
  const openDeleteConfirmModal = async (row) => {
    // const client_id = row.original.client_id;
    // try {
    //   const response = await fetch(
    //     `http://localhost:3000/api/client/${client_id}`,
    //     {
    //       method: "DELETE", // Specify the POST method
    //       headers: {
    //         "Content-Type": "application/json", // Set the Content-Type header if needed
    //         Authorization: `Bearer ${await getToken()}`,
    //       },
    //     }
    //   );
    //   if (!response.ok) {
    //     throw new Error("Failed to fetch data");
    //   }
    //   // If you expect a response, you can handle it here
    //   const okResponse = await response.json();
    //   toast.success("client deleted avec success!");
    //   table.setEditingRow(null); //exit editing mode
    //   const updatedData = await getData(await getToken());
    //   setData(sortedData(updatedData));
    //   return okResponse;
    // } catch (error) {
    //   toast.error("une erreur est survenu");
    //   console.error("Error:", error);
    // }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,

    getRowId: (row) => row.id,
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          padding: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          //export all rows, including from the next page, (still respects filtering and sorting)
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          startIcon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          startIcon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),

    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => {
              setConfirmModal(true);
              document.getElementById("my_modal_2")?.showModal();
              openDeleteConfirmModal(row);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        {<ConfirmDeleteDialog rowClient={row} token={`${token}`} />}
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};

const ClientTableWithProviders = ({ data }) => {
  return (
    //Put this with your other react-query providers near root of your app

    <Table initialData={data} />
  );
};

export default ClientTableWithProviders;

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateUser(user) {
  return {
    nom: !validateRequired(user.nom) ? "Nom is Required" : "",
    prenom: !validateRequired(user.prenom) ? "Prenom is Required" : "",
    email: !validateEmail(user.email) ? "Incorrect Email Format" : "",
  };
}
