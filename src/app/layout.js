import './globals.css'

export const metadata = {
  title: 'Event Timer',
  description: 'Event countdown timer application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
