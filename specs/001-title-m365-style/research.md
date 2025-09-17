# Research: M365-Style OneDrive Photo Sharing Web App

## Decisions
- Account Scope: Support both personal (MSA) and work/school (Entra ID) accounts with delegated access; least-privilege.
- Permissions: Read-only to list and view items shared with the user; no write access.
- Image Formats: Display jpg/jpeg/png/webp/gif; other types excluded from the gallery.
- Thumbnails: Use available small previews; show placeholder when missing.
- Grouping: Group by sharer identity; show disambiguation (e.g., email) when names collide.
- Pagination: Incremental loading/virtualization for large sets to maintain responsiveness.
- Static Export: Ensure all functionality works with static export (no server-side runtime).

## Rationale
- Broad account support and least-privilege align with user expectations and security.
- Restricting to common image formats simplifies UX and performance.
- Incremental loading protects responsiveness with large collections.
- Static export ensures portability and low ops overhead.

## Alternatives Considered
- Server-side rendering: Rejected due to static-only constitution and deployment simplicity.
- Server cache/service: Rejected to avoid managing secrets and persistence; user-authorized runtime access is sufficient.
- Full media type support: Rejected for scope control; may extend later.
