export interface DifficultyEntry {
  level: string;
  desc: string;
}

export interface Dictionary {
  title: string;
  subtitle: string;
  timeLabel: string;
  movesLabel: string;
  autoCrossLabel: string;
  resetButton: string;
  hintButton: string;
  victoryTitle: string;
  nextLevelButton: string;
  discardTitle: string;
  discardDescription: string;
  discardConfirm: string;
  discardCancel: string;
  configTitle: string;
  helpTitle: string;
  helpIntro: string;
  themeLabel: string;
  boardSizeLabel: string;
  difficultyLabel: string;
  rulesHeading: string;
  rules: { title: string; desc: string }[];
  controlsHeading: string;
  controlsGuide: { icon: string; text: string }[];
  strategiesHeading: string;
  strategies: { title: string; desc: string }[];
  difficultyGuideHeading: string;
  difficultyGuide: DifficultyEntry[];
}

export const en: Dictionary = {
  title: 'Lucky Queens',
  subtitle: 'Place 8 queens without conflicts across rows, columns, colours, or diagonals.',
  timeLabel: 'Time',
  movesLabel: 'Moves',
  autoCrossLabel: 'Auto-fill crosses',
  resetButton: 'Reset',
  hintButton: 'Hint',
  victoryTitle: 'Puzzle Solved!',
  nextLevelButton: 'New Puzzle →',
  discardTitle: 'Discard current game?',
  discardDescription: 'You have an active game in progress. Changing this setting will start a new puzzle and your current progress will be lost.',
  discardConfirm: 'Discard & Start New Game',
  discardCancel: 'Keep Playing',
  configTitle: 'Configurations',
  helpTitle: 'How to Play',
  helpIntro: 'Place exactly one queen in every row, column, and colour region — with no two queens touching, not even at the corners.',
  themeLabel: 'Interface Theme',
  boardSizeLabel: 'Board Size',
  difficultyLabel: 'Difficulty',

  rulesHeading: 'The Rules',
  rules: [
    {
      title: 'One queen per row',
      desc: 'Each horizontal row must contain exactly one queen — no more, no fewer.'
    },
    {
      title: 'One queen per column',
      desc: 'Each vertical column must contain exactly one queen — no more, no fewer.'
    },
    {
      title: 'One queen per colour region',
      desc: 'Every distinct coloured shape on the board must contain exactly one queen, regardless of its size or position.'
    },
    {
      title: 'No touching — not even diagonally',
      desc: 'Queens cannot occupy adjacent cells in any direction: horizontally, vertically, or diagonally. Every queen must have at least one empty cell separating it from all others.'
    },
  ],

  controlsHeading: 'Controls',
  controlsGuide: [
    { icon: '✕', text: 'Tap once on an empty cell to mark it with ✕ — use this to rule out positions where a queen cannot go.' },
    { icon: '♛', text: 'Tap a second time on a ✕ cell to place a queen. Tap a third time to clear it back to empty.' },
    { icon: '✦', text: 'Click and drag across empty cells to quickly mark a run of ✕ eliminations in one gesture.' },
    { icon: '💡', text: 'The hint button reveals the next correct queen position. Each puzzle has a limited number of hints depending on difficulty.' },
    { icon: '↺',  text: 'Reset clears all marks and queens from the board, returning it to its original state without generating a new puzzle.' },
  ],

  strategiesHeading: 'Solving Strategies',
  strategies: [
    {
      title: 'Start with the smallest regions',
      desc: 'Tiny colour regions — especially single-cell or two-cell ones — have very few valid queen positions. Lock those in first to constrain the rest of the board.'
    },
    {
      title: 'Eliminate by row and column',
      desc: 'Once a queen is placed, its entire row and column are taken. Mark every other cell in that row and column with ✕ to keep the board clean and readable.'
    },
    {
      title: 'Watch the diagonal neighbours',
      desc: 'Queens cannot touch diagonally. After placing a queen, the four diagonal neighbours are also invalid — mark them out immediately.'
    },
    {
      title: 'Use process of elimination',
      desc: 'If a region has only one cell left that is not yet crossed out, that cell must be the queen for that region. Look for these forced placements.'
    },
    {
      title: 'Cross-reference regions and lines',
      desc: 'If all valid cells for a region fall within the same row or column, that row or column is claimed by that region — you can eliminate it from all other regions.'
    },
    {
      title: 'Use auto-fill to your advantage',
      desc: 'Enable auto-fill crosses in settings. Every time you place a queen, invalid cells are crossed out automatically — this often reveals forced moves elsewhere on the board.'
    },
  ],

  difficultyGuideHeading: 'Difficulty Guide',
  difficultyGuide: [
    {
      level: 'Easy',
      desc: 'Regions are compact, blob-shaped, and easy to read at a glance. Ideal for learning the rules. You get 8 hints.'
    },
    {
      level: 'Medium',
      desc: 'Regions take organic, irregular shapes that require more careful cross-referencing. A solid challenge for practised players. You get 4 hints.'
    },
    {
      level: 'Hard',
      desc: 'Regions are wide, thin, and snaking — they stretch across the board in unexpected directions. Logical deduction is essential. You get 2 hints.'
    },
  ],
};