var colours = [
   '#277068',
   '#41938B',
   '#338279',
   '#1C5E57',
   '#134C46',
   '#314A78',
   '#4E6A9E',
   '#3F5A8B',
   '#243B65',
   '#1A2D51',
   '#419533',
   '#66C457',
   '#52AD44',
   '#317D25',
   '#236519'
];

function successor(m, p, i, network) {
  var j, k;

  k = (p + Math.pow(2, i - 1)) % Math.pow(2, m);
  j = 0;

  while (k > network[j]) {
    j++;

    if (j === network.length) {
      return network[0];
    }
  }

  return network[j];
}

function render_peers() {
  var peer_select = document.getElementById("select_peers");
  var yourSelect = document.getElementById("select_m");
  var m = parseInt(yourSelect.options[ yourSelect.selectedIndex ].value, 10);

  // nuke
  while(peer_select.firstChild){
    peer_select.removeChild(peer_select.firstChild);
  }

  for (var i = 0; i < Math.pow(2, m); i++) {
    var peer = document.createElement("div");
    peer.setAttribute('class', 'peer');
    peer.textContent = i;
    peer_select.appendChild(peer);

    peer.addEventListener('click', function(e) {
      e.target.classList.toggle('inactive');
      render_graph();
    });
  }
}

function render_graph() {
  var width = 600,
      height = 600,
      padding = 50;

  var yourSelect = document.getElementById("select_m");
  var m = parseInt(yourSelect.options[ yourSelect.selectedIndex ].value, 10);
  var network = [];
  var select_peers = document.getElementById("select_peers");
  var peers = select_peers.getElementsByClassName('peer');

  for (var i = 0; i < Math.pow(2, m); i++) {
    if (!peers[i].classList.contains('inactive')) {
      network.push(i);
    }
  }

  var svg = document.getElementById('chord_dht');
  var emptySvg = svg.cloneNode(false);
  document.getElementById('chord_svg_container').removeChild(svg);
  document.getElementById('chord_svg_container').appendChild(emptySvg);
  svg = emptySvg;

  svg.setAttribute('height', height);
  svg.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
  svg.setAttribute('width',width);

  var circle = document.createElementNS('http://www.w3.org/2000/svg','circle'),
      radius = width/2 - (padding * 2);

  circle.setAttribute('cx', width/2);
  circle.setAttribute('cy', height/2);
  circle.setAttribute('r', radius);
  circle.setAttribute('stroke', 'black');
  circle.setAttribute('stroke-width', '1');
  circle.setAttribute('fill', 'none');

  document.getElementById('chord_svg_container').appendChild(svg);
  svg.appendChild(circle);

  var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  var group2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  var group3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('transform', "translate(" + width/2 + "," + height/2 + ")");
  group.setAttribute('class', 'chord-dht-peers');
  group3.setAttribute('class', 'chord-dht-peers');
  svg.appendChild(group2);
  svg.appendChild(group);
  svg.appendChild(group3);

  var n = Math.pow(2, m);
  var deg = 0;

  var circles = [];

  for (var i = 0; i < n; i++) {
    circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '20');
    circle.setAttribute('stroke-width', '0');
    circle.setAttribute('data-index', i);

    if (network.indexOf(i) != -1) {
      circle.setAttribute('fill', colours[i % colours.length]);
      deg += (360 / network.length);
      group.appendChild(circle);
      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', -radius);
      circle.setAttribute('transform', 'rotate(' + deg + ')');
    }

    circles.push(circle);
  }

  function getPos(circle) {
    var matrix = circle.getCTM();
    // transform a point using the transformed matrix
    var position = svg.createSVGPoint();
    position.x = circle.getAttribute("cx");
    position.y = circle.getAttribute("cy");
    position = position.matrixTransform(matrix);
    return position;
  }


  for (var i = 0; i < network.length; i++) {
    var peer = network[i];
    var circle = circles[peer];
    var pos1 = getPos(circles[peer]);

    for (var j = 0; j < m; j++) {
      var peer2 = successor(m, network[i], j + 1, network);
      var circle2 = circles[peer2];
      var pos2 = getPos(circles[peer2]);

      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute("d", "M" + pos1.x + " " + pos1.y + " " + pos2.x + " " + pos2.y);
      p.setAttribute("stroke", colours[peer % colours.length]);
      p.setAttribute("stroke-width", "2");
      p.setAttribute("class", peer);
      group2.appendChild(p);
    }

    var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('fill', 'white');
    label.textContent = peer;
    label.setAttribute('font-family', 'Jura');
    label.setAttribute('font-size', '11px');
    group3.appendChild(label);

    label.setAttribute('x', pos1.x - label.getBBox().width/2);
    label.setAttribute('y', pos1.y + 2);
    label.setAttribute('data-index', peer);


    label.addEventListener('mouseover', function(e) {
      for (var i = 0; i < group2.children.length; i++) {
        var path = group2.children[i];

        if (path.getAttribute('class') != e.target.getAttribute('data-index')) {
          path.setAttribute('opacity', '0.1');
        }
      }

      var tooltip = document.getElementById('tooltip');

      // set tooltip data
      tooltip.querySelector('.title').textContent = 'P' + e.target.getAttribute('data-index') + ' Finger Table';
      var table = tooltip.querySelector('.table');

      // nuke
      while(table.firstChild){
        table.removeChild(table.firstChild);
      }

      for (var i = 0; i < m; i++) {
        var row = document.createElement('div');
        var index = parseInt(e.target.getAttribute('data-index'), 10);
        row.textContent = (i + 1) + '. ' + 'succ(' + ((parseInt(e.target.getAttribute('data-index'), 10) + Math.pow(2, i)) % Math.pow(2, m)) + ') = ' + successor(m, parseInt(e.target.getAttribute('data-index'), 10), i + 1, network);
        table.appendChild(row);
      }

      tooltip.style.top = e.pageY;
      tooltip.style.left = e.pageX;
      tooltip.style.opacity = '1';
    });

    circle.addEventListener('mouseover', function(e) {
      for (var i = 0; i < group2.children.length; i++) {
        var path = group2.children[i];

        if (path.getAttribute('class') != e.target.getAttribute('data-index')) {
          path.setAttribute('opacity', '0.1');
        }
      }

      var tooltip = document.getElementById('tooltip');

      // set tooltip data
      tooltip.querySelector('.title').textContent = 'P' + e.target.getAttribute('data-index') + ' Finger Table';
      var table = tooltip.querySelector('.table');

      // nuke
      while(table.firstChild){
        table.removeChild(table.firstChild);
      }

      for (var i = 0; i < m; i++) {
        var row = document.createElement('div');
        var index = parseInt(e.target.getAttribute('data-index'), 10);
        row.textContent = (i + 1) + '. ' + 'succ(' + ((parseInt(e.target.getAttribute('data-index'), 10) + Math.pow(2, i)) % Math.pow(2, m)) + ') = ' + successor(m, parseInt(e.target.getAttribute('data-index'), 10), i + 1, network);
        table.appendChild(row);
      }

      tooltip.style.top = e.pageY;
      tooltip.style.left = e.pageX;
      tooltip.style.opacity = '1';
    });

    circle.addEventListener('mouseout', function(e) {
      for (var i = 0; i < group2.children.length; i++) {
        var path = group2.children[i];
        path.setAttribute('opacity', '1');
      }
       document.getElementById('tooltip').style.opacity = '0';
    });

    circle.addEventListener('mouseout', function(e) {
      for (var i = 0; i < group2.children.length; i++) {
        var path = group2.children[i];
        path.setAttribute('opacity', '1');
      }
       document.getElementById('tooltip').style.opacity = '0';
    })
  }
}

document.getElementById("select_m").addEventListener('change', function(e) {
  render_peers();
  render_graph();
});

render_peers();
render_graph();
