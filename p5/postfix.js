;(function() {
    const magic_methods = [
        'preload', 'setup', 'draw', 'keyPressed', 'keyReleased', 'keyTyped', 'deviceMoved',
        'deviceTurned', 'deviceShaken', 'mouseMoved', 'mouseDragged', 'mousePressed',
        'mouseReleased', 'mouseClicked', 'doubleClicked', 'mouseWheel'
    ];
    magic_methods.forEach(method => {
        try {
            // the only way to check ES Module scope is eval
            const value = eval(method);
            if (typeof value === 'function') {
                window[method] = value;
            }
        } catch(e) {}
    });
})();
