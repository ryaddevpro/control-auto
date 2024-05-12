"use client";
import { useEffect, useMemo, useState } from "react";
import { MRT_Localization_FR } from "material-react-table/locales/fr";
import { frFR } from "@mui/material/locale";

import {
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  createTheme,
  ThemeProvider,
  Tooltip,
  useTheme,
} from "@mui/material";
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
import { IoSearchCircleOutline } from "react-icons/io5";

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
        header: "Prénom",

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
        header: "CIN",
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
        header: "Paiement total",
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
        header: "Paiement restant",
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
        header: "numéro de téléphone",
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
        `${process.env.NEXT_PUBLIC_URL}/api/client/${client_id}`,
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
  const openDeleteConfirmModal = async (row) => {};

  const table = useMaterialReactTable({
    muiSearchTextFieldProps: {
      placeholder: "Recherche",
      sx: { minWidth: "300px" },
      title: "recherche",
      variant: "outlined",
    },

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
      save: "Enregistrer",
      cancel: "Annuler",
      sortedByColumnAsc: "Trier par ordre croissant selon {column}",
      sortByColumnDesc: "Trier par ordre décroissant selon {column}" ,
      sortByColumnAsc: "Trier par ordre croissant selon {column}",
      sortedByColumnDesc: "Trier par ordre décroissant selon {column}",
      clearSort:"Effacer le tri",
      filterByColumn:"Filter par {column}",
      clearFilter:"Effacer le Filter"
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
        {/* <Button
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
        </Button> */}
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

  return (
    <MaterialReactTable localization={MRT_Localization_FR} table={table} />
  );
};

const ClientTableWithProviders = ({ data }) => {
  const theme = useTheme(); //replace with your theme/createTheme

  return (
    //Put this with your other react-query providers near root of your app
    <ThemeProvider theme={createTheme(theme, frFR)}>
      <Table initialData={data} />
    </ThemeProvider>
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
