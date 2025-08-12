# DEV AI Actions Wiring

This directory contains dev-only AI actions (one-line summary, three-line summary, image-to-latex) that call your AWS Lambda endpoints.

How to use:
- Set env vars:
  - `NEXT_PUBLIC_AI_ONE_LINE_SUMMARY_URL`
  - `NEXT_PUBLIC_AI_THREE_LINE_SUMMARY_URL`
  - `NEXT_PUBLIC_AI_IMAGE_TO_LATEX_URL`
  - (optional) `NEXT_PUBLIC_AI_API_KEY`
- Import in dev UI and call with proper payloads.
- Returned JSON shapes are defined in each action's `*.ts`.

Note: These are dev-only and do not depend on Tiptap Pro features.


