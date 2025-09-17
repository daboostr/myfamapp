# Data Model

## Entities

### Person (Sharer)
- displayName: string
- identifier: string (e.g., email or unique ID for disambiguation)

### SharedImage
- id: string
- name: string
- thumbnailUrl: string | null
- sharedBy: Person
- dateShared: string (ISO)
- mimeType: string

### PeopleGrouping
- person: Person
- images: SharedImage[]

### Session
- isAuthenticated: boolean
- accountType: "personal" | "work" | "unknown"

## Notes
- Only common image types are included in SharedImage collections.
- Thumbnails may be null → use placeholder in UI.
- Grouping may produce many small collections; prefer lazy/incremental construction.
