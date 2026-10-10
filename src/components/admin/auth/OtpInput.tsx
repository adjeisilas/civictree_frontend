import React, { useEffect, useRef } from 'react'

interface OtpInputProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export default function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the first block on render
    firstInputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value
    if (isNaN(Number(val))) return

    const newValue = [...value]
    // Accept only the latest character
    newValue[index] = val.substring(val.length - 1)
    onChange(newValue)

    // Auto-advance cursor to next input box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newValue = [...value]

      // Erase previous input box and focus back if current is empty
      if (!value[index] && index > 0) {
        newValue[index - 1] = ''
        onChange(newValue)
        const prevInput = document.getElementById(`otp-${index - 1}`)
        prevInput?.focus()
      } else {
        newValue[index] = ''
        onChange(newValue)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').trim()
    if (pastedText.length !== 6 || isNaN(Number(pastedText))) return

    const newValue = pastedText.split('')
    onChange(newValue)

    // Focus last input box
    const lastInput = document.getElementById('otp-5')
    lastInput?.focus()
  }

  return (
    <div className="flex justify-center md:justify-start space-x-3">
      {value.map((digit, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          maxLength={1}
          value={digit}
          ref={idx === 0 ? firstInputRef : null}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-light-green/45 focus:border-primary transition-all duration-200 disabled:opacity-50"
        />
      ))}
    </div>
  )
}
