import { auth } from "@clerk/nextjs";
import supabase from "../../../supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  const { userId } = auth();
  try {
    const { data: clients, error } = await supabase
      .from("client")
      .select()
      .eq("user_id", userId)
      .eq("isDeleted", false);

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
      prix_total: prix_total || null,
      prix_paye: prix_paye || null,
      prix_restant: prix_total - prix_paye || null,
      date_exam: date_exam || null,
      user_id: userId,
      num_tel: num_tel || null,
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
