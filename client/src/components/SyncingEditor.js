import React, { useState, useRef, useEffect } from 'react'
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { initialValue } from '../slateInitialValue';
import io from 'socket.io-client';

const socket = io('http://localhost:5000')


export const SyncingEditor = (props) => {
  const [value, setValue] = useState(initialValue);
  const id = useRef(`${Date.now()}`)
  const editor = useRef(null);
  const remote = useRef(false);
  // const socket = io('http://localhost:5000', {transports: ['websocket'], upgrade: false})

  useEffect(() => {
    console.log("Mounting...");
    socket.emit('group-id', props.groupId);
  
    socket.once(`initial-value-${props.groupId}`, (value) => {
      console.log('Initial value received');
      setValue(Value.fromJSON(value));
    });

    socket.on(`new-remote-operations-${props.groupId}`, ({editorId, ops, value}) => {
      if (id.current !== editorId) {
        console.log('Operation applied in app')
        remote.current = true;
        try {
          ops.forEach(op => editor.current.applyOperation(op))
        }
        catch(err) {
          console.log('Hardcoding'); // TODO; review
          setValue(Value.fromJSON(value));
        }
        remote.current = false;
      }
    });

    return () => {
      socket.off(`new-remote-operations-${props.groupId}`);
      socket.disconnect();
    };
  }, []);
 
  return ( 
    <div>
      <Editor 
        ref={editor}
        className="editor"
        value={value} 
  
        onChange={opts => {
          setValue(opts.value);
  
          // Create object to emit
          const ops = opts.operations
            .filter(o => {
              if (o) {
                return (
                  o.type !== "set_selection" &&
                  o.type !== "set_value" &&
                  (!o.data || !o.data.has("source"))
                );
              }
              return false;
            })
            .toJS()
            .map((o) => ({ ...o, data: { source: "one" } }));  
  
          // Emit object
          if (ops.length && !remote.current) {
            socket.emit('new-operations', {
              editorId: id.current, 
              ops: ops,
              value: opts.value.toJSON(),
              groupId: props.groupId
            })
          }      
        }}
      />
    </div>
  );
}