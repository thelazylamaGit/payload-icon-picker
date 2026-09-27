'use client'

import { Drawer, DrawerToggler, useDrawerSlug, useModal } from '@payloadcms/ui'
import React, { useCallback } from 'react'

import type { IconComponent } from './IconTypes.js'

import { IconPickerPanel } from './IconPickerPanel.js'
import './DrawerMode.scss'

interface DrawerModeProps {
  closeOnSelect?: boolean
  disabled?: boolean
  drawerClassName?: string
  drawerIconSize?: number
  drawerItemsPerRow?: number
  drawerOverscan?: number
  drawerRowHeight?: number
  drawerSize?: 'compact' | 'full'
  hasMany?: boolean
  iconNames: string[]
  icons: Record<string, IconComponent>
  label: string
  onSelect: (name: string) => void
  path: string
  selectedNames: string[]
}

export const DrawerMode: React.FC<DrawerModeProps> = ({
  closeOnSelect,
  disabled,
  drawerClassName,
  drawerIconSize,
  drawerItemsPerRow,
  drawerOverscan,
  drawerRowHeight,
  drawerSize = 'full',
  hasMany,
  iconNames,
  icons,
  label,
  onSelect,
  path,
  selectedNames,
}) => {
  const drawerSlug = useDrawerSlug(`icon-picker-drawer-${path}`)
  const { closeModal } = useModal()

  const handleSelect = useCallback(
    (name: string) => {
      onSelect(name)
      if (closeOnSelect && !hasMany) {
        closeModal(drawerSlug)
      }
    },
    [onSelect, closeOnSelect, hasMany, closeModal, drawerSlug],
  )

  return (
    <div className="field-type__wrap" style={{ position: 'relative' }}>
      <DrawerToggler
        className="btn btn--style-secondary icon-picker-drawer__trigger"
        disabled={disabled}
        slug={drawerSlug}
      >
        {selectedNames.length > 0 ? (
          hasMany ? (
            <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedNames.map((name) => {
                const IconComponent = icons?.[name]
                return (
                  <span
                    key={name}
                    style={{
                      alignItems: 'center',
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '4px',
                      padding: '2px 6px',
                    }}
                  >
                    {IconComponent && <IconComponent size={14} />}
                    {name}
                  </span>
                )
              })}
            </div>
          ) : (
            (() => {
              const name = selectedNames[0]
              const IconComponent = icons?.[name]
              return (
                <div style={{ alignItems: 'center', display: 'flex', gap: '8px', width: '100%' }}>
                  {IconComponent && <IconComponent size={18} />}
                  <span style={{ fontWeight: '600' }}>{name}</span>
                  <span style={{ fontSize: '11px', marginLeft: 'auto', opacity: 0.3 }}>
                    Click to change
                  </span>
                </div>
              )
            })()
          )
        ) : (
          <span style={{ opacity: 0.5 }}>Click to select icon...</span>
        )}
      </DrawerToggler>

      <Drawer
        className={[
          'icon-picker-drawer',
          drawerSize === 'compact' && 'icon-picker-drawer--compact',
          drawerClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        slug={drawerSlug}
        title={label || 'Select Icon'}
      >
        <IconPickerPanel
          drawerIconSize={drawerIconSize}
          drawerItemsPerRow={drawerItemsPerRow ?? (drawerSize === 'compact' ? 12 : undefined)}
          drawerOverscan={drawerOverscan}
          drawerRowHeight={drawerRowHeight}
          iconNames={iconNames}
          icons={icons}
          onSelect={handleSelect}
          selectedNames={selectedNames}
        />
      </Drawer>
    </div>
  )
}
