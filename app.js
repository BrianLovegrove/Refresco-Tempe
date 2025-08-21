const data = {
  "Line 2": ["Depal", "Empty Can Conveyors", "Filler", "Seamer", "Full Can Line", "Variopack", "Full Case Conveyor", "Palletizer"],
  "Line 3": ["Depal", "Empty Can Conveyors", "Filler", "Seamer", "Full Can Line", "Douglas Packer", "Full Case Conveyor", "Palletizer"],
  "Line 4": ["Depal", "Empty Can Conveyors", "Filler", "Seamer", "Full Can Line", "Douglas Packer", "Full Case Conveyor", "Palletizer"]
};

const container = document.getElementById('lines');

Object.keys(data).forEach(line => {
  const lineDiv = document.createElement('div');
  lineDiv.className = 'folder';
  lineDiv.innerText = line;
  lineDiv.onclick = () => {
    container.innerHTML = `<h2>${line}</h2>`;
    data[line].forEach(machine => {
      const machineDiv = document.createElement('div');
      machineDiv.className = 'folder';
      machineDiv.innerText = machine;
      container.appendChild(machineDiv);
    });
  };
  container.appendChild(lineDiv);
});