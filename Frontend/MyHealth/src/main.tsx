import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@ant-design/v5-patch-for-react-19';

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store , persistor} from './redux/store/store.ts'


createRoot(document.getElementById('root')!).render(
<Provider store={store}>

<PersistGate loading={null} persistor={persistor}>

    <StrictMode>
        <App />
    </StrictMode>
    
</PersistGate>

</Provider>


)
