export function createInitialCharacters(
  participantInfo: { userName: string; character: string }[],
) {
  return participantInfo.map(participant => ({
    name: participant.userName,
    position: 0,
    x: 0,
    y: 0,
    nameX: 0,
    nameY: 0,
    imageSrc: participant.character,
    animationOffset: 0,
    isMoving: false,
    fromPosition: 0,
    toPosition: 0,
    moveProgress: 0,
    moveStartTime: performance.now(),
  }));
}
