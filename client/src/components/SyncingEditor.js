import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createEditor, Editor, Transforms} from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import { jsx } from 'slate-hyperscript';
import { useSelected, useFocused } from 'slate-react';
import isHotkey from 'is-hotkey';
import io from 'socket.io-client';
import { css } from 'emotion'

const socket = io('http://localhost:5000');
const LIST_TYPES = ['numbered-list', 'bulleted-list']
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+p': 'theory'
};
const ELEMENT_TAGS = {
  A: el => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
}
// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}
export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return '\n'
  }

  const { nodeName } = el
  let parent = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat()

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el)
    return jsx('element', attrs, children)
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map(child => jsx('text', attrs, child))
  }

  return children
}

export const SyncingEditor = (props) => {
  const [value, setValue] = useState([]);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withHtml(withReact(createEditor()))), [])

  useEffect(() => {
    console.log("Mounting...");
    socket.emit('group-id', props.groupId);
  
    socket.once(`initial-value-${props.groupId}`, (value) => {
      console.log('Initial value received');
      setValue(value);
    });

    socket.on(`new-remote-operations-${props.groupId}`, ({editorId, ops, value}) => {
      if (socket.id !== editorId) {
        console.log('Remote operation');
        try {
          ops.forEach(op => editor.apply(op));
        } 
        catch (err) {
          console.log(`Hardcoding`); //TODO Review
          setValue(value);
        }
      }
    });

    return () => {
      socket.off(`new-remote-operations-${props.groupId}`);
      socket.disconnect();
    };
  }, []);

  return ( 
    <div className='main'>
        <section>
          <Slate 
            editor={editor} 
            value={value}
            onChange={value => {
              setValue(value);
              let isRemoteOperation = [...editor.operations].map(op => op.source).join('').length !== 0;
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
            <div className="toolbar">
              <MarkButton format="bold" icon="B"/>
              <MarkButton format="italic" icon="I"/>
              <MarkButton format="underline" icon="U"/>
              <MarkButton format="code" icon="Co"/>
              <MarkButton format="theory" icon="T"/>
              <BlockButton format="heading-one" icon="H1" />
              <BlockButton format="heading-two" icon="H2" />
              <BlockButton format="block-quote" icon="Q" />
              <BlockButton format="numbered-list" icon="OL" />
              <BlockButton format="bulleted-list" icon="UL" />
            </div>
            <Editable 
              className="editor" 
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={event => {
                for (const hotkey in HOTKEYS) {
                  if (isHotkey(hotkey, event)) {
                    event.preventDefault()
                    const mark = HOTKEYS[hotkey]
                    toggleMark(editor, mark)
                  }
                }
              }} 
            />
          </Slate>
        </section>
        <section>
          <h4 className="theoryTitle"> Theory Summary </h4>
          <div className="theoryEditor">
            {value.map((text,i) => {
              return <p key={i}>{text.children.map((element, j) => {
                if (element.theory) {
                  return <span key={j}>{element.text}</span>;
                }
                return '';
              })}</p>
            })}
          </div>          
        </section>
    </div>
  );
}

const toggleBlock = (editor, format) => {

  console.log(editor.children)
  console.log(`Format: ${format}`)

  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  console.log(`isActive: ${isActive}`)
  console.log(`isList: ${isList}`)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })
  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const withHtml = editor => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const html = data.getData('text/html')

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const fragment = deserialize(parsed.body)
      Transforms.insertFragment(editor, fragment)
      return
    }

    insertData(data)
  }

  return editor
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      )
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      )
    case 'image':
      return <ImageElement {...props} />
  }
}

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        className={css`
          display: block;
          max-width: 100%;
          max-height: 20em;
          box-shadow: ${selected && focused ? '0 0 0 2px grey;' : 'none'};
        `}
        alt={element.url}
      />
    </div>
  )
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.theory) { 
    children = <span className="theory">{children}</span>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <button
      className={`toolbarButton ${isBlockActive(editor, format).toString()}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      {icon}
    </button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <button
      className={`toolbarButton ${isMarkActive(editor, format).toString()}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <i class="fas fa-bold"></i>
      {/* {icon} */}
    </button>
  )
}

