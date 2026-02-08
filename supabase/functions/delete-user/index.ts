import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      return json(500, { error: "Server misconfiguration" });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Missing authorization header" });
    }

    const token = authHeader.slice("Bearer ".length);

    // Client 1: user-context client (validates JWT + respects RLS if we need it)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("getClaims error:", claimsError);
      return json(401, { error: "Unauthorized - Invalid token" });
    }

    const callerUserId = claimsData.claims.sub;

    // Client 2: service role client for privileged ops
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify caller is a super admin
    const { data: superAdminData, error: superAdminError } = await adminClient
      .from("super_admins")
      .select("id")
      .eq("user_id", callerUserId)
      .maybeSingle();

    if (superAdminError) {
      console.error("super admin lookup error:", superAdminError);
      return json(500, { error: "Authorization check failed" });
    }

    if (!superAdminData) {
      return json(403, { error: "Only super admins can delete users" });
    }

    const payload = await req.json().catch(() => ({}));
    const userIdToDelete = payload?.userId;

    if (!userIdToDelete) {
      return json(400, { error: "User ID is required" });
    }

    if (userIdToDelete === callerUserId) {
      return json(400, { error: "Cannot delete your own admin account" });
    }

    // Prevent deleting other super admins
    const { data: targetSuperAdmin, error: targetSuperAdminError } = await adminClient
      .from("super_admins")
      .select("id")
      .eq("user_id", userIdToDelete)
      .maybeSingle();

    if (targetSuperAdminError) {
      console.error("target super admin lookup error:", targetSuperAdminError);
      return json(500, { error: "Target validation failed" });
    }

    if (targetSuperAdmin) {
      return json(400, { error: "Cannot delete another super admin" });
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userIdToDelete);
    if (deleteError) {
      console.error("deleteUser error:", deleteError);
      return json(500, { error: deleteError.message });
    }

    return json(200, { success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Unhandled error:", error);
    return json(500, { error: error?.message ?? "Internal error" });
  }
});
