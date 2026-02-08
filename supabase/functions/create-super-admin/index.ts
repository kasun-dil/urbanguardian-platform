import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    
    const superAdminEmail = Deno.env.get("SUPER_ADMIN_EMAIL");
    const superAdminPassword = Deno.env.get("SUPER_ADMIN_PASSWORD");
    
    // Validate against stored credentials
    if (email !== superAdminEmail || password !== superAdminPassword) {
      return new Response(
        JSON.stringify({ error: "Invalid super admin credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if super admin already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const superAdminUser = existingUser?.users?.find(u => u.email === superAdminEmail);

    let userId: string;

    if (superAdminUser) {
      userId = superAdminUser.id;
      // Update the password for existing user
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: superAdminPassword }
      );
      if (updateError) {
        console.error("Error updating password:", updateError);
      }
    } else {
      // Create the super admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: superAdminEmail,
        password: superAdminPassword,
        email_confirm: true,
        user_metadata: { full_name: "Super Admin", role: "super_admin" }
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Ensure super admin is in super_admins table
    const { error: insertError } = await supabaseAdmin
      .from("super_admins")
      .upsert({ user_id: userId, email: superAdminEmail }, { onConflict: "user_id" });

    if (insertError) throw insertError;

    // Update user_roles to super_admin
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "super_admin" }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({ success: true, message: "Super admin configured successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
