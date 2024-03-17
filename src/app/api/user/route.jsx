import supabase from "@/supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, user_id } = body;

    const { data, error } = await supabase.from("user").insert({
      email,
      user_id,
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
