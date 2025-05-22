//global variables in a huge pile bc front-end is my passion /s
let modal = document.getElementById('popup');
let list = document.getElementById('listview');
const button = document.getElementById('nodebutton');
const submitbutton = document.getElementById('submitbutton');
let event = document.getElementById('event');
let createButton = document.getElementById('create')
let closeButton = document.getElementById('close');
let information = document.getElementById('information');
let counter = 1;
const imageUpload = document.getElementById('imagebutton')
const infoButton = document.getElementById('openInfo');
const infoModal = document.getElementById('node-info');
let scroll = document.getElementById('scroll');


//Create our background/canvas/graph, whatever you want to call it.
const graph = new X6.Graph({
    container: document.getElementById('container'),
    width: 1200, //need to be variable so it's responsive
    height: 750, //same as above
    background: {
        color: '#f5f5f5',
    },
    connecting: {
        router: {
            name: 'manhattan',
            args: {
                offset: 'center',
                padding: 16,
                //min: 41,
            },
        },
        connector: {
            name: 'rounded',
            args: {
                radius: 15,
            },
        },
        //anchor: 'center',
        //connectionPoint: 'anchor',
        //allowBlank: false,
        snap: {
            radius: 20,
        },
        validateConnection({ targetMagnet }) {
            return !!targetMagnet
        },

    },


    highlighting: {
        magnetAdsorbed: {
            name: 'stroke',
            args: {
                attrs: {
                    fill: '#5F95FF',
                    stroke: '#5F95FF',
                },
            },
        },
    },

    //some canvas parameters like can i rotate the nodes, can i select them?
    resizing: true,
    selecting: {
        enabled: true,
        //rubberband: true,
        showNodeSelectionBox: false,
    },
    // snapline: true,
    keyboard: true,
    //clipboard: true,
    embedding: {
        enabled: true, // Allow embedding of child nodes into parent nodes
    },

    //locks the timeline nodes into place, by checking if it has the "independent" attribute or not. Copilot helped adapt code from X6 documentation.
    translating: {
        restrict(cellView) {
            const cell = cellView.cell;

            //independent nodes can move freely
            if (cell.getProp('independent')) {
                return null; //not imposing restriction
            }

            // basically assigning the parent node to its own bounding box, i.e. it can't move outside of itself. Therefore locking it in place.
            const parentId = cell.prop('parent');
            if (parentId) {
                const parentNode = graph.getCellById(parentId);
                if (parentNode) {
                    return parentNode.getBBox();
                }
            }

            return cell.getBBox(); //normal behaviour for independent nodes
        },
    },
});

//Timeline generation, creates concentric circles. Copilot helped with creating bc of the calculations required.
function createTimeline(graph, numRings, initialSize, yearValues) {

    const canvasWidth = 1200; // Canvas width
    const canvasHeight = 750; // Canvas height
    const diagonal = Math.sqrt(canvasWidth ** 2 + canvasHeight ** 2); // Diagonal of the canvas
    const sizeIncrement = (diagonal * 1.7 - initialSize) / (numRings - 1); // Increment for each ring

    for (let i = 0; i < numRings; i++) {
        const size = initialSize + i * sizeIncrement; // Calculate the size of the ring
        const ringPosition = {
            x: -size / 2, // Center the ring horizontally
            y: canvasHeight - size / 2, // Center the ring vertically (align with bottom-left corner)
        };

        let circle = graph.addNode({
            id: `ring${i + 1}`,
            shape: 'circle',
            width: size,
            height: size,
            position: ringPosition,
            attrs: {
                body: {
                    pointerEvents: 'none',
                    fill: `rgba(130, 130, 130, ${0.67 - i * 0.1})`, // reduce opacity gradually
                    stroke: 'none',
                    rx: 10,
                    ry: 10,
                },
            },
        });

        circle.toBack();

        const datePosition = {
            x: 200 + i * 200, // Reduce the increment for x to make nodes closer horizontally
            y: canvasHeight - (250 + i * 150),
        };

        graph.addNode({
            id: `date${i + 1}`,
            shape: 'rect',
            label: yearValues[i], //input.value
            width: 100,
            height: 80,
            zIndex: 10,
            position: datePosition,
            parent: `ring${i + 1}`,
            attrs: {
                body: {
                    fill: 'none',
                    stroke: 'none',
                    rx: 10,
                    ry: 10,
                },
                text: {
                    fill: 'black',
                    fontFamily: 'arial',
                    fontWeight: 'bold',
                    fontSize: '20',
                },
            },
        });

    }

};

