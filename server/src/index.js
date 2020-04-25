const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

const initialEditorValue = {
    document: {
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          nodes: [
            {
              object: 'text',
              text: 'A line of text in a paragraph.',
            },
          ],
        },
      ],
    },
};

const groupData = {};

io.on('connection', (socket) => {
    socket.on('group-id', (groupId) => {
        console.log(` `);
        console.log(`Group received ${groupId}`);
        if (!(groupId in groupData)) {
            console.log('Setting default');
            groupData[groupId] = initialEditorValue;
        }
        console.log(`Sending initial value ${JSON.stringify(groupData[groupId].document.nodes[0].nodes[0].text)}`);
        io.emit(`initial-value-${groupId}`, groupData[groupId]);
    });

    socket.on('new-operations', (data) => {
        groupData[data.groupId] = data.value;
        console.log(`Operation received [${data.groupId}]: ${groupData[data.groupId].document.nodes[0].nodes[0].text}`);
        io.emit(`new-remote-operations-${data.groupId}`, data);
    });
});
  
http.listen(4000, () => {
    console.log('Listening on Port:4000');
});