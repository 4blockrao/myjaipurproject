import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  ticket_count: number;
  user_id?: string;
  utm_source?: string;
  ref_page?: string;
  device_type?: string;
  locality?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RegistrationRequest = await req.json();
    console.log("Registration request received:", { 
      event_id: body.event_id, 
      email: body.email,
      ticket_count: body.ticket_count 
    });

    // Validate required fields
    if (!body.event_id) {
      return new Response(
        JSON.stringify({ error: "Event ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.email || !body.email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.name || body.name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Name is required (minimum 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ticketCount = body.ticket_count || 1;
    if (ticketCount < 1 || ticketCount > 10) {
      return new Response(
        JSON.stringify({ error: "Ticket count must be between 1 and 10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, is_free, ticket_price, max_tickets, tickets_sold")
      .eq("id", body.event_id)
      .single();

    if (eventError || !event) {
      console.error("Event fetch error:", eventError);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check ticket availability
    const availableTickets = event.max_tickets 
      ? event.max_tickets - (event.tickets_sold || 0)
      : 1000; // Default high number if no limit

    if (ticketCount > availableTickets) {
      return new Response(
        JSON.stringify({ error: `Only ${availableTickets} tickets available` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate registration
    const { data: existingReg } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", body.event_id)
      .eq("email", body.email.toLowerCase().trim())
      .single();

    if (existingReg) {
      return new Response(
        JSON.stringify({ error: "You have already registered for this event" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate registration code
    const { data: registrationCode, error: codeError } = await supabase.rpc(
      "generate_registration_code"
    );

    if (codeError) {
      console.error("Code generation error:", codeError);
      return new Response(
        JSON.stringify({ error: "Failed to generate registration code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate total amount
    const totalAmount = event.is_free ? 0 : (event.ticket_price || 0) * ticketCount;

    // Create registration
    const { data: registration, error: insertError } = await supabase
      .from("event_registrations")
      .insert({
        event_id: body.event_id,
        user_id: body.user_id || null,
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone?.trim() || null,
        ticket_count: ticketCount,
        total_amount: totalAmount,
        registration_code: registrationCode,
        status: event.is_free ? "confirmed" : "pending_payment",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Registration insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create registration. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update tickets sold count
    const { error: updateError } = await supabase
      .from("events")
      .update({ tickets_sold: (event.tickets_sold || 0) + ticketCount })
      .eq("id", body.event_id);

    if (updateError) {
      console.error("Ticket count update error:", updateError);
      // Don't fail the registration, just log it
    }

    console.log("Registration successful:", {
      registration_id: registration.id,
      code: registrationCode,
      tickets: ticketCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        registration: {
          id: registration.id,
          registration_code: registrationCode,
          event_title: event.title,
          ticket_count: ticketCount,
          total_amount: totalAmount,
          status: registration.status,
        },
        message: event.is_free
          ? "Registration successful! Show your code at the venue."
          : "Registration created. Please complete payment to confirm.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
