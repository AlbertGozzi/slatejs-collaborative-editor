import React from 'react';
import { SyncingEditor } from './SyncingEditor';

export const GroupEditor = (props) => {
    return (
        <div>
            <h3 className="title">Group: {props.match.params.id}</h3>
            <SyncingEditor groupId={props.match.params.id}/>
        </div>
    );
};