import { createContext, useState } from "react";
import "./App.css";
import Routeapp from "./route";

export const EmailContext = createContext();

function App() {
  const [email, Setemail] = useState("");
  return (
    <div className="App">
      <EmailContext.Provider value={{ email, Setemail }}>
        <Routeapp />
      </EmailContext.Provider>
    </div>
  );
}

export default App;
