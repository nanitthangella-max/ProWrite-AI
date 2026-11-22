import json
import os
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from google import genai
from google.genai import types
from google.genai.errors import APIError

load_dotenv()

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

GEMINI_MODEL = "gemini-4-hydrogen"

ALLOWED_MESSAGE_TYPES = {
    "Job Application": (
        "Confident, concise, and achievement-oriented. Highlight relevant impact "
        "and clear interest in the role without sounding generic."
    ),
    "Referral Request": (
        "Respectful of the recipient's time, warm, and direct. Explain the connection "
        "or context, highlight 2-3 qualifications, and keep the ask low-friction."
    ),
    "Interview Follow-up": (
        "Polite, proactive, and composed. Reference the recent conversation, "
        "reiterate enthusiasm, and invite next steps naturally."
    ),
    "Internship Request": (
        "Eager, articulate, and focused on readiness to learn and contribute tangible "
        "value. Keep it crisp and well-structured."
    ),
    "Thank-you After Interview": (
        "Genuine, appreciative, and specific. Reinforce a takeaway from the "
        "conversation and connect it to how you can contribute."
    ),
}

ALLOWED_PLATFORMS = {"Email", "LinkedIn"}


def get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "MY_GEMINI_API_KEY":
        raise ValueError(
            "GEMINI_API_KEY is missing or not configured. "
            "Set a valid key in your .env file or environment variables."
        )
    return genai.Client(api_key=api_key)


def validate_payload(data: Any) -> tuple[dict[str, Any] | None, str | None]:
    if not isinstance(data, dict):
        return None, "Request body must be a valid JSON object."

    message_type = str(
        data.get("messageType") or data.get("message_type") or ""
    ).strip()
    recipient = str(data.get("recipient") or "").strip()
    key_points = str(
        data.get("keyPoints") or data.get("key_points") or ""
    ).strip()
    platform = str(data.get("platform") or "").strip()

    try:
        variation = int(data.get("variation") or 0)
    except (TypeError, ValueError):
        variation = 0

    if not message_type or message_type not in ALLOWED_MESSAGE_TYPES:
        allowed_list = ", ".join(ALLOWED_MESSAGE_TYPES.keys())
        return None, f"Message type must be one of: {allowed_list}."

    if len(recipient) < 2:
        return None, "Please enter who this message is for (recipient)."

    if len(recipient) > 200:
        return None, "Recipient description must be 200 characters or fewer."

    if len(key_points) < 5:
        return None, "Please provide 2–3 key points (at least 5 characters)."

    if len(key_points) > 2000:
        return None, "Key points must be 2,000 characters or fewer."

    if platform not in ALLOWED_PLATFORMS:
        return None, "Platform must be either 'Email' or 'LinkedIn'."

    return {
        "message_type": message_type,
        "recipient": recipient,
        "key_points": key_points,
        "platform": platform,
        "variation": max(0, variation),
    }, None


def generate_email(
    client: genai.Client,
    message_type: str,
    recipient: str,
    key_points: str,
    variation: int,
) -> dict[str, str]:
    tone_directive = ALLOWED_MESSAGE_TYPES[message_type]
    variation_note = (
        f"\nProvide a fresh phrasing and opening angle (variation #{variation + 1})."
        if variation > 0
        else ""
    )

    system_instruction = "\n".join(
        [
            "You are an executive communications coach and career strategist.",
            f'Write a polished, natural, ready-to-send professional email for a "{message_type}".',
            f"Tone & Strategy: {tone_directive}",
            "Rules:",
            "- Return a clear, compelling email subject line (without a 'Subject:' prefix) and a complete email body.",
            "- Include a polite, professional greeting and a courteous closing with a clean sign-off placeholder like [Your Name].",
            "- Incorporate all provided key points smoothly in 120–210 words.",
            "- Avoid clichés like 'I hope this email finds you well' or robotic buzzwords.",
        ]
    )

    prompt = (
        f"Message Type: {message_type}\n"
        f"Recipient: {recipient}\n"
        f"Key Points:\n{key_points}"
        f"{variation_note}"
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(thinking_level="LOW"),
            response_schema=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "subject": types.Schema(
                        type=types.Type.STRING,
                        description="A concise, professional email subject line.",
                    ),
                    "body": types.Schema(
                        type=types.Type.STRING,
                        description="Complete email body with greeting, paragraphs, and closing.",
                    ),
                },
                required=["subject", "body"],
            ),
        ),
    )

    raw_text = (response.text or "").strip()
    if not raw_text:
        raise RuntimeError("Gemini returned an empty response.")

    parsed = json.loads(raw_text)
    subject = str(parsed.get("subject", "")).strip()
    body = str(parsed.get("body", "")).strip()

    if not subject or not body:
        raise RuntimeError("Gemini returned an incomplete email payload.")

    return {
        "platform": "Email",
        "subject": subject,
        "body": body,
    }


