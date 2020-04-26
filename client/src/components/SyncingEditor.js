import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react'
import io from 'socket.io-client';

const socket = io('http://localhost:5000');


export const SyncingEditor = (props) => {
  // const [value, setValue] = useState(initialValue);
  const [value, setValue] = useState([]);
  const editor = useMemo(() => withReact(createEditor()), [])

  useEffect(() => {
    console.log("Mounting...");
    socket.emit('group-id', props.groupId);
  
    socket.once(`initial-value-${props.groupId}`, (value) => {
      console.log('Initial value received');
      // setValue(Value.fromJSON(value));
      setValue(value);
    });

    socket.on(`new-remote-operations-${props.groupId}`, ({editorId, ops, value}) => {
      if (socket.id !== editorId) {
        console.log('Remote operation');
        ops.forEach(op => editor.apply(op));
      }
    });

    return () => {
      socket.off(`new-remote-operations-${props.groupId}`);
      socket.disconnect();
    };
  }, []);
 
  return ( 
    <div>
        <Slate 
          editor={editor} 
          value={value}
          onChange={value => {
            // console.log(value);
            setValue(value);
            // console.log(value);

            let isRemoteOperation = [...editor.operations].map(op => op.source).join('').length !== 0;

            // if (isRemoteOperation) {
            //   console.log(`REMOTE - New operation`);
            // } else {
            //   console.log(`LOCAL - New operation`);
            // }

            if (!isRemoteOperation) {
              // console.log(`Before transformation `);
              // console.log(editor.operations);

              // Create object to emit
              const ops = editor.operations
                .filter(o => {
                  if (o) {
                    return (
                      o.type !== "set_selection" &&
                      // o.type !== "set_value" &&
                      !o.source
                    );
                  }
                  return false;
                })
                .map((o) => ({ ...o, source: socket.id }));  
    
              // console.log(`After transformation `);
              // console.log(ops);

              // Emit object
              if (ops.length && !isRemoteOperation) {
                console.log('Emitting')
                socket.emit('new-operations', {
                  editorId: socket.id, 
                  ops: ops,
                  value: value,
                  groupId: props.groupId
                })
              }      
            }
          }} 
        >
          <Editable className="editor" />
        </Slate>
    </div>
  );
}