document.addEventListener('DOMContentLoaded', () => {
    const inputContainer = document.getElementById('input-container');
    const addButton = document.getElementById('add-button');

    // Function to add a new input field
    const addInputField = () => {
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.classList.add('year-input');
        inputField.placeholder = 'Year/Date';

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.textContent = 'x';

        // Add event listener to remove button
        removeButton.addEventListener('click', () => {
            if (inputContainer.children.length > 1) {
                inputGroup.remove();
            }
        });

        inputGroup.appendChild(inputField);
        inputGroup.appendChild(removeButton);
        inputContainer.appendChild(inputGroup);
    };

    // Add event listener to the add button
    addButton.addEventListener('click', addInputField);

    // Ensure there is always at least one input field
    if (inputContainer.children.length === 0) {
        addInputField();
    }
});

button.onclick = function() {
    modal.style.display = 'block';
};


//function for creating a timeline
createButton.addEventListener('click', () => {
    //look at how many inputs the user has created for years
    let years = document.querySelectorAll('.year-input');
    console.log(years);
    //make that nodelist into an array
    let yearArray = Array.prototype.slice.call(years);

    //numrings is the length of the array
    let numRings = yearArray.length;

    //mapping the array to get the respective values of the inputs
    let yearValues = yearArray.map(input => input.value);

    //clear the graph just incase theres something already on there (otherwise it messes with z-index)
    graph.clearCells();

    //call the function we made earlier
    createTimeline(graph, numRings, 800, yearValues);

})

//simple button for closing the information window/timeline creation window
closeButton.addEventListener('click', () => {
    information.style.display = 'none';
    modal.style.display = 'none';
});


//clicking outside the add node modal clsoes it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

graph.bindKey('backspace', () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
        cells.forEach((cell) => {
            if (cell.isNode()) {
                // Remove the corresponding list item
                const listItems = document.querySelectorAll('li');
                listItems.forEach((li) => {
                    if (li.innerHTML.trim() === cell.label) {
                        li.remove();
                    }
                });
            }
        });

        // Remove the selected cells from the graph
        graph.removeCells(cells);
    }
});


//Textbox function from x6 documentation.
/*graph.on('cell:dblclick', ({ cell, e }) => {
    const isNode = cell.isNode() //IS it a node?
    const name = cell.isNode() ? 'node-editor' : 'edge-editor' //um does it have some tools embedded in the node or the edge
    cell.removeTool(name) //lets remove that bc it might mess with our new one
    cell.addTools({ //add the textbox!!
        name,
        args: {
            event: e,
            attrs: {
                backgroundColor: isNode ? '#EFF4FF' : '#FFF',
            },
        },
    })
})*/


