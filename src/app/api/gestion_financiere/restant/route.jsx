import supabase from "@/supabase/connection";


export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  try {
    const { data: paymant_restant, error } = await supabase
      .from("client")
      .select()
      .eq("isDeleted", false)
      .gt("prix_restant", 0); // Filter for prix_restant > 0

    if (error) {
      throw new Error("Failed to fetch data");
    }
    return Response.json({ paymant_restant });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  }
}
