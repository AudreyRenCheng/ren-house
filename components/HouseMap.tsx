import type { CSSProperties } from "react";

import { useSound } from "@/components/SoundProvider";
import { rooms } from "@/data/rooms";
import type { Mode, RoomId, Screen, SiteLanguage } from "@/types";

const MAP_WIDTH = 820;
const MAP_HEIGHT = 670;
const MAP_DOOR_WIDTH = 58;

type MapRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MapDoorId = RoomId | "foyer";

type MapDoorConfig = {
  room: MapRect;
  wall: "top" | "right" | "bottom" | "left";
  offset: number;
  width: number;
  hinge: "start" | "end";
  swing: "inward" | "outward";
};

type MapPoint = { x: number; y: number };

type WallSegment = {
  start: MapPoint;
  end: MapPoint;
  door?: MapDoorId;
};

const mapRooms: Record<RoomId | "foyer" | "connector", MapRect> = {
  room1: { x: 62, y: 221, width: 311, height: 228 },
  room2: { x: 246, y: 50, width: 369, height: 171 },
  room3: { x: 537, y: 341, width: 254, height: 228 },
  foyer: { x: 373, y: 221, width: 164, height: 398 },
  connector: { x: 537, y: 221, width: 131, height: 120 },
};

const mapDoors: Record<MapDoorId, MapDoorConfig> = {
  room1: {
    room: mapRooms.room1,
    wall: "right",
    offset: 32,
    width: MAP_DOOR_WIDTH,
    hinge: "end",
    swing: "inward",
  },
  room2: {
    room: mapRooms.room2,
    wall: "bottom",
    offset: 276,
    width: MAP_DOOR_WIDTH,
    hinge: "start",
    swing: "inward",
  },
  room3: {
    room: mapRooms.room3,
    wall: "left",
    offset: 24,
    width: MAP_DOOR_WIDTH,
    hinge: "start",
    swing: "inward",
  },
  foyer: {
    room: mapRooms.foyer,
    wall: "bottom",
    offset: 53,
    width: MAP_DOOR_WIDTH,
    hinge: "start",
    swing: "inward",
  },
};

const mapWalls: WallSegment[] = [
  { start: { x: 62, y: 221 }, end: { x: 246, y: 221 } },
  { start: { x: 62, y: 221 }, end: { x: 62, y: 449 } },
  { start: { x: 62, y: 449 }, end: { x: 373, y: 449 } },
  { start: { x: 373, y: 221 }, end: { x: 373, y: 449 }, door: "room1" },
  { start: { x: 246, y: 50 }, end: { x: 615, y: 50 } },
  { start: { x: 246, y: 50 }, end: { x: 246, y: 221 } },
  { start: { x: 615, y: 50 }, end: { x: 615, y: 221 } },
  { start: { x: 246, y: 221 }, end: { x: 615, y: 221 }, door: "room2" },
  { start: { x: 373, y: 449 }, end: { x: 373, y: 619 } },
  { start: { x: 537, y: 341 }, end: { x: 537, y: 569 }, door: "room3" },
  { start: { x: 537, y: 569 }, end: { x: 537, y: 619 } },
  { start: { x: 373, y: 619 }, end: { x: 537, y: 619 }, door: "foyer" },
  { start: { x: 615, y: 221 }, end: { x: 668, y: 221 } },
  { start: { x: 668, y: 221 }, end: { x: 668, y: 341 } },
  { start: { x: 537, y: 341 }, end: { x: 791, y: 341 } },
  { start: { x: 791, y: 341 }, end: { x: 791, y: 569 } },
  { start: { x: 537, y: 569 }, end: { x: 791, y: 569 } },
];

function rectToStyle(rect: MapRect): CSSProperties {
  return {
    left: `${(rect.x / MAP_WIDTH) * 100}%`,
    top: `${(rect.y / MAP_HEIGHT) * 100}%`,
    width: `${(rect.width / MAP_WIDTH) * 100}%`,
    height: `${(rect.height / MAP_HEIGHT) * 100}%`,
  };
}

const roomLayout: Record<RoomId, CSSProperties> = {
  room1: rectToStyle(mapRooms.room1),
  room2: rectToStyle(mapRooms.room2),
  room3: rectToStyle(mapRooms.room3),
};

