import { auth } from "@clerk/nextjs";
import supabase from "../../../supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request) {
  const { userId } = auth();
  try {
    const { data: gestion_financiere, error } = await supabase
      .from("gestion_financiere")
      .select()
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to fetch data");
    }
    return Response.json({ gestion_financiere });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch data", { status: 500 });
  }
}
