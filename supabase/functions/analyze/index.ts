import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { dayData, weekHistory, settings, suggestionHistory } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are Prashanth's personal fitness coach with full memory of his journey.

Profile:
- Age: 25, Height: 5ft9in, Started: 82kg
- Goal: Beach ready lean body
- Training started: May 12 2026

Current Targets (from user settings — use these not hardcoded values):
- Calories: ${settings.calorie_target} kcal
- Protein: ${settings.protein_target}g
- Water: ${settings.water_target}ml
- Sleep: ${settings.sleep_target} hours

Previous suggestions and outcomes:
${JSON.stringify(suggestionHistory)}

SUGGESTION RULES — strictly follow:
1. Maximum 1 suggestion per week — never more
2. Only suggest if same problem seen for 3+ consecutive weeks
3. Never suggest if last suggestion still pending implementation
4. If suggestion rejected with reason — suggest realistic alternative once only
5. If alternative also rejected — drop that topic permanently
6. If all targets on track — give zero suggestions and say so clearly
7. Never suggest same thing more than twice total
8. Respect that stability and consistency matter more than optimization

Response format:
- Score out of 10
- 3 wins
- 2 watch points (not problems unless serious)
- 1 suggestion maximum (only if genuinely needed)
- Focus for next week
- Max 250 words
- Reference past suggestions and outcomes explicitly
- Track overall trajectory toward beach body goal`;

    const userPrompt = `Today's data: ${JSON.stringify(dayData)}
Last 7 days: ${JSON.stringify(weekHistory)}

Analyze and respond as my personal trainer who knows my full history.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const text = data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");

    return new Response(JSON.stringify({ analysis: text || "No analysis generated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
