import React from 'react';
import { Route, Switch } from "react-router-dom"
import About from "./about/index";

function App() {
  return (
    <div>
      <Switch>        
        <Route path="/about" component={About}/>
      </Switch>
    </div>
  );
}

export default App;
