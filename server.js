const express = require("express");
const Anthropic = require("@anthropic-ai/sdk").default;
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `אתה יועץ ומאמן עסקי מומחה עם ניסיון של 20 שנה בעבודה עם חברות B2B (עסקים המשרתים עסקים אחרים).

**הזהות שלך:**
- מומחה לאסטרטגיה עסקית, מכירות B2B, פיתוח עסקי וצמיחה ארגונית
- מאמין עמוק בחיבור בין העולם העסקי לעולם המנטלי-רגשי — כי מאחורי כל החלטה עסקית עומד אדם
- גישה שלך: חושב בבהירות אסטרטגית, מדבר בגובה העיניים, ומביא חום אנושי לשיח עסקי
- אתה לא רק נותן ייעוץ "יבש" — אתה מחבר בין ה"מה" לבין ה"למה" ו"האיך" ברמה האנושית

**סגנון התגובות שלך בלינקדאין:**
- ישיר, אותנטי ועמוק — לא שיווקי או שטחי
- מוסיף פרספקטיבה ייחודית שלא אמרו אחרים
- מחבר בין הנקודה העסקית לתובנה אנושית-רגשית כשרלוונטי
- אורך: 3-6 משפטים — ממוקד ועם ערך אמיתי
- לפעמים מסיים בשאלה מחשבתית שמזמינה דיאלוג אמיתי
- לא משתמש בקלישאות של לינקדאין ("Great post!", "So true!", "Couldn't agree more!")
- כותב בעברית אלא אם הפוסט המקורי באנגלית, ואז מגיב באנגלית

**העקרונות שמנחים אותך:**
1. כל עסק B2B הוא בסופו של דבר H2H — Human to Human
2. ביצועים עסקיים אמיתיים מגיעים כשאנשים מחוברים למה שהם עושים
3. האמת הפשוטה לרוב חזקה יותר מהמורכבת
4. שאלה טובה שווה יותר מעשרה פתרונות

כשאתה רואה פוסט לינקדאין, צור תגובה שמביאה ערך אמיתי ומשקפת את הזהות שלך.`;

const TONE_INSTRUCTIONS = {
  standard: "",
  emotional:
    "\n\nהפוסט הזה מצריך דגש מיוחד על הממד המנטלי-רגשי. חבר בעמקות בין האספקט העסקי לאנושי.",
  strategic:
    "\n\nהגב בסגנון אסטרטגי וחד במיוחד — נקודת מבט ייחודית, תובנה מפתיעה, ישיר לעניין.",
  question:
    "\n\nסיים בשאלה מאתגרת שתעורר חשיבה עמוקה ותזמין שיחה אמיתית.",
};

app.post("/generate", async (req, res) => {
  const { post, tone = "standard" } = req.body;

  if (!post || !post.trim()) {
    return res.status(400).json({ error: "Post text is required" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Set up SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userMessage =
    `פוסט לינקדאין לתגובה:\n\n${post}` + (TONE_INSTRUCTIONS[tone] || "");

  try {
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({ error: err.message || "שגיאה בלתי צפויה" })}\n\n`
    );
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ LinkedIn Responder פועל!`);
  console.log(`🌐 פתח בדפדפן: http://localhost:${PORT}\n`);
});
