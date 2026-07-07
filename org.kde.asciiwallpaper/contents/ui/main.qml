import QtQuick
import org.kde.plasma.plasmoid

WallpaperItem {
    id: root

    // --- tunables ---
    property real cellPx: 16          // ascii cell size in px (bigger = cheaper + chunkier)
    property color fg: "#33ff66"      // matrix-green look, change to taste
    property color bg: "#000000"
    property int targetFps: 30        // ascii doesn't need 60fps, saves power

    property real elapsed: 0

    Image {
        id: fontAtlas
        source: "../images/font.png"
        visible: false
        smooth: false
        mipmap: false
        // Invisible items often don't get a real texture provider in Qt Quick's
        // scene graph. layer.enabled forces this to render to an offscreen FBO
        // regardless of visibility, guaranteeing fontTex is a valid texture.
        layer.enabled: true
        layer.smooth: false
    }

    ShaderEffect {
        anchors.fill: parent

        property variant fontTex: fontAtlas
        property real iTime: root.elapsed
        property size iResolution: Qt.size(width, height)
        property size cellSize: Qt.size(root.cellPx, root.cellPx)
        property vector3d fgColor: Qt.vector3d(root.fg.r, root.fg.g, root.fg.b)
        property vector3d bgColor: Qt.vector3d(root.bg.r, root.bg.g, root.bg.b)

        fragmentShader: "../shaders/ascii.frag.qsb"
    }

    Timer {
        interval: 1000 / root.targetFps
        running: true
        repeat: true
        onTriggered: root.elapsed += interval / 1000.0
    }
}
