import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const markActivitySchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  activity: z.enum(["registration", "goodies", "lunch", "snacks"]),
  teamId: z.string().uuid("Invalid team ID"),
});

const activityFields: Record<string, { status: string; by: string; at: string }> = {
  registration: {
    status: "registration_status",
    by: "registration_by",
    at: "registration_at",
  },
  goodies: {
    status: "goodies_status",
    by: "goodies_by",
    at: "goodies_at",
  },
  lunch: {
    status: "lunch_status",
    by: "lunch_by",
    at: "lunch_at",
  },
  snacks: {
    status: "snacks_status",
    by: "snacks_by",
    at: "snacks_at",
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate the request
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify club_member role (server-side check)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "club_member") {
      return NextResponse.json(
        { error: "Access denied. Club Member role required." },
        { status: 403 }
      );
    }

    // 3. Validate request body
    const body = await request.json();
    const parseResult = markActivitySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { memberId, activity, teamId } = parseResult.data;
    const fields = activityFields[activity];

    // 4. SERVER-SIDE DUPLICATE CHECK
    // Fetch member and verify team membership + current status
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select(`id, team_id, registration_status, goodies_status, lunch_status, snacks_status`)
      .eq("id", memberId)
      .single();

    // Cast to dynamic record for activity field access
    const memberRecord = member as Record<string, unknown> | null;

    if (memberError || !memberRecord) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Verify member belongs to the specified team
    if (memberRecord.team_id !== teamId) {
      return NextResponse.json(
        { error: "Member does not belong to this team" },
        { status: 403 }
      );
    }

    // Duplicate check at the backend level
    if (memberRecord[fields.status]) {
      return NextResponse.json(
        {
          error: `${activity} has already been marked as completed for this member.`,
          alreadyCompleted: true,
        },
        { status: 409 }
      );
    }

    const timestamp = new Date().toISOString();
    const performedBy = profile.full_name || user.email || "Club Member";

    // 5. Update member status
    const updateData = {
      [fields.status]: true,
      [fields.by]: performedBy,
      [fields.at]: timestamp,
    };

    const { error: updateError } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", memberId)
      // Extra guard: only update if status is still false (race condition protection)
      .eq(fields.status, false);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update member status" },
        { status: 500 }
      );
    }

    // 6. Create audit log
    const { error: auditError } = await supabase.from("audit_logs").insert({
      performed_by: user.id,
      performed_by_name: performedBy,
      team_id: teamId,
      member_id: memberId,
      activity: activity,
      action: "marked_complete",
      timestamp: timestamp,
    });

    if (auditError) {
      // Log but don't fail the request — the primary action succeeded
      console.error("Audit log error:", auditError);
    }

    return NextResponse.json({
      success: true,
      activity,
      memberId,
      performed_by: performedBy,
      timestamp,
    });
  } catch (error) {
    console.error("Mark activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
