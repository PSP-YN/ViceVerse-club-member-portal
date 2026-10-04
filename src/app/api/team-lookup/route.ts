import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const lookupSchema = z.object({
  qr: z.string().optional(),
  id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "club_member") {
      return NextResponse.json(
        { error: "Access denied. Club Member role required." },
        { status: 403 }
      );
    }

    // 3. Parse query params
    const { searchParams } = new URL(request.url);
    const params = lookupSchema.safeParse({
      qr: searchParams.get("qr") ?? undefined,
      id: searchParams.get("id") ?? undefined,
    });

    if (!params.success || (!params.data.qr && !params.data.id)) {
      return NextResponse.json(
        { error: "Provide either qr or id parameter" },
        { status: 400 }
      );
    }

    // 4. Look up team
    const baseQuery = supabase
      .from("teams")
      .select(
        `id, team_id, team_name, domain, payment_status,
         members ( id, name, email, role, registration_status, registration_at, goodies_status, goodies_at, lunch_status, lunch_at, snacks_status, snacks_at )`
      );

    const { data: team, error: teamError } = params.data.qr
      ? await baseQuery.eq("qr_token", params.data.qr).single()
      : await baseQuery.eq("team_id", params.data.id!).single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.payment_status !== "approved") {
      return NextResponse.json(
        { error: "Team is not yet approved" },
        { status: 403 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Team lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
