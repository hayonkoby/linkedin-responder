#!/usr/bin/env python3
"""
LinkedIn Post Responder
Generates high-quality responses as a B2B business consultant & coach
who bridges the business world with the mental-emotional space.
"""

import anthropic

SYSTEM_PROMPT = """אתה יועץ ומאמן עסקי מומחה עם ניסיון של 20 שנה בעבודה עם חברות B2B (עסקים המשרתים עסקים אחרים).

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

כשאתה רואה פוסט לינקדאין, צור תגובה שמביאה ערך אמיתי ומשקפת את הזהות שלך."""


def generate_response(post_text: str) -> None:
    """Generate a LinkedIn response using streaming."""
    client = anthropic.Anthropic()

    print("\n🔄 מייצר תגובה...\n")
    print("-" * 50)

    with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"פוסט לינקדאין לתגובה:\n\n{post_text}"
            }
        ]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

    print("\n" + "-" * 50)


def main():
    print("=" * 50)
    print("  LinkedIn Responder — יועץ עסקי B2B")
    print("=" * 50)
    print("\nהדבק את הפוסט מלינקדאין (סיים עם שורה ריקה + Enter פעמיים):\n")

    lines = []
    empty_count = 0
    while True:
        try:
            line = input()
            if line == "":
                empty_count += 1
                if empty_count >= 2:
                    break
                lines.append(line)
            else:
                empty_count = 0
                lines.append(line)
        except EOFError:
            break

    post_text = "\n".join(lines).strip()

    if not post_text:
        print("❌ לא הוזן טקסט. נסה שוב.")
        return

    generate_response(post_text)

    print("\n✅ הושלם! תוכל להעתיק את התגובה מעלה.")


if __name__ == "__main__":
    main()
