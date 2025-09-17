import type { AppProps } from 'next/app'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FluentProvider theme={webLightTheme}>
      <Component {...pageProps} />
    </FluentProvider>
  )
}