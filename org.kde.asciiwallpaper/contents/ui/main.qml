import QtQuick
import org.kde.plasma.plasmoid

WallpaperItem {
    id: root

    property real cellPx: 16
    property color fg: "#33ff66"
    property color bg: "#000000"

    property real elapsed: 0
    property int frameSkip: 2   // only update every Nth frame; 2 = 30fps on 60hz
    property int frameCount: 0

    Image {
        id: fontAtlas
        source: "../images/font.png"
        visible: false
        smooth: false
        mipmap: false
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

	FrameAnimation {
		running: true
		onTriggered: root.elapsed += frameTime
	}
}

