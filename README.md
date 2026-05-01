# 💼 LinkedIn Responder

כלי AI ליצירת תגובות איכותיות לפוסטים בלינקדאין — מנקודת מבט של יועץ ומאמן עסקי B2B שמחבר בין עולם העסקים לעולם המנטלי-רגשי.

![LinkedIn Responder Screenshot](https://i.imgur.com/placeholder.png)

## מה זה עושה

- מקבל פוסט מלינקדאין
- מייצר תגובה אותנטית, עמוקה ועם ערך אמיתי
- 4 סגנונות תגובה לבחירה
- תוצאה מוצגת בזמן אמת (streaming)

## דרישות

- [Node.js](https://nodejs.org) v18+
- [מפתח API של Anthropic](https://console.anthropic.com)

## התקנה והפעלה

```bash
# 1. שכפל את הריפו
git clone https://github.com/hayonkoby/linkedin-responder.git
cd linkedin-responder

# 2. התקן תלויות
npm install

# 3. הגדר API Key
copy .env.example .env
# ערוך את .env והכנס את המפתח שלך

# 4. הפעל
npm start
```

פתח בדפדפן: **http://localhost:3000**

## סגנונות תגובה

| סגנון | תיאור |
|-------|-------|
| ⚖️ סטנדרטי | איזון בין עסקי לאנושי |
| 💛 מנטלי-רגשי | דגש על הממד האנושי |
| 🎯 אסטרטגי וחד | תובנה מפתיעה וישירה |
| ❓ שואל ומאתגר | מסתיים בשאלה שמזמינה דיאלוג |

## טכנולוגיה

- **AI:** Claude Opus 4.6 (Anthropic) עם Adaptive Thinking
- **Backend:** Node.js + Express
- **Frontend:** HTML/CSS/JS טהור, RTL מלא
- **Streaming:** Server-Sent Events (SSE)
