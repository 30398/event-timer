"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <DialogPrimitive.Content
      ref={ref}
      className="fixed z-50 gap-4 bg-gray-800/95 p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}) => (
  <div
    className="flex flex-col space-y-2 text-center sm:text-left"
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className="text-lg font-semibold text-white"
    {...props}
  />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
}
