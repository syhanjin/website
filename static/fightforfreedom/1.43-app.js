const appElement = document.getElementById('app');
const launchScreen = document.getElementById('launch');
const loadingScreen = document.getElementById('loading');
const loadingInner = document.getElementById('loading-inner');
const errorScreen = document.getElementById('error');
const errorScreenMessage = document.getElementById('error-message');
const errorScreenStack = document.getElementById('error-stack');

const handleError = (error) => {
    console.error(error);
    if (!errorScreen.hidden) return;
    errorScreen.hidden = false;
    errorScreenMessage.textContent = '' + error;
    let debug = error && error.stack || 'no stack';
    debug += '\nUser agent: ' + navigator.userAgent;
    errorScreenStack.textContent = debug;
};
const setProgress = (progress) => {
    if (loadingInner) loadingInner.style.width = progress * 100 + '%';
};

try {
    const scaffolding = new Scaffolding.Scaffolding();
    scaffolding.width = 480;
    scaffolding.height = 360;
    scaffolding.resizeToFill = false;
    scaffolding.setup();
    scaffolding.appendTo(appElement);

    // Expose values expected by third-party plugins
    window.scaffolding = scaffolding;
    window.vm = scaffolding.vm;

    const { storage, vm } = scaffolding;
    storage.addWebStore(
        [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound],
        (asset) => new URL('./assets/' + asset.assetId + '.' + asset.dataFormat, location).href
    );
    storage.onprogress = (total, loaded) => {
        setProgress(0.2 + (loaded / total) * 0.8);
    };
    setProgress(0.1);

    scaffolding.setUsername("player####".replace(/#/g, () => Math.floor(Math.random() * 10)));
    scaffolding.setAccentColor("#ff4c4c");

    scaffolding.addCloudProvider(new Scaffolding.Cloud.WebSocketProvider("wss://clouddata.turbowarp.org", "p4-@fight for freedom1.43.sb3"));

    if (false) {
        const greenFlagButton = document.createElement('img');
        greenFlagButton.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.63 17.5"><path d="M.75 2a6.44 6.44 0 017.69 0h0a6.44 6.44 0 007.69 0v10.4a6.44 6.44 0 01-7.69 0h0a6.44 6.44 0 00-7.69 0" fill="#4cbf56" stroke="#45993d" stroke-linecap="round" stroke-linejoin="round"/><path stroke-width="1.5" fill="#4cbf56" stroke="#45993d" stroke-linecap="round" stroke-linejoin="round" d="M.75 16.75v-16"/></svg>');
        greenFlagButton.className = 'control-button';
        greenFlagButton.addEventListener('click', () => {
            scaffolding.greenFlag();
        });
        scaffolding.addEventListener('PROJECT_RUN_START', () => {
            greenFlagButton.classList.add('active');
        });
        scaffolding.addEventListener('PROJECT_RUN_STOP', () => {
            greenFlagButton.classList.remove('active');
        });
        scaffolding.addControlButton({
            element: greenFlagButton,
            where: 'top-left'
        });
    }

    if (false) {
        const stopAllButton = document.createElement('img');
        stopAllButton.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><path fill="#ec5959" stroke="#b84848" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M4.3.5h5.4l3.8 3.8v5.4l-3.8 3.8H4.3L.5 9.7V4.3z"/></svg>');
        stopAllButton.className = 'control-button';
        stopAllButton.addEventListener('click', () => {
            scaffolding.stopAll();
        });
        scaffolding.addControlButton({
            element: stopAllButton,
            where: 'top-left'
        });
    }

    if (true && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
        let isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const fullscreenButton = document.createElement('img');
        fullscreenButton.className = 'control-button fullscreen-button';
        fullscreenButton.addEventListener('click', () => {
            if (isFullScreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } else {
                if (document.body.requestFullscreen) {
                    document.body.requestFullscreen();
                } else if (document.body.webkitRequestFullscreen) {
                    document.body.webkitRequestFullscreen();
                }
            }
        });
        const otherControlsExist = false;
        const fillColor = otherControlsExist ? '#575E75' : '#ffffff';
        const updateFullScreen = () => {
            isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
            document.body.classList.toggle('is-fullscreen', isFullScreen);
            if (isFullScreen) {
                fullscreenButton.src = 'data:image/svg+xml,' + encodeURIComponent('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="' + fillColor + '" fill-rule="evenodd"><path d="M12.662 3.65l.89.891 3.133-2.374a.815.815 0 011.15.165.819.819 0 010 .986L15.467 6.46l.867.871c.25.25.072.664-.269.664L12.388 8A.397.397 0 0112 7.611V3.92c0-.341.418-.514.662-.27M7.338 16.35l-.89-.89-3.133 2.374a.817.817 0 01-1.15-.166.819.819 0 010-.985l2.37-3.143-.87-.871a.387.387 0 01.27-.664L7.612 12a.397.397 0 01.388.389v3.692a.387.387 0 01-.662.27M7.338 3.65l-.89.891-3.133-2.374a.815.815 0 00-1.15.165.819.819 0 000 .986l2.37 3.142-.87.871a.387.387 0 00.27.664L7.612 8A.397.397 0 008 7.611V3.92a.387.387 0 00-.662-.27M12.662 16.35l.89-.89 3.133 2.374a.817.817 0 001.15-.166.819.819 0 000-.985l-2.368-3.143.867-.871a.387.387 0 00-.269-.664L12.388 12a.397.397 0 00-.388.389v3.692c0 .342.418.514.662.27"/></g></svg>');
            } else {
                fullscreenButton.src = 'data:image/svg+xml,' + encodeURIComponent('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g fill="' + fillColor + '" fill-rule="evenodd"><path d="M16.338 7.35l-.89-.891-3.133 2.374a.815.815 0 01-1.15-.165.819.819 0 010-.986l2.368-3.142-.867-.871a.387.387 0 01.269-.664L16.612 3a.397.397 0 01.388.389V7.08a.387.387 0 01-.662.27M3.662 12.65l.89.89 3.133-2.374a.817.817 0 011.15.166.819.819 0 010 .985l-2.37 3.143.87.871c.248.25.071.664-.27.664L3.388 17A.397.397 0 013 16.611V12.92c0-.342.418-.514.662-.27M3.662 7.35l.89-.891 3.133 2.374a.815.815 0 001.15-.165.819.819 0 000-.986L6.465 4.54l.87-.871a.387.387 0 00-.27-.664L3.388 3A.397.397 0 003 3.389V7.08c0 .341.418.514.662.27M16.338 12.65l-.89.89-3.133-2.374a.817.817 0 00-1.15.166.819.819 0 000 .985l2.368 3.143-.867.871a.387.387 0 00.269.664l3.677.005a.397.397 0 00.388-.389V12.92a.387.387 0 00-.662-.27"/></g></svg>');
            }
        };
        updateFullScreen();
        document.addEventListener('fullscreenchange', updateFullScreen);
        document.addEventListener('webkitfullscreenchange', updateFullScreen);
        if (otherControlsExist) {
            fullscreenButton.className = 'control-button fullscreen-button';
            scaffolding.addControlButton({
                element: fullscreenButton,
                where: 'top-right'
            });
        } else {
            fullscreenButton.className = 'standalone-fullscreen-button';
            document.body.appendChild(fullscreenButton);
        }
    }

    vm.setTurboMode(false);
    if (vm.setInterpolation) vm.setInterpolation(true);
    if (vm.setFramerate) vm.setFramerate(30);
    if (vm.renderer.setUseHighQualityRender) vm.renderer.setUseHighQualityRender(false);
    if (vm.setRuntimeOptions) vm.setRuntimeOptions({
        fencing: true,
        miscLimits: true,
        maxClones: 9999999999,
    });
    if (vm.setCompilerOptions) vm.setCompilerOptions({
        enabled: true,
        warpTimer: false
    });

    if (typeof ScaffoldingAddons !== 'undefined') {
        ScaffoldingAddons.run(scaffolding, { "gamepad": false, "pointerlock": false, "specialCloudBehaviors": false });
    }

    for (const extension of []) {
        vm.extensionManager.loadExtensionURL(extension);
    }
} catch (e) {
    handleError(e);
}

// NW.js hook
if (typeof nw !== 'undefined') {
    const win = nw.Window.get();
    win.on('new-win-policy', (frame, url, policy) => {
        policy.ignore();
        nw.Shell.openExternal(url);
    });
    win.on('navigation', (frame, url, policy) => {
        policy.ignore();
        nw.Shell.openExternal(url);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
    });
}

// Electron hook
if (false) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullscreen();
            }
        }
    });
}

