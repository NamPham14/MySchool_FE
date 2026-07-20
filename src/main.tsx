
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "386150696083-ated0bl4rfim4prhpq2n6q3q34ppoa6s.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
        <App />
    </Provider>
  </GoogleOAuthProvider>
)
