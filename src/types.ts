export const MESSAGE_TYPES = [
  "Job Application",
  "Referral Request",
  "Interview Follow-up",
  "Internship Request",
  "Thank-you After Interview",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

export type Platform = "Email" | "LinkedIn";

export type NavView =
  | "home"
  | "email-writer"
  | "linkedin-writer"
  | "history"
  | "about";

export interface GenerateRequestPayload {
  messageType: MessageType;
  recipient: string;
  keyPoints: string;
  platform: Platform;
  variation?: number;
}

export interface EmailOutput {
  platform: "Email";
  subject: string;
  body: string;
}

export interface LinkedInOutput {
  platform: "LinkedIn";
  message: string;
}

export type GeneratedOutput = EmailOutput | LinkedInOutput;

export interface HistoryItem {
  id: string;
  createdAt: string;
  messageType: MessageType;
  recipient: string;
  keyPoints: string;
  output: GeneratedOutput;
}

export interface MessageTypeInfo {
  type: MessageType;
  summary: string;
  sampleRecipient: string;
  samplePoints: string;
}

export const MESSAGE_TYPE_DETAILS: MessageTypeInfo[] = [
  {
    type: "Job Application",
    summary: "Direct outreach to recruiters or hiring managers highlighting measurable role fit.",
    sampleRecipient: "Hiring Manager for Senior Product Designer at Linear",
    samplePoints:
      "6 years designing B2B SaaS workflows; led checkout redesign lifting activation by 24%; deeply admire your keyboard-first UI speed",
  },
  {
    type: "Referral Request",
    summary: "Warm, low-friction note asking an employee or connection to refer you for an open role.",
    sampleRecipient: "Alex Rivera, Staff Software Engineer at Stripe",
    samplePoints:
      "Applying for Backend Engineer role (Req #4821); 4 years building high-throughput payment APIs in Go; noticed we both graduated from UT Austin",
  },
  {
    type: "Interview Follow-up",
    summary: "Composed check-in after an interview round to reaffirm interest and invite next steps.",
    sampleRecipient: "Maya Patel, Technical Recruiter at Figma",
    samplePoints:
      "Completed final panel on Tuesday; excited about the collaborative multiplayer infrastructure team; happy to share additional architecture samples",
  },
  {
    type: "Internship Request",
    summary: "Focused outreach from students or early-career candidates showcasing projects and eagerness.",
    sampleRecipient: "Engineering Internship Team at Datadog",
    samplePoints:
      "Junior CS major graduating May 2027; built a distributed log visualizer in Rust & React; available full-time for Summer 2027",
  },
  {
    type: "Thank-you After Interview",
    summary: "Thoughtful post-interview appreciation referencing a specific conversation takeaway.",
    sampleRecipient: "David Chen, VP of Product at Notion",
    samplePoints:
      "Loved discussing your Q3 AI workspace roadmap; appreciated your perspective on user trust; confident my onboarding experience aligns closely",
  },
];
