'use client'

import type { CollectionSlug } from 'payload'

import React, { createContext, use } from 'react'

import type { IconComponent } from './IconTypes.js'

const IconPackContext = createContext<{
  collections?: Partial<Record<CollectionSlug, Record<string, any>>>
  icons: Record<string, IconComponent>
} | null>(null)

export const IconPackProvider: React.FC<{
  children: React.ReactNode
  collections?: Partial<Record<CollectionSlug, Record<string, any>>>
  icons: Record<string, any>
}> = ({ children, collections, icons }) => {
  return <IconPackContext value={{ collections, icons }}>{children}</IconPackContext>
}

export const useIconPack = () => use(IconPackContext)
