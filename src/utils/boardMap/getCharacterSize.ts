interface CharacterSizeConfig {
  padding: number;
  maxCharacterSize: number;
  widthRatio: number;
  heightRatio: number;
  yOffset: number;
}

export const getCharacterSize = (
  paddedWidth: number,
  config: CharacterSizeConfig,
) => {
  const leftSectionWidth = paddedWidth * 0.75;
  const baseSize = Math.min(config.maxCharacterSize, leftSectionWidth * 0.08);
  const charWidth = baseSize * config.widthRatio;
  const charHeight = charWidth * config.heightRatio;

  return {
    baseSize,
    charWidth,
    charHeight,
    leftSectionWidth,
  };
};
