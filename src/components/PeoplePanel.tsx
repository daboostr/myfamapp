/**
 * PeoplePanel component - lists people who have shared images
 * Follows Fluent UI design patterns and accessibility guidelines
 */

import React from 'react'
import { Person } from '../models'

interface PeoplePanelProps {
  people: Person[]
  selectedPerson: Person | null
  onSelectPerson: (person: Person | null) => void
  isLoading?: boolean
  className?: string
}

export function PeoplePanel({
  people,
  selectedPerson,
  onSelectPerson,
  isLoading = false,
  className = ''
}: PeoplePanelProps) {
  const handlePersonClick = (person: Person) => {
    // Toggle selection - click selected person to show all
    const newSelection = selectedPerson?.identifier === person.identifier ? null : person
    onSelectPerson(newSelection)
  }

  const handleShowAllClick = () => {
    onSelectPerson(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent, person: Person | null) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (person) {
        handlePersonClick(person)
      } else {
        handleShowAllClick()
      }
    }
  }

  if (isLoading) {
    return (
      <aside 
        className={`people-panel loading ${className}`}
        role="complementary"
        aria-label="People who shared photos"
      >
        <h2>People</h2>
        <div role="status" aria-label="Loading people">
          <span className="loading-text">Loading...</span>
        </div>
      </aside>
    )
  }

  if (people.length === 0) {
    return (
      <aside 
        className={`people-panel empty ${className}`}
        role="complementary"
        aria-label="People who shared photos"
      >
        <h2>People</h2>
        <div role="status" className="empty-state">
          <p>No people have shared photos with you yet.</p>
          <p className="helper-text">Ask someone to share their photos to get started.</p>
        </div>
      </aside>
    )
  }

  const totalImages = people.reduce((sum, person) => sum + person.imageCount, 0)

  return (
    <aside 
      className={`people-panel ${className}`}
      role="complementary"
      aria-label="People who shared photos"
    >
      <h2>People</h2>
      
      <div className="people-list" role="group" aria-label="Filter by person">
        {/* Show All option */}
        <button
          type="button"
          className={`person-item ${selectedPerson === null ? 'selected' : ''}`}
          onClick={handleShowAllClick}
          onKeyDown={(e) => handleKeyDown(e, null)}
          aria-pressed={selectedPerson === null}
        >
          <span className="person-name">Show All</span>
          <span className="image-count" aria-label={`${totalImages} total images`}>
            {totalImages}
          </span>
        </button>

        {/* Individual people */}
        {people.map((person) => (
          <button
            key={person.identifier}
            type="button"
            className={`person-item ${
              selectedPerson?.identifier === person.identifier ? 'selected' : ''
            }`}
            onClick={() => handlePersonClick(person)}
            onKeyDown={(e) => handleKeyDown(e, person)}
            aria-pressed={selectedPerson?.identifier === person.identifier}
          >
            <span className="person-name">{person.displayName}</span>
            <span 
              className="image-count" 
              aria-label={`${person.imageCount} ${person.imageCount === 1 ? 'image' : 'images'}`}
            >
              {person.imageCount}
            </span>
          </button>
        ))}
      </div>

      {selectedPerson && (
        <div className="selection-info" role="status" aria-live="polite">
          Showing {selectedPerson.imageCount} {selectedPerson.imageCount === 1 ? 'image' : 'images'} from {selectedPerson.displayName}
        </div>
      )}
    </aside>
  )
}

// CSS-in-JS styles (would be moved to CSS modules in production)
export const peoplePanelStyles = `
.people-panel {
  padding: 1rem;
  border-right: 1px solid #e1e1e1;
  background: #fafafa;
  min-width: 200px;
  max-width: 300px;
}

.people-panel h2 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #323130;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.person-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.1s ease;
}

.person-item:hover {
  background: #f3f2f1;
  border-color: #c7c7c7;
}

.person-item:focus {
  outline: 2px solid #0078d4;
  outline-offset: -2px;
}

.person-item.selected {
  background: #deecf9;
  border-color: #0078d4;
}

.person-item.selected:hover {
  background: #c7e0f4;
}

.person-name {
  font-weight: 400;
  color: #323130;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.image-count {
  font-size: 0.875rem;
  color: #605e5c;
  font-weight: 600;
  margin-left: 0.5rem;
  min-width: 1.5rem;
  text-align: right;
}

.selected .image-count {
  color: #0078d4;
}

.loading-text {
  color: #605e5c;
  font-style: italic;
}

.empty-state {
  color: #605e5c;
  text-align: center;
  padding: 1rem 0;
}

.empty-state p {
  margin: 0 0 0.5rem 0;
}

.helper-text {
  font-size: 0.875rem;
  opacity: 0.8;
}

.selection-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e1f5fe;
  border-left: 3px solid #0078d4;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #323130;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .people-panel {
    min-width: 150px;
    max-width: 200px;
    padding: 0.75rem;
  }
  
  .person-item {
    padding: 0.5rem;
  }
  
  .people-panel h2 {
    font-size: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .person-item:focus {
    outline: 3px solid;
  }
  
  .person-item.selected {
    background: SelectedItem;
    color: SelectedItemText;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .person-item {
    transition: none;
  }
}
`