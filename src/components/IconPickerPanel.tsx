'use client'

import type { FuseResult } from 'fuse.js'

import Fuse from 'fuse.js'
import React, { useCallback, useMemo, useState } from 'react'

import type { IconComponent } from './IconTypes.js'

import { IconGrid } from './IconGrid.js'
import { SelectedBar } from './SelectedBar.js'
import './IconPickerPanel.scss'

export interface IconPickerPanelProps {
  className?: string
  drawerIconSize?: number
  drawerItemsPerRow?: number
  drawerOverscan?: number
  drawerRowHeight?: number
  iconNames: string[]
  icons: Record<string, IconComponent>
  onSelect: (name: string) => void
  selectedNames: string[]
}

export const IconPickerPanel: React.FC<IconPickerPanelProps> = ({
  className,
  drawerIconSize,
  drawerItemsPerRow,
  drawerOverscan,
  drawerRowHeight,
  iconNames,
  icons,
  onSelect,
  selectedNames,
}) => {
  const [inputValue, setInputValue] = useState('')

  const focusSearchInput = useCallback((node: HTMLInputElement | null) => {
    if (!node) {
      return
    }

    node.focus()

    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      if (document.activeElement === node || !node.isConnected || attempts >= 10) {
        return
      }
      attempts += 1
      node.focus()
      timer = setTimeout(tick, 50)
    }

    timer = setTimeout(tick, 50)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const fuse = useMemo(() => new Fuse(iconNames, { threshold: 0.3 }), [iconNames])
  const filteredIconNames = useMemo(() => {
    if (!inputValue) {
      return iconNames
    }
    return fuse.search(inputValue).map((result: FuseResult<string>) => result.item)
  }, [iconNames, inputValue, fuse])

  return (
    <div className={['icon-picker-panel', className].filter(Boolean).join(' ')}>
      <input
        aria-label="Search icons"
        className="icon-picker-panel__search"
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Search icons..."
        ref={focusSearchInput}
        type="search"
        value={inputValue}
      />
      <div className="icon-picker-panel__count">Found {filteredIconNames.length} icons</div>

      <IconGrid
        drawerIconSize={drawerIconSize}
        drawerItemsPerRow={drawerItemsPerRow}
        drawerOverscan={drawerOverscan}
        drawerRowHeight={drawerRowHeight}
        iconNames={filteredIconNames}
        icons={icons}
        onSelect={onSelect}
        selectedNames={selectedNames}
      />

      <SelectedBar icons={icons} onRemove={onSelect} selectedNames={selectedNames} />
    </div>
  )
}
