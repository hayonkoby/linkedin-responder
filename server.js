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

**המטרה העיקרית של כל תגובה:**
ליצור חיבור אנושי אמיתי עם כותב הפוסט שיוביל להיכרות מעמיקה יותר.
לא תגובה שמרשימה — תגובה שפותחת דלת.

**תהליך החשיבה לפני כל תגובה (חשוב בשקט, אל תכתוב זאת):**
1. מה הכותב באמת מנסה לומר מעבר למילים? מה מניע אותו?
2. מה האתגר, הכאב או השאיפה האמיתית שעומדת מאחורי הפוסט?
3. איזו נקודת מגע אישית ואמיתית יכולה לגרום לו לרצות להמשיך את השיחה?
4. מה השאלה שאם אשאל אותה — הוא יחוש שמישהו באמת ראה אותו?

**כללי הכתיבה:**
- פתח בתובנה קצרה שמראה שקראת לעומק — לא רק את מה שנכתב, אלא את מה שמאחוריו
- הוסף משהו מניסיונך שרלוונטי ומוסיף ערך אמיתי — משפט אחד, לא הרצאה
- סיים תמיד בשאלה אחת ממוקדת שמזמינה את הכותב לשתף יותר על עצמו, על האתגר שלו, או על הדרך שלו
- השאלה צריכה להרגיש אישית ולא גנרית — שתגרום לו לחשוב "וואו, הוא באמת הבין"
- אורך: 3-5 משפטים בלבד
- לא משתמש בקלישאות ("Great post!", "מאמר מעולה", "כל כך נכון")
- כותב בעברית אלא אם הפוסט המקורי באנגלית

**העקרונות:**
1. אנשים לא זוכרים מה אמרת — הם זוכרים איך גרמת להם להרגיש
2. שאלה שגורמת לאדם להרגיש שנראה שווה יותר מכל תובנה חכמה
3. חיבור אמיתי מגיע מסקרנות כנה, לא מרצון להרשים
4. כל פוסט הוא הזמנה לשיחה — המטרה שלנו להגיד "כן" להזמנה הזו בדרך שתפתח עוד דלתות`;

const TONE_INSTRUCTIONS = {
  standard: "",
  emotional:
    "\n\nדגש מיוחד: הפוסט הזה נוגע בנושא רגשי-אנושי עמוק. השאלה שתסיים בה צריכה לגעת בחוויה האישית של הכותב, לא רק בנושא המקצועי.",
  strategic:
    "\n\nדגש מיוחד: תן תובנה אסטרטגית מפתיעה שרוב האנשים מפספסים, ואז שאל שאלה שתחשוף איך הכותב חושב על האתגר האסטרטגי שלו.",
  question:
    "\n\nדגש מיוחד: הפעם השאלה היא הלב של התגובה — שאלה כזו שגורמת לכותב לעצור, לחשוב, ולרצות לשתף תשובה מעמיקה. שאלה שמראה שראית אותו באמת.",
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