def generate_linkedin_message(
    client: genai.Client,
    message_type: str,
    recipient: str,
    key_points: str,
    variation: int,
) -> dict[str, str]:
    tone_directive = ALLOWED_MESSAGE_TYPES[message_type]
    variation_note = (
        f"\nUse a fresh phrasing and opening angle (variation #{variation + 1})."
        if variation > 0
        else ""
    )

    system_instruction = "\n".join(
        [
            "You are an executive networking strategist specializing in LinkedIn outreach.",
            f'Write a friendly, professional LinkedIn message for a "{message_type}".',
            f"Tone & Strategy: {tone_directive}",
            "CRITICAL LENGTH RULE:",
            "- LinkedIn connection notes have a strict 300-character limit.",
            "- Your entire message MUST be strictly UNDER 300 characters (target 210–275 characters including spaces).",
            "- Weave in the recipient context and core key points naturally.",
            "- Do not include a subject line, hashtags, or emojis.",
        ]
    )

    prompt = (
        f"Message Type: {message_type}\n"
        f"Recipient: {recipient}\n"
        f"Key Points:\n{key_points}"
        f"{variation_note}"
    )

    schema = types.Schema(
        type=types.Type.OBJECT,
        properties={
            "message": types.Schema(
                type=types.Type.STRING,
                description="Friendly professional LinkedIn note strictly under 300 characters.",
            )
        },
        required=["message"],
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(thinking_level="LOW"),
            response_schema=schema,
        ),
    )

    raw_text = (response.text or "").strip()
    if not raw_text:
        raise RuntimeError("Gemini returned an empty response.")

    parsed = json.loads(raw_text)
    message = str(parsed.get("message", "")).strip()

    if not message:
        raise RuntimeError("Gemini returned an empty LinkedIn message.")

    # Automatic AI tightening pass if the generated draft is >= 300 characters
    if len(message) >= 300:
        tighten_response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=(
                f"Tighten this LinkedIn message so it is strictly under 280 characters "
                f"(currently {len(message)} chars) while keeping the friendly tone and key points:\n\n{message}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=(
                    "Return JSON with a single 'message' string strictly under 280 characters. "
                    "No hashtags, no emojis."
                ),
                response_mime_type="application/json",
                thinking_config=types.ThinkingConfig(thinking_level="LOW"),
                response_schema=schema,
            ),
        )
        tightened_raw = (tighten_response.text or "").strip()
        if tightened_raw:
            tightened_parsed = json.loads(tightened_raw)
            tightened_msg = str(tightened_parsed.get("message", "")).strip()
            if tightened_msg and len(tightened_msg) < 300:
                message = tightened_msg

    # Final safety guard to guarantee strict < 300 character limit
    if len(message) >= 300:
        trimmed = message[:296]
        last_space = trimmed.rfind(" ")
        if last_space > 200:
            trimmed = trimmed[:last_space]
        message = trimmed.rstrip() + "..."

    return {
        "platform": "LinkedIn",
        "message": message,
    }


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ProWrite AI (Flask)"})


@app.route("/generate", methods=["POST"])
def generate():
    payload = request.get_json(silent=True)
    cleaned, validation_error = validate_payload(payload)
    if validation_error or cleaned is None:
        return jsonify({"error": validation_error or "Invalid input."}), 400

    try:
        client = get_gemini_client()

        if cleaned["platform"] == "Email":
            result = generate_email(
                client=client,
                message_type=cleaned["message_type"],
                recipient=cleaned["recipient"],
                key_points=cleaned["key_points"],
                variation=cleaned["variation"],
            )
        else:
            result = generate_linkedin_message(
                client=client,
                message_type=cleaned["message_type"],
                recipient=cleaned["recipient"],
                key_points=cleaned["key_points"],
                variation=cleaned["variation"],
            )

        return jsonify(result), 200

    except ValueError as exc:
        return jsonify({"error": str(exc)}), 500
    except APIError as exc:
        return (
            jsonify({"error": f"Gemini API error ({exc.code}): {exc.message}"}),
            502,
        )
    except json.JSONDecodeError:
        return (
            jsonify(
                {"error": "Received malformed output from AI service. Please try again."}
            ),
            502,
        )
    except Exception as exc:
        return (
            jsonify({"error": f"Failed to generate message: {str(exc)}"}),
            500,
        )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
