import connectToDatabase from "@/mysql/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      throw new Error("Database connection failed");
    }

    const { paymentId } = params;

    console.log(params);

    // Execute SQL query to fetch payment history from the 'paymenthistory' table
    const [clientPayments] = await connection.execute(
      "SELECT ph.*, c.* FROM paymenthistory ph JOIN client c ON ph.client_id = c.client_id WHERE ph.client_id = ?",
      [paymentId]
    );

    return new Response(JSON.stringify({ clientPayments }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return new Response("Failed to fetch payment history", {
      status: 500,
    });
  } finally {
    if (connection) {
      await connection.end(); // Properly close the connection
    }
  }
}

export async function POST(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      throw new Error("Database connection failed");
    }

    const { paymentId } = params;
    const dataFromBody = await request.json();

    // Vérifiez que le montant du paiement n'est pas négatif
    if (dataFromBody.amount < 0) {
      return new Response("Invalid data: amount cannot be negative", { status: 400 });
    }

    // Commencez une transaction
    await connection.beginTransaction();

    // Insérez le nouveau paiement dans la table 'paymenthistory'
    const [paymentResult] = await connection.execute(
      "INSERT INTO paymenthistory (client_id, amount) VALUES (?, ?)",
      [paymentId, dataFromBody.amount]
    );

    if (paymentResult.affectedRows === 0) {
      throw new Error("Failed to post payment");
    }

    // Calculez le total payé par le client après le nouveau paiement
    const [[client]] = await connection.execute(
      "SELECT prix_total, (prix_paye + ?) AS new_prix_paye FROM client WHERE client_id = ?",
      [dataFromBody.amount, paymentId]
    );

    const prix_restant = client.prix_total - client.new_prix_paye;

    // Vérifiez que le prix restant n'est pas négatif
    if (prix_restant < 0) {
      await connection.rollback();
      return new Response("Invalid payment: resulting prix_restant cannot be negative", { status: 400 });
    }

    // Mettez à jour le prix payé et le prix restant du client
    const [updateResult] = await connection.execute(
      "UPDATE client SET prix_paye = ?, prix_restant = ? WHERE client_id = ?",
      [client.new_prix_paye, prix_restant, paymentId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error("Failed to update client");
    }

    // Validez la transaction
    await connection.commit();

    return new Response(JSON.stringify({ data: paymentResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error posting data:", error.message);
    return new Response("Failed to post payment history", {
      status: 500,
    });
  } finally {
    if (connection) {
      await connection.end(); // Properly close the connection
    }
  }
}
