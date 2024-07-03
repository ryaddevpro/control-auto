"use client";
import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { FaHistory } from "react-icons/fa";
import { sortedData } from "@/app/page";
import Sortie from "./sortie";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const Table = ({ initialData }) => {
  const [data, setData] = useState(initialData); // State to hold data
  console.log(initialData);
  const [confirmModal, setConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const handleDeleteRecord = async (deleteRecordId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/gestion_financiere/${deleteRecordId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      const updatedData = data.filter((record) => record.id !== deleteRecordId);
      setData(updatedData);
      setConfirmModal(false);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(initialData); // Update data when initialData changes
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [initialData]);

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
        accessorKey: "entree",
        header: "Entrée",
        // enableEditing: false,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.nom,
          helperText: validationErrors?.nom,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nom: undefined,
            }),
        },
      },

      {
        accessorKey: "sortie",
        header: "Sortie",
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
                <Sortie
                  close={handleClose}
                  open={open}
                  user_id={cell.row.original.id}
                />
              }
              {cell.getValue()}
            </Box>
          );
        },
        muiEditTextFieldProps: {
          type: "int",
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
        accessorKey: "benefice",
        header: "Bénéfice",
        enableEditing: false,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.nom,
          helperText: validationErrors?.nom,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nom: undefined,
            }),
        },
        Cell: ({ cell }) => {
          return (
            <Box
              component="span"
              className={`flex gap-2 items-center ${
                +cell.getValue() > 0 ? "text-green-500" : "text-red-500"
              } `}
            >
              {cell.getValue()}
            </Box>
          );
        },
      },

      {
        accessorKey: "date",
        header: "date",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.prenom,
          helperText: validationErrors?.prenom,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              prenom: undefined,
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
        `${process.env.NEXT_PUBLIC_URL}/api/client/${client_id}`,
        {
          method: "PUT", // Specify the POST method
          headers: {
            "Content-Type": "application/json", // Set the Content-Type header if needed
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
      setData(sortedData(updatedData));

      return okResponse;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    localization: {
      noRecordsToDisplay: "Aucun client enregistré",
      showHideSearch: "Recherche",
      showHideFilters: "Filters",
      showHideColumns: "Afficher/Masquer colonnes",
      toggleFullScreen: "Plein écran",
      toggleDensity: "Zoomer / Dézoomer",
    },

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
          width: "200px",
        }}
      >
        <Button
          //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
          onClick={handleExportData}
          startIcon={<FileDownloadIcon sx={{ width: "18px" }} />} // Adjust the icon size here
          sx={{ fontSize: "12px", lineHeight: "1.4" }}
        >
          Enregistrer les données clients{" "}
        </Button>
      </Box>
    ),

    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Modifier">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            color="error"
            onClick={() => {
              setConfirmModal(true);
              setDeleteRecordId(row.id);
              document.getElementById("my_modal_3")?.showModal();
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Hello!</h3>
            <p className="py-4">
              Voulez-vous vraiment supprimer la gestion financiere
            </p>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
                <button
                  className="btn btn-danger "
                  onClick={() => {
                    handleDeleteRecord(deleteRecordId);
                  }}
                >
                  Supprimez
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
};

const FinanciereTableWithProviders = ({ data }) => {
  return (
    //Put this with your other react-query providers near root of your app
    <>
      <Table initialData={data} />
    </>
  );
};

export default FinanciereTableWithProviders;

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
    prenom: !validateRequired(user.prenom) ? "Prénom is Required" : "",
    email: !validateEmail(user.email) ? "Incorrect Email Format" : "",
  };
}
