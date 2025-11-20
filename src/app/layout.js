import '../styles/globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Laser Tag Stats Manager',
  description: 'Manage and track laser tag game statistics',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
