import connectToDatabase from "@/mysql/connection";

export const dynamic = "force-dynamic"; // defaults to auto

// GET Request: Fetch all records from the 'sortie' table

export async function GET(request, { params }) {
  let connection;
  const { id } = params;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      return new Response("Failed to connect to database", { status: 500 });
    }

    // Fetch all records from the 'sortie' table linked to gestion_financiere
    const [rows] = await connection.execute(
      "SELECT * FROM sortie WHERE gestion_financiere_id = ?",
      [id]
    );

    await connection.end();

    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return new Response("Failed to fetch data", { status: 500 });
  }
}
export async function POST(request) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      return new Response("Failed to connect to database", { status: 500 });
    }

    const dataFromBody = await request.json();
    const client_id =
      dataFromBody.client_id !== undefined
        ? parseInt(dataFromBody.client_id)
        : 3;
    const amount =
      dataFromBody.amount !== undefined
        ? parseFloat(dataFromBody.amount)
        : null;
    const description = dataFromBody.description || null;
    const date = dataFromBody.date || new Date().toISOString().slice(0, 10);
    const date_sortie = dataFromBody.date_sortie || null;
    const sortie_date = dataFromBody.sortie_date || null;

    // Validate amount and client_id
    if (amount < 0 || client_id === null || client_id < 0) {
      return new Response(
        "Invalid data: amount cannot be negative and client_id must be provided",
        { status: 400 }
      );
    }

    // Begin transaction
    await connection.beginTransaction();

    // Insert or update the entry in 'gestion_financiere'
    const [upsertResult] = await connection.execute(
      `INSERT INTO gestion_financiere (date, entree, description, created_at, updated_at)
       VALUES (?, ?, 'Daily financial update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE entree = entree, updated_at = CURRENT_TIMESTAMP`,
      [date, amount]
    );

    const gestion_financiere_id = upsertResult.insertId;

    // Insert the new sortie into the 'sortie' table
    const [insertResult] = await connection.execute(
      `INSERT INTO sortie (client_id, description, amount, date, date_sortie, sortie_date, created_at, updated_at, gestion_financiere_id)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
      [
        client_id,
        description,
        amount,
        date,
        date_sortie,
        sortie_date,
        gestion_financiere_id,
      ]
    );

    // Commit transaction
    await connection.commit();
    await connection.end();

    return new Response(JSON.stringify({ data: insertResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    console.error("Error posting data:", error.message);
    return new Response("Failed to post data", { status: 500 });
  }
}


export async function DELETE(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      return new Response("Failed to connect to database", { status: 500 });
    }

    const { id } = params; // Assuming id is passed in the request parameters

    // Begin a transaction
    await connection.beginTransaction();

    // Delete the records from 'sortie' by gestion_financiere_id
    const [deleteSortieResult] = await connection.execute(
      "DELETE FROM sortie WHERE gestion_financiere_id = ?",
      [id]
    );

    // Delete the record from 'gestion_financiere' by id
    const [deleteGestionFinanciereResult] = await connection.execute(
      "DELETE FROM gestion_financiere WHERE id = ?",
      [id]
    );

    // Commit the transaction
    await connection.commit();
    await connection.end();

    return new Response(
      JSON.stringify({
        deletedSortieRows: deleteSortieResult.affectedRows,
        deletedGestionFinanciereRows: deleteGestionFinanciereResult.affectedRows,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
      await connection.end();
    }
    console.error("Error deleting data:", error.message);
    return new Response("Failed to delete data", { status: 500 });
  }
}
