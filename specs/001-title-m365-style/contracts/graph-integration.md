# External Data Contracts (Read-Only)

This document describes the minimum fields the UI depends on for showing shared images grouped by sharer. It avoids implementation specifics and focuses on the data shape consumed by the UI.

## Shared Item (Image) - Minimal Fields
- id: string
- name: string
- mimeType: string (must start with "image/")
- sharedBy:
  - displayName: string
  - identifier: string (e.g., email or unique ID) // for disambiguation only
- preview:
  - thumbnailUrl: string | null // small preview if available
- dateShared: string (ISO)

## Grouping Logic Expectations
- Items are grouped by `sharedBy.identifier` when available; otherwise by `sharedBy.displayName`.
- Items not matching `mimeType` starting with `image/` are excluded from the gallery feed.
- Items missing a thumbnail still appear with a placeholder.

## Error Handling Expectations
- Missing preview or revoked access affects only the individual item; the view continues to render.
- Large result sets are acceptable; the UI will incrementally render items.
