'use client'

import { Button } from '@payloadcms/ui'
import React from 'react'

import type { IconComponent } from './IconTypes.js'

interface SelectedBarProps {
  icons: Record<string, IconComponent>
  onRemove: (name: string) => void
  selectedNames: string[]
}

export const SelectedBar: React.FC<SelectedBarProps> = ({ icons, onRemove, selectedNames }) => {
  if (selectedNames.length === 0) {
    return null
  }

  return (
    <div className="icon-picker-panel__selected">
      <div className="icon-picker-panel__selected-label">
        Selected ({selectedNames.length}) — Click to remove:
      </div>
      <div className="icon-picker-panel__selected-items">
        {selectedNames.map((name) => {
          const IconComponent = icons?.[name]
          return (
            <Button
              buttonStyle="secondary"
              icon={IconComponent && <IconComponent />}
              iconPosition="left"
              key={`selected-${name}`}
              margin={false}
              onClick={() => onRemove(name)}
              type="button"
            >
              <span>{name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
