//Tests whether the React app is working correctly by rendering a simple component and checking if it appears in the document.
import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>CloudDeck Test Page</h1>
      <p>If you can see this text, the React app is working correctly.</p>
    </div>
  );
}

export default TestApp;
