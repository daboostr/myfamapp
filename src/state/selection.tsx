/**
 * Selection state context for managing current person and filtered images
 * Provides global state for people panel and gallery coordination
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Person, SharedImage, SelectionState, GraphDriveItem } from '../models'
import { processGraphItems } from '../services/grouping'
import { fetchSharedItems } from '../services/data'

// Action types for state management
type SelectionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { people: Person[]; images: SharedImage[] } }
  | { type: 'SELECT_PERSON'; payload: Person | null }
  | { type: 'REFRESH_DATA' }

// Initial state
const initialState: SelectionState = {
  selectedPerson: null,
  displayImages: [],
  availablePeople: [],
  isLoading: false,
  error: null
}

// State reducer
function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case 'SET_DATA':
      const { people, images } = action.payload
      const currentSelection = state.selectedPerson
      
      // Filter images based on current selection
      const filteredImages = currentSelection
        ? images.filter(img => img.sharedBy.identifier === currentSelection.identifier)
        : images

      return {
        ...state,
        availablePeople: people,
        displayImages: filteredImages,
        isLoading: false,
        error: null
      }

    case 'SELECT_PERSON':
      const selectedPerson = action.payload
      const allImages = getAllImagesFromPeople(state.availablePeople)
      
      // Filter images by selected person (null = show all)
      const displayImages = selectedPerson
        ? allImages.filter(img => img.sharedBy.identifier === selectedPerson.identifier)
        : allImages

      return {
        ...state,
        selectedPerson,
        displayImages
      }

    case 'REFRESH_DATA':
      return {
        ...state,
        isLoading: true,
        error: null
      }

    default:
      return state
  }
}

// Helper to extract all images from people groupings
function getAllImagesFromPeople(people: Person[]): SharedImage[] {
  // This is a simplified version - in real implementation,
  // we'd maintain the full groupings or fetch from a service
  return []
}

// Context definition
interface SelectionContextType {
  state: SelectionState
  selectPerson: (person: Person | null) => void
  refreshData: () => Promise<void>
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

// Provider component
interface SelectionProviderProps {
  children: ReactNode
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [state, dispatch] = useReducer(selectionReducer, initialState)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Load data from API
  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const result = await fetchSharedItems()
      
      if (result.error) {
        dispatch({ type: 'SET_ERROR', payload: result.error })
        return
      }

      // Process raw Graph items into structured data
      const processed = processGraphItems(result.items)
      
      if (processed.errors.length > 0) {
        console.warn('Data processing warnings:', processed.errors)
      }

      // Extract people and all images
      const people = processed.allPeople
      const allImages: SharedImage[] = []
      
      // Flatten all images from groupings
      for (const grouping of processed.groupings) {
        allImages.push(...grouping.images)
      }

      dispatch({
        type: 'SET_DATA',
        payload: { people, images: allImages }
      })

    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load data'
      })
    }
  }

  // Actions
  const selectPerson = (person: Person | null) => {
    dispatch({ type: 'SELECT_PERSON', payload: person })
  }

  const refreshData = async () => {
    dispatch({ type: 'REFRESH_DATA' })
    await loadData()
  }

  const contextValue: SelectionContextType = {
    state,
    selectPerson,
    refreshData
  }

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  )
}

// Hook for using selection context
export function useSelection(): SelectionContextType {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider')
  }
  return context
}

// Hook for current selection state
export function useCurrentSelection() {
  const { state } = useSelection()
  return {
    selectedPerson: state.selectedPerson,
    displayImages: state.displayImages,
    isLoading: state.isLoading,
    error: state.error
  }
}

// Hook for people list
export function usePeople() {
  const { state, selectPerson } = useSelection()
  return {
    people: state.availablePeople,
    selectedPerson: state.selectedPerson,
    selectPerson,
    isLoading: state.isLoading
  }
}