'use client'

import { Button, Tooltip } from '@payloadcms/ui'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { IconComponent } from './IconTypes.js'

import './IconGrid.scss'

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

interface ActiveTooltip {
  container: Element
  height: number
  left: number
  name: string
  position: 'bottom' | 'top'
  top: number
  width: number
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
  const tooltipTimer = useRef<null | ReturnType<typeof setTimeout>>(null)
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null)

  const selectedNameSet = useMemo(() => new Set(selectedNames), [selectedNames])

  const hideTooltip = useCallback(() => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current)
      tooltipTimer.current = null
    }
    setActiveTooltip(null)
  }, [])

  useEffect(
    () => () => {
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current)
      }
    },
    [],
  )
  useEffect(() => hideTooltip(), [hideTooltip, iconNames])

  const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-icon-name]')
    if (!button || !event.currentTarget.contains(button)) {
      return
    }

    hideTooltip()
    tooltipTimer.current = setTimeout(() => {
      const grid = containerRef.current
      const drawerContent =
        grid?.closest('[data-icon-picker-overlay], .drawer__content') ??
        grid?.closest('.icon-picker-panel')
      if (!button.isConnected || !grid || !drawerContent) {
        return
      }

      const buttonRect = button.getBoundingClientRect()
      const gridRect = grid.getBoundingClientRect()
      const drawerRect = drawerContent.getBoundingClientRect()

      setActiveTooltip({
        name: button.dataset.iconName || '',
        container: drawerContent,
        height: buttonRect.height,
        left: buttonRect.left - drawerRect.left,
        position: buttonRect.top - gridRect.top < 40 ? 'bottom' : 'top',
        top: buttonRect.top - drawerRect.top,
        width: buttonRect.width,
      })
      tooltipTimer.current = null
    }, 350)
  }

  const handlePointerOut = (event: React.PointerEvent<HTMLDivElement>) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-icon-name]')
    if (button && !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) {
      hideTooltip()
    }
  }

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
      className="icon-picker-panel__grid"
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
      onScroll={hideTooltip}
      ref={containerRef}
      style={{
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
              className="icon-picker-panel__row"
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
                    className="icon-picker-panel__icon-button"
                    extraButtonProps={{ 'aria-label': name, 'data-icon-name': name }}
                    key={name}
                    margin={false}
                    onClick={() => onSelect(name)}
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
      {activeTooltip &&
        createPortal(
          <div
            className="icon-picker-grid__tooltip-anchor"
            style={{
              height: activeTooltip.height,
              left: activeTooltip.left,
              top: activeTooltip.top,
              width: activeTooltip.width,
            }}
          >
            <Tooltip delay={0} position={activeTooltip.position} staticPositioning>
              {activeTooltip.name}
            </Tooltip>
          </div>,
          activeTooltip.container,
        )}
    </div>
  )
}
