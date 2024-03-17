import supabase from "@/supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  try {
    const { data: clients, error } = await supabase.from("client").select();


    if (error) {
      throw new Error("Failed to fetch data");
    }
    return Response.json({ clients });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  }
}