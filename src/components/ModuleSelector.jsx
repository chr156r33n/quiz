import { useState } from 'react'
import { modules } from '@/data/modules.js'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

export default function ModuleSelector({ onSelect, initialModule }) {
  const [selected, setSelected] = useState(initialModule || null)

  const handleSelect = (id) => {
    setSelected(id)
    onSelect(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
            Select a Module
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((m) => (
            <Button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className={`w-full text-lg py-6 Button ${selected === m.id ? 'bg-blue-600 text-white' : ''}`}
            >
              {m.title}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
