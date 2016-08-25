/**
* Chordgen App JS
*
* @Author : Mayank Sindwani
* @Date   : 2016-08-25
* @license: MIT
*
* Description : Application javascript.
**/

(function() {

    var network,
        colours;

    network = [];
    colours = [
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

    /**
     *   Methods
     **/

    // Returns the successor for the given peer `p` and index `i`.
    function successor(m, p, i) {
        var j, k;
        j = 0;

        // Determine the "expected" successor.
        if (i == 0) {
            k = p;
        } else {
            k = (p + Math.pow(2, i - 1)) % Math.pow(2, m);
        }

        // Find the closest peer that does not exceed the `k` value.
        while (k > network[j]) {
            j++;

            if (j === network.length) {
                return network[0];
            }
        }

        return network[j];
    }

    // Returns the successor while accounting for congruence.
    function congruence(p, i, m) {
        if (p + Math.pow(2, i - 1) >= Math.pow(2, m)) {
            return successor(m, p, i) + Math.pow(2, m);
        }

        return successor(m, p, i);
    }

    // Returns the position of the provided SVG element.
    function getPos(svg, elem) {
        var matrix,
            position;

        matrix = elem.getCTM();
        position = svg.createSVGPoint();
        position.x = elem.getAttribute("cx");
        position.y = elem.getAttribute("cy");
        position = position.matrixTransform(matrix);
        return position;
    }

    // Renders the peer selectors.
    function render_peers() {
        var peerSelect,
            mSelect,
            peer,
            i,
            m;

        peerSelect = document.getElementById("select_peers");
        mSelect = document.getElementById("select_m");
        m = parseInt(mSelect.options[mSelect.selectedIndex].value, 10);

        // Nuke peer selections.
        while (peerSelect.firstChild) {
            peerSelect.removeChild(peerSelect.firstChild);
        }

        // Render the new peer selectors.
        for (i = 0; i < Math.pow(2, m); i++) {
            peer = document.createElement("div");
            peer.setAttribute('class', 'peer');
            peer.textContent = i;
            peerSelect.appendChild(peer);

            peer.addEventListener('click', function(e) {
                e.target.classList.toggle('inactive');
                render_graph();
            });
        }
    }

    // Render the Chord DHT.
    function render_graph() {
        var width, height, padding,
            group, group2, group3,
            peers, circle, radius,
            mSelect, peerSelect,
            svg, emptySvg, deg,
            n, m, i, j,
            circles;

        width   = 600,
        height  = 600,
        padding = 50;

        // Query the dom.
        peerSelect = document.getElementById("select_peers");
        mSelect    = document.getElementById("select_m");
        svg        = document.getElementById('chord_dht');

        // Get Chord DHT values.
        m       = parseInt(mSelect.options[mSelect.selectedIndex].value, 10);
        peers   = peerSelect.getElementsByClassName('peer');
        network = [];

        // Update the network with active peers.
        for (i = 0; i < Math.pow(2, m); i++) {
            if (!peers[i].classList.contains('inactive')) {
                network.push(i);
            }
        }

        // Update max constraints.
        document.getElementById('lookup_content_id').setAttribute('max', Math.pow(2, m) - 1);
        document.getElementById('lookup_peer_id').setAttribute('max', Math.pow(2, m) - 1);

        // Reset the svg element.
        emptySvg = svg.cloneNode(false);
        document.getElementById('chord_svg_container').removeChild(svg);
        document.getElementById('chord_svg_container').appendChild(emptySvg);
        svg = emptySvg;
        svg.setAttribute('height', height);
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svg.setAttribute('width', width);

        // Create the chord circle.
        circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        radius = width / 2 - (padding * 2);
        circle.setAttribute('cx', width / 2);
        circle.setAttribute('cy', height / 2);
        circle.setAttribute('r', radius);
        circle.setAttribute('stroke', 'black');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('fill', 'none');

        // Create the path groups.
        svg.appendChild(circle);
        group  = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group3 = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        group.setAttribute('transform', "translate(" + width / 2 + "," + height / 2 + ")");
        group.setAttribute('class', 'chord-dht-peers');
        group.setAttribute('id', 'chord_dht_peers');

        group2.setAttribute('id', 'chord_dht_paths');
        group3.setAttribute('class', 'chord-dht-peers');

        svg.appendChild(group2);
        svg.appendChild(group);
        svg.appendChild(group3);

        n   = Math.pow(2, m);
        deg = 0;

        // Create the peers.
        circles = [];
        for (i = 0; i < n; i++) {
            circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '20');
            circle.setAttribute('stroke-width', '0');
            circle.setAttribute('data-index', i);

            // Assign a colour and transformation.
            if (network.indexOf(i) != -1) {
                circle.setAttribute('fill', colours[i % colours.length]);
                deg += (360 / network.length);
                group.appendChild(circle);
                circle.setAttribute('cx', 0);
                circle.setAttribute('cy', -radius);
                circle.setAttribute('transform', 'rotate(' + deg + ')');
                circle.setAttribute('data-index', i);
            }

            circles.push(circle);
        }

        // Draw the paths.
        for (i = 0; i < network.length; i++) {
            var peer = network[i];
            var circle = circles[peer];
            var pos1 = getPos(svg, circles[peer]);

            for (j = 0; j < m; j++) {
                var peer2 = successor(m, network[i], j + 1, network);
                var circle2 = circles[peer2];
                var pos2 = getPos(svg, circles[peer2]);

                // Create paths between circles.
                var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute("d", "M" + pos1.x + " " + pos1.y + " " + pos2.x + " " + pos2.y);
                p.setAttribute("stroke", colours[peer % colours.length]);
                p.setAttribute("stroke-width", "2");
                p.setAttribute("class", peer);
                p.setAttribute('id', peer + '_' + peer2);
                group2.appendChild(p);
            }

            // Add a label for the peer.
            var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('fill', 'white');
            label.textContent = peer;
            label.setAttribute('font-family', 'Jura');
            label.setAttribute('font-size', '11px');
            group3.appendChild(label);

            label.setAttribute('x', pos1.x - label.getBBox().width / 2);
            label.setAttribute('y', pos1.y + 2);
            label.setAttribute('data-index', peer);

            // Attach event handlers.
            label.addEventListener('mouseover' , function(e) { onPeerMouseover(e, m) });
            circle.addEventListener('mouseover', function(e) { onPeerMouseover(e, m) });
            circle.addEventListener('mouseout' , onPeerMouseout);
        }
    }

    /**
     *   Event Handlers
     **/

    // Fired when the user hovers over a peer.
    function onPeerMouseover(e, m) {
        var i, path, paths, svg, tooltip, table,
            row, index;

        svg     = document.getElementById('chord_dht');
        paths   = svg.getElementById('chord_dht_paths');
        tooltip = document.getElementById('tooltip');
        table   = tooltip.querySelector('.table');

        for (i = 0; i < paths.children.length; i++) {
            path = paths.children[i];

            if (path.getAttribute('class') != e.target.getAttribute('data-index')) {
                path.setAttribute('opacity', '0.1');
            } else {
                path.setAttribute('opacity', '1');
            }
        }

        // Set tooltip data.
        tooltip.querySelector('.title').textContent = 'P' + e.target.getAttribute('data-index') + ' Finger Table';

        while (table.firstChild) {
            // Nuke table elements.
            table.removeChild(table.firstChild);
        }

        for (var i = 0; i < m; i++) {
            row = document.createElement('div');
            index = parseInt(e.target.getAttribute('data-index'), 10);
            row.textContent = (i + 1) + '. ' + 'succ('
                + ((parseInt(e.target.getAttribute('data-index'), 10) + Math.pow(2, i)) % Math.pow(2, m)) + ') = '
                + successor(m, parseInt(e.target.getAttribute('data-index'), 10), i + 1, network);
            table.appendChild(row);
        }

        // Set tooltip position.
        tooltip.style.top     = e.pageY + "px";
        tooltip.style.left    = e.pageX + "px";
        tooltip.style.opacity = '1';
    }

    // Fired when the user moves the cursor away from a peer.
    function onPeerMouseout(e) {
        var i, path, paths, svg;

        svg   = document.getElementById('chord_dht');
        paths = svg.getElementById('chord_dht_paths');

        for (i = 0; i < paths.children.length; i++) {
            path = paths.children[i];
            path.setAttribute('opacity', '1');
        }
        document.getElementById('tooltip').style.opacity = '0';
    }

    // Fired when the user changes the value of `m`.
    function onMChanged(e) {
        render_peers();
        render_graph();
    }

    // Fired when the user initiates a lookup.
    function onLookupInput(e) {
        var lookup_peer;

        lookup_peer = document.getElementById('lookup_peer_id');

        // Ensure that the peer exists in the network.
        if (network.indexOf(parseInt(lookup_peer.value, 10)) < 0) {
            lookup_peer.setCustomValidity("The specified peer does not exist in the network.");
        } else {
            lookup_peer.setCustomValidity("");
        }
    }

    // Fired when a lookup is initiated.
    function onLookup(e) {
        var lookupContent, lookupPeer, peerSelect, mSelect,
            last, next, succ, cur,
            j, i, q, p, m, o,
            paths, path,
            x1, x2,
            svg;

        e.stopPropagation();
        e.preventDefault();

        // Query the dom.
        lookupContent = document.getElementById('lookup_content_id');
        lookupPeer    = document.getElementById('lookup_peer_id');
        mSelect       = document.getElementById("select_m");
        svg           = document.getElementById('chord_dht');

        // Assign Chord DHT values.
        q = parseInt(lookupContent.value, 10);
        p = parseInt(lookupPeer.value, 10);
        m = parseInt(mSelect.options[mSelect.selectedIndex].value, 10);
        paths = svg.getElementById('chord_dht_paths');

        // Set transparencies.
        for (i = 0; i < paths.children.length; i++) {
            path = paths.children[i];
            path.setAttribute('opacity', '0.1');
        }

        succ = successor(m, q, 0);
        o    = q;

        // At most m hops...
        for (var i = 0; i < m; i++) {

            if (p == succ)
                break;

            last = p;
            q    = o;

            if (q < p) {
                q += Math.pow(2, m);
            } else {
                q = q % Math.pow(2, m);
            }

            // Determine the next successor.
            if (p < q && q < congruence(p, 1, m)) {
                p = successor(m, p, 1, network);
            } else if (q >= congruence(p, m, m)) {
                p = successor(m, p, m, network);
            } else {
                for (j = 0; j < m - 1; j++) {
                    x1 = congruence(p, j + 1, m);
                    x2 = congruence(p, j + 2, m);

                    if (x1 <= q && q < x2) {
                        p = successor(m, p, j + 1, network);
                        break;
                    }
                }
            }

            // Highlight the next hop.
            svg.getElementById(last + '_' + p).setAttribute('opacity', '1');
        }
    }

    // Bind event handlers.
    document.getElementById("select_m").addEventListener('change', onMChanged);
    document.getElementById('lookup_peer_id').addEventListener('input', onLookupInput);
    document.getElementById("lookup_content").addEventListener('submit', onLookup);

    // Initialize the DHT diagram.
    render_peers();
    render_graph();

})(this);
