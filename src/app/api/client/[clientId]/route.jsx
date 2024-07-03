import connectToDatabase from "../../../../mysql/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      throw new Error("Failed to connect to the database");
    }

    const { clientId } = params;
    const [rows] = await connection.execute('SELECT * FROM client WHERE client_id = ?', [clientId]);

    return Response.json({ notes: rows });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      throw new Error("Failed to connect to the database");
    }

    const { clientId } = params;
    const [result] = await connection.execute('UPDATE client SET isDeleted = true WHERE client_id = ?', [clientId]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to delete data");
    }

    return Response.json({ data: "ok" });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return Response.error("Failed to delete data", { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(request, { params }) {
  let connection;
  try {
    connection = await connectToDatabase();
    if (!connection) {
      throw new Error("Failed to connect to the database");
    }

    const { clientId } = params;
    const data = await request.json();
    const updateQuery = 'UPDATE client SET ' + Object.keys(data).map(key => `${key} = ?`).join(', ') + ' WHERE client_id = ?';
    const values = [...Object.values(data), clientId];
    
    const [result] = await connection.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      throw new Error("Failed to update data");
    }

    return Response.json({ data: "ok" });
  } catch (error) {
    console.error("Error updating data:", error.message);
    return Response.error("Failed to update data", { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
