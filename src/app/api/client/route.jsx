import { auth } from "@clerk/nextjs";
import supabase from "../../../supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  const { userId } = auth();
  try {
    const { data: clients, error } = await supabase
      .from("client")
      .select()
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to fetch data");
    }
    return Response.json({ clients });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nom, prenom, cin, prix_total, prix_paye, date_exam, num_tel } =
      body;
    const { userId } = auth();

    const { data, error } = await supabase.from("client").insert({
      nom,
      prenom,
      cin,
      prix_total,
      prix_paye,
      prix_restant: prix_total - prix_paye,
      date_exam,
      user_id: userId,
      num_tel,
    });

    if (error) {
      throw new Error("Failed to insert data");
    }

    return Response.json({ data });
  } catch (error) {
    console.error("Error inserting data:", error.message);
    return Response.error("Failed to insert data", { status: 500 });
  }
}
