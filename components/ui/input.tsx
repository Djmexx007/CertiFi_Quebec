import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`px-3 py-2 bg-zinc-800 border border-zinc-700 text-sm rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${className}`}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