function getDoorGeometry(config: MapDoorConfig) {
  const { room, wall, offset, width, hinge, swing } = config;
  let gapStart: MapPoint;
  let gapEnd: MapPoint;
  let inward: MapPoint;

  if (wall === "top" || wall === "bottom") {
    const y = wall === "top" ? room.y : room.y + room.height;
    gapStart = { x: room.x + offset, y };
    gapEnd = { x: room.x + offset + width, y };
    inward = { x: 0, y: wall === "top" ? 1 : -1 };
  } else {
    const x = wall === "left" ? room.x : room.x + room.width;
    gapStart = { x, y: room.y + offset };
    gapEnd = { x, y: room.y + offset + width };
    inward = { x: wall === "left" ? 1 : -1, y: 0 };
  }

  const hingePoint = hinge === "start" ? gapStart : gapEnd;
  const closedEnd = hinge === "start" ? gapEnd : gapStart;
  const direction = swing === "inward" ? inward : { x: -inward.x, y: -inward.y };
  const openEnd = {
    x: hingePoint.x + direction.x * width,
    y: hingePoint.y + direction.y * width,
  };
  const closedVector = {
    x: closedEnd.x - hingePoint.x,
    y: closedEnd.y - hingePoint.y,
  };
  const openVector = {
    x: openEnd.x - hingePoint.x,
    y: openEnd.y - hingePoint.y,
  };
  const cross = closedVector.x * openVector.y - closedVector.y * openVector.x;

  return {
    gapStart,
    gapEnd,
    hingePoint,
    closedEnd,
    openEnd,
    sweep: cross > 0 ? 1 : 0,
  };
}

function MapDoor({ config, fill }: { config: MapDoorConfig; fill: string }) {
  const geometry = getDoorGeometry(config);
  const { hingePoint, closedEnd, openEnd, sweep } = geometry;
  const swingPath = `M ${hingePoint.x} ${hingePoint.y} L ${closedEnd.x} ${closedEnd.y} A ${config.width} ${config.width} 0 0 ${sweep} ${openEnd.x} ${openEnd.y} Z`;

  return (
    <g aria-hidden="true" pointerEvents="none">
      <path d={swingPath} fill={fill} stroke="none" />
      <path
        d={`M ${closedEnd.x} ${closedEnd.y} A ${config.width} ${config.width} 0 0 ${sweep} ${openEnd.x} ${openEnd.y}`}
        fill="none"
        stroke="var(--map-wall-color)"
        strokeWidth="var(--map-wall-width)"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={hingePoint.x}
        y1={hingePoint.y}
        x2={openEnd.x}
        y2={openEnd.y}
        stroke="var(--map-wall-color)"
        strokeWidth="var(--map-wall-width)"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={hingePoint.x} cy={hingePoint.y} r="2.5" fill="var(--map-wall-color)" />
    </g>
  );
}

function MapWallLine({ start, end }: { start: MapPoint; end: MapPoint }) {
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="var(--map-wall-color)"
      strokeLinecap="square"
      strokeWidth="var(--map-wall-width)"
      vectorEffect="non-scaling-stroke"
    />
  );
}

type HouseMapProps = {
  blurred?: boolean;
  mode: Mode;
  screen: Screen;
  currentRoom: RoomId | null;
  visitedRooms: RoomId[];
  unlockedRooms: RoomId[];
  handleRoomClick: (roomId: RoomId) => void;
  language: SiteLanguage;
};

type RoomStyle = CSSProperties & {
  "--room-fill": string;
  "--room-color": string;
};

