import React from 'react'
import Sidebar from '../components/Sidebar'
import ReadingArea from '../components/ReadingArea'
import { useReaderLogic } from '../components/useReaderLogic'

export default function Reader() {
  const reader = useReaderLogic()

  return (
    <div
      className="flex h-screen bg-gray-950 text-white relative overflow-hidden"
      onClick={reader.togglePanel}
    >
      <Sidebar {...reader} />
      <ReadingArea {...reader} />
    </div>
  )
}
