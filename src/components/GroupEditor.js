import React from 'react';
import { SyncingEditor } from './SyncingEditor';

export const GroupEditor = (props) => {
    return (
        <div>
            <h1 className="title">Group: {props.match.params.id}</h1>
            <SyncingEditor groupId={props.match.params.id}/>
        </div>
    );
};