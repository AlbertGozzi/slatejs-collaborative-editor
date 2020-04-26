// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');

// Renaming
let app = express();
let server = http.Server(app);
let io = socketIO(server);

// For deployment
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});


// Set port for Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

app.set('port', port);

// app.use(express.static(path.join(__dirname, '../..')));

// // Routing
// app.get('/', function(request, response) {
//     response.sendFile(path.join(__dirname, '../client/html/index.html'));
//   });

// Starts the server.
server.listen(port, function() {
    console.log(`Starting server on port ${port}`);
});

// http.listen(4000, () => {
//     console.log('Listening on Port:4000');
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
        console.log(`New user in group: ${groupId}`);
        if (!(groupId in groupData)) {
            console.log('First user in group');
            groupData[groupId] = initialEditorValue;
        }
        console.log(`Sending initial value ${JSON.stringify(groupData[groupId].document.nodes[0].nodes[0].text)}`);
        console.log(` `);
        io.emit(`initial-value-${groupId}`, groupData[groupId]);
    });

    socket.on('new-operations', (data) => {
        groupData[data.groupId] = data.value;
        console.log(`Change in group [${data.groupId}]: ${groupData[data.groupId].document.nodes[0].nodes[0].text}`);
        io.emit(`new-remote-operations-${data.groupId}`, data);
    });
});
