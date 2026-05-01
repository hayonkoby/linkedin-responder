#!/usr/bin/env python3
"""
LinkedIn Responder — Web UI (Gradio)
גרסת ממשק ווב נוחה לשימוש יומיומי
"""

import anthropic
import gradio as gr

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


def generate_response(post_text: str, tone: str):
    """Generate a streaming LinkedIn response."""
    if not post_text.strip():
        yield "⚠️ אנא הכנס טקסט של פוסט לינקדאין"
        return

    tone_instructions = {
        "סטנדרטי": "",
        "מעמיק יותר — מנטלי/רגשי": "\n\nהפוסט הזה מצריך דגש מיוחד על הממד המנטלי-רגשי. חבר בעמקות בין האספקט העסקי לאנושי.",
        "אסטרטגי וחד": "\n\nהגב בסגנון אסטרטגי וחד במיוחד — נקודת מבט ייחודית, תובנה מפתיעה, ישיר לעניין.",
        "שואל ומאתגר": "\n\nסיים בשאלה מאתגרת שתעורר חשיבה עמוקה ותזמין שיחה אמיתית.",
    }

    user_message = f"פוסט לינקדאין לתגובה:\n\n{post_text}"
    if tone in tone_instructions and tone_instructions[tone]:
        user_message += tone_instructions[tone]

    client = anthropic.Anthropic()
    result = ""

    try:
        with client.messages.stream(
            model="claude-opus-4-6",
            max_tokens=1024,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        ) as stream:
            for text in stream.text_stream:
                result += text
                yield result
    except anthropic.AuthenticationError:
        yield "❌ שגיאה: API Key לא תקין. הגדר את ANTHROPIC_API_KEY."
    except anthropic.APIConnectionError:
        yield "❌ שגיאת חיבור. בדוק את החיבור לאינטרנט."
    except Exception as e:
        yield f"❌ שגיאה: {str(e)}"


def build_ui():
    with gr.Blocks(
        title="LinkedIn Responder — יועץ עסקי B2B",
        theme=gr.themes.Soft(),
        css="""
        .rtl { direction: rtl; text-align: right; }
        #title { text-align: center; }
        """
    ) as demo:
        gr.Markdown(
            """# 💼 LinkedIn Responder
### יועץ ומאמן עסקי B2B | עסק + מנטל-רגשי""",
            elem_id="title"
        )

        with gr.Row():
            with gr.Column(scale=1):
                post_input = gr.Textbox(
                    label="📋 פוסט לינקדאין",
                    placeholder="הדבק כאן את הפוסט מלינקדאין...",
                    lines=10,
                    elem_classes=["rtl"]
                )
                tone_selector = gr.Radio(
                    label="🎯 סגנון התגובה",
                    choices=["סטנדרטי", "מעמיק יותר — מנטלי/רגשי", "אסטרטגי וחד", "שואל ומאתגר"],
                    value="סטנדרטי",
                    elem_classes=["rtl"]
                )
                generate_btn = gr.Button("✨ צור תגובה", variant="primary", size="lg")

            with gr.Column(scale=1):
                response_output = gr.Textbox(
                    label="💬 התגובה המוכנה",
                    placeholder="התגובה תופיע כאן...",
                    lines=10,
                    elem_classes=["rtl"],
                    show_copy_button=True
                )

        gr.Markdown(
            """---
*מבוסס על Claude Opus 4.6 | הגדר את `ANTHROPIC_API_KEY` כמשתנה סביבה*""",
            elem_classes=["rtl"]
        )

        generate_btn.click(
            fn=generate_response,
            inputs=[post_input, tone_selector],
            outputs=response_output
        )

    return demo


if __name__ == "__main__":
    ui = build_ui()
    ui.launch(share=False)
