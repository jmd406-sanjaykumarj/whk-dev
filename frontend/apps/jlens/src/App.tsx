// App.tsx
import "./App.css";
import { Routers } from "./routes";
import  MicrosoftAuthHandler  from "@/auth/microsoft-auth-handler";

function App() {
  return (
    <>
      <MicrosoftAuthHandler />
      <Routers />
    </>
   
  );
}

export default App;