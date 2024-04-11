import supabase from "../../../../supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request, { params }) {
  try {
    const { clientId } = params;
    const { data: notes, error } = await supabase
      .from("client")
      .select()
      .eq("client_id", clientId);

    if (error) {
      throw new Error("Failed to fetch data");
    }

    return Response.json({ notes });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { clientId } = params;
    const { error } = await supabase
      .from("client")
      .update({ isDeleted: true })
      .eq("client_id", clientId);

    if (error) {
      throw new Error("Failed to delete data");
    }

    return Response.json({ data: "ok" });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return Response.error("Failed to delete data", { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { clientId } = params;
    const data = await request.json();

    const { error } = await supabase
      .from("client")
      .update(data)
      .eq("client_id", clientId);
    if (error) {
      throw new Error("Failed to update data");
    }

    return Response.json({ data: "ok" });
  } catch (error) {
    console.error("Error deleting data:", error.message);
    return Response.error("Failed to update data", { status: 500 });
  }
}
