import { z } from 'zod';
import { CommandListSchema } from '../../domain/commands';
import { err, ok, type Result } from '../../domain/result';
import type { AiError, AssistantResult } from '../ports';

const CommandsResponseSchema = z
  .object({
    kind: z.literal('commands').default('commands'),
    commands: CommandListSchema,
    summary: z.string().min(1),
    fallbackNotice: z.string().optional(),
  })
  .strict();

const ClarifyResponseSchema = z
  .object({
    kind: z.literal('clarify'),
    question: z.string().min(1),
    fallbackNotice: z.string().optional(),
  })
  .strict();

const RefuseResponseSchema = z
  .object({
    kind: z.literal('refuse'),
    reason: z.string().min(1),
    fallbackNotice: z.string().optional(),
  })
  .strict();

function stripMarkdownCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(trimmed);
  if (fenceMatch && fenceMatch[1] !== undefined) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

function parsePayload(parsed: unknown): Result<AssistantResult, AiError> {
  const commandsParsed = CommandsResponseSchema.safeParse(parsed);
  if (commandsParsed.success) {
    return ok(commandsParsed.data);
  }
  const clarifyParsed = ClarifyResponseSchema.safeParse(parsed);
  if (clarifyParsed.success) {
    return ok(clarifyParsed.data);
  }
  const refuseParsed = RefuseResponseSchema.safeParse(parsed);
  if (refuseParsed.success) {
    return ok(refuseParsed.data);
  }
  if (Array.isArray(parsed)) {
    const listParsed = CommandListSchema.safeParse(parsed);
    if (listParsed.success) {
      return ok({ kind: 'commands', commands: listParsed.data, summary: 'Applied plan updates' });
    }
  }
  return err({ code: 'bad_response', message: 'Gemini payload failed schema validation' });
}

/** Parses raw Gemini response text, stripping markdown fences, validating JSON and enforcing strict schemas. */
export function parseGeminiResponse(rawText: string): Result<AssistantResult, AiError> {
  const cleaned = stripMarkdownCodeFences(rawText);
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    return err({ code: 'bad_response', message: 'Failed to parse Gemini output as JSON' });
  }

  return parsePayload(parsedJson);
}
