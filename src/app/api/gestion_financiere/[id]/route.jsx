import supabase from "@/supabase/connection";
import { auth } from "@clerk/nextjs";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request, { params }) {
  try {
    const { userId } = auth();

    const { data: sortie, error } = await supabase
      .from("sortie")
      .select()
      .eq("user_id", userId);

    if (error) {
      throw new Error("Failed to fetch payment history");
    }

    return Response.json({ sortie });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch payment history", { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = auth();

    const dataFromBody = await request.json();

    const { data, error } = await supabase.from("sortie").insert({
      user_id: userId,
      amount: +dataFromBody?.amount,
      description: dataFromBody.description,
    });
    if (error) {
      console.log(error);
      throw new Error("Failed to post data");
    }
    return Response.json({ data });
  } catch (error) {
    console.error("Error posting data:", error.message);
    return Response.error("Failed to posting payment history", { status: 500 });
  }
}



