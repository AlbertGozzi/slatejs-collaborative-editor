import React from 'react';
import './App.css';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { GroupEditor } from './components/GroupEditor';

const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Route 
          path="/" 
          exact 
          render={() => {
            return <Redirect to={`/group/${Date.now()}`}/>;
          }}
        />
        <Route path="/group/:id" render={props => <GroupEditor {...props} />} />
      </BrowserRouter>    

    </div>   
  );
}

export default App;