//Ports visibility: i.e. they are visible when hovering with mouse, invisible when not. Adapted from x6 documentation with help from copilot. it's the three functions below!
const showPorts = (ports, show) => {
    for (let i = 0, len = ports.length; i < len; i++) {
        ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
};

graph.on('node:mouseenter', () => {
    const container = document.getElementById('container');
    if (!container) return; //gtfo if we're not in the graph container
    const ports = container.querySelectorAll('.x6-port-body');
    showPorts(ports, true);

});

graph.on('node:mouseleave', () => {
    const container = document.getElementById('container');
    if (!container) return;
    const ports = container.querySelectorAll('.x6-port-body');
    showPorts(ports, false);
});


//adapted from x6 documentation, creates a delete button on the node when hovering over it. Copilot helped with the logic of removing the node and the list item.
graph.on('node:mouseenter', ({ node }) => {
    if (node.isNode()) {
        node.addTools({
            name: 'button-remove',
            args: {
                x: 0,
                y: 0,
                offset: { x: 15, y: 15 },
                onClick: () => {
                    // Remove the node from the graph
                    graph.removeCell(node);

                    // Remove the corresponding list item
                    const listItems = document.querySelectorAll('li');
                    listItems.forEach((li) => {
                        if (li.innerHTML.trim() === node.label) {
                            li.remove();
                        }
                    });
                },
            },
        });
    }
});

//same as with ports, only visible when hovering
graph.on('node:mouseleave', ({ node }) => {
    if (node.isNode()) {
        node.removeTools(); // Remove the delete button when not hovering
    }
});

//dynamically updated info window for each node. copilot once again help (can you tell i was burning out)
graph.on('cell:dblclick', ({ node }) => {
    console.log('hi');
    const nodeData = node.getData(); // Retrieve the node's data
    console.log(nodeData);
    if (nodeData && nodeData.description) {
        console.log('hello again')
        const infoContent = document.querySelector('#node-info .node-info-content');
        const label = node.label || node.getProp('label') || 'No Label';
        const imageURL = node.imageURL || node.getProp('imageUrl') || null;

        // Update the modal content with the node's information
        infoContent.innerHTML = `
            <button id='close2'>Close</button>
            <h1>${label}</h1>
            <img src='${imageURL}' alt='Node Image' style='max-width: 100%; max-height: 200px;'/><br>
            <p class='nodetext'>${nodeData.description}</p>
        `;

        // Show the modal
        infoModal.style.display = 'inline-block';

        // and close...
        document.getElementById('close2').onclick = () => {
            infoModal.style.display = 'none';
        };
    }
});

infoButton.onclick = function() {
    information.style.display = 'block'; //open the timeline creation window
};

//open window with inputs for each relevant node info
//second button in said window which actually adds this into the data object
submitbutton.onclick = function() {

    //establish a bunch of variables
    let [file] = imageUpload.files;
    let listChild = document.createElement('li');
    let newNodeName = document.getElementById('name').value.toString();
    let description = document.getElementById('description').value.toString();
    let nodeId = counter.toString();
    counter++; //this helps with keeping ids separate so you can have several nodes with the same name (by updating the id for each)
    let colour = ''; //empty variables for later use
    let textPosition = '';
    var radios = document.querySelectorAll('input[type="radio"]:checked'); //looking at which radio button is checked
    var value = radios.length > 0 ? radios[0].value : null; //if radios.length is more than 0, set the variable to the value of the checked radio. else it's null.
    let width = 90;
    let height = 50;
    //some conditionals for changing which colour the created node will be, and how the text will be positioned.
    if (value === 'place') {
        colour = '#2F7370'
        textPosition = '50%'
    } else if (value === 'person') {
        colour = '#FF8F2C'
        textPosition = '50%'
    } else if (value === 'event') {
        colour = '#D82D3E'
        textPosition = '50%'
        height = 40;
    } else {
        alert('Please select a category!');
        return;
    }

    list.append(listChild); //updating the list with the new node
    listChild.innerHTML = newNodeName;

    //here's where the fun happens...
    graph.addNode({
        id: nodeId,
        shape: 'rect',
        width: width,
        height: height,
        label: newNodeName,
        //independent might be useless now, was essential for a prev version of the prototype though.
        independent: true,
        position: {
            x: 20,
            y: 20,},
        //image stuff. adding a new property to the code that stores the uploaded image as a url that then can be passed to the dynamically updated info window. if no image it just returns null.
        imageUrl: file ? URL.createObjectURL(file) : null,
        data: { description }, //MORE properties. stores the string from the description textarea. also for use in the mentioned info window function.
        attrs: {
            body: {
                fill: colour,
                stroke: colour,
                rx: 10,
                ry: 10,
            },
            text: {
                fill: '#fff',
                fontFamily: 'arial',
                fontWeight: 'bold',
                fontSize: '13',
                refY: textPosition,
                textWrap: {
                    width: width,
                    height: height,
                },
            },
        },
        //ports for drawing lines between nodes.
        ports: {
            groups: { in: {
                    position: 'top',
                    attrs: {
                        circle: {
                            r: 7,
                            magnet: true,
                            stroke: colour,
                            strokeWidth: 2,
                            fill: '#fff',
                        },
                    },
                },
                out: {
                    position: 'bottom',
                    attrs: {
                        circle: {
                            r: 7,
                            magnet: true,
                            stroke: colour,
                            strokeWidth: 2,
                            fill: '#fff',
                        },
                    },
                },
                in2: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 7,
                            magnet: true,
                            stroke: colour,
                            strokeWidth: 2,
                            fill: '#fff',
                        },
                    },
                },
                out2: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 7,
                            magnet: true,
                            stroke: colour,
                            strokeWidth: 2,
                            fill: '#fff',
                        },
                    },
                },
            },
            items: [{
                    id: 'port1',
                    group: 'in',
                },
                {
                    id: 'port3',
                    group: 'in2',
                },
                {
                    id: 'port4',
                    group: 'out',
                },
                {
                    id: 'port5',
                    group: 'out2',
                },
            ],
        },

    }, )
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
};