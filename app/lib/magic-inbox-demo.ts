/**
 * Product storytelling copy for the AI-Team "magic inbox" demo:
 * any user input → proactive help → auth → loaders → inline actions → save workflow.
 */

export const MAGIC_INBOX_WORKFLOW_NAME = 'Inbox triage & smart replies'

export const MAGIC_INBOX_WORKFLOW_META = {
  title: MAGIC_INBOX_WORKFLOW_NAME,
  description:
    'Reviews new mail, scores urgency, pulls conversation context, drafts replies, and surfaces calls you need to make.',
  active: true as const,
}

export const DEMO_INBOX_EMAILS = [
  {
    id: 'demo-e1',
    subject: 'Re: Vendor quote — Q2 maintenance',
    draftReply:
      "Hi Alex — thanks for sending this over. We can align on scope by Thursday. I'll share an updated PO by EOD tomorrow.",
  },
  {
    id: 'demo-e2',
    subject: 'Facilities — urgent: HVAC alarm on Line 3',
    draftReply:
      "Thanks for flagging. I'm routing this to on-site now and will confirm an ETA within 30 minutes.",
  },
] as const

export const DEMO_CALL_REMINDER = {
  name: 'Jordan Lee',
  phone: '+1 (415) 555-0142',
}
