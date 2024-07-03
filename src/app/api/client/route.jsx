import connectToDatabase from "../../../mysql/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  const connection = await connectToDatabase();

  if (!connection) {
    return new Response("Failed to connect to database", { status: 500 });
  }

  try {
    const [clients] = await connection.execute(
      "SELECT * FROM client WHERE isDeleted = ?",
      [false]
    );
    await connection.end();

    return new Response(JSON.stringify({ clients }), { status: 200 });
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
      const nom = dataFromBody.nom || null;
      const prenom = dataFromBody.prenom || null;
      const cin = dataFromBody.cin || null;
      const num_tel = dataFromBody.num_tel || null;
      const date_exam = dataFromBody.date_exam || null;
      const prix_total = dataFromBody.prix_total !== undefined ? parseFloat(dataFromBody.prix_total) : null;
      const prix_paye = dataFromBody.prix_paye !== undefined ? parseFloat(dataFromBody.prix_paye) : null;
      const prix_restant = prix_total - prix_paye;

      // Check that required fields are provided
      if (!nom || !prenom || !cin || !num_tel || prix_total === null || prix_paye === null) {
          return new Response("Invalid data: All client fields must be provided", { status: 400 });
      }

      // Begin a transaction
      await connection.beginTransaction();

      // Insert the new client into the 'client' table
      const [insertClientResult] = await connection.execute(
          `INSERT INTO client (nom, prenom, cin, num_tel, date_exam, prix_total, prix_paye, prix_restant, created_at, updated_at, isDeleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
          [nom, prenom, cin, num_tel, date_exam, prix_total, prix_paye, prix_restant]
      );

      const client_id = insertClientResult.insertId;

      // Insert the payment history into the 'paymenthistory' table
      const [insertPaymentHistoryResult] = await connection.execute(
          `INSERT INTO paymenthistory (client_id, amount, created_at, updated_at)
           VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [client_id, prix_paye]
      );

      // Calculate the sum of sortie amounts for the client
      const [sortieSumResult] = await connection.execute(
          `SELECT COALESCE(SUM(amount), 0) AS total_sortie
           FROM sortie
           WHERE client_id = ?`,
          [client_id]
      );

      const total_sortie = sortieSumResult[0].total_sortie;

      // Insert or update the entry in 'gestion_financiere' for tracking the new client's financials
      const date = new Date().toISOString().slice(0, 10);  // Current date
      const description = `Initial financial entry for client ${client_id}`;

      const [upsertGestionResult] = await connection.execute(
          `INSERT INTO gestion_financiere (date, entree, sortie, description, created_at, updated_at, benefice)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
           ON DUPLICATE KEY UPDATE 
              entree = entree + VALUES(entree),
              sortie = sortie + VALUES(sortie),
              benefice = entree - sortie,
              updated_at = CURRENT_TIMESTAMP`,
          [date, prix_paye, total_sortie, description, prix_paye - total_sortie]
      );

      // Commit the transaction
      await connection.commit();
      await connection.end();

      return new Response(JSON.stringify({ client: insertClientResult, gestion_financiere: upsertGestionResult, payment_history: insertPaymentHistoryResult }), {
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
