import supabase from "@/supabase/connection";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request, { params }) {
  try {
    const { paymentId } = params;

    const { data: clientPayments, error } = await supabase
      .from("paymenthistory")
      .select(
        `*, client:client_id(*)
    `
      )
      .eq("client_id", paymentId);

    if (error) {
      throw new Error("Failed to fetch payment history");
    }

    return Response.json({ clientPayments });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return Response.error("Failed to fetch payment history", { status: 500 });
  }
}
