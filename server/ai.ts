import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export const MESSAGE_TYPES = [
  "Job Application",
  "Referral Request",
  "Interview Follow-up",
  "Internship Request",
  "Thank-you After Interview",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];
export type Platform = "Email" | "LinkedIn";

export interface GenerateMessageRequest {
  messageType: MessageType;
  recipient: string;
  keyPoints: string;
  platform: Platform;
  variation?: number;
}

export interface EmailGeneratedOutput {
  platform: "Email";
  subject: string;
  body: string;
}

export interface LinkedInGeneratedOutput {
  platform: "LinkedIn";
  message: string;
}

export type GeneratedMessageResponse =
  | EmailGeneratedOutput
  | LinkedInGeneratedOutput;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add a valid Gemini API key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function getToneDirective(messageType: MessageType): string {
  switch (messageType) {
    case "Job Application":
      return "Confident, concise, and achievement-oriented. Highlight relevant impact and clear interest in the role without sounding generic or overly flattering.";
    case "Referral Request":
      return "Respectful of the recipient's time, warm, and direct. Explain the connection/context, highlight 2-3 relevant qualifications, and make asking for a referral low-friction.";
    case "Interview Follow-up":
      return "Polite, proactive, and composed. Reference the recent conversation, reiterate enthusiasm, and invite next steps naturally.";
    case "Internship Request":
      return "Eager, articulate, and focused on readiness to learn and contribute tangible value. Keep it crisp and structured.";
    case "Thank-you After Interview":
      return "Genuine, appreciative, and specific. Reinforce a takeaway from the interview and connect it to how you can contribute.";
  }
}

export async function generateProfessionalMessage(
  input: GenerateMessageRequest
): Promise<GeneratedMessageResponse> {
  const ai = getAiClient();
  const toneDirective = getToneDirective(input.messageType);
  const variationHint =
    input.variation && input.variation > 0
      ? `Provide a fresh, distinct phrasing and structure (variation #${input.variation + 1}) compared to standard openings.`
      : "";

  if (input.platform === "Email") {
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: [
        `Message Type: ${input.messageType}`,
        `Recipient / Audience: ${input.recipient}`,
        `Key Points to Weave In:\n${input.keyPoints}`,
        variationHint,
      ]
        .filter(Boolean)
        .join("\n\n"),
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: [
          "You are an executive communications coach and career strategist.",
          `Write a polished, natural, ready-to-send professional email for a "${input.messageType}".`,
          `Tone & Strategy: ${toneDirective}`,
          "Rules:",
          "- Return a clear, compelling email Subject line (no 'Subject:' prefix) and a well-structured Email Body.",
          "- Address the recipient appropriately based on the provided recipient description (use their name if provided, or a clean placeholder like [Hiring Manager Name] only if no name was given).",
          "- Incorporate every key point naturally into crisp paragraphs (120-210 words total).",
          "- Avoid clichés like 'I hope this email finds you well', 'I am writing to express my keen interest', or robotic buzzwords.",
          "- End with a courteous, actionable closing and sign-off placeholder like [Your Name].",
        ].join("\n"),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "A concise, compelling email subject line.",
            },
            body: {
              type: Type.STRING,
              description:
                "The complete formatted email body with greeting, paragraphs, and sign-off.",
            },
          },
          required: ["subject", "body"],
        },
      },
    });

    const raw = (response.text ?? "").trim();
    if (!raw) {
      throw new Error("The AI model returned an empty response. Please try again.");
    }

    const parsed = JSON.parse(raw) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) {
      throw new Error("Invalid email format returned by AI model.");
    }

    return {
      platform: "Email",
      subject: parsed.subject.trim(),
      body: parsed.body.trim(),
    };
  }

  // LinkedIn: Strictly under 300 characters
  const response = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: [
      `Message Type: ${input.messageType}`,
      `Recipient / Audience: ${input.recipient}`,
      `Key Points to Include:\n${input.keyPoints}`,
      variationHint,
    ]
      .filter(Boolean)
      .join("\n\n"),
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      systemInstruction: [
        "You are an executive networking strategist specializing in high-response LinkedIn outreach.",
        `Write a concise, natural LinkedIn message for a "${input.messageType}".`,
        `Tone & Strategy: ${toneDirective}`,
        "CRITICAL LENGTH REQUIREMENT:",
        "- LinkedIn connection notes have a strict 300-character limit.",
        "- Your entire message MUST be strictly UNDER 300 characters (aim for 220 to 275 characters total, including spaces and greeting).",
        "- Include the recipient context and the core value from the user's key points cleanly without sounding rushed or robotic.",
        "- Do not include a subject line, hashtags, or emojis.",
      ].join("\n"),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: {
            type: Type.STRING,
            description:
              "A LinkedIn message strictly under 300 characters (target 220-275 characters).",
          },
        },
        required: ["message"],
      },
    },
  });

  const raw = (response.text ?? "").trim();
  if (!raw) {
    throw new Error("The AI model returned an empty response. Please try again.");
  }

  const parsed = JSON.parse(raw) as { message?: string };
  let message = (parsed.message ?? "").trim();

  if (!message) {
    throw new Error("Invalid LinkedIn message returned by AI model.");
  }

  // If the model produced >= 300 characters, ask Gemini once to tighten it under 285 characters
  if (message.length >= 300) {
    const tightenResponse = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Tighten this LinkedIn message so it is strictly under 280 characters (currently ${message.length} chars) while preserving all key points and a warm professional tone:\n\n${message}`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          "Return JSON with a single 'message' field strictly under 280 characters. No hashtags, no emojis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
          },
          required: ["message"],
        },
      },
    });
    const tightenedRaw = (tightenResponse.text ?? "").trim();
    if (tightenedRaw) {
      const tightenedParsed = JSON.parse(tightenedRaw) as { message?: string };
      if (tightenedParsed.message && tightenedParsed.message.trim().length < 300) {
        message = tightenedParsed.message.trim();
      }
    }
  }

  // Absolute safety guard at sentence/word boundary if still >= 300
  if (message.length >= 300) {
    const slice = message.slice(0, 296);
    const lastSpace = slice.lastIndexOf(" ");
    message = (lastSpace > 200 ? slice.slice(0, lastSpace) : slice).trimEnd() + "...";
  }

  return {
    platform: "LinkedIn",
    message,
  };
}