export default function HouseMap({
  blurred = false,
  mode,
  screen,
  currentRoom,
  visitedRooms,
  unlockedRooms,
  handleRoomClick,
  language,
}: HouseMapProps) {
  const { playUISound } = useSound();

  function selectRoom(roomId: RoomId) {
    playUISound("select");
    handleRoomClick(roomId);
  }

  function isRoomRevealed(roomId: RoomId) {
    return mode === "explore"
      ? unlockedRooms.includes(roomId)
      : visitedRooms.includes(roomId);
  }

  function getRoomBackground(roomId: RoomId) {
    if (screen === "room") {
      return currentRoom === roomId && isRoomRevealed(roomId)
        ? rooms[roomId].color
        : "#eadfce";
    }

    if (isRoomRevealed(roomId)) return rooms[roomId].color;
    return mode === "explore" ? "#eee5d7" : "#f6ecdb";
  }

  function getRoomStateLabel(roomId: RoomId) {
    if (rooms[roomId].status === "under-construction") {
      return language === "en" ? "Under construction" : "施工中";
    }

    if (mode === "explore" && !unlockedRooms.includes(roomId)) {
      return language === "en" ? "Locked" : "未解锁";
    }

    return null;
  }

  function getProgressLabel(roomId: RoomId) {
    if (mode === "explore" && unlockedRooms.includes(roomId)) {
      return language === "en" ? "Unlocked" : "已解锁";
    }

    if (visitedRooms.includes(roomId)) {
      return language === "en" ? "Visited" : "已到访";
    }

    return null;
  }

  function getRoomStyle(roomId: RoomId): RoomStyle {
    return {
      ...roomLayout[roomId],
      "--room-fill": getRoomBackground(roomId),
      "--room-color": rooms[roomId].color,
    };
  }

  function getAriaLabel(roomId: RoomId) {
    const labels = [
      rooms[roomId].title[language],
      getRoomStateLabel(roomId),
      getProgressLabel(roomId),
    ].filter(Boolean);

    return labels.join(". ");
  }

  function isDoorVisible(doorId: MapDoorId) {
    return doorId === "foyer" || isRoomRevealed(doorId);
  }

  return (
    <div
      className="house-map"
      style={{
        filter: blurred ? "blur(5px)" : "none",
        opacity: blurred ? 0.55 : 1,
      }}
    >
      <div className="pencil-route" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <button
        className="map-room room-one theme-music"
        type="button"
        onClick={() => selectRoom("room1")}
        style={getRoomStyle("room1")}
        data-revealed={isRoomRevealed("room1")}
        aria-label={getAriaLabel("room1")}
      >
        <span className="room-motif music-motif" aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="room-title">{rooms.room1.title[language]}</span>
        {getRoomStateLabel("room1") && (
          <small className="state-note">{getRoomStateLabel("room1")}</small>
        )}
        {getProgressLabel("room1") && (
          <small className="progress-mark">{getProgressLabel("room1")}</small>
        )}
      </button>

      <button
        className="map-room room-two theme-story"
        type="button"
        onClick={() => selectRoom("room2")}
        style={getRoomStyle("room2")}
        data-revealed={isRoomRevealed("room2")}
        aria-label={getAriaLabel("room2")}
      >
        <span className="room-motif story-motif" aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="room-title">{rooms.room2.title[language]}</span>
        {getRoomStateLabel("room2") && (
          <small className="state-note">{getRoomStateLabel("room2")}</small>
        )}
        {getProgressLabel("room2") && (
          <small className="progress-mark">{getProgressLabel("room2")}</small>
        )}
      </button>

      <div className="foyer" style={rectToStyle(mapRooms.foyer)}>
        <span>{language === "en" ? "Entryway" : "玄关"}</span>
        <i aria-hidden="true" />
      </div>

      <button
        className="map-room room-three theme-cs"
        type="button"
        onClick={() => selectRoom("room3")}
        style={getRoomStyle("room3")}
        data-revealed={isRoomRevealed("room3")}
        aria-label={getAriaLabel("room3")}
      >
        <span className="room-motif cs-motif" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="room-title">{rooms.room3.title[language]}</span>
        {getRoomStateLabel("room3") && (
          <small className="state-note">{getRoomStateLabel("room3")}</small>
        )}
        {getProgressLabel("room3") && (
          <small className="progress-mark">{getProgressLabel("room3")}</small>
        )}
      </button>

      <div
        className="room-three-connector"
        style={rectToStyle(mapRooms.connector)}
        aria-hidden="true"
      />

      <svg
        className="wall-layer"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {mapWalls.map((wall, index) => {
          if (!wall.door || !isDoorVisible(wall.door)) {
            return <MapWallLine key={index} start={wall.start} end={wall.end} />;
          }

          const config = mapDoors[wall.door];
          const { gapStart, gapEnd } = getDoorGeometry(config);

          return (
            <g key={index}>
              <MapWallLine start={wall.start} end={gapStart} />
              <MapWallLine start={gapEnd} end={wall.end} />
              <MapDoor
                config={config}
                fill={
                  wall.door === "foyer"
                    ? "var(--map-paper-color)"
                    : "var(--foyer-fill)"
                }
              />
            </g>
          );
        })}
      </svg>

      <div className="entrance-label" aria-hidden="true">
        {language === "en" ? "start here" : "从这里开始"}
      </div>

      <style jsx>{`
        .house-map {
          --map-wall-color: #6f4930;
          --map-wall-width: 2px;
          --map-door-width: ${MAP_DOOR_WIDTH};
          --map-paper-color: #fff8ea;
          --foyer-fill: #9fc8ad;
          position: relative;
          width: min(100%, 790px, calc((100vh - 250px) * 820 / 670));
          aspect-ratio: 820 / 670;
          color: var(--map-pencil, #6f4930);
          transition:
            filter var(--duration-fast) var(--ease-object),
            opacity var(--duration-fast) var(--ease-object);
          background:
            linear-gradient(104deg, transparent 0 38%, rgba(118, 78, 48, 0.045) 38.2%, transparent 38.7%),
            linear-gradient(7deg, transparent 0 67%, rgba(118, 78, 48, 0.035) 67.2%, transparent 67.8%);
        }

        .house-map::before {
          position: absolute;
          inset: 2.5% 2%;
          border: 1px dashed rgba(112, 73, 45, 0.1);
          content: "";
          pointer-events: none;
          transform: rotate(-0.25deg);
        }

        .house-map::after {
          position: absolute;
          right: 4%;
          top: 6%;
          width: 11%;
          height: 8%;
          border-top: 2px solid rgba(123, 78, 47, 0.13);
          border-right: 2px solid rgba(123, 78, 47, 0.1);
          content: "";
          pointer-events: none;
          transform: rotate(3deg);
        }

        .map-room,
        .foyer,
        .room-three-connector {
          position: absolute;
          box-sizing: border-box;
          border-radius: 0;
        }

        .map-room {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 14px;
          overflow: hidden;
          background:
            linear-gradient(112deg, rgba(255, 255, 255, 0.28), transparent 40%),
            var(--room-fill);
          color: #3f2a1d;
          cursor: pointer;
          font: inherit;
          line-height: 1.18;
          text-align: center;
          box-shadow: none;
          transition:
            background var(--duration-fast) var(--ease-object),
            filter var(--duration-fast) var(--ease-object);
        }

        .room-three {
          z-index: var(--z-object);
        }

        .map-room:hover,
        .map-room:focus-visible {
          filter: saturate(1.05) contrast(1.025);
        }

        .map-room:active {
          filter: brightness(0.97) saturate(1.03);
        }

        .room-title {
          position: relative;
          z-index: calc(var(--z-object) + 4);
          max-width: 88%;
          font-family: var(--font-display);
          font-size: clamp(16px, 2.4vw, 27px);
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .state-note {
          position: relative;
          z-index: calc(var(--z-object) + 5);
          max-width: 88%;
          padding: 5px 7px 4px;
          border: 0;
          background: rgba(255, 249, 236, 0.78);
          color: #65432d;
          font-family: var(--font-label);
          font-size: clamp(8px, 1vw, 10px);
          font-weight: 700;
          line-height: 1.15;
          transform: rotate(-1.5deg);
          box-shadow: 2px 3px 0 rgba(100, 65, 42, 0.08);
        }

        .state-note::before {
          position: absolute;
          left: 50%;
          top: -4px;
          width: 22px;
          height: 7px;
          background: rgba(219, 201, 159, 0.65);
          content: "";
          transform: translateX(-50%) rotate(2deg);
        }

        .progress-mark {
          position: absolute;
          left: 8%;
          bottom: 9%;
          z-index: calc(var(--z-object) + 5);
          color: color-mix(in srgb, var(--room-color) 58%, #5f3b25);
          font-family: var(--font-label);
          font-size: clamp(8px, 1vw, 10px);
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transform: rotate(-7deg);
          opacity: 0.8;
        }

        .room-motif {
          position: absolute;
          z-index: calc(var(--z-object) + 2);
          display: block;
          pointer-events: none;
          opacity: 0.28;
          transition: opacity var(--duration-fast) var(--ease-object);
        }

        .map-room[data-revealed="true"] .room-motif,
        .map-room:hover .room-motif,
        .map-room:focus-visible .room-motif {
          opacity: 0.65;
        }

        .music-motif {
          left: 4%;
          bottom: 3%;
          width: 48%;
          height: 82%;
          border-left: 3px solid #5f7a49;
          border-radius: 48% 0 0;
          transform: rotate(-7deg);
        }

        .music-motif::before,
        .music-motif::after {
          position: absolute;
          width: 18px;
          height: 30px;
          border-radius: 90% 0 90% 0;
          background: #6f8c58;
          content: "";
        }

        .music-motif::before { left: 4px; top: 31%; transform: rotate(-32deg); }
        .music-motif::after { left: 16px; top: 60%; transform: rotate(38deg) scale(0.76); }

        .music-motif i:first-child {
          position: absolute;
          left: 12%;
          right: -36%;
          top: 42%;
          height: 1px;
          background: #67804f;
          box-shadow: 0 9px 0 #67804f, 0 18px 0 #67804f;
        }

        .music-motif i:last-child {
          position: absolute;
          right: -27%;
          top: 27%;
          width: 24px;
          height: 24px;
          border: 3px solid #67804f;
          border-radius: 50%;
        }

        .story-motif {
          right: 15%;
          top: 8%;
          width: 38%;
          height: 50%;
          border: 1px solid #a46d7f;
          background: rgba(255, 248, 239, 0.52);
          transform: rotate(4deg);
        }

        .story-motif::before {
          position: absolute;
          left: -42%;
          bottom: -12%;
          width: 120%;
          height: 68%;
          border-bottom: 2px dashed #916174;
          border-radius: 0 0 60% 45%;
          content: "";
          transform: rotate(-18deg);
        }

        .story-motif::after {
          position: absolute;
          right: -4px;
          top: -5px;
          width: 30px;
          height: 10px;
          background: rgba(226, 193, 106, 0.68);
          content: "";
          transform: rotate(-4deg);
        }

        .story-motif i:first-child {
          position: absolute;
          left: 20%;
          top: 35%;
          width: 38%;
          height: 1px;
          background: #997080;
          box-shadow: 0 10px 0 rgba(153, 112, 128, 0.6), 0 20px 0 rgba(153, 112, 128, 0.4);
        }

        .story-motif i:last-child {
          position: absolute;
          right: 12%;
          bottom: 14%;
          width: 20px;
          height: 20px;
          border: 2px solid #a47383;
          border-radius: 50% 44% 55% 42%;
        }

        .cs-motif {
          right: 0;
          top: 4%;
          width: 48%;
          height: 88%;
          background:
            linear-gradient(90deg, rgba(79, 145, 158, 0.3) 1px, transparent 1px),
            linear-gradient(180deg, rgba(79, 145, 158, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 75% 22%, #d9fbf7 0 3px, transparent 4px),
            radial-gradient(circle at 88% 58%, #d9fbf7 0 2px, transparent 3px);
          background-size: 18px 18px, 18px 18px, auto, auto;
          mask-image: linear-gradient(90deg, transparent, black 35%, black);
        }

        .cs-motif i {
          position: absolute;
          border: 1px solid #5b9aa6;
          background: rgba(218, 247, 244, 0.28);
        }

        .cs-motif i:nth-child(1) { left: 8%; top: 28%; width: 36%; height: 25%; }
        .cs-motif i:nth-child(2) { right: 5%; top: 18%; width: 28%; height: 19%; }
        .cs-motif i:nth-child(3) { right: 14%; bottom: 12%; width: 42%; height: 24%; }

        .foyer {
          z-index: var(--z-object);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--foyer-fill);
          color: #6d4a30;
          font-family: var(--font-display);
          font-size: clamp(14px, 2.2vw, 24px);
          font-weight: 800;
        }

        .foyer span { transform: rotate(90deg); }

        .foyer i {
          position: absolute;
          right: 14%;
          bottom: 13%;
          width: 32%;
          height: 1px;
          background: rgba(111, 73, 48, 0.22);
          box-shadow: 0 -10px 0 rgba(111, 73, 48, 0.13), 0 -20px 0 rgba(111, 73, 48, 0.08);
        }

        .room-three-connector {
          z-index: var(--z-object);
          background: var(--foyer-fill);
        }

        .wall-layer {
          position: absolute;
          inset: 0;
          z-index: calc(var(--z-object) + 4);
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }

        .entrance-label {
          position: absolute;
          left: 47.5%;
          top: 88%;
          color: rgba(101, 66, 43, 0.72);
          font-family: var(--font-label);
          font-size: clamp(8px, 1vw, 10px);
          font-weight: 800;
          text-transform: uppercase;
          transform: rotate(-90deg);
        }

        .pencil-route {
          position: absolute;
          inset: 0;
          z-index: calc(var(--z-object) + 7);
          pointer-events: none;
        }

        .pencil-route span {
          position: absolute;
          display: block;
          width: 6px;
          height: 6px;
          border: 1px solid rgba(111, 73, 48, 0.4);
          border-radius: 50%;
          background: #fff8ea;
        }

        .pencil-route span:nth-child(1) { left: 28%; top: 68%; }
        .pencil-route span:nth-child(2) { left: 52%; top: 20%; }
        .pencil-route span:nth-child(3) { left: 85%; top: 86%; }

        @media (max-width: 760px) {
          .house-map {
            width: 100%;
          }

          .map-room {
            gap: 5px;
            padding: 8px;
          }

          .room-title {
            font-size: clamp(12px, 3.6vw, 16px);
          }

          .state-note {
            padding: 4px 5px 3px;
            font-size: clamp(7px, 2.2vw, 9px);
          }

          .progress-mark {
            font-size: 7px;
          }

          .foyer { font-size: clamp(11px, 3.2vw, 14px); }

          .music-motif {
            width: 43%;
          }

          .story-motif {
            width: 39%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .house-map,
          .map-room,
          .room-motif {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
