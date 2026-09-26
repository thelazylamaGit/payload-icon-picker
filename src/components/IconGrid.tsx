'use client'

import { Button } from '@payloadcms/ui'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo, useRef } from 'react'

import type { IconComponent } from './IconTypes.js'

interface IconGridProps {
  drawerIconSize?: number
  drawerItemsPerRow?: number
  drawerOverscan?: number
  drawerRowHeight?: number
  iconNames: string[]
  icons: Record<string, IconComponent>
  onSelect: (name: string) => void
  selectedNames: string[]
}

export const IconGrid: React.FC<IconGridProps> = ({
  drawerIconSize = 24,
  drawerItemsPerRow = 20,
  drawerOverscan = 5,
  drawerRowHeight = 80,
  iconNames,
  icons,
  onSelect,
  selectedNames,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedNameSet = useMemo(() => new Set(selectedNames), [selectedNames])

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(iconNames.length / drawerItemsPerRow),
    directDomUpdates: true,
    estimateSize: () => drawerRowHeight,
    getScrollElement: () => containerRef.current,
    overscan: drawerOverscan,
    // The row ref still registers elements for direct positioning; fixed sizes skip DOM reads.
    useCachedMeasurements: true,
    useFlushSync: false,
  })

  return (
    <div
      ref={containerRef}
      style={{
        height: '480px',
        overflowX: 'hidden',
        overflowY: 'auto',
        paddingRight: '10px',
      }}
    >
      <div
        ref={rowVirtualizer.containerRef}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * drawerItemsPerRow
          const rowItems = iconNames.slice(startIndex, startIndex + drawerItemsPerRow)

          return (
            <div
              data-index={virtualRow.index}
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              style={{
                display: 'grid',
                gap: '8px',
                gridTemplateColumns: `repeat(${drawerItemsPerRow}, 1fr)`,
                height: `${virtualRow.size}px`,
                left: 0,
                paddingBottom: '8px',
                position: 'absolute',
                top: 0,
                width: '100%',
              }}
            >
              {rowItems.map((name) => {
                const IconComponent = icons[name]
                const isSelected = selectedNameSet.has(name)

                return (
                  <Button
                    buttonStyle={isSelected ? 'primary' : 'subtle'}
                    key={name}
                    margin={false}
                    onClick={() => onSelect(name)}
                    tooltip={name}
                    type="button"
                  >
                    {IconComponent && <IconComponent size={drawerIconSize} />}
                  </Button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
